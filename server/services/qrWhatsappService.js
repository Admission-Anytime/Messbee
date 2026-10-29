const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadMediaMessage,
  WAMessageStatus
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

// Directory to store inbound downloaded QR media
const QR_MEDIA_DIR = path.join(__dirname, '../uploads/qr_media');
if (!fs.existsSync(QR_MEDIA_DIR)) {
  fs.mkdirSync(QR_MEDIA_DIR, { recursive: true });
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

          try {
            const User = require('../models/User');
            await User.findByIdAndUpdate(tenantId, {
              $set: {
                tenantWhatsAppConnected: false
              }
            });
          } catch (uErr) {
            console.warn('[QRService] Failed to reset connected state on User:', uErr.message);
          }

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

        try {
          const User = require('../models/User');
          await User.findByIdAndUpdate(tenantId, {
            $set: {
              tenantWhatsAppConnected: true,
              whatsappChannelType: 'free_qr'
            }
          });
        } catch (uErr) {
          console.warn('[QRService] Failed to sync connected state to User:', uErr.message);
        }

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
            const User = require('../models/User');
            await User.findByIdAndUpdate(tenantId, {
              $set: {
                tenantWhatsAppConnected: false
              }
            });
          } catch (uErr) {
            console.warn('[QRService] Failed to reset connected state on User:', uErr.message);
          }

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

          try {
            const User = require('../models/User');
            await User.findByIdAndUpdate(tenantId, {
              $set: {
                tenantWhatsAppConnected: false
              }
            });
          } catch (uErr) {
            console.warn('[QRService] Failed to reset connected state on User:', uErr.message);
          }

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

          // Unwrap ephemeral, viewOnce, or nested document messages
          let msgContent = m.message;
          if (msgContent?.ephemeralMessage) msgContent = msgContent.ephemeralMessage.message;
          if (msgContent?.viewOnceMessage) msgContent = msgContent.viewOnceMessage.message;
          if (msgContent?.viewOnceMessageV2) msgContent = msgContent.viewOnceMessageV2.message;
          if (msgContent?.documentWithCaptionMessage) msgContent = msgContent.documentWithCaptionMessage.message;

          const isImage = !!msgContent?.imageMessage;
          const isVideo = !!msgContent?.videoMessage;
          const isAudio = !!msgContent?.audioMessage;
          const isDocument = !!msgContent?.documentMessage;
          const isSticker = !!msgContent?.stickerMessage;
          const hasMedia = isImage || isVideo || isAudio || isDocument || isSticker;

          let mediaType = 'text';
          let caption = '';
          let fileName = '';
          let mimetype = '';

          if (isImage) {
            mediaType = 'image';
            caption = msgContent.imageMessage.caption || '';
            mimetype = msgContent.imageMessage.mimetype || 'image/jpeg';
          } else if (isVideo) {
            mediaType = 'video';
            caption = msgContent.videoMessage.caption || '';
            mimetype = msgContent.videoMessage.mimetype || 'video/mp4';
          } else if (isAudio) {
            mediaType = 'audio';
            mimetype = msgContent.audioMessage.mimetype || 'audio/ogg; codecs=opus';
          } else if (isDocument) {
            mediaType = 'document';
            caption = msgContent.documentMessage.caption || '';
            fileName = msgContent.documentMessage.fileName || 'document.pdf';
            mimetype = msgContent.documentMessage.mimetype || 'application/pdf';
          } else if (isSticker) {
            mediaType = 'image';
            mimetype = msgContent.stickerMessage.mimetype || 'image/webp';
          }

          let relativeMediaUrl = '';
          if (hasMedia) {
            try {
              const mediaBuffer = await downloadMediaMessage(
                m,
                'buffer',
                {},
                {
                  logger: pino({ level: 'silent' }),
                  reuploadRequest: sock.updateMediaMessage
                }
              );

              if (mediaBuffer && mediaBuffer.length > 0) {
                let ext = 'bin';
                if (mimetype.includes('jpeg') || mimetype.includes('jpg')) ext = 'jpg';
                else if (mimetype.includes('png')) ext = 'png';
                else if (mimetype.includes('webp')) ext = 'webp';
                else if (mimetype.includes('mp4')) ext = 'mp4';
                else if (mimetype.includes('ogg') || mimetype.includes('opus')) ext = 'ogg';
                else if (mimetype.includes('mp3') || mimetype.includes('mpeg')) ext = 'mp3';
                else if (mimetype.includes('pdf')) ext = 'pdf';
                else if (fileName && fileName.includes('.')) ext = fileName.split('.').pop();
                else if (mediaType === 'image') ext = 'jpg';
                else if (mediaType === 'video') ext = 'mp4';
                else if (mediaType === 'audio') ext = 'ogg';

                const safeName = `qr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
                const fullPath = path.join(QR_MEDIA_DIR, safeName);
                fs.writeFileSync(fullPath, mediaBuffer);
                relativeMediaUrl = `/uploads/qr_media/${safeName}`;
                if (!fileName) fileName = safeName;
              }
            } catch (dlErr) {
              console.error('[QRService] Failed to download inbound media:', dlErr.message);
            }
          }

          // Extract text from standard message types
          const text =
            caption ||
            msgContent?.conversation ||
            msgContent?.extendedTextMessage?.text ||
            (isImage ? '📷 Photo' : isAudio ? '🎵 Voice Note' : isVideo ? '🎥 Video' : isDocument ? (fileName ? `📎 ${fileName}` : '📎 Document') : isSticker ? '✨ Sticker' : '[Message]');

          const Chat = require('../models/Chat');
          const Message = require('../models/Message');
          const Contact = require('../models/Contact');

          const now = new Date();
          const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          const rawDigits = senderPhone.replace(/\D/g, '');
          const last10 = rawDigits.slice(-10);
          const phoneVariants = [
            senderPhone,
            rawDigits,
            last10,
            `+${rawDigits}`,
            `91${last10}`,
            `+91${last10}`
          ];

          // 1. Find or auto-create CRM Contact
          let contact = null;
          try {
            contact = await Contact.findOne({
              $or: [
                { user: tenantId, whatsapp: { $in: phoneVariants } },
                { user: tenantId, phone: { $in: phoneVariants } },
                { tenantId: tenantId, whatsapp: { $in: phoneVariants } },
                { tenantId: tenantId, phone: { $in: phoneVariants } }
              ]
            });

            if (!contact) {
              try {
                contact = await Contact.create({
                  user: tenantId,
                  tenantId: tenantId,
                  name: pushName || senderPhone,
                  whatsapp: senderPhone,
                  phone: senderPhone,
                  status: 'ACTIVE',
                  tags: ['WhatsApp Web'],
                  lastInteractionAt: now
                });

                const io = getIO();
                if (io) {
                  io.to(`tenant_${tenantId.toString()}`).emit('contact_created', contact);
                }
              } catch (createErr) {
                contact = await Contact.findOne({
                  $or: [
                    { user: tenantId, whatsapp: { $in: phoneVariants } },
                    { user: tenantId, phone: { $in: phoneVariants } }
                  ]
                });
              }
            } else {
              contact.lastInteractionAt = now;
              if (pushName && (contact.name === senderPhone || !contact.name || contact.name === 'Unknown')) {
                contact.name = pushName;
              }
              await contact.save().catch(() => {});
            }
          } catch (cErr) {
            console.warn('[QRService] Contact sync warning:', cErr.message);
          }

          // 2. Fetch avatar if available from WhatsApp
          let avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(pushName)}&background=random`;
          try {
            const pp = await sock.profilePictureUrl(remoteJid, 'image').catch(() => null);
            if (pp) avatarUrl = pp;
          } catch (e) {}

          // 3. Find or create chat document
          let isNewChat = false;
          let chat = await Chat.findOne({
            user: tenantId,
            $or: [
              { phone: { $in: phoneVariants } },
              { whatsappId: { $in: phoneVariants } }
            ]
          });

          if (!chat) {
            isNewChat = true;
            chat = await Chat.create({
              name: pushName,
              phone: senderPhone,
              whatsappId: senderPhone,
              avatar: avatarUrl,
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
            if (!chat.avatar || chat.avatar.includes('ui-avatars.com')) {
              chat.avatar = avatarUrl;
            }
            await chat.save();
          }

          // 4. Save Message
          const newMsg = await Message.create({
            chatId: chat._id,
            tenantId: tenantId,
            contactId: contact ? contact._id : undefined,
            sender: 'customer',
            senderType: 'CUSTOMER',
            direction: 'INBOUND',
            text: text,
            messageType: mediaType,
            mediaUrl: relativeMediaUrl || undefined,
            fileName: fileName || undefined,
            time: timeStr,
            whatsappMessageId: m.key.id,
            status: 'delivered'
          });

          // 5. Broadcast real-time message to socket.io
          const io = getIO();
          if (io) {
            const tenantRoom = `tenant_${tenantId.toString()}`;
            const chatRoom = chat._id.toString();

            // Emit receive_message to active chat window & tenant room
            io.to(chatRoom).to(tenantRoom).to(tenantId.toString()).emit('receive_message', {
              chatId: chat._id,
              message: newMsg,
              chat: chat
            });

            // Emit chat list update strictly to this tenant's sidebar
            if (isNewChat) {
              io.to(tenantRoom).to(tenantId.toString()).emit('chat_created', chat);
            } else {
              io.to(tenantRoom).to(tenantId.toString()).emit('chat_updated', chat);
            }

            // Emit analytics update event
            io.to(tenantRoom).emit('analytics_updated');
          }

          // 6. Check Auto-Reply / Welcome Trigger
          try {
            const TenantSettings = require('../models/TenantSettings');
            const tenantSettings = await TenantSettings.findOne({ tenantId });

            let autoReplyText = null;

            // A. Welcome Message for first-time chats
            if (isNewChat && tenantSettings?.welcomeMessage?.enabled && tenantSettings.welcomeMessage?.textMessage) {
              autoReplyText = tenantSettings.welcomeMessage.textMessage;
            }

            // B. Keyword Auto-Response via QuickReplies (e.g. customer types "/menu" or "menu")
            if (!autoReplyText && text && typeof text === 'string') {
              const cleanKeyword = text.trim().toLowerCase().replace(/^\//, '');
              const QuickReply = require('../models/QuickReply');
              const matchedReply = await QuickReply.findOne({
                user: tenantId,
                shortcut: new RegExp(`^${cleanKeyword}$`, 'i')
              });
              if (matchedReply && matchedReply.content) {
                autoReplyText = matchedReply.content;
              }
            }

            if (autoReplyText) {
              // Send auto-reply with a short natural human-like delay (1.5 seconds)
              setTimeout(async () => {
                try {
                  const botRes = await sendQrMessage(tenantId, senderPhone, autoReplyText);
                  const botTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const botMsg = await Message.create({
                    chatId: chat._id,
                    tenantId: tenantId,
                    contactId: contact ? contact._id : undefined,
                    sender: 'bot',
                    senderType: 'BOT',
                    direction: 'OUTBOUND',
                    text: autoReplyText,
                    messageType: 'text',
                    time: botTimeStr,
                    whatsappMessageId: botRes?.key?.id,
                    status: 'delivered'
                  });

                  chat.lastMsg = autoReplyText;
                  chat.lastMsgTime = botTimeStr;
                  chat.lastActivity = new Date();
                  await chat.save();

                  if (io) {
                    const tenantRoom = `tenant_${tenantId.toString()}`;
                    const chatRoom = chat._id.toString();
                    io.to(chatRoom).to(tenantRoom).to(tenantId.toString()).emit('receive_message', {
                      chatId: chat._id,
                      message: botMsg,
                      chat: chat
                    });
                    io.to(tenantRoom).to(tenantId.toString()).emit('chat_updated', chat);
                  }
                } catch (botErr) {
                  console.warn('[QRService] Auto-reply send error:', botErr.message);
                }
              }, 1500);
            }
          } catch (autoErr) {
            console.warn('[QRService] Auto-responder evaluation error:', autoErr.message);
          }
        } catch (msgErr) {
          console.error('[QRService] Error processing inbound message:', msgErr);
        }
      }
    });

    // Handle delivery & read receipts (Double Blue Ticks)
    sock.ev.on('messages.update', async (updates) => {
      for (const update of updates) {
        const { key, update: updateFields } = update;
        if (!key?.id) continue;

        let newStatus = null;
        if (updateFields?.status !== undefined) {
          const st = updateFields.status;
          if (st === 2) newStatus = 'sent';
          else if (st === 3) newStatus = 'delivered';
          else if (st === 4 || st === 5) newStatus = 'read';
          else if (st === 0) newStatus = 'failed';
        }

        if (newStatus) {
          try {
            const Message = require('../models/Message');
            const updatedMsg = await Message.findOneAndUpdate(
              { whatsappMessageId: key.id },
              { status: newStatus, statusTimestamp: new Date() },
              { new: true }
            );

            if (updatedMsg) {
              const io = getIO();
              if (io) {
                const tenantRoom = `tenant_${tenantIdStr}`;
                const chatRoom = updatedMsg.chatId?.toString();
                const payload = {
                  messageId: updatedMsg._id,
                  whatsappMessageId: key.id,
                  chatId: updatedMsg.chatId,
                  status: newStatus
                };
                if (chatRoom) io.to(chatRoom).emit('message_status_update', payload);
                io.to(tenantRoom).to(tenantIdStr).emit('message_status_update', payload);
              }
            }
          } catch (err) {
            console.error('[QRService] Error updating message status:', err.message);
          }
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

  try {
    const User = require('../models/User');
    await User.findByIdAndUpdate(tenantId, {
      $set: { tenantWhatsAppConnected: false }
    });
  } catch (uErr) {
    console.warn('[QRService] Failed to reset connected state on User:', uErr.message);
  }

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
  let content = typeof messagePayload === 'string' ? { text: messagePayload } : { ...messagePayload };

  // Resolve local upload URLs to buffer if needed so Baileys doesn't fail fetch
  const mediaKeys = ['image', 'video', 'audio', 'document', 'sticker'];
  for (const k of mediaKeys) {
    if (content[k] && content[k].url && typeof content[k].url === 'string') {
      const urlStr = content[k].url;
      if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
        const cleanPath = urlStr.replace(/^\/?(api\/)?uploads\//, '');
        const localPath = path.join(__dirname, '../uploads', cleanPath);
        if (fs.existsSync(localPath)) {
          content[k] = fs.readFileSync(localPath);
        }
      }
    }
  }

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
