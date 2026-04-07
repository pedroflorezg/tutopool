import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

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

function twimlReply(msg) {
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${msg}</Message></Response>`
}

function fmtFecha(iso) {
  return new Date(iso).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/xml')
  if (req.method !== 'POST') return res.status(405).send('<Response></Response>')

  const from    = String(req.body?.From || '').replace('whatsapp:', '').replace('+', '').trim()
  const rawBody = String(req.body?.Body || '').trim()
  const upper   = rawBody.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
  const confirmed = upper === 'SI' || upper === 'SII'
  const denied    = upper === 'NO'

  if (!confirmed && !denied) {
    return res.status(200).send(twimlReply('Responde *SÍ* para confirmar o *NO* para cancelar la sesión.'))
  }

  // ── Find tutor by phone ──────────────────────────────────────────────────
  const { data: tutor } = await supabase
    .from('tutores')
    .select('id, nombre')
    .eq('telefono', from)
    .maybeSingle()

  if (!tutor) {
    return res.status(200).send(twimlReply('No encontramos tu perfil de tutor. Escríbenos a soporte.'))
  }

  // ── Find next upcoming active session for this tutor ────────────────────
  const { data: sesion } = await supabase
    .from('sesiones')
    .select('id, fecha_inicio, materias(nombre)')
    .eq('tutor_id', tutor.id)
    .in('estado', ['confirmada', 'esperando_cupos'])
    .gte('fecha_inicio', new Date().toISOString())
    .order('fecha_inicio')
    .limit(1)
    .maybeSingle()

  if (!sesion) {
    return res.status(200).send(twimlReply('No tienes sesiones activas próximas registradas.'))
  }

  const materia = sesion.materias?.nombre || 'tu materia'
  const fecha   = fmtFecha(sesion.fecha_inicio)

  // ── Update session status ────────────────────────────────────────────────
  await supabase
    .from('sesiones')
    .update({ estado: confirmed ? 'confirmada' : 'cancelada' })
    .eq('id', sesion.id)

  // ── Notify enrolled students ─────────────────────────────────────────────
  const { data: inscripciones } = await supabase
    .from('inscripciones')
    .select('estudiante_id')
    .eq('sesion_id', sesion.id)

  if (inscripciones?.length) {
    const ids = inscripciones.map(i => i.estudiante_id)
    const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 200 })
    const students = (users || []).filter(u => ids.includes(u.id))

    for (const student of students) {
      const phone = student.phone?.replace(/\D/g, '')
      if (!phone) continue
      const nombre = student.user_metadata?.full_name
        || student.user_metadata?.name
        || student.email?.split('@')[0]
        || 'estudiante'

      const msg = confirmed
        ? `✅ *TutoPool — Sesión Confirmada*\n\nHola ${nombre}! Tu sesión de *${materia}* del ${fecha} ha sido *confirmada* por el tutor ${tutor.nombre}. ¡Nos vemos pronto! 🚀`
        : `❌ *TutoPool — Sesión Cancelada*\n\nHola ${nombre}, lamentamos informarte que la sesión de *${materia}* del ${fecha} fue *cancelada* por el tutor. Pronto te contactaremos para reagendarla. 🙏`

      await sendWA(phone, msg)
    }
  }

  // ── Reply to tutor ───────────────────────────────────────────────────────
  const reply = confirmed
    ? `✅ ¡Perfecto, ${tutor.nombre}! La sesión de *${materia}* del ${fecha} ha sido confirmada. Los estudiantes ya fueron notificados.`
    : `❌ Entendido, ${tutor.nombre}. La sesión de *${materia}* fue cancelada y los estudiantes han sido notificados.`

  return res.status(200).send(twimlReply(reply))
}
