import { useParams, Link, useNavigate } from 'react-router-dom'
import { usePoolDetail } from '../hooks/usePools'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function JoinPoolPage() {
  const { poolId } = useParams()
  const navigate = useNavigate()
  const { pool, loading } = usePoolDetail(poolId)
  const { user } = useAuth()
  const [confirming, setConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')

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
        <p style={{ color: 'var(--color-gray-500)' }}>Sesión no encontrada.</p>
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
    if (!user) {
      navigate('/login')
      return
    }
    setConfirming(true)
    setError('')
    const { error: err } = await supabase
      .from('inscripciones')
      .insert({
        sesion_id: pool.id,
        estudiante_id: user.id,
        precio_pagado: pool.precio_grupal,
      })
    setConfirming(false)
    if (err) {
      if (err.message?.includes('duplicate') || err.message?.includes('unique')) {
        setError('Ya estás inscrito en esta sesión.')
      } else if (err.code === '23503') {
        setError('Ocurrió un error al procesar tu inscripción. Por favor inicia sesión nuevamente.')
      } else {
        setError('Ocurrió un error al procesar tu inscripción. Intenta de nuevo.')
      }
    } else {
      setConfirmed(true)
    }
  }

  if (confirmed) {
    return (
      <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="animate-fade-in card-static" style={{ padding: '48px 32px', maxWidth: '440px', width: '100%', textAlign: 'center' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'var(--color-gray-100)', border: '2px solid var(--color-gray-200)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: '2rem',
          }}>🎉</div>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.4rem',
            fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '8px',
          }}>
            ¡Te has unido al grupo!
          </h1>
          <p style={{ color: 'var(--color-gray-600)', marginBottom: '6px' }}>
            Tu inscripción ha sido registrada.
          </p>
          <p style={{ color: 'var(--color-gray-400)', fontSize: '0.85rem', marginBottom: '28px' }}>
            Recibirás una confirmación con los detalles de la sesión.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
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

  const cuposLibres = pool.max_estudiantes - pool.inscritos_actuales

  return (
    <div style={{ background: 'var(--color-gray-50)', minHeight: 'calc(100vh - 60px)', padding: '32px 16px 64px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none', border: 'none',
            color: 'var(--color-gray-500)', cursor: 'pointer',
            fontSize: '0.875rem', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '6px', padding: 0,
          }}
        >
          ← Volver
        </button>

        <div className="animate-fade-in-up card-static" style={{ overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            padding: '28px 32px 24px',
            borderBottom: '1px solid var(--color-gray-100)',
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
              background: 'var(--color-gray-100)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.3rem',
            }}>👥</div>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-heading)', fontSize: '1.2rem',
                fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '2px',
              }}>
                Confirmar Inscripción
              </h1>
              <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>
                Revisa los detalles antes de unirte
              </p>
            </div>
          </div>

          {/* Session details */}
          <div style={{ padding: '24px 32px' }}>
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '14px',
              padding: '20px',
              background: 'var(--color-gray-50)',
              borderRadius: '10px',
              border: '1px solid var(--color-gray-100)',
              marginBottom: '20px',
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
                label="Cupos disponibles"
                value={`${cuposLibres} de ${pool.max_estudiantes} libres`}
                icon="🪑"
              />
              {pool.notas && <DetailRow label="Tema" value={pool.notas} icon="📝" />}
            </div>

            {/* Pricing */}
            <div style={{
              padding: '24px',
              background: 'var(--color-gray-900)',
              borderRadius: '10px',
              marginBottom: '20px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Precio con descuento grupal
              </p>
              <p style={{
                fontFamily: 'var(--font-heading)', fontSize: '2.4rem',
                fontWeight: 800, color: 'white', marginBottom: '10px',
                letterSpacing: '-0.03em',
              }}>
                {formatPrice(pool.precio_grupal)}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>
                  {formatPrice(pool.precio_individual)} sin descuento
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', padding: '3px 9px', borderRadius: '4px', letterSpacing: '0.03em' }}>
                  40% de descuento grupal
                </span>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '12px 14px', background: 'var(--color-red-50)',
                border: '1px solid #fecaca', borderRadius: '8px',
                color: 'var(--color-red-600)', fontSize: '0.875rem',
                marginBottom: '12px', lineHeight: 1.5,
              }}>{error}</div>
            )}

            {/* Confirm button */}
            <button
              id="confirm-join-btn"
              onClick={handleConfirm}
              disabled={confirming}
              className="btn btn-primary btn-lg btn-full"
            >
              {confirming ? '⏳ Procesando...' : user ? '✓ Confirmar Inscripción' : '→ Iniciar sesión para unirme'}
            </button>

            <p style={{
              textAlign: 'center', fontSize: '0.75rem',
              color: 'var(--color-gray-400)', marginTop: '12px',
            }}>
              Puedes cancelar tu inscripción hasta 12 horas antes de la sesión.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value, icon }) {
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '1px' }}>{icon}</span>
      <div>
        <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-gray-400)', marginBottom: '1px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-gray-700)', lineHeight: 1.4 }}>{value}</p>
      </div>
    </div>
  )
}
