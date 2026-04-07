import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { usePools } from '../hooks/usePools'
import { supabase, isDemoMode, DEMO_MATERIAS } from '../lib/supabase'

export default function SubjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { pools, loading: poolsLoading } = usePools(id)
  const [materia, setMateria] = useState(null)
  const [materiaLoading, setMateriaLoading] = useState(!isDemoMode)

  useEffect(() => {
    if (isDemoMode) {
      setMateria(DEMO_MATERIAS.find(m => m.id === id) || null)
    } else {
      supabase
        .from('materias')
        .select('*, materia_programas(semestre, programa_id, programas(nombre))')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          if (data) {
            const mp = data.materia_programas?.[0]
            setMateria({ ...data, semestre: mp?.semestre, programa_nombre: mp?.programas?.nombre })
          }
          setMateriaLoading(false)
        })
    }
  }, [id])

  if (materiaLoading) {
    return (
      <div style={{ paddingBottom: '64px' }}>
        <section style={{ background: 'white', borderBottom: '1px solid var(--color-gray-200)', padding: '40px 0 32px' }}>
          <div className="container">
            <div className="skeleton" style={{ width: '60px', height: '14px', borderRadius: '4px', marginBottom: '20px' }} />
            <div className="skeleton" style={{ width: '120px', height: '14px', borderRadius: '4px', marginBottom: '12px' }} />
            <div className="skeleton" style={{ width: '340px', height: '36px', borderRadius: '6px', marginBottom: '12px' }} />
            <div className="skeleton" style={{ width: '480px', maxWidth: '100%', height: '14px', borderRadius: '4px' }} />
          </div>
        </section>
        <div className="container" style={{ paddingTop: '28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '240px', borderRadius: 'var(--radius-card)' }} />)}
          </div>
        </div>
      </div>
    )
  }

  if (!materia) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-gray-500)' }}>Materia no encontrada.</p>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: '16px' }}>Volver</Link>
      </div>
    )
  }

  const confirmedPools = pools.filter(p => p.estado === 'confirmada')
  const waitingPools   = pools.filter(p => p.estado === 'esperando_cupos')
  const allPools = [...confirmedPools, ...waitingPools]

  return (
    <div style={{ paddingBottom: '64px' }}>
      {/* Subject header */}
      <section style={{
        background: 'white',
        borderBottom: '1px solid var(--color-gray-200)',
        padding: '40px 0 32px',
      }}>
        <div className="container">
          <button
            onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')}
            style={{
              background: 'none', border: 'none',
              color: 'var(--color-gray-400)', cursor: 'pointer',
              fontSize: '0.82rem', marginBottom: '20px',
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: 0, letterSpacing: '0.01em',
            }}
          >
            ← Volver a materias
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--color-gray-500)', background: 'var(--color-gray-100)', padding: '3px 9px', borderRadius: '4px' }}>
              {materia.codigo}
            </span>
            {materia.semestre && (
              <span style={{ fontSize: '0.78rem', color: 'var(--color-gray-400)', fontWeight: 500 }}>
                Semestre {materia.semestre}
              </span>
            )}
            {materia.creditos && (
              <span style={{ fontSize: '0.78rem', color: 'var(--color-gray-400)', fontWeight: 500 }}>
                · {materia.creditos} créditos
              </span>
            )}
          </div>

          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.6rem, 3vw, 2.1rem)',
            fontWeight: 800, color: 'var(--color-gray-900)',
            marginBottom: '8px',
            letterSpacing: '-0.03em',
          }}>
            {materia.nombre}
          </h1>
          {materia.descripcion && (
            <p style={{ color: 'var(--color-gray-500)', fontSize: '0.9rem', maxWidth: '560px', lineHeight: 1.65 }}>
              {materia.descripcion}
            </p>
          )}
        </div>
      </section>

      <div className="container" style={{ paddingTop: '28px' }}>
        {/* Pools section */}
        <section>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '16px', flexWrap: 'wrap', gap: '10px',
          }}>
            <div>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-gray-900)',
              }}>
                Pools disponibles
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-gray-500)', marginTop: '2px' }}>
                40% de descuento al unirte en grupo
              </p>
            </div>
            <span className="badge badge-green">{allPools.length} disponible{allPools.length !== 1 ? 's' : ''}</span>
          </div>

          {poolsLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '240px', borderRadius: 'var(--radius-card)' }} />)}
            </div>
          ) : allPools.length === 0 ? (
            <div className="card-static" style={{ padding: '40px', textAlign: 'center' }}>
              <svg style={{ width: '36px', height: '36px', color: 'var(--color-gray-300)', margin: '0 auto 12px', display: 'block' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p style={{ color: 'var(--color-gray-600)', fontSize: '0.95rem', fontWeight: 500, marginBottom: '4px' }}>
                No hay pools abiertos esta semana
              </p>
              <p style={{ color: 'var(--color-gray-400)', fontSize: '0.85rem' }}>
                ¡Sé el primero en solicitar una tutoría grupal con 40% de descuento!
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
              {allPools.map((pool, i) => <PoolCard key={pool.id} pool={pool} index={i} />)}
            </div>
          )}
        </section>

        {/* CTA */}
        <section style={{ marginTop: '40px' }}>
          <div style={{
            background: 'var(--color-gray-900)',
            borderRadius: 'var(--radius-card)',
            padding: '32px 36px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '20px',
          }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, color: 'white', marginBottom: '5px' }}>
                ¿No encuentras lo que buscas?
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
                Solicita una sesión personalizada — individual o grupal, presencial o virtual.
              </p>
            </div>
            <Link to={`/solicitar/${id}`} id="request-tutoring-btn" style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '11px 24px',
              background: 'white',
              color: 'var(--color-gray-900)',
              borderRadius: 'var(--radius-button)',
              fontWeight: 600, fontSize: '0.875rem',
              textDecoration: 'none', whiteSpace: 'nowrap',
              transition: 'opacity 0.15s',
            }}>
              Solicitar tutoría
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

