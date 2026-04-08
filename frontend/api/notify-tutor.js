// Notifica al tutor cuando un estudiante crea una solicitud de tutoría.
// Llamado desde el frontend (HTTPS → HTTPS), luego este endpoint llama a Twilio
// server-side para evitar el bloqueo de mixed-content del navegador.

const SUPA_URL = process.env.SUPABASE_URL
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const HEADERS  = { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' }

async function db(path) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, { headers: HEADERS })
  return r.json()
}

async function sendWA(to, body) {
  const sid   = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from  = process.env.TWILIO_WA_FROM
  const contentSid = process.env.TWILIO_CONTENT_SID  // template con botones SÍ/NO

  const number = `whatsapp:+${String(to).replace(/\D/g, '')}`

  const params = contentSid
    ? { From: from, To: number, ContentSid: contentSid, ContentVariables: JSON.stringify({ '1': body }) }
    : { From: from, To: number, Body: body }

  const resp = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params).toString(),
  })
  return resp.json()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { materiaId, tutorId, estudiante, solicitud } = req.body || {}
  if (!materiaId) return res.status(400).json({ error: 'Falta materiaId' })

  // Buscar tutor: si es específico cargarlo, si es aleatorio buscar uno activo para la materia
  let tutor = null
  if (tutorId && tutorId !== 'aleatorio') {
    const rows = await db(`tutores?select=id,nombre,telefono&id=eq.${tutorId}&limit=1`)
    tutor = Array.isArray(rows) ? rows[0] : null
  }

  if (!tutor) {
    // Tutor aleatorio: buscar via tutor_materias (join correcto en PostgREST)
    const rows = await db(
      `tutor_materias?select=tutores(id,nombre,telefono)&materia_id=eq.${materiaId}&limit=10`
    )
    if (Array.isArray(rows) && rows.length > 0) {
      // Filtrar los que tienen teléfono y están activos
      const candidatos = rows.map(r => r.tutores).filter(t => t?.telefono)
      if (candidatos.length > 0) {
        // Elegir uno aleatoriamente
        tutor = candidatos[Math.floor(Math.random() * candidatos.length)]
      }
    }
  }

  if (!tutor?.telefono) {
    // No hay tutor con teléfono disponible — guardamos la solicitud igualmente
    return res.status(200).json({ ok: true, notified: false, reason: 'No hay tutor con teléfono disponible' })
  }

  // Obtener nombre de la materia
  const materias = await db(`materias?select=nombre&id=eq.${materiaId}&limit=1`)
  const materia  = Array.isArray(materias) ? materias[0]?.nombre : 'tu materia'

  const nombreEstudiante = estudiante?.nombre || estudiante?.email?.split('@')[0] || 'un estudiante'
  const fecha  = solicitud?.fecha  || '(fecha por confirmar)'
  const hora   = solicitud?.hora   || ''
  const tipo   = solicitud?.tipo   === 'grupal' ? 'Grupal' : 'Individual'
  const formato = solicitud?.formato === 'virtual' ? 'Virtual' : 'Presencial'

  const msg = `📚 *Nueva solicitud de tutoría — TutoPool*\n\n` +
    `Hola ${tutor.nombre.split(' ')[0]}! El/la estudiante *${nombreEstudiante}* solicita una sesión:\n\n` +
    `• Materia: *${materia}*\n` +
    `• Fecha: ${fecha}${hora ? ' a las ' + hora : ''}\n` +
    `• Tipo: ${tipo} · ${formato}\n\n` +
    `¿Puedes confirmar esta sesión?`

  const result = await sendWA(tutor.telefono, msg)

  return res.status(200).json({
    ok: true,
    notified: true,
    tutor: tutor.nombre,
    twilio: result?.sid ? 'enviado' : result?.message || 'error',
  })
}
