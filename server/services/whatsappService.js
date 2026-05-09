const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const mongoose = require('mongoose');
const { normalizePhoneNumber } = require('../utils/phoneHelper');
const Setting = require('../models/Setting');

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
    
    // Initial sync from DB
    this.syncConfig();

    // Log configuration on initialization

  }

  /**
   * Sync configuration from database
   */
  async syncConfig() {
    try {
      // Don't attempt to sync if DB is not connected. 
      // Mongoose buffers commands, but if connection takes >10s it times out.
      if (mongoose.connection.readyState !== 1) {
        return; 
      }

      const setting = await Setting.findOne({ key: 'whatsapp_config' });
      if (setting && setting.value) {
        const { apiVersion, phoneNumberId, accessToken, businessAccountId } = setting.value;
        if (apiVersion) this.apiVersion = apiVersion;
        if (phoneNumberId) this.phoneNumberId = phoneNumberId;
        if (accessToken) this.accessToken = accessToken;
        if (businessAccountId) this.businessAccountId = businessAccountId;
        
        this.baseURL = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}`;

      } else {

      }
    } catch (error) {
      console.error('❌ Error syncing WhatsApp config from DB:', error.message);
    }
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
   * Normalize template language code used by Graph API.
   */
  normalizeTemplateLanguage(languageCode = 'en_US') {
    if (!languageCode) return 'en_US';

    const normalized = String(languageCode).trim();
    const map = {
      en: 'en_US',
      hi: 'hi_IN',
      es: 'es_ES',
      pt: 'pt_BR',
      fr: 'fr_FR',
      de: 'de_DE',
      ar: 'ar_AR',
      it: 'it_IT',
      ja: 'ja_JP',
      zh: 'zh_CN',
      ko: 'ko_KR',
      ru: 'ru_RU'
    };

    return map[normalized] || normalized;
  }

  /**
   * Find a template by name and language in current WABA templates list.
   */
  async findTemplate(templateName, languageCode) {
    const templatesResult = await this.getTemplates();
    const templates = Array.isArray(templatesResult?.data) ? templatesResult.data : [];

    return templates.find(
      (template) =>
        template?.name === templateName &&
        template?.language === languageCode
    ) || null;
  }

  getTemplateBodyText(template) {
    const components = Array.isArray(template?.components) ? template.components : [];
    const body = components.find((component) => String(component?.type || '').toUpperCase() === 'BODY');
    return body?.text || '';
  }

  getBodyTemplateParamCount(template) {
    const bodyText = this.getTemplateBodyText(template);
    const placeholders = bodyText.match(/{{\s*\d+\s*}}/g) || [];
    return new Set(placeholders.map((ph) => ph.replace(/\s+/g, ''))).size;
  }

  renderTemplateBody(template, components = [], fallbackText = '') {
    const bodyText = this.getTemplateBodyText(template);
    if (!bodyText) {
      return `Template: ${template?.name || 'message'}`;
    }

    const bodyComponent = Array.isArray(components)
      ? components.find((component) => String(component?.type || '').toUpperCase() === 'BODY')
      : null;

    const parameters = Array.isArray(bodyComponent?.parameters) ? bodyComponent.parameters : [];

    return bodyText.replace(/{{\s*(\d+)\s*}}/g, (_match, indexText) => {
      const index = Number(indexText) - 1;
      const value = parameters[index]?.text;
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        return String(value);
      }
      return fallbackText || _match;
    });
  }

  async sendTextAsTemplateBridge(to, text, preferredLanguage = 'en_US') {
    const templatesResult = await this.getTemplates();
    const templates = Array.isArray(templatesResult?.data) ? templatesResult.data : [];

    const approvedTemplates = templates.filter(
      (template) => String(template?.status || '').toUpperCase() === 'APPROVED'
    );

    const configuredBridgeName = process.env.WHATSAPP_BRIDGE_TEMPLATE_NAME;
    const configuredBridgeLanguage = this.normalizeTemplateLanguage(
      process.env.WHATSAPP_BRIDGE_TEMPLATE_LANGUAGE || preferredLanguage
    );

    let bridgeTemplate = null;

    if (configuredBridgeName) {
      bridgeTemplate = approvedTemplates.find(
        (template) =>
          template?.name === configuredBridgeName &&
          this.normalizeTemplateLanguage(template?.language) === configuredBridgeLanguage
      ) || null;
    }

    if (!bridgeTemplate) {
      bridgeTemplate = approvedTemplates.find((template) => this.getBodyTemplateParamCount(template) > 0) || null;
    }

    if (!bridgeTemplate) {
      return {
        success: false,
        error: {
          message: 'No approved template with body parameters is available for pre-reply messaging.'
        }
      };
    }

    const paramCount = Math.max(1, this.getBodyTemplateParamCount(bridgeTemplate));
    const components = [{
      type: 'body',
      parameters: Array.from({ length: paramCount }, () => ({
        type: 'text',
        text
      }))
    }];

    const sendResult = await this.sendTemplateMessage(
      to,
      bridgeTemplate.name,
      bridgeTemplate.language || configuredBridgeLanguage,
      components
    );

    if (!sendResult.success) {
      return sendResult;
    }

    return {
      ...sendResult,
      usedTemplateBridge: true,
      bridgeTemplateName: bridgeTemplate.name,
      displayText: text
    };
  }

  /**
   * Register WhatsApp Business Number
   */
  async register(pin) {
    try {
      await this.syncConfig(); // Sync before each major operation to stay updated
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
      await this.syncConfig(); // Sync before each major operation to stay updated
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
      await this.syncConfig(); // Sync before each major operation to stay updated
      this.validateConfig();
      
      // Normalize phone number with country code
      const cleanPhone = normalizePhoneNumber(to);
      

      
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
      await this.syncConfig(); // Sync before each major operation to stay updated
      this.validateConfig();
      
      // Normalize phone number with country code
      const cleanPhone = normalizePhoneNumber(to);
      

      
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
      await this.syncConfig(); // Sync before each major operation to stay updated
      this.validateConfig();
      

      
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
      await this.syncConfig(); // Sync before each major operation to stay updated
      this.validateConfig();
      

      
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
  async sendTemplateMessage(to, templateName, languageCode = 'en_US', components = []) {
    try {
      this.validateConfig();

      const cleanPhone = normalizePhoneNumber(to);
      const normalizedLanguage = this.normalizeTemplateLanguage(languageCode);

      const template = await this.findTemplate(templateName, normalizedLanguage);

      if (!template) {
        return {
          success: false,
          error: {
            message: `Template "${templateName}" with language "${normalizedLanguage}" was not found in this WABA.`
          }
        };
      }

      if (template.status !== 'APPROVED') {
        return {
          success: false,
          error: {
            message: `Template "${templateName}" is not sendable because status is "${template.status}".`,
            templateStatus: template.status,
            rejectedReason: template.rejected_reason || null
          }
        };
      }

      const response = await axios.post(
        `${this.baseURL}/messages`,
        {
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: normalizedLanguage
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
        data: response.data,
        templateName: template.name,
        templateLanguage: normalizedLanguage,
        displayText: this.renderTemplateBody(template, components)
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

      const results = [];

      // Handle incoming messages
      if (Array.isArray(value.messages)) {
        value.messages.forEach(message => {
          const contact = value.contacts?.find(c => c.wa_id === message.from);
          results.push({
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
          });
        });
      }

      // Handle message status updates (delivered, read, etc.)
      if (Array.isArray(value.statuses)) {
        value.statuses.forEach(status => {
          results.push({
            success: true,
            type: 'status',
            data: {
              messageId: status.id,
              status: status.status,
              timestamp: status.timestamp,
              recipientId: status.recipient_id,
              errors: status.errors
            }
          });
        });
      }

      if (results.length > 0) {
        return { success: true, results };
      }

      return { success: false, error: 'Unknown webhook type' };
    } catch (error) {
      console.error('❌ Webhook Processing Error:', error.message);
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
  /**
   * Fetch message templates from WhatsApp Business Account
   */
  async getTemplates() {
    try {

      
      const response = await axios.get(
        `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}/${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`,
        {
          params: {
            fields: 'id,name,status,category,language,created_timestamp,rejected_reason,quality_score,components'
          },
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );
      

      
      if (response.data?.data && Array.isArray(response.data.data)) {

        

      }
      
      return response.data;
    } catch (error) {
      console.error('❌ [WhatsAppService] Error fetching templates:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create a new template in WhatsApp Business Account
   * Note: This endpoint requires the business_management permission
   */
  async createTemplate(templateData) {
    try {
      const {
        name,
        category = 'MARKETING',
        language = 'en_US',
        components = []
      } = templateData;

      const preparedComponents = components.map((component) => ({ ...component }));
      const sanitizeComponents = (inputComponents = []) =>
        inputComponents
          .map((component) => ({ ...component }))
          .filter(Boolean)
          .filter((component) => {
            const type = String(component?.type || '').toUpperCase();
            if (type === 'BUTTONS') {
              const buttons = Array.isArray(component?.buttons) ? component.buttons : [];
              const sanitizedButtons = buttons
                .map((btn) => ({ ...btn }))
                .filter((btn) => String(btn?.text || '').trim().length > 0)
                .filter((btn) => {
                  const btnType = String(btn?.type || '').toUpperCase();
                  if (btnType === 'URL') return /^https?:\/\//i.test(String(btn?.url || '').trim());
                  if (btnType === 'PHONE_NUMBER') return String(btn?.phone_number || '').trim().length > 0;
                  return btnType === 'QUICK_REPLY';
                });
              component.buttons = sanitizedButtons;
              return sanitizedButtons.length > 0;
            }
            return true;
          });



      // Validate required fields
      if (!name || !category || !language || !components.length) {
        console.error('❌ Missing required fields');
        return {
          success: false,
          error: {
            message: 'Missing required fields: name, category, language, and components'
          }
        };
      }

      // Validate template name format
      if (!/^[a-z0-9_]+$/.test(name)) {
        console.error(`❌ Invalid name format: "${name}" does not match /^[a-z0-9_]+$/`);
        return {
          success: false,
          error: {
            message: 'Template name must contain only lowercase letters, numbers, and underscores'
          }
        };
      }

      // Validate template name length (minimum 4 characters for better approval rates)
      if (name.length < 4) {
        console.error(`❌ Name too short: "${name}" (${name.length} chars, minimum 4 required)`);
        return {
          success: false,
          error: {
            message: 'Template name must be at least 4 characters long'
          }
        };
      }

      // Validate language code format (should be locale format like en_US, hi_IN, etc.)
      const validLanguageCodes = ['en_US', 'en', 'hi_IN', 'hi', 'es_ES', 'es', 'pt_BR', 'pt', 'fr_FR', 'fr', 'de_DE', 'de', 'ar_AR', 'ar', 'it_IT', 'it', 'ja_JP', 'ja', 'zh_CN', 'zh', 'ko_KR', 'ko', 'ru_RU', 'ru'];
      if (!validLanguageCodes.includes(language)) {
        console.warn(`⚠️  Language code "${language}" not in common list, allowing it anyway (WhatsApp may reject)`);
      }

      // Validate BODY component exists and has content
      const bodyComponent = preparedComponents.find(c => c.type === 'BODY');
      if (!bodyComponent || !bodyComponent.text || bodyComponent.text.trim().length < 20) {
        return {
          success: false,
          error: {
            message: 'Template body must exist and be at least 20 characters long for approval'
          }
        };
      }

      if (bodyComponent.text.length > 1024) {
        return {
          success: false,
          error: {
            message: "The Body (or Content) field can't have more than 1,024 characters.",
            code: 100,
            errorSubcode: 2388040,
            title: 'Character limit exceeded'
          }
        };
      }

      const placeholderMatches = Array.from(bodyComponent.text.matchAll(/\{\{\s*([^}]+?)\s*\}\}/g));
      const placeholderRawValues = placeholderMatches.map((match) => (match[1] || '').trim());
      const hasInvalidPlaceholderFormat = placeholderRawValues.some((value) => !/^\d+$/.test(value));

      if (hasInvalidPlaceholderFormat) {
        return {
          success: false,
          error: {
            message: 'Template placeholders must be numeric and wrapped as {{1}}, {{2}}, ... only.'
          }
        };
      }

      if (placeholderRawValues.length > 0) {
        const placeholderNumbers = [...new Set(placeholderRawValues.map((value) => Number(value)))].sort((a, b) => a - b);
        const expected = Array.from({ length: placeholderNumbers[placeholderNumbers.length - 1] }, (_, idx) => idx + 1);
        const isSequential = expected.every((value) => placeholderNumbers.includes(value));

        if (!isSequential || placeholderNumbers[0] !== 1) {
          return {
            success: false,
            error: {
              message: 'Template placeholders must be sequential starting from {{1}} without gaps.'
            }
          };
        }

        if (!bodyComponent.example?.body_text) {
          bodyComponent.example = {
            body_text: [placeholderNumbers.map((num) => `sample_${num}`)]
          };
        }
      }

      // Validate TEXT header if present
      const headerComponent = preparedComponents.find(c => c.type === 'HEADER');
      if (headerComponent && headerComponent.format === 'TEXT') {
        if (!headerComponent.text || headerComponent.text.trim().length < 3) {
          return {
            success: false,
            error: {
              message: 'Text header must be at least 3 characters'
            }
          };
        }
      }



      const createTemplatePayload = (templateName, payloadComponents = preparedComponents) => ({
        name: templateName,
        category,
        language,
        components: payloadComponents
      });

      const generateSuggestedTemplateName = (baseName) => {
        const safeBase = String(baseName || 'template')
          .toLowerCase()
          .replace(/[^a-z0-9_]+/g, '_')
          .replace(/^_+|_+$/g, '')
          .slice(0, 50) || 'template';

        return `${safeBase}_v${Date.now().toString().slice(-6)}`.slice(0, 60);
      };

      // Helper function to make the API call with retry logic
      const makeTemplateRequest = async (templateName, retryCount = 0, maxRetries = 5) => {
        try {

          
          const response = await axios.post(
            `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}/${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`,
            createTemplatePayload(templateName),
            {
              headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
              }
            }
          );


          return response;
        } catch (error) {
          // Check error codes for transient WhatsApp API errors
          const errorCode = error.response?.data?.error?.error_subcode;
          const isTemplateLanguageBeingDeleted = errorCode === 2388023;
          const isCategoryChangeBlockedByDeletion = errorCode === 2388025;
          const errorMsg = error.response?.data?.error?.error_user_msg || error.response?.data?.error?.message;

          // Deletion-state errors are not transient enough to retry in this request lifecycle.
          if (isTemplateLanguageBeingDeleted || isCategoryChangeBlockedByDeletion) {
            const errorDescription = isCategoryChangeBlockedByDeletion
              ? 'Category change blocked - template in deletion'
              : 'Template language being deleted';

            console.error(`\n❌ Error ${errorCode} on attempt ${retryCount + 1}: ${errorDescription}`);
            console.error(`   Message: "${errorMsg}"`);
            console.warn(`⏹️  No retry for this error. Returning guidance to use same name later or choose a new name.`);
            throw error;
          }

          throw error;
        }
      };

      let response;
      const createdName = name;
      const usedFallbackName = false;
      const hasMediaHeader = preparedComponents.some((component) => {
        const type = String(component?.type || '').toUpperCase();
        const format = String(component?.format || '').toUpperCase();
        return type === 'HEADER' && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(format);
      });

      try {
        response = await makeTemplateRequest(name);
      } catch (error) {
        const errorSubcode = error.response?.data?.error?.error_subcode;
        const isTemplateLanguageBeingDeleted = errorSubcode === 2388023;
        const isCategoryChangeBlockedByDeletion = errorSubcode === 2388025;
        const isTemplateLanguageAlreadyExists = errorSubcode === 2388024;

        if (isTemplateLanguageAlreadyExists) {
          return {
            success: false,
            error: {
              message: `A template with the name "${name}" already exists. Please use a different name or edit the existing template.`,
              code: error.response?.data?.error?.code,
              errorSubcode: isTemplateLanguageAlreadyExists,
              title: 'Template Already Exists',
              originalTemplateName: name
            }
          };
        }

        if (!isTemplateLanguageBeingDeleted && !isCategoryChangeBlockedByDeletion && hasMediaHeader) {
          // Only drop the HEADER for WhatsApp API validation errors (4xx responses).
          // Network-level errors (ENOTFOUND, ECONNREFUSED, timeout) must propagate immediately
          // so the client sees the real problem instead of a misleading INVALID_FORMAT rejection.
          const isWhatsAppApiError = !!error.response; // has HTTP response → WhatsApp returned an error
          if (!isWhatsAppApiError) {
            console.error('❌ Network error reaching Facebook Graph API. Not retrying without HEADER.');
            throw error;
          }

          const componentsWithoutHeader = preparedComponents.filter(
            (component) => String(component?.type || '').toUpperCase() !== 'HEADER'
          );

          if (componentsWithoutHeader.length > 0) {
            console.warn('⚠️ Media header template creation failed. Retrying once without HEADER component.');
            const originalComponents = [...preparedComponents];
            preparedComponents.splice(0, preparedComponents.length, ...componentsWithoutHeader);
            try {
              response = await makeTemplateRequest(name);
            } finally {
              preparedComponents.splice(0, preparedComponents.length, ...originalComponents);
            }

            return {
              success: true,
              data: response.data,
              templateName: createdName,
              usedFallbackName: true,
              originalTemplateName: name
            };
          }
        }

        if (!isTemplateLanguageBeingDeleted && !isCategoryChangeBlockedByDeletion) {
          const invalidParameter =
            String(error?.response?.data?.error?.message || '').toLowerCase().includes('invalid parameter');

          if (invalidParameter) {
            try {
              const sanitized = sanitizeComponents(preparedComponents).filter((c) => {
                const type = String(c?.type || '').toUpperCase();
                return type === 'BODY' || type === 'FOOTER';
              });
              if (sanitized.length > 0) {
                console.warn('⚠️ Retrying template creation with sanitized BODY/FOOTER components');
                response = await axios.post(
                  `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}/${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`,
                  createTemplatePayload(name, sanitized),
                  {
                    headers: {
                      'Authorization': `Bearer ${this.accessToken}`,
                      'Content-Type': 'application/json'
                    }
                  }
                );
                return {
                  success: true,
                  data: response.data,
                  templateName: createdName,
                  usedFallbackName: true,
                  originalTemplateName: name
                };
              }
            } catch (sanitizeRetryError) {
              console.error('❌ Sanitized retry failed:', sanitizeRetryError.response?.data || sanitizeRetryError.message);
            }
          }
          throw error;
        }

        const suggestedName = generateSuggestedTemplateName(name);
        const apiError = error.response?.data?.error || {};

        return {
          success: false,
          error: {
            message: apiError.error_user_msg || apiError.message || 'Template language is in deletion state. Try again shortly or use a different name.',
            code: apiError.code,
            errorSubcode,
            title: apiError.error_user_title,
            suggestedName,
            originalTemplateName: name
          }
        };
      }

      if (response?.data?.status === 'REJECTED') {
        let rejectedReason = 'UNKNOWN';

        try {
          const detailsResponse = await axios.get(
            `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}/${response.data?.id}`,
            {
              params: {
                fields: 'name,status,rejected_reason'
              },
              headers: {
                'Authorization': `Bearer ${this.accessToken}`
              }
            }
          );

          rejectedReason = detailsResponse.data?.rejected_reason || rejectedReason;
        } catch (detailsError) {
          console.warn('⚠️  Could not fetch rejected reason for created template:', detailsError.message);
        }

        return {
          success: false,
          error: {
            message: `Template was created but immediately rejected by WhatsApp (${rejectedReason}).`,
            rejectedReason,
            templateId: response.data?.id,
            templateName: createdName,
            usedFallbackName,
            originalTemplateName: name
          }
        };
      }

      return {
        success: true,
        data: response.data,
        templateName: createdName,
        usedFallbackName,
        originalTemplateName: name
      };
    } catch (error) {
      console.error('❌ Template Creation Error:', error.response?.data || error.message);
      if (error.response?.data?.error) {
        console.error('   WhatsApp Error Details:', JSON.stringify(error.response.data.error, null, 2));
      }
      return {
        success: false,
        error: error.response?.data || { message: error.message }
      };
    }
  }

  /**
   * Get template details by ID
   */
  async getTemplateDetails(templateId) {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}/${templateId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Get Template Details Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || { message: error.message }
      };
    }
  }

  /**
   * Test send a template message to verify it works
   * This sends a test message to the specified phone number
   */
  async testSendTemplate(phoneNumber, templateName, languageCode = 'en_US', testData = {}) {
    try {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      const normalizedLanguage = this.normalizeTemplateLanguage(languageCode);

      const template = await this.findTemplate(templateName, normalizedLanguage);
      if (!template) {
        return {
          success: false,
          error: {
            message: `Template "${templateName}" with language "${normalizedLanguage}" was not found in this WABA.`
          }
        };
      }

      if (template.status !== 'APPROVED') {
        return {
          success: false,
          error: {
            message: `Template "${templateName}" is not sendable because status is "${template.status}".`,
            templateStatus: template.status,
            rejectedReason: template.rejected_reason || null
          }
        };
      }
      
      // Build components based on test data
      const components = [];
      if (testData.bodyParameters && testData.bodyParameters.length > 0) {
        components.push({
          type: 'body',
          parameters: testData.bodyParameters.map(param => ({
            type: 'text',
            text: param
          }))
        });
      }

      const response = await axios.post(
        `${this.baseURL}/messages`,
        {
          messaging_product: 'whatsapp',
          to: normalizedPhone,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: normalizedLanguage
            },
            components: components.length > 0 ? components : undefined
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
        messageId: response.data.messages?.[0]?.id,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Test Template Send Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Delete a template
   * Note: Requires WABA ID and template name (not ID)
   */
  async deleteTemplate(templateId, templateName) {
    try {
      if (!templateId) {
        throw new Error('Template ID is required to delete a template');
      }

      // Template name is required for the WhatsApp API delete endpoint
      if (!templateName) {
        throw new Error('Template name is required to delete a template');
      }



      // Correct endpoint: DELETE /{WABA-ID}/message_templates?name={template_name}
      const response = await axios.delete(
        `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}/${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`,
        {
          params: {
            name: templateName
          },
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );


      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ [Service] Delete Template Error:', error.response?.data || error.message);
      if (error.response?.data?.error) {
        console.error('   WhatsApp API Error:', JSON.stringify(error.response.data.error, null, 2));
      }
      return {
        success: false,
        error: error.response?.data?.error || { message: error.message }
      };
    }
  }

  /**
   * Update template (limited support - mainly for name/category)
   */
  async updateTemplate(templateId, updateData) {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}/${templateId}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );


      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Update Template Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || { message: error.message }
      };
    }
  }
}

module.exports = new WhatsAppService();
