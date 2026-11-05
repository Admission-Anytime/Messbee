const Message = require('../models/Message');

const CUSTOMER_SERVICE_WINDOW_MS = 24 * 60 * 60 * 1000;

async function getLastInboundAt(chat) {
  if (!chat?._id) return null;

  if (chat.lastInboundAt) {
    return new Date(chat.lastInboundAt);
  }

  const latestInbound = await Message.findOne({
    chatId: chat._id,
    $or: [
      { sender: 'them' },
      { sender: 'customer' },
      { direction: 'INBOUND' },
      { direction: 'inbound' }
    ],
    isDeleted: false
  })
    .sort({ createdAt: -1 })
    .select('createdAt')
    .lean();

  return latestInbound?.createdAt ? new Date(latestInbound.createdAt) : null;
}

async function hasActiveCustomerWindow(chat, now = new Date(), user = null) {
  // Free QR WhatsApp has no 24-hour window restriction!
  if (user?.whatsappChannelType === 'free_qr' || chat?.source === 'free_qr') {
    return true;
  }

  const lastInboundAt = await getLastInboundAt(chat);

  if (!lastInboundAt) {
    return false;
  }

  return now.getTime() - lastInboundAt.getTime() < CUSTOMER_SERVICE_WINDOW_MS;
}

module.exports = {
  CUSTOMER_SERVICE_WINDOW_MS,
  getLastInboundAt,
  hasActiveCustomerWindow
};
