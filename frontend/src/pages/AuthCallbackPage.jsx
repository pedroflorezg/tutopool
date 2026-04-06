import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase JS v2 detecta automáticamente el code/hash en la URL
    // y establece la sesión. Esperamos a que lo procese.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/', { replace: true })
      } else {
        // Si no hay sesión todavía, esperamos el evento SIGNED_IN
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            subscription.unsubscribe()
            navigate('/', { replace: true })
          } else if (event === 'SIGNED_OUT' || (!session && event !== 'INITIAL_SESSION')) {
            subscription.unsubscribe()
            navigate('/login', { replace: true })
          }
        })
        // Timeout de seguridad: si en 5 segundos no hay sesión, ir a login
        const timeout = setTimeout(() => {
          subscription.unsubscribe()
          navigate('/login', { replace: true })
        }, 5000)
        return () => { clearTimeout(timeout); subscription.unsubscribe() }
      }
    })
  }, [navigate])

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-gray-200)', borderTopColor: 'var(--color-brand-600)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--color-gray-500)', fontSize: '0.9rem' }}>Completando inicio de sesión…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
