import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function TutorRegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  
  const [form, setForm] = useState({ nombre: '', email: '', password: '', telefono: '' })
  const [materiasList, setMateriasList] = useState([])
  const [selectedMaterias, setSelectedMaterias] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('materias').select('id, nombre').order('nombre')
      .then(({ data }) => setMateriasList(data || []))
  }, [])

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const toggleMateria = (id) => {
    setSelectedMaterias(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (selectedMaterias.length === 0) { setError('Debes seleccionar al menos una materia que enseñas.'); return }
    if (!form.telefono) { setError('Debes ingresar tu teléfono de contacto.'); return }

    setLoading(true)

    // 1. Sign up user via Supabase Auth
    const { data: authData, error: err } = await signUp(form.email, form.password)

    if (err) {
      const msg = err.message || ''
      setError(
        msg.includes('already registered') || msg.includes('User already') ? 'Este email ya está registrado.' :
        msg.includes('Password should') ? 'La contraseña debe tener al menos 6 caracteres.' :
        'Error al crear la cuenta. Intenta de nuevo.'
      )
      setLoading(false)
      return
    }

    // 2. Create Tutor profile in public.tutores
    const userId = authData?.user?.id
    if (userId) {
      const { data: tutorData, error: tutorErr } = await supabase.from('tutores').insert({
        user_id: userId,
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono,
        activo: true
      }).select('id').single()
      
      if (tutorErr) {
        console.error('Error insertando perfil tutor:', tutorErr.message)
        setError('Cuenta creada, pero hubo un error generando tu perfil de tutor.')
      } else {
        // 3. Insert subjects into public.tutor_materias
        const tutorId = tutorData.id
        const materiasToInsert = selectedMaterias.map(mId => ({
          tutor_id: tutorId,
          materia_id: mId
        }))
        
        if (materiasToInsert.length > 0) {
          const { error: materiasErr } = await supabase.from('tutor_materias').insert(materiasToInsert)
          if (materiasErr) {
             console.error('Error insertando materias:', materiasErr.message)
          }
        }
        // Redirigir al dashboard
        navigate('/tutor/dashboard')
      }
    } else {
      navigate('/tutor/dashboard')
    }
    
    setLoading(false)
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', background: 'var(--color-gray-50)' }}>
      <div className="animate-fade-in card-static" style={{ padding: '36px 32px', width: '100%', maxWidth: '420px', borderTop: '4px solid var(--color-brand-600)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '4px' }}>
            Portal Tutores
          </h1>
          <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>
            Regístrate para comenzar a impartir tutorías
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="input-label" htmlFor="reg-nombre">Nombre completo</label>
            <input id="reg-nombre" type="text" value={form.nombre} onChange={(e) => update('nombre', e.target.value)}
              className="input-field" placeholder="Ej: Ana María Rico" required />
          </div>
          <div>
            <label className="input-label" htmlFor="reg-email">Email</label>
            <input id="reg-email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
              className="input-field" placeholder="tu@eia.edu.co" required />
          </div>
          <div>
            <label className="input-label" htmlFor="reg-telefono">WhatsApp/Teléfono</label>
            <input id="reg-telefono" type="text" value={form.telefono} onChange={(e) => update('telefono', e.target.value)}
              className="input-field" placeholder="Ej: +57 321 000 0000" required />
          </div>
          <div>
            <label className="input-label" htmlFor="reg-password">Contraseña</label>
            <input id="reg-password" type="password" value={form.password} onChange={(e) => update('password', e.target.value)}
              className="input-field" placeholder="Mínimo 6 caracteres" required />
          </div>

          <div>
            <label className="input-label">Materias que enseñas</label>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', marginBottom: '8px' }}>Selecciona todas las que apliquen</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', padding: '10px', background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: '6px' }}>
              {materiasList.length === 0 ? <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-400)' }}>Cargando materias...</span> : null}
              {materiasList.map(m => (
                <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input type="checkbox" 
                    checked={selectedMaterias.includes(m.id)} 
                    onChange={() => toggleMateria(m.id)} 
                  />
                  {m.nombre}
                </label>
              ))}
            </div>
          </div>
          
          {error && (
            <div style={{
              padding: '10px 14px', background: 'var(--color-red-50)',
              border: '1px solid #fecaca', borderRadius: '8px',
              color: 'var(--color-red-600)', fontSize: '0.85rem',
            }}>{error}</div>
          )}
          
          <button type="submit" disabled={loading}
            className="btn btn-primary btn-lg btn-full" style={{ marginTop: '4px' }}>
            {loading ? 'Creando cuenta...' : 'Crear Cuenta de Tutor'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-gray-500)', marginTop: '20px' }}>
          ¿Ya tienes perfil de tutor?{' '}
          <Link to="/tutor/login" style={{ color: 'var(--color-brand-600)', textDecoration: 'none', fontWeight: 600 }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
