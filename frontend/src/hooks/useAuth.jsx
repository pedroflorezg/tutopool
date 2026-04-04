import { useState, useEffect, createContext, useContext } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemoMode) {
      // Demo user
      setUser({
        id: 'demo-user-001',
        email: 'estudiante@demo.com',
        user_metadata: { nombre: 'Estudiante Demo' }
      })
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    if (isDemoMode) {
      setUser({
        id: 'demo-user-001',
        email,
        user_metadata: { nombre: 'Estudiante Demo' }
      })
      return { error: null }
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email, password, metadata = {}) => {
    if (isDemoMode) {
      setUser({
        id: 'demo-user-001',
        email,
        user_metadata: metadata
      })
      return { error: null }
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    })
    return { error }
  }

  // NUEVO: Integración de SSO (Google y Microsoft Azure)
  const signInWithOAuth = async (provider) => {
    if (isDemoMode) {
      setUser({
        id: 'demo-user-002',
        email: `estudiante@${provider}.com`,
        user_metadata: { nombre: `Usuario ${provider}` }
      })
      return { error: null }
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/`
      }
    })
    return { error }
  }

  const signOut = async () => {
    if (isDemoMode) {
      setUser(null)
      return
    }
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, signInWithOAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}