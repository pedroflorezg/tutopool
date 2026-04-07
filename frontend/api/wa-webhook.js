const SUPA_URL = process.env.SUPABASE_URL
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const HEADERS  = { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' }

async function db(path) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, { headers: HEADERS })
  return r.json()
}

async function dbPatch(table, filter, patch) {
  await fetch(`${SUPA_URL}/rest/v1/${table}?${filter}`, {
    method: 'PATCH',
    headers: { ...HEADERS, Prefer: 'return=minimal' },
    body: JSON.stringify(patch),
  })
}

async function getAuthUsers() {
  const r = await fetch(`${SUPA_URL}/auth/v1/admin/users`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
  })
  const d = await r.json()
  return d.users || []
}

async function sendWA(to, body) {
  const sid   = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from  = process.env.TWILIO_WA_FROM
  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ From: from, To: `whatsapp:+${String(to).replace(/\D/g, '')}`, Body: body }).toString(),
  })
}

function twiml(msg) {
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${msg}</Message></Response>`
}

function fmtFecha(iso) {
  return new Date(iso).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
}

// ─────────────────────────────────────────────────────────────────────────────
// Flujo A: Tutor confirma o cancela una sesión (botones SÍ / NO)
// ─────────────────────────────────────────────────────────────────────────────
async function handleTutor(from, confirmed) {
  const tutores = await db(`tutores?select=id,nombre&telefono=eq.${from}&limit=1`)
  const tutor   = Array.isArray(tutores) ? tutores[0] : null
  if (!tutor) return twiml('No encontramos tu perfil de tutor. Escríbenos a soporte.')

  const now = new Date().toISOString()
  const sesiones = await db(
    `sesiones?select=id,fecha_inicio,materias(nombre)&tutor_id=eq.${tutor.id}&estado=in.(confirmada,esperando_cupos)&fecha_inicio=gte.${now}&order=fecha_inicio&limit=1`
  )
  const sesion = Array.isArray(sesiones) ? sesiones[0] : null
  if (!sesion) return twiml('No tienes sesiones activas próximas registradas.')

  const materia = sesion.materias?.nombre || 'tu materia'
  const fecha   = fmtFecha(sesion.fecha_inicio)

  await dbPatch('sesiones', `id=eq.${sesion.id}`, { estado: confirmed ? 'confirmada' : 'cancelada' })

  // Notify students
  const inscripciones = await db(`inscripciones?select=estudiante_id&sesion_id=eq.${sesion.id}`)
  if (Array.isArray(inscripciones) && inscripciones.length > 0) {
    const allUsers = await getAuthUsers()
    const students = allUsers.filter(u => inscripciones.some(i => i.estudiante_id === u.id))
    for (const student of students) {
      const phone = student.phone?.replace(/\D/g, '')
      if (!phone) continue
      const nombre = student.user_metadata?.full_name || student.user_metadata?.name || student.email?.split('@')[0] || 'estudiante'
      const msg = confirmed
        ? `✅ *TutoPool — Sesión Confirmada*\n\nHola ${nombre}! Tu sesión de *${materia}* del ${fecha} ha sido *confirmada* por el tutor ${tutor.nombre}. ¡Nos vemos pronto! 🚀`
        : `❌ *TutoPool — Sesión Cancelada*\n\nHola ${nombre}, la sesión de *${materia}* del ${fecha} fue *cancelada*. Pronto te contactaremos para reagendarla. 🙏`
      await sendWA(phone, msg)
    }
  }

  const reply = confirmed
    ? `✅ ¡Perfecto, ${tutor.nombre.split(' ')[0]}! La sesión de *${materia}* del ${fecha} ha sido confirmada. Los estudiantes ya fueron notificados.`
    : `❌ Entendido, ${tutor.nombre.split(' ')[0]}. La sesión fue cancelada y los estudiantes han sido notificados.`
  return twiml(reply)
}

// ─────────────────────────────────────────────────────────────────────────────
// Flujo B: Estudiante decide convertir a individual o cancelar (sesión solitaria)
// ─────────────────────────────────────────────────────────────────────────────
async function handleEstudiante(from, toIndividual) {
  // Find user by phone
  const allUsers = await getAuthUsers()
  const student  = allUsers.find(u => u.phone?.replace(/\D/g, '') === from)
  if (!student) return twiml('No encontramos tu cuenta. Escríbenos a soporte.')

  const nombre = student.user_metadata?.full_name || student.user_metadata?.name || student.email?.split('@')[0] || 'estudiante'

  // Find their next enrolled session in lonely-pool state
  const now = new Date().toISOString()
  const inscripciones = await db(
    `inscripciones?select=sesion_id&estudiante_id=eq.${student.id}`
  )
  if (!Array.isArray(inscripciones) || inscripciones.length === 0) {
    return twiml('No tienes sesiones activas.')
  }

  const ids = inscripciones.map(i => `"${i.sesion_id}"`).join(',')
  const sesiones = await db(
    `sesiones?select=id,fecha_inicio,precio_individual,tutor_id,tutores(nombre,telefono),materias(nombre)&id=in.(${ids})&estado=in.(confirmada,esperando_cupos)&fecha_inicio=gte.${now}&order=fecha_inicio&limit=1`
  )
  const sesion = Array.isArray(sesiones) ? sesiones[0] : null
  if (!sesion) return twiml('No encontramos una sesión activa pendiente de decisión.')

  const materia = sesion.materias?.nombre || 'tu materia'
  const fecha   = fmtFecha(sesion.fecha_inicio)
  const tutor   = sesion.tutores

  if (toIndividual) {
    await dbPatch('sesiones', `id=eq.${sesion.id}`, {
      tipo: 'individual',
      max_estudiantes: 1,
      estado: 'confirmada',
    })
  } else {
    await dbPatch('sesiones', `id=eq.${sesion.id}`, { estado: 'cancelada' })
  }

  // Notify tutor
  if (tutor?.telefono) {
    const tutorMsg = toIndividual
      ? `📌 *TutoPool — Sesión convertida a individual*\n\nHola ${tutor.nombre.split(' ')[0]}! El estudiante ${nombre} eligió convertir la sesión de *${materia}* del ${fecha} a *individual*. ¡Queda confirmada! 👍`
      : `❌ *TutoPool — Sesión cancelada por el estudiante*\n\nHola ${tutor.nombre.split(' ')[0]}, el estudiante ${nombre} canceló la sesión de *${materia}* del ${fecha}. Ya puedes liberar ese espacio.`
    await sendWA(tutor.telefono, tutorMsg)
  }

  const reply = toIndividual
    ? `✅ ¡Listo, ${nombre}! Tu sesión de *${materia}* del ${fecha} fue convertida a *individual* y está confirmada. ¡Nos vemos pronto! 🚀`
    : `❌ Entendido, ${nombre}. La sesión de *${materia}* fue cancelada. Si necesitas reagendarla, escríbenos. 🙏`
  return twiml(reply)
}

// ─────────────────────────────────────────────────────────────────────────────
// Handler principal
// ─────────────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/xml')
  if (req.method !== 'POST') return res.status(405).send('<Response></Response>')

  const from    = String(req.body?.From || '').replace('whatsapp:', '').replace('+', '').trim()
  const payload = String(req.body?.ButtonPayload || req.body?.Body || '').trim()
  const upper   = payload.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()

  // Flujo B — respuesta del estudiante (sesión solitaria)
  if (upper === 'INDIVIDUAL' || upper.includes('INDIVIDUAL')) {
    return res.status(200).send(await handleEstudiante(from, true))
  }
  if (upper === 'CANCELAR_SESION' || upper.includes('CANCELAR SESION') || upper.includes('CANCELAR_SESION')) {
    return res.status(200).send(await handleEstudiante(from, false))
  }

  // Flujo A — respuesta del tutor (confirmación)
  const confirmed = upper === 'SI' || upper.startsWith('SI,') || upper.includes('CONFIRMO')
  const denied    = upper === 'NO' || upper.startsWith('NO,') || upper.includes('CANCELO')

  if (confirmed || denied) {
    return res.status(200).send(await handleTutor(from, confirmed))
  }

  return res.status(200).send(twiml('No entendí tu respuesta. Por favor usa los botones del mensaje anterior.'))
}
