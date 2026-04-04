const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { normalizePhoneNumber } = require('../utils/phoneHelper');

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
    
    // Log configuration on initialization
    console.log('🔧 WhatsApp Service initialized');
    console.log(`📱 Phone Number ID: ${this.phoneNumberId}`);
    console.log(`🔑 Token: ${this.accessToken ? 'Set ✓' : 'Missing ✗'}`);
  }
  
  /**
   * Validate configuration
   */
  validateConfig() {
    if (!this.phoneNumberId || !this.accessToken) {
      throw new Error('WhatsApp configuration is incomplete. Please check WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN in .env file');
    }

    if (!this.baseURL || !this.baseURL.includes('graph.facebook.com')) {
      throw new Error('WhatsApp Graph API base URL is invalid');
    }

    return true;
  }

  /**
   * Register WhatsApp Business Number
   */
  async register(pin) {
    try {
      this.validateConfig();
      const response = await axios.post(
        `${this.baseURL}/register`,
        {
          messaging_product: 'whatsapp',
          pin: pin
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ WhatsApp number registered successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ WhatsApp Register Error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || { message: error.message } };
    }
  }

  /**
   * Deregister WhatsApp Business Number
   */
  async deregister() {
    try {
      this.validateConfig();
      const response = await axios.post(
        `${this.baseURL}/deregister`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ WhatsApp number deregistered successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ WhatsApp Deregister Error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || { message: error.message } };
    }
  }

  /**
   * Send a text message via WhatsApp
   */
  async sendTextMessage(to, message) {
    try {
      this.validateConfig();
      
      // Normalize phone number with country code
      const cleanPhone = normalizePhoneNumber(to);
      
      console.log(`📤 Sending WhatsApp message to: ${cleanPhone} (original: ${to})`);
      console.log(`📝 Message content: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);
      
      const response = await axios.post(
        `${this.baseURL}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
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

      console.log(`✅ WhatsApp message sent successfully. Message ID: ${response.data.messages[0].id}`);
      console.log(`   To: ${cleanPhone}`);

      if (!response.data?.messages?.length) {
        return {
          success: false,
          error: { message: 'WhatsApp API did not return a message ID' }
        };
      }
      
      return {
        success: true,
        messageId: response.data.messages[0].id,
        data: response.data
      };
    } catch (error) {
      console.error('❌ WhatsApp Send Error:', error.response?.data || error.message);
      if (error.response?.data) {
        console.error('   Error details:', JSON.stringify(error.response.data, null, 2));
      }
      return {
        success: false,
        error: error.response?.data || { message: error.message }
      };
    }
  }

  /**
   * Send a media message (image, video, document)
   */
  async sendMediaMessage(to, mediaType, mediaId, caption = '') {
    try {
      this.validateConfig();
      
      // Normalize phone number with country code
      const cleanPhone = normalizePhoneNumber(to);
      
      console.log(`📤 Sending WhatsApp ${mediaType} message to: ${cleanPhone} (original: ${to})`);
      console.log(`   Media ID: ${mediaId}`);
      console.log(`   Caption: ${caption || '(none)'}`);
      
      const messageData = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: mediaType,
        [mediaType]: {
          id: mediaId
        }
      };

      if (caption && (mediaType === 'image' || mediaType === 'video' || mediaType === 'document')) {
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

      console.log(`✅ WhatsApp ${mediaType} message sent successfully. Message ID: ${response.data.messages[0].id}`);
      console.log(`   To: ${cleanPhone}`);

      if (!response.data?.messages?.length) {
        return {
          success: false,
          error: { message: 'WhatsApp API did not return a message ID' }
        };
      }
      
      return {
        success: true,
        messageId: response.data.messages[0].id,
        data: response.data
      };
    } catch (error) {
      console.error('❌ WhatsApp Media Send Error:', error.response?.data || error.message);
      if (error.response?.data) {
        console.error('   Error details:', JSON.stringify(error.response.data, null, 2));
      }
      return {
        success: false,
        error: error.response?.data || { message: error.message }
      };
    }
  }

  /**
   * Upload media to WhatsApp servers (from local file)
   */
  async uploadMedia(filePath, mimeType) {
    try {
      this.validateConfig();
      
      console.log(`📤 Uploading media to WhatsApp: ${filePath}`);
      
      const formData = new FormData();
      formData.append('messaging_product', 'whatsapp');
      formData.append('file', fs.createReadStream(filePath), {
        contentType: mimeType
      });

      const response = await axios.post(
        `${this.baseURL}/media`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            ...formData.getHeaders()
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      console.log(`✅ Media uploaded successfully. Media ID: ${response.data.id}`);
      
      return {
        success: true,
        mediaId: response.data.id
      };
    } catch (error) {
      console.error('❌ WhatsApp Upload Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || { message: error.message }
      };
    }
  }
  
  /**
   * Upload media from URL to WhatsApp servers
   */
  async uploadMediaFromUrl(fileUrl, mimeType) {
    try {
      this.validateConfig();
      
      console.log(`📤 Uploading media from URL to WhatsApp: ${fileUrl}`);
      
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

      console.log(`✅ Media uploaded successfully. Media ID: ${response.data.id}`);
      
      return {
        success: true,
        mediaId: response.data.id
      };
    } catch (error) {
      console.error('❌ WhatsApp Upload Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || { message: error.message }
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
        console.log('⚠️  No value in webhook data');
        return { success: false, error: 'Invalid webhook data' };
      }

      // Log webhook metadata
      console.log('📋 Webhook Metadata:', {
        hasMessages: !!value.messages,
        hasStatuses: !!value.statuses,
        hasContacts: !!value.contacts,
        metadata: value.metadata
      });

      // Handle incoming messages
      if (value.messages) {
        const message = value.messages[0];
        const contact = value.contacts?.[0];

        console.log('📥 Processing message:', {
          id: message.id,
          from: message.from,
          type: message.type,
          timestamp: message.timestamp
        });

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
        
        console.log('📊 Processing status update:', {
          messageId: status.id,
          status: status.status,
          recipientId: status.recipient_id,
          timestamp: status.timestamp
        });
        
        return {
          success: true,
          type: 'status',
          data: {
            messageId: status.id,
            status: status.status,
            timestamp: status.timestamp,
            recipientId: status.recipient_id,
            errors: status.errors
          }
        };
      }

      console.log('⚠️  Unknown webhook type:', Object.keys(value));
      return { success: false, error: 'Unknown webhook type' };
    } catch (error) {
      console.error('❌ Webhook Processing Error:', error.message);
      console.error('Stack:', error.stack);
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
