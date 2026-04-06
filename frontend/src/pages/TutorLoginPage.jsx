import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function TutorLoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await signIn(email, password)
    if (err) {
      const msg = err.message || ''
      setError(
        msg.includes('Invalid login credentials') ? 'Email o contraseña incorrectos.' :
        msg.includes('Email not confirmed') ? 'Debes confirmar tu email antes de ingresar.' :
        msg.includes('Too many requests') ? 'Demasiados intentos. Espera unos minutos.' :
        'Error al iniciar sesión. Intenta de nuevo.'
      )
      setLoading(false)
    } else {
      navigate('/tutor/dashboard')
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', background: 'var(--color-gray-50)' }}>
      <div className="animate-fade-in card-static" style={{ padding: '36px 32px', width: '100%', maxWidth: '400px', borderTop: '4px solid var(--color-brand-600)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '4px' }}>
            Portal Tutores
          </h1>
          <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>
            Accede a tu panel de control
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="input-label" htmlFor="login-email">Email</label>
            <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="input-field" placeholder="tu@eia.edu.co" required />
          </div>
          <div>
            <label className="input-label" htmlFor="login-password" style={{ margin: 0 }}>Contraseña</label>
            <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="input-field" placeholder="••••••••" required />
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
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-gray-500)', marginTop: '20px' }}>
          ¿No tienes perfil de tutor?{' '}
          <Link to="/tutor/registro" style={{ color: 'var(--color-brand-600)', textDecoration: 'none', fontWeight: 600 }}>
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
