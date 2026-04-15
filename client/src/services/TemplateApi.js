import axios from "../context/axios";

const TEMPLATE_HEADER_PREVIEW_CACHE_KEY = 'templateHeaderPreviewCache';
const runtimeHeaderPreviewCache = {};
const MAX_LOCALSTORAGE_PREVIEW_LENGTH = 120000;

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
 * WhatsApp Template API Service
 * Manages template creation, fetching, and deletion
 */

/**
 * Fetch all WhatsApp templates from the business account
 */
export const fetchWhatsAppTemplates = async () => {
  try {
    console.log('🌐 [TemplateApi] Fetching templates from /whatsapp/templates...');
    const { data } = await axios.get("/whatsapp/templates");
    
    console.log('🌐 [TemplateApi] Raw API response:', data);
    console.log('🌐 [TemplateApi] Response structure:', {
      success: data.success,
      dataExists: !!data.data,
      dataIsArray: Array.isArray(data.data),
      dataLength: data.data?.length || 'N/A',
      firstItem: data.data?.[0],
      firstItemStatus: data.data?.[0]?.status
    });
    
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
    console.log('🌐 [TemplateApi] Creating template with payload:', JSON.stringify(templateData, null, 2));
    const { data } = await axios.post("/whatsapp/templates", templateData);
    console.log('🌐 [TemplateApi] Template created successfully:', data);
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
  runtimeHeaderPreviewCache[templateName] = normalizedPreview;
  runtimeHeaderPreviewCache[normalizedKey] = normalizedPreview;

  try {
    const cache = getTemplateHeaderPreviewCache();
    cache[templateName] = normalizedPreview;
    cache[normalizedKey] = normalizedPreview;
    const serialized = JSON.stringify(cache);

    // Prevent storage quota overflow for large data URLs (image/video previews).
    if (serialized.length > MAX_LOCALSTORAGE_PREVIEW_LENGTH) {
      console.warn('⚠️ [TemplateApi] Preview cache too large for localStorage; using runtime cache only.');
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
    console.log('🗑️ [TemplateApi] Deleting WhatsApp template:', { templateId, templateName });
    const { data } = await axios.delete(`/whatsapp/templates/${templateId}`, {
      data: {
        templateName
      }
    });
    console.log('✅ [TemplateApi] Template deleted successfully:', data);
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
  console.log('📋 [TemplateApi] Using ONLY WhatsApp API templates');
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

    return {
      bodyText: bodyComponent?.text || '',
      footerText: footerComponent?.text || '',
      headerType,
      headerMediaUrl: mediaUrl,
      buttons: mappedButtons
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
      const templateLevelHeaderType = String(template.header_type || template.headerType || '').toUpperCase();
      const apiHeaderType = componentData.headerType !== 'None'
        ? componentData.headerType
        : (templateLevelHeaderType ? templateLevelHeaderType.charAt(0) + templateLevelHeaderType.slice(1).toLowerCase() : 'None');

      // If API does not return media HEADER metadata but we have cached media preview,
      // infer its type from cache so list preview can render image/video properly.
      const resolvedHeaderType = apiHeaderType === 'None' && resolvedHeaderMediaUrl
        ? (cachedPreviewType || 'Image')
        : apiHeaderType;

      return {
        id: template.id,
        name: template.name,
        category: template.category || 'General',
        status: formatStatus(template.status),
        language: template.language || 'en',
        updated: template.created_timestamp 
          ? new Date(template.created_timestamp * 1000).toLocaleDateString('en-GB', { 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric' 
            })
          : new Date().toLocaleDateString('en-GB', { 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric' 
            }),
        source: 'whatsapp',
        quality_score: template.quality_score || 'N/A',
        components: template.components || [],
        bodyText: componentData.bodyText,
        footerText: componentData.footerText,
        headerType: resolvedHeaderType,
        headerMediaUrl: resolvedHeaderMediaUrl,
        buttons: componentData.buttons
      };
    });

  console.log('✅ [TemplateApi] Formatted templates:', formatted.length, 'templates from WhatsApp API');
  return formatted;
};
