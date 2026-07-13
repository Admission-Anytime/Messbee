import Message from '../models/Message.js';
import Contact from '../models/Contact.js';
import Channel from '../models/Channel.js';
import axios from 'axios';

// Get all recent threads (last message per contact)
export const getInboxThreads = async (req, res) => {
  try {
    // A simple aggregation to get the latest message for each contact
    const threads = await Message.aggregate([
      { $match: { tenantId: req.user.tenantId } },
      { $sort: { createdAt: -1 } },
      { $group: {
          _id: "$contactId",
          lastMessage: { $first: "$$ROOT" }
      }},
      { $lookup: {
          from: 'contacts',
          localField: '_id',
          foreignField: '_id',
          as: 'contact'
      }},
      { $unwind: "$contact" },
      { $sort: { "lastMessage.createdAt": -1 } }
    ]);
    
    res.status(200).json(threads);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch inbox threads', error: error.message });
  }
};

// Get full chat history for a specific contact
export const getChatHistory = async (req, res) => {
  try {
    const messages = await Message.find({ 
      contactId: req.params.contactId, 
      tenantId: req.user.tenantId 
    }).sort({ createdAt: 1 });
    
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch chat history', error: error.message });
  }
};

// Agent manually replies to a contact
export const sendManualMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const contactId = req.params.contactId;

    const contact = await Contact.findOne({ _id: contactId, tenantId: req.user.tenantId });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });

    const channel = await Channel.findOne({ _id: contact.channelId, tenantId: req.user.tenantId }).select('+metaAccessToken');
    if (!channel) return res.status(404).json({ message: 'Channel not found' });

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: contact.phone,
      type: 'text',
      text: { body: text }
    };

    // Send to Meta
    const url = `https://graph.facebook.com/v21.0/${channel.activeWhatsappPhoneNumberId}/messages`;
    const response = await axios.post(url, payload, {
      headers: { 'Authorization': `Bearer ${channel.metaAccessToken}`, 'Content-Type': 'application/json' }
    });
    const metaMessageId = response.data.messages[0].id;

    // Log the outbound message to Inbox
    const msg = await Message.create({
      tenantId: req.user.tenantId,
      channelId: channel._id,
      contactId: contact._id,
      direction: 'OUTBOUND',
      senderType: 'HUMAN_AGENT',
      messageType: 'text',
      content: text,
      metaMessageId,
      status: 'sent'
    });

    res.status(200).json(msg);
  } catch (error) {
    res.status(500).json({ message: 'Failed to send manual message', error: error.message });
  }
};

// Internal Helper for Webhook/Flow Engine to log messages silently
export const logMessageInternal = async (data) => {
  try {
    await Message.create(data);
  } catch (error) {
    console.error('Failed to log message internally:', error);
  }
};
