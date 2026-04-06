import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [inscripciones, setInscripciones] = useState([])
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pools')

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login'); return }

    const load = async () => {
      setLoading(true)
      // Pools (inscripciones)
      const { data: ins } = await supabase
        .from('inscripciones')
        .select(`
          id, estado_pago, precio_pagado, created_at,
          sesiones(
            id, fecha_inicio, fecha_fin, formato, estado, ubicacion, enlace_virtual,
            materias(nombre, codigo),
            tutores(nombre)
          )
        `)
        .eq('estudiante_id', user.id)
        .order('created_at', { ascending: false })

      // Solicitudes individuales
      const { data: sol } = await supabase
        .from('solicitudes_tutoria')
        .select(`
          id, estado, tipo, formato, fecha_preferida, hora_preferida, notas, created_at,
          materias(nombre, codigo)
        `)
        .eq('estudiante_id', user.id)
        .order('created_at', { ascending: false })

      setInscripciones(ins || [])
      setSolicitudes(sol || [])
      setLoading(false)
    }
    load()
  }, [user, authLoading, navigate])

  const formatDateTime = (d) => new Date(d).toLocaleString('es-CO', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
  const formatDate = (d) => new Date(d).toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  const formatPrice = (p) => new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(p)

  const estadoBadge = (estado) => {
    const map = {
      confirmada: { bg: '#dcfce7', color: '#166534', label: 'Confirmada' },
      esperando_cupos: { bg: '#fef9c3', color: '#854d0e', label: 'En espera' },
      cancelada: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelada' },
      completada: { bg: '#f0f9ff', color: '#0c4a6e', label: 'Completada' },
      pendiente: { bg: '#fef9c3', color: '#854d0e', label: 'Pendiente' },
      notificacion_enviada: { bg: '#ede9fe', color: '#4c1d95', label: 'Notificada' },
      rechazada: { bg: '#fee2e2', color: '#991b1b', label: 'Rechazada' },
    }
    const s = map[estado] || { bg: 'var(--color-gray-100)', color: 'var(--color-gray-600)', label: estado }
    return (
      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 700, background: s.bg, color: s.color }}>
        {s.label}
      </span>
    )
  }

  if (loading || authLoading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '600px', margin: '0 auto', padding: '0 16px' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-card)' }} />)}
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--color-gray-50)', minHeight: 'calc(100vh - 60px)', paddingBottom: '64px' }}>
      {/* Header */}
      <div style={{ background: 'var(--color-gray-900)', padding: '40px 0 60px' }}>
        <div className="container">
          <p style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>
            Mi espacio
          </p>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', marginBottom: '4px' }}>
            Mis Tutorías
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
            Aquí puedes ver tus pools activos y solicitudes enviadas.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap' }}>
            {[
              { label: 'Pools activos', value: inscripciones.filter(i => i.sesiones?.estado !== 'cancelada' && i.sesiones?.estado !== 'completada').length },
              { label: 'Solicitudes', value: solicitudes.length },
              { label: 'Completadas', value: inscripciones.filter(i => i.sesiones?.estado === 'completada').length },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 20px' }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-32px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'white', padding: '5px', borderRadius: '10px', border: '1px solid var(--color-gray-200)', width: 'fit-content', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {[{ id: 'pools', label: '👥 Mis Pools', count: inscripciones.length },
            { id: 'solicitudes', label: '📬 Solicitudes', count: solicitudes.length }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '8px 18px', borderRadius: '7px', border: 'none', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: 600,
              background: activeTab === tab.id ? 'var(--color-gray-900)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--color-gray-500)',
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              {tab.label}
              <span style={{ fontSize: '0.72rem', background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'var(--color-gray-100)', color: activeTab === tab.id ? 'white' : 'var(--color-gray-500)', padding: '1px 6px', borderRadius: '100px' }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Pools tab */}
        {activeTab === 'pools' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {inscripciones.length === 0 ? (
              <EmptyState icon="👥" title="No estás inscrito en ningún pool" subtitle="Busca una materia y únete a un grupo de estudio con 40% de descuento." cta={{ to: '/', label: 'Explorar materias' }} />
            ) : (
              inscripciones.map(ins => {
                const s = ins.sesiones
                if (!s) return null
                return (
                  <div key={ins.id} className="card-static" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        {estadoBadge(s.estado)}
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-gray-400)' }}>{s.formato}</span>
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '4px' }}>
                        {s.materias?.nombre || 'Sesión'}
                      </h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--color-gray-500)' }}>
                        📅 {formatDateTime(s.fecha_inicio)}<br />
                        🧑‍🏫 {s.tutores?.nombre || 'Tutor por confirmar'}<br />
                        📍 {s.formato === 'virtual' ? 'Google Meet' : (s.ubicacion || 'Por confirmar')}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {ins.precio_pagado && <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '4px' }}>{formatPrice(ins.precio_pagado)}</p>}
                      <span style={{ fontSize: '0.72rem', color: ins.estado_pago === 'pagado' ? '#166534' : 'var(--color-amber-600)', background: ins.estado_pago === 'pagado' ? '#dcfce7' : '#fef9c3', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                        {ins.estado_pago === 'pagado' ? '✓ Pagado' : '⏳ Pago pendiente'}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Solicitudes tab */}
        {activeTab === 'solicitudes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {solicitudes.length === 0 ? (
              <EmptyState icon="📬" title="No tienes solicitudes enviadas" subtitle="Solicita una tutoría personalizada desde la página de cualquier materia." cta={{ to: '/', label: 'Explorar materias' }} />
            ) : (
              solicitudes.map(sol => (
                <div key={sol.id} className="card-static" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      {estadoBadge(sol.estado)}
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-gray-400)' }}>{sol.tipo} · {sol.formato}</span>
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '4px' }}>
                      {sol.materias?.nombre} <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--color-gray-400)' }}>{sol.materias?.codigo}</span>
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-gray-500)' }}>
                      📅 {formatDate(sol.fecha_preferida)} · {sol.hora_preferida?.slice(0,5)}
                    </p>
                    {sol.notas && <p style={{ fontSize: '0.78rem', color: 'var(--color-gray-400)', marginTop: '4px', fontStyle: 'italic' }}>"{sol.notas}"</p>}
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-gray-400)' }}>
                    Enviada el {new Date(sol.created_at).toLocaleDateString('es-CO')}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ icon, title, subtitle, cta }) {
  return (
    <div className="card-static" style={{ padding: '48px', textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-gray-800)', marginBottom: '8px' }}>{title}</h3>
      <p style={{ color: 'var(--color-gray-500)', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '360px', margin: '0 auto 24px' }}>{subtitle}</p>
      <Link to={cta.to} className="btn btn-primary">{cta.label}</Link>
    </div>
  )
}
