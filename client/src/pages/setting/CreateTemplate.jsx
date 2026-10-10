/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RotateCw, ArrowLeft, Image as ImageIcon, Plus, ChevronRight, ExternalLink, Trash2, Globe, X, Clock, Bold, Italic, Link2, Strikethrough, Smile, Info, Copy, Zap, Lock, Sparkles, ArrowRight, AlertCircle, Phone } from 'lucide-react';
import { toast } from 'react-toastify';
import { createWhatsAppTemplate, updateWhatsAppTemplate, saveTemplateHeaderPreview, uploadTemplateMedia, uploadTemplateMediaByUrl, resolveMediaUrlForDev, fetchWhatsAppTemplates } from '../../services/TemplateApi';
import { formatWhatsAppMarkdown } from '../../utils/markdownParser';
import axios from '../../context/axios';
import { userContext } from '../../context/Context';
import { getPlanLimit, hasPlanFeature } from '../../utils/planLimits';
import EmojiPicker from 'emoji-picker-react';

/**
 * Detects aspect ratio label
 */
const getAspectRatioLabel = (width, height) => {
  if (!width || !height) return '';
  const ratio = width / height;
  if (Math.abs(ratio - 1) < 0.05) return '1:1 Square';
  if (Math.abs(ratio - 16 / 9) < 0.08) return '16:9 Landscape';
  if (Math.abs(ratio - 4 / 3) < 0.08) return '4:3 Landscape';
  if (Math.abs(ratio - 9 / 16) < 0.08) return '9:16 Vertical';
  if (Math.abs(ratio - 4 / 5) < 0.08) return '4:5 Portrait';
  return ratio > 1 ? `${ratio.toFixed(2)}:1 Landscape` : `1:${(1 / ratio).toFixed(2)} Portrait`;
};

/**
 * Computes preview countdown timer string based on expiration configuration
 */
const getExpirationPreviewText = (expirationDate = '24h', customHours = 24) => {
  switch (expirationDate) {
    case '6h': return '05:59:59';
    case '12h': return '11:59:59';
    case '24h': return '23:59:59';
    case '48h': return '47:59:59';
    case '72h': return '2d 23h';
    case '7d': return '6d 23h';
    case 'custom': {
      const h = Number(customHours) || 24;
      if (h > 24) {
        const d = Math.floor(h / 24);
        const remH = h % 24;
        return `${d}d ${remH > 0 ? remH + 'h' : '00h'}`;
      }
      return `${String(Math.max(0, h - 1)).padStart(2, '0')}:59:59`;
    }
    default: return '23:59:59';
  }
};

/**
 * Standard list of countries for WhatsApp Call Phone Number button
 */
const COUNTRY_CODES = [
  { code: '+91', name: 'India', flag: '🇮🇳', iso: 'IN' },
  { code: '+1', name: 'USA / Canada', flag: '🇺🇸', iso: 'US' },
  { code: '+44', name: 'UK', flag: '🇬🇧', iso: 'GB' },
  { code: '+971', name: 'UAE', flag: '🇦🇪', iso: 'AE' },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦', iso: 'SA' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬', iso: 'SG' },
  { code: '+61', name: 'Australia', flag: '🇦🇺', iso: 'AU' },
  { code: '+49', name: 'Germany', flag: '🇩🇪', iso: 'DE' },
  { code: '+33', name: 'France', flag: '🇫🇷', iso: 'FR' },
  { code: '+81', name: 'Japan', flag: '🇯🇵', iso: 'JP' },
  { code: '+86', name: 'China', flag: '🇨🇳', iso: 'CN' },
  { code: '+55', name: 'Brazil', flag: '🇧🇷', iso: 'BR' },
  { code: '+880', name: 'Bangladesh', flag: '🇧🇩', iso: 'BD' },
  { code: '+977', name: 'Nepal', flag: '🇳🇵', iso: 'NP' },
  { code: '+92', name: 'Pakistan', flag: '🇵🇰', iso: 'PK' },
  { code: '+94', name: 'Sri Lanka', flag: '🇱🇰', iso: 'LK' },
  { code: '+60', name: 'Malaysia', flag: '🇲🇾', iso: 'MY' },
  { code: '+62', name: 'Indonesia', flag: '🇮🇩', iso: 'ID' },
  { code: '+27', name: 'South Africa', flag: '🇿🇦', iso: 'ZA' },
  { code: '+234', name: 'Nigeria', flag: '🇳🇬', iso: 'NG' },
  { code: '+254', name: 'Kenya', flag: '🇰🇪', iso: 'KE' },
  { code: '+7', name: 'Russia', flag: '🇷🇺', iso: 'RU' },
  { code: '+34', name: 'Spain', flag: '🇪🇸', iso: 'ES' },
  { code: '+39', name: 'Italy', flag: '🇮🇹', iso: 'IT' },
  { code: '+31', name: 'Netherlands', flag: '🇳🇱', iso: 'NL' },
  { code: '+968', name: 'Oman', flag: '🇴🇲', iso: 'OM' },
  { code: '+974', name: 'Qatar', flag: '🇶🇦', iso: 'QA' },
  { code: '+965', name: 'Kuwait', flag: '🇰🇼', iso: 'KW' },
  { code: '+973', name: 'Bahrain', flag: '🇧🇭', iso: 'BH' }
];

/**
 * Parses and sanitizes a phone button data object so that country code and national digits are cleanly separated
 */
const parsePhoneButtonData = (btn) => {
  let countryCode = btn.countryCode || '+91';
  let phoneVal = String(btn.value || btn.phone_number || '').trim();

  // If phoneVal starts with '+', extract matching country code
  if (phoneVal.startsWith('+')) {
    const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
    const matched = sortedCodes.find(c => phoneVal.startsWith(c.code));
    if (matched) {
      countryCode = matched.code;
      phoneVal = phoneVal.substring(matched.code.length);
    } else {
      phoneVal = phoneVal.replace(/^\+/, '');
    }
  }

  // Strip all non-digits
  let cleanDigits = phoneVal.replace(/\D/g, '');

  // If countryCode is +91 and digits has 12 digits starting with 91, strip the country code 91
  if (countryCode === '+91' && cleanDigits.length === 12 && cleanDigits.startsWith('91')) {
    cleanDigits = cleanDigits.substring(2);
  } else if (cleanDigits.length === 11 && cleanDigits.startsWith('0')) {
    cleanDigits = cleanDigits.replace(/^0+/, '');
  }

  return {
    ...btn,
    countryCode,
    value: cleanDigits
  };
};

/**
 * Formats a phone number for Meta API payload: +<countryCode><digits>
 */
const formatPhoneNumberForMeta = (countryCode = '+91', rawValue = '') => {
  let code = String(countryCode || '+91').trim();
  if (!code.startsWith('+')) code = `+${code}`;
  
  let digits = String(rawValue || '').replace(/\D/g, '');
  const codeDigits = code.replace(/\D/g, '');
  
  if (code === '+91' && digits.length === 12 && digits.startsWith('91')) {
    digits = digits.substring(2);
  } else if (digits.startsWith(codeDigits) && digits.length >= codeDigits.length + 7) {
    digits = digits.substring(codeDigits.length);
  }
  
  if (digits.startsWith('0')) {
    digits = digits.replace(/^0+/, '');
  }
  
  return `${code}${digits}`;
};


/**
 * Checks media file size and dimensions.
 * For images: if dimensions are too large (>1920px) or file size > 5MB,
 * automatically proportionally scales down (shortens/optimizes) without any cropping.
 * If dimensions are very small (<300px), cleanly scales while maintaining 100% aspect ratio.
 */
