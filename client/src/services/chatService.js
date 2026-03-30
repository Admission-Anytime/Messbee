import axios from '../context/axios';

/**
 * Chat Service
 * Handles all chat and WhatsApp messaging operations
 */

const chatService = {
  /**
   * Get all chats
   */
  async getChats() {
    try {
      const response = await axios.get('/chats');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching chats:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Create a new chat/contact
   */
  async createChat(name, phone, source = 'whatsapp') {
    try {
      const response = await axios.post('/chats', {
        name,
        phone,
        whatsappId: phone,
        source
      });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error creating chat:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  /**
   * Get messages for a specific chat
   */
  async getMessages(chatId) {
    try {
      const response = await axios.get(`/chats/messages/${chatId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Send a text message
   */
  async sendMessage(chatId, text, sender = 'me') {
    try {
      const time = new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      const response = await axios.post('/chats/message', {
        chatId,
        text,
        sender,
        time
      });

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  /**
   * Send a media message (image, video, document)
   */
  async sendMediaMessage(chatId, text, media, mediaType) {
    try {
      const time = new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      const response = await axios.post('/chats/message', {
        chatId,
        text,
        sender: 'me',
        time,
        media,
        mediaType
      });

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error sending media message:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  /**
   * Upload media to WhatsApp servers
   */
  async uploadMedia(fileUrl, mimeType) {
    try {
      const response = await axios.post('/chats/upload-media', {
        fileUrl,
        mimeType
      });

      return {
        success: true,
        mediaId: response.data.mediaId
      };
    } catch (error) {
      console.error('Error uploading media:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  /**
   * Send a WhatsApp template message
   */
  async sendTemplateMessage(chatId, templateName, languageCode = 'en', components = []) {
    try {
      const response = await axios.post('/chats/send-template', {
        chatId,
        templateName,
        languageCode,
        components
      });

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error sending template:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(chatId) {
    try {
      const response = await axios.put(`/chats/${chatId}/read`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Upload file to WhatsApp (returns media ID for sending)
   */
  async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/chats/upload-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        success: true,
        mediaId: response.data.mediaId,
        fileUrl: response.data.fileUrl,
        fileName: response.data.fileName,
        mimeType: response.data.mimeType
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  /**
   * Upload file and get media ID
   * This is a helper function that combines file upload with WhatsApp media upload
   */
  async uploadFileForWhatsApp(file) {
    try {
      // First, upload file to your server
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const fileUrl = uploadResponse.data.url;
      const mimeType = file.type;

      // Then, upload to WhatsApp
      const whatsappUpload = await this.uploadMedia(fileUrl, mimeType);

      if (!whatsappUpload.success) {
        throw new Error('Failed to upload to WhatsApp');
      }

      return {
        success: true,
        mediaId: whatsappUpload.mediaId,
        fileUrl: fileUrl,
        mimeType: mimeType
      };
    } catch (error) {
      console.error('Error uploading file for WhatsApp:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default chatService;
