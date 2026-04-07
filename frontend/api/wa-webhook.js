const SUPA_URL  = process.env.SUPABASE_URL
const SUPA_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY
const HEADERS   = { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' }

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

async function sendWA(to, body) {
  const sid   = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from  = process.env.TWILIO_WA_FROM
  const number = `whatsapp:+${String(to).replace(/\D/g, '')}`
  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ From: from, To: number, Body: body }).toString(),
  })
}

function twiml(msg) {
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${msg}</Message></Response>`
}

function fmtFecha(iso) {
  return new Date(iso).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/xml')
  if (req.method !== 'POST') return res.status(405).send('<Response></Response>')

  const from    = String(req.body?.From || '').replace('whatsapp:', '').replace('+', '').trim()
  // ButtonPayload = id del botón presionado (SI / NO); Body = título visible del botón
  const payload = String(req.body?.ButtonPayload || req.body?.Body || '').trim()
  const upper   = payload.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
  const confirmed = upper === 'SI' || upper.startsWith('SI,') || upper.includes('CONFIRMO')
  const denied    = upper === 'NO' || upper.startsWith('NO,') || upper.includes('CANCELO')

  if (!confirmed && !denied) {
    return res.status(200).send(twiml('Responde *SÍ* para confirmar o *NO* para cancelar la sesión.'))
  }

  // ── Find tutor by phone ──────────────────────────────────────────────────
  const tutores = await db(`tutores?select=id,nombre&telefono=eq.${from}&limit=1`)
  const tutor   = Array.isArray(tutores) ? tutores[0] : null

  if (!tutor) return res.status(200).send(twiml('No encontramos tu perfil de tutor. Escríbenos a soporte.'))

  // ── Find next upcoming active session for this tutor ────────────────────
  const now = new Date().toISOString()
  const sesiones = await db(
    `sesiones?select=id,fecha_inicio,materias(nombre)&tutor_id=eq.${tutor.id}&estado=in.(confirmada,esperando_cupos)&fecha_inicio=gte.${now}&order=fecha_inicio&limit=1`
  )
  const sesion = Array.isArray(sesiones) ? sesiones[0] : null

  if (!sesion) return res.status(200).send(twiml('No tienes sesiones activas próximas registradas.'))

  const materia = sesion.materias?.nombre || 'tu materia'
  const fecha   = fmtFecha(sesion.fecha_inicio)

  // ── Update session status ────────────────────────────────────────────────
  await dbPatch('sesiones', `id=eq.${sesion.id}`, { estado: confirmed ? 'confirmada' : 'cancelada' })

  // ── Notify enrolled students ─────────────────────────────────────────────
  const inscripciones = await db(`inscripciones?select=estudiante_id&sesion_id=eq.${sesion.id}`)

  if (Array.isArray(inscripciones) && inscripciones.length > 0) {
    const ids = inscripciones.map(i => `"${i.estudiante_id}"`).join(',')

    // Use the admin endpoint to get user info
    const usersResp = await fetch(`${SUPA_URL}/auth/v1/admin/users`, {
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
    })
    const usersData = await usersResp.json()
    const users = (usersData.users || []).filter(u => inscripciones.some(i => i.estudiante_id === u.id))

    for (const student of users) {
      const phone = student.phone?.replace(/\D/g, '')
      if (!phone) continue
      const nombre = student.user_metadata?.full_name
        || student.user_metadata?.name
        || student.email?.split('@')[0]
        || 'estudiante'

      const msg = confirmed
        ? `✅ *TutoPool — Sesión Confirmada*\n\nHola ${nombre}! Tu sesión de *${materia}* del ${fecha} ha sido *confirmada* por el tutor ${tutor.nombre}. ¡Nos vemos pronto! 🚀`
        : `❌ *TutoPool — Sesión Cancelada*\n\nHola ${nombre}, lamentamos informarte que la sesión de *${materia}* del ${fecha} fue *cancelada*. Pronto te contactaremos para reagendarla. 🙏`

      await sendWA(phone, msg)
    }
  }

  // ── Reply to tutor ───────────────────────────────────────────────────────
  const reply = confirmed
    ? `✅ ¡Perfecto, ${tutor.nombre.split(' ')[0]}! La sesión de *${materia}* del ${fecha} ha sido confirmada. Los estudiantes ya fueron notificados.`
    : `❌ Entendido, ${tutor.nombre.split(' ')[0]}. La sesión fue cancelada y los estudiantes han sido notificados.`

  return res.status(200).send(twiml(reply))
}
