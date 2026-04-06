/**
 * TutoPool WhatsApp Bridge
 * Runs locally on the Mac. Uses whatsapp-web.js (real Chrome session).
 * Exposes an HTTP API on port 3001 that n8n calls to send messages.
 *
 * Start: node server.js
 * First run: shows QR code in terminal — scan with WhatsApp on phone.
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCodeImg = require('qrcode');
const express = require('express');

const app = express();
app.use(express.json());

// Allow calls from the local admin panel (localhost:5173 / any localhost origin)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

const PORT = 3001;
let isReady = false;

// ── WhatsApp Client ──────────────────────────────────────────────────────────
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './wa-session' }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', (qr) => {
  console.log('\n📱 Escanea este QR con tu WhatsApp (Dispositivos vinculados → Vincular dispositivo):\n');
  qrcode.generate(qr, { small: true });
  const qrPath = '/Users/pedroflorez/.gemini/antigravity/artifacts/whatsapp_qr.png';
  QRCodeImg.toFile(qrPath, qr, { scale: 8 }, function (err) {
    if (err) console.error('Error guardando imagen QR:', err);
    else console.log('✅ Imagen QR guardada en ' + qrPath);
  });
});

client.on('authenticated', () => {
  console.log('✅ Autenticado — sesión guardada en ./wa-session');
});

client.on('ready', () => {
  isReady = true;
  console.log(`✅ WhatsApp listo. Bridge escuchando en http://localhost:${PORT}`);
});

client.on('disconnected', (reason) => {
  isReady = false;
  console.log('❌ WhatsApp desconectado:', reason, '— reconectando en 5s...');
  setTimeout(() => {
    console.log('🔄 Reiniciando cliente WhatsApp...');
    client.initialize().catch(e => console.error('Error al reiniciar:', e.message));
  }, 5000);
});

client.initialize();

// ── HTTP API ─────────────────────────────────────────────────────────────────

// Health check
app.get('/health', (req, res) => {
  res.json({ status: isReady ? 'ready' : 'connecting', timestamp: new Date().toISOString() });
});

// Send message
// POST /send-message
// Body: { "to": "573001234567", "message": "Hola!" }
// "to" should be the phone number WITH country code, no + or spaces
app.post('/send-message', async (req, res) => {
  if (!isReady) {
    return res.status(503).json({ error: 'WhatsApp no está listo todavía' });
  }

  const { to, message } = req.body;
  if (!to || !message) {
    return res.status(400).json({ error: 'Campos requeridos: to, message' });
  }

  // Normalize number: remove +, spaces, dashes
  const number = to.toString().replace(/[\s+\-()]/g, '');
  const chatId = `${number}@c.us`;

  try {
    // Check if number exists on WhatsApp
    const isRegistered = await client.isRegisteredUser(chatId);
    if (!isRegistered) {
      return res.status(404).json({ error: `El número ${number} no está en WhatsApp` });
    }

    await client.sendMessage(chatId, message);
    console.log(`📤 Mensaje enviado a ${number}`);
    res.json({ success: true, to: number });
  } catch (err) {
    console.error('Error enviando mensaje:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 TutoPool WhatsApp Bridge iniciando en puerto ${PORT}...`);
  console.log('   Esperando conexión con WhatsApp...\n');
});
