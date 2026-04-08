// Notifica al estudiante de una sesión solitaria para que elija:
// "Convertir a individual" o "Cancelar sesión"
const SUPA_URL = process.env.SUPABASE_URL
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function db(path) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
  })
  return r.json()
}

function fmtFecha(iso) {
  return new Date(iso).toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtCOP(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n || 0)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { sesion_id } = req.body || {}
  if (!sesion_id) return res.status(400).json({ error: 'Falta sesion_id' })

  const sid        = process.env.TWILIO_ACCOUNT_SID
  const token      = process.env.TWILIO_AUTH_TOKEN
  const from       = process.env.TWILIO_WA_FROM
  const contentSid = process.env.TWILIO_CONTENT_SID_ESTUDIANTE

  if (!sid || !token || !from) {
    return res.status(503).json({ error: 'WhatsApp no configurado' })
  }

  // ── Get session details ────────────────────────────────────────────────
  const sesiones = await db(
    `sesiones?select=id,fecha_inicio,precio_individual,materias(nombre)&id=eq.${sesion_id}&limit=1`
  )
  const sesion = Array.isArray(sesiones) ? sesiones[0] : null
  if (!sesion) return res.status(404).json({ error: 'Sesión no encontrada' })

  // ── Get enrolled students ─────────────────────────────────────────────
  const inscripciones = await db(
    `inscripciones?select=estudiante_id&sesion_id=eq.${sesion_id}`
  )
  if (!Array.isArray(inscripciones) || inscripciones.length === 0) {
    return res.status(404).json({ error: 'No hay estudiantes inscritos' })
  }

  // ── Get student info from auth.users ──────────────────────────────────
  const usersResp = await fetch(`${SUPA_URL}/auth/v1/admin/users`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
  })
  const usersData  = await usersResp.json()
  const students   = (usersData.users || []).filter(
    u => inscripciones.some(i => i.estudiante_id === u.id)
  )

  const materia = sesion.materias?.nombre || 'tu materia'
  const fecha   = fmtFecha(sesion.fecha_inicio)
  const precio  = fmtCOP(sesion.precio_individual)

  const sent = []

  for (const student of students) {
    const phone = student.phone?.replace(/\D/g, '')
    if (!phone) continue

    const nombre = student.user_metadata?.full_name
      || student.user_metadata?.name
      || student.email?.split('@')[0]
      || 'estudiante'

    const msgBody = `⚠️ *TutoPool — Tu sesión necesita una decisión*\n\nHola *${nombre}*! La sesión grupal de *${materia}* del ${fecha} no alcanzó el mínimo de estudiantes y solo quedas tú.\n\n💰 Precio individual: *${precio}*\n\n¿Qué prefieres hacer?`

    const params = contentSid
      ? { From: from, To: `whatsapp:+${phone}`, ContentSid: contentSid, ContentVariables: JSON.stringify({ '1': msgBody }) }
      : { From: from, To: `whatsapp:+${phone}`, Body: msgBody }

    const resp = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(params).toString(),
      }
    )
    const data = await resp.json()
    sent.push({ phone, status: data.status, error: data.error_message })
  }

  return res.status(200).json({ sent })
}
