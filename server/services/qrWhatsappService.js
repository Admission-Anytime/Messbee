const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');
const pino = require('pino');
const QrSession = require('../models/QrSession');
const { getIO } = require('../config/socket');

// Directory to store session credentials
const SESSIONS_DIR = path.join(__dirname, '../sessions');
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

// In-memory map of active Baileys socket connections by tenantId (string)
const activeSockets = new Map();
// Prevent reconnect storms
const reconnectTimeouts = new Map();

/**
 * Emit socket update to tenant room
 */
const emitTenantUpdate = (tenantId, event, data) => {
  try {
    const io = getIO();
    if (io) {
      const tIdStr = tenantId.toString();
      io.to(tIdStr).emit(event, data);
      io.to(`tenant_${tIdStr}`).emit(event, data);
    }
  } catch (err) {
    console.error(`[QRService] Socket emit error for ${tenantId}:`, err.message);
  }
};

/**
 * Start or resume a WhatsApp Web session for a tenant
 */
const startSession = async (tenantId) => {
  const tenantIdStr = tenantId.toString();

  // If already connected and socket is open, return current status
  if (activeSockets.has(tenantIdStr)) {
    const existingSock = activeSockets.get(tenantIdStr);
    if (existingSock?.user) {
      const dbSession = await QrSession.findOne({ tenantId });
      return {
        success: true,
        status: 'CONNECTED',
        phoneNumber: dbSession?.phoneNumber || existingSock.user.id.split(':')[0],
        pushName: dbSession?.pushName || existingSock.user.name || 'WhatsApp User'
      };
    }
  }

  // Clear any existing reconnect timer
  if (reconnectTimeouts.has(tenantIdStr)) {
    clearTimeout(reconnectTimeouts.get(tenantIdStr));
    reconnectTimeouts.delete(tenantIdStr);
  }

  const sessionPath = path.join(SESSIONS_DIR, `session_${tenantIdStr}`);
  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }

  console.log(`[QRService] Initializing Baileys session for tenant: ${tenantIdStr}`);

  // Fetch or create QrSession record
  let sessionDoc = await QrSession.findOne({ tenantId });
  if (!sessionDoc) {
    sessionDoc = await QrSession.create({
      tenantId,
      status: 'CONNECTING'
    });
  } else {
    sessionDoc.status = 'CONNECTING';
    await sessionDoc.save();
  }

  emitTenantUpdate(tenantId, 'qr_status_changed', { status: 'CONNECTING' });

  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      auth: state,
      printQRInTerminal: false,
      browser: ['Messbee Free Hub', 'Chrome', '1.0.0'],
      syncFullHistory: false,
      generateHighQualityLinkPreview: true,
      defaultQueryTimeoutMs: 60000
    });

    activeSockets.set(tenantIdStr, sock);

    // Save auth credentials whenever updated
    sock.ev.on('creds.update', saveCreds);

    // Handle connection lifecycle
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      // New QR Code available
      if (qr) {
        try {
          const qrCodeDataUrl = await qrcode.toDataURL(qr, {
            margin: 2,
            width: 320,
            color: { dark: '#111827', light: '#FFFFFF' }
          });

          sessionDoc.status = 'QR_READY';
          sessionDoc.qrCodeDataUrl = qrCodeDataUrl;
          sessionDoc.qrRaw = qr;
          sessionDoc.qrExpiresAt = new Date(Date.now() + 45000);
          await sessionDoc.save();

          console.log(`[QRService] Generated new QR code for tenant: ${tenantIdStr}`);
          emitTenantUpdate(tenantId, 'qr_code', {
            status: 'QR_READY',
            qrCodeDataUrl,
            expiresAt: sessionDoc.qrExpiresAt
          });
        } catch (err) {
          console.error(`[QRService] QR generation error:`, err);
        }
      }

      // Connection opened successfully
      if (connection === 'open') {
        const rawId = sock.user?.id || '';
        const cleanNumber = rawId.split(':')[0] || rawId.split('@')[0];
        const pushName = sock.user?.name || 'WhatsApp Business';

        sessionDoc.status = 'CONNECTED';
        sessionDoc.phoneNumber = cleanNumber;
        sessionDoc.pushName = pushName;
        sessionDoc.connectedAt = new Date();
        sessionDoc.qrCodeDataUrl = '';
        sessionDoc.qrRaw = '';
        await sessionDoc.save();

        console.log(`[QRService] ✅ WhatsApp CONNECTED for tenant ${tenantIdStr}: +${cleanNumber}`);
        emitTenantUpdate(tenantId, 'qr_connected', {
          status: 'CONNECTED',
          phoneNumber: cleanNumber,
          pushName,
          connectedAt: sessionDoc.connectedAt
        });
      }

      // Connection closed / disconnected
      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut;

        console.log(`[QRService] Connection closed for tenant ${tenantIdStr}. Status code: ${statusCode}, LoggedOut: ${isLoggedOut}`);

        if (isLoggedOut) {
          // User unlinked via phone -> clean credentials
          activeSockets.delete(tenantIdStr);
          sessionDoc.status = 'DISCONNECTED';
          sessionDoc.phoneNumber = '';
          sessionDoc.pushName = '';
          sessionDoc.qrCodeDataUrl = '';
          sessionDoc.qrRaw = '';
          sessionDoc.disconnectedAt = new Date();
          await sessionDoc.save();

          try {
            if (fs.existsSync(sessionPath)) {
              fs.rmSync(sessionPath, { recursive: true, force: true });
            }
          } catch (e) {
            console.error('[QRService] Error cleaning session folder:', e.message);
          }

          emitTenantUpdate(tenantId, 'qr_disconnected', {
            status: 'DISCONNECTED',
            reason: 'LOGGED_OUT'
          });
        } else {
          // Reconnectable drop (e.g. network hiccup)
          sessionDoc.status = 'CONNECTING';
          await sessionDoc.save();

          const timeout = setTimeout(() => {
            console.log(`[QRService] Attempting reconnection for tenant: ${tenantIdStr}`);
            startSession(tenantId).catch(err => console.error('[QRService] Reconnect failed:', err));
          }, 3000);
          reconnectTimeouts.set(tenantIdStr, timeout);
        }
      }
    });

    // Handle incoming messages from WhatsApp customers
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      for (const m of messages) {
        if (!m.message || m.key.fromMe) continue;

        try {
          const remoteJid = m.key.remoteJid || '';
          if (!remoteJid || remoteJid.includes('@g.us')) continue; // skip group chats

          const senderPhone = remoteJid.split('@')[0].split(':')[0];
          const pushName = m.pushName || senderPhone;

          // Extract text from standard message types
          const text =
            m.message?.conversation ||
            m.message?.extendedTextMessage?.text ||
            m.message?.imageMessage?.caption ||
            m.message?.videoMessage?.caption ||
            (m.message?.imageMessage ? '[Image]' : '') ||
            (m.message?.documentMessage ? (m.message?.documentMessage?.fileName || '[Document]') : '') ||
            (m.message?.audioMessage ? '[Voice Note]' : '[Message]');

          const Chat = require('../models/Chat');
          const Message = require('../models/Message');

          const now = new Date();
          const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          // Find or create chat document
          let isNewChat = false;
          let chat = await Chat.findOne({
            user: tenantId,
            $or: [{ phone: senderPhone }, { whatsappId: senderPhone }]
          });

          if (!chat) {
            isNewChat = true;
            chat = await Chat.create({
              name: pushName,
              phone: senderPhone,
              whatsappId: senderPhone,
              source: 'whatsapp',
              status: 'active',
              chatStatus: 'open',
              unread: 1,
              lastMsg: text,
              lastMsgTime: timeStr,
              lastInboundAt: now,
              lastActivity: now,
              user: tenantId
            });
          } else {
            chat.unread = (chat.unread || 0) + 1;
            chat.lastMsg = text;
            chat.lastMsgTime = timeStr;
            chat.lastInboundAt = now;
            chat.lastActivity = now;
            await chat.save();
          }

          // Save Message
          const newMsg = await Message.create({
            chatId: chat._id,
            tenantId: tenantId,
            sender: 'customer',
            senderType: 'CUSTOMER',
            direction: 'INBOUND',
            text: text,
            messageType: 'text',
            time: timeStr,
            whatsappMessageId: m.key.id,
            status: 'delivered'
          });

          // Broadcast real-time message to socket.io (matching chat.jsx listeners)
          const io = getIO();
          if (io) {
            const tenantRoom = `tenant_${tenantId.toString()}`;
            const chatRoom = chat._id.toString();

            // 1. Emit receive_message to active chat window & tenant room
            io.to(chatRoom).to(tenantRoom).to(tenantId.toString()).emit('receive_message', {
              chatId: chat._id,
              message: newMsg,
              chat: chat
            });

            // 2. Emit chat list update strictly to this tenant's sidebar
            if (isNewChat) {
              io.to(tenantRoom).to(tenantId.toString()).emit('chat_created', chat);
            } else {
              io.to(tenantRoom).to(tenantId.toString()).emit('chat_updated', chat);
            }

            // 3. Emit analytics update event
            io.to(tenantRoom).emit('analytics_updated');
          }
        } catch (msgErr) {
          console.error('[QRService] Error processing inbound message:', msgErr);
        }
      }
    });

    return {
      success: true,
      status: sessionDoc.status,
      qrCodeDataUrl: sessionDoc.qrCodeDataUrl
    };
  } catch (error) {
    console.error(`[QRService] Error starting session for tenant ${tenantIdStr}:`, error);
    sessionDoc.status = 'DISCONNECTED';
    await sessionDoc.save();
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Get current session status
 */
const getSessionStatus = async (tenantId) => {
  const tenantIdStr = tenantId.toString();
  const sessionDoc = await QrSession.findOne({ tenantId });
  const inMemorySock = activeSockets.get(tenantIdStr);

  const isConnected = !!(inMemorySock?.user && sessionDoc?.status === 'CONNECTED');

  return {
    success: true,
    status: isConnected ? 'CONNECTED' : (sessionDoc?.status || 'DISCONNECTED'),
    phoneNumber: sessionDoc?.phoneNumber || (inMemorySock?.user?.id?.split(':')[0] || ''),
    pushName: sessionDoc?.pushName || inMemorySock?.user?.name || '',
    qrCodeDataUrl: sessionDoc?.qrCodeDataUrl || '',
    connectedAt: sessionDoc?.connectedAt || null
  };
};

/**
 * Disconnect and unlink phone
 */
const disconnectSession = async (tenantId) => {
  const tenantIdStr = tenantId.toString();
  const sock = activeSockets.get(tenantIdStr);

  if (sock) {
    try {
      await sock.logout();
    } catch (e) {
      console.warn(`[QRService] Logout error (ignoring):`, e.message);
    }
    activeSockets.delete(tenantIdStr);
  }

  const sessionPath = path.join(SESSIONS_DIR, `session_${tenantIdStr}`);
  try {
    if (fs.existsSync(sessionPath)) {
      fs.rmSync(sessionPath, { recursive: true, force: true });
    }
  } catch (e) {
    console.error('[QRService] Folder deletion error:', e.message);
  }

  await QrSession.findOneAndUpdate(
    { tenantId },
    {
      status: 'DISCONNECTED',
      phoneNumber: '',
      pushName: '',
      qrCodeDataUrl: '',
      qrRaw: '',
      disconnectedAt: new Date()
    },
    { upsert: true }
  );

  emitTenantUpdate(tenantId, 'qr_disconnected', { status: 'DISCONNECTED' });

  return {
    success: true,
    message: 'WhatsApp session disconnected successfully'
  };
};

/**
 * Send message through active Baileys socket
 */
const sendQrMessage = async (tenantId, toPhone, messagePayload) => {
  const tenantIdStr = tenantId.toString();
  const sock = activeSockets.get(tenantIdStr);

  if (!sock) {
    throw new Error('WhatsApp is not connected via QR. Please link your WhatsApp in Settings.');
  }

  // Format recipient JID: 919876543210@s.whatsapp.net
  let cleanPhone = toPhone.toString().replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }
  if (!cleanPhone.includes('@')) {
    cleanPhone = `${cleanPhone}@s.whatsapp.net`;
  }

  // Format payload: if string, convert to text: string
  const content = typeof messagePayload === 'string' ? { text: messagePayload } : messagePayload;
  const result = await sock.sendMessage(cleanPhone, content);
  return result;
};

/**
 * Auto-restore active sessions on server boot
 */
const restoreActiveSessions = async () => {
  try {
    const connectedSessions = await QrSession.find({ status: 'CONNECTED' });
    if (connectedSessions.length > 0) {
      console.log(`[QRService] Found ${connectedSessions.length} active sessions to restore on server boot`);
      for (const session of connectedSessions) {
        startSession(session.tenantId).catch(err => {
          console.warn(`[QRService] Failed to auto-restore session for ${session.tenantId}:`, err.message);
        });
      }
    }
  } catch (err) {
    console.error('[QRService] Error restoring active sessions:', err);
  }
};

module.exports = {
  startSession,
  getSessionStatus,
  disconnectSession,
  sendQrMessage,
  restoreActiveSessions
};
