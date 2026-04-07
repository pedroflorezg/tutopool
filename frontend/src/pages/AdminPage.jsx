import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const ADMIN_EMAIL = 'pedro.florez.g@gmail.com'

const DIAS = ['lunes','martes','miércoles','jueves','viernes','sábado']
const DIAS_LABEL = { lunes:'Lun', martes:'Mar', 'miércoles':'Mié', jueves:'Jue', viernes:'Vie', sábado:'Sáb' }

const TIME_OPTIONS = []
for (let h = 6; h <= 21; h++) {
  for (const m of [0, 15, 30, 45]) {
    TIME_OPTIONS.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)
  }
}

const EMPTY_FRANJA = { inicio: '08:00', fin: '18:00' }

const EMPTY_CLASE = {
  materia_id: '', tutor_id: '', tipo: 'grupal', formato: 'virtual',
  fecha_inicio: '', fecha_fin: '', ubicacion: '', enlace_virtual: '',
  precio_individual: 40000, min_estudiantes: 2, max_estudiantes: 6,
  notas: '', estado: 'esperando_cupos',
}

const EMPTY_PROGRAMA = { nombre: '', facultad: '' }
const EMPTY_DISP = Object.fromEntries(DIAS.map(d => [d, { activo: false, franjas: [{ ...EMPTY_FRANJA }] }]))

const EMPTY_TUTOR = {
  nombre: '', email: '', telefono: '', bio: '',
  precio_base_presencial: 30000, precio_base_virtual: 22000,
  activo: true,
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('tutores')
  useEffect(() => {
    if (!authLoading && (!user || user.email !== ADMIN_EMAIL)) navigate('/')
  }, [user, authLoading, navigate])

  if (authLoading || !user || user.email !== ADMIN_EMAIL) {
    return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-gray-400)' }}>Verificando acceso…</div>
  }

  return (
    <div style={{ background: 'var(--color-gray-50)', minHeight: 'calc(100vh - 60px)' }}>
      <div style={{ background: 'white', borderBottom: '1px solid var(--color-gray-200)', padding: '20px 0' }}>
        <div className="container">
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-gray-900)' }}>
              Panel de Administración
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-gray-400)', marginTop: '2px' }}>TutoPool · {ADMIN_EMAIL}</p>
          </div>
          <div style={{ display: 'flex', gap: '4px', marginTop: '20px', flexWrap: 'wrap' }}>
            {[
              { key:'tutores', label:'Tutores' },
              { key:'clases', label:'Clases' },
              { key:'materias', label:'Materias' },
              { key:'programas', label:'Programas' },
              { key:'notificaciones', label:'🔔 Notificaciones' },
              { key:'solicitudes', label:'Solicitudes' },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding: '8px 18px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.85rem',
                background: tab === t.key ? 'var(--color-gray-900)' : 'transparent',
                color: tab === t.key ? 'white' : 'var(--color-gray-500)',
                transition: 'all 0.15s',
              }}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '28px', paddingBottom: '64px' }}>
        {debugInfo && (
          <div style={{ marginBottom: '16px', padding: '12px 16px', background: debugInfo.error ? '#fef2f2' : '#f0fdf4', border: `1px solid ${debugInfo.error ? '#fca5a5' : '#86efac'}`, borderRadius: '8px', fontSize: '0.78rem', fontFamily: 'monospace' }}>
            <strong>Debug:</strong> URL={debugInfo.url} | user={debugInfo.userEmail} | data={debugInfo.data} | error={debugInfo.error}
          </div>
        )}
        <StatsRow />
        {tab === 'tutores'        && <TutoresTab />}
        {tab === 'clases'         && <ClasesTab />}
        {tab === 'materias'       && <MateriasTab />}
        {tab === 'programas'      && <ProgramasTab />}
        {tab === 'notificaciones' && <NotificacionesTab />}
        {tab === 'solicitudes'    && <SolicitudesTab />}
      </div>
    </div>
  )
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function StatsRow() {
  const [stats, setStats] = useState({ tutores: 0, materias: 0, sesiones: 0, solicitudes: 0 })
  useEffect(() => {
    Promise.all([
      supabase.from('tutores').select('count', { count: 'exact', head: true }),
      supabase.from('materias').select('count', { count: 'exact', head: true }),
      supabase.from('sesiones').select('count', { count: 'exact', head: true }).in('estado', ['esperando_cupos','confirmada']),
      supabase.from('solicitudes_tutoria').select('count', { count: 'exact', head: true }).eq('estado','pendiente'),
    ]).then(([t, m, s, sol]) => setStats({ tutores: t.count||0, materias: m.count||0, sesiones: s.count||0, solicitudes: sol.count||0 }))
  }, [])
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '28px' }}>
      {[
        { label:'Tutores',          value: stats.tutores,    color:'var(--color-brand-600)' },
        { label:'Materias',         value: stats.materias,   color:'var(--color-blue-600)' },
        { label:'Sesiones activas', value: stats.sesiones,   color:'var(--color-amber-600)' },
        { label:'Solicitudes',      value: stats.solicitudes,color:'var(--color-red-600)' },
      ].map(item => (
        <div key={item.label} className="card-static" style={{ padding: '18px 20px' }}>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: item.color }}>{item.value}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)', marginTop: '2px' }}>{item.label}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Tutores Tab ──────────────────────────────────────────────────────────────
