const Message = require('../models/Message');
const Contact = require('../models/Contact');
const Campaign = require('../models/Campaign');

/**
 * Send message service
 */
exports.sendMessageToContact = async (userId, contactId, messageData) => {
  try {
    const contact = await Contact.findOne({ _id: contactId, user: userId });
    
    if (!contact) {
      throw new Error('Contact not found');
    }

    const message = await Message.create({
      user: userId,
      contact: contactId,
      sender: 'user',
      content: messageData.content,
      messageType: messageData.messageType || 'text',
      mediaUrl: messageData.mediaUrl
    });

    // Update contact's last message date
    contact.lastMessageDate = new Date();
    await contact.save();

    return message;
  } catch (error) {
    throw error;
  }
};

/**
 * Send bulk messages (for campaigns)
 */
exports.sendBulkMessages = async (userId, campaignId, contacts, messageTemplate) => {
  try {
    const messages = [];
    const campaign = await Campaign.findById(campaignId);

    for (const contact of contacts) {
      try {
        // Personalize message with contact name
        const personalizedMessage = messageTemplate.replace('{{name}}', contact.name);

        const message = await Message.create({
          user: userId,
          contact: contact._id,
          sender: 'user',
          content: personalizedMessage,
          messageType: 'text',
          campaign: campaignId
        });

        messages.push(message);

        // Update campaign stats
        campaign.stats.sent += 1;
        campaign.stats.delivered += 1; // Assuming instant delivery for now

        // Update contact's last message date
        contact.lastMessageDate = new Date();
        await contact.save();
      } catch (error) {
        campaign.stats.failed += 1;
        console.error(`Failed to send message to ${contact.phone}:`, error.message);
      }
    }

    await campaign.save();

    return {
      success: true,
      totalSent: messages.length,
      failed: campaign.stats.failed
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get unread message count
 */
exports.getUnreadCount = async (userId) => {
  try {
    const count = await Message.countDocuments({
      user: userId,
      sender: 'contact',
      status: { $ne: 'read' }
    });

    return count;
  } catch (error) {
    throw error;
  }
};