function PoolCard({ pool, index }) {
  const fechaInicio = new Date(pool.fecha_inicio)
  const fechaFin    = new Date(pool.fecha_fin)

  const formatDate = (d) => d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })
  const formatTime = (d) => d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })
  const formatPrice = (p) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p)

  const cuposDisponibles = pool.max_estudiantes - pool.inscritos_actuales
  const cuposPct = Math.min((pool.inscritos_actuales / pool.max_estudiantes) * 100, 100)
  const almostFull = cuposDisponibles <= 2

  return (
    <div
      className={`glass-card animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
      id={`pool-card-${pool.id}`}
      style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}
    >
      {/* Status badges */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <span className={pool.estado === 'confirmada' ? 'badge badge-green' : 'badge badge-gray'}>
          {pool.estado === 'confirmada' ? '✓ Confirmada' : '✓ Abierto'}
        </span>
        <span className="badge badge-gray">
          {pool.formato === 'virtual' ? 'Virtual' : 'Presencial'}
        </span>
      </div>

      {/* Tutor */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
          background: 'var(--color-gray-900)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: '0.85rem',
        }}>
          {pool.tutor_nombre?.split(' ').map(n => n[0]).slice(0, 2).join('')}
        </div>
        <div>
          <p style={{ fontWeight: 600, color: 'var(--color-gray-800)', fontSize: '0.875rem' }}>
            {pool.tutor_nombre}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ color: 'var(--color-amber-500)', fontSize: '0.75rem' }}>★</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
              {pool.tutor_calificacion}
            </span>
          </div>
        </div>
      </div>

      {/* Date / time / location */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--color-gray-600)' }}>
          <span>📅</span>
          <span>{formatDate(fechaInicio)} · {formatTime(fechaInicio)} — {formatTime(fechaFin)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--color-gray-500)' }}>
          <span>{pool.formato === 'virtual' ? '💻' : '📍'}</span>
          <span>{pool.formato === 'virtual' ? 'Google Meet' : pool.ubicacion}</span>
        </div>
      </div>

      {/* Notes */}
      {pool.notas && (
        <p style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)', fontStyle: 'italic', lineHeight: 1.4 }}>
          "{pool.notas}"
        </p>
      )}

      {/* Capacity bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '5px' }}>
          <span style={{ color: almostFull ? 'var(--color-amber-600)' : 'var(--color-gray-500)' }}>
            {cuposDisponibles <= 0 ? 'Pool lleno' : almostFull ? `¡Solo ${cuposDisponibles} cupos!` : `${cuposDisponibles} cupos disponibles`}
          </span>
          <span style={{ color: 'var(--color-gray-400)', fontWeight: 600 }}>
            {pool.inscritos_actuales}/{pool.max_estudiantes}
          </span>
        </div>
        <div style={{ height: '5px', borderRadius: '3px', background: 'var(--color-gray-100)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${cuposPct}%`, borderRadius: '3px',
            background: almostFull ? 'var(--color-amber-500)' : 'var(--color-gray-900)',
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* Price + CTA */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: '10px', borderTop: '1px solid var(--color-gray-100)', marginTop: 'auto',
      }}>
        <div>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-gray-900)' }}>
            {formatPrice(pool.precio_grupal)}
          </p>
          <p style={{ fontSize: '0.72rem', color: 'var(--color-gray-400)', textDecoration: 'line-through' }}>
            {formatPrice(pool.precio_individual)} individual (COP)
          </p>
        </div>
        {cuposDisponibles > 0 ? (
          <Link to={`/unirse/${pool.id}`} className="btn btn-primary btn-sm" id={`join-pool-${pool.id}`}>
            Unirme
          </Link>
        ) : (
          <button className="btn btn-secondary btn-sm" disabled>Lleno</button>
        )}
      </div>
    </div>
  )
}
