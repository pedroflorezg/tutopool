import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { signIn, signInWithOAuth } = useAuth() // Importamos signInWithOAuth
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
      setError(err.message || 'Credenciales incorrectas')
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="container" style={{ padding: '60px 0', maxWidth: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="animate-fade-in-up glass-card-static" style={{ padding: '40px 32px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #10b981, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'white', fontSize: '1.2rem' }}>TP</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: 'white', marginBottom: '4px' }}>Iniciar Sesión</h1>
          <p style={{ color: 'var(--color-navy-400)', fontSize: '0.9rem' }}>Accede a tus tutorías y pools</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="input-label" htmlFor="login-email">Email</label>
            <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="tu@universidad.edu" required />
          </div>
          <div>
            <label className="input-label" htmlFor="login-password">Contraseña</label>
            <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••••" required />
          </div>
          {error && <div style={{ padding: '10px 14px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 'var(--radius-badge)', color: 'var(--color-rose-500)', fontSize: '0.85rem' }}>{error}</div>}
          <button type="submit" id="login-btn" disabled={loading} className="btn btn-primary btn-lg btn-full" style={{ marginTop: '4px', opacity: loading ? 0.7 : 1 }}>{loading ? 'Ingresando...' : 'Ingresar'}</button>
        </form>

        {/* Botones SSO */}
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <div style={{ textAlign: 'center', color: 'var(--color-navy-400)', fontSize: '0.85rem', margin: '4px 0' }}>o ingresa con tu correo institucional</div>
          <button type="button" onClick={() => signInWithOAuth('google')} className="btn btn-secondary btn-full">
            Continuar con Google
          </button>
          <button type="button" onClick={() => signInWithOAuth('azure')} className="btn btn-secondary btn-full">
            Continuar con Microsoft
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-navy-400)', marginTop: '20px' }}>¿No tienes cuenta?{' '}<Link to="/registro" style={{ color: 'var(--color-emerald-400)', textDecoration: 'none', fontWeight: 500 }}>Regístrate</Link></p>
      </div>
    </div>
  )
}