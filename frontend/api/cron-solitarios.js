// Cron job: revisa sesiones grupales con solo 1 estudiante que empiezan en las próximas 24h
// y envía un WhatsApp + email al estudiante para que elija convertir a individual o cancelar.

import { sendEmail, toHtml } from './_email.js'

const SUPA_URL = process.env.SUPABASE_URL
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const HEADERS  = { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' }

async function db(path) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, { headers: HEADERS })
  if (!r.ok) throw new Error(`Supabase error ${r.status}: ${await r.text()}`)
  return r.json()
}

async function dbPatch(table, filter, patch) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${table}?${filter}`, {
    method: 'PATCH',
    headers: { ...HEADERS, Prefer: 'return=minimal' },
    body: JSON.stringify(patch),
  })
  if (!r.ok) throw new Error(`Patch error ${r.status}: ${await r.text()}`)
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

async function notifyStudent(sesion) {
  const sid        = process.env.TWILIO_ACCOUNT_SID
  const token      = process.env.TWILIO_AUTH_TOKEN
  const from       = process.env.TWILIO_WA_FROM
  const contentSid = process.env.TWILIO_CONTENT_SID_ESTUDIANTE

  if (!sid || !token || !from) {
    throw new Error('Variables de Twilio no configuradas (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_WA_FROM)')
  }

  // Get enrolled students for this session
  const inscripciones = await db(`inscripciones?select=estudiante_id&sesion_id=eq.${sesion.id}`)
  if (!Array.isArray(inscripciones) || inscripciones.length === 0) return []

  // Get student info from auth.users
  const usersResp = await fetch(`${SUPA_URL}/auth/v1/admin/users`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
  })
  const usersData = await usersResp.json()
  const students  = (usersData.users || []).filter(
    u => inscripciones.some(i => i.estudiante_id === u.id)
  )

  const materia = sesion.materia_nombre || 'tu materia'
  const fecha   = fmtFecha(sesion.fecha_inicio)
  const precio  = fmtCOP(sesion.precio_individual)

  const sent = []

  for (const student of students) {
    const phone  = student.phone?.replace(/\D/g, '')
    const email  = student.email
    if (!phone && !email) continue

    const nombre = student.user_metadata?.full_name
      || student.user_metadata?.name
      || email?.split('@')[0]
      || 'estudiante'

    const msgBody = `⚠️ *TutoPool — Tu sesión necesita una decisión*\n\nHola *${nombre}*! La sesión grupal de *${materia}* del ${fecha} no alcanzó el mínimo de estudiantes y solo quedas tú.\n\n💰 Precio individual: *${precio}*\n\nResponde *INDIVIDUAL* para convertirla o *CANCELAR* para cancelarla.`

    // WhatsApp
    let waStatus = 'sin teléfono'
    if (phone) {
      const params = contentSid
        ? { From: from, To: `whatsapp:+${phone}`, ContentSid: contentSid, ContentVariables: JSON.stringify({ '1': msgBody }) }
        : { From: from, To: `whatsapp:+${phone}`, Body: msgBody }
      const resp = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(params).toString(),
      })
      const data = await resp.json()
      waStatus = data.status || data.error_message || 'error'
    }

    // Email
    let emailStatus = 'sin email'
    if (email) {
      const result = await sendEmail(email, `⚠️ Tu sesión grupal de ${materia} necesita una decisión`, toHtml(msgBody))
      emailStatus = result.ok ? 'enviado' : (result.error || 'error')
    }

    sent.push({ phone, email, whatsapp: waStatus, email: emailStatus })
  }

  return sent
}

export default async function handler(req, res) {
  // Allow both GET (manual test) and POST (Vercel cron)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const now   = new Date()
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  // Query pools_abiertos view: grupo, 1 inscrito, empieza en las próximas 24h
  const candidates = await db(
    `pools_abiertos?tipo=eq.grupal&inscritos_actuales=eq.1` +
    `&fecha_inicio=gte.${now.toISOString()}&fecha_inicio=lte.${in24h.toISOString()}` +
    `&select=id,fecha_inicio,precio_individual,materia_nombre`
  )

  if (!Array.isArray(candidates) || candidates.length === 0) {
    return res.status(200).json({ checked: 0, notified: [] })
  }

  // Filter out sessions already notified
  const ids = candidates.map(s => s.id)
  const alreadySent = await db(
    `sesiones?id=in.(${ids.join(',')})&notificado_solitario_at=not.is.null&select=id`
  )
  const sentIds = new Set((Array.isArray(alreadySent) ? alreadySent : []).map(s => s.id))
  const toNotify = candidates.filter(s => !sentIds.has(s.id))

  const results = []

  for (const sesion of toNotify) {
    try {
      const sent = await notifyStudent(sesion)
      await dbPatch('sesiones', `id=eq.${sesion.id}`, { notificado_solitario_at: new Date().toISOString() })
      results.push({ sesion_id: sesion.id, sent })
    } catch (err) {
      results.push({ sesion_id: sesion.id, error: err.message })
    }
  }

  return res.status(200).json({
    checked: candidates.length,
    skipped: sentIds.size,
    notified: results,
  })
}
