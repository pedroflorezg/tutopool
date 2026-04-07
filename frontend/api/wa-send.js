export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { to, message } = req.body || {}
  if (!to || !message) return res.status(400).json({ error: 'Faltan campos: to, message' })

  const sid   = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from  = process.env.TWILIO_WA_FROM   // e.g. whatsapp:+14155238886

  if (!sid || !token || !from) {
    return res.status(503).json({ error: 'WhatsApp no configurado (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_WA_FROM).' })
  }

  const number = `whatsapp:+${String(to).replace(/\D/g, '')}`

  const body = new URLSearchParams({ From: from, To: number, Body: message })

  const resp = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  const data = await resp.json()
  return res.status(resp.ok ? 200 : resp.status).json(data)
}
