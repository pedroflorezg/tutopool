export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { to, message } = req.body || {}
  if (!to || !message) return res.status(400).json({ error: 'Faltan campos: to, message' })

  const sid        = process.env.TWILIO_ACCOUNT_SID
  const token      = process.env.TWILIO_AUTH_TOKEN
  const from       = process.env.TWILIO_WA_FROM          // whatsapp:+14155238886
  const contentSid = process.env.TWILIO_CONTENT_SID      // HX... template con botones

  if (!sid || !token || !from) {
    return res.status(503).json({ error: 'WhatsApp no configurado (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_WA_FROM).' })
  }

  const number = `whatsapp:+${String(to).replace(/\D/g, '')}`

  // Si el template está configurado, usar botones interactivos (quick-reply)
  const params = contentSid
    ? {
        From: from,
        To: number,
        ContentSid: contentSid,
        ContentVariables: JSON.stringify({ '1': message }),
      }
    : {
        From: from,
        To: number,
        Body: message,
      }

  const resp = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params).toString(),
  })

  const data = await resp.json()
  return res.status(resp.ok ? 200 : resp.status).json(data)
}
