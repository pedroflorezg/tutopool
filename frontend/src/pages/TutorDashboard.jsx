import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

const HOURS = Array.from({ length: 16 }, (_, i) => String(i + 6).padStart(2, '0')) // "06".."21"

const HOUR_LABEL = h => {
  const n = parseInt(h)
  return n < 12 ? `${n}am` : n === 12 ? '12pm' : `${n - 12}pm`
}

export default function TutorDashboard() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [tutor, setTutor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sesiones, setSesiones] = useState([])

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/tutor/login'); return }

    const fetchData = async () => {
      const { data: tData, error: tErr } = await supabase
        .from('tutores').select('*').eq('user_id', user.id).single()

      if (tErr || !tData) { navigate('/tutor/registro'); return }

      setTutor(tData)
      setForm({
        bio: tData.bio || '',
        telefono: tData.telefono || '',
        google_calendar_url: tData.google_calendar_url || '',
        precio_base_presencial: tData.precio_base_presencial || 0,
        precio_base_virtual: tData.precio_base_virtual || 0,
        tipo_sesion: tData.tipo_sesion || 'ambos',
        formato_preferido: tData.formato_preferido || 'ambos',
        max_estudiantes_grupales: tData.max_estudiantes_grupales || 6,
        horas_bloqueadas: tData.horas_bloqueadas || [],
      })

      const { data: sData } = await supabase
        .from('sesiones').select('*, materias(nombre)')
        .eq('tutor_id', tData.id)
        .not('estado', 'eq', 'completada').not('estado', 'eq', 'cancelada')
        .order('fecha_inicio', { ascending: true })

      if (sData) setSesiones(sData)
      setLoading(false)
    }

    fetchData()
  }, [user, authLoading, navigate])

  const toggleHora = (h) => {
    setForm(prev => ({
      ...prev,
      horas_bloqueadas: prev.horas_bloqueadas.includes(h)
        ? prev.horas_bloqueadas.filter(x => x !== h)
        : [...prev.horas_bloqueadas, h],
    }))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true); setMsg('')
    const { error } = await supabase.from('tutores').update({
      bio: form.bio,
      telefono: form.telefono,
      google_calendar_url: form.google_calendar_url,
      precio_base_presencial: Number(form.precio_base_presencial),
      precio_base_virtual: Number(form.precio_base_virtual),
      tipo_sesion: form.tipo_sesion,
      formato_preferido: form.formato_preferido,
      max_estudiantes_grupales: Number(form.max_estudiantes_grupales),
      horas_bloqueadas: form.horas_bloqueadas,
    }).eq('user_id', user.id)

    setSaving(false)
    if (error) {
      setMsg('Error: ' + error.message)
    } else {
      setMsg('✅ Perfil actualizado exitosamente')
      setTutor({ ...tutor, ...form })
      setEditing(false)
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const formatDateTime = (dateStr) => new Date(dateStr).toLocaleString('es-CO', {
    weekday: 'long', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })

  if (loading || authLoading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-gray-400)' }}>Cargando portal del tutor...</div>
  }

  const tipoLabel = { individual: 'Solo individual', grupal: 'Solo grupal', ambos: 'Individual y grupal' }
  const formatoLabel = { presencial: 'Solo presencial', virtual: 'Solo virtual', ambos: 'Presencial y virtual' }

  return (
    <div style={{ background: 'var(--color-gray-50)', minHeight: 'calc(100vh - 60px)', paddingBottom: '64px' }}>
      <div style={{ background: 'var(--color-gray-900)', color: 'white', padding: '40px 0 60px' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
            ¡Hola, {tutor.nombre.split(' ')[0]}! 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>Bienvenido a tu panel de control de tutor.</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* PROFILE SECTION */}
        <div className="card-static" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-gray-900)' }}>
              Mi Perfil Profesional
            </h2>
            <button onClick={() => setEditing(!editing)} className="btn btn-secondary btn-sm">
              {editing ? 'Cancelar' : 'Editar Perfil'}
            </button>
          </div>

          {msg && <p style={{ marginBottom: '16px', fontSize: '0.9rem', color: msg.startsWith('Error') ? 'var(--color-red-600)' : 'var(--color-brand-600)' }}>{msg}</p>}

          {editing ? (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
                {/* Bio */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label">Biografía</label>
                  <textarea rows={3} className="input-field" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Escribe sobre ti y tu experiencia..." />
                </div>
                {/* Teléfono */}
                <div>
                  <label className="input-label">WhatsApp / Teléfono</label>
                  <input type="text" className="input-field" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="+57 300 000 0000" />
                </div>
                {/* Google Calendar */}
                <div>
                  <label className="input-label">Google Calendar URL (opcional)</label>
                  <input type="text" className="input-field" value={form.google_calendar_url} onChange={e => setForm({ ...form, google_calendar_url: e.target.value })} placeholder="URL para sincronizar" />
                </div>
                {/* Precios */}
                <div>
                  <label className="input-label">Precio presencial (por hora)</label>
                  <input type="number" className="input-field" value={form.precio_base_presencial} onChange={e => setForm({ ...form, precio_base_presencial: e.target.value })} />
                </div>
                <div>
                  <label className="input-label">Precio virtual (por hora)</label>
                  <input type="number" className="input-field" value={form.precio_base_virtual} onChange={e => setForm({ ...form, precio_base_virtual: e.target.value })} />
                </div>
              </div>

              {/* Preferencias de sesión */}
              <div style={{ borderTop: '1px solid var(--color-gray-100)', paddingTop: '18px' }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-gray-800)', marginBottom: '14px' }}>
                  Preferencias de sesión
                </p>
                <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: '1fr 1fr' }}>
                  <div>
                    <label className="input-label">¿Qué tipo de sesiones das?</label>
                    <select className="input-field" value={form.tipo_sesion} onChange={e => setForm({ ...form, tipo_sesion: e.target.value })} style={{ cursor: 'pointer' }}>
                      <option value="ambos">Individual y grupal</option>
                      <option value="individual">Solo individual</option>
                      <option value="grupal">Solo grupal</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">¿Qué formato manejas?</label>
                    <select className="input-field" value={form.formato_preferido} onChange={e => setForm({ ...form, formato_preferido: e.target.value })} style={{ cursor: 'pointer' }}>
                      <option value="ambos">Presencial y virtual</option>
                      <option value="presencial">Solo presencial</option>
                      <option value="virtual">Solo virtual</option>
                    </select>
                  </div>
                  {form.tipo_sesion !== 'individual' && (
                    <div>
                      <label className="input-label">Máx. estudiantes por sesión grupal</label>
                      <input type="number" min={2} max={20} className="input-field" value={form.max_estudiantes_grupales} onChange={e => setForm({ ...form, max_estudiantes_grupales: e.target.value })} />
                    </div>
                  )}
                </div>
              </div>

              {/* Horas bloqueadas */}
              <div style={{ borderTop: '1px solid var(--color-gray-100)', paddingTop: '18px' }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-gray-800)', marginBottom: '4px' }}>
                  Horas en que nunca estoy disponible
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)', marginBottom: '12px' }}>
                  Los estudiantes no podrán solicitar tutorías en estas franjas.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {HOURS.map(h => {
                    const blocked = form.horas_bloqueadas.includes(h)
                    return (
                      <button key={h} type="button" onClick={() => toggleHora(h)} style={{
                        padding: '6px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
                        border: blocked ? '2px solid var(--color-red-400)' : '1.5px solid var(--color-gray-200)',
                        background: blocked ? '#fee2e2' : 'white',
                        color: blocked ? 'var(--color-red-700)' : 'var(--color-gray-500)',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}>
                        {HOUR_LABEL(h)}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--color-gray-600)', fontSize: '0.9rem' }}>
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-gray-900)', display: 'block', marginBottom: '4px' }}>Biografía</span>
                  <p>{tutor.bio || <span style={{ color: 'var(--color-gray-400)' }}>Sin biografía.</span>}</p>
                </div>
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--color-gray-900)', display: 'block', marginBottom: '4px' }}>Teléfono</span>
                  <p>{tutor.telefono || '-'}</p>
                </div>
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--color-gray-900)', display: 'block', marginBottom: '4px' }}>Calificación</span>
                  <p>{tutor.total_sesiones === 0 ? <span style={{ color: 'var(--color-brand-600)', fontWeight: 600 }}>Nuevo / Sin clasificar</span> : `${tutor.calificacion} ⭐`}</p>
                </div>
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--color-gray-900)', display: 'block', marginBottom: '4px' }}>Precio presencial</span>
                  <p>${(tutor.precio_base_presencial || 0).toLocaleString('es-CO')}/hr</p>
                </div>
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--color-gray-900)', display: 'block', marginBottom: '4px' }}>Precio virtual</span>
                  <p>${(tutor.precio_base_virtual || 0).toLocaleString('es-CO')}/hr</p>
                </div>
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--color-gray-900)', display: 'block', marginBottom: '4px' }}>Tipo de sesiones</span>
                  <p>{tipoLabel[tutor.tipo_sesion] || 'Individual y grupal'}</p>
                </div>
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--color-gray-900)', display: 'block', marginBottom: '4px' }}>Formato</span>
                  <p>{formatoLabel[tutor.formato_preferido] || 'Presencial y virtual'}</p>
                </div>
                {tutor.tipo_sesion !== 'individual' && (
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--color-gray-900)', display: 'block', marginBottom: '4px' }}>Máx. estudiantes grupales</span>
                    <p>{tutor.max_estudiantes_grupales || 6}</p>
                  </div>
                )}
              </div>
              {/* Horas bloqueadas */}
              <div style={{ borderTop: '1px solid var(--color-gray-100)', paddingTop: '14px' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-gray-900)', display: 'block', marginBottom: '8px' }}>Horas no disponibles</span>
                {(!tutor.horas_bloqueadas || tutor.horas_bloqueadas.length === 0) ? (
                  <p style={{ color: 'var(--color-gray-400)' }}>Sin restricciones de horario.</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {tutor.horas_bloqueadas.sort().map(h => (
                      <span key={h} style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, background: '#fee2e2', color: 'var(--color-red-700)' }}>
                        {HOUR_LABEL(h)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SESSIONS SECTION */}
        <div className="card-static" style={{ padding: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '20px' }}>
            Mis Tutorías Pendientes
          </h2>
          {sesiones.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', background: 'var(--color-gray-50)', borderRadius: '8px' }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '12px' }}>☕</span>
              <p style={{ color: 'var(--color-gray-500)', fontWeight: 600 }}>No tienes tutorías pendientes programadas.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sesiones.map(s => (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px', border: '1px solid var(--color-gray-200)', borderRadius: '8px',
                  background: 'white', flexWrap: 'wrap', gap: '16px',
                }}>
                  <div>
                    <h3 style={{ fontWeight: 700, color: 'var(--color-gray-900)', fontSize: '1rem', marginBottom: '4px' }}>
                      {s.materias?.nombre || 'Sesión'} ({s.formato}/{s.tipo})
                    </h3>
                    <p style={{ color: 'var(--color-gray-500)', fontSize: '0.85rem' }}>
                      📅 {formatDateTime(s.fecha_inicio)}<br />
                      📍 {s.ubicacion || s.enlace_virtual || 'Por definir'}
                    </p>
                  </div>
                  <span style={{
                    display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                    background: s.estado === 'confirmada' ? '#dcfce7' : '#fef9c3',
                    color: s.estado === 'confirmada' ? '#166534' : '#854d0e',
                  }}>
                    {s.estado.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
