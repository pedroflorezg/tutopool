import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase, isDemoMode, DEMO_PROGRAMAS } from '../lib/supabase'

export default function RegisterPage() {
  const { signUp, signInWithOAuth } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre: '', email: '', password: '', programa: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [programas, setProgramas] = useState(isDemoMode ? DEMO_PROGRAMAS : [])

  useEffect(() => {
    if (!isDemoMode) {
      supabase.from('programas').select('id, nombre').order('nombre')
        .then(({ data }) => setProgramas(data || []))
    }
  }, [])

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    setLoading(true)
    const { error: err } = await signUp(form.email, form.password, { nombre: form.nombre, programa: form.programa })
    if (err) {
      const msg = err.message || ''
      setError(
        msg.includes('already registered') || msg.includes('User already') ? 'Este email ya está registrado.' :
        msg.includes('Password should') ? 'La contraseña debe tener al menos 6 caracteres.' :
        msg.includes('Invalid email') ? 'El formato del email no es válido.' :
        'Error al crear la cuenta. Intenta de nuevo.'
      )
      setLoading(false)
    }
    else { navigate('/') }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', background: 'var(--color-gray-50)' }}>
      <div className="animate-fade-in card-static" style={{ padding: '36px 32px', width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'var(--color-gray-900)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'white', fontSize: '1rem',
          }}>TP</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '4px' }}>
            Crear Cuenta
          </h1>
          <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>
            Empieza a aprender con TutoPool
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="input-label" htmlFor="reg-nombre">Nombre completo</label>
            <input id="reg-nombre" type="text" value={form.nombre} onChange={(e) => update('nombre', e.target.value)}
              className="input-field" placeholder="Juan Pérez" required />
          </div>
          <div>
            <label className="input-label" htmlFor="reg-email">Email institucional</label>
            <input id="reg-email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
              className="input-field" placeholder="juan.perez@eia.edu.co" required />
          </div>
          <div>
            <label className="input-label" htmlFor="reg-programa">Programa académico</label>
            <select id="reg-programa" value={form.programa} onChange={(e) => update('programa', e.target.value)}
              className="input-field" style={{ cursor: 'pointer' }}>
              <option value="">Seleccionar programa</option>
              {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label" htmlFor="reg-password">Contraseña</label>
            <input id="reg-password" type="password" value={form.password} onChange={(e) => update('password', e.target.value)}
              className="input-field" placeholder="Mínimo 6 caracteres" required />
          </div>
          {error && (
            <div style={{
              padding: '10px 14px', background: 'var(--color-red-50)',
              border: '1px solid #fecaca', borderRadius: '8px',
              color: 'var(--color-red-600)', fontSize: '0.85rem',
            }}>{error}</div>
          )}
          <button type="submit" id="register-btn" disabled={loading}
            className="btn btn-primary btn-lg btn-full" style={{ marginTop: '4px' }}>
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-gray-200)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-400)', whiteSpace: 'nowrap' }}>
            o continúa con
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-gray-200)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button type="button" onClick={() => signInWithOAuth('google')} className="btn btn-secondary btn-full">
            <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>
          <button type="button" onClick={() => signInWithOAuth('azure')} className="btn btn-secondary btn-full">
            <svg width="16" height="16" viewBox="0 0 23 23" style={{ flexShrink: 0 }}>
              <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
              <rect x="12" y="1" width="10" height="10" fill="#7FBA00"/>
              <rect x="1" y="12" width="10" height="10" fill="#00A4EF"/>
              <rect x="12" y="12" width="10" height="10" fill="#FFB900"/>
            </svg>
            Continuar con Microsoft
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-gray-500)', marginTop: '20px' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--color-brand-600)', textDecoration: 'none', fontWeight: 600 }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
