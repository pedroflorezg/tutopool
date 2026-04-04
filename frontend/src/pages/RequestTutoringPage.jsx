// ... (mismos imports de la parte superior del archivo original) ...
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { isDemoMode, DEMO_MATERIAS, supabase, DEMO_TUTORES, calcPrecioGrupal } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { triggerTutorConfirmation } from '../lib/n8n'

export default function RequestTutoringPage() {
  // ... (mismo código de estado y submit) ...
  const { materiaId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const materia = isDemoMode
    ? DEMO_MATERIAS.find(m => m.id === materiaId)
    : null

  const [form, setForm] = useState({
    tipo: 'grupal',
    formato: 'presencial',
    duracion: 60,
    tutorId: 'aleatorio',
    fecha: '',
    hora: '',
    notas: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    // ... (mismo código de handle submit intacto) ...
    e.preventDefault()
    setError('')

    if (!form.fecha || !form.hora) {
      setError('Por favor selecciona fecha y hora.')
      return
    }

    setSubmitting(true)
    try {
      if (!isDemoMode) {
        const { error: dbError } = await supabase
          .from('solicitudes_tutoria')
          .insert({
            estudiante_id: user.id,
            materia_id: materiaId,
            tipo: form.tipo,
            formato: form.formato,
            fecha_preferida: form.fecha,
            hora_preferida: form.hora,
            notas: `[Tutor: ${form.tutorId}] [Dur. ${form.duracion}m]\n${form.notas || ''}`.trim(),
          })
        if (dbError) throw dbError
      } else {
        await new Promise(r => setTimeout(r, 1200))
      }
      
      // Llamar a la automatización de n8n para WhatsApp (fire & forget)
      // Se enviarán los datos de forma asincrónica
      triggerTutorConfirmation(
        {
          id: !isDemoMode ? null : 'temp-demo-' + Date.now(), // Real DB id usually comes back, pero simulamos
          materia_id: materiaId,
          fecha_preferida: form.fecha,
          hora_preferida: form.hora,
          formato: form.formato,
          tipo: form.tipo,
          duracion: form.duracion,
        },
        user,
        form.tutorId === 'aleatorio' ? { id: 'aleatorio', nombre: 'Aleatorio Seleccionado por Sistema' } : DEMO_TUTORES.find(t => t.id === form.tutorId)
      )

      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Hubo un error al enviar la solicitud.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    // ... (mismo código del éxito) ...
    return (
      <div className="container" style={{ padding: '60px 0', maxWidth: '500px', textAlign: 'center' }}>
        <div className="animate-fade-in-up glass-card-static" style={{ padding: '48px 32px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📬</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
            ¡Solicitud Enviada!
          </h1>
          <p style={{ color: 'var(--color-navy-300)', marginBottom: '8px' }}>Buscaremos el mejor tutor para ti.</p>
          <p style={{ color: 'var(--color-navy-500)', fontSize: '0.85rem', marginBottom: '24px' }}>Recibirás una notificación cuando un tutor confirme tu tutoría.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={`/materia/${materiaId}`} className="btn btn-secondary">Ver pools disponibles</Link>
            <Link to="/" className="btn btn-primary">Ir al inicio</Link>
          </div>
        </div>
      </div>
    )
  }

  // CALENDARIO DINÁMICO: Bloqueo para los siguientes 7 días
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 8) // +1 por mañana, +7 de margen
  const maxDate = nextWeek.toISOString().split('T')[0]

  // Cálculo de Precio Dinámico
  const selectedTutor = DEMO_TUTORES.find(t => t.id === form.tutorId)
  
  let precioCalculado = 0
  if (selectedTutor) {
    const base = form.formato === 'presencial' ? selectedTutor.precio_base_presencial : selectedTutor.precio_base_virtual
    precioCalculado = base + (selectedTutor.precio_minuto * form.duracion)
  } else {
    // Promedio para aleatorio
    const baseAvg = form.formato === 'presencial' ? 33250 : 24250 
    precioCalculado = baseAvg + (450 * form.duracion)
  }

  if (form.tipo === 'grupal') {
    precioCalculado = calcPrecioGrupal(precioCalculado)
  }

  // Simulación de bloqueo horario
  const isHoraBloqueada = form.tutorId !== 'aleatorio' && form.hora && form.hora >= '14:00' && form.hora <= '16:00'

  return (
    <div className="container" style={{ padding: '32px 0 60px', maxWidth: '560px' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--color-navy-400)', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        ← Volver
      </button>

      <div className="animate-fade-in-up glass-card-static" style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📝</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: 'white', marginBottom: '4px' }}>Solicitar Nueva Tutoría</h1>
          {materia && (
            <p style={{ color: 'var(--color-navy-400)', fontSize: '0.9rem' }}>{materia.nombre} ({materia.codigo})</p>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* ... (Selectores de Tipo y Formato iguales al código original) ... */}

          <div>
            <label className="input-label">Tipo de tutoría</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <OptionCard selected={form.tipo === 'individual'} onClick={() => update('tipo', 'individual')} icon="🧑" label="Individual" desc="Tú solo con el tutor" id="tipo-individual" />
              <OptionCard selected={form.tipo === 'grupal'} onClick={() => update('tipo', 'grupal')} icon="👥" label="Grupal" desc="Comparte y ahorra" id="tipo-grupal" />
            </div>
          </div>

          <div>
            <label className="input-label">Formato</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <OptionCard selected={form.formato === 'presencial'} onClick={() => update('formato', 'presencial')} icon="🏫" label="Presencial" desc="En la universidad" id="formato-presencial" />
              <OptionCard selected={form.formato === 'virtual'} onClick={() => update('formato', 'virtual')} icon="💻" label="Virtual" desc="Desde donde estés" id="formato-virtual" />
            </div>
          </div>

          {/* Date & Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="input-label" htmlFor="request-date">Fecha preferida</label>
              <input
                id="request-date"
                type="date"
                min={minDate}
                max={maxDate} /* LÍMITE DE 7 DÍAS APLICADO AQUÍ */
                value={form.fecha}
                onChange={(e) => update('fecha', e.target.value)}
                className="input-field"
                required
              />
              {form.tutorId !== 'aleatorio' && form.fecha && (
                <p style={{ fontSize: '0.75rem', color: 'var(--color-emerald-500)', marginTop: '6px' }}>
                  ✓ Consultando agenda del tutor...
                </p>
              )}
            </div>
            <div>
              <label className="input-label" htmlFor="request-time">Hora de inicio</label>
              <input
                id="request-time"
                type="time"
                value={form.hora}
                onChange={(e) => update('hora', e.target.value)}
                className="input-field"
                required
              />
              {isHoraBloqueada && (
                <p style={{ fontSize: '0.75rem', color: 'var(--color-rose-500)', marginTop: '6px' }}>
                  ⚠️ El tutor no está disponible a esta hora.
                </p>
              )}
            </div>
          </div>

          {/* Duración y Tutor */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="input-label">Tutor</label>
              <select
                value={form.tutorId}
                onChange={(e) => update('tutorId', e.target.value)}
                className="input-field"
                style={{ cursor: 'pointer' }}
              >
                <option value="aleatorio">🎲 Aleatorio (Más rápido)</option>
                {DEMO_TUTORES.map(t => (
                  <option key={t.id} value={t.id}>{t.nombre} (★{t.calificacion})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Duración</label>
              <select
                value={form.duracion}
                onChange={(e) => update('duracion', parseInt(e.target.value))}
                className="input-field"
                style={{ cursor: 'pointer' }}
              >
                <option value={60}>1 Hora</option>
                <option value={90}>1.5 Horas</option>
                <option value={120}>2 Horas</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="input-label" htmlFor="request-notes">
              Notas adicionales <span style={{ color: 'var(--color-navy-500)' }}>(opcional)</span>
            </label>
            <textarea id="request-notes" value={form.notas} onChange={(e) => update('notas', e.target.value)} className="input-field" rows={3} placeholder="Temas específicos, requisitos del parcial..." style={{ resize: 'vertical', minHeight: '80px' }} />
          </div>

          {error && <div style={{ padding: '12px 16px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 'var(--radius-badge)', color: 'var(--color-rose-500)', fontSize: '0.85rem' }}>{error}</div>}

          {/* Resumen de Precio */}
          <div style={{
            padding: '16px',
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-navy-400)' }}>Costo estimado</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-navy-500)' }}>
                {form.tipo === 'grupal' ? 'Incluye 40% de descuento grupal' : 'Tarifa individual normal'}
              </p>
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-emerald-400)' }}>
              {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(precioCalculado)}
            </div>
          </div>

          <button type="submit" id="submit-request-btn" disabled={submitting || isHoraBloqueada} className="btn btn-primary btn-lg btn-full" style={{ opacity: (submitting || isHoraBloqueada) ? 0.7 : 1 }}>
            {submitting ? (<><span style={{ animation: 'pulse-soft 1s infinite' }}>⏳</span>Enviando...</>) : ('🚀 Enviar Solicitud')}
          </button>
        </form>
      </div>
    </div>
  )
}

function OptionCard({ selected, onClick, icon, label, desc, id }) {
  return (
    <button
      type="button" id={id} onClick={onClick}
      style={{
        padding: '16px 12px', borderRadius: '12px',
        border: selected ? '2px solid var(--color-emerald-500)' : '1.5px solid rgba(159,179,200,0.12)',
        background: selected ? 'rgba(16,185,129,0.08)' : 'rgba(36,59,83,0.3)',
        cursor: 'pointer', textAlign: 'center', transition: 'all 0.25s ease', color: 'inherit',
      }}
    >
      <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{icon}</div>
      <p style={{ fontWeight: 600, fontSize: '0.9rem', color: selected ? 'var(--color-emerald-400)' : 'var(--color-navy-200)', marginBottom: '2px' }}>{label}</p>
      <p style={{ fontSize: '0.72rem', color: 'var(--color-navy-500)' }}>{desc}</p>
    </button>
  )
}