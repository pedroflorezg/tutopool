export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { to, message } = req.body || {}
  if (!to || !message) return res.status(400).json({ error: 'Faltan campos: to, message' })

  const phoneId = process.env.META_WA_PHONE_ID
  const token   = process.env.META_WA_TOKEN

  if (!phoneId || !token) {
    return res.status(503).json({ error: 'WhatsApp no configurado en el servidor (META_WA_PHONE_ID / META_WA_TOKEN).' })
  }

  const number = String(to).replace(/\D/g, '')

  const resp = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: number,
      type: 'text',
      text: { body: message },
    }),
  })

  const data = await resp.json()
  return res.status(resp.ok ? 200 : resp.status).json(data)
}
