import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function TutorDashboard() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [tutor, setTutor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sesiones, setSesiones] = useState([])

  // State for editing profile
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/tutor/login')
      return
    }

    const fetchData = async () => {
      // 1. Fetch tutor profile
      const { data: tData, error: tErr } = await supabase
        .from('tutores')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (tErr || !tData) {
        navigate('/tutor/registro')
        return
      }

      setTutor(tData)
      setForm({
        bio: tData.bio || '',
        telefono: tData.telefono || '',
        google_calendar_url: tData.google_calendar_url || '',
        precio_base_presencial: tData.precio_base_presencial || 0,
        precio_base_virtual: tData.precio_base_virtual || 0
      })

      // 2. Fetch tutor sessions
      const { data: sData } = await supabase
        .from('sesiones')
        .select('*, materias(nombre)')
        .eq('tutor_id', tData.id)
        .not('estado', 'eq', 'completada')
        .not('estado', 'eq', 'cancelada')
        .order('fecha_inicio', { ascending: true })

      if (sData) {
        setSesiones(sData)
      }

      setLoading(false)
    }

    fetchData()
  }, [user, authLoading, navigate])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')

    const { error } = await supabase
      .from('tutores')
      .update({
        bio: form.bio,
        telefono: form.telefono,
        google_calendar_url: form.google_calendar_url,
        precio_base_presencial: form.precio_base_presencial,
        precio_base_virtual: form.precio_base_virtual
      })
      .eq('user_id', user.id)

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

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleString('es-CO', { 
      weekday: 'long', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true 
    })
  }

  if (loading || authLoading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-gray-400)' }}>Cargando portal del tutor...</div>
  }

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
            <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Biografía (Resumen para los estudiantes)</label>
                <textarea rows={3} className="input-field" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Escribe un poco sobre ti y tu experiencia..." />
              </div>
              <div>
                <label className="input-label">Número de Teléfono (WhatsApp)</label>
                <input type="text" className="input-field" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} placeholder="Ej: +57 300 000 0000" />
              </div>
              <div>
                <label className="input-label">Google Calendar URL (Opcional)</label>
                <input type="text" className="input-field" value={form.google_calendar_url} onChange={e => setForm({...form, google_calendar_url: e.target.value})} placeholder="URL para sincronizar" />
              </div>
              <div>
                <label className="input-label">Precio Tutoría Presencial (por hora)</label>
                <input type="number" className="input-field" value={form.precio_base_presencial} onChange={e => setForm({...form, precio_base_presencial: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Precio Tutoría Virtual (por hora)</label>
                <input type="number" className="input-field" value={form.precio_base_virtual} onChange={e => setForm({...form, precio_base_virtual: e.target.value})} />
              </div>
              <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar Cambios'}</button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr', color: 'var(--color-gray-600)', fontSize: '0.9rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-gray-900)', display: 'block', marginBottom: '4px' }}>Biografía</span>
                <p>{tutor.bio || <span style={{ color: 'var(--color-gray-400)' }}>Sin biografía ingresada.</span>}</p>
              </div>
              <div>
                <span style={{ fontWeight: 700, color: 'var(--color-gray-900)', display: 'block', marginBottom: '4px' }}>Teléfono</span>
                <p>{tutor.telefono || '-'}</p>
              </div>
              <div>
                <span style={{ fontWeight: 700, color: 'var(--color-gray-900)', display: 'block', marginBottom: '4px' }}>Calificación Promedio</span>
                <p>{tutor.total_sesiones === 0 ? <span style={{ color: 'var(--color-brand-600)', fontWeight: 600 }}>Nuevo / Sin clasificar</span> : `${tutor.calificacion} ⭐`}</p>
              </div>
              <div>
                <span style={{ fontWeight: 700, color: 'var(--color-gray-900)', display: 'block', marginBottom: '4px' }}>Precio Base (Presencial)</span>
                <p>${tutor.precio_base_presencial || 0}</p>
              </div>
              <div>
                <span style={{ fontWeight: 700, color: 'var(--color-gray-900)', display: 'block', marginBottom: '4px' }}>Precio Base (Virtual)</span>
                <p>${tutor.precio_base_virtual || 0}</p>
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
                  background: 'white', flexWrap: 'wrap', gap: '16px'
                }}>
                  <div>
                    <h3 style={{ fontWeight: 700, color: 'var(--color-gray-900)', fontSize: '1rem', marginBottom: '4px' }}>
                      {s.materias?.nombre || 'Sesión'} ({s.formato}/{s.tipo})
                    </h3>
                    <p style={{ color: 'var(--color-gray-500)', fontSize: '0.85rem' }}>
                      📅 {formatDateTime(s.fecha_inicio)}<br/>
                      📍 {s.ubicacion || s.enlace_virtual || 'Por definir'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                      background: s.estado === 'confirmada' ? '#dcfce7' : '#fef9c3',
                      color: s.estado === 'confirmada' ? '#166534' : '#854d0e'
                    }}>
                      {s.estado.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
