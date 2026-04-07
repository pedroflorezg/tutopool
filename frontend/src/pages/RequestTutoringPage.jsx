import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { supabase, isDemoMode, DEMO_MATERIAS, DEMO_TUTORES, calcPrecioGrupal } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { triggerTutorConfirmation } from '../lib/n8n'

const ALL_TIME_OPTIONS = []
for (let h = 6; h <= 21; h++) {
  for (const m of [0, 15, 30, 45]) {
    ALL_TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }
}

export default function RequestTutoringPage() {
  const { materiaId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [materia, setMateria] = useState(isDemoMode ? DEMO_MATERIAS.find(m => m.id === materiaId) : null)
  const [tutores, setTutores] = useState(isDemoMode ? DEMO_TUTORES : [])

  const [form, setForm] = useState({
    tipo: 'grupal', formato: 'presencial',
    duracion: 60, tutorId: 'aleatorio',
    fecha: '', hora: '', notas: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isDemoMode) return
    supabase.from('materias').select('*, materia_programas(semestre, programas(nombre))')
      .eq('id', materiaId).single()
      .then(({ data }) => { if (data) setMateria(data) })
    supabase.from('tutores')
      .select('*, tutor_materias!inner(materia_id)')
      .eq('tutor_materias.materia_id', materiaId).eq('activo', true)
      .then(({ data }) => { if (data) setTutores(data) })
  }, [materiaId])

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  // Tutor seleccionado (o null si es aleatorio)
  const selectedTutor = tutores.find(t => t.id === form.tutorId) || null

  // Restricciones del tutor seleccionado
  const restrictions = useMemo(() => {
    if (!selectedTutor) return { tipo: null, formato: null, horas: [] }
    return {
      tipo: selectedTutor.tipo_sesion || 'ambos',          // 'individual'|'grupal'|'ambos'
      formato: selectedTutor.formato_preferido || 'ambos', // 'presencial'|'virtual'|'ambos'
      horas: selectedTutor.horas_bloqueadas || [],          // ["08","14",...]
    }
  }, [selectedTutor])

  // Cuando cambia el tutor, ajustar tipo/formato automáticamente si hay restricción
  useEffect(() => {
    if (!selectedTutor) return
    if (restrictions.tipo === 'individual' && form.tipo === 'grupal') update('tipo', 'individual')
    if (restrictions.tipo === 'grupal'     && form.tipo === 'individual') update('tipo', 'grupal')
    if (restrictions.formato === 'presencial' && form.formato === 'virtual')   update('formato', 'presencial')
    if (restrictions.formato === 'virtual'    && form.formato === 'presencial') update('formato', 'virtual')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.tutorId])

  // Horas disponibles según tutor seleccionado
  const timeOptions = useMemo(() => {
    if (restrictions.horas.length === 0) return ALL_TIME_OPTIONS
    return ALL_TIME_OPTIONS.filter(t => !restrictions.horas.includes(t.slice(0, 2)))
  }, [restrictions.horas])

  // Si la hora seleccionada quedó bloqueada al cambiar tutor, limpiarla
  useEffect(() => {
    if (form.hora && !timeOptions.includes(form.hora)) update('hora', '')
  }, [timeOptions, form.hora])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!user) { setError('Debes iniciar sesión para solicitar una tutoría.'); return }
    if (!form.fecha) { setError('Por favor selecciona la fecha deseada.'); return }
    if (!form.hora)  { setError('Por favor selecciona la hora de la tutoría.'); return }
    setSubmitting(true)
    try {
      if (!isDemoMode) {
        const { error: dbError } = await supabase.from('solicitudes_tutoria').insert({
          estudiante_id: user.id,
          materia_id: materiaId,
          tipo: form.tipo,
          formato: form.formato,
          fecha_preferida: form.fecha,
          hora_preferida: form.hora,
          notas: `[Tutor: ${form.tutorId}] [Dur. ${form.duracion}m]\n${form.notas || ''}`.trim(),
        })
        if (dbError) {
          if (dbError.code === '23503') throw new Error('Ocurrió un error. Por favor inicia sesión nuevamente.')
          throw new Error('Ocurrió un error al enviar tu solicitud. Intenta de nuevo.')
        }
      } else {
        await new Promise(r => setTimeout(r, 1200))
      }
      const tutorObj = form.tutorId === 'aleatorio'
        ? { id: 'aleatorio', nombre: 'Aleatorio' }
        : tutores.find(t => t.id === form.tutorId)
      triggerTutorConfirmation(
        { id: null, materia_id: materiaId, fecha_preferida: form.fecha, hora_preferida: form.hora, formato: form.formato, tipo: form.tipo, duracion: form.duracion },
        user, tutorObj
      )
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Ocurrió un error al enviar tu solicitud. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="animate-fade-in card-static" style={{ padding: '48px 32px', maxWidth: '440px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-brand-50)', border: '2px solid var(--color-brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.8rem' }}>📬</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '8px' }}>¡Solicitud Enviada!</h1>
          <p style={{ color: 'var(--color-gray-600)', marginBottom: '6px' }}>Buscaremos el mejor tutor para ti.</p>
          <p style={{ color: 'var(--color-gray-400)', fontSize: '0.85rem', marginBottom: '28px' }}>Recibirás una notificación cuando un tutor confirme tu tutoría.</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={`/materia/${materiaId}`} className="btn btn-secondary">Ver pools disponibles</Link>
            <Link to="/" className="btn btn-primary">Ir al inicio</Link>
          </div>
        </div>
      </div>
    )
  }

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]
  const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 8)
  const maxDate = nextWeek.toISOString().split('T')[0]

  let precioCalculado = 0
  if (selectedTutor) {
    const base = form.formato === 'presencial'
      ? (selectedTutor.precio_base_presencial || 33250)
      : (selectedTutor.precio_base_virtual || 24250)
    precioCalculado = base + ((selectedTutor.precio_minuto || 450) * form.duracion)
  } else {
    precioCalculado = (form.formato === 'presencial' ? 33250 : 24250) + 450 * form.duracion
  }
  if (form.tipo === 'grupal') precioCalculado = calcPrecioGrupal(precioCalculado)

  const formatPrice = (p) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p)

  const tipoDisabled = (tipo) => {
    if (restrictions.tipo === 'individual' && tipo === 'grupal') return true
    if (restrictions.tipo === 'grupal' && tipo === 'individual') return true
    return false
  }
  const formatoDisabled = (fmt) => {
    if (restrictions.formato === 'presencial' && fmt === 'virtual') return true
    if (restrictions.formato === 'virtual' && fmt === 'presencial') return true
    return false
  }

  return (
    <div style={{ background: 'var(--color-gray-50)', minHeight: 'calc(100vh - 60px)', padding: '32px 16px 64px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--color-gray-500)', cursor: 'pointer', fontSize: '0.875rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px', padding: 0 }}>
          ← Volver
        </button>

        <div className="animate-fade-in card-static" style={{ padding: '32px' }}>
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '4px' }}>
              Solicitar Tutoría
            </h1>
            {materia && (
              <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>{materia.nombre}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Tipo */}
            <div>
              <label className="input-label">Tipo de tutoría</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <OptionCard
                  selected={form.tipo === 'individual'}
                  onClick={() => update('tipo', 'individual')}
                  label="Individual" desc="Solo tú con el tutor"
                  id="tipo-individual"
                  disabled={tipoDisabled('individual')}
                  disabledMsg="Este tutor no da sesiones individuales"
                />
                <OptionCard
                  selected={form.tipo === 'grupal'}
                  onClick={() => update('tipo', 'grupal')}
                  label="Grupal" desc="40% de descuento"
                  id="tipo-grupal"
                  disabled={tipoDisabled('grupal')}
                  disabledMsg="Este tutor no da sesiones grupales"
                />
              </div>
            </div>

            {/* Formato */}
            <div>
              <label className="input-label">Formato</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <OptionCard
                  selected={form.formato === 'presencial'}
                  onClick={() => update('formato', 'presencial')}
                  label="Presencial" desc="En la universidad"
                  id="formato-presencial"
                  disabled={formatoDisabled('presencial')}
                  disabledMsg="Este tutor solo da clases virtuales"
                />
                <OptionCard
                  selected={form.formato === 'virtual'}
                  onClick={() => update('formato', 'virtual')}
                  label="Virtual" desc="Desde donde estés"
                  id="formato-virtual"
                  disabled={formatoDisabled('virtual')}
                  disabledMsg="Este tutor solo da clases presenciales"
                />
              </div>
            </div>

            {/* Fecha y Hora */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="input-label" htmlFor="request-date">Fecha</label>
                <input id="request-date" type="date" min={minDate} max={maxDate} value={form.fecha} onChange={(e) => update('fecha', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="input-label" htmlFor="request-time">
                  Hora de inicio
                  {restrictions.horas.length > 0 && (
                    <span style={{ fontWeight: 400, color: 'var(--color-amber-600)', marginLeft: '6px', fontSize: '0.7rem' }}>
                      ⚠️ Algunas horas no disponibles
                    </span>
                  )}
                </label>
                <select id="request-time" value={form.hora} onChange={(e) => update('hora', e.target.value)} className="input-field" style={{ cursor: 'pointer' }} required>
                  <option value="">Seleccionar hora</option>
                  {timeOptions.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tutor y Duración */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="input-label">Tutor</label>
                <select value={form.tutorId} onChange={(e) => update('tutorId', e.target.value)} className="input-field" style={{ cursor: 'pointer' }}>
                  <option value="aleatorio">Aleatorio (más rápido)</option>
                  {tutores.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre} ★{t.calificacion}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Duración</label>
                <select value={form.duracion} onChange={(e) => update('duracion', parseInt(e.target.value))} className="input-field" style={{ cursor: 'pointer' }}>
                  <option value={60}>1 hora</option>
                  <option value={90}>1.5 horas</option>
                  <option value={120}>2 horas</option>
                </select>
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="input-label" htmlFor="request-notes">
                Notas <span style={{ fontWeight: 400, color: 'var(--color-gray-400)' }}>(opcional)</span>
              </label>
              <textarea id="request-notes" value={form.notas} onChange={(e) => update('notas', e.target.value)} className="input-field" rows={3} placeholder="Temas específicos, temas del parcial..." style={{ resize: 'vertical', minHeight: '80px' }} />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: 'var(--color-red-50)', border: '1px solid #fecaca', borderRadius: '8px', color: 'var(--color-red-600)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                <span>{error}</span>
                {!user && <Link to="/login" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>Iniciar sesión</Link>}
              </div>
            )}

            {/* Precio estimado */}
            <div style={{ padding: '16px', background: 'var(--color-brand-50)', border: '1px solid var(--color-brand-100)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-gray-700)' }}>Costo estimado</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
                    {form.tipo === 'grupal' ? 'Descuento grupal del 40%' : 'Tarifa individual (sin descuento)'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-brand-600)' }}>
                    {formatPrice(precioCalculado)}
                  </p>
                  {form.tipo === 'grupal' && (
                    <p style={{ fontSize: '0.72rem', color: 'var(--color-gray-400)', textDecoration: 'line-through' }}>
                      {formatPrice(Math.round(precioCalculado / 0.6))} sin descuento
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button type="submit" id="submit-request-btn" disabled={submitting} className="btn btn-primary btn-lg btn-full">
              {submitting ? '⏳ Enviando...' : '📬 Enviar Solicitud'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function OptionCard({ selected, onClick, label, desc, id, disabled, disabledMsg }) {
  return (
    <div title={disabled ? disabledMsg : undefined} style={{ position: 'relative' }}>
      <button type="button" id={id} onClick={disabled ? undefined : onClick} style={{
        width: '100%',
        padding: '14px 12px', borderRadius: '10px', cursor: disabled ? 'not-allowed' : 'pointer', textAlign: 'center',
        border: selected ? '2px solid var(--color-brand-500)' : '1.5px solid var(--color-gray-200)',
        background: disabled ? 'var(--color-gray-50)' : selected ? 'var(--color-brand-50)' : 'white',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s ease', color: 'inherit',
      }}>
        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: disabled ? 'var(--color-gray-400)' : selected ? 'var(--color-brand-700)' : 'var(--color-gray-800)', marginBottom: '2px' }}>{label}</p>
        <p style={{ fontSize: '0.72rem', color: disabled ? 'var(--color-gray-300)' : 'var(--color-gray-500)' }}>
          {disabled ? disabledMsg : desc}
        </p>
      </button>
    </div>
  )
}
