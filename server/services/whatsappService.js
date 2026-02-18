const axios = require('axios');

/**
 * WhatsApp Business API Service
 * Handles all interactions with WhatsApp Cloud API
 */
class WhatsAppService {
  constructor() {
    this.apiVersion = process.env.WHATSAPP_API_VERSION || 'v18.0';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    this.baseURL = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}`;
  }

  /**
   * Send a text message via WhatsApp
   */
  async sendTextMessage(to, message) {
    try {
      const response = await axios.post(
        `${this.baseURL}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'text',
          text: {
            preview_url: true,
            body: message
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
        data: response.data
      };
    } catch (error) {
      console.error('WhatsApp Send Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Send a media message (image, video, document)
   */
  async sendMediaMessage(to, mediaType, mediaId, caption = '') {
    try {
      const messageData = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: mediaType,
        [mediaType]: {
          id: mediaId
        }
      };

      if (caption && (mediaType === 'image' || mediaType === 'video')) {
        messageData[mediaType].caption = caption;
      }

      const response = await axios.post(
        `${this.baseURL}/messages`,
        messageData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
        data: response.data
      };
    } catch (error) {
      console.error('WhatsApp Media Send Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Upload media to WhatsApp servers
   */
  async uploadMedia(fileUrl, mimeType) {
    try {
      const response = await axios.post(
        `${this.baseURL}/media`,
        {
          messaging_product: 'whatsapp',
          file: fileUrl,
          type: mimeType
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        mediaId: response.data.id
      };
    } catch (error) {
      console.error('WhatsApp Upload Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Send a template message
   */
  async sendTemplateMessage(to, templateName, languageCode = 'en', components = []) {
    try {
      const response = await axios.post(
        `${this.baseURL}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: languageCode
            },
            components: components
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
        data: response.data
      };
    } catch (error) {
      console.error('WhatsApp Template Send Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Mark message as read
   */
  async markMessageAsRead(messageId) {
    try {
      await axios.post(
        `${this.baseURL}/messages`,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true };
    } catch (error) {
      console.error('WhatsApp Mark Read Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get media URL from media ID
   */
  async getMediaUrl(mediaId) {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/${this.apiVersion}/${mediaId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return {
        success: true,
        url: response.data.url,
        mimeType: response.data.mime_type
      };
    } catch (error) {
      console.error('WhatsApp Get Media Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Download media from WhatsApp servers
   */
  async downloadMedia(mediaUrl) {
    try {
      const response = await axios.get(mediaUrl, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        responseType: 'arraybuffer'
      });

      return {
        success: true,
        data: response.data,
        contentType: response.headers['content-type']
      };
    } catch (error) {
      console.error('WhatsApp Download Media Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process incoming webhook from WhatsApp
   */
  processWebhook(webhookData) {
    try {
      const entry = webhookData.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (!value) {
        return { success: false, error: 'Invalid webhook data' };
      }

      // Handle incoming messages
      if (value.messages) {
        const message = value.messages[0];
        const contact = value.contacts?.[0];

        return {
          success: true,
          type: 'message',
          data: {
            messageId: message.id,
            from: message.from,
            timestamp: message.timestamp,
            messageType: message.type,
            contact: {
              name: contact?.profile?.name || 'Unknown',
              phone: message.from
            },
            message: this.extractMessageContent(message)
          }
        };
      }

      // Handle message status updates (delivered, read, etc.)
      if (value.statuses) {
        const status = value.statuses[0];
        return {
          success: true,
          type: 'status',
          data: {
            messageId: status.id,
            status: status.status,
            timestamp: status.timestamp,
            recipientId: status.recipient_id
          }
        };
      }

      return { success: false, error: 'Unknown webhook type' };
    } catch (error) {
      console.error('Webhook Processing Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Extract message content based on type
   */
  extractMessageContent(message) {
    switch (message.type) {
      case 'text':
        return {
          text: message.text.body
        };
      case 'image':
        return {
          mediaId: message.image.id,
          caption: message.image.caption,
          mimeType: message.image.mime_type
        };
      case 'video':
        return {
          mediaId: message.video.id,
          caption: message.video.caption,
          mimeType: message.video.mime_type
        };
      case 'audio':
        return {
          mediaId: message.audio.id,
          mimeType: message.audio.mime_type
        };
      case 'document':
        return {
          mediaId: message.document.id,
          filename: message.document.filename,
          caption: message.document.caption,
          mimeType: message.document.mime_type
        };
      case 'location':
        return {
          latitude: message.location.latitude,
          longitude: message.location.longitude,
          name: message.location.name,
          address: message.location.address
        };
      case 'contacts':
        return {
          contacts: message.contacts
        };
      default:
        return {
          text: 'Unsupported message type'
        };
    }
  }

  /**
   * Verify webhook signature (for security)
   */
  verifyWebhookSignature(signature, payload, appSecret) {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', appSecret)
      .update(payload)
      .digest('hex');
    
    return signature === `sha256=${expectedSignature}`;
  }
}

module.exports = new WhatsAppService();
