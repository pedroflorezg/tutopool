import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useState } from 'react'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(10, 25, 41, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(159, 179, 200, 0.08)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981, #0ea5e9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            color: 'white',
            fontSize: '0.85rem',
          }}>
            TP
          </div>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '1.25rem',
            color: 'white',
            letterSpacing: '-0.02em',
          }}>
            Tuto<span style={{ color: 'var(--color-emerald-400)' }}>Pool</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
             className="hidden-mobile">
          <Link to="/" className="nav-link">Materias</Link>
          {user ? (
            <>
              <span style={{
                fontSize: '0.85rem',
                color: 'var(--color-navy-300)',
              }}>
                {user.user_metadata?.nombre || user.email}
              </span>
              <button onClick={handleSignOut} className="btn btn-secondary btn-sm">
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Iniciar sesión</Link>
              <Link to="/registro" className="btn btn-primary btn-sm">Registrarse</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="visible-mobile-only"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-navy-200)',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '4px',
          }}
          aria-label="Menú"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          padding: '12px 16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          borderTop: '1px solid rgba(159,179,200,0.08)',
          animation: 'fadeInUp 0.2s ease-out',
        }} className="visible-mobile-only">
          <Link to="/" onClick={() => setMenuOpen(false)} className="nav-link" style={{ padding: '8px 0' }}>
            Materias
          </Link>
          {user ? (
            <>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-navy-300)', padding: '8px 0' }}>
                {user.user_metadata?.nombre || user.email}
              </span>
              <button onClick={() => { handleSignOut(); setMenuOpen(false); }} className="btn btn-secondary btn-sm">
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn btn-secondary btn-sm">
                Iniciar sesión
              </Link>
              <Link to="/registro" onClick={() => setMenuOpen(false)} className="btn btn-primary btn-sm">
                Registrarse
              </Link>
            </>
          )}
        </div>
      )}

      <style>{`
        .nav-link {
          color: var(--color-navy-300);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: color 0.2s;
        }
        .nav-link:hover { color: var(--color-emerald-400); }

        @media (min-width: 768px) {
          .visible-mobile-only { display: none !important; }
        }
        @media (max-width: 767px) {
          .hidden-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  )
}
