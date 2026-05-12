import axios from "../context/axios";

const TEMPLATE_HEADER_PREVIEW_CACHE_KEY = 'templateHeaderPreviewCache';
const runtimeHeaderPreviewCache = {};
const MAX_LOCALSTORAGE_PREVIEW_LENGTH = 120000;

// --- Template Date Cache (persists creation date per template ID) ---
const TEMPLATE_DATE_CACHE_KEY = 'templateDateCache';

const getTemplateDateCache = () => {
  try {
    const raw = localStorage.getItem(TEMPLATE_DATE_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const saveTemplateDateCache = (cache) => {
  try {
    localStorage.setItem(TEMPLATE_DATE_CACHE_KEY, JSON.stringify(cache));
  } catch { /* ignore quota errors */ }
};

const getTemplateHeaderPreviewCache = () => {
  const runtimeCache = { ...runtimeHeaderPreviewCache };
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(TEMPLATE_HEADER_PREVIEW_CACHE_KEY);
    const persisted = raw ? JSON.parse(raw) : {};
    return { ...persisted, ...runtimeCache };
  } catch (error) {
    console.warn('⚠️ [TemplateApi] Failed to read template preview cache:', error);
    return runtimeCache;
  }
};

const isRenderableMediaUrl = (value) =>
  typeof value === 'string' &&
  (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:image/') ||
    value.startsWith('data:video/') ||
    value.startsWith('data:application/')
  );

/**
 * Normalizes a media URL for local development.
 * If running on localhost, it redirects production document URLs to the local backend.
 */
const resolveMediaUrlForDev = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (isLocalhost && url.includes('documents.messbee.com')) {
    // Redirect to local backend (port 5000)
    const filename = url.split('/').pop();
    return `http://localhost:5000/uploads/${filename}`;
  }
  
  return url;
};

/**
 * WhatsApp Template API Service
 * Manages template creation, fetching, and deletion
 */

/**
 * Fetch all WhatsApp templates from the business account
 */
export const fetchWhatsAppTemplates = async () => {
  try {
    const { data } = await axios.get("/whatsapp/templates");
    
    return data;
  } catch (error) {
    console.error("❌ [TemplateApi] Error fetching WhatsApp templates:", error);
    throw error;
  }
};

/**
 * Send a template message to a contact
 * @param {string|null} chatId - Chat/Contact ID
 * @param {string} templateName - Template name
 * @param {string} languageCode - Language code (default: en)
 * @param {array} components - Template components (parameters)
 * @param {string|null} to - Recipient phone number (optional when chatId is provided)
 */
export const sendTemplateMessage = async (chatId, templateName, languageCode = 'en', components = [], to = null) => {
  try {
    const { data } = await axios.post("/whatsapp/send-template", {
      chatId,
      to,
      templateName,
      languageCode,
      components
    });
    return data;
  } catch (error) {
    console.error("Error sending template message:", error);
    throw error;
  }
};

/**
 * Create a new template in WhatsApp Business Account
 * Note: This requires more complex implementation with WhatsApp Business Management API
 * Currently, templates must be created via WhatsApp Manager UI
 */
export const createWhatsAppTemplate = async (templateData) => {
  try {
    const { data } = await axios.post("/whatsapp/templates", templateData);
    return data;
  } catch (error) {
    console.error("❌ [TemplateApi] Error creating WhatsApp template:", error.response?.data || error.message);
    if (error.response?.data?.error) {
      console.error("   WhatsApp API Error:", JSON.stringify(error.response.data.error, null, 2));
    }
    throw error;
  }
};

/**
 * Upload a media file (image/video/document) to be used as a template header.
 * The file is stored at UPLOAD_PATH on the server and served via DOCUMENT_GET_URL.
 * @param {File} file - Browser File object selected by the user
 * @returns {{ url: string, filename: string, mimetype: string, size: number }}
 */
export const uploadTemplateMedia = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await axios.post('/whatsapp/templates/upload-media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data; // { success, data: { url, filename, mimetype, size } }
  } catch (error) {
    console.error('❌ [TemplateApi] Error uploading template media:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update an existing template in WhatsApp Business Account
 */
export const updateWhatsAppTemplate = async (templateId, templateData) => {
  try {
    const { data } = await axios.put(`/whatsapp/templates/${templateId}`, templateData);
    return data;
  } catch (error) {
    console.error("❌ [TemplateApi] Error updating WhatsApp template:", error.response?.data || error.message);
    if (error.response?.data?.error) {
      console.error("   WhatsApp API Error:", JSON.stringify(error.response.data.error, null, 2));
    }
    throw error;
  }
};
/**
 * Get template details
 */
export const getTemplateDetails = async (templateId) => {
  try {
    const { data } = await axios.get(`/whatsapp/templates/${templateId}`);
    return data;
  } catch (error) {
    console.error("Error fetching template details:", error);
    throw error;
  }
};

/**
 * Test send a template message (for development)
 */
export const testSendTemplate = async (phoneNumber, templateName, languageCode = 'en') => {
  try {
    const { data } = await axios.post("/whatsapp/test-template", {
      phoneNumber,
      templateName,
      languageCode
    });
    return data;
  } catch (error) {
    console.error("Error testing template send:", error);
    throw error;
  }
};

/**
 * Get local templates from localStorage
 */
export const getLocalTemplates = () => {
  return [];
};

/**
 * Save local template to localStorage
 */
export const saveLocalTemplate = (_template) => {
  return true;
};

/**
 * Save local header preview by template name (client-side fallback)
 */
export const saveTemplateHeaderPreview = (templateName, previewData) => {
  if (typeof window === 'undefined') return;
  if (!templateName || !previewData) return;

  const normalizedPreview = typeof previewData === 'string'
    ? { url: previewData, type: 'Image' }
    : {
        url: previewData?.url || '',
        type: previewData?.type || 'Image'
      };

  if (!normalizedPreview.url) return;

  const normalizedKey = String(templateName).trim().toLowerCase();
  
  // Always update runtime cache
  runtimeHeaderPreviewCache[templateName] = normalizedPreview;
  runtimeHeaderPreviewCache[normalizedKey] = normalizedPreview;

  try {
    const cache = getTemplateHeaderPreviewCache();
    
    // If the URL is a large data: URL (Base64), we might skip saving it to localStorage
    // but keep it in runtime cache. Short URLs (http/https) are always saved.
    const isLargeDataUrl = normalizedPreview.url.startsWith('data:') && normalizedPreview.url.length > 50000;
    
    if (isLargeDataUrl) {
      console.info(`ℹ️ [TemplateApi] Large media preview for "${templateName}" kept in memory only.`);
      return;
    }

    cache[templateName] = normalizedPreview;
    cache[normalizedKey] = normalizedPreview;
    const serialized = JSON.stringify(cache);

    // Prevent storage quota overflow for large caches.
    if (serialized.length > MAX_LOCALSTORAGE_PREVIEW_LENGTH) {
      console.warn('⚠️ [TemplateApi] Preview cache too large for localStorage; pruned oldest entries.');
      // Simple pruning: clear cache if too big (extreme case)
      localStorage.removeItem(TEMPLATE_HEADER_PREVIEW_CACHE_KEY);
      return;
    }
    localStorage.setItem(TEMPLATE_HEADER_PREVIEW_CACHE_KEY, serialized);
  } catch (error) {
    console.warn('⚠️ [TemplateApi] Failed to save template preview cache:', error);
  }
};

/**
 * Delete a WhatsApp template from the business account
 * WARNING: This action is permanent and cannot be undone
 * @param {string} templateId - Template ID to delete
 * @param {string} templateName - Template name (required for WhatsApp API)
 */
export const deleteWhatsAppTemplate = async (templateId, templateName) => {
  try {
    const { data } = await axios.delete(`/whatsapp/templates/${templateId}`, {
      data: {
        templateName
      }
    });
    return data;
  } catch (error) {
    console.error("❌ [TemplateApi] Error deleting WhatsApp template:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete local template from localStorage
 */
export const deleteLocalTemplate = (_templateId) => {
  return true;
};

/**
 * Convert uppercase status to title case for display
 * APPROVED -> Approved, PENDING -> Pending, REJECTED -> Rejected
 */
const formatStatus = (status) => {
  if (!status) {
    return 'Pending';
  }
  
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Format and return only WhatsApp API templates (dynamic)
 * No local storage - always use WhatsApp API as source of truth
 */
export const mergeTemplates = (whatsappTemplates = [], _localTemplates = []) => {

  const headerPreviewCache = getTemplateHeaderPreviewCache();

  const parseTemplateComponents = (components = []) => {
    const safeComponents = Array.isArray(components) ? components : [];

    const bodyComponent = safeComponents.find((c) => String(c?.type || '').toUpperCase() === 'BODY');
    const footerComponent = safeComponents.find((c) => String(c?.type || '').toUpperCase() === 'FOOTER');
    const headerComponent = safeComponents.find((c) => String(c?.type || '').toUpperCase() === 'HEADER');
    const buttonComponent = safeComponents.find((c) => String(c?.type || '').toUpperCase() === 'BUTTONS');

    const normalizedHeaderFormat = String(headerComponent?.format || '').toUpperCase();
    const headerType = normalizedHeaderFormat
      ? normalizedHeaderFormat.charAt(0) + normalizedHeaderFormat.slice(1).toLowerCase()
      : 'None';

    const mappedButtons = Array.isArray(buttonComponent?.buttons)
      ? buttonComponent.buttons.map((btn, idx) => {
          let type = 'Quick Reply';
          if (btn?.type === 'URL') type = 'Visit Website';
          if (btn?.type === 'PHONE_NUMBER') type = 'Call phone number';

          return {
            id: idx + 1,
            type,
            text: btn?.text || 'Action Button',
            value: btn?.url || btn?.phone_number || ''
          };
        })
      : [];

    const mediaUrlCandidate =
      headerComponent?.example?.header_handle?.[0] ||
      headerComponent?.example?.header_url?.[0] ||
      headerComponent?.example?.url?.[0] ||
      '';
    const mediaUrl = isRenderableMediaUrl(mediaUrlCandidate) ? mediaUrlCandidate : '';

    // Extract body variable samples if present
    const bodySamples = {};
    if (bodyComponent?.example?.body_text?.[0]) {
      const samples = bodyComponent.example.body_text[0];
      samples.forEach((sample, idx) => {
        bodySamples[idx + 1] = sample;
      });
    }

    return {
      bodyText: bodyComponent?.text || '',
      footerText: footerComponent?.text || '',
      headerType,
      headerMediaUrl: mediaUrl,
      headerMediaUrlPreview: resolveMediaUrlForDev(mediaUrl),
      buttons: mappedButtons,
      bodySamples
    };
  };

  const formatted = (whatsappTemplates || [])
    .filter(template => template && template.id && template.name)
    .map((template) => {
      const componentData = parseTemplateComponents(template.components || []);
      const normalizedName = String(template.name || '').trim();
      const cachedPreviewEntry =
        headerPreviewCache[normalizedName] ||
        headerPreviewCache[normalizedName.toLowerCase()] ||
        null;
      const cachedPreviewUrl =
        typeof cachedPreviewEntry === 'string'
          ? cachedPreviewEntry
          : (cachedPreviewEntry?.url || '');
      const cachedPreviewType =
        typeof cachedPreviewEntry === 'string'
          ? 'Image'
          : String(cachedPreviewEntry?.type || '').trim();
      const resolvedHeaderMediaUrl = componentData.headerMediaUrl || cachedPreviewUrl;
      const headerMediaUrlPreview = resolveMediaUrlForDev(resolvedHeaderMediaUrl);
      const templateLevelHeaderType = String(template.header_type || template.headerType || '').toUpperCase();
      const apiHeaderType = componentData.headerType !== 'None'
        ? componentData.headerType
        : (templateLevelHeaderType ? templateLevelHeaderType.charAt(0) + templateLevelHeaderType.slice(1).toLowerCase() : 'None');

      // IMPORTANT: We MUST trust what Meta says about the header type.
      // If Meta says 'None', the template has no header on their servers.
      // Sending header params to a None-header template causes error [132018].
      // The URL in our cache is just an example URL used during creation — it does NOT
      // mean Meta approved/saved the template with that header.
      // To get a proper IMAGE template, the user must DELETE and RECREATE the template
      // with a publicly accessible image URL.
      const resolvedHeaderType = (apiHeaderType && apiHeaderType !== 'None') ? apiHeaderType : 'None';

      return {
        id: template.id,
        name: template.name,
        category: template.category || 'General',
        status: formatStatus(template.status),
        language: template.language || 'en',
        updated: (() => {
          const dateCache = getTemplateDateCache();
          const templateId = String(template.id);

          // 1. Check if WhatsApp API gave a real timestamp
          const ts = template.last_updated_time || template.updated_time || template.created_time || template.created_timestamp;
          if (ts) {
            const ms = ts > 1e10 ? ts : ts * 1000;
            const dateStr = new Date(ms).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            // Save to cache so it stays consistent
            if (!dateCache[templateId]) {
              dateCache[templateId] = dateStr;
              saveTemplateDateCache(dateCache);
            }
            return dateStr;
          }

          // 2. Already seen this template before? Use cached date (stays fixed forever)
          if (dateCache[templateId]) {
            return dateCache[templateId];
          }

          // 3. First time seeing this template — record today as its date and save it
          const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          dateCache[templateId] = todayStr;
          saveTemplateDateCache(dateCache);
          return todayStr;
        })(),
        source: 'whatsapp',
        quality_score: template.quality_score || 'N/A',
        components: template.components || [],
        bodyText: componentData.bodyText,
        footerText: componentData.footerText,
        headerType: resolvedHeaderType,
        headerMediaUrl: resolvedHeaderMediaUrl,
        headerMediaUrlPreview: headerMediaUrlPreview,
        buttons: componentData.buttons,
        bodySamples: componentData.bodySamples
      };
    });


  return formatted;
};
