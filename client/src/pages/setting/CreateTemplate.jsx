/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RotateCw, ArrowLeft, Image as ImageIcon, Plus, ChevronRight, ExternalLink, Trash2, Globe, X, Clock, Bold, Italic, Link2, Strikethrough, Smile, Info, Copy, Zap, Lock, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { createWhatsAppTemplate, updateWhatsAppTemplate, saveTemplateHeaderPreview, uploadTemplateMedia, uploadTemplateMediaByUrl, resolveMediaUrlForDev, fetchWhatsAppTemplates } from '../../services/TemplateApi';
import { formatWhatsAppMarkdown } from '../../utils/markdownParser';
import axios from '../../context/axios';
import { userContext } from '../../context/Context';
import { getPlanLimit, hasPlanFeature } from '../../utils/planLimits';

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

  const [templateType, setTemplateType] = useState('CUSTOM');
  const [authExpirationMinutes, setAuthExpirationMinutes] = useState(10);
  const [authSecurityRecommendation, setAuthSecurityRecommendation] = useState(true);
  const [buttons, setButtons] = useState([]);
  const editorRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [bodyVariables, setBodyVariables] = useState([]);
  const [bodySamples, setBodySamples] = useState(location.state?.templateData?.bodySamples || {});
  // eslint-disable-next-line no-unused-vars
  const [headerVariables, setHeaderVariables] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [headerSamples, setHeaderSamples] = useState({});

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
  const headerFileRef = useRef(null);

  const EMOJIS = [
    '😀','😂','🥰','😍','🤩','😊','🎉','🔥',
    '❤️','👋','💪','✅','⭐','🚀','💡','🎯',
    '📢','📱','💰','🛒','🎁','👍','🙏','💬',
    '📧','⚡','🌟','🏆','💎','🤝','📞','🎊',
  ];

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

  const insertEmoji = (emoji) => {
    editorRef.current?.focus();
    document.execCommand('insertText', false, emoji);
    syncEditorContent();
    setShowEmojiPicker(false);
  };

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
    headerType: location.state?.templateData?.headerType || 'None',
    headerText: location.state?.templateData?.headerText || '',
    bodyText: location.state?.templateData?.bodyText || 'Hello {{1}}, our Summer Sale is now live! Use code BUYONEGETONE for 50% off. Shop now!',
    footerText: location.state?.templateData?.footerText || 'Reply STOP to opt out',
    expirationDate: '24h',
    catalogButtonText: location.state?.templateData?.buttons?.[0]?.text || 'View Catalog',
    mpmButtonText: location.state?.templateData?.buttons?.[0]?.text || 'View Items',
  });

  // Prepopulate buttons if editing
  useEffect(() => {
    if (location.state?.templateData?.buttons) {
      setButtons(location.state.templateData.buttons);
    }
  }, [location.state]);

  const handleCategoryChange = (cat) => {
    if (formData.category === cat) return; // Skip if no change
    
    let newBody = '';
    if (cat === 'Marketing') {
      newBody = 'Hello {{1}}, our Summer Sale is now live! Use code BUYONEGETONE for 50% off. Shop now!';
    } else if (cat === 'Utility') {
      newBody = 'Good news! Your order {{1}} has shipped! Here\'s your tracking information, please check link below.';
    } else if (cat === 'Authentication') {
      newBody = '{{1}} is your verification code. For your security, do not share this code.';
    }
    setFormData({ ...formData, category: cat, bodyText: newBody });

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

  const addButton = () => {
    if (buttons.length < 3) {
      setButtons([...buttons, { id: Date.now(), type: 'Visit Website', text: 'New Button', value: '', countryCode: '+91' }]);
    }
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

    if (templateType === 'MPM' && (!formData.headerType || formData.headerType === 'None')) {
      failSubmit("A Header is mandatory for Multi-Product Messages. Please select a Text or Media header above.", true);
      return;
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
      if (formData.headerType && formData.headerType !== 'None') {
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


      const bodyComponent = { type: 'BODY', text: strippedBody };
      if (templateVariables.length > 0) {
        bodyComponent.example = {
          body_text: [templateVariables.map((id) => String(bodySamples[id] || '').trim())]
        };
      }
      components.push(bodyComponent);

      if (formData.footerText && formData.footerText.trim()) {
        components.push({ type: 'FOOTER', text: formData.footerText.substring(0, 60) }); // Max 60 chars
      }

      if (templateType === 'CATALOG') {
        components.push({
          type: 'BUTTONS',
          buttons: [
            {
              type: 'CATALOG',
              text: (formData.catalogButtonText || 'View Catalog').trim().substring(0, 20)
            }
          ]
        });
      } else if (templateType === 'MPM') {
        components.push({
          type: 'BUTTONS',
          buttons: [
            {
              type: 'MPM',
              text: (formData.mpmButtonText || 'View Items').trim().substring(0, 20)
            }
          ]
        });
      } else if (buttons && buttons.length > 0) {
        const waButtons = buttons.map(b => {
          if (b.type === 'Visit Website' || b.type === 'Visit website') {
            return { type: 'URL', text: b.text, url: b.value };
          }
          if (b.type === 'Call phone number') {
            const fullPhone = `${b.countryCode || '+91'}${b.value}`;
            return { type: 'PHONE_NUMBER', text: b.text, phone_number: fullPhone };
          }
          return { type: 'QUICK_REPLY', text: b.text };
        }).filter(b => b.text && (b.url || b.phone_number || b.type === 'QUICK_REPLY'));
        
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
      const waError = error?.response?.data?.error || {};
      const nestedWaError = waError?.error || {};
      const errorSubcode = nestedWaError?.error_subcode ?? nestedWaError?.errorSubcode ?? waError?.error_subcode ?? waError?.errorSubcode;
      const errorMsg =
        nestedWaError?.message ||
        waError?.message ||
        nestedWaError?.error_user_msg ||
        waError?.error_user_msg ||
        nestedWaError?.error_data?.details ||
        waError?.error_data?.details ||
        error?.response?.data?.message;
      const suggestedName = waError?.suggestedName;
      
      // Default error message
      let errorMessage =
        errorMsg ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create template on WhatsApp. Please try again.";
      
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
    setView('content');
  }

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
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-white overflow-hidden font-sans animate-in fade-in duration-500 relative">
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
      {/* REST OF YOUR ORIGINAL FILE BELOW — 100% SAME */}

      
      {/* Scrollable Form Container */}
      <div className="flex-1 p-4 md:p-6 lg:p-10 overflow-y-auto border-r border-slate-100 bg-[#F8FAFC]">
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
                                  if (type === 'MPM' && (!formData.headerType || formData.headerType === 'None')) {
                                    setFormData(prev => ({ ...prev, headerType: 'Text', headerText: prev.headerText || 'Featured Products' }));
                                  }
                                  setSubmitError(null);
                                  setHeaderError(false);
                                }} 
                                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${templateType === type ? 'border-2 border-[#10B981] bg-[#F0FDF4]/30' : 'border border-gray-200 bg-white hover:border-gray-300'}`}
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
                                      <span className="text-[13px] font-bold text-gray-800 block mb-1 tracking-wide">
                                        {type === 'CUSTOM' ? 'CUSTOM' : type === 'CATALOG' ? 'CATALOG' : type === 'MPM' ? 'MULTI-PRODUCT MESSAGE' : 'LIMITED TIME OFFER'}
                                      </span>
                                      <p className="text-[13px] text-gray-500 leading-relaxed">
                                          {type === 'CUSTOM' ? (formData.category === 'Utility' ? 'Send messages about an existing order or account.' : 'Send promotional offers & announcements') 
                                          : type === 'CATALOG' ? 'Display your entire product catalog'
                                          : type === 'MPM' ? 'Showcase up to 30 specific products'
                                          : 'Send an offer with a countdown timer to drive urgency'}
                                      </p>
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
                                {templateType === 'MPM' ? (
                                  <span className="text-amber-800 bg-amber-100/90 border border-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full tracking-wide">
                                    REQUIRED FOR MPM
                                  </span>
                                ) : (
                                  <span className="text-gray-400 font-normal text-sm ml-1">(Optional)</span>
                                )}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {templateType === 'MPM'
                                ? 'Meta WhatsApp strictly requires a Header (Text or Media) for Multi-Product Messages.'
                                : "Add a title or choose which type of media you'll use for this header."}
                            </p>
                        </div>

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
                              // Clear previous media when header type changes
                              setHeaderMedia(null);
                              setUploadedMediaUrl(null);
                              setHeaderError(false);
                              setSubmitError(null);
                              if (headerFileRef.current) {
                                headerFileRef.current.value = '';
                              }
                            }}
                        >
                            <option value="None">{templateType === 'MPM' ? 'None (Header is required for MPM)' : 'None'}</option>
                            <option value="Text">Text</option>
                            <option value="Image">Image</option>
                            <option value="Video">Video</option>
                            <option value="Document">Document</option>
                        </select>

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
                                    {headerMedia.type === 'image' && (
                                      <img 
                                        src={headerMedia.preview} 
                                        alt="preview" 
                                        className="h-16 w-16 rounded-lg object-contain bg-white border border-gray-200 p-1 shrink-0"
                                      />
                                    )}
                                    {headerMedia.type === 'video' && (
                                      <video 
                                        src={headerMedia.preview} 
                                        className="h-16 w-16 rounded-lg object-contain bg-black shrink-0"
                                      />
                                    )}
                                    {headerMedia.type === 'document' && (
                                      <div className="h-16 w-16 rounded-lg bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs shrink-0 border border-red-100">
                                        {headerMedia.name.split('.').pop().toUpperCase()}
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
                            className="w-full p-3 md:p-4 outline-none text-sm font-medium text-gray-700 leading-relaxed bg-white min-h-[120px]"
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
                                <div className="relative">
                                    <button type="button" onClick={() => setShowEmojiPicker(p => !p)} title="Emoji">
                                        <Smile size={18} className="hover:text-yellow-500 transition-colors"/>
                                    </button>
                                    {showEmojiPicker && (
                                        <div className="absolute bottom-8 left-0 z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl p-3 w-64">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Pick an emoji</p>
                                            <div className="grid grid-cols-8 gap-1">
                                                {EMOJIS.map(e => (
                                                    <button
                                                        key={e}
                                                        type="button"
                                                        onClick={() => insertEmoji(e)}
                                                        className="text-xl hover:bg-gray-100 rounded-lg p-1 transition-colors leading-none"
                                                    >{e}</button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button type="button" onClick={() => applyFormat('bold')} title="Bold"><Bold size={18}/></button>
                                <button type="button" onClick={() => applyFormat('italic')} title="Italic"><Italic size={18}/></button>
                                <button type="button" onClick={() => applyFormat('strikeThrough')} title="Strikethrough"><Strikethrough size={18}/></button>
                                <button type="button" onClick={() => applyFormat('fontName')} title="Monospace"><Link2 size={18}/></button>
                            </div>
                            <button type="button" onClick={insertVariable} className="text-sm font-bold text-gray-700 flex items-center gap-1.5 hover:text-blue-600 transition-all">
                                <Plus size={16}/> Add Variable
                            </button>
                        </div>
                    </div>

                    {/* FOOTER SECTION */}
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
                            <div>
                                <h3 className="text-sm md:text-base font-bold text-gray-800 mb-4">Catalog Button</h3>
                                <div className="p-4 md:p-5 bg-white border border-[#10B981] rounded-xl flex items-center gap-4 relative shadow-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 flex-1">
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-600 block mb-2 uppercase tracking-wide">Type of Action</label>
                                            <div className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-semibold bg-gray-50 text-gray-500 cursor-not-allowed">
                                                Open Catalog
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-600 block mb-2 uppercase tracking-wide">Button Text</label>
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    value={formData.catalogButtonText || ''} 
                                                    onChange={(e) => setFormData({...formData, catalogButtonText: e.target.value})}
                                                    maxLength={20}
                                                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-semibold bg-white outline-none focus:border-[#10B981] transition-all" 
                                                    placeholder="View Catalog"
                                                />
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-400">
                                                    {(formData.catalogButtonText || '').length}/20
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">This button will open your WhatsApp Commerce catalog when clicked by the user.</p>
                            </div>
                        ) : templateType === 'MPM' ? (
                            <div>
                                <h3 className="text-sm md:text-base font-bold text-gray-800 mb-4">Multi-Product Button</h3>
                                <div className="p-4 md:p-5 bg-white border border-[#10B981] rounded-xl flex items-center gap-4 relative shadow-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 flex-1">
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-600 block mb-2 uppercase tracking-wide">Type of Action</label>
                                            <div className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-semibold bg-gray-50 text-gray-500 cursor-not-allowed">
                                                View Items
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-600 block mb-2 uppercase tracking-wide">Button Text</label>
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    value={formData.mpmButtonText || ''} 
                                                    onChange={(e) => setFormData({...formData, mpmButtonText: e.target.value})}
                                                    maxLength={20}
                                                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-semibold bg-white outline-none focus:border-[#10B981] transition-all" 
                                                    placeholder="View Items"
                                                />
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-400">
                                                    {(formData.mpmButtonText || '').length}/20
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">This button opens a curated selection of products inside WhatsApp.</p>
                            </div>
                        ) : (
                        <>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm md:text-base font-bold text-gray-800">Buttons </h3>
                            <button onClick={addButton} disabled={buttons.length >= 3} className="text-xs font-bold text-blue-600 flex items-center gap-1.5 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-all disabled:opacity-30">
                                <Plus size={14}/> Add New
                            </button>
                        </div>
                        <div className="space-y-4">
                            {buttons.map((btn) => (
                                <div key={btn.id} className="p-4 md:p-5 bg-white border border-gray-200 rounded-xl flex items-center gap-4 relative group hover:border-gray-300 transition-all shadow-sm">
                                    <div className={`grid grid-cols-1 ${btn.type === 'Call phone number' ? 'md:grid-cols-4' : btn.type === 'Custom' ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4 md:gap-6 flex-1`}>
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-600 block mb-2 uppercase tracking-wide">Type of Action</label>
                                            <select 
                                              value={btn.type}
                                              onChange={(e) => {
                                                const newType = e.target.value;
                                                updateButton(btn.id, 'type', newType);
                                                if (newType === 'Custom' && (!btn.text || btn.text === 'Visit website' || btn.text === 'Call phone number')) {
                                                  updateButton(btn.id, 'text', 'Quick Reply');
                                                }
                                              }}
                                              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-semibold bg-white outline-none focus:border-blue-400 transition-all cursor-pointer"
                                            >
                                              <option>Visit website</option>
                                              <option>Call phone number</option>
                                              <option>Custom</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-600 block mb-2 uppercase tracking-wide">Button Text</label>
                                            <div className="relative">
                                              <input 
                                                type="text" 
                                                value={btn.text} 
                                                maxLength={25}
                                                onChange={(e) => updateButton(btn.id, 'text', e.target.value)}
                                                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-semibold bg-white outline-none focus:border-blue-400 transition-all" 
                                                placeholder={btn.type === 'Custom' ? 'e.g. Yes, Interested' : btn.type === 'Call phone number' ? 'Call us' : 'Visit website'}
                                              />
                                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium">
                                                {(btn.text || '').length}/25
                                              </span>
                                            </div>
                                        </div>
                                        
                                        {btn.type === 'Call phone number' ? (
                                          <>
                                            <div>
                                                <label className="text-[11px] font-bold text-gray-600 block mb-2 uppercase tracking-wide">Country Code</label>
                                                <select
                                                  value={btn.countryCode || '+91'}
                                                  onChange={(e) => updateButton(btn.id, 'countryCode', e.target.value)}
                                                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-semibold bg-white outline-none focus:border-blue-400 transition-all cursor-pointer"
                                                >
                                                  <option value="+91">🇮🇳 +91 (India)</option>
                                                  <option value="+1">🇺🇸 +1 (USA)</option>
                                                  <option value="+44">🇬🇧 +44 (UK)</option>
                                                  <option value="+971">🇦🇪 +971 (UAE)</option>
                                                  <option value="+61">🇦🇺 +61 (Australia)</option>
                                                  <option value="+49">🇩🇪 +49 (Germany)</option>
                                                  <option value="+33">🇫🇷 +33 (France)</option>
                                                  <option value="+81">🇯🇵 +81 (Japan)</option>
                                                  <option value="+86">🇨🇳 +86 (China)</option>
                                                  <option value="+55">🇧🇷 +55 (Brazil)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-bold text-gray-600 block mb-2 uppercase tracking-wide">Phone Number</label>
                                                <div className="relative">
                                                  <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                                                    <span className="text-sm font-bold text-gray-500">{btn.countryCode || '+91'}</span>
                                                  </div>
                                                  <input 
                                                    type="text" 
                                                    value={btn.value} 
                                                    onChange={(e) => updateButton(btn.id, 'value', e.target.value.replace(/\D/g, ''))}
                                                    className="w-full pl-12 p-2.5 border border-gray-200 rounded-lg text-sm font-semibold bg-white outline-none focus:border-blue-400 transition-all" 
                                                    placeholder="9876543210"
                                                  />
                                                </div>
                                            </div>
                                          </>
                                        ) : btn.type === 'Custom' ? null : (
                                          <>
                                            <div>
                                                <label className="text-[11px] font-bold text-gray-600 block mb-2 uppercase tracking-wide">Website URL</label>
                                                <div className="relative">
                                                  <input 
                                                    type="text" 
                                                    value={btn.value} 
                                                    onChange={(e) => updateButton(btn.id, 'value', e.target.value)}
                                                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-semibold bg-white outline-none focus:border-blue-400 transition-all" 
                                                    placeholder="https://..."
                                                  />
                                                </div>
                                            </div>
                                          </>
                                        )}
                                    </div>
                                    <button onClick={() => removeButton(btn.id)} className="p-2 text-gray-400 hover:text-gray-800 transition-colors">
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

      {/* Responsive Preview Sidebar */}
      <div className="w-full lg:w-[450px] xl:w-[480px] bg-white p-6 md:p-10 flex flex-col items-center border-t lg:border-t-0 lg:border-l border-slate-100 relative overflow-y-auto">
        <div className="lg:sticky lg:top-0 w-full flex flex-col items-center">
            <div className="flex justify-between w-full mb-8 lg:mb-12">
                <p className="text-gray-800 font-semibold text-sm uppercase tracking-wide">Live Preview</p>
                <div className="flex items-center gap-2 bg-green-50 px-3 md:px-4 py-1.5 md:py-2 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
                    <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Synced</span>
                </div>
            </div>
            {/* Scale adjustment for smaller laptop screens */}
            <div className="transform scale-75 sm:scale-90 lg:scale-95 origin-top">
          <MobilePreview 
            name={formData.name || 'YOUR_TEMPLATE'} 
            body={formData.bodyText} 
            footer={formData.category === 'Authentication' ? '' : formData.footerText} 
            headerMedia={headerMedia}
            headerType={formData.headerType}
            showImage={formData.category !== 'Authentication' && formData.headerType !== 'None'} 
            offer={formData.offerTitle} 
            isLimited={templateType === 'LIMITED_TIME_OFFER'}
            isCatalog={templateType === 'CATALOG'}
            isMpm={templateType === 'MPM'}
            catalogButtonText={formData.catalogButtonText}
            mpmButtonText={formData.mpmButtonText}
            buttons={formData.category === 'Authentication' ? [] : buttons} 
            isSetupView={view === 'setup'}
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

const MobilePreview = ({ name, body, footer, showImage = false, isLimited = false, isCatalog = false, isMpm = false, catalogButtonText = "", mpmButtonText = "", buttons = [], headerMedia = null, headerType = 'None', isSetupView = false }) => {
  if (isSetupView) {
    return (
      <div className="relative w-[285px] h-[585px] bg-white rounded-[2.5rem] border-[12px] border-[#1e293b] shadow-2xl overflow-hidden font-sans flex flex-col items-center">
        {/* Notch */}
        <div className="absolute top-0 w-32 h-[24px] bg-[#1e293b] rounded-b-[18px] z-20 flex justify-center">
           <div className="w-12 h-1.5 bg-white/20 rounded-full mt-1.5"></div>
        </div>
        
        {/* Screen Background */}
        <div className="w-full h-full bg-[#e5ddd5] pt-12 pb-6 px-3.5 overflow-y-auto custom-scrollbar flex flex-col">
           {/* Message Bubble Card */}
           <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mt-2 flex flex-col w-full shrink-0">
              
              {/* Header Image CSS Art */}
              <div className="w-full h-[140px] relative bg-[#1d8a83] flex items-end justify-center shrink-0 overflow-hidden">
                 {/* Person Head */}
                 <div className="absolute bottom-[46px] flex flex-col items-center z-10">
                    {/* Hat Top */}
                    <div className="w-[56px] h-[36px] bg-[#2c3546] rounded-t-[30px]"></div>
                    {/* Hat Brim */}
                    <div className="w-[74px] h-[14px] bg-[#525d6e] rounded-[4px] -mt-1 z-20"></div>
                    {/* Face */}
                    <div className="w-[16px] h-[10px] bg-[#f2cdab] rounded-b-full"></div>
                 </div>
                 {/* Person Body */}
                 <div className="w-[52px] h-[46px] bg-[#5197a9] rounded-t-[26px] absolute bottom-[30px] z-0"></div>
                 {/* Laptop */}
                 <div className="w-[86px] h-[30px] bg-[#e5eaf0] rounded-t-[4px] relative z-30"></div>
              </div>
              
              <div className="p-4 flex flex-col">
                 <div className="text-[13px] text-[#2c3e50] font-normal leading-relaxed mb-2">
                   Hey there! Check out our fresh groceries now!
                   <br /><br />
                   Use code <strong>HEALTH</strong> to get additional 10% off on your entire purchase.
                 </div>
                 
                 <div className="flex justify-end">
                    <span className="text-[10px] text-gray-400 font-semibold">11:59</span>
                 </div>
              </div>
              
           </div>
        </div>
      </div>
    );
  }

  // Dynamic preview for content phase
  return (
    <div className="relative w-[285px] h-[585px] bg-white rounded-[2.5rem] border-[12px] border-[#1e293b] shadow-2xl overflow-hidden font-sans flex flex-col items-center">
      {/* Notch */}
      <div className="absolute top-0 w-32 h-[24px] bg-[#1e293b] rounded-b-[18px] z-20 flex justify-center">
         <div className="w-12 h-1.5 bg-white/20 rounded-full mt-1.5"></div>
      </div>
      
      {/* Screen Background */}
      <div className="w-full h-full bg-[#e5ddd5] pt-12 pb-6 px-3.5 overflow-y-auto custom-scrollbar flex flex-col">
         {/* Message Bubble Card */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mt-2 flex flex-col w-full shrink-0">
            {showImage && (
              <div className="w-full relative overflow-hidden bg-gray-50 shrink-0 min-h-[110px] max-h-[220px] flex items-center justify-center">
                {headerMedia ? (
                  <>
                    {headerMedia.type === 'image' && (
                      <img src={headerMedia.preview} alt="header" className="w-full h-auto max-h-[220px] object-contain bg-slate-900/5"/>
                    )}
                    {headerMedia.type === 'video' && (
                      <video src={headerMedia.preview} className="w-full h-auto max-h-[220px] object-contain bg-black" controls={false}/>
                    )}
                    {headerMedia.type === 'document' && (
                      <div className="w-full h-32 bg-red-50 flex items-center justify-center flex-col gap-2">
                        <div className="text-3xl font-bold text-red-600">{headerMedia.name.split('.').pop().toUpperCase()}</div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-400">
                    {headerType === 'Image' ? <ImageIcon size={28}/> : headerType === 'Video' ? <span className="text-2xl">▶️</span> : headerType === 'Document' ? <span className="text-2xl">📄</span> : <ImageIcon size={28}/>}
                  </div>
                )}
              </div>
            )}
            
            <div className="p-4 flex flex-col">
               {name && <p className="text-[11px] text-[#10B981] font-bold mb-2 uppercase tracking-wide">[{name}]</p>}
               <div className="text-[9px] text-[#333] font-normal leading-relaxed whitespace-pre-line text-left" dangerouslySetInnerHTML={{ __html: formatWhatsAppMarkdown(body) }}></div>
               
               {isLimited && (
                  <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-red-500">Offer expires in:</span>
                      <span className="text-[11px] font-bold text-red-600 bg-white px-1.5 py-0.5 rounded shadow-sm">23:59:59</span>
                  </div>
               )}

               {footer && <p className="text-[10px] text-gray-400 mt-3 font-medium">{footer}</p>}

               <div className="flex justify-end mt-2">
                  <span className="text-[10px] text-gray-400 font-semibold">11:59</span>
               </div>
            </div>
            
            {isCatalog || isMpm ? (
               <div className="flex flex-col border-t border-gray-100 w-full bg-[#fafafa]">
                  <div className="w-full py-3 flex items-center justify-center gap-2">
                     <span className="text-[#25d366] font-bold text-[9px] flex items-center gap-2">
                       {isCatalog ? (catalogButtonText || 'View Catalog') : (mpmButtonText || 'View Items')}
                     </span>
                  </div>
               </div>
            ) : buttons && buttons.length > 0 && (
               <div className="flex flex-col border-t border-gray-100 w-full bg-[#fafafa]">
                  {buttons.map((btn) => (
                     <div key={btn.id} className="w-full py-3 flex items-center justify-center gap-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-[#25d366] font-bold text-[9px] flex items-center gap-2 hover:opacity-80 transition-opacity">
                          {btn.type === 'Visit Website' || btn.type === 'Visit website' ? <ExternalLink size={12} className="text-[#25d366]"/> : btn.text.toLowerCase().includes('copy') ? <Copy size={12} className="text-[#25d366]"/> : null} 
                          {btn.text}
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