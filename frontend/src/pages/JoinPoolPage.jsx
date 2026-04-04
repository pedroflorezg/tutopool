import { useParams, Link, useNavigate } from 'react-router-dom'
import { usePoolDetail } from '../hooks/usePools'
import { useState } from 'react'

export default function JoinPoolPage() {
  const { poolId } = useParams()
  const navigate = useNavigate()
  const { pool, loading } = usePoolDetail(poolId)
  const [confirming, setConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div className="skeleton" style={{ width: '100%', maxWidth: '500px', height: '400px', margin: '0 auto', borderRadius: 'var(--radius-card)' }} />
      </div>
    )
  }

  if (!pool) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-navy-400)' }}>Sesión no encontrada.</p>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: '16px' }}>Volver al inicio</Link>
      </div>
    )
  }

  const fechaInicio = new Date(pool.fecha_inicio)
  const fechaFin = new Date(pool.fecha_fin)

  const formatFullDate = (d) => d.toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const formatTime = (d) => d.toLocaleTimeString('es-CO', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
  const formatPrice = (price) => new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(price)

  const handleConfirm = async () => {
    setConfirming(true)
    // Simulate API call / Supabase insert
    await new Promise(r => setTimeout(r, 1500))
    setConfirmed(true)
    setConfirming(false)
  }

  if (confirmed) {
    return (
      <div className="container" style={{ padding: '60px 0', maxWidth: '500px', textAlign: 'center' }}>
        <div className="animate-fade-in-up glass-card-static" style={{ padding: '48px 32px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'white',
            marginBottom: '8px',
          }}>
            ¡Te has unido al grupo!
          </h1>
          <p style={{ color: 'var(--color-navy-300)', marginBottom: '24px' }}>
            Tu inscripción ha sido registrada. Recibirás una confirmación por email.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={`/materia/${pool.materia_id}`} className="btn btn-secondary">
              Ver más pools
            </Link>
            <Link to="/" className="btn btn-primary">
              Ir al inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const savings = pool.precio_individual - pool.precio_grupal
  const savingsPercent = Math.round((savings / pool.precio_individual) * 100)

  return (
    <div className="container" style={{ padding: '32px 0 60px', maxWidth: '560px' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none', border: 'none', color: 'var(--color-navy-400)',
          cursor: 'pointer', fontSize: '0.9rem', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}
      >
        ← Volver
      </button>

      <div className="animate-fade-in-up glass-card-static" style={{ padding: '32px', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>👥</div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.4rem',
            fontWeight: 700,
            color: 'white',
            marginBottom: '4px',
          }}>
            Confirmar Inscripción
          </h1>
          <p style={{ color: 'var(--color-navy-400)', fontSize: '0.9rem' }}>
            Revisa los detalles antes de unirte
          </p>
        </div>

        {/* Session details */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '16px',
          padding: '20px',
          background: 'rgba(16,42,67,0.3)',
          borderRadius: '12px',
          border: '1px solid rgba(159,179,200,0.06)',
          marginBottom: '24px',
        }}>
          <DetailRow label="Materia" value={pool.materia_nombre || 'Sesión'} icon="📚" />
          <DetailRow label="Tutor" value={pool.tutor_nombre} icon="🧑‍🏫" />
          <DetailRow label="Fecha" value={formatFullDate(fechaInicio)} icon="📅" />
          <DetailRow label="Horario" value={`${formatTime(fechaInicio)} — ${formatTime(fechaFin)}`} icon="🕐" />
          <DetailRow
            label="Ubicación"
            value={pool.formato === 'virtual' ? 'Google Meet (enlace por confirmar)' : pool.ubicacion}
            icon={pool.formato === 'virtual' ? '💻' : '📍'}
          />
          <DetailRow
            label="Cupos"
            value={`${pool.inscritos_actuales}/${pool.max_estudiantes} registrados`}
            icon="🪑"
          />
          {pool.notas && <DetailRow label="Tema" value={pool.notas} icon="📝" />}
        </div>

        {/* Pricing */}
        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(14,165,233,0.06))',
          borderRadius: '12px',
          border: '1px solid rgba(16,185,129,0.12)',
          marginBottom: '24px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-navy-400)', marginBottom: '4px' }}>
            Precio grupal
          </p>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--color-emerald-400)',
            marginBottom: '8px',
          }}>
            {formatPrice(pool.precio_grupal)}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.82rem', color: 'var(--color-navy-500)',
              textDecoration: 'line-through',
            }}>
              Individual: {formatPrice(pool.precio_individual)}
            </span>
            <span className="badge badge-green">
              🎉 Ahorras {savingsPercent}%
            </span>
          </div>
        </div>

        {/* Confirm button */}
        <button
          id="confirm-join-btn"
          onClick={handleConfirm}
          disabled={confirming}
          className="btn btn-primary btn-lg btn-full"
          style={{
            opacity: confirming ? 0.7 : 1,
            gap: '8px',
          }}
        >
          {confirming ? (
            <>
              <span style={{ animation: 'pulse-soft 1s infinite' }}>⏳</span>
              Procesando...
            </>
          ) : (
            <>✓ Confirmar y Pagar</>
          )}
        </button>

        <p style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--color-navy-500)',
          marginTop: '12px',
        }}>
          El pago se procesará de forma segura. Puedes cancelar hasta 12h antes.
        </p>
      </div>
    </div>
  )
}

function DetailRow({ label, value, icon }) {
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '1px' }}>{icon}</span>
      <div>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-navy-500)', marginBottom: '2px' }}>{label}</p>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-navy-200)', lineHeight: 1.4 }}>{value}</p>
      </div>
    </div>
  )
}
