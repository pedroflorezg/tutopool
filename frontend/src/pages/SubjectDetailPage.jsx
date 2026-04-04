import { useParams, Link, useNavigate } from 'react-router-dom'
import { usePools } from '../hooks/usePools'
import { isDemoMode, DEMO_MATERIAS } from '../lib/supabase'

export default function SubjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { pools, loading } = usePools(id)

  // Get subject info
  const materia = isDemoMode
    ? DEMO_MATERIAS.find(m => m.id === id)
    : null // In production, fetched from Supabase

  if (!materia && isDemoMode) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-navy-400)' }}>Materia no encontrada.</p>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: '16px' }}>Volver</Link>
      </div>
    )
  }

  const confirmedPools = pools.filter(p => p.estado === 'confirmada')
  const waitingPools = pools.filter(p => p.estado === 'esperando_cupos')
  const allPools = [...confirmedPools, ...waitingPools]

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Subject header */}
      <section style={{
        padding: '32px 0',
        borderBottom: '1px solid rgba(159,179,200,0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '-80px',
          right: '-80px',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(16,185,129,0.06), transparent)',
          pointerEvents: 'none',
        }} />
        <div className="container" style={{ position: 'relative' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-navy-400)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            ← Volver a materias
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-sky">{materia?.codigo}</span>
            <span className="badge badge-amber">Semestre {materia?.semestre}</span>
            <span className="badge badge-green">{materia?.creditos} créditos</span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 700,
            color: 'white',
            marginBottom: '8px',
          }}>
            {materia?.nombre}
          </h1>
          <p style={{
            color: 'var(--color-navy-400)',
            fontSize: '0.95rem',
            maxWidth: '600px',
          }}>
            {materia?.descripcion}
          </p>
        </div>
      </section>

      <div className="container" style={{ paddingTop: '32px' }}>
        {/* Pools section — shown first */}
        <section>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.2rem',
                fontWeight: 600,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{ fontSize: '1.3rem' }}>👥</span>
                Pools Abiertos (Grupal)
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-navy-500)', marginTop: '4px' }}>
                Únete a un grupo existente y ahorra
              </p>
            </div>
            <span className="badge badge-green">
              {allPools.length} disponible{allPools.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {[1,2,3].map(i => (
                <div key={i} className="skeleton" style={{ height: '260px', borderRadius: 'var(--radius-card)' }} />
              ))}
            </div>
          ) : allPools.length === 0 ? (
            <div className="glass-card-static" style={{
              padding: '40px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📭</div>
              <p style={{ color: 'var(--color-navy-300)', fontSize: '1rem', marginBottom: '4px' }}>
                No hay pools abiertos para esta materia esta semana.
              </p>
              <p style={{ color: 'var(--color-navy-500)', fontSize: '0.85rem' }}>
                ¡Sé el primero en solicitar una tutoría grupal!
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '16px',
            }}>
              {allPools.map((pool, i) => (
                <PoolCard key={pool.id} pool={pool} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Request new tutoring CTA */}
        <section style={{ marginTop: '40px' }}>
          <div className="glass-card-static" style={{
            padding: '32px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(14,165,233,0.06))',
            borderColor: 'rgba(16,185,129,0.15)',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>✨</div>
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.15rem',
              fontWeight: 600,
              color: 'white',
              marginBottom: '8px',
            }}>
              ¿No encuentras lo que buscas?
            </h3>
            <p style={{
              color: 'var(--color-navy-400)',
              fontSize: '0.9rem',
              marginBottom: '20px',
              maxWidth: '400px',
              margin: '0 auto 20px',
            }}>
              Solicita una tutoría personalizada — individual o grupal, presencial o virtual.
            </p>
            <Link
              to={`/solicitar/${id}`}
              id="request-tutoring-btn"
              className="btn btn-primary btn-lg"
            >
              📝 Solicitar Nueva Tutoría
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

function PoolCard({ pool, index }) {
  const fechaInicio = new Date(pool.fecha_inicio)
  const fechaFin = new Date(pool.fecha_fin)

  const formatDate = (d) => d.toLocaleDateString('es-CO', {
    weekday: 'short', day: 'numeric', month: 'short'
  })
  const formatTime = (d) => d.toLocaleTimeString('es-CO', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })

  const cuposDisponibles = pool.max_estudiantes - pool.inscritos_actuales
  const cuposPercent = (pool.inscritos_actuales / pool.max_estudiantes) * 100
  const isAlmostFull = cuposDisponibles <= 2

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div
      className={`glass-card animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
      id={`pool-card-${pool.id}`}
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Status + format badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span className={pool.estado === 'confirmada' ? 'badge badge-green' : 'badge badge-amber'}>
            {pool.estado === 'confirmada' ? '✓ Confirmada' : '⏳ Esperando cupos'}
          </span>
          <span className="badge badge-sky">
            {pool.formato === 'virtual' ? '💻 Virtual' : '📍 Presencial'}
          </span>
        </div>
      </div>

      {/* Tutor info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '44px', height: '44px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--color-emerald-600), var(--color-sky-600))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: '1rem',
          flexShrink: 0,
        }}>
          {pool.tutor_nombre?.split(' ').map(n => n[0]).slice(0, 2).join('')}
        </div>
        <div>
          <p style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>
            {pool.tutor_nombre}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#fbbf24', fontSize: '0.8rem' }}>★</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-navy-300)' }}>
              {pool.tutor_calificacion}
            </span>
          </div>
        </div>
      </div>

      {/* Date & time */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '0.85rem', color: 'var(--color-navy-300)',
        }}>
          <span>📅</span> {formatDate(fechaInicio)}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '0.85rem', color: 'var(--color-navy-300)',
        }}>
          <span>🕐</span> {formatTime(fechaInicio)} — {formatTime(fechaFin)}
        </div>
      </div>

      {/* Location */}
      <div style={{
        fontSize: '0.85rem', color: 'var(--color-navy-400)',
        display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        {pool.formato === 'virtual' ? (
          <>💻 <span>Google Meet</span></>
        ) : (
          <>📍 <span>{pool.ubicacion}</span></>
        )}
      </div>

      {/* Notes */}
      {pool.notas && (
        <p style={{
          fontSize: '0.82rem',
          color: 'var(--color-navy-400)',
          fontStyle: 'italic',
          lineHeight: 1.4,
        }}>
          "{pool.notas}"
        </p>
      )}

      {/* Capacity bar */}
      <div>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: '0.78rem', marginBottom: '6px',
        }}>
          <span style={{ color: isAlmostFull ? 'var(--color-amber-400)' : 'var(--color-navy-400)' }}>
            {cuposDisponibles <= 0 ? '🚫 Pool Lleno' : isAlmostFull ? '🔥 Casi lleno' : `${cuposDisponibles} cupos disponibles`}
          </span>
          <span style={{ color: 'var(--color-navy-500)', fontWeight: 600 }}>
            {pool.inscritos_actuales}/5 (Max)
          </span>
        </div>
        <div style={{
          height: '6px',
          borderRadius: '3px',
          background: 'rgba(98,125,152,0.15)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${cuposPercent}%`,
            borderRadius: '3px',
            background: isAlmostFull
              ? 'linear-gradient(90deg, var(--color-amber-500), var(--color-amber-400))'
              : 'linear-gradient(90deg, var(--color-emerald-600), var(--color-emerald-400))',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Price + CTA */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '8px',
        borderTop: '1px solid rgba(159,179,200,0.08)',
        marginTop: 'auto',
      }}>
        <div>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.2rem',
            fontWeight: 700,
            color: 'var(--color-emerald-400)',
          }}>
            {formatPrice(pool.precio_grupal)}
          </p>
          <p style={{
            fontSize: '0.72rem',
            color: 'var(--color-navy-500)',
            textDecoration: 'line-through',
          }}>
            Individual: {formatPrice(pool.precio_individual)}
          </p>
        </div>
        {cuposDisponibles > 0 ? (
          <Link
            to={`/unirse/${pool.id}`}
            className="btn btn-primary btn-sm"
            id={`join-pool-${pool.id}`}
          >
            Unirme al grupo
          </Link>
        ) : (
          <button
            className="btn btn-secondary btn-sm"
            disabled
            style={{ opacity: 0.6, cursor: 'not-allowed' }}
          >
            Grupo Lleno
          </button>
        )}
      </div>
    </div>
  )
}
