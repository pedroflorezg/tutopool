import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const { signIn, signInWithOAuth } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  const handleForgotPassword = async () => {
    if (!email) { setResetSent(false); setError('Escribe tu email primero para poder enviar el enlace.'); return }
    setResetLoading(true)
    setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })
    setResetLoading(false)
    if (err) {
      setError('No se pudo enviar el correo. Verifica el email e intenta de nuevo.')
    } else {
      setResetSent(true)
    }
  }

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
      navigate('/')
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', background: 'var(--color-gray-50)' }}>
      <div className="animate-fade-in card-static" style={{ padding: '36px 32px', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'var(--color-gray-900)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'white', fontSize: '1rem',
          }}>TP</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '4px' }}>
            Iniciar Sesión
          </h1>
          <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>
            Accede a tus tutorías y pools
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="input-label" htmlFor="login-email">Email</label>
            <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="input-field" placeholder="tu@eia.edu.co" required />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
              <label className="input-label" htmlFor="login-password" style={{ margin: 0 }}>Contraseña</label>
              <button type="button" onClick={handleForgotPassword} disabled={resetLoading}
                style={{ fontSize: '0.78rem', color: 'var(--color-brand-600)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0 }}>
                {resetLoading ? 'Enviando…' : '¿Olvidaste tu contraseña?'}
              </button>
            </div>
            <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="input-field" placeholder="••••••••" required />
          </div>
          {resetSent && (
            <div style={{
              padding: '10px 14px', background: '#f0fdf4',
              border: '1px solid #bbf7d0', borderRadius: '8px',
              color: '#15803d', fontSize: '0.85rem',
            }}>
              ✅ Te enviamos un enlace de recuperación a <strong>{email}</strong>. Revisa tu bandeja de entrada.
            </div>
          )}
          {error && (
            <div style={{
              padding: '10px 14px', background: 'var(--color-red-50)',
              border: '1px solid #fecaca', borderRadius: '8px',
              color: 'var(--color-red-600)', fontSize: '0.85rem',
            }}>{error}</div>
          )}
          <button type="submit" id="login-btn" disabled={loading}
            className="btn btn-primary btn-lg btn-full" style={{ marginTop: '4px' }}>
            {loading ? 'Ingresando...' : 'Ingresar'}
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
          ¿No tienes cuenta?{' '}
          <Link to="/registro" style={{ color: 'var(--color-brand-600)', textDecoration: 'none', fontWeight: 600 }}>
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
