// Helper compartido para enviar emails via Resend
// Usado por todos los endpoints de notificación como respaldo de WhatsApp

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL     = process.env.NOTIFY_FROM_EMAIL || 'TutoPool <notificaciones@tutopool.app>'

export async function sendEmail(to, subject, html) {
  if (!RESEND_API_KEY || !to) return { ok: false, reason: 'sin config o destinatario' }

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  })
  const data = await resp.json()
  return { ok: resp.ok, id: data.id, error: data.message }
}

// Convierte texto con *negrita* y saltos de línea a HTML básico
export function toHtml(text) {
  return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;max-width:560px;margin:0 auto;padding:24px">
    <div style="background:#6c47ff;padding:16px 24px;border-radius:8px 8px 0 0">
      <span style="color:white;font-weight:700;font-size:18px">TutoPool</span>
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:28px;border-radius:0 0 8px 8px">
      ${text
        .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>')}
    </div>
    <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px">
      TutoPool · Este es un mensaje automático, no respondas a este correo.
    </p>
  </div>`
}
