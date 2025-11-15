import express from 'express';
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const WEBHOOK_URL = process.env.BACKEND_WEBHOOK_URL || 'http://localhost:3000/api/v1/webhooks/whatsapp';

// Initialize WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './.wwebjs_auth',
  }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

// QR Code generation
client.on('qr', (qr) => {
  console.log('📱 Escaneie o QR Code abaixo com seu WhatsApp:');
  qrcode.generate(qr, { small: true });
});

// Client ready
client.on('ready', () => {
  console.log('✅ WhatsApp client is ready!');
});

// Handle incoming messages
client.on('message', async (message) => {
  console.log(`📩 Message from ${message.from}: ${message.body}`);

  try {
    // Forward message to backend webhook
    await axios.post(WEBHOOK_URL, {
      from: message.from,
      body: message.body,
      timestamp: message.timestamp,
      isGroup: message.from.includes('@g.us'),
    });

    console.log('✅ Message forwarded to backend');
  } catch (error) {
    console.error('❌ Error forwarding message:', error.message);
  }
});

// Handle disconnection
client.on('disconnected', (reason) => {
  console.log('⚠️ Client was disconnected:', reason);
});

// Initialize client
client.initialize();

// API endpoint to send messages
app.post('/send', async (req, res) => {
  const { to, message, context } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: 'Missing required fields: to, message' });
  }

  try {
    // Format phone number (remove special chars and add country code if needed)
    let phoneNumber = to.replace(/\D/g, '');
    if (!phoneNumber.startsWith('55')) {
      phoneNumber = '55' + phoneNumber;
    }

    const chatId = phoneNumber + '@c.us';

    // Send message
    await client.sendMessage(chatId, message);

    console.log(`✅ Message sent to ${chatId}`);

    res.json({
      success: true,
      to: chatId,
      context,
    });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  const state = client.info ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    whatsapp: state,
    info: client.info,
  });
});

// Start HTTP server
app.listen(PORT, () => {
  console.log(`🚀 WhatsApp service running on http://localhost:${PORT}`);
  console.log(`📡 Webhook URL: ${WEBHOOK_URL}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('👋 Shutting down gracefully...');
  await client.destroy();
  process.exit(0);
});
