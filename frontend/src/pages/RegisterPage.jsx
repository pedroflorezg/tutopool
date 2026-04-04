import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isDemoMode, DEMO_PROGRAMAS } from '../lib/supabase'

export default function RegisterPage() {
  const { signUp, signInWithOAuth } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre: '', email: '', password: '', programa: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    setLoading(true)
    const { error: err } = await signUp(form.email, form.password, { nombre: form.nombre, programa: form.programa })
    if (err) { setError(err.message || 'Error al crear cuenta'); setLoading(false) }
    else { navigate('/') }
  }

  const programas = isDemoMode ? DEMO_PROGRAMAS : []

  return (
    <div className="container" style={{ padding: '40px 0 60px', maxWidth: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="animate-fade-in-up glass-card-static" style={{ padding: '40px 32px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #10b981, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'white', fontSize: '1.2rem' }}>TP</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: 'white', marginBottom: '4px' }}>Crear Cuenta</h1>
          <p style={{ color: 'var(--color-navy-400)', fontSize: '0.9rem' }}>Empieza a aprender con TutoPool</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="input-label" htmlFor="reg-nombre">Nombre completo</label>
            <input id="reg-nombre" type="text" value={form.nombre} onChange={(e) => update('nombre', e.target.value)} className="input-field" placeholder="Juan Pérez" required />
          </div>
          <div>
            <label className="input-label" htmlFor="reg-email">Email institucional</label>
            <input id="reg-email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="input-field" placeholder="juan.perez@universidad.edu" required />
          </div>
          <div>
            <label className="input-label" htmlFor="reg-programa">Programa académico</label>
            <select id="reg-programa" value={form.programa} onChange={(e) => update('programa', e.target.value)} className="input-field" style={{ cursor: 'pointer' }}>
              <option value="">Seleccionar programa</option>
              {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label" htmlFor="reg-password">Contraseña</label>
            <input id="reg-password" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} className="input-field" placeholder="Mínimo 6 caracteres" required />
          </div>
        {error && <div style={{ padding: '10px 14px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 'var(--radius-badge)', color: 'var(--color-rose-500)', fontSize: '0.85rem' }}>{error}</div>}
        <button type="submit" id="register-btn" disabled={loading} className="btn btn-primary btn-lg btn-full" style={{ marginTop: '4px', opacity: loading ? 0.7 : 1 }}>{loading ? 'Creando cuenta...' : '🚀 Crear Cuenta'}</button>
      </form>

      {/* Botones SSO */}
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
        <div style={{ textAlign: 'center', color: 'var(--color-navy-400)', fontSize: '0.85rem', margin: '4px 0' }}>o regístrate con tu correo institucional</div>
        <button type="button" onClick={() => signInWithOAuth('google')} className="btn btn-secondary btn-full">
          Continuar con Google
        </button>
        <button type="button" onClick={() => signInWithOAuth('azure')} className="btn btn-secondary btn-full">
          Continuar con Microsoft
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-navy-400)', marginTop: '20px' }}>¿Ya tienes cuenta?{' '}<Link to="/login" style={{ color: 'var(--color-emerald-400)', textDecoration: 'none', fontWeight: 500 }}>Inicia sesión</Link></p>
    </div>
  </div>
  )
}