function TutoresTab() {
  const [tutores, setTutores]     = useState([])
  const [allMaterias, setAllMaterias] = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(EMPTY_TUTOR)
  const [selectedMaterias, setSelectedMaterias] = useState([])  // array of materia ids
  const [disponibilidad, setDisponibilidad] = useState(EMPTY_DISP)
  const [saving, setSaving]       = useState(false)
  const [msg, setMsg]             = useState('')
  const [searchMateria, setSearchMateria] = useState('')

  const fetchTutores = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('tutores').select('*').order('nombre')
    setTutores(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchTutores() }, [fetchTutores])

  useEffect(() => {
    supabase.from('materias').select('id, nombre, codigo').order('nombre')
      .then(({ data }) => setAllMaterias(data || []))
  }, [])

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_TUTOR)
    setSelectedMaterias([])
    setDisponibilidad(EMPTY_DISP)
    setSearchMateria('')
    setShowForm(true)
  }

  const openEdit = async (t) => {
    setEditing(t)
    setForm({
      nombre: t.nombre, email: t.email, telefono: t.telefono || '',
      bio: t.bio || '', precio_base_presencial: t.precio_base_presencial,
      precio_base_virtual: t.precio_base_virtual, activo: t.activo,
    })
    // Load their materias
    const { data: tm } = await supabase.from('tutor_materias').select('materia_id').eq('tutor_id', t.id)
    setSelectedMaterias((tm || []).map(r => r.materia_id))
    // Load disponibilidad — group multiple slots per day
    const disp = Object.fromEntries(DIAS.map(d => [d, { activo: false, franjas: [{ ...EMPTY_FRANJA }] }]))
    if (t.disponibilidad && Array.isArray(t.disponibilidad)) {
      const byDay = {}
      t.disponibilidad.forEach(slot => {
        if (!byDay[slot.dia]) byDay[slot.dia] = []
        byDay[slot.dia].push({ inicio: slot.hora_inicio, fin: slot.hora_fin })
      })
      Object.entries(byDay).forEach(([dia, franjas]) => {
        if (disp[dia]) disp[dia] = { activo: true, franjas }
      })
    }
    setDisponibilidad(disp)
    setSearchMateria('')
    setShowForm(true)
  }

  const closeForm = () => { setShowForm(false); setEditing(null); setMsg('') }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setMsg('')

    // Build disponibilidad json — one entry per franja per day
    const dispJson = DIAS
      .filter(d => disponibilidad[d].activo)
      .flatMap(d => disponibilidad[d].franjas.map(f => ({ dia: d, hora_inicio: f.inicio, hora_fin: f.fin })))

    const payload = {
      ...form,
      precio_base_presencial: Number(form.precio_base_presencial),
      precio_base_virtual: Number(form.precio_base_virtual),
      disponibilidad: dispJson,
    }

    let tutorId = editing?.id
    let err

    if (editing) {
      ;({ error: err } = await supabase.from('tutores').update(payload).eq('id', editing.id))
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from('tutores').insert({ ...payload, calificacion: 5.0, total_sesiones: 0 }).select('id').single()
      err = insertErr
      tutorId = inserted?.id
    }

    if (!err && tutorId) {
      // Sync tutor_materias: delete all then re-insert
      await supabase.from('tutor_materias').delete().eq('tutor_id', tutorId)
      if (selectedMaterias.length > 0) {
        await supabase.from('tutor_materias').insert(
          selectedMaterias.map(mid => ({ tutor_id: tutorId, materia_id: mid }))
        )
      }
    }

    setSaving(false)
    if (err) {
      setMsg('Error: ' + err.message)
    } else {
      setMsg(editing ? 'Tutor actualizado.' : 'Tutor agregado.')
      await fetchTutores()
      setTimeout(closeForm, 1000)
    }
  }

  const toggleActivo = async (t) => {
    await supabase.from('tutores').update({ activo: !t.activo }).eq('id', t.id)
    fetchTutores()
  }

  const handleDelete = async (t) => {
    if (!window.confirm(`¿Eliminar a ${t.nombre}? Esta acción no se puede deshacer.`)) return
    await supabase.from('tutores').delete().eq('id', t.id)
    fetchTutores()
  }

  const u = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const toggleMateria = (id) => setSelectedMaterias(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  )

  const setDispField = (dia, field, val) =>
    setDisponibilidad(p => ({ ...p, [dia]: { ...p[dia], [field]: val } }))

  const setFranja = (dia, idx, field, val) =>
    setDisponibilidad(p => {
      const franjas = p[dia].franjas.map((f, i) => i === idx ? { ...f, [field]: val } : f)
      return { ...p, [dia]: { ...p[dia], franjas } }
    })

  const addFranja = (dia) =>
    setDisponibilidad(p => ({
      ...p, [dia]: { ...p[dia], franjas: [...p[dia].franjas, { ...EMPTY_FRANJA }] }
    }))

  const removeFranja = (dia, idx) =>
    setDisponibilidad(p => ({
      ...p, [dia]: { ...p[dia], franjas: p[dia].franjas.filter((_, i) => i !== idx) }
    }))

  const filteredMaterias = allMaterias.filter(m =>
    m.nombre.toLowerCase().includes(searchMateria.toLowerCase()) ||
    m.codigo.toLowerCase().includes(searchMateria.toLowerCase())
  )

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
        <h2 style={{ fontFamily:'var(--font-heading)', fontSize:'1rem', fontWeight:700, color:'var(--color-gray-900)' }}>
          Tutores ({tutores.length})
        </h2>
        <button onClick={openAdd} className="btn btn-primary btn-sm">+ Agregar tutor</button>
      </div>

      {/* ── Modal Form ── */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
          <div className="card-static" style={{ padding:'28px', width:'100%', maxWidth:'600px', maxHeight:'92vh', overflowY:'auto' }}>
            <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:700, marginBottom:'20px', color:'var(--color-gray-900)' }}>
              {editing ? 'Editar tutor' : 'Agregar tutor'}
            </h3>

            <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

              {/* Datos básicos */}
              <Section title="Datos básicos">
                {[
                  { label:'Nombre completo', key:'nombre', type:'text', required:true },
                  { label:'Email', key:'email', type:'email', required:true },
                  { label:'Teléfono (WhatsApp)', key:'telefono', type:'text', placeholder:'573001234567' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="input-label">{f.label}</label>
                    <input type={f.type} value={form[f.key]} onChange={e => u(f.key, e.target.value)}
                      className="input-field" placeholder={f.placeholder||''} required={!!f.required} />
                  </div>
                ))}
                <div>
                  <label className="input-label">Bio</label>
                  <textarea value={form.bio} onChange={e => u('bio', e.target.value)}
                    className="input-field" rows={3} style={{ resize:'vertical' }} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div>
                    <label className="input-label">Precio base presencial (COP)</label>
                    <input type="number" value={form.precio_base_presencial} onChange={e => u('precio_base_presencial', e.target.value)}
                      className="input-field" min={0} step={1000} required />
                  </div>
                  <div>
                    <label className="input-label">Precio base virtual (COP)</label>
                    <input type="number" value={form.precio_base_virtual} onChange={e => u('precio_base_virtual', e.target.value)}
                      className="input-field" min={0} step={1000} required />
                  </div>
                </div>
                <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'0.875rem', color:'var(--color-gray-700)' }}>
                  <input type="checkbox" checked={form.activo} onChange={e => u('activo', e.target.checked)} />
                  Tutor activo (visible públicamente)
                </label>
              </Section>

              {/* Materias */}
              <Section title={`Materias que dicta (${selectedMaterias.length} seleccionadas)`}>
                <input
                  type="text"
                  value={searchMateria}
                  onChange={e => setSearchMateria(e.target.value)}
                  className="input-field"
                  placeholder="Buscar materia…"
                  style={{ marginBottom: '8px' }}
                />
                <div style={{
                  maxHeight: '200px', overflowY: 'auto', border: '1.5px solid var(--color-gray-200)',
                  borderRadius: '8px', padding: '8px',
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px'
                }}>
                  {filteredMaterias.length === 0 && (
                    <p style={{ fontSize:'0.8rem', color:'var(--color-gray-400)', gridColumn:'1/-1', textAlign:'center', padding:'12px' }}>Sin resultados</p>
                  )}
                  {filteredMaterias.map(m => (
                    <label key={m.id} style={{
                      display:'flex', alignItems:'flex-start', gap:'7px', cursor:'pointer',
                      padding:'5px 8px', borderRadius:'6px', fontSize:'0.8rem',
                      background: selectedMaterias.includes(m.id) ? 'var(--color-brand-50)' : 'transparent',
                      color: selectedMaterias.includes(m.id) ? 'var(--color-brand-700)' : 'var(--color-gray-700)',
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedMaterias.includes(m.id)}
                        onChange={() => toggleMateria(m.id)}
                        style={{ marginTop:'2px', flexShrink:0 }}
                      />
                      <span>
                        <span style={{ fontWeight:600 }}>{m.codigo}</span>
                        <br /><span style={{ color:'var(--color-gray-500)', fontSize:'0.75rem' }}>{m.nombre}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </Section>

              {/* Disponibilidad */}
              <Section title="Disponibilidad semanal">
                <p style={{ fontSize:'0.78rem', color:'var(--color-gray-400)', marginBottom:'10px' }}>
                  Marca los días disponibles y agrega una o varias franjas horarias por día.
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {DIAS.map(dia => {
                    const { activo, franjas } = disponibilidad[dia]
                    return (
                      <div key={dia} style={{
                        padding:'10px 12px', borderRadius:'8px',
                        background: activo ? 'var(--color-brand-50)' : 'var(--color-gray-50)',
                        border: `1.5px solid ${activo ? 'var(--color-brand-200)' : 'var(--color-gray-200)'}`,
                      }}>
                        {/* Day toggle row */}
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                          <label style={{ display:'flex', alignItems:'center', gap:'7px', cursor:'pointer' }}>
                            <input
                              type="checkbox"
                              checked={activo}
                              onChange={e => setDispField(dia, 'activo', e.target.checked)}
                            />
                            <span style={{ fontSize:'0.85rem', fontWeight:700, color: activo ? 'var(--color-brand-700)' : 'var(--color-gray-500)' }}>
                              {DIAS_LABEL[dia]}
                            </span>
                          </label>
                          {activo && (
                            <button type="button" onClick={() => addFranja(dia)} style={{
                              fontSize:'0.75rem', color:'var(--color-brand-600)', background:'none',
                              border:'1px solid var(--color-brand-300)', borderRadius:'5px',
                              padding:'2px 8px', cursor:'pointer', fontWeight:600,
                            }}>+ franja</button>
                          )}
                          {!activo && (
                            <span style={{ fontSize:'0.78rem', color:'var(--color-gray-400)' }}>No disponible</span>
                          )}
                        </div>

                        {/* Franjas */}
                        {activo && (
                          <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginTop:'8px' }}>
                            {franjas.map((f, idx) => (
                              <div key={idx} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                                <select
                                  value={f.inicio}
                                  onChange={e => setFranja(dia, idx, 'inicio', e.target.value)}
                                  className="input-field"
                                  style={{ padding:'4px 8px', fontSize:'0.82rem', width:'90px' }}
                                >
                                  {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <span style={{ fontSize:'0.8rem', color:'var(--color-gray-400)' }}>–</span>
                                <select
                                  value={f.fin}
                                  onChange={e => setFranja(dia, idx, 'fin', e.target.value)}
                                  className="input-field"
                                  style={{ padding:'4px 8px', fontSize:'0.82rem', width:'90px' }}
                                >
                                  {TIME_OPTIONS.filter(t => t > f.inicio).map(t => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                                {franjas.length > 1 && (
                                  <button type="button" onClick={() => removeFranja(dia, idx)} style={{
                                    background:'none', border:'none', cursor:'pointer',
                                    color:'var(--color-red-600)', fontSize:'1rem', lineHeight:1, padding:'0 4px',
                                  }}>×</button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Section>

              {msg && <p style={{ fontSize:'0.85rem', color: msg.startsWith('Error') ? 'var(--color-red-600)' : 'var(--color-brand-600)' }}>{msg}</p>}

              <div style={{ display:'flex', gap:'10px' }}>
                <button type="button" onClick={closeForm} className="btn btn-secondary" style={{ flex:1 }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex:1 }} disabled={saving}>
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      {loading ? (
        <div className="skeleton" style={{ height:'200px', borderRadius:'var(--radius-card)' }} />
      ) : (
        <div className="card-static" style={{ overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--color-gray-200)', background:'var(--color-gray-50)' }}>
                {['Nombre','Email','Materias','Disponibilidad','Calificación','Estado','Acciones'].map(h => (
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:'0.75rem', fontWeight:700, color:'var(--color-gray-500)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tutores.map((t, i) => (
                <TutorRow key={t.id} tutor={t} isLast={i === tutores.length - 1}
                  onEdit={() => openEdit(t)}
                  onToggle={() => toggleActivo(t)}
                  onDelete={() => handleDelete(t)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function TutorRow({ tutor: t, isLast, onEdit, onToggle, onDelete }) {
  const [materias, setMaterias] = useState([])
  useEffect(() => {
    supabase.from('tutor_materias').select('materias(codigo)').eq('tutor_id', t.id)
      .then(({ data }) => setMaterias((data || []).map(r => r.materias?.codigo).filter(Boolean)))
  }, [t.id])

  const dispDays = Array.isArray(t.disponibilidad)
    ? t.disponibilidad.map(s => DIAS_LABEL[s.dia] || s.dia).join(', ')
    : '—'

  return (
    <tr style={{ borderBottom: isLast ? 'none' : '1px solid var(--color-gray-100)' }}>
      <td style={{ padding:'12px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'34px', height:'34px', borderRadius:'8px', background:'var(--color-brand-600)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'0.75rem', flexShrink:0 }}>
            {t.nombre.split(' ').map(n => n[0]).slice(0,2).join('')}
          </div>
          <span style={{ fontWeight:600, fontSize:'0.875rem', color:'var(--color-gray-800)' }}>{t.nombre}</span>
        </div>
      </td>
      <td style={{ padding:'12px 16px', fontSize:'0.82rem', color:'var(--color-gray-500)' }}>{t.email}</td>
      <td style={{ padding:'12px 16px' }}>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'4px', maxWidth:'180px' }}>
          {materias.length === 0
            ? <span style={{ fontSize:'0.75rem', color:'var(--color-gray-400)' }}>Sin asignar</span>
            : materias.slice(0,4).map(c => (
                <span key={c} style={{ fontSize:'0.7rem', background:'var(--color-gray-100)', color:'var(--color-gray-600)', padding:'2px 6px', borderRadius:'4px', fontWeight:600 }}>{c}</span>
              ))
          }
          {materias.length > 4 && <span style={{ fontSize:'0.7rem', color:'var(--color-gray-400)' }}>+{materias.length - 4}</span>}
        </div>
      </td>
      <td style={{ padding:'12px 16px', fontSize:'0.78rem', color:'var(--color-gray-500)' }}>
        {dispDays || <span style={{ color:'var(--color-gray-300)' }}>—</span>}
      </td>
      <td style={{ padding:'12px 16px', fontSize:'0.875rem', color:'var(--color-amber-600)', fontWeight:700 }}>★ {t.calificacion}</td>
      <td style={{ padding:'12px 16px' }}>
        <span className={t.activo ? 'badge badge-green' : 'badge badge-gray'}>{t.activo ? 'Activo' : 'Inactivo'}</span>
      </td>
      <td style={{ padding:'12px 16px' }}>
        <div style={{ display:'flex', gap:'6px' }}>
          <button onClick={onEdit} className="btn btn-secondary btn-sm">Editar</button>
          <button onClick={onToggle} className="btn btn-secondary btn-sm" style={{ color: t.activo ? 'var(--color-amber-600)' : 'var(--color-brand-600)' }}>
            {t.activo ? 'Desactivar' : 'Activar'}
          </button>
          <button onClick={onDelete} className="btn btn-secondary btn-sm" style={{ color:'var(--color-red-600)' }}>Eliminar</button>
        </div>
      </td>
    </tr>
  )
}

// Reusable section wrapper
function Section({ title, children }) {
  return (
    <div>
      <p style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--color-gray-500)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>{title}</p>
      <div style={{ display:'flex', flexDirection:'column', gap:'10px', padding:'14px', background:'var(--color-gray-50)', borderRadius:'8px', border:'1px solid var(--color-gray-200)' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Clases Tab (CRUD completo) ───────────────────────────────────────────────
function ClasesTab() {
  const [sesiones, setSesiones]   = useState([])
  const [tutores, setTutores]     = useState([])
  const [materias, setMaterias]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(EMPTY_CLASE)
  const [saving, setSaving]       = useState(false)
  const [msg, setMsg]             = useState('')

  const fetchSesiones = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('sesiones')
      .select('*, materias(nombre, codigo), tutores(nombre)')
      .order('fecha_inicio', { ascending: false })
    setSesiones(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchSesiones() }, [fetchSesiones])

  useEffect(() => {
    supabase.from('tutores').select('id, nombre').eq('activo', true).order('nombre')
      .then(({ data }) => setTutores(data || []))
    supabase.from('materias').select('id, nombre, codigo').order('nombre')
      .then(({ data }) => setMaterias(data || []))
  }, [])

  const toLocalInput = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  }

  const openAdd = () => { setEditing(null); setForm(EMPTY_CLASE); setMsg(''); setShowForm(true) }

  const openEdit = (s) => {
    setEditing(s)
    setForm({
      materia_id: s.materia_id || '',
      tutor_id: s.tutor_id || '',
      tipo: s.tipo || 'grupal',
      formato: s.formato || 'virtual',
      fecha_inicio: toLocalInput(s.fecha_inicio),
      fecha_fin: toLocalInput(s.fecha_fin),
      ubicacion: s.ubicacion || '',
      enlace_virtual: s.enlace_virtual || '',
      precio_individual: s.precio_individual || 40000,
      min_estudiantes: s.min_estudiantes || 2,
      max_estudiantes: s.max_estudiantes || 6,
      notas: s.notas || '',
      estado: s.estado || 'esperando_cupos',
    })
    setMsg(''); setShowForm(true)
  }

  const closeForm = () => { setShowForm(false); setEditing(null); setMsg('') }
  const u = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setMsg('')
    const payload = {
      ...form,
      precio_individual: Number(form.precio_individual),
      min_estudiantes: Number(form.min_estudiantes),
      max_estudiantes: Number(form.max_estudiantes),
    }
    let err
    if (editing) {
      ;({ error: err } = await supabase.from('sesiones').update(payload).eq('id', editing.id))
    } else {
      ;({ error: err } = await supabase.from('sesiones').insert(payload))
    }
    setSaving(false)
    if (err) { setMsg('Error: ' + err.message) }
    else { setMsg(editing ? 'Clase actualizada.' : 'Clase creada.'); await fetchSesiones(); setTimeout(closeForm, 800) }
  }

  const handleDelete = async (s) => {
    if (!window.confirm(`¿Eliminar esta clase de ${s.materias?.nombre || 'la materia'}? Esta acción no se puede deshacer.`)) return
    await supabase.from('sesiones').delete().eq('id', s.id)
    fetchSesiones()
  }

  const fmtDate  = (iso) => new Date(iso).toLocaleDateString('es-CO', { weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })
  const fmtPrice = (p)   => new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', minimumFractionDigits:0 }).format(p)

  const estadoBadge = (e) => e === 'confirmada' ? 'badge-green' : e === 'esperando_cupos' ? 'badge-amber' : 'badge-gray'

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
        <h2 style={{ fontFamily:'var(--font-heading)', fontSize:'1rem', fontWeight:700, color:'var(--color-gray-900)' }}>
          Clases / Sesiones ({sesiones.length})
        </h2>
        <button onClick={openAdd} className="btn btn-primary btn-sm">+ Agregar clase</button>
      </div>

      {/* ── Modal ── */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
          <div className="card-static" style={{ padding:'28px', width:'100%', maxWidth:'580px', maxHeight:'92vh', overflowY:'auto' }}>
            <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:700, marginBottom:'20px', color:'var(--color-gray-900)' }}>
              {editing ? 'Editar clase' : 'Agregar clase'}
            </h3>
            <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

              <Section title="Materia y tutor">
                <div>
                  <label className="input-label">Materia</label>
                  <select value={form.materia_id} onChange={e => u('materia_id', e.target.value)} className="input-field" required>
                    <option value="">Seleccionar materia…</option>
                    {materias.map(m => <option key={m.id} value={m.id}>{m.codigo} — {m.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Tutor</label>
                  <select value={form.tutor_id} onChange={e => u('tutor_id', e.target.value)} className="input-field" required>
                    <option value="">Seleccionar tutor…</option>
                    {tutores.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                  </select>
                </div>
              </Section>

              <Section title="Tipo, formato y ubicación">
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div>
                    <label className="input-label">Tipo</label>
                    <select value={form.tipo} onChange={e => u('tipo', e.target.value)} className="input-field">
                      <option value="grupal">Grupal</option>
                      <option value="individual">Individual</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Formato</label>
                    <select value={form.formato} onChange={e => u('formato', e.target.value)} className="input-field">
                      <option value="virtual">Virtual</option>
                      <option value="presencial">Presencial</option>
                    </select>
                  </div>
                </div>
                {form.formato === 'presencial' ? (
                  <div>
                    <label className="input-label">Ubicación</label>
                    <input type="text" value={form.ubicacion} onChange={e => u('ubicacion', e.target.value)} className="input-field" placeholder="Ej: Biblioteca, Sala 3B" />
                  </div>
                ) : (
                  <div>
                    <label className="input-label">Enlace virtual <span style={{ color:'var(--color-gray-400)', fontWeight:400 }}>(opcional)</span></label>
                    <input type="text" value={form.enlace_virtual} onChange={e => u('enlace_virtual', e.target.value)} className="input-field" placeholder="https://meet.google.com/…" />
                  </div>
                )}
              </Section>

              <Section title="Fecha y hora">
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div>
                    <label className="input-label">Inicio</label>
                    <input type="datetime-local" value={form.fecha_inicio} onChange={e => u('fecha_inicio', e.target.value)} className="input-field" required />
                  </div>
                  <div>
                    <label className="input-label">Fin</label>
                    <input type="datetime-local" value={form.fecha_fin} onChange={e => u('fecha_fin', e.target.value)} className="input-field" required />
                  </div>
                </div>
              </Section>

              <Section title="Cupos y precio">
                <div style={{ display:'grid', gridTemplateColumns: form.tipo === 'grupal' ? '1fr 1fr 1fr' : '1fr', gap:'10px' }}>
                  <div>
                    <label className="input-label">Precio individual (COP)</label>
                    <input type="number" value={form.precio_individual} onChange={e => u('precio_individual', e.target.value)} className="input-field" min={0} step={1000} required />
                  </div>
                  {form.tipo === 'grupal' && (<>
                    <div>
                      <label className="input-label">Mín. estudiantes</label>
                      <input type="number" value={form.min_estudiantes} onChange={e => u('min_estudiantes', e.target.value)} className="input-field" min={2} max={10} />
                    </div>
                    <div>
                      <label className="input-label">Máx. estudiantes</label>
                      <input type="number" value={form.max_estudiantes} onChange={e => u('max_estudiantes', e.target.value)} className="input-field" min={2} max={20} />
                    </div>
                  </>)}
                </div>
                <div>
                  <label className="input-label">Estado</label>
                  <select value={form.estado} onChange={e => u('estado', e.target.value)} className="input-field">
                    <option value="esperando_cupos">Esperando cupos</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="completada">Completada</option>
                  </select>
                </div>
              </Section>

              <Section title="Notas">
                <textarea value={form.notas} onChange={e => u('notas', e.target.value)} className="input-field" rows={2} placeholder="Temas a tratar, instrucciones…" style={{ resize:'vertical' }} />
              </Section>

              {msg && <p style={{ fontSize:'0.85rem', color: msg.startsWith('Error') ? 'var(--color-red-600)' : 'var(--color-brand-600)' }}>{msg}</p>}
              <div style={{ display:'flex', gap:'10px' }}>
                <button type="button" onClick={closeForm} className="btn btn-secondary" style={{ flex:1 }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex:1 }} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Tabla ── */}
      {loading ? (
        <div className="skeleton" style={{ height:'200px', borderRadius:'var(--radius-card)' }} />
      ) : (
        <div className="card-static" style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:'720px' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--color-gray-200)', background:'var(--color-gray-50)' }}>
                {['Materia','Tutor','Fecha inicio','Cupos','Precio ind.','Tipo','Estado','Acciones'].map(h => (
                  <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'0.75rem', fontWeight:700, color:'var(--color-gray-500)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sesiones.length === 0 && (
                <tr><td colSpan={8} style={{ padding:'40px', textAlign:'center', color:'var(--color-gray-400)', fontSize:'0.875rem' }}>No hay clases registradas. ¡Agrega la primera!</td></tr>
              )}
              {sesiones.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: i < sesiones.length - 1 ? '1px solid var(--color-gray-100)' : 'none' }}>
                  <td style={{ padding:'12px 14px', fontWeight:600, fontSize:'0.875rem', color:'var(--color-gray-800)' }}>
                    {s.materias?.nombre || '—'}<br />
                    <span style={{ fontWeight:400, fontSize:'0.75rem', color:'var(--color-gray-400)' }}>{s.materias?.codigo}</span>
                  </td>
                  <td style={{ padding:'12px 14px', fontSize:'0.82rem', color:'var(--color-gray-600)' }}>{s.tutores?.nombre || '—'}</td>
                  <td style={{ padding:'12px 14px', fontSize:'0.78rem', color:'var(--color-gray-600)', whiteSpace:'nowrap' }}>{fmtDate(s.fecha_inicio)}</td>
                  <td style={{ padding:'12px 14px', fontSize:'0.875rem', color:'var(--color-gray-700)' }}>{s.inscritos_actuales ?? 0}/{s.max_estudiantes || '—'}</td>
                  <td style={{ padding:'12px 14px', fontSize:'0.875rem', color:'var(--color-brand-600)', fontWeight:700 }}>{fmtPrice(s.precio_individual)}</td>
                  <td style={{ padding:'12px 14px' }}>
                    <span className={s.tipo === 'grupal' ? 'badge badge-sky' : 'badge badge-gray'}>{s.tipo}</span>
                  </td>
                  <td style={{ padding:'12px 14px' }}>
                    <span className={`badge ${estadoBadge(s.estado)}`}>{s.estado?.replace('_', ' ')}</span>
                  </td>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <button onClick={() => openEdit(s)} className="btn btn-secondary btn-sm">Editar</button>
                      <button onClick={() => handleDelete(s)} className="btn btn-secondary btn-sm" style={{ color:'var(--color-red-600)' }}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
// ─── Materias Tab (CRUD) ──────────────────────────────────────────────────────
const EMPTY_MATERIA = { codigo: '', nombre: '' }

function MateriasTab() {
  const [materias, setMaterias] = useState([])
  const [programas, setProgramas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_MATERIA)
  const [progSemestres, setProgSemestres] = useState({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const fetchMaterias = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('materias')
      .select('*, materia_programas(programa_id, semestre, programas(nombre))')
      .order('nombre')
    setMaterias(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchMaterias() }, [fetchMaterias])

  useEffect(() => {
    supabase.from('programas').select('*').order('nombre')
      .then(({ data }) => setProgramas(data || []))
  }, [])

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_MATERIA)
    setProgSemestres({})
    setMsg('')
    setShowForm(true)
  }

  const openEdit = (m) => {
    setEditing(m)
    setForm({ codigo: m.codigo || '', nombre: m.nombre || '' })
    const map = {}
    if (m.materia_programas) {
      m.materia_programas.forEach(mp => { map[mp.programa_id] = mp.semestre })
    }
    setProgSemestres(map)
    setMsg('')
    setShowForm(true)
  }

  const closeForm = () => { setShowForm(false); setEditing(null); setMsg('') }
  const u = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleToggleProg = (progId) => {
    setProgSemestres(prev => {
      const next = { ...prev }
      if (next[progId]) delete next[progId]
      else next[progId] = 1
      return next
    })
  }

  const handleSemestreChange = (progId, val) => {
    const sem = parseInt(val, 10)
    setProgSemestres(p => ({ ...p, [progId]: sem }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setMsg('')
    let err = null
    let materiaId = null

    if (editing) {
      ;({ error: err } = await supabase.from('materias').update(form).eq('id', editing.id))
      materiaId = editing.id
    } else {
      const resp = await supabase.from('materias').insert(form).select('id').single()
      err = resp.error
      materiaId = resp.data?.id
    }

    if (!err && materiaId) {
      await supabase.from('materia_programas').delete().eq('materia_id', materiaId)
      const toInsert = Object.entries(progSemestres).map(([pid, sem]) => ({
        materia_id: materiaId,
        programa_id: pid,
        semestre: sem || 1
      }))
      if (toInsert.length > 0) {
        const { error: mpErr } = await supabase.from('materia_programas').insert(toInsert)
        if (mpErr) err = mpErr
      }
    }

    setSaving(false)
    if (err) { setMsg('Error: ' + err.message) }
    else {
      setMsg(editing ? 'Materia actualizada.' : 'Materia creada.')
      await fetchMaterias()
      setTimeout(closeForm, 800)
    }
  }

  const handleDelete = async (m) => {
    if (!window.confirm(`¿Eliminar la materia "${m.nombre}"? Esto afectará clases e inscripciones.`)) return
    await supabase.from('materias').delete().eq('id', m.id)
    fetchMaterias()
  }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
        <h2 style={{ fontFamily:'var(--font-heading)', fontSize:'1rem', fontWeight:700, color:'var(--color-gray-900)' }}>
          Materias ({materias.length})
        </h2>
        <button onClick={openAdd} className="btn btn-primary btn-sm">+ Agregar materia</button>
      </div>

      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
          <div className="card-static" style={{ padding:'28px', width:'100%', maxWidth:'500px', maxHeight:'90vh', overflowY:'auto' }}>
            <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:700, marginBottom:'20px', color:'var(--color-gray-900)' }}>
              {editing ? 'Editar materia' : 'Agregar materia'}
            </h3>
            <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <Section title="Datos de la Materia">
                <div>
                  <label className="input-label">Código</label>
                  <input type="text" value={form.codigo} onChange={e => u('codigo', e.target.value)} className="input-field" placeholder="Ej: MAT101" required />
                </div>
                <div>
                  <label className="input-label">Nombre</label>
                  <input type="text" value={form.nombre} onChange={e => u('nombre', e.target.value)} className="input-field" placeholder="Ej: Álgebra Lineal" required />
                </div>
              </Section>

              <Section title="Programas y Semestre">
                <p style={{ fontSize:'0.75rem', color:'var(--color-gray-500)', marginBottom:'10px' }}>Selecciona en qué programas se dicta esta materia y en qué semestre va.</p>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px', maxHeight:'250px', overflowY:'auto' }}>
                  {programas.map(p => (
                    <div key={p.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 10px', background:'white', borderRadius:'6px', border:'1px solid var(--color-gray-200)' }}>
                      <input type="checkbox" checked={!!progSemestres[p.id]} onChange={() => handleToggleProg(p.id)} />
                      <span style={{ fontSize:'0.85rem', flex:1, fontWeight:600, color:'var(--color-gray-800)' }}>{p.nombre}</span>
                      {progSemestres[p.id] && (
                        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                          <span style={{ fontSize:'0.75rem', color:'var(--color-gray-500)' }}>Semestre:</span>
                          <input type="number" min={1} max={12} value={progSemestres[p.id] || 1} onChange={e => handleSemestreChange(p.id, e.target.value)} className="input-field" style={{ width:'60px', padding:'4px' }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Section>

              {msg && <p style={{ fontSize:'0.85rem', color: msg.startsWith('Error') ? 'var(--color-red-600)' : 'var(--color-brand-600)' }}>{msg}</p>}
              <div style={{ display:'flex', gap:'10px' }}>
                <button type="button" onClick={closeForm} className="btn btn-secondary" style={{ flex:1 }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex:1 }} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="skeleton" style={{ height:'200px', borderRadius:'var(--radius-card)' }} />
      ) : (
        <div className="card-static" style={{ overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--color-gray-200)', background:'var(--color-gray-50)' }}>
                {['Código','Nombre','Programas (Semestre)','Acciones'].map(h => (
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:'0.75rem', fontWeight:700, color:'var(--color-gray-500)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {materias.length === 0 && (
                <tr><td colSpan={4} style={{ padding:'40px', textAlign:'center', color:'var(--color-gray-400)', fontSize:'0.875rem' }}>No hay materias registradas. ¡Agrega la primera!</td></tr>
              )}
              {materias.map((m, i) => (
                <tr key={m.id} style={{ borderBottom: i < materias.length - 1 ? '1px solid var(--color-gray-100)' : 'none' }}>
                  <td style={{ padding:'12px 16px', fontWeight:600, fontSize:'0.875rem', color:'var(--color-gray-800)' }}>{m.codigo}</td>
                  <td style={{ padding:'12px 16px', fontWeight:600, fontSize:'0.875rem', color:'var(--color-gray-800)' }}>{m.nombre}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                      {m.materia_programas?.length === 0 && <span style={{ fontSize:'0.75rem', color:'var(--color-gray-400)' }}>Sin asignar</span>}
                      {m.materia_programas?.map(mp => (
                        <span key={mp.programa_id} style={{ fontSize:'0.7rem', background:'var(--color-gray-100)', color:'var(--color-gray-600)', padding:'2px 6px', borderRadius:'4px', fontWeight:600 }}>
                           {mp.programas?.nombre || 'Programa'} (Sem. {mp.semestre})
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <button onClick={() => openEdit(m)} className="btn btn-secondary btn-sm">Editar</button>
                      <button onClick={() => handleDelete(m)} className="btn btn-secondary btn-sm" style={{ color:'var(--color-red-600)' }}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Programas Tab (CRUD completo) ────────────────────────────────────────────
function ProgramasTab() {
  const [programas, setProgramas]  = useState([])
  const [loading, setLoading]      = useState(true)
  const [showForm, setShowForm]    = useState(false)
  const [editing, setEditing]      = useState(null)
  const [form, setForm]            = useState(EMPTY_PROGRAMA)
  const [saving, setSaving]        = useState(false)
  const [msg, setMsg]              = useState('')

  const fetchProgramas = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('programas').select('*').order('nombre')
    setProgramas(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchProgramas() }, [fetchProgramas])

  const openAdd  = () => { setEditing(null); setForm(EMPTY_PROGRAMA); setMsg(''); setShowForm(true) }
  const openEdit = (p) => { setEditing(p); setForm({ nombre: p.nombre, facultad: p.facultad || '' }); setMsg(''); setShowForm(true) }
  const closeForm = () => { setShowForm(false); setEditing(null); setMsg('') }
  const u = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setMsg('')
    let err
    if (editing) {
      ;({ error: err } = await supabase.from('programas').update(form).eq('id', editing.id))
    } else {
      ;({ error: err } = await supabase.from('programas').insert(form))
    }
    setSaving(false)
    if (err) { setMsg('Error: ' + err.message) }
    else { setMsg(editing ? 'Programa actualizado.' : 'Programa creado.'); await fetchProgramas(); setTimeout(closeForm, 800) }
  }

  const handleDelete = async (p) => {
    if (!window.confirm(`¿Eliminar "${p.nombre}"? Las materias asociadas perderán este programa.`)) return
    await supabase.from('programas').delete().eq('id', p.id)
    fetchProgramas()
  }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
        <h2 style={{ fontFamily:'var(--font-heading)', fontSize:'1rem', fontWeight:700, color:'var(--color-gray-900)' }}>
          Programas académicos ({programas.length})
        </h2>
        <button onClick={openAdd} className="btn btn-primary btn-sm">+ Agregar programa</button>
      </div>

      {/* ── Modal ── */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
          <div className="card-static" style={{ padding:'28px', width:'100%', maxWidth:'440px' }}>
            <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:700, marginBottom:'20px', color:'var(--color-gray-900)' }}>
              {editing ? 'Editar programa' : 'Agregar programa'}
            </h3>
            <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div>
                <label className="input-label">Nombre del programa</label>
                <input
                  type="text" value={form.nombre} onChange={e => u('nombre', e.target.value)}
                  className="input-field" placeholder="Ej: Ingeniería de Sistemas y Computación" required
                />
              </div>
              <div>
                <label className="input-label">
                  Facultad <span style={{ color:'var(--color-gray-400)', fontWeight:400 }}>(opcional)</span>
                </label>
                <input
                  type="text" value={form.facultad} onChange={e => u('facultad', e.target.value)}
                  className="input-field" placeholder="Ej: Facultad de Ingeniería"
                />
              </div>
              {msg && <p style={{ fontSize:'0.85rem', color: msg.startsWith('Error') ? 'var(--color-red-600)' : 'var(--color-brand-600)' }}>{msg}</p>}
              <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
                <button type="button" onClick={closeForm} className="btn btn-secondary" style={{ flex:1 }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex:1 }} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Tabla ── */}
      {loading ? (
        <div className="skeleton" style={{ height:'120px', borderRadius:'var(--radius-card)' }} />
      ) : (
        <div className="card-static" style={{ overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--color-gray-200)', background:'var(--color-gray-50)' }}>
                {['Nombre','Facultad','Acciones'].map(h => (
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:'0.75rem', fontWeight:700, color:'var(--color-gray-500)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {programas.length === 0 && (
                <tr><td colSpan={3} style={{ padding:'40px', textAlign:'center', color:'var(--color-gray-400)', fontSize:'0.875rem' }}>No hay programas registrados. ¡Agrega el primero!</td></tr>
              )}
              {programas.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < programas.length - 1 ? '1px solid var(--color-gray-100)' : 'none' }}>
                  <td style={{ padding:'12px 16px', fontWeight:600, fontSize:'0.875rem', color:'var(--color-gray-800)' }}>{p.nombre}</td>
                  <td style={{ padding:'12px 16px', fontSize:'0.82rem', color:'var(--color-gray-500)' }}>
                    {p.facultad || <span style={{ color:'var(--color-gray-300)' }}>—</span>}
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <button onClick={() => openEdit(p)} className="btn btn-secondary btn-sm">Editar</button>
                      <button onClick={() => handleDelete(p)} className="btn btn-secondary btn-sm" style={{ color:'var(--color-red-600)' }}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Notificaciones Tab ───────────────────────────────────────────────────────

function buildMsgRecordatorio(s, fmtDate, fmtTime) {
  const ubicStr = s.formato === 'virtual'
    ? `💻 Virtual${s.enlace_virtual ? ' — ' + s.enlace_virtual : ''}`
    : `📍 Presencial — ${s.ubicacion || 'por confirmar'}`
  const nombre = s.tutores?.nombre?.split(' ')[0] || 'tutor'
  return `🎓 *Recordatorio TutoPool*\n\nHola *${nombre}*! Tienes una sesión de *${s.materias?.nombre || 'tu materia'}* en menos de 24 horas.\n\n📅 ${fmtDate(s.fecha_inicio)} · ${fmtTime(s.fecha_inicio)} – ${fmtTime(s.fecha_fin)}\n${ubicStr}\n👥 ${s.inscritos_actuales || 0}/${s.max_estudiantes || '—'} inscritos\n\n¿Confirmas que darás esta sesión? Responde *SÍ* o *NO* 🙏`
}

function buildMsgSolitario(s, fmtDate) {
  const nombre = s.tutores?.nombre?.split(' ')[0] || 'tutor'
  return `⚠️ *Aviso TutoPool*\n\nHola *${nombre}*! La sesión grupal de *${s.materias?.nombre || 'tu materia'}* del ${fmtDate(s.fecha_inicio)} aún no alcanza el mínimo de ${s.min_estudiantes || 2} estudiantes.\n\nActualmente hay ${s.inscritos_actuales || 0} inscrito(s).\n\n¿Podrías darla de forma individual? Responde *SÍ* para confirmar o *NO* para cancelar. 🙏`
}

function buildEmailSubj(tipo, materia) {
  return tipo === 'recordatorio'
    ? `Recordatorio: Tu sesión de ${materia} empieza pronto — TutoPool`
    : `Actualización sobre tu sesión grupal de ${materia} — TutoPool`
}

function NotificacionesTab() {
  const [sesiones, setSesiones]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(null)   // { sesion, canal: 'whatsapp'|'email', tipo: 'recordatorio'|'solitario'|'manual' }
  const [phone, setPhone]           = useState('')
  const [emailAddr, setEmailAddr]   = useState('')
  const [msgText, setMsgText]       = useState('')
  const [sending, setSending]       = useState(false)
  const [sendResult, setSendResult] = useState('')
  const [waStatus, setWaStatus]     = useState(null)   // 'ready' | 'connecting' | null

  const fmtDate  = (iso) => new Date(iso).toLocaleDateString('es-CO', { weekday:'short', day:'numeric', month:'short' })
  const fmtTime  = (iso) => new Date(iso).toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit', hour12:true })
  const fmtPrice = (p)   => new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', minimumFractionDigits:0 }).format(p || 0)

  const fetchSesiones = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('sesiones')
      .select('*, materias(nombre, codigo), tutores(nombre, telefono, email)')
      .in('estado', ['esperando_cupos', 'confirmada'])
      .order('fecha_inicio')
    setSesiones(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchSesiones() }, [fetchSesiones])

  // Check WhatsApp (Meta API) status
  useEffect(() => {
    fetch('/api/wa-send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      .then(r => r.status === 503 ? setWaStatus('offline') : setWaStatus('ready'))
      .catch(() => setWaStatus('offline'))
  }, [])

  const now   = new Date()
  const in24h = new Date(now.getTime() + 24 * 3600 * 1000)

  const proximasHoy  = sesiones.filter(s => {
    const fi = new Date(s.fecha_inicio)
    return fi >= now && fi <= in24h
  })
  const solitarios = sesiones.filter(s =>
    s.tipo === 'grupal' && (s.inscritos_actuales || 0) < (s.min_estudiantes || 2)
  )

  const openModal = (sesion, canal, tipo) => {
    const msg = tipo === 'recordatorio' ? buildMsgRecordatorio(sesion, fmtDate, fmtTime)
              : tipo === 'solitario'    ? buildMsgSolitario(sesion, fmtDate)
              : ''
    setPhone(sesion.tutores?.telefono || '')
    setEmailAddr(sesion.tutores?.email || '')
    setMsgText(msg)
    setSendResult('')
    setModal({ sesion, canal, tipo })
  }

  const closeModal = () => { setModal(null); setSendResult('') }

  const sendWhatsApp = async () => {
    if (!phone.trim()) { setSendResult('❌ Ingresa un número de WhatsApp.'); return }
    setSending(true); setSendResult('')
    try {
      const res = await fetch('/api/wa-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phone.trim(), message: msgText }),
      })
      const data = await res.json()
      setSendResult(res.ok ? '✅ Mensaje enviado con éxito.' : `❌ Error: ${data.error || JSON.stringify(data)}`)
    } catch {
      setSendResult('❌ No se pudo conectar al servidor.')
    }
    setSending(false)
  }

  const convertirAIndividual = async (s) => {
    if (!window.confirm(`¿Convertir la sesión de "${s.materias?.nombre}" a individual? Se cambiará el tipo y se confirmará.`)) return
    await supabase.from('sesiones').update({ tipo: 'individual', max_estudiantes: 1, estado: 'confirmada' }).eq('id', s.id)
    fetchSesiones()
  }

  const cancelarPool = async (s) => {
    if (!window.confirm(`¿Cancelar la sesión grupal de "${s.materias?.nombre}"?`)) return
    await supabase.from('sesiones').update({ estado: 'cancelada' }).eq('id', s.id)
    fetchSesiones()
  }

  const mailtoLink = (s, tipo) => {
    const subj  = encodeURIComponent(buildEmailSubj(tipo, s.materias?.nombre || 'tu materia'))
    const body  = encodeURIComponent(
      tipo === 'recordatorio' ? buildMsgRecordatorio(s, fmtDate, fmtTime)
      : buildMsgSolitario(s, fmtDate)
    )
    const to    = encodeURIComponent(emailAddr || s.tutores?.email || '')
    return `mailto:${to}?subject=${subj}&body=${body}`
  }

  // ── Reusable session card ──────────────────────────────────────────────────
  function SesionCard({ s, urgent, solitario }) {
    const cuposPct  = s.max_estudiantes ? Math.min(((s.inscritos_actuales || 0) / s.max_estudiantes) * 100, 100) : 0
    const cuposLibres = (s.max_estudiantes || 0) - (s.inscritos_actuales || 0)

    return (
      <div style={{
        padding:'18px 20px', borderRadius:'10px', background:'white',
        border: urgent ? '1.5px solid var(--color-amber-300)' : solitario ? '1.5px solid var(--color-red-200)' : '1px solid var(--color-gray-200)',
      }}>
        {/* Header row */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'10px', flexWrap:'wrap', marginBottom:'10px' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap', marginBottom:'4px' }}>
              {urgent   && <span className="badge badge-amber">⏰ &lt; 24 h</span>}
              {solitario && <span className="badge" style={{ background:'#fee2e2', color:'#b91c1c', fontSize:'0.7rem', fontWeight:700, padding:'2px 8px', borderRadius:'20px' }}>⚠️ Pool solitario</span>}
              <span className={s.estado === 'confirmada' ? 'badge badge-green' : 'badge badge-amber'}>{s.estado?.replace('_', ' ')}</span>
              <span className={s.tipo === 'grupal' ? 'badge badge-sky' : 'badge badge-gray'}>{s.tipo}</span>
              <span className="badge badge-gray">{s.formato}</span>
            </div>
            <p style={{ fontWeight:700, fontSize:'0.95rem', color:'var(--color-gray-900)', marginBottom:'2px' }}>
              {s.materias?.nombre || '—'} <span style={{ color:'var(--color-gray-400)', fontSize:'0.75rem', fontWeight:400 }}>· {s.materias?.codigo}</span>
            </p>
            <p style={{ fontSize:'0.82rem', color:'var(--color-gray-500)' }}>
              📅 {fmtDate(s.fecha_inicio)} · {fmtTime(s.fecha_inicio)} – {fmtTime(s.fecha_fin)}
            </p>
            <p style={{ fontSize:'0.82rem', color:'var(--color-gray-500)', marginTop:'2px' }}>
              🧑‍🏫 {s.tutores?.nombre || '—'}
              {s.tutores?.telefono && <span style={{ color:'var(--color-gray-400)', marginLeft:'6px' }}>· {s.tutores.telefono}</span>}
            </p>
          </div>
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <p style={{ fontFamily:'var(--font-heading)', fontSize:'1.1rem', fontWeight:700, color:'var(--color-brand-600)' }}>{fmtPrice(s.precio_individual)}</p>
            <p style={{ fontSize:'0.72rem', color:'var(--color-gray-400)' }}>precio individual</p>
          </div>
        </div>

        {/* Capacity bar */}
        <div style={{ marginBottom:'12px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.74rem', marginBottom:'4px' }}>
            <span style={{ color: cuposLibres <= 1 ? 'var(--color-amber-600)' : 'var(--color-gray-500)' }}>
              {cuposLibres <= 0 ? 'Pool lleno' : `${cuposLibres} cupo${cuposLibres !== 1 ? 's' : ''} libre${cuposLibres !== 1 ? 's' : ''}`}
            </span>
            <span style={{ color:'var(--color-gray-500)', fontWeight:600 }}>{s.inscritos_actuales || 0}/{s.max_estudiantes || '—'}</span>
          </div>
          <div style={{ height:'5px', borderRadius:'3px', background:'var(--color-gray-100)', overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${cuposPct}%`, borderRadius:'3px', background: cuposPct >= 100 ? 'var(--color-brand-500)' : cuposPct > 60 ? 'var(--color-amber-400)' : 'var(--color-gray-300)', transition:'width 0.3s' }} />
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center' }}>
          <button
            onClick={() => openModal(s, 'whatsapp', urgent ? 'recordatorio' : solitario ? 'solitario' : 'manual')}
            className="btn btn-secondary btn-sm"
            style={{ display:'flex', alignItems:'center', gap:'5px' }}
          >
            💬 WhatsApp
          </button>
          <a
            href={mailtoLink(s, urgent ? 'recordatorio' : 'solitario')}
            className="btn btn-secondary btn-sm"
            style={{ display:'flex', alignItems:'center', gap:'5px', textDecoration:'none' }}
            onClick={() => { setEmailAddr(s.tutores?.email || '') }}
          >
            ✉️ Correo
          </a>

          {solitario && (
            <>
              <div style={{ width:'1px', height:'20px', background:'var(--color-gray-200)' }} />
              <button onClick={() => convertirAIndividual(s)} className="btn btn-secondary btn-sm" style={{ color:'var(--color-brand-600)', fontWeight:600 }}>
                ↗ Convertir a individual
              </button>
              <button onClick={() => cancelarPool(s)} className="btn btn-secondary btn-sm" style={{ color:'var(--color-red-600)' }}>
                ✕ Cancelar pool
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px', flexWrap:'wrap', gap:'10px' }}>
        <h2 style={{ fontFamily:'var(--font-heading)', fontSize:'1rem', fontWeight:700, color:'var(--color-gray-900)' }}>
          Notificaciones y seguimiento
        </h2>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <span style={{ fontSize:'0.75rem', color:'var(--color-gray-400)' }}>WhatsApp (Meta API):</span>
          <span style={{
            fontSize:'0.75rem', fontWeight:700,
            color: waStatus === 'ready' ? 'var(--color-brand-600)' : waStatus === 'offline' ? 'var(--color-red-600)' : 'var(--color-amber-600)',
          }}>
            {waStatus === 'ready' ? '● Configurado' : waStatus === 'offline' ? '● Sin configurar' : '● Verificando…'}
          </span>
          <button onClick={() => {
            setWaStatus(null)
            fetch('/api/wa-send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
              .then(r => r.status === 503 ? setWaStatus('offline') : setWaStatus('ready'))
              .catch(() => setWaStatus('offline'))
          }} className="btn btn-secondary btn-sm">↻</button>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:'12px', marginBottom:'24px' }}>
        {[
          { label:'Sesiones abiertas', value: sesiones.length,     color:'var(--color-brand-600)' },
          { label:'Próximas 24 h',     value: proximasHoy.length,  color:'var(--color-amber-600)' },
          { label:'Pools solitarios',  value: solitarios.length,   color:'var(--color-red-600)' },
        ].map(c => (
          <div key={c.label} className="card-static" style={{ padding:'16px 18px' }}>
            <p style={{ fontSize:'1.7rem', fontWeight:800, fontFamily:'var(--font-heading)', color:c.color }}>{c.value}</p>
            <p style={{ fontSize:'0.78rem', color:'var(--color-gray-500)', marginTop:'2px' }}>{c.label}</p>
          </div>
        ))}
      </div>

      {loading ? <div className="skeleton" style={{ height:'200px', borderRadius:'var(--radius-card)' }} /> : (<>

        {/* ── Urgentes (< 24 h) ── */}
        {proximasHoy.length > 0 && (
          <div style={{ marginBottom:'28px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
              <span style={{ fontSize:'1.1rem' }}>⏰</span>
              <h3 style={{ fontFamily:'var(--font-heading)', fontSize:'0.9rem', fontWeight:700, color:'var(--color-amber-700)' }}>
                Comienzan en menos de 24 horas — recordar a los tutores
              </h3>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {proximasHoy.map(s => <SesionCard key={s.id} s={s} urgent />)}
            </div>
          </div>
        )}

        {/* ── Pools solitarios ── */}
        {solitarios.length > 0 && (
          <div style={{ marginBottom:'28px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
              <span style={{ fontSize:'1.1rem' }}>⚠️</span>
              <h3 style={{ fontFamily:'var(--font-heading)', fontSize:'0.9rem', fontWeight:700, color:'#b91c1c' }}>
                Pools grupales sin cupo mínimo — cancelar o convertir a individual
              </h3>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {solitarios.map(s => <SesionCard key={s.id} s={s} solitario />)}
            </div>
          </div>
        )}

        {/* ── Todas las sesiones abiertas ── */}
        <div>
          <h3 style={{ fontFamily:'var(--font-heading)', fontSize:'0.9rem', fontWeight:700, color:'var(--color-gray-700)', marginBottom:'12px' }}>
            Todas las sesiones abiertas ({sesiones.length})
          </h3>
          {sesiones.length === 0 ? (
            <div className="card-static" style={{ padding:'40px', textAlign:'center', color:'var(--color-gray-400)', fontSize:'0.875rem' }}>
              No hay sesiones abiertas en este momento.
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {sesiones.map(s => (
                <SesionCard key={s.id} s={s}
                  urgent={proximasHoy.some(u => u.id === s.id)}
                  solitario={solitarios.some(p => p.id === s.id)}
                />
              ))}
            </div>
          )}
        </div>

      </>)}

      {/* ── WhatsApp Modal ── */}
      {modal?.canal === 'whatsapp' && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
          <div className="card-static" style={{ padding:'28px', width:'100%', maxWidth:'500px', maxHeight:'90vh', overflowY:'auto' }}>
            <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:700, marginBottom:'4px', color:'var(--color-gray-900)' }}>
              💬 Enviar por WhatsApp
            </h3>
            <p style={{ fontSize:'0.8rem', color:'var(--color-gray-400)', marginBottom:'20px' }}>
              {modal.sesion.materias?.nombre} · {fmtDate(modal.sesion.fecha_inicio)}
            </p>

            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div>
                <label className="input-label">Número de WhatsApp <span style={{ color:'var(--color-gray-400)', fontWeight:400 }}>(con código de país, sin +)</span></label>
                <input
                  type="text" value={phone} onChange={e => setPhone(e.target.value)}
                  className="input-field" placeholder="573001234567"
                />
                {modal.sesion.tutores?.telefono && (
                  <button type="button" onClick={() => setPhone(modal.sesion.tutores.telefono)} style={{ marginTop:'4px', fontSize:'0.75rem', color:'var(--color-brand-600)', background:'none', border:'none', cursor:'pointer', padding:0 }}>
                    Usar teléfono del tutor: {modal.sesion.tutores.telefono}
                  </button>
                )}
              </div>

              <div>
                <label className="input-label">Mensaje</label>
                <textarea
                  value={msgText} onChange={e => setMsgText(e.target.value)}
                  className="input-field" rows={8}
                  style={{ resize:'vertical', fontSize:'0.82rem', fontFamily:'monospace' }}
                />
              </div>

              {sendResult && (
                <div style={{ padding:'10px 14px', borderRadius:'8px', fontSize:'0.85rem',
                  background: sendResult.startsWith('✅') ? 'var(--color-brand-50)' : 'var(--color-red-50)',
                  color: sendResult.startsWith('✅') ? 'var(--color-brand-700)' : 'var(--color-red-600)',
                  border: sendResult.startsWith('✅') ? '1px solid var(--color-brand-100)' : '1px solid #fecaca',
                }}>
                  {sendResult}
                </div>
              )}

              <div style={{ display:'flex', gap:'10px' }}>
                <button onClick={closeModal} className="btn btn-secondary" style={{ flex:1 }}>Cancelar</button>
                <button onClick={sendWhatsApp} disabled={sending} className="btn btn-primary" style={{ flex:1 }}>
                  {sending ? '⏳ Enviando…' : '💬 Enviar WhatsApp'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Solicitudes Tab ──────────────────────────────────────────────────────────
function SolicitudesTab() {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('solicitudes_tutoria')
      .select('*, materias(nombre, codigo)')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => { setSolicitudes(data || []); setLoading(false) })
  }, [])

  const fmt = (iso) => new Date(iso).toLocaleDateString('es-CO', { day:'numeric', month:'short', year:'numeric' })

  return (
    <div>
      <h2 style={{ fontFamily:'var(--font-heading)', fontSize:'1rem', fontWeight:700, color:'var(--color-gray-900)', marginBottom:'16px' }}>
        Solicitudes ({solicitudes.length})
      </h2>
      {loading ? <div className="skeleton" style={{ height:'200px', borderRadius:'var(--radius-card)' }} /> : (
        <div className="card-static" style={{ overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--color-gray-200)', background:'var(--color-gray-50)' }}>
                {['Materia','Fecha pref.','Hora','Tipo','Formato','Estado','Creada'].map(h => (
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:'0.75rem', fontWeight:700, color:'var(--color-gray-500)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: i < solicitudes.length - 1 ? '1px solid var(--color-gray-100)' : 'none' }}>
                  <td style={{ padding:'12px 16px', fontWeight:600, fontSize:'0.875rem', color:'var(--color-gray-800)' }}>{s.materias?.nombre || '—'}</td>
                  <td style={{ padding:'12px 16px', fontSize:'0.82rem', color:'var(--color-gray-600)' }}>{s.fecha_preferida || '—'}</td>
                  <td style={{ padding:'12px 16px', fontSize:'0.82rem', color:'var(--color-gray-600)' }}>{s.hora_preferida || '—'}</td>
                  <td style={{ padding:'12px 16px' }}><span className="badge badge-sky">{s.tipo}</span></td>
                  <td style={{ padding:'12px 16px' }}><span className="badge badge-gray">{s.formato}</span></td>
                  <td style={{ padding:'12px 16px' }}>
                    <span className={s.estado === 'pendiente' ? 'badge badge-amber' : s.estado === 'confirmada' ? 'badge badge-green' : 'badge badge-gray'}>{s.estado}</span>
                  </td>
                  <td style={{ padding:'12px 16px', fontSize:'0.78rem', color:'var(--color-gray-400)' }}>{fmt(s.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
