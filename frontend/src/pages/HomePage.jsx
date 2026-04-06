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
    semestre:   semestre   || undefined,
  }), [search, programaId, semestre])

  const { materias, programas, loading } = useSubjects(filters)
  const hasFilters = search || programaId || semestre

  return (
    <div style={{ paddingBottom: '80px' }}>

      {/* ── Hero ── */}
      <section style={{
        background: 'white',
        borderBottom: '1px solid var(--color-gray-200)',
        padding: '96px 0 64px',
        minHeight: '460px',
        display: 'flex',
        alignItems: 'center',
      }}>
        <div className="container">
          <div style={{ maxWidth: '600px' }}>

            <p style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-gray-400)',
              marginBottom: '18px',
            }}>
              Universidad EIA · Medellín
            </p>

            <h1 className="animate-fade-in-up" style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
              fontWeight: 800,
              color: 'var(--color-gray-900)',
              marginBottom: '16px',
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
            }}>
              Encuentra tu tutoría
            </h1>

            <p className="animate-fade-in-up stagger-1" style={{
              fontSize: '1.05rem',
              color: 'var(--color-gray-500)',
              marginBottom: '36px',
              lineHeight: 1.7,
              maxWidth: '480px',
            }}>
              Únete a grupos de estudio con <strong>40% de descuento</strong> o solicita una sesión personalizada.
            </p>

            <div className="animate-fade-in-up stagger-2" style={{
              display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '40px',
            }}>
              {[
                { text: 'Pools grupales — 40% de descuento' },
                { text: 'Presencial o virtual' },
                { text: 'Confirmación por WhatsApp' },
              ].map(({ text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.83rem', color: 'var(--color-gray-500)' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--color-gray-400)', flexShrink: 0 }} />
                  {text}
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="animate-fade-in-up stagger-2">
              <div style={{ position: 'relative', marginBottom: '10px' }}>
                <svg style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  width: '15px', height: '15px', color: 'var(--color-gray-400)', flexShrink: 0,
                }} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <input
                  id="search-bar"
                  type="text"
                  placeholder="Buscar por nombre o código (ej. MAT101, Cálculo…)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '40px', height: '46px', fontSize: '0.9rem' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  id="filter-programa"
                  value={programaId}
                  onChange={(e) => setProgramaId(e.target.value)}
                  className="input-field"
                  style={{ flex: '1', minWidth: '180px', cursor: 'pointer', height: '40px' }}
                >
                  <option value="">Todos los programas</option>
                  {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
                <select
                  id="filter-semestre"
                  value={semestre}
                  onChange={(e) => setSemestre(e.target.value)}
                  className="input-field"
                  style={{ flex: '0 0 155px', cursor: 'pointer', height: '40px' }}
                >
                  <option value="">Semestre</option>
                  {[1,2,3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>Semestre {s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Results ── */}
      <section className="container" style={{ paddingTop: '36px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '22px',
        }}>
          <p style={{ fontSize: '0.83rem', color: 'var(--color-gray-400)', fontWeight: 500 }}>
            {loading ? 'Cargando…' : `${materias.length} materia${materias.length !== 1 ? 's' : ''} encontrada${materias.length !== 1 ? 's' : ''}`}
          </p>
          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setProgramaId(''); setSemestre('') }}
              className="btn btn-secondary btn-sm"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="skeleton" style={{ height: '160px' }} />
            ))}
          </div>
        ) : materias.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '72px 20px', color: 'var(--color-gray-400)' }}>
            <svg style={{ width: '36px', height: '36px', margin: '0 auto 14px', display: 'block', opacity: 0.4 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-gray-600)', marginBottom: '4px' }}>
              No se encontraron materias
            </p>
            <p style={{ fontSize: '0.83rem' }}>Prueba con otros criterios de búsqueda.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {materias.map((m, i) => <SubjectCard key={m.id} materia={m} index={i} />)}
          </div>
        )}
      </section>
    </div>
  )
}

function SubjectCard({ materia, index }) {
  return (
    <Link
      to={`/materia/${materia.id}`}
      id={`subject-card-${materia.id}`}
      className={`card animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
      style={{ display: 'block', padding: '20px 22px', textDecoration: 'none', color: 'inherit' }}
    >
      {/* Header row: nombre + badge pool abierto */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '0.975rem', fontWeight: 700,
          color: 'var(--color-gray-900)',
          lineHeight: 1.3, margin: 0,
        }}>
          {materia.nombre}
        </h3>
        {materia.openPools > 0 && (
          <span style={{
            fontSize: '0.68rem', fontWeight: 700,
            background: '#dcfce7', color: '#15803d',
            padding: '3px 8px', borderRadius: '100px',
            whiteSpace: 'nowrap', letterSpacing: '0.02em', flexShrink: 0,
          }}>
            ✓ Pool abierto
          </span>
        )}
      </div>

      {/* Tutors */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {materia.tutores?.length > 0 ? (
          materia.tutores.map(t => (
            <span key={t.id} style={{
              fontSize: '0.72rem', fontWeight: 600,
              color: 'var(--color-gray-600)',
              background: 'var(--color-gray-100)',
              padding: '3px 8px', borderRadius: '100px',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <span style={{ fontSize: '0.65rem' }}>👤</span> {t.nombre}
            </span>
          ))
        ) : (
          <span style={{ fontSize: '0.72rem', color: 'var(--color-gray-300)', fontStyle: 'italic' }}>
            Sin tutores asignados
          </span>
        )}
      </div>
    </Link>
  )
}
