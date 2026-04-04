import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useSubjects } from '../hooks/useSubjects'

export default function HomePage() {
  const [search, setSearch] = useState('')
  const [programaId, setProgramaId] = useState('')
  const [semestre, setSemestre] = useState('')

  const filters = useMemo(() => ({
    search,
    programaId: programaId || undefined,
    semestre: semestre || undefined,
  }), [search, programaId, semestre])

  const { materias, programas, loading } = useSubjects(filters)

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Hero Section */}
      <section style={{
        padding: '48px 0 32px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative' }}>
          <h1 className="animate-fade-in-up" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 800,
            color: 'white',
            marginBottom: '12px',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
          }}>
            Encuentra tu <span style={{
              background: 'linear-gradient(135deg, #10b981, #0ea5e9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>tutoría perfecta</span>
          </h1>
          <p className="animate-fade-in-up stagger-1" style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
            color: 'var(--color-navy-400)',
            maxWidth: '520px',
            margin: '0 auto 32px',
            lineHeight: 1.6,
          }}>
            Únete a pools grupales y paga menos, o solicita una tutoría personalizada.
          </p>

          {/* Search Bar */}
          <div className="animate-fade-in-up stagger-2" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{
              position: 'relative',
              marginBottom: '16px',
            }}>
              <span style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '1.1rem',
                opacity: 0.4,
              }}>🔍</span>
              <input
                id="search-bar"
                type="text"
                placeholder="Buscar materia por nombre o código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field"
                style={{
                  paddingLeft: '44px',
                  height: '52px',
                  fontSize: '1rem',
                  borderRadius: '14px',
                }}
              />
            </div>

            {/* Filters */}
            <div style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
            }}>
              <select
                id="filter-programa"
                value={programaId}
                onChange={(e) => setProgramaId(e.target.value)}
                className="input-field"
                style={{ flex: '1', minWidth: '180px', cursor: 'pointer' }}
              >
                <option value="">Todos los programas</option>
                {programas.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
              <select
                id="filter-semestre"
                value={semestre}
                onChange={(e) => setSemestre(e.target.value)}
                className="input-field"
                style={{ flex: '0 0 140px', cursor: 'pointer' }}
              >
                <option value="">Semestre</option>
                {[1,2,3,4,5,6,7,8,9,10].map(s => (
                  <option key={s} value={s}>Semestre {s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.2rem',
            fontWeight: 600,
            color: 'var(--color-navy-200)',
          }}>
            {loading ? 'Cargando…' : `${materias.length} materia${materias.length !== 1 ? 's' : ''} encontrada${materias.length !== 1 ? 's' : ''}`}
          </h2>
          {(search || programaId || semestre) && (
            <button
              onClick={() => { setSearch(''); setProgramaId(''); setSemestre('') }}
              className="btn btn-secondary btn-sm"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
          }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="skeleton" style={{ height: '180px', borderRadius: 'var(--radius-card)' }} />
            ))}
          </div>
        ) : materias.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--color-navy-400)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📚</div>
            <p style={{ fontSize: '1.1rem' }}>No se encontraron materias con esos filtros.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>Prueba con otros criterios de búsqueda.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
          }}>
            {materias.map((m, i) => (
              <SubjectCard key={m.id} materia={m} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function SubjectCard({ materia, index }) {
  const semesterColors = {
    1: '#10b981', 2: '#0ea5e9', 3: '#8b5cf6',
    4: '#f59e0b', 5: '#ef4444', 6: '#06b6d4',
    7: '#ec4899', 8: '#14b8a6', 9: '#f97316', 10: '#6366f1',
  }
  const color = semesterColors[materia.semestre] || '#627d98'

  return (
    <Link
      to={`/materia/${materia.id}`}
      id={`subject-card-${materia.id}`}
      className={`glass-card animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
      style={{
        display: 'block',
        padding: '24px',
        textDecoration: 'none',
        color: 'inherit',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Accent line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: `linear-gradient(90deg, ${color}, transparent)`,
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span className="badge badge-sky" style={{
          background: `${color}18`,
          color: color,
          borderColor: `${color}30`,
        }}>
          {materia.codigo}
        </span>
        <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
          Sem. {materia.semestre}
        </span>
      </div>

      <h3 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '1.05rem',
        fontWeight: 600,
        color: 'white',
        marginBottom: '8px',
        lineHeight: 1.3,
      }}>
        {materia.nombre}
      </h3>

      <p style={{
        fontSize: '0.82rem',
        color: 'var(--color-navy-400)',
        lineHeight: 1.5,
        marginBottom: '12px',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {materia.descripcion}
      </p>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontSize: '0.78rem',
          color: 'var(--color-navy-500)',
        }}>
          {materia.programa_nombre}
        </span>
        <span style={{
          fontSize: '0.78rem',
          color: 'var(--color-navy-400)',
        }}>
          {materia.creditos} créditos
        </span>
      </div>
    </Link>
  )
}