const processMediaWithoutCropping = (file) => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      return resolve({
        file,
        preview: null,
        width: null,
        height: null,
        aspectRatio: null,
        optimized: false,
        originalSize: file.size,
        newSize: file.size
      });
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const originalWidth = img.naturalWidth || img.width;
        const originalHeight = img.naturalHeight || img.height;
        const aspectLabel = getAspectRatioLabel(originalWidth, originalHeight);

        // Meta WhatsApp limits: max 5MB for images, recommended max dimension 1920px
        const MAX_DIMENSION = 1920;
        const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

        let targetWidth = originalWidth;
        let targetHeight = originalHeight;
        let isResized = false;

        // Scale down proportionally if exceeding 1920px (Zero cropping!)
        if (targetWidth > MAX_DIMENSION || targetHeight > MAX_DIMENSION) {
          isResized = true;
          if (targetWidth >= targetHeight) {
            targetHeight = Math.round((targetHeight * MAX_DIMENSION) / targetWidth);
            targetWidth = MAX_DIMENSION;
          } else {
            targetWidth = Math.round((targetWidth * MAX_DIMENSION) / targetHeight);
            targetHeight = MAX_DIMENSION;
          }
        }

        // If file is > 5MB, we must compress/scale down to comply with WhatsApp API limit
        if (file.size > MAX_BYTES) {
          isResized = true;
          if (targetWidth === originalWidth && targetHeight === originalHeight && targetWidth > 1200) {
            targetHeight = Math.round((targetHeight * 1200) / targetWidth);
            targetWidth = 1200;
          }
        }

        if (!isResized && file.size <= MAX_BYTES) {
          return resolve({
            file,
            preview: e.target.result,
            width: originalWidth,
            height: originalHeight,
            aspectRatio: aspectLabel,
            optimized: false,
            originalSize: file.size,
            newSize: file.size
          });
        }

        // Proportional canvas scale - maintains full image content without cropping
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const outputMime = file.type === 'image/png' && file.size < 3 * 1024 * 1024 ? 'image/png' : 'image/jpeg';
        const quality = 0.90;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve({
                file,
                preview: e.target.result,
                width: originalWidth,
                height: originalHeight,
                aspectRatio: aspectLabel,
                optimized: false,
                originalSize: file.size,
                newSize: file.size
              });
            }

            const cleanFileName = file.name.replace(/\.[^.]+$/, outputMime === 'image/jpeg' ? '.jpg' : '.png');
            const processedFile = new File([blob], cleanFileName, {
              type: outputMime,
              lastModified: Date.now()
            });

            const previewUrl = canvas.toDataURL(outputMime, quality);

            resolve({
              file: processedFile,
              preview: previewUrl,
              width: targetWidth,
              height: targetHeight,
              originalWidth,
              originalHeight,
              aspectRatio: aspectLabel,
              optimized: true,
              originalSize: file.size,
              newSize: processedFile.size
            });
          },
          outputMime,
          quality
        );
      };
      img.onerror = () => {
        resolve({
          file,
          preview: e.target.result,
          width: null,
          height: null,
          aspectRatio: null,
          optimized: false,
          originalSize: file.size,
          newSize: file.size
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

const CreateTemplate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useContext(userContext);
  const currentPlan = (user?.subscriptionPlan || 'free').toLowerCase();
  const currentPlanCapitalized = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);
  const templateLimit = getPlanLimit(currentPlan, 'templates');
  const canAccessGallery = hasPlanFeature(currentPlan, 'templateGallery');
  const [upgradeModal, setUpgradeModal] = useState({ isOpen: false, featureName: 'Templates', message: '' });
  const [existingTemplateCount, setExistingTemplateCount] = useState(0);

  const isEditing = location.state?.isEditing;
  const isDuplicate = location.state?.isDuplicate;
  const templateData = location.state?.templateData;

  useEffect(() => {
    if (!isEditing) {
      fetchWhatsAppTemplates()
        .then(res => {
          const list = res.data?.data || [];
          setExistingTemplateCount(list.length);
        })
        .catch(() => {});
    }
  }, [isEditing]);

  const isLimitReached = !isEditing && templateLimit !== -1 && existingTemplateCount >= templateLimit;

  // ✅ KEY FIX: gallery vs direct create vs edit
  const [view, setView] = useState(
    isEditing ? 'content' : (isDuplicate || location.state?.fromGallery ? 'setup' : 'choose')
  );

  const [templateType, setTemplateType] = useState(() => {
    const comps = location.state?.templateData?.components || [];
    if (comps.some(c => String(c?.type || '').toUpperCase() === 'LIMITED_TIME_OFFER')) {
      return 'LIMITED_TIME_OFFER';
    }
    const btnsComp = comps.find(c => String(c?.type || '').toUpperCase() === 'BUTTONS');
    const btns = btnsComp?.buttons || [];
    if (btns.some(b => String(b?.type || '').toUpperCase() === 'MPM')) {
      return 'MPM';
    }
    if (btns.some(b => String(b?.type || '').toUpperCase() === 'CATALOG')) {
      return 'CATALOG';
    }
    return location.state?.templateData?.subType || 'CUSTOM';
  });
  const [authExpirationMinutes, setAuthExpirationMinutes] = useState(10);
  const [authSecurityRecommendation, setAuthSecurityRecommendation] = useState(true);
  const [buttons, setButtons] = useState([]);
  const [showButtonMenu, setShowButtonMenu] = useState(false);
  const [menuPlacement, setMenuPlacement] = useState('up');
  const buttonMenuRef = useRef(null);
  const editorRef = useRef(null);
  const headerFileRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const [charCount, setCharCount] = useState(0);
  const [bodyVariables, setBodyVariables] = useState([]);
  const [bodySamples, setBodySamples] = useState(location.state?.templateData?.bodySamples || {});
  // eslint-disable-next-line no-unused-vars
  const [headerVariables, setHeaderVariables] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [headerSamples, setHeaderSamples] = useState({});

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const [headerMedia, setHeaderMedia] = useState(
    location.state?.templateData?.headerMediaUrl 
      ? { 
          preview: resolveMediaUrlForDev(location.state.templateData.headerMediaUrl), 
          type: location.state.templateData.headerType?.toLowerCase() || 'image',
          name: 'Existing Media',
          hostedUrl: location.state.templateData.headerMediaUrl // already a hosted URL
        } 
      : null
  );
  // Tracks the actual uploaded file URL returned by the server (DOCUMENT_GET_URL)
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState(
    location.state?.templateData?.headerMediaUrl || null
  );
  // Tracks the Meta handle obtained by uploading to Meta's servers directly (ngrok-free)
  const [uploadedMetaHandle, setUploadedMetaHandle] = useState(null);

  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [selectedLtoProduct, setSelectedLtoProduct] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Fetch real user products from Commerce Catalog / Inventory
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoadingProducts(true);
        let prods = [];
        try {
          const res = await axios.get('/commerce/products');
          prods = res.data?.data || res.data?.products || (Array.isArray(res.data) ? res.data : []);
        } catch (_) {}

        if (!prods || prods.length === 0) {
          try {
            const res2 = await axios.get('/products?limit=50');
            prods = res2.data?.data || res2.data?.products || (Array.isArray(res2.data) ? res2.data : []);
          } catch (_) {}
        }

        if (Array.isArray(prods) && prods.length > 0) {
          setCatalogProducts(prods);
          setSelectedLtoProduct(prods[0]);
        }
      } catch (err) {
        console.warn('Error fetching catalog products for template preview:', err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchCatalog();
  }, []);

  // Initialize editor with bodyText on mount
  useEffect(() => {
    if (editorRef.current) {
      // Ensure we render the markdown as HTML in the editor
      editorRef.current.innerHTML = formatWhatsAppMarkdown(formData.bodyText);
      const plainText = editorRef.current.innerText;
      setCharCount(plainText.length);
      syncBodyVariableState(plainText);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const extractBodyVariables = (text = '') => {
    const matches = text.match(/\{\{\s*(\d+)\s*\}\}/g) || [];
    const numericIds = matches
      .map((token) => Number((token.match(/\d+/) || [])[0]))
      .filter((id) => Number.isInteger(id) && id > 0);

    return [...new Set(numericIds)].sort((a, b) => a - b);
  };

  const syncBodyVariableState = (text = '') => {
    const variables = extractBodyVariables(text);
    setBodyVariables(variables);
    setBodySamples((prev) => {
      const next = {};
      variables.forEach((id) => {
        next[id] = prev[id] || '';
      });
      return next;
    });
  };

  const syncEditorContent = () => {
    if (!editorRef.current) return;
    const plain = editorRef.current.innerText;
    if (plain.length <= 1024) {
      setCharCount(plain.length);
      setFormData(prev => ({ ...prev, bodyText: editorRef.current.innerHTML }));
      syncBodyVariableState(plain);
      validateBodyText(plain);
    } else {
      // truncate — restore selection to end
      editorRef.current.innerText = plain.slice(0, 1024);
      setCharCount(1024);
      syncBodyVariableState(editorRef.current.innerText);
      validateBodyText(plain.slice(0, 1024));
    }
  };

  const [bodyWarnings, setBodyWarnings] = useState([]);

  const validateBodyText = (text = '') => {
    const warnings = [];

    // 1. Emoji count (Unicode emoji detection)
    const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu;
    const emojiMatches = text.match(emojiRegex) || [];
    if (emojiMatches.length > 10) {
      warnings.push(`Too many emojis (${emojiMatches.length}). WhatsApp allows a maximum of 10 emojis per template.`);
    }

    // 2. Consecutive spaces (more than 4 in a row)
    const spaceMatch = text.match(/ {5,}/);
    if (spaceMatch) {
      warnings.push('Excessive consecutive spaces detected. WhatsApp may flag templates with large whitespace blocks.');
    }

    // 3. Consecutive newlines (more than 2)
    const newlineMatch = text.match(/\n{3,}/);
    if (newlineMatch) {
      warnings.push('More than 2 consecutive blank lines detected. Keep formatting clean to avoid rejection.');
    }

    // 4. Malformed variables — spaces inside braces, e.g. { {1} }
    const malformedVars = text.match(/\{\s+\{|\}\s+\}/g) || [];
    if (malformedVars.length > 0) {
      warnings.push('Malformed variable detected. Use {{1}} with no spaces inside the braces.');
    }

    // 5. Empty variable — {{}}
    const emptyVars = text.match(/\{\{\s*\}\}/g) || [];
    if (emptyVars.length > 0) {
      warnings.push('Empty variable {{}} detected. Variables must have a number, e.g. {{1}}.');
    }

    // 6. Non-sequential variables — e.g. {{1}} then {{3}} skipping {{2}}
    const vars = (text.match(/\{\{(\d+)\}\}/g) || []).map(v => parseInt(v.replace(/\D/g, ''), 10));
    const uniqueVars = [...new Set(vars)].sort((a, b) => a - b);
    const isSequential = uniqueVars.every((v, i) => v === i + 1);
    if (uniqueVars.length > 0 && !isSequential) {
      warnings.push(`Variables must be sequential starting from {{1}}. Found: ${uniqueVars.map(v => `{{${v}}}`).join(', ')}.`);
    }

    // 7. Repeated character abuse (e.g. "!!!!!" or "....")
    const repeatedPunct = text.match(/([!?.]){5,}/g) || [];
    if (repeatedPunct.length > 0) {
      warnings.push('Repeated punctuation (e.g. "!!!!!") may cause rejection. Use 1–2 marks at most.');
    }

    // 8. All caps body
    const letters = text.replace(/[^a-zA-Z]/g, '');
    if (letters.length > 20 && letters === letters.toUpperCase()) {
      warnings.push('Body text appears to be ALL CAPS. WhatsApp discourages fully uppercase messages.');
    }

    // 9. URL in body (discouraged in some categories)
    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      warnings.push('URLs in the body text may reduce approval chances. Consider using a Call-to-Action button instead.');
    }

    // 10. Approaching char limit
    if (text.length >= 950 && text.length <= 1024) {
      warnings.push(`Approaching character limit (${text.length}/1024). Keep it under 1024.`);
    }

    setBodyWarnings(warnings);
  };

  const handleBodySampleChange = (variableId, value) => {
    setBodySamples((prev) => ({ ...prev, [variableId]: value }));
  };

  const handleHeaderSampleChange = (variableId, value) => {
    setHeaderSamples((prev) => ({ ...prev, [variableId]: value }));
  };

  const handleHeaderTextChange = (text) => {
    setFormData(prev => ({ ...prev, headerText: text }));
    const variables = extractBodyVariables(text); // same logic applies
    setHeaderVariables(variables);
    setHeaderSamples((prev) => {
      const next = {};
      variables.forEach((id) => {
        next[id] = prev[id] || '';
      });
      return next;
    });
  };

  const applyFormat = (command) => {
    editorRef.current?.focus();
    document.execCommand(command, false, null);
    syncEditorContent();
  };

  const onEmojiClick = (emojiData) => {
    const emoji = emojiData?.emoji || emojiData;
    editorRef.current?.focus();
    document.execCommand('insertText', false, emoji);
    syncEditorContent();
  };

  const insertEmoji = (emoji) => onEmojiClick(emoji);

  const insertVariable = () => {
    editorRef.current?.focus();
    const text = editorRef.current?.innerText || '';
    const matches = text.match(/\{\{(\d+)\}\}/g) || [];
    document.execCommand('insertText', false, `{{${matches.length + 1}}}`);
    syncEditorContent();
  };

  const removeVariable = (variableId) => {
    if (!editorRef.current) return;
    // Remove the variable from innerHTML (preserves other formatting)
    let html = editorRef.current.innerHTML;
    html = html.replace(new RegExp(`\\{\\{\\s*${variableId}\\s*\\}\\}`, 'g'), '');

    // Re-number remaining variables sequentially
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const remaining = extractBodyVariables(tempDiv.innerText);
    remaining.forEach((oldId, idx) => {
      const newId = idx + 1;
      if (oldId !== newId) {
        html = html.replace(new RegExp(`\\{\\{\\s*${oldId}\\s*\\}\\}`, 'g'), `{{${newId}}}`);
      }
    });

    editorRef.current.innerHTML = html;
    syncEditorContent();
  };

  const [formData, setFormData] = useState({
    category: (location.state?.templateData?.category 
      ? location.state.templateData.category.charAt(0).toUpperCase() + location.state.templateData.category.slice(1).toLowerCase() 
      : 'Marketing'),
    name: location.state?.templateData?.name || '',
    language: location.state?.templateData?.language || 'English (US)',
    offerTitle: '20% OFF',
    limitedTimeOfferText: location.state?.templateData?.limitedTimeOfferText || 'Expiring offer!',
    hasExpiration: true,
    offerCode: location.state?.templateData?.offerCode || '',
    ltoHasUrlButton: false,
    ltoUrlText: 'Shop Now',
    ltoUrl: location.state?.templateData?.ltoUrl || '',
    headerType: location.state?.templateData?.headerType || 'None',
    headerText: location.state?.templateData?.headerText || '',
    bodyText: location.state?.templateData?.bodyText || '',
    footerText: location.state?.templateData?.footerText || '',
    expirationDate: location.state?.templateData?.expirationDate || '24h',
    customExpirationHours: location.state?.templateData?.customExpirationHours || 24,
    catalogButtonText: location.state?.templateData?.buttons?.[0]?.text || 'View Catalog',
    mpmButtonText: location.state?.templateData?.buttons?.[0]?.text || 'View Items',
  });

  // Prepopulate buttons if editing
  useEffect(() => {
    if (location.state?.templateData?.buttons) {
      const sanitized = location.state.templateData.buttons.map(b => {
        if (b.type === 'Call phone number' || b.type === 'PHONE_NUMBER') {
          return parsePhoneButtonData({ ...b, type: 'Call phone number' });
        }
        return b;
      });
      setButtons(sanitized);
    }
  }, [location.state]);

  // Handle phone input changes with dynamic country code detection for all countries
  const handlePhoneInputChange = (btnId, rawInput, currentCountryCode = '+91') => {
    let val = String(rawInput || '').trim();
    let selectedCode = currentCountryCode || '+91';

    // 1. If user typed or pasted with '+' (e.g. +971 501234567, +91 9162034567, +1 555 123 4567)
    const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
    if (val.startsWith('+')) {
      const matched = sortedCodes.find(c => val.startsWith(c.code));
      if (matched) {
        selectedCode = matched.code;
        val = val.substring(matched.code.length);
      } else {
        val = val.replace(/^\+/, '');
      }
    }

    // 2. Strip non-digits
    let cleanDigits = val.replace(/\D/g, '');

    // 3. Dynamic country code deduction for ANY country code (India, UAE, USA, UK, etc.)
    for (const c of sortedCodes) {
      const codeDigits = c.code.replace(/\D/g, '');
      if (cleanDigits.startsWith(codeDigits) && cleanDigits.length >= codeDigits.length + 7) {
        if (selectedCode === c.code || cleanDigits.length > 10) {
          selectedCode = c.code;
          cleanDigits = cleanDigits.substring(codeDigits.length);
          break;
        }
      }
    }

    // 4. Strip leading 0 if any
    if (cleanDigits.startsWith('0') && cleanDigits.length > 9) {
      cleanDigits = cleanDigits.replace(/^0+/, '');
    }

    // 5. Max 15 digits according to E.164
    cleanDigits = cleanDigits.substring(0, 15);

    setButtons(prev => prev.map(b => b.id === btnId ? {
      ...b,
      countryCode: selectedCode,
      value: cleanDigits
    } : b));
  };


  const handleCategoryChange = (cat) => {
    if (formData.category === cat) return; // Skip if no change
    
    // Don't auto-fill body — let the user write their own content
    setFormData({ ...formData, category: cat, bodyText: '' });

    // Reset body editor too
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
      setCharCount(0);
      setBodyVariables([]);
      setBodySamples({});
    }

    if (cat === 'Authentication') {
      setTemplateType('OTP');
      setBodySamples({ 1: '123456' }); // Auto-fill OTP sample so {{1}} passes validation
    } else {
      setTemplateType('CUSTOM');
      setBodySamples({}); // Clear auth sample when switching away
    }
  };

  const showToast = (message, type = 'success') => {
    if (type === 'success') toast.success(message);
    else toast.error(message);
  };

  // Close button menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonMenuRef.current && !buttonMenuRef.current.contains(event.target)) {
        setShowButtonMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Button counts by type
  const websiteButtonCount = buttons.filter(b => b.type === 'Visit website' || b.type === 'Visit Website').length;
  const phoneButtonCount = buttons.filter(b => b.type === 'Call phone number').length;
  const copyCodeButtonCount = buttons.filter(b => b.type === 'Copy offer code').length;
  const quickReplyButtonCount = buttons.filter(b => b.type === 'Custom' || b.type === 'Marketing opt-out').length;

  const addSpecificButton = (actionType) => {
    setShowButtonMenu(false);

    if (buttons.length >= 10) {
      toast.error('Maximum 10 buttons allowed per template.');
      return;
    }

    if (actionType === 'Marketing opt-out') {
      if (quickReplyButtonCount >= 3) {
        toast.error('Maximum 3 quick reply buttons allowed.');
        return;
      }
      setButtons([...buttons, { 
        id: Date.now(), 
        type: 'Marketing opt-out', 
        text: 'Stop promotions', 
        value: '' 
      }]);
      return;
    }

    if (actionType === 'Custom') {
      if (quickReplyButtonCount >= 3) {
        toast.error('Maximum 3 quick reply buttons allowed.');
        return;
      }
      setButtons([...buttons, { 
        id: Date.now(), 
        type: 'Custom', 
        text: 'Quick Reply', 
        value: '' 
      }]);
      return;
    }

    if (actionType === 'Visit website') {
      if (websiteButtonCount >= 2) {
        toast.error('Maximum 2 website buttons allowed.');
        return;
      }
      setButtons([...buttons, { 
        id: Date.now(), 
        type: 'Visit website', 
        text: 'Visit website', 
        value: '',
        urlType: 'static'
      }]);
      return;
    }

    if (actionType === 'Call phone number') {
      if (phoneButtonCount >= 1) {
        toast.error('Maximum 1 phone number button allowed.');
        return;
      }
      setButtons([...buttons, { 
        id: Date.now(), 
        type: 'Call phone number', 
        text: 'Call us', 
        countryCode: '+91', 
        value: '' 
      }]);
      return;
    }

    if (actionType === 'Copy offer code') {
      if (copyCodeButtonCount >= 1) {
        toast.error('Maximum 1 copy offer code button allowed.');
        return;
      }
      setButtons([...buttons, { 
        id: Date.now(), 
        type: 'Copy offer code', 
        text: 'Copy offer code', 
        value: '' 
      }]);
      return;
    }
  };

  const addButton = () => {
    if (!showButtonMenu && buttonMenuRef.current) {
      const rect = buttonMenuRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // Popup height is ~280px. If space below is less than 300px and space above is larger, open UP, otherwise open DOWN
      if (spaceBelow < 300 && spaceAbove > spaceBelow) {
        setMenuPlacement('up');
      } else {
        setMenuPlacement('down');
      }
    }
    setShowButtonMenu(!showButtonMenu);
  };

  const removeButton = (id) => {
    setButtons(buttons.filter(btn => btn.id !== id));
    showToast("Button deleted successfully", "error");
  };

  const updateButton = (id, field, value) => {
    setButtons(buttons.map(btn => btn.id === id ? { ...btn, [field]: value } : btn));
  };

  const handleHeaderMediaUpload = async (e) => {
    const originalFile = e.target.files?.[0];
    if (!originalFile) return;

    const allowedImageTypes = ['image/jpeg', 'image/png'];
    const allowedVideoTypes = ['video/mp4'];
    const allowedDocumentTypes = ['application/pdf'];

    const mediaType = originalFile.type.startsWith('image/')
      ? 'image'
      : originalFile.type.startsWith('video/')
        ? 'video'
        : 'document';

    // WhatsApp strict validation
    if (mediaType === 'image' && !allowedImageTypes.includes(originalFile.type)) {
      toast.error('WhatsApp only supports JPG and PNG images for templates.');
      return;
    }
    if (mediaType === 'video' && !allowedVideoTypes.includes(originalFile.type)) {
      toast.error('WhatsApp only supports MP4 videos for templates.');
      return;
    }
    if (mediaType === 'video' && originalFile.size > 16 * 1024 * 1024) {
      toast.error('Video file size must be less than 16MB for WhatsApp header.');
      return;
    }
    if (mediaType === 'document' && originalFile.size > 16 * 1024 * 1024) {
      toast.error('Document file size must be less than 16MB for template sample.');
      return;
    }

    // Process media: checks dimensions and auto-resizes proportionally without cropping
    const processed = await processMediaWithoutCropping(originalFile);
    const fileToUpload = processed.file;

    // Show preview immediately with dimension & aspect ratio metadata (without cropping)
    if (mediaType === 'image' && processed.preview) {
      setHeaderMedia({
        file: fileToUpload,
        preview: processed.preview,
        type: mediaType,
        name: fileToUpload.name,
        width: processed.width,
        height: processed.height,
        aspectRatio: processed.aspectRatio,
        optimized: processed.optimized,
        originalSize: processed.originalSize,
        newSize: processed.newSize,
        hostedUrl: null
      });
      if (processed.optimized) {
        toast.info(
          `Image auto-scaled (${processed.originalWidth}×${processed.originalHeight} → ${processed.width}×${processed.height} px) to optimize for WhatsApp without cropping!`,
          { toastId: 'image-autoscale' }
        );
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        setHeaderMedia({
          file: fileToUpload,
          preview: event.target?.result,
          type: mediaType,
          name: fileToUpload.name,
          width: null,
          height: null,
          aspectRatio: null,
          optimized: false,
          originalSize: originalFile.size,
          newSize: fileToUpload.size,
          hostedUrl: null
        });
      };
      reader.readAsDataURL(fileToUpload);
    }

    // Upload to server and get the public DOCUMENT_GET_URL-based URL
    setIsUploadingMedia(true);
    setUploadProgress(0);
    try {
      const response = await uploadTemplateMedia(fileToUpload, (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      if (response?.success && response?.data?.url) {
        const hostedUrl = response.data.url;
        const metaHandle = response.data.metaHandle || null;
        setUploadedMediaUrl(hostedUrl);
        setUploadedMetaHandle(metaHandle);
        setHeaderMedia((prev) => prev ? { ...prev, hostedUrl } : prev);
        if (metaHandle) {
          toast.success('Media uploaded to Meta servers successfully!');
        } else {
          toast.success('Media uploaded! (Note: template needs a public URL for Meta)');
        }
      } else {
        const errMsg = response?.message || 'Server upload failed.';
        toast.error(`Media upload failed: ${errMsg}`);
      }
    } catch (uploadErr) {
      console.error('Template media upload error:', uploadErr);
      const errMsg = uploadErr.response?.data?.message || uploadErr.message || 'Server upload failed.';
      toast.error(`Upload error: ${errMsg}`);
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const removeHeaderMedia = () => {
    setHeaderMedia(null);
    setUploadedMediaUrl(null);
    setUploadedMetaHandle(null);
    if (headerFileRef.current) {
      headerFileRef.current.value = '';
    }
  };


  const triggerHeaderMediaPicker = () => {
    if (!headerFileRef.current) return;
    // Allow selecting the same file again after "Change" click.
    headerFileRef.current.value = '';
    headerFileRef.current.click();
  };

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaAssets, setMediaAssets] = useState([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

  const fetchMediaAssets = async () => {
    try {
      setIsLoadingMedia(true);
      const { data } = await axios.get("/media");
      if (data.success) {
        setMediaAssets(data.data);
      }
    } catch (err) {
      toast.error("Failed to load media assets");
    } finally {
      setIsLoadingMedia(false);
    }
  };

  useEffect(() => {
    if (isMediaModalOpen) {
      fetchMediaAssets();
    }
  }, [isMediaModalOpen]);

  const handleSelectExistingMedia = async (asset) => {
    let mt = 'document';
    if (asset.type === 'IMAGE') mt = 'image';
    if (asset.type === 'VIDEO') mt = 'video';

    // Replace incorrect localhost URLs from old database entries
    let publicUrl = asset.url || '';
    
    setHeaderMedia({
      file: null,
      preview: resolveMediaUrlForDev(asset.thumb || publicUrl),
      type: mt,
      name: asset.name,
      hostedUrl: publicUrl
    });
    setUploadedMediaUrl(publicUrl);
    setUploadedMetaHandle(null);
    setIsMediaModalOpen(false);

    try {
      setIsUploadingMedia(true);
      setUploadProgress(0);
      const toastId = toast.loading('Generating Meta handle for template media...');
      
      const uploadResp = await uploadTemplateMediaByUrl(publicUrl, (progressEvent) => {
        if(progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if (uploadResp?.success) {
        setUploadedMediaUrl(uploadResp.data.url);
        if (uploadResp.data.metaHandle) {
          setUploadedMetaHandle(uploadResp.data.metaHandle);
          toast.update(toastId, { render: 'Meta handle generated!', type: 'success', isLoading: false, autoClose: 2000 });
        } else {
          toast.update(toastId, { render: 'Media processed, but no handle generated.', type: 'info', isLoading: false, autoClose: 2500 });
        }
      } else {
        toast.update(toastId, { render: 'Failed to generate Meta handle.', type: 'error', isLoading: false, autoClose: 3000 });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error generating Meta handle.');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState(null);
  const [templateNameSuggestion, setTemplateNameSuggestion] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [headerError, setHeaderError] = useState(false);
  const headerRef = useRef(null);

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    setSubmitError(null);
    setHeaderError(false);
    setNameError(null);
    setTemplateNameSuggestion(null);

    const failSubmit = (msg, isHeader = false) => {
      setSubmitError(msg);
      toast.error(msg);
      if (isHeader) {
        setHeaderError(true);
        if (headerRef.current) {
          headerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };

    if (!isEditing && isLimitReached) {
      failSubmit(`Template limit reached (${existingTemplateCount}/${templateLimit}). Please upgrade your plan to create more templates.`);
      setUpgradeModal({
        isOpen: true,
        featureName: 'Templates',
        message: `You have reached your limit of ${templateLimit} templates on the ${currentPlanCapitalized} plan. Upgrade to create more templates!`
      });
      return;
    }

    if (!formData.name.trim()) {
      failSubmit("Template name is mandatory");
      return;
    }

    // Validate template name length (WhatsApp has higher approval rates with longer names)
    if (formData.name.length < 4) {
      failSubmit("Template name must be at least 4 characters");
      return;
    }

    // ── AUTHENTICATION early-exit: skip body/header validations entirely ──
    // Authentication templates use a structured OTP payload, not free-form body text.
    if (formData.category === 'Authentication') {
      const inputNameRaw = typeof formData.name === 'string' ? formData.name : String(formData.name || '');
      const waNameAuth = inputNameRaw.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

      if (!waNameAuth || waNameAuth.length < 4) {
        failSubmit(`Template name "${waNameAuth}" is too short or invalid. Minimum 4 characters using letters, numbers, or underscores.`);
        return;
      }

      setIsSubmitting(true);
      try {
        const authComponents = [
          { type: 'BODY', add_security_recommendation: authSecurityRecommendation },
          { type: 'FOOTER', code_expiration_minutes: Number(authExpirationMinutes) || 10 },
          { type: 'BUTTONS', buttons: [{ type: 'OTP', otp_type: 'COPY_CODE' }] }
        ];

        const originalName = typeof templateData?.name === 'string' ? templateData.name : '';

        // If editing existing Authentication template, update it instead of creating
        if (isEditing && templateData?.id) {
          console.log(`Updating existing Authentication template: ${originalName} (ID: ${templateData.id})`);
          await updateWhatsAppTemplate(templateData.id, {
            components: authComponents
          });
          const successMessage = 'Template updated successfully! Meta may take a moment to reflect the changes.';
          toast.success(successMessage, { toastId: 'template-saved-success', autoClose: 5000 });
          try {
            localStorage.setItem('templateSuccessToast', JSON.stringify({
              message: successMessage,
              isEditing: true,
              templateName: originalName || waNameAuth,
              ts: Date.now()
            }));
          } catch (_) {}
          setTimeout(() => navigate('/admin/templates/list', { replace: true }), 150);
          return;
        }

        const authPayload = {
          name: waNameAuth,
          category: 'AUTHENTICATION',
          language: formData.language === 'English (US)' ? 'en_US' : (formData.language === 'Hindi' ? 'hi_IN' : 'en_US'),
          components: authComponents
        };
        await createWhatsAppTemplate(authPayload);
        const successMessage = 'Authentication OTP template created successfully!';
        toast.success(successMessage, { toastId: 'template-saved-success', autoClose: 5000 });
        try {
          localStorage.setItem('templateSuccessToast', JSON.stringify({
            message: successMessage,
            isEditing: false,
            templateName: waNameAuth,
            ts: Date.now()
          }));
        } catch (_) {}
        setTimeout(() => navigate('/admin/templates/list', { replace: true }), 150);
      } catch (error) {
        if (error?.response?.data?.limitReached) {
          setUpgradeModal({
            isOpen: true,
            featureName: 'Templates',
            message: error?.response?.data?.message || `You have reached your template limit. Upgrade your plan to create more templates!`
          });
          return;
        }
        const waError = error?.response?.data?.error || {};
        const nestedWaError = waError?.error || {};
        const errMsg =
          nestedWaError?.message ||
          waError?.message ||
          error?.response?.data?.message ||
          error?.message ||
          (isEditing ? 'Failed to update Authentication template. Please try again.' : 'Failed to create Authentication template. Please try again.');
        toast.error(errMsg);
      } finally {
        setIsSubmitting(false);
      }
      return; // Done — skip everything else
    }
    
    // Validate body text is complete (non-Authentication templates only)
    if (!formData.bodyText.trim()) {
      failSubmit("Template body content is mandatory");
      return;
    }
    
    const bodyText = formData.bodyText.trim();
    
    // Convert HTML formatting to WhatsApp Markdown formatting
    let markdownBody = bodyText;
    if (editorRef.current) {
        let html = editorRef.current.innerHTML;
        // Convert breaks to newlines
        html = html.replace(/<br\s*\/?>/gi, '\n');
        html = html.replace(/<\/div>/gi, '\n');
        html = html.replace(/<\/p>/gi, '\n');
        // Replace formats with trimmed content inside markers to ensure WhatsApp compatibility
        // WhatsApp markdown markers (*, _, ~) must be immediately adjacent to non-whitespace characters
        const formatReplacer = (marker) => (match, tag, content) => {
            // Strip any internal HTML tags first
            const textOnly = content.replace(/<[^>]+>/g, '');
            // Get leading and trailing whitespace
            const leading = textOnly.match(/^\s*/)[0];
            const trailing = textOnly.match(/\s*$/)[0];
            // Trim the core content
            const trimmed = textOnly.trim();
            
            // If there's content, return it with markers tight around the trimmed text, 
            // and original spacing preserved OUTSIDE the markers.
            if (trimmed) {
                return `${leading}${marker}${trimmed}${marker}${trailing}`;
            }
            return textOnly;
        };

        html = html.replace(/<(b|strong)>([\s\S]*?)<\/\1>/gi, formatReplacer('*'));
        html = html.replace(/<(i|em)>([\s\S]*?)<\/\1>/gi, formatReplacer('_'));
        html = html.replace(/<(strike|s)>([\s\S]*?)<\/\1>/gi, formatReplacer('~'));
        // Strip remaining tags
        html = html.replace(/<[^>]+>/g, '');
        // Decode HTML entities (e.g. &nbsp;)
        const textarea = document.createElement('textarea');
        textarea.innerHTML = html;
        markdownBody = textarea.value.trim();
    } else {
        markdownBody = bodyText.replace(/<[^>]+>/g, '');
    }
    
    const strippedBody = markdownBody;
    const templateVariables = extractBodyVariables(strippedBody);

    if (bodyText.length < 20) {
      failSubmit("Template body must be at least 20 characters for better approval rates");
      return;
    }

    // Check for incomplete sentences
    if (bodyText.endsWith('Use') || bodyText.endsWith('Please') || bodyText.endsWith('For')) {
      failSubmit("Template body text appears incomplete. Please complete the message.");
      return;
    }

    if (templateVariables.length > 0) {
      const hasMissingSamples = templateVariables.some((id) => !String(bodySamples[id] || '').trim());
      if (hasMissingSamples) {
        failSubmit("Please add sample text for all body variables");
        return;
      }
    }

    if (formData.headerType === 'Text' && headerVariables.length > 0) {
      const hasMissingHeaderSamples = headerVariables.some((id) => !String(headerSamples[id] || '').trim());
      if (hasMissingHeaderSamples) {
        failSubmit("Please add sample text for all header variables", true);
        return;
      }
    }

    if (strippedBody.length > 1024) {
      failSubmit(`Template body is ${strippedBody.length} characters. WhatsApp allows a maximum of 1024 characters.`);
      return;
    }
    
    // Convert name to WA format (lowercase, underscores)
    // If overrideName is provided, it's already formatted; otherwise format formData.name
    let waName;
    
    // Safely extract name - handle cases where it might be an object or non-string
    let inputName = '';
    
    try {
      // Extract name safely - if it's an object, try to get name property; otherwise use as string
      if (typeof formData.name === 'string') {
        inputName = formData.name;
      } else if (typeof formData.name === 'object' && formData.name?.name) {
        inputName = String(formData.name.name || '');
      } else {
        inputName = String(formData.name || '');
      }
      
      // Ensure waName is always a string before calling methods
      inputName = String(inputName).trim();
      
      // Format the name
      waName = inputName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

      // Force waName to originalName if editing to ensure we update the existing template
      const originalName = typeof templateData?.name === 'string' ? templateData.name : '';
      if (isEditing && originalName) {
        waName = originalName;
      }
    } catch (err) {
      console.error('Error processing template name:', err);
      toast.error("Error processing template name. Please try again.");
      return;
    }



    // Validate the formatted name meets WhatsApp requirements
    if (!waName || waName.length === 0) {
      failSubmit("Template name cannot be empty. Please use letters, numbers, or underscores.");
      return;
    }

    if (!/^[a-z0-9_]+$/.test(waName)) {
      failSubmit(`Invalid name format. Formatted name "${waName}" contains invalid characters. Use only letters, numbers, and underscores.`);
      return;
    }

    if (waName.length < 4) {
      failSubmit(`Template name too short. Formatted name "${waName}" is ${waName.length} chars. Minimum is 4 characters.`);
      return;
    }

    if (templateType === 'MPM') {
      if (!formData.headerType || formData.headerType !== 'Text') {
        failSubmit("Meta WhatsApp strictly requires a Text header for Multi-Product Messages to act as the collection title. Please select a Text header above.", true);
        return;
      }
      if (!formData.headerText || !formData.headerText.trim()) {
        failSubmit("Please enter a Header Title for your Multi-Product Message (e.g. Featured Products).", true);
        return;
      }
    }

    if (templateType === 'LIMITED_TIME_OFFER') {
      if (formData.headerType === 'Document') {
        failSubmit("Limited-Time Offer templates do not support Document headers. Please select None, Text, Image, or Video.", true);
        return;
      }
      if (!formData.limitedTimeOfferText || !formData.limitedTimeOfferText.trim()) {
        failSubmit("Please enter the Offer heading text (max 16 characters).");
        return;
      }
      if (formData.limitedTimeOfferText.trim().length > 16) {
        failSubmit("Offer heading text cannot exceed 16 characters.");
        return;
      }
      if (!formData.offerCode || !formData.offerCode.trim()) {
        failSubmit("Please enter an Offer / Coupon Code for the Copy Code button (max 15 characters, e.g. 20OFF).");
        return;
      }
      if (!/^[A-Za-z0-9_-]{1,15}$/.test(formData.offerCode.trim())) {
        failSubmit("Coupon Code can only contain letters and numbers without spaces or special symbols like '%' (e.g. 20OFF or FLAT50).");
        return;
      }
      if (formData.offerCode.trim().length > 15) {
        failSubmit("Offer / Coupon Code cannot exceed 15 characters.");
        return;
      }
      if (!formData.ltoUrl || !formData.ltoUrl.trim()) {
        failSubmit("WhatsApp mandates a Website URL button for Limited-Time Offers. Please enter your website or offer link below.");
        return;
      }
      if (!/^https?:\/\//i.test(formData.ltoUrl.trim())) {
        failSubmit("Website URL must start with https:// or http:// (e.g. https://example.com/offers).");
        return;
      }
    }

    setIsSubmitting(true);

    // Prevent submission if media is still uploading
    const hasMediaHeader = ['Image', 'Video', 'Document'].includes(formData.headerType);
    if (hasMediaHeader && !uploadedMediaUrl && !headerMedia?.hostedUrl) {
      failSubmit('Please wait for the media to finish uploading before submitting.', true);
      setIsSubmitting(false);
      return;
    }

    try {
      // ── All other categories (Marketing, Utility) use the normal flow below ──
      const components = [];


      // Fallback public URLs (only used if no file was uploaded by the user)
      const mediaHeaderFallbacks = {
        Image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
        Video: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
        Document: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      };

      // Prefer the real server-hosted URL from DOCUMENT_GET_URL
      const getHeaderUrl = (type) => {
        if (uploadedMediaUrl) return uploadedMediaUrl;
        if (headerMedia?.hostedUrl) return headerMedia.hostedUrl;
        return mediaHeaderFallbacks[type];
      };

      // Add HEADER component only if valid
      // ⚠️ CATALOG templates do NOT support custom headers — Meta auto-uses the product thumbnail
      if (formData.headerType && formData.headerType !== 'None' && templateType !== 'CATALOG') {
        if (formData.headerType === 'Text') {
          const headerComponent = { 
            type: 'HEADER', 
            format: 'TEXT', 
            text: (formData.headerText || formData.name || '').substring(0, 60)
          };
          
          if (headerVariables.length > 0) {
            headerComponent.example = {
              header_text: headerVariables.map((id) => String(headerSamples[id] || '').trim())
            };
          }
          
          components.push(headerComponent);
        } else {
          // For IMAGE/VIDEO/DOCUMENT: prefer Meta handle (ngrok-free), fallback to URL
          const format = formData.headerType.toUpperCase();
          const headerComponent = { type: 'HEADER', format };

          if (uploadedMetaHandle) {
            // Best approach: use handle directly (no public URL needed)
            headerComponent.example = { header_handle: [uploadedMetaHandle] };
          } else {
            // Fallback: use URL (requires public URL like ngrok)
            const url = getHeaderUrl(formData.headerType);
            headerComponent.example = { header_url: [url] };
          }
          components.push(headerComponent);
        }
      }


      if (templateType === 'LIMITED_TIME_OFFER') {
        components.push({
          type: 'LIMITED_TIME_OFFER',
          limited_time_offer: {
            text: (formData.limitedTimeOfferText || 'Expiring offer!').trim().substring(0, 16),
            has_expiration: formData.hasExpiration !== false
          }
        });
      }

      const bodyComponent = { type: 'BODY', text: strippedBody };
      if (templateVariables.length > 0) {
        bodyComponent.example = {
          body_text: [templateVariables.map((id) => String(bodySamples[id] || '').trim())]
        };
      }
      components.push(bodyComponent);

      if (templateType !== 'LIMITED_TIME_OFFER' && formData.footerText && formData.footerText.trim()) {
        components.push({ type: 'FOOTER', text: formData.footerText.substring(0, 60) }); // Max 60 chars
      }

      if (templateType === 'CATALOG') {
        components.push({
          type: 'BUTTONS',
          buttons: [
            {
              type: 'CATALOG',
              text: 'View catalog' // Meta mandate: CATALOG button text MUST always be exactly "View catalog" — cannot be modified
            }
          ]
        });
      } else if (templateType === 'MPM') {
        components.push({
          type: 'BUTTONS',
          buttons: [
            {
              type: 'MPM',
              // Meta mandates this text MUST always be exactly "View items" — cannot be modified
              text: 'View items'
            }
          ]
        });
      } else if (templateType === 'LIMITED_TIME_OFFER') {
        const ltoButtons = [
          {
            type: 'COPY_CODE',
            example: (formData.offerCode || '').trim().substring(0, 15)
          },
          {
            type: 'URL',
            text: (formData.ltoUrlText || 'Shop Now').trim().substring(0, 25),
            url: (formData.ltoUrl || '').trim()
          }
        ];
        components.push({
          type: 'BUTTONS',
          buttons: ltoButtons
        });
      } else if (buttons && buttons.length > 0) {
        // ── Validate buttons before building payload ──
        for (const b of buttons) {
          if ((b.type === 'Visit Website' || b.type === 'Visit website')) {
            if (!b.value || !b.value.trim()) {
              failSubmit(`Button "${b.text || 'Visit website'}" is missing a URL. Please enter a valid URL (e.g. https://example.com).`);
              setIsSubmitting(false);
              return;
            }
            if (!/^https?:\/\//i.test(b.value.trim())) {
              failSubmit(`Button "${b.text}" URL must start with https:// or http://`);
              setIsSubmitting(false);
              return;
            }
            if (b.urlType === 'dynamic' && !b.value.includes('{{1}}')) {
              failSubmit(`Button "${b.text}" is set to Dynamic URL but URL doesn't contain {{1}}. Example: https://site.com/page/{{1}}`);
              setIsSubmitting(false);
              return;
            }
            if (b.urlType === 'dynamic' && (!b.urlExample || !b.urlExample.trim())) {
              failSubmit(`Button "${b.text}" has a Dynamic URL — provide an Example Value for {{1}} (required by Meta for approval).`);
              setIsSubmitting(false);
              return;
            }
          }
          if (b.type === 'Call phone number') {
            const cleanDigits = String(b.value || '').replace(/\D/g, '');
            if (!cleanDigits) {
              failSubmit(`Button "${b.text || 'Call us'}" is missing a phone number.`);
              setIsSubmitting(false);
              return;
            }
            if (cleanDigits.length < 7 || cleanDigits.length > 15) {
              failSubmit(`Button "${b.text || 'Call us'}" phone number must be between 7 and 15 digits.`);
              setIsSubmitting(false);
              return;
            }
          }
          if (b.type === 'Copy offer code') {
            if (!b.value || !b.value.trim()) {
              failSubmit(`"Copy offer code" button is missing the offer code value.`);
              setIsSubmitting(false);
              return;
            }
          }
        }

        const waButtons = buttons.map(b => {
          if (b.type === 'Visit Website' || b.type === 'Visit website') {
            const isDynamic = b.urlType === 'dynamic';
            const btnObj = { 
              type: 'URL', 
              text: (b.text || 'Visit website').trim().substring(0, 25), 
              url: (b.value || '').trim() 
            };
            if (isDynamic) {
              btnObj.example = [(b.urlExample || '').trim() || (b.value || '').replace('{{1}}', 'example')];
            }
            return btnObj;
          }
          if (b.type === 'Call phone number') {
            const fullPhone = formatPhoneNumberForMeta(b.countryCode || '+91', b.value);
            return { type: 'PHONE_NUMBER', text: (b.text || 'Call us').trim().substring(0, 25), phone_number: fullPhone };
          }
          if (b.type === 'Copy offer code') {
            return { type: 'COPY_CODE', example: (b.value || 'OFFER').trim().substring(0, 15) };
          }
          // Custom or Marketing opt-out
          return { type: 'QUICK_REPLY', text: (b.text || 'Quick Reply').trim().substring(0, 25) };
        }).filter(b => {
          if (b.type === 'URL') return b.text && b.url;
          if (b.type === 'PHONE_NUMBER') return b.text && b.phone_number;
          if (b.type === 'COPY_CODE') return b.example;
          if (b.type === 'QUICK_REPLY') return b.text;
          return false;
        });
        
        if (waButtons.length > 0) {
          components.push({ type: 'BUTTONS', buttons: waButtons });
        }
      }

      // 1. Submit to WhatsApp API
      const templatePayload = {
        name: waName,
        category: formData.category.toUpperCase(),
        language: formData.language === 'English (US)' ? 'en_US' : (formData.language === 'Hindi' ? 'hi_IN' : 'en_US'),
        components: components,
        expirationDate: formData.expirationDate || '24h',
        customExpirationHours: formData.customExpirationHours || 24,
        allow_category_change: true
      };


      let createdTemplateResponse = null;
      const originalName = typeof templateData?.name === 'string' ? templateData.name : '';
      
      const submitTemplate = async (payload) => {
        if (isEditing && templateData?.id) {
          console.log(`Updating existing template: ${originalName} (ID: ${templateData.id})`);
          // Meta's API only accepts 'components' on update — sending 'category' causes "Invalid parameter"
          // Note: editing an APPROVED template will revert it to PENDING for Meta re-review
          return await updateWhatsAppTemplate(templateData.id, {
            components: payload.components
          });
        }
        
        console.log(`Creating new template: ${waName}`);
        return await createWhatsAppTemplate(payload);
      };

      try {
        createdTemplateResponse = await submitTemplate(templatePayload);
      } catch (primaryError) {
        let latestError = primaryError;

        // ── Network-level errors (ENOTFOUND, timeout, etc.) should never trigger
        //    a "retry without HEADER" — that just causes WhatsApp to accept the
        //    template without media and immediately reject it as INVALID_FORMAT.
        const isNetworkError = !primaryError?.response;
        if (isNetworkError) {
          throw primaryError; // propagate immediately
        }

        const isBodyCharacterLimitError = (error) => {
          const subcode =
            error?.response?.data?.error?.errorSubcode ??
            error?.response?.data?.error?.error_subcode;
          const details = String(
            error?.response?.data?.error?.error_user_msg ||
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            ''
          ).toLowerCase();

          return subcode === 2388040 || details.includes('1024 characters');
        };

        if (isBodyCharacterLimitError(latestError)) {
          throw latestError;
        }

        // Remove all secret fallbacks. If it fails, the user should know why.
        throw latestError;
      }

      if (['Image', 'Video', 'Document'].includes(formData.headerType)) {
        const actualCreatedName =
          createdTemplateResponse?.templateName ||
          createdTemplateResponse?.data?.name ||
          waName;

        // Use the real hosted URL (DOCUMENT_GET_URL) for the preview cache.
        // We prefer the hostedUrl (short string) over the preview (large Base64).
        const resolvedPreviewUrl =
          uploadedMediaUrl ||
          headerMedia?.hostedUrl ||
          headerMedia?.preview ||
          null;

        if (resolvedPreviewUrl) {
          saveTemplateHeaderPreview(actualCreatedName, {
            url: resolvedPreviewUrl,
            type: formData.headerType
          });
          
          // Also save to window to ensure immediate availability in navigation
          if (window.runtimeHeaderPreviewCache) {
            window.runtimeHeaderPreviewCache[actualCreatedName] = {
              url: resolvedPreviewUrl,
              type: formData.headerType
            };
          }
        }
      }
      
      // Template saved/updated successfully
      const successMessage = isEditing
        ? 'Template updated successfully! Meta may take a moment to reflect the changes.'
        : 'Template submitted to WhatsApp! Awaiting Meta\'s review.';

      // Fire toast immediately (ToastContainer in App.jsx persists across routes)
      toast.success(successMessage, { toastId: 'template-saved-success', autoClose: 5000 });

      // Also store in localStorage so Templates.jsx can show the in-page banner
      try {
        localStorage.setItem('templateSuccessToast', JSON.stringify({
          message: successMessage,
          isEditing: Boolean(isEditing),
          templateName: originalName || waName,
          ts: Date.now()
        }));
      } catch (_) {}

      // Small delay so the toast registers in the global ToastContainer before navigation unmounts this page
      setTimeout(() => {
        navigate('/admin/templates/list', { replace: true });
      }, 150);

    } catch (error) {
      console.error("Template Creation Error:", error?.response?.data || error);
      if (error?.response?.data?.limitReached) {
        setUpgradeModal({
          isOpen: true,
          featureName: 'Templates',
          message: error?.response?.data?.message || `You have reached your template limit. Upgrade your plan to create more templates!`
        });
        return;
      }
      const rawWaError = error?.response?.data?.error || {};
      const nestedWaError = rawWaError?.error || rawWaError;
      const errorSubcode = nestedWaError?.error_subcode ?? nestedWaError?.errorSubcode ?? rawWaError?.error_subcode ?? rawWaError?.errorSubcode;
      const userMsg = nestedWaError?.error_user_msg || rawWaError?.error_user_msg;
      const errorDetails = nestedWaError?.error_data?.details || rawWaError?.error_data?.details;
      const blameField = nestedWaError?.error_data?.blame_field_specs?.[0]?.[0] || rawWaError?.error_data?.blame_field_specs?.[0]?.[0];
      const rawMessage = error?.response?.data?.message || nestedWaError?.message || rawWaError?.message;
      const suggestedName = nestedWaError?.suggestedName || rawWaError?.suggestedName;

      // Extract specific, human-understandable message
      let errorMessage = '';

      if (errorSubcode === 2593027 || (userMsg && userMsg.toLowerCase().includes('button example')) || blameField === 'example') {
        errorMessage = 'Coupon Code is invalid: WhatsApp does not allow special characters like "%" in coupon codes. Please use letters and numbers only (e.g. 20OFF or FLAT50).';
      } else if (userMsg && userMsg !== 'Invalid parameter') {
        errorMessage = userMsg + (blameField ? ` (Field: ${blameField})` : '');
      } else if (errorDetails && errorDetails !== 'Invalid parameter') {
        errorMessage = errorDetails;
      } else if (rawMessage && !rawMessage.toLowerCase().includes('invalid parameter')) {
        errorMessage = rawMessage;
      } else if (blameField) {
        errorMessage = `Invalid parameter in "${blameField}". Please check that this field meets Meta guidelines.`;
      } else {
        errorMessage = 'Invalid parameter: Please verify that all button values, variables, and links follow WhatsApp rules.';
      }
      
      // Handle specific user-facing errors
      if (!error?.response && (error?.code === 'ENOTFOUND' || error?.message?.includes('ENOTFOUND') || error?.message?.includes('getaddrinfo'))) {
        // Network error — server can't reach graph.facebook.com
        errorMessage = 'Cannot reach WhatsApp servers. Please check that the server has a working internet connection and try again.';
        toast.error(errorMessage);
      } else if (errorSubcode === 2388023) {
        errorMessage = `WhatsApp is currently deleting this template language variant. During this 30-day lock period, you cannot add English (US) back to the same name. Please use a new name now.`;
        toast.error(errorMessage);
        setNameError(errorMessage);
        if (suggestedName) setTemplateNameSuggestion(suggestedName);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (errorSubcode === 2388040) {
        errorMessage = 'Character limit exceeded: The template BODY content cannot be more than 1024 characters. Please shorten your message and try again.';
        toast.error(errorMessage);
      } else if (errorSubcode === 2388025) {
        errorMessage = `WhatsApp is blocking this change because the template is in deletion flow. Use a new template name or retry after the deletion window completes.`;
        toast.error(errorMessage);
        setNameError(errorMessage);
        if (suggestedName) setTemplateNameSuggestion(suggestedName);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (errorSubcode === 2388024) {
        errorMessage = `Template content already exists in this language for the same name. Please change template name and retry.`;
        toast.error(errorMessage);
        setNameError(errorMessage);
        if (suggestedName) setTemplateNameSuggestion(suggestedName);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (errorSubcode === 2388124) {
        errorMessage = "WhatsApp limitation: You can only edit an active template once every 24 hours. Please wait or try creating a new template with a different name.";
        toast.error(errorMessage);
      } else if (errorSubcode === 2388047) {
        // Message body format error - show ONLY if it contains emoji or newline validation issues
        const errorDetails = nestedWaError?.error_user_msg || waError?.error_user_msg || errorMsg || '';
        if (errorDetails.toLowerCase().includes('emoji') || 
            errorDetails.toLowerCase().includes('newline') || 
            errorDetails.toLowerCase().includes('consecutive')) {
          toast.error(errorDetails);
        } else {
          // If it's another formatting error, still show it!
          toast.error(errorDetails || errorMessage || "Template format is invalid.");
        }
      } else {
        toast.error(errorMessage);
      }
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (!formData.name.trim()) {
      toast.error("Template name is mandatory");
      return;
    }
    if (templateType === 'MPM') {
      setFormData(prev => ({
        ...prev,
        headerType: (!prev.headerType || prev.headerType === 'None') ? 'Text' : prev.headerType,
        headerText: prev.headerText || 'Featured Products',
        bodyText: prev.bodyText && prev.bodyText.trim() 
          ? prev.bodyText 
          : 'Explore our latest collection of handpicked items. Tap below to browse products, view details, and place your order directly on WhatsApp!'
      }));
    } else if (templateType === 'LIMITED_TIME_OFFER') {
      setFormData(prev => ({
        ...prev,
        limitedTimeOfferText: prev.limitedTimeOfferText || 'Expiring offer!',
        offerCode: prev.offerCode || '',
        ltoUrlText: prev.ltoUrlText || 'Shop Now',
        ltoUrl: prev.ltoUrl || '',
        bodyText: prev.bodyText && prev.bodyText.trim() 
          ? prev.bodyText 
          : 'Special Offer! Enjoy an exclusive discount on your next order. Tap below to copy your discount code and start shopping before time runs out!'
      }));
    }
    setView('content');
  };

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);


  // ================= CHOOSE SCREEN =================
  if (view === 'choose') {
    return (
      <div className="min-h-screen w-full bg-[#F9FAFB] p-4 md:p-6 lg:p-12 flex flex-col items-center font-sans overflow-x-hidden relative">
        {/* UPGRADE PLAN MODAL */}
        {upgradeModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl scale-in-center border border-slate-100 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-5 text-emerald-600 shadow-sm">
                <Lock className="w-8 h-8" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold mb-3">
                <span>Current: {currentPlanCapitalized} Plan</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Upgrade Required</h3>
              <p className="text-slate-500 text-xs sm:text-sm mb-6 leading-relaxed">
                {upgradeModal.message || `Upgrade your plan to unlock this feature and create more templates.`}
              </p>
              <div className="bg-slate-50 rounded-xl p-3.5 text-left border border-slate-100 mb-6 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-700">
                  <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Template limits by plan:</span>
                </div>
                <p className="text-slate-500 leading-relaxed pl-6 space-y-0.5">
                  • <strong>Free Trial:</strong> 3 templates<br/>
                  • <strong>Basic:</strong> 15 templates & Template Gallery<br/>
                  • <strong>Growth:</strong> 50 templates & Analytics<br/>
                  • <strong>Professional:</strong> Unlimited templates
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setUpgradeModal({ isOpen: false, featureName: 'Templates', message: '' })}
                  className="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setUpgradeModal({ isOpen: false, featureName: 'Templates', message: '' });
                    navigate('/admin/plan/upgrade');
                  }}
                  className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Upgrade Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center w-full max-w-2xl mt-4 md:mt-3 mb-4 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3 tracking-tight">Choose Template Method</h2>
          <p className="text-gray-500 text-sm md:text-base font-medium">Select how you want to create your WhatsApp template</p>
        </div>

        {/* Plan Limit Warning Banner */}
        {isLimitReached && (
          <div className="w-full max-w-4xl mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-amber-900 shadow-sm animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800">
                  Template Limit Reached ({existingTemplateCount}/{templateLimit})
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Your {currentPlanCapitalized} plan allows up to {templateLimit} templates. Upgrade your plan to create more.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/plan/upgrade')}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition shrink-0 cursor-pointer flex items-center gap-1.5 ml-3"
            >
              <span>Upgrade Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full max-w-4xl px-2">
          {/* CREATE NEW */}
          <div
            onClick={() => {
              if (isLimitReached) {
                setUpgradeModal({
                  isOpen: true,
                  featureName: 'Templates',
                  message: `You have reached your limit of ${templateLimit} templates on the ${currentPlanCapitalized} plan. Upgrade to create more templates!`
                });
                return;
              }
              setView('setup');
            }}
            className={`flex-1 bg-white p-6 md:p-10 rounded-xl border shadow-sm cursor-pointer group transition-all duration-300 hover:shadow-md relative ${
              isLimitReached ? 'border-amber-200 hover:border-amber-400' : 'border-gray-200 hover:border-[#10B981]'
            }`}
          >
            {isLimitReached && (
              <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-bold">
                <Lock size={12}/> Limit Reached
              </div>
            )}
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center mb-6 transition-all duration-300 ${
              isLimitReached 
                ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white' 
                : 'bg-green-50 text-green-600 group-hover:bg-[#10B981] group-hover:text-white'
            }`}>
              {isLimitReached ? <Lock size={24}/> : <Plus size={24}/>}
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-800">Create New Template</h3>
            <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
              Build custom templates with full control over design and variables.
            </p>
            <div className={`flex items-center font-semibold gap-2 text-sm ${
              isLimitReached ? 'text-amber-600' : 'text-[#10B981]'
            }`}>
              {isLimitReached ? 'Upgrade Required' : 'Start Building'} <ChevronRight size={18}/>
            </div>
          </div>

          {/* GALLERY */}
          <div
            onClick={() => navigate('/admin/templates/gallery')}
            className="flex-1 bg-white p-6 md:p-10 rounded-xl border border-gray-200 hover:border-blue-500 shadow-sm cursor-pointer group transition-all duration-300 hover:shadow-md relative"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center mb-6 transition-all duration-300 bg-blue-50 text-blue-600 group-hover:bg-blue-500 group-hover:text-white">
              <Globe size={24}/>
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-800">Template Gallery</h3>
            <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
              Browse pre-approved templates ready for quick deployment.
            </p>
            <div className="flex items-center font-semibold gap-2 text-sm text-blue-500">
              Browse Library <ChevronRight size={18}/>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= SETUP / CONTENT UI (UNCHANGED) =================
  return (
    <div className="flex flex-col lg:flex-row h-screen max-h-screen w-full bg-white overflow-hidden font-sans animate-in fade-in duration-500 relative">
      {/* UPGRADE PLAN MODAL */}
      {upgradeModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl scale-in-center border border-slate-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-5 text-emerald-600 shadow-sm">
              <Lock className="w-8 h-8" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold mb-3">
              <span>Current: {currentPlanCapitalized} Plan</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Upgrade Required</h3>
            <p className="text-slate-500 text-xs sm:text-sm mb-6 leading-relaxed">
              {upgradeModal.message || `Upgrade your plan to unlock this feature and create more templates.`}
            </p>
            <div className="bg-slate-50 rounded-xl p-3.5 text-left border border-slate-100 mb-6 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-700">
                <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Template limits by plan:</span>
              </div>
              <p className="text-slate-500 leading-relaxed pl-6 space-y-0.5">
                • <strong>Free Trial:</strong> 3 templates<br/>
                • <strong>Basic:</strong> 15 templates & Template Gallery<br/>
                • <strong>Growth:</strong> 50 templates & Analytics<br/>
                • <strong>Professional:</strong> Unlimited templates
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setUpgradeModal({ isOpen: false, featureName: 'Templates', message: '' })}
                className="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setUpgradeModal({ isOpen: false, featureName: 'Templates', message: '' });
                  navigate('/admin/plan/upgrade');
                }}
                className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Upgrade Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Form Container */}
      <div className="flex-1 h-full overflow-y-auto p-4 md:p-6 lg:p-10 border-r border-slate-100 bg-[#F8FAFC]">
        <div className="max-w-3xl mx-auto space-y-5 pb-20">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => view === 'setup' ? (isEditing || isDuplicate ? navigate('/admin/templates/list') : setView('choose')) : setView('setup')}
              className="flex items-center gap-2 text-gray-500 font-semibold hover:text-gray-800 text-sm transition-colors"
            >
                <ArrowLeft size={16}/> {view === 'setup' && (isEditing || isDuplicate) ? 'Back to Templates' : 'Back'}
            </button>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {view === 'setup' ? (isEditing ? 'Step 1 of 2: Edit Setup' : 'Step 1 of 2: Setup') : (isEditing ? 'Step 2 of 2: Edit Content' : 'Step 2 of 2: Content')}
            </div>
          </div>

          {view === 'setup' ? (
            <div className="space-y-5">
                <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-200 shadow-sm space-y-4 md:space-y-5">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
                      {isEditing ? 'Edit Your Template' : 'Set Up Your Template'}
                    </h2>
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Choose Category</label>
                        <div className="bg-gray-50/50 p-1.5 rounded-xl flex flex-wrap gap-1 border border-gray-100 max-w-fit">
                            {['Marketing', 'Utility', 'Authentication'].map(cat => (
                                <button 
                                  key={cat} 
                                  onClick={() => handleCategoryChange(cat)} 
                                  className={`min-w-[120px] py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all ${formData.category === cat ? 'bg-white shadow-sm text-gray-900 border border-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {cat === 'Marketing' && <Zap size={14} className={formData.category === 'Marketing' ? 'text-gray-900' : 'text-gray-500'}/>} {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        {formData.category === 'Authentication' ? (
                            <div className="p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 border-[#10B981] bg-[#F0FDF4]/30">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 w-4 h-4 shrink-0 rounded-full bg-[#10B981] flex items-center justify-center border-2 border-[#10B981]">
                                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    </div>
                                    <div className="flex-1">
                                      <span className="text-[13px] font-bold text-gray-800 block mb-1 tracking-wide uppercase">
                                        One-time Passcode
                                      </span>
                                      <p className="text-[13px] text-gray-500 leading-relaxed">
                                        Send codes to verify a transaction or login.
                                      </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            (formData.category === 'Marketing' ? ['CUSTOM', 'CATALOG', 'MPM', 'LIMITED_TIME_OFFER'] : ['CUSTOM']).map((type) => (
                              <div 
                                key={type} 
                                onClick={() => {
                                  setTemplateType(type);
                                  if (type === 'CATALOG') {
                                    // Meta does NOT allow any custom header on CATALOG templates
                                    setFormData(prev => ({ ...prev, headerType: 'None' }));
                                    setHeaderMedia(null);
                                    setUploadedMediaUrl(null);
                                    setUploadedMetaHandle(null);
                                    if (headerFileRef.current) headerFileRef.current.value = '';
                                  }
                                  if (type === 'MPM') {
                                    // Meta requires a header for MPM
                                    if (!formData.headerType || formData.headerType === 'None') {
                                      setFormData(prev => ({ ...prev, headerType: 'Text', headerText: prev.headerText || 'Featured Products' }));
                                    }
                                  }
                                  if (type === 'LIMITED_TIME_OFFER') {
                                    if (formData.headerType === 'Document') {
                                      setFormData(prev => ({ ...prev, headerType: 'None' }));
                                    }
                                  }
                                  setSubmitError(null);
                                  setHeaderError(false);
                                }} 
                                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${templateType === type ? 'border-2 border-[#10B981] bg-[#F0FDF4]/30 shadow-xs' : 'border border-gray-200 bg-white hover:border-gray-300'}`}
                              >
                                <div className="flex items-start gap-4">
                                    {templateType === type ? (
                                      <div className="mt-1 w-4 h-4 shrink-0 rounded-full bg-[#10B981] flex items-center justify-center border-2 border-[#10B981]">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                      </div>
                                    ) : (
                                      <div className="mt-1 w-4 h-4 shrink-0 rounded-full border-2 border-gray-300" />
                                    )}
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="text-[13px] font-bold text-gray-800 tracking-wide">
                                          {type === 'CUSTOM' ? 'CUSTOM' : type === 'CATALOG' ? 'CATALOG' : type === 'MPM' ? 'MULTI-PRODUCT MESSAGE' : 'LIMITED TIME OFFER'}
                                        </span>
                                        {type === 'MPM' && (
                                          <span className="text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full">
                                            Meta Commerce
                                          </span>
                                        )}
                                        {type === 'LIMITED_TIME_OFFER' && (
                                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            ⏱️ Countdown Timer
                                          </span>
                                        )}
                                        {type === 'CATALOG' && (
                                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                                            Full Catalog
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[13px] text-gray-500 leading-relaxed">
                                          {type === 'CUSTOM' ? (formData.category === 'Utility' ? 'Send messages about an existing order or account.' : 'Send promotional offers & announcements with custom buttons.') 
                                          : type === 'CATALOG' ? 'Display your entire product catalog in chat. Meta automatically uses your catalog thumbnail.'
                                          : type === 'MPM' ? 'Showcase up to 30 specific products from your Meta Commerce Catalog with a native "View items" button.'
                                          : 'Send an offer with a native countdown timer, coupon code, and website CTA to drive urgency.'}
                                      </p>
                                      {type === 'MPM' && (
                                        <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px] text-teal-700 font-medium">
                                          <span className="bg-teal-50 px-2 py-0.5 rounded border border-teal-100">✓ Up to 30 Products</span>
                                          <span className="bg-teal-50 px-2 py-0.5 rounded border border-teal-100">✓ Mandatory Header</span>
                                          <span className="bg-teal-50 px-2 py-0.5 rounded border border-teal-100">✓ Locked "View items" Button</span>
                                        </div>
                                      )}
                                      {type === 'LIMITED_TIME_OFFER' && (
                                        <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px] text-amber-800 font-medium">
                                          <span className="bg-amber-50 px-2 py-0.5 rounded border border-amber-100">✓ Native Expiration Countdown</span>
                                          <span className="bg-amber-50 px-2 py-0.5 rounded border border-amber-100">✓ Native Copy Code</span>
                                          <span className="bg-amber-50 px-2 py-0.5 rounded border border-amber-100">✓ Website CTA</span>
                                          <span className="bg-amber-50 px-2 py-0.5 rounded border border-amber-100">✓ No Footer (Meta Rule)</span>
                                        </div>
                                      )}
                                    </div>
                                </div>
                              </div>
                            ))
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Template Name</label>
                            <input 
                              type="text" 
                              placeholder="Enter template name..." 
                              disabled={isEditing}
                              value={typeof formData.name === 'string' ? formData.name : (formData.name?.name || '')}
                              className={`w-full p-4 border border-gray-200 rounded-lg outline-none text-sm font-medium focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all ${isEditing ? 'bg-gray-100 cursor-not-allowed opacity-75' : 'bg-white'}`} 
                              onChange={(e) => setFormData({...formData, name: e.target.value})} 
                            />
                            {formData.name && (
                              <div className="text-xs text-gray-500 mt-1">
                                <span className="text-gray-600 font-medium">WhatsApp name:</span>{' '}
                                <code className="bg-gray-50 px-2 py-1 rounded">
                                  {String(formData.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || '(empty)'}
                                </code>
                              </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Languages</label>
                            <select 
                              disabled={isEditing}
                              className={`w-full p-4 border border-gray-200 rounded-lg outline-none text-sm font-medium appearance-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all ${isEditing ? 'bg-gray-100 cursor-not-allowed opacity-75' : 'bg-white'}`} 
                              value={formData.language} 
                              onChange={(e) => setFormData({...formData, language: e.target.value})}
                            >
                                <option>English (US)</option>
                                <option>Hindi</option>
                            </select>
                        </div>
                    </div>

                    {/* MOVED TO STEP 2 */}
                </div>
                <div className="flex justify-end pt-2">
                    <button onClick={handleContinue} className="w-full md:w-auto bg-[#10B981] text-white px-10 md:px-14 py-3 md:py-4 rounded-lg font-semibold text-sm shadow-sm hover:bg-[#059669] transition-all">Continue</button>
                </div>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-green-50 text-green-600 rounded-lg flex items-center justify-center"><Clock size={14}/></div>
                        <h3 className="text-sm md:text-base font-semibold text-gray-800">Template name and language</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Name your template</label>
                            <input 
                              type="text" 
                              disabled={isEditing}
                              value={typeof formData.name === 'string' ? formData.name : (formData.name?.name || '')}
                              onChange={(e) => {
                                setFormData({...formData, name: e.target.value});
                                if (nameError) {
                                  setNameError(null);
                                  setTemplateNameSuggestion(null);
                                }
                              }} 
                              className={`w-full p-4 border rounded-lg text-sm font-medium outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all ${isEditing ? 'bg-gray-100 cursor-not-allowed opacity-75 border-gray-200' : nameError ? 'bg-red-50 border-red-400 focus:border-red-500' : 'bg-white border-gray-200 focus:border-[#10B981]'}`} 
                            />
                            {nameError && (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 animate-in fade-in">
                                <Info size={16} className="mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                  <p className="font-medium mb-1">{nameError}</p>
                                  {templateNameSuggestion && (
                                    <div className="mt-2 flex items-center flex-wrap gap-2 text-xs">
                                      <span className="text-gray-600">Suggested name:</span>
                                      <code className="bg-white px-2 py-1 rounded border border-red-200 font-semibold">{templateNameSuggestion}</code>
                                      <button 
                                        onClick={() => {
                                          setFormData({...formData, name: templateNameSuggestion});
                                          setNameError(null);
                                          setTemplateNameSuggestion(null);
                                        }}
                                        className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded transition-colors font-medium ml-2"
                                      >
                                        Use this name
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Select language</label>
                            <select 
                              disabled={isEditing}
                              className={`w-full p-4 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all ${isEditing ? 'bg-gray-100 cursor-not-allowed opacity-75' : 'bg-white'}`} 
                              value={formData.language} 
                              onChange={(e) => setFormData({...formData, language: e.target.value})}
                            >
                                <option>English (US)</option>
                                <option>Hindi</option>
                            </select>
                        </div>
                    </div>
                </div>
                {formData.category === 'Authentication' && (
                  <div className="bg-white rounded-xl border border-[#10B981] p-6 md:p-8 shadow-sm mt-5 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-green-50 text-[#10B981] rounded-lg flex items-center justify-center border border-[#10B981]/20"><Clock size={16}/></div>
                        <div>
                          <h3 className="text-base font-bold text-gray-800">Authentication Setup</h3>
                          <p className="text-xs text-gray-500">Configure your One-Time Passcode (OTP) settings</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Code Expiration (Minutes)</label>
                          <input 
                            type="number" 
                            min="1"
                            max="90"
                            value={authExpirationMinutes}
                            onChange={(e) => setAuthExpirationMinutes(e.target.value)}
                            className="w-full p-4 border border-gray-200 rounded-lg outline-none text-sm font-medium focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all bg-white" 
                          />
                          <p className="text-[10px] text-gray-400">Meta allows an expiration time between 1 and 90 minutes.</p>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm font-bold text-gray-800">Security Recommendation</p>
                          <p className="text-xs text-gray-500">Adds &quot;For your security, do not share this code.&quot; to the message.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={authSecurityRecommendation} onChange={() => setAuthSecurityRecommendation(!authSecurityRecommendation)} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                        </label>
                      </div>

                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-sm font-bold text-gray-800 mb-1">Copy Code Button</p>
                        <p className="text-xs text-gray-500">
                          A &quot;Copy Code&quot; button will be automatically attached to your message. Meta will render this natively in WhatsApp.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {formData.category !== 'Authentication' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm mt-5">
                    {formData.category === 'Utility' && (
                      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3 text-yellow-800">
                        <Info size={20} className="shrink-0 mt-0.5 text-yellow-600" />
                        <div className="text-sm">
                          <p className="font-bold mb-1 text-yellow-700">Strictly No Promotional Content</p>
                          <p>
                            Meta strictly prohibits promotional content (offers, discounts, upselling) in Utility templates. Ensure your message is purely transactional (e.g., order updates, account alerts) or it will be rejected.
                          </p>
                        </div>
                      </div>
                    )}
                    <div ref={headerRef} className={`mb-8 border-b pb-6 transition-all duration-300 ${headerError ? 'p-5 bg-red-50/70 border-2 border-red-400 rounded-xl shadow-sm' : 'border-gray-100'}`}>
                        <div className="flex flex-col gap-1 mb-3">
                            <h3 className="text-sm md:text-base font-bold text-gray-800 flex items-center gap-2">
                                Header
                                {templateType === 'CATALOG' ? (
                                  <span className="text-emerald-800 bg-emerald-100 border border-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full tracking-wide">
                                    AUTO — PRODUCT THUMBNAIL
                                  </span>
                                ) : templateType === 'MPM' ? (
                                  <span className="text-amber-800 bg-amber-100/90 border border-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full tracking-wide">
                                    REQUIRED FOR MPM
                                  </span>
                                ) : (
                                  <span className="text-gray-400 font-normal text-sm ml-1">(Optional)</span>
                                )}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {templateType === 'CATALOG'
                                ? 'Meta automatically uses your connected product catalog thumbnail as the header — no upload needed.'
                                : templateType === 'MPM'
                                ? 'Meta WhatsApp strictly requires a Header (Text or Media) for Multi-Product Messages.'
                                : "Add a title or choose which type of media you'll use for this header."}
                            </p>
                        </div>

                        {/* CATALOG: Meta forbids any custom header — show info block only */}
                        {templateType === 'CATALOG' ? (
                          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-base">🛍️</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-sm text-emerald-900">Header is Managed by Meta</p>
                              <p className="text-[12px] text-emerald-700 mt-0.5 leading-relaxed">
                                WhatsApp Catalog templates do <strong>not</strong> support custom headers (Image, Video, Text, or Document). Meta automatically displays your connected product catalog thumbnail. You cannot upload or set a header for this template type.
                              </p>
                              <p className="text-[11px] text-emerald-600 mt-2 font-medium">
                                ✅ Make sure your WhatsApp Business Account has a Meta Catalog connected in Commerce Manager.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            {templateType === 'MPM' && (!formData.headerType || formData.headerType === 'None') && (
                              <div className="mb-3 p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs flex items-start gap-2.5">
                                <Info size={16} className="shrink-0 text-amber-600 mt-0.5" />
                                <div>
                                  <p className="font-bold">Header Required for Multi-Product Messages</p>
                                  <p className="text-[11px] text-amber-700 mt-0.5">
                                    WhatsApp requires a Header (Text, Image, Video, or Document) for Multi-Product templates. Please change &quot;None&quot; to &quot;Text&quot; or another media type below.
                                  </p>
                                </div>
                              </div>
                            )}

                            {headerError && (
                              <div className="mb-3 p-3 bg-red-100 border border-red-300 rounded-lg text-red-800 text-xs flex items-center gap-2">
                                <AlertCircle size={16} className="shrink-0 text-red-600" />
                                <span className="font-semibold">Please select a Text or Media header before submitting.</span>
                              </div>
                            )}

                            <select
                                className={`w-full p-4 border rounded-lg text-sm font-medium outline-none bg-white transition-all ${headerError ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-200 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]'}`}
                                value={formData.headerType}
                                onChange={(e) => {
                                  setFormData({...formData, headerType: e.target.value});
                                  setHeaderMedia(null);
                                  setUploadedMediaUrl(null);
                                  setHeaderError(false);
                                  setSubmitError(null);
                                  if (headerFileRef.current) {
                                    headerFileRef.current.value = '';
                                  }
                                }}
                            >
                                {templateType !== 'MPM' && <option value="None">None</option>}
                                <option value="Text">{templateType === 'MPM' ? 'Text (Mandatory for MPM)' : 'Text'}</option>
                                {templateType !== 'MPM' && <option value="Image">{templateType === 'LIMITED_TIME_OFFER' ? 'Image (Recommended for LTO)' : 'Image'}</option>}
                                {templateType !== 'MPM' && <option value="Video">Video</option>}
                                {templateType !== 'LIMITED_TIME_OFFER' && templateType !== 'MPM' && <option value="Document">Document</option>}
                            </select>
                            {templateType === 'MPM' && (
                              <p className="text-[11px] text-teal-700 mt-2 font-medium">
                                ℹ️ Meta strictly mandates a <strong>Text-only</strong> header for Multi-Product Message templates to serve as the collection headline.
                              </p>
                            )}
                            {templateType === 'LIMITED_TIME_OFFER' && (
                              <p className="text-[11px] text-amber-800 mt-2 font-medium">
                                ℹ️ WhatsApp supports <strong>Text</strong>, <strong>Image</strong>, or <strong>Video</strong> headers (or <strong>None</strong>) for Limited-Time Offers.
                              </p>
                            )}
                          </>
                        )}

                        {formData.headerType === 'Text' && (
                          <div className="mt-4 space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Header Text</label>
                            <input 
                              type="text" 
                              placeholder="Enter header title..." 
                              value={formData.headerText}
                              onChange={(e) => handleHeaderTextChange(e.target.value)}
                              className="w-full p-4 border border-gray-200 rounded-lg outline-none text-sm font-medium focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all" 
                            />
                            <p className="text-[10px] text-gray-400">Max 60 characters. You can use variables like {"{{1}}"} here.</p>
                            
                            {headerVariables.length > 0 && (
                              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                                <h4 className="text-xs font-bold text-gray-700">Header Samples</h4>
                                {headerVariables.map((variableId) => (
                                  <div key={variableId} className="flex items-center gap-3">
                                    <label className="w-12 text-xs font-semibold text-gray-600 shrink-0">{`{{${variableId}}}`}</label>
                                    <input
                                      type="text"
                                      value={headerSamples[variableId] || ''}
                                      onChange={(e) => handleHeaderSampleChange(variableId, e.target.value)}
                                      placeholder={`Sample for {{${variableId}}}`}
                                      className="flex-1 p-2 border border-gray-300 rounded text-sm outline-none focus:border-[#10B981]"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {formData.headerType !== 'None' && formData.headerType !== 'Text' && (
                          <div className="mt-6 space-y-4">
                            <input 
                              ref={headerFileRef}
                              type="file" 
                              hidden 
                              accept={formData.headerType === 'Image' ? 'image/jpeg, image/png' : formData.headerType === 'Video' ? 'video/mp4' : '*'}
                              onChange={handleHeaderMediaUpload}
                            />
                            {!headerMedia ? (
                              <div className="flex gap-4">
                                <div 
                                  onClick={triggerHeaderMediaPicker}
                                  className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-[#10B981] hover:bg-green-50/30 transition-all duration-300"
                                >
                                  <div className="flex flex-col items-center gap-2">
                                    <ImageIcon size={32} className="text-gray-400"/>
                                    <p className="text-sm font-semibold text-gray-700">Upload {formData.headerType}</p>
                                    <p className="text-xs text-gray-500">Max 16MB • {formData.headerType === 'Image' ? 'JPG, PNG' : formData.headerType === 'Video' ? 'MP4' : 'Any Document (PDF, DOCX, CSV)'}</p>
                                  </div>
                                </div>
                                <div 
                                  onClick={() => setIsMediaModalOpen(true)}
                                  className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-[#10B981] hover:bg-green-50/30 transition-all duration-300"
                                >
                                  <div className="flex flex-col items-center gap-2">
                                    <Globe size={32} className="text-gray-400"/>
                                    <p className="text-sm font-semibold text-gray-700">Choose from Media</p>
                                    <p className="text-xs text-gray-500">Select existing assets</p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {String(headerMedia.type || '').toLowerCase() === 'image' && (
                                      <img 
                                        src={resolveMediaUrlForDev(headerMedia.preview || headerMedia.hostedUrl || headerMedia.url)} 
                                        alt="preview" 
                                        className="h-16 w-16 rounded-lg object-contain bg-white border border-gray-200 p-1 shrink-0"
                                      />
                                    )}
                                    {String(headerMedia.type || '').toLowerCase() === 'video' && (
                                      <video 
                                        src={resolveMediaUrlForDev(headerMedia.preview || headerMedia.hostedUrl || headerMedia.url)} 
                                        className="h-16 w-16 rounded-lg object-contain bg-black shrink-0"
                                      />
                                    )}
                                    {String(headerMedia.type || '').toLowerCase() === 'document' && (
                                      <div className="h-16 w-16 rounded-lg bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs shrink-0 border border-red-100">
                                        {String(headerMedia.name || 'DOCUMENT').split('.').pop().toUpperCase()}
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-gray-800 truncate">{headerMedia.name}</p>
                                      
                                      <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500 mt-0.5">
                                        {headerMedia.file && (
                                          <span>{((headerMedia.newSize || headerMedia.file.size) / 1024 / 1024).toFixed(2)} MB</span>
                                        )}
                                        {headerMedia.width && headerMedia.height && (
                                          <>
                                            <span>•</span>
                                            <span className="font-mono text-[11px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                                              {headerMedia.width} × {headerMedia.height} px
                                            </span>
                                          </>
                                        )}
                                        {headerMedia.aspectRatio && (
                                          <>
                                            <span>•</span>
                                            <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                                              {headerMedia.aspectRatio} (No crop)
                                            </span>
                                          </>
                                        )}
                                      </div>

                                      {headerMedia.optimized && (
                                        <p className="text-[11px] text-emerald-700 font-medium mt-1">
                                          ✓ Auto-scaled proportionally without cropping (Original: {(headerMedia.originalSize / 1024 / 1024).toFixed(2)} MB)
                                        </p>
                                      )}

                                      {isUploadingMedia ? (
                                        <div className="flex items-center gap-2 mt-2 w-48">
                                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div 
                                              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                              style={{ width: `${Math.max(10, uploadProgress)}%` }}
                                            />
                                          </div>
                                          <span className="text-xs text-[#10B981] font-bold w-9 text-right">{uploadProgress}%</span>
                                        </div>
                                      ) : (uploadedMediaUrl || headerMedia.hostedUrl) ? (
                                        <div className="mt-1">
                                          <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded px-2 py-0.5 font-medium">
                                            ✓ Ready for Template
                                          </span>
                                          <p className="text-xs text-gray-400 truncate mt-0.5 max-w-xs">
                                            {uploadedMetaHandle ? "Media securely linked with Meta" : "Media processed successfully"}
                                          </p>
                                        </div>
                                      ) : null}
                                    </div>
                                  </div>
                                  <button 
                                    type="button"
                                    onClick={() => removeHeaderMedia()}
                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors shrink-0 cursor-pointer"
                                    title="Remove media"
                                  >
                                    <Trash2 size={18}/>
                                  </button>
                                </div>
                                <button 
                                  type="button"
                                  onClick={triggerHeaderMediaPicker}
                                  className="w-full p-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  Change {formData.headerType}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-1 mb-3">
                        <h3 className="text-sm md:text-base font-bold text-gray-800">Body</h3>
                        <p className="text-xs text-gray-500">Enter the text for your message in the language that you&apos;ve selected.</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/5 transition-all">
                        <div className="flex justify-end p-2 pb-0">
                            <span className="text-[10px] font-medium text-gray-400">{charCount}/1024</span>
                        </div>
                        <div
                            ref={editorRef}
                            contentEditable
                            suppressContentEditableWarning
                            onInput={syncEditorContent}
                            data-placeholder="Enter the text for your message here... Use {{1}}, {{2}} etc. for dynamic variables."
                            className="w-full p-3 md:p-4 outline-none text-sm font-medium text-gray-700 leading-relaxed bg-white min-h-[120px] empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none"
                            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                        />
                    </div>
                    {/* Real-time body validation warnings */}
                    {bodyWarnings.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {bodyWarnings.map((w, i) => (
                          <div key={i} className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                            <span className="text-amber-500 text-sm mt-0.5 shrink-0">⚠️</span>
                            <p className="text-[12px] font-medium text-amber-800 leading-snug">{w}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center justify-between mt-2 gap-3 relative">
                        <span className="text-xs font-semibold text-gray-500">Characters:- {charCount}/1024</span>
                        <div className="flex items-center gap-4 text-gray-500">
                            <div className="flex items-center gap-3 pr-4 border-r border-gray-200">
                                {/* EMOJI */}
                                <div className="relative" ref={emojiPickerRef}>
                                    <button type="button" onClick={() => setShowEmojiPicker(p => !p)} title="Emoji">
                                        <Smile size={18} className="hover:text-yellow-500 transition-colors"/>
                                    </button>
                                    {showEmojiPicker && (
                                        <div className="absolute bottom-10 left-0 z-50 shadow-2xl rounded-2xl overflow-hidden border border-gray-200 bg-white">
                                            <EmojiPicker 
                                              onEmojiClick={onEmojiClick} 
                                              autoFocusSearch={false}
                                              searchPlaceHolder="Search emojis..."
                                              width={320}
                                              height={380}
                                              previewConfig={{ showPreview: false }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <button type="button" onClick={() => applyFormat('bold')} title="Bold"><Bold size={18}/></button>
                                <button type="button" onClick={() => applyFormat('italic')} title="Italic"><Italic size={18}/></button>
                                <button type="button" onClick={() => applyFormat('strikeThrough')} title="Strikethrough"><Strikethrough size={18}/></button>
                                {/* Monospace: wrap selection in <code> tags using insertHTML */}
                                <button
                                  type="button"
                                  title="Monospace (code)"
                                  onClick={() => {
                                    const sel = window.getSelection();
                                    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
                                      const range = sel.getRangeAt(0);
                                      const selectedText = range.toString();
                                      document.execCommand('insertHTML', false, `<code style="font-family:monospace;background:#f1f5f9;padding:1px 4px;border-radius:3px">${selectedText}</code>`);
                                    } else {
                                      document.execCommand('insertHTML', false, `<code style="font-family:monospace;background:#f1f5f9;padding:1px 4px;border-radius:3px">code</code>`);
                                    }
                                    syncEditorContent();
                                  }}
                                >
                                  <Link2 size={18} className="hover:text-purple-500 transition-colors"/>
                                </button>
                            </div>
                            <button type="button" onClick={insertVariable} className="text-sm font-bold text-gray-700 flex items-center gap-1.5 hover:text-blue-600 transition-all">
                                <Plus size={16}/> Add Variable
                            </button>
                        </div>
                    </div>

                    {/* FOOTER SECTION */}
                    {templateType === 'LIMITED_TIME_OFFER' ? (
                      <div className="mt-8 border-t border-gray-50 pt-6">
                        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                          <div className="flex items-start gap-2.5">
                            <span className="text-amber-600 text-sm mt-0.5">ℹ️</span>
                            <div>
                              <h4 className="text-xs font-semibold text-amber-900">Footer not permitted for Limited-Time Offers</h4>
                              <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                                WhatsApp rules do not allow a footer component on Limited-Time Offer templates because the countdown timer and offer banner occupy the bottom section.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-8 border-t border-gray-50 pt-6">
                          <div className="flex flex-col gap-1 mb-3">
                              <h3 className="text-sm md:text-base font-bold text-gray-800">Footer <span className="text-gray-400 font-normal text-sm ml-1">(Optional)</span></h3>
                              <p className="text-xs text-gray-500">Add a short line of text to the bottom of your message.</p>
                          </div>
                          <div className="relative">
                              <input 
                                  type="text" 
                                  value={formData.footerText} 
                                  onChange={(e) => setFormData({...formData, footerText: e.target.value})} 
                                  placeholder="Enter footer text..."
                                  maxLength={60}
                                  className="w-full p-4 border border-gray-200 rounded-lg text-sm font-medium outline-none bg-white focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all" 
                              />
                              <div className="flex justify-end mt-1">
                                  <span className="text-[10px] font-medium text-gray-400">{formData.footerText?.length || 0}/60</span>
                              </div>
                          </div>
                      </div>
                    )}

                    {bodyVariables.length > 0 && (
                      <div className="mt-5 rounded-xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm">
                        <h4 className="text-sm md:text-base font-bold text-gray-800">Samples for body content</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          To help us review your content, provide examples of the variables in the body. Do not include any customer information.
                        </p>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mt-4 mb-2">Body</p>

                        <div className="space-y-3">
                          {bodyVariables.map((variableId) => (
                            <div key={variableId} className="flex items-center gap-3">
                              <label className="w-16 text-sm font-semibold text-gray-700 shrink-0">{`{{${variableId}}}`}</label>
                              <input
                                type="text"
                                value={bodySamples[variableId] || ''}
                                onChange={(e) => handleBodySampleChange(variableId, e.target.value)}
                                placeholder={`Enter content for {{${variableId}}}`}
                                className="flex-1 p-3 border border-gray-200 rounded-lg text-sm font-medium bg-white outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => removeVariable(variableId)}
                                title={`Remove {{${variableId}}} from body`}
                                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>

                        {bodyVariables.some((id) => !String(bodySamples[id] || '').trim()) && (
                          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-red-600">
                            <Info size={16} />
                            <span className="text-xs font-semibold">Add sample text</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-8 border-t border-gray-100 mt-6">
                        {templateType === 'CATALOG' ? (
                            <div className="space-y-5">
                                {/* Meta Catalog Requirements Banner */}
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-base">ℹ️</span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-bold text-sm text-blue-900">Meta Catalog Template Requirements</p>
                                    <ul className="text-[12px] text-blue-700 mt-1.5 space-y-1 leading-relaxed list-none">
                                      <li>✅ <strong>No custom header</strong> — Meta auto-uses your connected catalog product thumbnail</li>
                                      <li>✅ <strong>Body text</strong> — Required (up to 1024 chars, variables supported)</li>
                                      <li>✅ <strong>Footer</strong> — Optional (up to 60 chars)</li>
                                      <li>✅ <strong>One CATALOG button</strong> — Required, opens your WhatsApp catalog inline</li>
                                      <li>✅ <strong>Category</strong> — Must be MARKETING (auto-set)</li>
                                      <li>⚠️ <strong>Catalog must be connected</strong> to your WABA in Meta Commerce Manager</li>
                                    </ul>
                                  </div>
                                </div>

                                <div>
                                  <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1">Catalog Button <span className="text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full ml-1">Required by Meta</span></h3>
                                  <p className="text-xs text-gray-500 mb-4">This button opens your WhatsApp Business Catalog directly inside the chat. Exactly one CATALOG button is allowed per template — no other buttons can be added.</p>
                                  <div className="p-4 md:p-5 bg-white border border-[#10B981] rounded-xl shadow-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                      <div>
                                        <label className="text-[11px] font-bold text-gray-600 block mb-2 uppercase tracking-wide flex items-center gap-1.5">
                                          Button Type
                                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full normal-case">
                                            <Lock size={9} /> Fixed by Meta
                                          </span>
                                        </label>
                                        <div className="w-full p-3 border border-gray-200 rounded-lg text-sm font-semibold bg-gray-50 text-gray-500 cursor-not-allowed flex items-center gap-2">
                                          <span className="text-base">🛍️</span>
                                          <span>Open Catalog</span>
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-1">This button type is fixed by Meta and cannot be changed.</p>
                                      </div>
                                      <div>
                                        <label className="text-[11px] font-bold text-gray-600 block mb-2 uppercase tracking-wide flex items-center gap-1.5">
                                          Button Label Text
                                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.5 rounded-full normal-case">
                                            <Lock size={9} /> Locked by Meta
                                          </span>
                                        </label>
                                        <div className="w-full p-3 border border-gray-200 rounded-lg text-sm font-semibold bg-gray-50 text-gray-500 cursor-not-allowed flex items-center justify-between">
                                          <span>View catalog</span>
                                          <span className="text-[10px] font-medium text-gray-400">12/20</span>
                                        </div>
                                        <p className="text-[11px] text-red-600 mt-1 font-medium">
                                          ⚠️ Meta mandates this text must always be exactly <strong>&quot;View catalog&quot;</strong> and cannot be changed.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* No additional buttons allowed */}
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5">
                                  <Info size={16} className="shrink-0 text-amber-600 mt-0.5" />
                                  <p className="text-[12px] text-amber-800 leading-relaxed">
                                    <strong>No additional buttons allowed.</strong> Meta only permits exactly one CATALOG button on this template type. You cannot add Quick Reply, Phone, or Website URL buttons.
                                  </p>
                                </div>
                            </div>
                        ) : templateType === 'MPM' ? (
                            <div className="space-y-5">
                                {/* Meta MPM Requirements Banner */}
                                <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-start gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-teal-100 border border-teal-200 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-base">📋</span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-bold text-sm text-teal-900">Meta Multi-Product Message (MPM) Guidelines</p>
                                    <ul className="text-[12px] text-teal-700 mt-1.5 space-y-1 leading-relaxed list-none">
                                      <li>✅ <strong>Header is Mandatory</strong> — Meta strictly requires a Text-only header (configured above) to serve as your collection title.</li>
                                      <li>✅ <strong>Connected Meta Catalog</strong> — Requires an active e-commerce catalog linked to your WhatsApp Business Account in Meta Commerce Manager.</li>
                                      <li>✅ <strong>Up to 30 Products</strong> — Showcase up to 30 curated products organized into up to 10 sections.</li>
                                      <li>✅ <strong>Locked &quot;View items&quot; Button</strong> — Meta mandates exactly one native button labeled &quot;View items&quot;. No other buttons can be added.</li>
                                      <li>✅ <strong>Category: MARKETING</strong> — Meta automatically classifies all MPM templates under Marketing.</li>
                                    </ul>
                                  </div>
                                </div>

                                {/* Connected Catalog & Product Section Showcase */}
                                <div className="p-4 bg-white border border-teal-200 rounded-xl space-y-3 shadow-xs">
                                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                      <span className="text-base">🏬</span>
                                      <div>
                                        <h4 className="text-xs font-bold text-gray-800">Connected Meta Commerce Catalog</h4>
                                        <p className="text-[11px] text-gray-500">Products are pulled dynamically from your linked Facebook/Meta Commerce Manager catalog.</p>
                                      </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                      WABA Linked
                                    </span>
                                  </div>

                                  <div className="bg-teal-50/50 rounded-lg p-3 border border-teal-100/80">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-[11px] font-bold text-teal-900 uppercase tracking-wide">Section Structure (Up to 10 Sections)</span>
                                      <span className="text-[10px] font-semibold text-teal-700">Max 30 products total</span>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="bg-white p-2.5 rounded-md border border-teal-200/60 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs">📁</span>
                                          <span className="text-xs font-semibold text-gray-700">Section 1: Featured Collection</span>
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-mono">e.g. 10 products</span>
                                      </div>
                                      <div className="bg-white/90 p-2.5 rounded-lg border border-teal-200 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className="text-base">🛍️</span>
                                          <div>
                                            <p className="text-xs font-bold text-teal-900">Commerce Catalog Linked</p>
                                            <p className="text-[11px] text-teal-700">
                                              {catalogProducts && catalogProducts.length > 0 
                                                ? `${catalogProducts.length} dynamic products linked from your catalog` 
                                                : 'Products in Commerce Catalog will automatically appear here'}
                                            </p>
                                          </div>
                                        </div>
                                        <span className="text-xs font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200">
                                          {catalogProducts ? catalogProducts.length : 0} Products
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                    <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
                                      Multi-Product Button
                                      <span className="text-[11px] font-bold bg-teal-100 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">
                                        Locked by Meta
                                      </span>
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-4">
                                      When clicked by the customer, this native WhatsApp button opens your curated product list directly in the chat.
                                    </p>
                                    <div className="p-4 md:p-5 bg-white border border-[#10B981] rounded-xl relative shadow-sm">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 flex-1">
                                            <div>
                                                <label className="text-[11px] font-bold text-gray-600 block mb-2 uppercase tracking-wide">Type of Action</label>
                                                <div className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-semibold bg-gray-50 text-gray-500 cursor-not-allowed flex items-center gap-2">
                                                    <span>📋</span>
                                                    <span>Open Multi-Product List</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-bold text-gray-600 block mb-2 uppercase tracking-wide flex items-center gap-1.5">
                                                    Button Text
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full normal-case tracking-normal">
                                                        <Lock size={9} /> Locked by WhatsApp
                                                    </span>
                                                </label>
                                                <div className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-semibold bg-gray-50 text-gray-500 cursor-not-allowed flex items-center justify-between">
                                                    <span>View items</span>
                                                    <Lock size={13} className="text-gray-400" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-2">
                                        Meta strictly enforces that the button text must be <strong>&quot;View items&quot;</strong> and no additional buttons can be added to an MPM template.
                                    </p>
                                </div>
                            </div>
                        ) : templateType === 'LIMITED_TIME_OFFER' ? (
                            <div className="space-y-6">
                                {/* Meta LTO Requirements Banner */}
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-base">⏱️</span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-bold text-sm text-amber-900">Meta Limited-Time Offer (LTO) Guidelines</p>
                                    <ul className="text-[12px] text-amber-800 mt-1.5 space-y-1 leading-relaxed list-none">
                                      <li>✅ <strong>Live Countdown Timer</strong> — WhatsApp natively renders a dynamic expiration timer that turns red in the final hour!</li>
                                      <li>✅ <strong>Offer Heading Text</strong> — Headline describing your offer (max 16 characters, e.g. &quot;Expiring offer!&quot; or &quot;20% OFF&quot;).</li>
                                      <li>✅ <strong>Mandatory Copy Code Button</strong> — Allows customers to copy the coupon code (max 15 characters) directly to clipboard.</li>
                                      <li>✅ <strong>Mandatory Website URL Button</strong> — Direct call-to-action button linking to your shop or landing page (must start with https://).</li>
                                      <li>⚠️ <strong>Footer Forbidden by Meta</strong> — Meta strictly prohibits footer text on Limited-Time Offer templates.</li>
                                      <li>✅ <strong>Category: MARKETING</strong> — Must be categorized as Marketing.</li>
                                    </ul>
                                  </div>
                                </div>

                                <div>
                                    <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
                                        Limited-Time Offer Details
                                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full uppercase">
                                          Countdown & Offer Banner
                                        </span>
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-4">
                                        Configure the promotional banner and countdown timer that WhatsApp renders natively.
                                    </p>

                                    <div className="p-4 md:p-5 bg-white border border-[#10B981] rounded-xl space-y-5 shadow-sm">
                                        {/* Dynamic Featured Catalog Product Selector */}
                                        <div className="p-3 bg-gradient-to-r from-red-50 to-orange-50/60 rounded-xl border border-red-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-[11px] font-bold text-red-800 uppercase tracking-wide flex items-center gap-1.5">
                                                    <span>🏷️ Featured Product from Catalog</span>
                                                    <span className="text-[10px] font-medium text-red-600 bg-white px-1.5 py-0.5 rounded border border-red-100">
                                                      Dynamic Deal
                                                    </span>
                                                </label>
                                                <span className="text-[10px] font-bold bg-white text-red-600 px-2 py-0.5 rounded-full border border-red-100">
                                                    {catalogProducts ? catalogProducts.length : 0} in Catalog
                                                </span>
                                            </div>
                                            {catalogProducts && catalogProducts.length > 0 ? (
                                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                                    <select
                                                        value={selectedLtoProduct?._id || ''}
                                                        onChange={(e) => {
                                                            const chosen = catalogProducts.find(p => p._id === e.target.value);
                                                            setSelectedLtoProduct(chosen || null);
                                                        }}
                                                        className="flex-1 p-2 bg-white border border-red-200 rounded-lg text-xs font-semibold text-gray-800 outline-none focus:border-red-400"
                                                    >
                                                        <option value="">-- Choose a catalog product to feature in deal --</option>
                                                        {catalogProducts.map(p => (
                                                            <option key={p._id} value={p._id}>
                                                                {p.name} — ₹{Number(p.sellingPrice || 0).toLocaleString('en-IN')}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {selectedLtoProduct && (
                                                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 shrink-0 text-center">
                                                            ✓ Selected: ₹{Number(selectedLtoProduct.sellingPrice || 0).toLocaleString('en-IN')}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-[11px] text-gray-500">
                                                    Products added in your Commerce Catalog will automatically sync and appear here.
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                            <div>
                                                <label className="text-[11px] font-bold text-gray-600 block mb-2 uppercase tracking-wide flex items-center justify-between">
                                                    <span>Offer Heading Text</span>
                                                    <span className="text-[10px] font-medium text-gray-400">
                                                        {(formData.limitedTimeOfferText || '').length}/16
                                                    </span>
                                                </label>
                                                <input 
                                                    type="text" 
                                                    value={formData.limitedTimeOfferText || ''} 
                                                    onChange={(e) => setFormData({...formData, limitedTimeOfferText: e.target.value})}
                                                    maxLength={16}
                                                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-semibold bg-white outline-none focus:border-[#10B981] transition-all" 
                                                    placeholder="Expiring offer!"
                                                />
                                                <p className="text-[11px] text-gray-400 mt-1">E.g., &quot;Expiring offer!&quot; or &quot;20% OFF&quot; (Max 16 chars)</p>
                                            </div>

                                            <div>
                                                <label className="text-[11px] font-bold text-gray-600 block mb-2 uppercase tracking-wide">
                                                    Countdown Timer
                                                </label>
                                                <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={16} className="text-[#10B981]" />
                                                        <span className="text-xs font-semibold text-gray-700">Display Live Countdown</span>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            className="sr-only peer" 
                                                            checked={formData.hasExpiration !== false} 
                                                            onChange={(e) => setFormData({...formData, hasExpiration: e.target.checked})} 
                                                        />
                                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]"></div>
                                                    </label>
                                                </div>
                                                <p className="text-[11px] text-gray-400 mt-1">Turns red in WhatsApp within the last hour of expiration</p>
                                            </div>
                                        </div>

                                        {/* Expiration Timing Options */}
                                        {formData.hasExpiration !== false && (
                                            <div className="pt-4 mt-2 border-t border-gray-100 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                                                        <span>Set Timing of Expiration</span>
                                                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md normal-case">
                                                            Countdown Length
                                                        </span>
                                                    </label>
                                                    <span className="text-[10px] font-bold text-[#10B981] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <Clock size={11} />
                                                        Active Timer: {getExpirationPreviewText(formData.expirationDate || '24h', formData.customExpirationHours || 24)}
                                                    </span>
                                                </div>

                                                {/* Preset Pill Buttons */}
                                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                                    {[
                                                        { label: '6 Hours', val: '6h' },
                                                        { label: '12 Hours', val: '12h' },
                                                        { label: '24 Hours', val: '24h' },
                                                        { label: '48 Hours', val: '48h' },
                                                        { label: '3 Days', val: '72h' },
                                                        { label: 'Custom', val: 'custom' }
                                                    ].map(opt => (
                                                        <button
                                                            key={opt.val}
                                                            type="button"
                                                            onClick={() => setFormData({...formData, expirationDate: opt.val})}
                                                            className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                                                                (formData.expirationDate || '24h') === opt.val
                                                                    ? 'bg-[#10B981] text-white border-[#10B981] shadow-xs'
                                                                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-white'
                                                            }`}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Custom Hours Input if Custom selected */}
                                                {formData.expirationDate === 'custom' && (
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg animate-in fade-in">
                                                        <span className="text-xs font-semibold text-gray-700">Expire after:</span>
                                                        <div className="relative w-28">
                                                            <input 
                                                                type="number" 
                                                                min="1" 
                                                                max="720"
                                                                value={formData.customExpirationHours || 24}
                                                                onChange={(e) => setFormData({...formData, customExpirationHours: Math.max(1, parseInt(e.target.value) || 1)})}
                                                                className="w-full p-2 border border-gray-200 rounded-lg text-sm font-bold text-center bg-white outline-none focus:border-[#10B981]"
                                                            />
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-700">Hours</span>
                                                        <span className="text-[11px] text-gray-400">
                                                            ({Math.round(((formData.customExpirationHours || 24) / 24) * 10) / 10} days)
                                                        </span>
                                                    </div>
                                                )}
                                                <p className="text-[11px] text-gray-400">
                                                    Sets how long recipient has to redeem this offer before the countdown ends.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
                                        Buttons
                                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full uppercase">
                                          WhatsApp Mandated
                                        </span>
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-4">
                                        WhatsApp requires a Copy Code button for Limited-Time Offers so users can tap to copy the coupon code to clipboard.
                                    </p>

                                    <div className="space-y-4">
                                        {/* Copy Code Button (Mandatory) */}
                                        <div className="p-4 md:p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                                <div>
                                                    <label className="text-[11px] font-bold text-gray-600 block mb-2 uppercase tracking-wide flex items-center gap-1.5">
                                                        Button 1: Type
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full normal-case">
                                                            <Lock size={9} /> Copy Code (Native)
                                                        </span>
                                                    </label>
                                                    <div className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-semibold bg-gray-50 text-gray-500 cursor-not-allowed flex items-center gap-2">
                                                        <Copy size={14} className="text-gray-400" />
                                                        <span>Copy code</span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-400 mt-1">WhatsApp automatically labels this button &quot;Copy code&quot;</p>
                                                </div>

                                                <div>
                                                    <label className="text-[11px] font-bold text-gray-600 block mb-2 uppercase tracking-wide flex items-center justify-between">
                                                        <span>Offer / Coupon Code</span>
                                                        <span className="text-[10px] font-medium text-gray-400">
                                                            {(formData.offerCode || '').length}/15
                                                        </span>
                                                    </label>
                                                    <input 
                                                        type="text" 
                                                        value={formData.offerCode || ''} 
                                                        onChange={(e) => {
                                                            const clean = e.target.value.replace(/[^A-Za-z0-9_-]/g, '').toUpperCase();
                                                            setFormData({...formData, offerCode: clean});
                                                        }}
                                                        maxLength={15}
                                                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-mono font-bold bg-white outline-none focus:border-[#10B981] transition-all uppercase" 
                                                        placeholder="e.g. 20OFF or DEAL50"
                                                    />
                                                    <p className="text-[11px] text-gray-400 mt-1">Letters and numbers only, max 15 chars (no '%' or symbols allowed by Meta)</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Website URL Button (Mandatory by WhatsApp at index 1) */}
                                        <div className="p-4 md:p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                                            <div className="flex items-center gap-2 mb-4">
                                                <ExternalLink size={16} className="text-blue-600" />
                                                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                                                    Button 2: Website URL
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-100 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full normal-case">
                                                        <Lock size={9} /> Required by WhatsApp
                                                    </span>
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                                <div>
                                                    <label className="text-[11px] font-bold text-gray-600 block mb-2 uppercase tracking-wide flex items-center justify-between">
                                                        <span>Button Text</span>
                                                        <span className="text-[10px] font-medium text-gray-400">
                                                            {(formData.ltoUrlText || '').length}/25
                                                        </span>
                                                    </label>
                                                    <input 
                                                        type="text" 
                                                        value={formData.ltoUrlText || ''} 
                                                        onChange={(e) => setFormData({...formData, ltoUrlText: e.target.value})}
                                                        maxLength={25}
                                                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-semibold bg-white outline-none focus:border-[#10B981] transition-all" 
                                                        placeholder="Shop Now"
                                                    />
                                                    <p className="text-[11px] text-gray-400 mt-1">Label shown on the link button (e.g. &quot;Shop Now&quot;)</p>
                                                </div>
                                                <div>
                                                    <label className="text-[11px] font-bold text-gray-600 block mb-2 uppercase tracking-wide">
                                                        Website URL
                                                    </label>
                                                    <input 
                                                        type="url" 
                                                        value={formData.ltoUrl || ''} 
                                                        onChange={(e) => setFormData({...formData, ltoUrl: e.target.value})}
                                                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-medium bg-white outline-none focus:border-[#10B981] transition-all" 
                                                        placeholder="https://yourwebsite.com/deal"
                                                    />
                                                    <p className="text-[11px] text-gray-400 mt-1">Web address opened when tapped (Must start with https://)</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                        <>
                        <div className="flex justify-between items-center mb-4 relative" ref={buttonMenuRef}>
                            <h3 className="text-sm md:text-base font-bold text-gray-800">Buttons</h3>
                            
                            <div className="relative">
                              <button 
                                type="button"
                                onClick={addButton} 
                                disabled={buttons.length >= 10} 
                                className="text-xs font-bold text-blue-600 flex items-center gap-1.5 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                              >
                                  <Plus size={14}/> Add button
                              </button>

                              {/* WhatsTool exact style Button Picker Popup (Intelligently opens UP or DOWN based on screen space) */}
                              {showButtonMenu && (
                                <div className={`absolute right-0 ${menuPlacement === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'} w-72 bg-white rounded-2xl shadow-2xl border border-gray-200/80 py-3 z-50 animate-in fade-in zoom-in-95 duration-150`}>
                                  
                                  {/* Quick Reply Section */}
                                  <div className="px-4 pb-2">
                                    <h4 className="text-xs font-bold text-gray-900 tracking-tight">Quick reply buttons</h4>
                                  </div>

                                  <div className="space-y-0.5">
                                    <button
                                      type="button"
                                      disabled={quickReplyButtonCount >= 3}
                                      onClick={() => addSpecificButton('Marketing opt-out')}
                                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex flex-col disabled:opacity-35 disabled:cursor-not-allowed group cursor-pointer"
                                    >
                                      <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">Marketing opt-out</span>
                                      <span className="text-[11px] text-gray-400 font-normal">Recommended</span>
                                    </button>

                                    <button
                                      type="button"
                                      disabled={quickReplyButtonCount >= 3}
                                      onClick={() => addSpecificButton('Custom')}
                                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex flex-col disabled:opacity-35 disabled:cursor-not-allowed group cursor-pointer"
                                    >
                                      <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">Custom</span>
                                    </button>
                                  </div>

                                  <div className="my-2 border-t border-gray-100" />

                                  {/* Call to Action Section */}
                                  <div className="px-4 pb-2">
                                    <h4 className="text-xs font-bold text-gray-900 tracking-tight">Call to action buttons</h4>
                                  </div>

                                  <div className="space-y-0.5">
                                    <button
                                      type="button"
                                      disabled={websiteButtonCount >= 2}
                                      onClick={() => addSpecificButton('Visit website')}
                                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex flex-col disabled:opacity-35 disabled:cursor-not-allowed group cursor-pointer"
                                    >
                                      <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">Visit website</span>
                                      <span className="text-[11px] text-gray-400 font-normal">2 buttons maximum</span>
                                    </button>

                                    <button
                                      type="button"
                                      disabled={phoneButtonCount >= 1}
                                      onClick={() => addSpecificButton('Call phone number')}
                                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex flex-col disabled:opacity-35 disabled:cursor-not-allowed group cursor-pointer"
                                    >
                                      <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">Call phone number</span>
                                      <span className="text-[11px] text-gray-400 font-normal">1 buttons maximum</span>
                                    </button>

                                    <button
                                      type="button"
                                      disabled={copyCodeButtonCount >= 1}
                                      onClick={() => addSpecificButton('Copy offer code')}
                                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex flex-col disabled:opacity-35 disabled:cursor-not-allowed group cursor-pointer"
                                    >
                                      <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">Copy offer code</span>
                                      <span className="text-[11px] text-gray-400 font-normal">1 buttons maximum</span>
                                    </button>
                                  </div>

                                </div>
                              )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {buttons.map((btn) => (
                                <div key={btn.id} className="p-4 md:p-5 bg-white border border-gray-200 rounded-xl flex items-start gap-3 md:gap-4 relative group hover:border-gray-300 transition-all shadow-sm">
                                    {btn.type === 'Call phone number' ? (
                                      <div className="flex-1 space-y-3">
                                        {/* Row 1: Action Type & Button Text */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                          <div>
                                            <label className="text-[11px] font-bold text-gray-600 block mb-1.5 uppercase tracking-wide">Type of Action</label>
                                            <div className="w-full p-2.5 border border-gray-100 rounded-lg text-sm font-semibold bg-gray-50 text-gray-700 flex items-center gap-2">
                                              <span>📞</span>
                                              <span>Call phone number</span>
                                            </div>
                                          </div>
                                          <div>
                                            <label className="text-[11px] font-bold text-gray-600 block mb-1.5 uppercase tracking-wide">Button Text</label>
                                            <div className="relative">
                                              <input 
                                                type="text" 
                                                value={btn.text} 
                                                maxLength={25}
                                                onChange={(e) => updateButton(btn.id, 'text', e.target.value)}
                                                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-semibold bg-white outline-none focus:border-blue-400 transition-all pr-12" 
                                                placeholder="Call us"
                                              />
                                              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium">
                                                {(btn.text || '').length}/25
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Row 2: Country Code & Phone Number */}
                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 md:gap-4">
                                          <div className="sm:col-span-4">
                                            <label className="text-[11px] font-bold text-gray-600 block mb-1.5 uppercase tracking-wide">Country Code</label>
                                            <select
                                              value={btn.countryCode || '+91'}
                                              onChange={(e) => updateButton(btn.id, 'countryCode', e.target.value)}
                                              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-semibold bg-white outline-none focus:border-blue-400 transition-all cursor-pointer"
                                            >
                                              {COUNTRY_CODES.map((c) => (
                                                <option key={c.code + c.iso} value={c.code}>
                                                  {c.code} ({c.name})
                                                </option>
                                              ))}
                                            </select>
                                          </div>
                                          <div className="sm:col-span-8">
                                            <div className="flex items-center justify-between mb-1.5">
                                              <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Phone Number</label>
                                              <span className="text-[10px] text-gray-400 font-medium">
                                                {(btn.value || '').length > 0 ? `${(btn.value || '').length} digits` : '10-15 digits'}
                                              </span>
                                            </div>
                                            <div className="relative">
                                              <input 
                                                type="tel" 
                                                value={btn.value || ''} 
                                                onChange={(e) => handlePhoneInputChange(btn.id, e.target.value, btn.countryCode)}
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold bg-white outline-none focus:border-blue-400 transition-all placeholder:text-gray-400 placeholder:font-normal" 
                                                placeholder="e.g. 6203459821"
                                              />
                                            </div>
                                            <div className="flex items-center justify-between mt-1 text-[11px] text-gray-500">
                                              <span>Meta format: <strong className="text-emerald-600 font-mono font-bold">{(btn.countryCode || '+91')}{btn.value || ''}</strong></span>
                                              <span className="text-gray-400">Auto-detects country code</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (btn.type === 'Visit website' || btn.type === 'Visit Website') ? (
                                      <div className="flex-1 space-y-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                          <div>
                                            <label className="text-[11px] font-bold text-gray-600 block mb-1.5 uppercase tracking-wide">Type of Action</label>
                                            <div className="w-full p-2.5 border border-gray-100 rounded-lg text-sm font-semibold bg-gray-50 text-gray-700 flex items-center gap-2">
                                              <span>🔗</span>
                                              <span>Visit website</span>
                                            </div>
                                          </div>
                                          <div>
                                            <label className="text-[11px] font-bold text-gray-600 block mb-1.5 uppercase tracking-wide">Button Text</label>
                                            <div className="relative">
                                              <input 
                                                type="text" 
                                                value={btn.text} 
                                                maxLength={25}
                                                onChange={(e) => updateButton(btn.id, 'text', e.target.value)}
                                                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-semibold bg-white outline-none focus:border-blue-400 transition-all pr-12" 
                                                placeholder="Visit website"
                                              />
                                              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium">
                                                {(btn.text || '').length}/25
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        <div>
                                          <div className="flex items-center justify-between mb-1.5">
                                            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Website URL</label>
                                            <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5">
                                              <button type="button" onClick={() => updateButton(btn.id, 'urlType', 'static')} className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-all ${(btn.urlType || 'static') === 'static' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>Static</button>
                                              <button type="button" onClick={() => updateButton(btn.id, 'urlType', 'dynamic')} className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-all ${btn.urlType === 'dynamic' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>Dynamic</button>
                                            </div>
                                          </div>
                                          <div className="relative">
                                            <input 
                                              type="text" 
                                              value={btn.value} 
                                              onChange={(e) => updateButton(btn.id, 'value', e.target.value)}
                                              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-semibold bg-white outline-none focus:border-blue-400 transition-all" 
                                              placeholder={btn.urlType === 'dynamic' ? 'https://example.com/page/{{1}}' : 'https://example.com'}
                                            />
                                          </div>
                                          {btn.urlType === 'dynamic' && (
                                            <div className="mt-2">
                                              <label className="text-[11px] font-bold text-gray-500 block mb-1.5 uppercase tracking-wide">Example Value for {'{{1}}'}</label>
                                              <input
                                                type="text"
                                                value={btn.urlExample || ''}
                                                onChange={(e) => updateButton(btn.id, 'urlExample', e.target.value)}
                                                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-blue-400 transition-all"
                                                placeholder="e.g. product-123 (for Meta review)"
                                              />
                                              <p className="text-[10px] text-gray-400 mt-1">Required by Meta — provide a sample value to fill {'{{1}}'} during template review.</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ) : btn.type === 'Copy offer code' ? (
                                      <div className="flex-1 space-y-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                          <div>
                                            <label className="text-[11px] font-bold text-gray-600 block mb-1.5 uppercase tracking-wide">Type of Action</label>
                                            <div className="w-full p-2.5 border border-gray-100 rounded-lg text-sm font-semibold bg-gray-50 text-gray-700 flex items-center gap-2">
                                              <span>📋</span>
                                              <span>Copy offer code</span>
                                            </div>
                                          </div>
                                          <div>
                                            <label className="text-[11px] font-bold text-gray-600 block mb-1.5 uppercase tracking-wide">Button Text</label>
                                            <div className="relative">
                                              <input 
                                                type="text" 
                                                value={btn.text} 
                                                maxLength={25}
                                                onChange={(e) => updateButton(btn.id, 'text', e.target.value)}
                                                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-semibold bg-white outline-none focus:border-blue-400 transition-all pr-12" 
                                                placeholder="Copy offer code"
                                              />
                                              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium">
                                                {(btn.text || '').length}/25
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        <div>
                                          <label className="text-[11px] font-bold text-gray-600 block mb-1.5 uppercase tracking-wide flex items-center justify-between">
                                            <span>Coupon / Offer Code</span>
                                            <span className="text-[10px] text-gray-400">{(btn.value || '').length}/15</span>
                                          </label>
                                          <input 
                                            type="text" 
                                            value={btn.value} 
                                            maxLength={15}
                                            onChange={(e) => updateButton(btn.id, 'value', e.target.value.toUpperCase())}
                                            className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-mono font-bold uppercase bg-white outline-none focus:border-blue-400 transition-all" 
                                            placeholder="OFFER20"
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                        <div>
                                          <label className="text-[11px] font-bold text-gray-600 block mb-1.5 uppercase tracking-wide">Type of Action</label>
                                          <div className="w-full p-2.5 border border-gray-100 rounded-lg text-sm font-semibold bg-gray-50 text-gray-700 flex items-center gap-2">
                                            <span>⚡</span>
                                            <span>{btn.type}</span>
                                          </div>
                                        </div>
                                        <div>
                                          <label className="text-[11px] font-bold text-gray-600 block mb-1.5 uppercase tracking-wide">Button Text</label>
                                          <div className="relative">
                                            <input 
                                              type="text" 
                                              value={btn.text} 
                                              maxLength={25}
                                              onChange={(e) => updateButton(btn.id, 'text', e.target.value)}
                                              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-semibold bg-white outline-none focus:border-blue-400 transition-all pr-12" 
                                              placeholder={btn.type === 'Marketing opt-out' ? 'Stop promotions' : 'e.g. Yes, Interested'}
                                            />
                                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium">
                                              {(btn.text || '').length}/25
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    <button type="button" onClick={() => removeButton(btn.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0 self-start mt-5" title="Remove button">
                                        <X size={20}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                        </>
                        )}
                    </div>
                </div>
                )}
                {submitError && (
                  <div className="w-full mt-6 p-4 bg-red-50 border border-red-300 rounded-xl text-red-800 text-sm flex items-start gap-3 animate-in fade-in shadow-sm">
                    <div className="p-1.5 bg-red-100 rounded-lg text-red-600 shrink-0 mt-0.5">
                      <AlertCircle size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-red-900 text-sm">Cannot Save Template</p>
                      <p className="text-xs text-red-700 mt-1 leading-relaxed break-words">{submitError}</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setSubmitError(null)} 
                      className="text-red-400 hover:text-red-700 transition-colors p-1 shrink-0"
                      title="Dismiss"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-6">
                    <button onClick={() => setView('setup')} className="text-gray-500 font-semibold text-sm hover:text-gray-800 transition-colors px-4 py-2 order-2 sm:order-1">← Previous Step</button>

                    <button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto bg-[#10B981] text-white px-10 md:px-14 py-3 md:py-4 rounded-lg font-semibold text-sm shadow-sm hover:bg-[#059669] transition-all order-1 sm:order-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <RotateCw size={16} className="animate-spin" />
                          {isEditing ? 'Saving...' : 'Submitting...'}
                        </>
                      ) : (
                        isEditing ? 'Save Changes' : 'Submit Template'
                      )}
                    </button>
                </div>
            </div>
          )}
        </div>
      </div>

      {/* Responsive Preview Sidebar (Permanently Fixed on Screen) */}
      <div className="w-full lg:w-[420px] xl:w-[450px] bg-white px-4 py-6 md:p-8 flex flex-col items-center border-t lg:border-t-0 lg:border-l border-slate-100 relative h-full overflow-hidden shrink-0">
        <div className="w-full flex flex-col items-center h-full justify-between pb-4">
            <div className="flex justify-between w-full mb-3 shrink-0">
                <p className="text-gray-800 font-semibold text-sm uppercase tracking-wide">Live Preview</p>
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
                    <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Synced</span>
                </div>
            </div>
            {/* Centered Fixed Phone Mockup */}
            <div className="flex-1 flex items-center justify-center w-full">
          <MobilePreview 
            name={formData.name || 'YOUR_TEMPLATE'} 
            body={formData.bodyText} 
            bodySamples={bodySamples}
            category={formData.category}
            authExpirationMinutes={authExpirationMinutes}
            authSecurityRecommendation={authSecurityRecommendation}
            footer={(formData.category === 'Authentication' || templateType === 'LIMITED_TIME_OFFER') ? '' : formData.footerText} 
            headerMedia={headerMedia}
            headerType={formData.headerType}
            headerText={formData.headerText}
            showImage={formData.category !== 'Authentication' && formData.headerType !== 'None' && templateType !== 'CATALOG'} 
            offer={formData.offerTitle} 
            isLimited={templateType === 'LIMITED_TIME_OFFER'}
            limitedTimeOfferText={formData.limitedTimeOfferText}
            hasExpiration={formData.hasExpiration}
            expirationPreviewText={getExpirationPreviewText(formData.expirationDate || '24h', formData.customExpirationHours || 24)}
            offerCode={formData.offerCode}
            ltoHasUrlButton={formData.ltoHasUrlButton}
            ltoUrlText={formData.ltoUrlText}
            isCatalog={templateType === 'CATALOG'}
            isMpm={templateType === 'MPM'}
            catalogButtonText={formData.catalogButtonText}
            mpmButtonText={formData.mpmButtonText}
            buttons={formData.category === 'Authentication' ? [] : buttons} 
            isSetupView={view === 'setup'}
            templateType={templateType}
            catalogProducts={catalogProducts}
            selectedLtoProduct={selectedLtoProduct}
          />
            </div>
        </div>
      </div>

      {/* Media Selection Modal */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsMediaModalOpen(false)}>
          <div 
            className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Select Media</h3>
                <p className="text-sm text-gray-500 mt-1">Choose a media asset from your gallery</p>
              </div>
              <button 
                onClick={() => setIsMediaModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {isLoadingMedia ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <RotateCw size={28} className="animate-spin text-green-500" />
                  <p className="text-sm text-gray-500 font-medium">Loading media gallery...</p>
                </div>
              ) : mediaAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <ImageIcon size={40} className="text-gray-300" />
                  <p className="text-sm text-gray-500 font-medium">No media files found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {mediaAssets.filter(a => {
                      if(formData.headerType === 'Image') return a.type === 'IMAGE';
                      if(formData.headerType === 'Video') return a.type === 'VIDEO';
                      return a.type === 'PDF' || a.type === 'ARCHIVE' || a.type === 'DOCUMENT';
                  }).map(asset => {
                    const isImg = asset.type === 'IMAGE';
                    const isVid = asset.type === 'VIDEO';
                    return (
                      <div 
                        key={asset._id || asset.id} 
                        onClick={() => handleSelectExistingMedia(asset)}
                        className="group border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-green-500 hover:ring-2 hover:ring-green-100 transition-all"
                      >
                        <div className="h-32 bg-gray-50 relative flex items-center justify-center overflow-hidden">
                          {isImg ? (
                            <img src={resolveMediaUrlForDev(asset.thumb || asset.url)} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                          ) : isVid ? (
                            <video src={resolveMediaUrlForDev(asset.url)} className="w-full h-full object-cover" muted playsInline />
                          ) : (
                             <div className="text-gray-400 font-bold text-lg">{asset.name?.split('.').pop().toUpperCase() || 'DOC'}</div>
                          )}
                          <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-semibold uppercase">{asset.type}</div>
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-semibold text-gray-800 truncate">{asset.name}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{asset.size || 'Unknown size'}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MobilePreview = ({ 
  name, 
  body, 
  footer, 
  showImage = false, 
  isLimited = false, 
  limitedTimeOfferText = 'Expiring offer!',
  hasExpiration = true,
  expirationPreviewText = '23:59:59',
  offerCode = '',
  ltoHasUrlButton = false,
  ltoUrlText = 'Shop Now',
  isCatalog = false, 
  isMpm = false, 
  catalogButtonText = "", 
  mpmButtonText = "", 
  buttons = [], 
  headerMedia = null, 
  headerType = 'None', 
  headerText = '',
  isSetupView = false,
  templateType = 'CUSTOM',
  catalogProducts = [],
  selectedLtoProduct = null,
  bodySamples = {},
  category = 'Marketing',
  authExpirationMinutes = 10,
  authSecurityRecommendation = true
}) => {
  const activeIsMpm = isMpm || templateType === 'MPM';
  const activeIsLimited = isLimited || templateType === 'LIMITED_TIME_OFFER';
  const activeIsCatalog = isCatalog || templateType === 'CATALOG';

  if (isSetupView) {
    return (
      <div className="relative w-[265px] h-[535px] bg-white rounded-[2rem] border-[6px] border-[#1e293b] shadow-xl overflow-hidden font-sans flex flex-col items-center">
        {/* Notch */}
        <div className="absolute top-0 w-28 h-[18px] bg-[#1e293b] rounded-b-[14px] z-20 flex justify-center">
           <div className="w-10 h-1 bg-white/20 rounded-full mt-1"></div>
        </div>
        
        {/* WhatsApp App Bar */}
        <div className="w-full bg-[#075e54] text-white pt-6 pb-2 px-3 flex items-center justify-between shrink-0 shadow-xs z-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
              MB
            </div>
            <div>
              <p className="text-[11px] font-bold leading-tight">MessBee Business</p>
              <p className="text-[8px] text-green-200">Official Business Account</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-white/80">
            <span>📞</span>
            <span>⋮</span>
          </div>
        </div>

        {/* Screen Background */}
        <div className="w-full h-full bg-[#e5ddd5] p-3 overflow-y-auto custom-scrollbar flex flex-col justify-start">
           
           {/* MPM (Multi-Product Message) Setup Preview */}
           {activeIsMpm ? (
             <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col w-full shrink-0 animate-in fade-in duration-300">
                {/* Text Header */}
                <div className="p-3 bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-teal-100">
                  <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-wider block">
                    {headerText || 'Featured Products'}
                  </span>
                  <span className="text-[8px] font-semibold text-teal-600 flex items-center gap-1 mt-0.5">
                    🛍️ Meta Commerce Catalog Linked
                  </span>
                </div>

                {/* Body Text */}
                <div className="p-3 flex flex-col">
                   {name && (
                     <p className="text-[10px] text-[#10B981] font-bold mb-1 uppercase tracking-wide">
                       {name.replace(/_/g, ' ')}
                     </p>
                   )}
                   <div 
                     className="text-[9px] text-gray-700 font-normal leading-relaxed text-left whitespace-pre-line"
                     dangerouslySetInnerHTML={{ 
                       __html: formatWhatsAppMarkdown(body || 'Explore our latest collection of handpicked items. Tap below to browse products, view details, and place your order directly on WhatsApp!', bodySamples) 
                     }}
                   />
                   
                   {/* Meta Multi-Product Interactive Showcase Widget */}
                   <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                     <div className="flex items-center justify-between text-[8px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 border-b border-gray-200 pb-1">
                       <span>Catalog Showcase</span>
                       <span className="text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 font-mono">
                         {catalogProducts && catalogProducts.length > 0 ? `${catalogProducts.length} Items` : '30 Items Max'}
                       </span>
                     </div>
                     {catalogProducts && catalogProducts.length > 0 ? (
                       <div className="space-y-1.5">
                         {catalogProducts.slice(0, 2).map((prod, idx) => (
                           <div key={prod._id || idx} className="flex items-center justify-between bg-white p-1.5 rounded border border-gray-100 shadow-xs">
                             <div className="flex items-center gap-2 min-w-0">
                               {prod.productImage ? (
                                 <img src={prod.productImage} alt={prod.name} className="w-5 h-5 rounded object-cover border border-gray-100 shrink-0" />
                               ) : (
                                 <span className="text-xs shrink-0">{idx === 0 ? '📦' : '✨'}</span>
                               )}
                               <span className="text-[9px] font-semibold text-gray-800 truncate">{prod.name}</span>
                             </div>
                             <span className="text-[9px] font-bold text-teal-700 shrink-0 ml-1">₹{Number(prod.sellingPrice || 0).toLocaleString('en-IN')}</span>
                           </div>
                         ))}
                         {catalogProducts.length > 2 && (
                           <div className="mt-1.5 text-center text-[8px] font-medium text-teal-700 bg-teal-50/80 py-0.5 rounded border border-teal-100">
                             + {catalogProducts.length - 2} more products in your catalog
                           </div>
                         )}
                       </div>
                     ) : (
                       <div className="py-2.5 px-2 text-center bg-white rounded border border-dashed border-teal-200">
                         <p className="text-[9px] font-bold text-teal-800">Linked to Meta Commerce Catalog</p>
                         <p className="text-[8px] text-gray-500 mt-0.5">Your catalog products will automatically display here</p>
                       </div>
                     )}
                   </div>
                </div>

                {/* Locked MPM Action Button */}
                <div className="border-t border-gray-100 w-full bg-[#fafafa]">
                   <div className="w-full py-2.5 flex items-center justify-center gap-1.5">
                      <span className="text-[#25d366] font-bold text-[10px] flex items-center gap-1">
                        📋 View items
                      </span>
                   </div>
                </div>
             </div>
           ) : activeIsLimited ? (
             /* Limited-Time Offer Setup Preview */
             <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col w-full shrink-0 animate-in fade-in duration-300">
                {/* Header Banner */}
                <div className="w-full h-24 bg-gradient-to-br from-red-500 via-rose-600 to-amber-500 flex flex-col items-center justify-center text-white relative overflow-hidden">
                   <span className="text-2xl mb-0.5">⚡</span>
                   <span className="text-xs font-black tracking-widest uppercase text-center px-2 truncate w-full">{headerText || (name ? name.replace(/_/g, " ") : "Limited-Time Offer")}</span>
                   <span className="text-[9px] font-medium opacity-90">WhatsApp Native Countdown Timer</span>
                </div>

                {/* Body & LTO Urgency Section */}
                <div className="p-3 flex flex-col">
                   {name && (
                     <p className="text-[10px] text-red-600 font-bold mb-1 uppercase tracking-wide">
                       {name.replace(/_/g, ' ')}
                     </p>
                   )}

                   {/* Native Urgency Countdown Banner */}
                   <div className="mb-2 p-2 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200 flex flex-col gap-1.5 shadow-xs">
                      <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-red-600 tracking-tight flex items-center gap-1">
                            🔥 {limitedTimeOfferText || 'Expiring offer!'}
                          </span>
                          <span className="text-[9px] font-bold text-red-600 bg-white px-1.5 py-0.5 rounded shadow-xs border border-red-100 flex items-center gap-0.5">
                            ⏱ 23:59:59
                          </span>
                      </div>
                      <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-dashed border-red-300">
                        <span className="text-[9px] font-medium text-gray-500">Coupon:</span>
                        <span className="text-[10px] font-mono font-bold text-gray-800 tracking-wider bg-gray-50 px-1 rounded flex items-center gap-1">
                          {offerCode || (name ? name.slice(0, 6).toUpperCase() + 'OFF' : 'OFFER_CODE')} <Copy size={9} className="text-gray-400" />
                        </span>
                      </div>
                   </div>

                   {/* Dynamic Featured Catalog Deal Product */}
                   {(selectedLtoProduct || (catalogProducts && catalogProducts.length > 0)) && (
                     <div className="mb-2 p-1.5 bg-white rounded-lg border border-red-100 shadow-2xs flex items-center justify-between">
                       <div className="flex items-center gap-2 min-w-0">
                         {(selectedLtoProduct || catalogProducts[0])?.productImage ? (
                           <img 
                             src={(selectedLtoProduct || catalogProducts[0]).productImage} 
                             alt="Featured deal" 
                             className="w-7 h-7 rounded object-cover border border-gray-100 shrink-0" 
                           />
                         ) : (
                           <div className="w-7 h-7 rounded bg-red-50 text-red-500 flex items-center justify-center text-xs shrink-0 font-bold">
                             🏷️
                           </div>
                         )}
                         <div className="min-w-0 flex flex-col">
                           <span className="text-[9px] font-bold text-gray-800 truncate">
                             {(selectedLtoProduct || catalogProducts[0])?.name}
                           </span>
                           <span className="text-[7.5px] text-red-600 font-semibold">Special Catalog Deal</span>
                         </div>
                       </div>
                       <div className="text-right shrink-0 ml-1">
                         <span className="text-[8px] text-gray-400 line-through block">
                           ₹{Math.round(Number((selectedLtoProduct || catalogProducts[0])?.sellingPrice || 1000) * 1.25).toLocaleString('en-IN')}
                         </span>
                         <span className="text-[10px] font-bold text-red-600 block">
                           ₹{Number((selectedLtoProduct || catalogProducts[0])?.sellingPrice || 0).toLocaleString('en-IN')}
                         </span>
                       </div>
                     </div>
                   )}

                   <div 
                     className="text-[9px] text-gray-700 font-normal leading-relaxed text-left whitespace-pre-line"
                     dangerouslySetInnerHTML={{ 
                       __html: formatWhatsAppMarkdown(body || 'Special Offer! Enjoy an exclusive discount on your next order. Tap below to copy your discount code and start shopping before time runs out!', bodySamples) 
                     }}
                   />
                </div>

                {/* Mandated Buttons: Copy Code + Website CTA */}
                <div className="border-t border-gray-100 w-full bg-[#fafafa]">
                   <div className="w-full py-2 flex items-center justify-center gap-1.5 border-b border-gray-100">
                      <span className="text-[#25d366] font-bold text-[9px] flex items-center gap-1">
                        <Copy size={11} className="text-[#25d366]" /> Copy code
                      </span>
                   </div>
                   <div className="w-full py-2 flex items-center justify-center gap-1.5">
                      <span className="text-[#25d366] font-bold text-[9px] flex items-center gap-1">
                        <ExternalLink size={11} className="text-[#25d366]" /> {ltoUrlText || 'Shop Now'}
                      </span>
                   </div>
                </div>
             </div>
           ) : activeIsCatalog ? (
             /* Catalog Setup Preview */
             <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col w-full shrink-0 animate-in fade-in duration-300">
                <div className="w-full h-24 bg-gradient-to-br from-emerald-100 to-teal-100 flex flex-col items-center justify-center text-emerald-800 border-b border-emerald-200">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xl">🛍️</span>
                    <span className="text-lg">📦</span>
                    <span className="text-xl">👟</span>
                  </div>
                  <span className="text-[9px] font-bold bg-white/80 px-2 py-0.5 rounded-full border border-emerald-300">Product Thumbnail (Auto by Meta)</span>
                </div>
                <div className="p-3 flex flex-col">
                   {name && (
                     <p className="text-[10px] text-[#10B981] font-bold mb-1 uppercase tracking-wide">
                       {name.replace(/_/g, ' ')}
                     </p>
                   )}
                   <div 
                     className="text-[9px] text-gray-700 font-normal leading-relaxed text-left whitespace-pre-line"
                     dangerouslySetInnerHTML={{ 
                       __html: formatWhatsAppMarkdown(body || 'Browse our complete catalog of products and services right inside WhatsApp!', bodySamples) 
                     }}
                   />
                </div>
                <div className="border-t border-gray-100 w-full bg-[#fafafa]">
                   <div className="w-full py-2.5 flex items-center justify-center gap-1.5">
                      <span className="text-[#25d366] font-bold text-[9px] flex items-center gap-1">
                        🛍️ View catalog
                      </span>
                   </div>
                </div>
             </div>
           ) : (
             /* Custom Setup Preview */
             <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col w-full shrink-0 animate-in fade-in duration-300">
                {/* Header Image */}
                {(() => {
                   const mediaSrc = resolveMediaUrlForDev(
                     headerMedia?.preview || 
                     headerMedia?.hostedUrl || 
                     headerMedia?.url || 
                     (typeof headerMedia === 'string' ? headerMedia : null)
                   );

                   if (mediaSrc) {
                     return (
                       <div className="w-full relative bg-slate-900/5 min-h-[110px] max-h-[220px] flex items-center justify-center shrink-0 border-b border-gray-100 overflow-hidden">
                         <img 
                           src={mediaSrc} 
                           alt="Header preview" 
                           className="w-full h-auto max-h-[220px] object-contain" 
                         />
                       </div>
                     );
                   }

                   return (
                     <div className="w-full h-[120px] relative bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 flex flex-col items-center justify-center text-white shrink-0 overflow-hidden">
                        <div className="flex flex-col items-center gap-1 opacity-90">
                           <span className="text-2xl">🖼️</span>
                           <span className="text-[10px] font-bold tracking-wider uppercase">Sample Media Header</span>
                        </div>
                     </div>
                   );
                })()}

                <div className="p-3 flex flex-col">
                   {name && (
                     <p className="text-[10px] text-[#10B981] font-bold mb-1 uppercase tracking-wide">
                       {name.replace(/_/g, ' ')}
                     </p>
                   )}
                   <div 
                     className="text-[9px] text-[#333] font-normal leading-relaxed text-left whitespace-pre-line"
                     dangerouslySetInnerHTML={{ 
                       __html: formatWhatsAppMarkdown(body || 'Hello John, thank you for choosing our services! We are excited to assist you with your upcoming project.', bodySamples) 
                     }}
                   />
                </div>

                <div className="border-t border-gray-100 w-full bg-[#fafafa]">
                   <div className="w-full py-2.5 flex items-center justify-center gap-1.5">
                      <span className="text-[#25d366] font-bold text-[9px] flex items-center gap-1">
                        <ExternalLink size={11} className="text-[#25d366]" /> Visit Website
                      </span>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-[265px] h-[535px] bg-white rounded-[2rem] border-[5px] border-[#1e293b] shadow-xl overflow-hidden font-sans flex flex-col items-center">
      {/* Notch */}
      <div className="absolute top-0 w-28 h-[18px] bg-[#1e293b] rounded-b-[14px] z-20 flex justify-center">
         <div className="w-10 h-1 bg-white/20 rounded-full mt-1"></div>
      </div>
      
      {/* WhatsApp App Bar */}
      <div className="w-full bg-[#075e54] text-white pt-6 pb-2 px-3 flex items-center justify-between shrink-0 shadow-xs z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
            MB
          </div>
          <div>
            <p className="text-[11px] font-bold leading-tight">MessBee Business</p>
            <p className="text-[8px] text-green-200">Official Business Account</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-white/80">
          <span>📞</span>
          <span>⋮</span>
        </div>
      </div>

      {/* Screen Background */}
      <div className="w-full h-full bg-[#e5ddd5] p-3 overflow-y-auto custom-scrollbar flex flex-col">
         {/* Message Bubble Card */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col w-full shrink-0">
            {/* Header Media — CATALOG uses auto product thumbnail, others use uploaded media */}
            {activeIsCatalog ? (
              <div className="w-full relative bg-gradient-to-br from-emerald-50 to-teal-100 flex flex-col items-center justify-center shrink-0 border-b border-emerald-100 overflow-hidden py-3">
                {catalogProducts && catalogProducts.length > 0 && catalogProducts[0].productImage ? (
                  <>
                    <img src={catalogProducts[0].productImage} className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-multiply" />
                    <div className="relative z-10 flex flex-col items-center">
                      <p className="text-[8px] font-semibold text-emerald-700 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-emerald-200 shadow-sm">Product Thumbnail (Auto by Meta)</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">🛍️</span>
                      <span className="text-lg">📦</span>
                      <span className="text-xl">👟</span>
                    </div>
                    <p className="text-[8px] font-semibold text-emerald-700 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200">Product Thumbnail (Auto by Meta)</p>
                  </>
                )}
              </div>
            ) : headerType === 'Text' ? (
              <div className="px-3.5 py-2.5 bg-gradient-to-r from-gray-50 to-slate-100 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-900 leading-tight">
                  {headerText || (activeIsMpm ? 'Featured Products' : 'Header Title')}
                </p>
              </div>
            ) : headerType && headerType !== 'None' ? (
              <div className="w-full relative bg-slate-900/5 min-h-[110px] max-h-[240px] flex items-center justify-center shrink-0 border-b border-gray-100 overflow-hidden">
                {(() => {
                  const isImageHeader = String(headerType || '').toLowerCase() === 'image';
                  const isVideoHeader = String(headerType || '').toLowerCase() === 'video';
                  const isDocHeader = String(headerType || '').toLowerCase() === 'document';
                  const mediaSrc = resolveMediaUrlForDev(
                    headerMedia?.preview || 
                    headerMedia?.hostedUrl || 
                    headerMedia?.url || 
                    (typeof headerMedia === 'string' ? headerMedia : null)
                  );

                  if (mediaSrc) {
                    return (
                      <>
                        {isImageHeader && (
                          <img
                            src={mediaSrc}
                            alt="Header preview"
                            className="w-full h-auto max-h-[240px] object-contain rounded-t-lg mx-auto"
                            onError={(e) => {
                              if (headerMedia?.hostedUrl && e.target.src !== headerMedia.hostedUrl) {
                                e.target.src = resolveMediaUrlForDev(headerMedia.hostedUrl);
                              } else if (headerMedia?.url && e.target.src !== headerMedia.url) {
                                e.target.src = resolveMediaUrlForDev(headerMedia.url);
                              }
                            }}
                          />
                        )}
                        {isVideoHeader && (
                          <video
                            src={mediaSrc}
                            className="w-full h-auto max-h-[240px] object-contain rounded-t-lg mx-auto"
                            controls
                            muted
                            playsInline
                          />
                        )}
                        {isDocHeader && (
                          <div className="w-full h-20 bg-red-50 flex items-center justify-center gap-2">
                            <span className="text-2xl">📄</span>
                            <div className="text-xl font-bold text-red-600">
                              {String(headerMedia?.name || 'DOCUMENT').split('.').pop().toUpperCase()}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  }

                  return (
                    <div className="w-full h-28 bg-gray-50 flex items-center justify-center text-gray-400">
                      {isImageHeader ? <ImageIcon size={28} className="text-gray-300"/> : isVideoHeader ? <span className="text-xl">▶️</span> : <span className="text-xl">📄</span>}
                    </div>
                  );
                })()}
              </div>
            ) : null}
            
            <div className="p-3 flex flex-col">
               {name && headerType === 'None' && (
                 <p className="text-[10px] text-[#10B981] font-bold mb-1 uppercase tracking-wide">
                   {name.replace(/_/g, ' ')}
                 </p>
               )}
               
               {/* LTO Urgency Offer Banner */}
               {activeIsLimited && (
                  <div className="mb-2 p-2 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200 flex flex-col gap-1.5 shadow-xs">
                      <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-red-600 tracking-tight flex items-center gap-1">
                            🔥 {limitedTimeOfferText || 'Expiring offer!'}
                          </span>
                          {hasExpiration && (
                            <span className="text-[9px] font-bold text-red-600 bg-white px-1.5 py-0.5 rounded shadow-xs border border-red-100 flex items-center gap-0.5">
                              ⏱ {expirationPreviewText || '23:59:59'}
                            </span>
                          )}
                      </div>
                      {offerCode ? (
                        <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-dashed border-red-300">
                          <span className="text-[8px] font-medium text-gray-500">Coupon Code:</span>
                          <span className="text-[10px] font-mono font-bold text-gray-800 tracking-wider bg-gray-50 px-1 rounded flex items-center gap-1">
                            {offerCode} <Copy size={9} className="text-gray-400" />
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-white/70 px-2 py-1 rounded border border-dashed border-gray-300">
                          <span className="text-[8px] font-medium text-gray-400">Coupon Code:</span>
                          <span className="text-[9px] font-mono italic text-gray-400">[Enter code in editor]</span>
                        </div>
                      )}
                  </div>
               )}

               {/* Dynamic Featured Catalog Deal Product for LTO */}
               {activeIsLimited && (selectedLtoProduct || (catalogProducts && catalogProducts.length > 0)) && (
                 <div className="mb-2 p-1.5 bg-white rounded-lg border border-red-100 shadow-2xs flex items-center justify-between">
                   <div className="flex items-center gap-2 min-w-0">
                     {(selectedLtoProduct || catalogProducts[0])?.productImage ? (
                       <img 
                         src={(selectedLtoProduct || catalogProducts[0]).productImage} 
                         alt="Featured deal" 
                         className="w-7 h-7 rounded object-cover border border-gray-100 shrink-0" 
                       />
                     ) : (
                       <div className="w-7 h-7 rounded bg-red-50 text-red-500 flex items-center justify-center text-xs shrink-0 font-bold">
                         🏷️
                       </div>
                     )}
                     <div className="min-w-0 flex flex-col">
                       <span className="text-[9px] font-bold text-gray-800 truncate">
                         {(selectedLtoProduct || catalogProducts[0])?.name}
                       </span>
                       <span className="text-[7.5px] text-red-600 font-semibold">Special Catalog Deal</span>
                     </div>
                   </div>
                   <div className="text-right shrink-0 ml-1">
                     <span className="text-[8px] text-gray-400 line-through block">
                       ₹{Math.round(Number((selectedLtoProduct || catalogProducts[0])?.sellingPrice || 1000) * 1.25).toLocaleString('en-IN')}
                     </span>
                     <span className="text-[10px] font-bold text-red-600 block">
                       ₹{Number((selectedLtoProduct || catalogProducts[0])?.sellingPrice || 0).toLocaleString('en-IN')}
                     </span>
                   </div>
                 </div>
               )}

               {category === 'Authentication' ? (
                 <div className="text-[9.5px] text-[#333] font-normal leading-relaxed text-left space-y-1.5 py-1">
                   <p className="font-semibold text-gray-900">
                     <span className="font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-bold text-[10px] tracking-wider">123456</span> is your verification code.
                   </p>
                   {authSecurityRecommendation && (
                     <p className="text-[8px] text-gray-500">For your security, do not share this code.</p>
                   )}
                   <p className="text-[8px] text-gray-400">Valid for {authExpirationMinutes || 10} minutes.</p>
                 </div>
               ) : (
                 <div className="text-[9px] text-[#333] font-normal leading-relaxed whitespace-pre-line text-left" dangerouslySetInnerHTML={{ __html: formatWhatsAppMarkdown(body, bodySamples) }}></div>
               )}
               
               {/* MPM/Catalog Product Showcase Widget (Dynamic) */}
               {(activeIsMpm || activeIsCatalog) && (
                  <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between text-[8px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 border-b border-gray-200 pb-1">
                      <span>{activeIsCatalog ? 'Opens on Click:' : 'Catalog Showcase'}</span>
                      <span className="text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 font-mono">
                        {catalogProducts && catalogProducts.length > 0 ? `${catalogProducts.length} Items` : '30 Items Max'}
                      </span>
                    </div>
                    {catalogProducts && catalogProducts.length > 0 ? (
                      <div className="space-y-1.5">
                        {catalogProducts.slice(0, 2).map((prod, idx) => (
                          <div key={prod._id || idx} className="flex items-center justify-between bg-white p-1.5 rounded border border-gray-100 shadow-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              {prod.productImage ? (
                                <img src={prod.productImage} alt={prod.name} className="w-5 h-5 rounded object-cover border border-gray-100 shrink-0" />
                              ) : (
                                <span className="text-xs shrink-0">{idx === 0 ? '📦' : '✨'}</span>
                              )}
                              <span className="text-[9px] font-semibold text-gray-800 truncate">{prod.name}</span>
                            </div>
                            <span className="text-[9px] font-bold text-teal-700 shrink-0 ml-1">₹{Number(prod.sellingPrice || 0).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                        {catalogProducts.length > 2 && (
                          <div className="mt-1.5 text-center text-[8px] font-medium text-teal-700 bg-teal-50/80 py-0.5 rounded border border-teal-100">
                            + {catalogProducts.length - 2} more products in your catalog
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-2.5 px-2 text-center bg-white rounded border border-dashed border-teal-200">
                        <p className="text-[9px] font-bold text-teal-800">Linked to Meta Commerce Catalog</p>
                        <p className="text-[8px] text-gray-500 mt-0.5">Your catalog products will automatically display here</p>
                      </div>
                    )}
                  </div>
               )}

               {!activeIsLimited && category !== 'Authentication' && footer && (
                 <p className="text-[9px] text-gray-400 mt-2 font-medium">{footer}</p>
               )}
            </div>
            
            {category === 'Authentication' ? (
               <div className="flex flex-col border-t border-gray-100 w-full bg-[#fafafa]">
                  <div className="w-full py-2.5 flex items-center justify-center gap-1.5">
                     <span className="text-[#25d366] font-bold text-[9px] flex items-center gap-1.5">
                       <Copy size={11} className="text-[#25d366]"/>
                       Copy code
                     </span>
                  </div>
               </div>
            ) : activeIsCatalog || activeIsMpm ? (
               <div className="flex flex-col border-t border-gray-100 w-full bg-[#fafafa]">
                  <div className="w-full py-2.5 flex items-center justify-center gap-2">
                     <span className="text-[#25d366] font-bold text-[9px] flex items-center gap-1.5">
                       {activeIsCatalog ? <span className="text-[11px]">🛍️</span> : <span className="text-[11px]">📋</span>}
                       {activeIsCatalog ? 'View catalog' : 'View items'}
                     </span>
                  </div>
               </div>
            ) : activeIsLimited ? (
               <div className="flex flex-col border-t border-gray-100 w-full bg-[#fafafa]">
                  <div className="w-full py-2 flex items-center justify-center gap-1.5 border-b border-gray-100">
                     <span className="text-[#25d366] font-bold text-[9px] flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                       <Copy size={11} className="text-[#25d366]"/>
                       Copy code
                     </span>
                  </div>
                  <div className="w-full py-2 flex items-center justify-center gap-1.5">
                     <span className="text-[#25d366] font-bold text-[9px] flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                       <ExternalLink size={11} className="text-[#25d366]"/>
                       {ltoUrlText || 'Shop Now'}
                     </span>
                  </div>
               </div>
            ) : buttons && buttons.length > 0 && (
               <div className="flex flex-col border-t border-gray-100 w-full bg-[#fafafa]">
                  {buttons.map((btn) => (
                     <div key={btn.id} className="w-full py-2.5 flex items-center justify-center gap-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-[#25d366] font-bold text-[9px] flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                          {btn.type === 'Visit Website' || btn.type === 'Visit website' ? (
                            <ExternalLink size={10} className="text-[#25d366]"/>
                          ) : btn.type === 'Call phone number' ? (
                            <Phone size={10} className="text-[#25d366]"/>
                          ) : btn.type === 'Copy offer code' || (btn.text && btn.text.toLowerCase().includes('copy')) ? (
                            <Copy size={10} className="text-[#25d366]"/>
                          ) : null} 
                          {btn.text || (btn.type === 'Copy offer code' ? 'Copy offer code' : 'Button')}
                        </span>
                     </div>
                   ))}
                </div>
             )}
          </div>
       </div>
      </div>
    );
};

export default CreateTemplate;

