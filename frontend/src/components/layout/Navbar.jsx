import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useState, useRef, useEffect } from 'react'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  const handleSignOut = async () => {
    setUserMenuOpen(false)
    await signOut()
    navigate('/login')
  }

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = user
    ? (user.user_metadata?.nombre || user.email || '?')[0].toUpperCase()
    : '?'
  const displayName = user
    ? (user.user_metadata?.nombre || user.email || '')
    : ''

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'white',
      borderBottom: '1px solid var(--color-gray-200)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '68px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '9px',
            background: 'var(--color-gray-900)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            color: 'white',
            fontSize: '0.78rem',
            letterSpacing: '0.02em',
          }}>
            TP
          </div>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '1.1rem',
            color: 'var(--color-gray-900)',
            letterSpacing: '-0.01em',
          }}>
            TutoPool
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="hidden-mobile">
          <Link to="/" className="nav-link" style={{ marginRight: '8px' }}>Materias</Link>
          <Link to="/tutor/dashboard" className="nav-link" style={{ marginRight: '16px' }}>Portal Tutor</Link>
          {user ? (
            <>
              {/* User avatar dropdown */}
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '5px 12px 5px 6px',
                    border: '1px solid var(--color-gray-200)',
                    borderRadius: '100px',
                    background: 'white',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: 'var(--color-gray-900)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '0.65rem',
                    flexShrink: 0,
                  }}>
                    {initials}
                  </div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-gray-700)', fontWeight: 500, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayName}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--color-gray-400)', flexShrink: 0, transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    background: 'white', border: '1px solid var(--color-gray-200)',
                    borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    minWidth: '200px', padding: '6px', zIndex: 100,
                    animation: 'fadeInUp 0.15s ease-out',
                  }}>
                    <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--color-gray-100)', marginBottom: '4px' }}>
                      <p style={{ fontSize: '0.78rem', color: 'var(--color-gray-400)' }}>Conectado como</p>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</p>
                    </div>
                    <DropdownItem to="/mis-tutorias" icon="📚" label="Mis tutorías" onClick={() => setUserMenuOpen(false)} />
                    <div style={{ borderTop: '1px solid var(--color-gray-100)', margin: '4px 0' }} />
                    <button onClick={handleSignOut} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      width: '100%', padding: '9px 12px', borderRadius: '8px',
                      border: 'none', background: 'none', cursor: 'pointer',
                      fontSize: '0.875rem', color: 'var(--color-red-600)',
                      fontWeight: 500, textAlign: 'left',
                    }}>
                      <span>🚪</span> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn-secondary btn-sm">Iniciar sesión</Link>
              <Link to="/registro" className="btn btn-primary   btn-sm">Registrarse</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="visible-mobile-only"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'none', border: 'none',
            color: 'var(--color-gray-600)',
            fontSize: '1.3rem', cursor: 'pointer', padding: '4px',
            lineHeight: 1,
          }}
          aria-label="Menú"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          padding: '14px 20px 22px',
          display: 'flex', flexDirection: 'column', gap: '8px',
          borderTop: '1px solid var(--color-gray-200)',
          background: 'white',
          animation: 'fadeInUp 0.15s ease-out',
        }} className="visible-mobile-only">
          <Link to="/" onClick={() => setMenuOpen(false)} className="nav-link" style={{ padding: '9px 0' }}>
            Materias
          </Link>
          <Link to="/tutor/dashboard" onClick={() => setMenuOpen(false)} className="nav-link" style={{ padding: '9px 0' }}>
            Portal Tutor
          </Link>
          {user ? (
            <>
              <Link to="/mis-tutorias" onClick={() => setMenuOpen(false)} className="nav-link" style={{ padding: '9px 0' }}>
                📚 Mis tutorías
              </Link>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)', padding: '4px 0' }}>
                {displayName}
              </span>
              <button onClick={() => { handleSignOut(); setMenuOpen(false) }} className="btn btn-secondary btn-sm">
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    onClick={() => setMenuOpen(false)} className="btn btn-secondary btn-sm">Iniciar sesión</Link>
              <Link to="/registro" onClick={() => setMenuOpen(false)} className="btn btn-primary   btn-sm">Registrarse</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        .nav-link {
          color: var(--color-gray-500);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          padding: 4px 0;
          transition: color 0.15s;
        }
        .nav-link:hover { color: var(--color-gray-900); }

        @media (min-width: 768px) { .visible-mobile-only { display: none !important; } }
        @media (max-width: 767px)  { .hidden-mobile       { display: none !important; } }
      `}</style>
    </nav>
  )
}

function DropdownItem({ to, icon, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '9px 12px', borderRadius: '8px',
        textDecoration: 'none', fontSize: '0.875rem',
        color: 'var(--color-gray-700)', fontWeight: 500,
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-gray-50)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <span>{icon}</span> {label}
    </Link>
  )
}
