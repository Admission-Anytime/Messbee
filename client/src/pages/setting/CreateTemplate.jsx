/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RotateCw, ArrowLeft, Image as ImageIcon, Send, Plus, ChevronRight, ExternalLink, Trash2, Globe, X, Clock, Bold, Italic, Link2, Strikethrough, Smile, Info, Copy, Zap } from 'lucide-react';
import { toast } from 'react-toastify';
import { createWhatsAppTemplate, updateWhatsAppTemplate, saveTemplateHeaderPreview, uploadTemplateMedia, uploadTemplateMediaByUrl, resolveMediaUrlForDev } from '../../services/TemplateApi';
import { formatWhatsAppMarkdown } from '../../utils/markdownParser';
import axios from '../../context/axios';
const CreateTemplate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isEditing = location.state?.isEditing;
  const isDuplicate = location.state?.isDuplicate;
  const templateData = location.state?.templateData;

  // ✅ KEY FIX: gallery vs direct create vs edit
  const [view, setView] = useState(
    isEditing ? 'content' : (isDuplicate || location.state?.fromGallery ? 'setup' : 'choose')
  );

  const [templateType, setTemplateType] = useState('CUSTOM');
  const [buttons, setButtons] = useState([]);
  const editorRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [bodyVariables, setBodyVariables] = useState([]);
  const [bodySamples, setBodySamples] = useState(location.state?.templateData?.bodySamples || {});
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
    } else {
      // truncate — restore selection to end
      editorRef.current.innerText = plain.slice(0, 1024);
      setCharCount(1024);
      syncBodyVariableState(editorRef.current.innerText);
    }
  };

  const handleBodySampleChange = (variableId, value) => {
    setBodySamples((prev) => ({ ...prev, [variableId]: value }));
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

    if (cat === 'Authentication') setTemplateType('OTP');
    else setTemplateType('CUSTOM');
  };

  const showToast = (message, type = 'success') => {
    if (type === 'success') toast.success(message);
    else toast.error(message);
  };

  const addButton = () => {
    if (buttons.length < 3) {
      setButtons([...buttons, { id: Date.now(), type: 'Visit Website', text: 'New Button', value: '' }]);
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
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 16 * 1024 * 1024; // 16MB max
    if (file.size > maxSize) {
      toast.error('File size must be less than 16MB');
      return;
    }

    const allowedImageTypes = ['image/jpeg', 'image/png'];
    const allowedVideoTypes = ['video/mp4'];
    const allowedDocumentTypes = ['application/pdf'];

    const mediaType = file.type.startsWith('image/')
      ? 'image'
      : file.type.startsWith('video/')
        ? 'video'
        : 'document';

    // WhatsApp strict validation
    if (mediaType === 'image' && !allowedImageTypes.includes(file.type)) {
      toast.error('WhatsApp only supports JPG and PNG images for templates.');
      return;
    }
    if (mediaType === 'video' && !allowedVideoTypes.includes(file.type)) {
      toast.error('WhatsApp only supports MP4 videos for templates.');
      return;
    }
    if (mediaType === 'document' && !allowedDocumentTypes.includes(file.type)) {
      toast.info('WhatsApp needs a PDF for the review sample. We will use a dummy PDF for approval, but you can send your file later!');
      // We don't return here, we let them upload it!
    }

    // Show a local preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      setHeaderMedia({
        file: file,
        preview: event.target?.result,
        type: mediaType,
        name: file.name,
        hostedUrl: null // will be set after upload completes
      });
    };
    reader.readAsDataURL(file);

    // Upload to server and get the public DOCUMENT_GET_URL-based URL
    setIsUploadingMedia(true);
    setUploadProgress(0);
    try {
      const response = await uploadTemplateMedia(file, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
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
        toast.warn('Media selected, but server upload failed. A placeholder URL will be used.');
      }
    } catch (uploadErr) {
      console.error('Template media upload error:', uploadErr);
      toast.warn('Media selected, but server upload failed. A placeholder URL will be used.');
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

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    setNameError(null);
    setTemplateNameSuggestion(null);

    if (!formData.name.trim()) {
      toast.error("Template name is mandatory");
      return;
    }

    // Validate template name length (WhatsApp has higher approval rates with longer names)
    if (formData.name.length < 4) {
      toast.error("Template name must be at least 4 characters");
      return;
    }
    
    // Validate body text is complete
    if (!formData.bodyText.trim()) {
      toast.error("Template body content is mandatory");
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
      toast.error("Template body must be at least 20 characters for better approval rates");
      return;
    }

    // Check for incomplete sentences
    if (bodyText.endsWith('Use') || bodyText.endsWith('Please') || bodyText.endsWith('For')) {
      toast.error("Template body text appears incomplete. Please complete the message.");
      return;
    }

    if (templateVariables.length > 0) {
      const hasMissingSamples = templateVariables.some((id) => !String(bodySamples[id] || '').trim());
      if (hasMissingSamples) {
        toast.error("Please add sample text for all body variables");
        return;
      }
    }

    if (strippedBody.length > 1024) {
      toast.error(`Template body is ${strippedBody.length} characters. WhatsApp allows a maximum of 1024 characters.`);
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
      toast.error("Template name cannot be empty. Please use letters, numbers, or underscores.");
      return;
    }

    if (!/^[a-z0-9_]+$/.test(waName)) {
      toast.error(`Invalid name format. Formatted name "${waName}" contains invalid characters. Use only letters, numbers, and underscores.`);
      return;
    }

    if (waName.length < 4) {
      toast.error(`Template name too short. Formatted name "${waName}" is ${waName.length} chars. Minimum is 4 characters.`);
      return;
    }

    setIsSubmitting(true);

    // Prevent submission if media is still uploading
    const hasMediaHeader = ['Image', 'Video', 'Document'].includes(formData.headerType);
    if (hasMediaHeader && !uploadedMediaUrl && !headerMedia?.hostedUrl) {
      toast.error('Please wait for the media to finish uploading before submitting.');
      setIsSubmitting(false);
      return;
    }

    try {
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
          components.push({ 
            type: 'HEADER', 
            format: 'TEXT', 
            text: (formData.headerText || formData.name || '').substring(0, 60)
          });
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

      if (buttons && buttons.length > 0) {
        const waButtons = buttons.map(b => {
          if (b.type === 'Visit Website' || b.type === 'Visit website') {
            return { type: 'URL', text: b.text, url: b.value };
          }
          if (b.type === 'Call phone number') {
            return { type: 'PHONE_NUMBER', text: b.text, phone_number: b.value };
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
        components: components
      };


      let createdTemplateResponse = null;
      const originalName = typeof templateData?.name === 'string' ? templateData.name : '';
      
      const submitTemplate = async (payload) => {
        if (isEditing && templateData?.id) {
          // Check if template is approved - WhatsApp doesn't allow editing approved templates
          if (templateData?.status?.toUpperCase() === 'APPROVED') {
            throw new Error(
              'This template has been approved by Meta and cannot be edited. '
              + 'To make changes, please duplicate this template to create a new version. '
              + 'Once the new template is approved, you can use it for sending messages.'
            );
          }
          console.log(`Updating existing template: ${originalName} (ID: ${templateData.id})`);
          return await updateWhatsAppTemplate(templateData.id, { 
            components: payload.components,
            category: payload.category
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

        const hasMediaHeader = ['Image', 'Video', 'Document'].includes(formData.headerType);
        const payloadWithoutHeader = {
          ...templatePayload,
          components: templatePayload.components.filter((c) => c.type !== 'HEADER')
        };
        const payloadBodyFooterOnly = {
          ...templatePayload,
          components: templatePayload.components.filter((c) => c.type === 'BODY' || c.type === 'FOOTER')
        };
        const payloadBodyOnlySanitized = {
          ...templatePayload,
          components: [{ type: 'BODY', text: strippedBody }]
        };

        const isInvalidParameterError = (error) =>
          String(
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            ''
          ).toLowerCase().includes('invalid parameter');

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
      showToast(isEditing ? "Template updated successfully!" : "Template submitted successfully to WhatsApp!");
      setTimeout(() => {
        navigate('/admin/templates/list');
      }, 1500);

    } catch (error) {
      console.error("Template Creation Error:", error?.response?.data || error);
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
      
      // Handle specific user-facing errors (like approved template edit attempts)
      if (!error?.response && (error?.code === 'ENOTFOUND' || error?.message?.includes('ENOTFOUND') || error?.message?.includes('getaddrinfo'))) {
        // Network error — server can't reach graph.facebook.com
        errorMessage = 'Cannot reach WhatsApp servers. Please check that the server has a working internet connection and try again.';
        toast.error(errorMessage);
      } else if (error?.message?.includes('This template has been approved by Meta')) {
        errorMessage = 'Approved Template - Cannot Edit\n\n' +
          'WhatsApp does not allow editing templates that have been approved by Meta. ' +
          'To make changes:\n\n' +
          '1. Duplicate this template to create a new version\n' +
          '2. Make your changes in the new template\n' +
          '3. Submit for Meta approval\n' +
          '4. Once approved, use the new template for sending messages';
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
        }
      } else {
        toast.error(errorMessage);
      }
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
      <div className="min-h-screen w-full bg-[#F9FAFB] p-4 md:p-6 lg:p-12 flex flex-col items-center font-sans overflow-x-hidden">
        <div className="text-center w-full max-w-2xl mt-4 md:mt-3 mb-4 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3 tracking-tight">Choose Template Method</h2>
          <p className="text-gray-500 text-sm md:text-base font-medium">Select how you want to create your WhatsApp template</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full max-w-4xl px-2">
          {/* CREATE NEW */}
          <div
            onClick={() => setView('setup')}
            className="flex-1 bg-white p-6 md:p-10 rounded-xl border border-gray-200 hover:border-[#10B981] shadow-sm cursor-pointer group transition-all duration-300 hover:shadow-md"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#10B981] group-hover:text-white transition-all duration-300">
              <Plus size={24}/>
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-800">Create New Template</h3>
            <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
              Build custom templates with full control over design and variables.
            </p>
            <div className="flex items-center text-[#10B981] font-semibold gap-2 text-sm">
              Start Building <ChevronRight size={18}/>
            </div>
          </div>

          {/* GALLERY */}
          <div
            onClick={() => navigate('/admin/templates/gallery')}
            className="flex-1 bg-white p-6 md:p-10 rounded-xl border border-gray-200 hover:border-blue-500 shadow-sm cursor-pointer group transition-all duration-300 hover:shadow-md"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
              <Globe size={24}/>
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-800">Template Gallery</h3>
            <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
              Browse pre-approved templates ready for quick deployment.
            </p>
            <div className="flex items-center text-blue-500 font-semibold gap-2 text-sm">
              Browse Library <ChevronRight size={18}/>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= SETUP / CONTENT UI (UNCHANGED) =================
  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-white overflow-hidden font-sans animate-in fade-in duration-500">
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
                            (formData.category === 'Marketing' ? ['CUSTOM', 'CATALOG', 'LIMITED_TIME_OFFER'] : ['CUSTOM']).map((type) => (
                              <div key={type} onClick={() => setTemplateType(type)} className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${templateType === type ? 'border-2 border-[#10B981] bg-[#F0FDF4]/30' : 'border border-gray-200 bg-white hover:border-gray-300'}`}>
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
                                        {type === 'CUSTOM' ? 'CUSTOM' : type === 'CATALOG' ? 'CATALOG' : 'LIMITED TIME OFFER'}
                                      </span>
                                      <p className="text-[13px] text-gray-500 leading-relaxed">
                                          {type === 'CUSTOM' ? (formData.category === 'Utility' ? 'Send messages about an existing order or account.' : 'Send promotional offers & announcements') 
                                          : type === 'CATALOG' ? 'Display your entire product catalog'
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
                {formData.category !== 'Authentication' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm mt-5">
                    <div className="mb-8 border-b border-gray-100 pb-6">
                        <div className="flex flex-col gap-1 mb-3">
                            <h3 className="text-sm md:text-base font-bold text-gray-800">Header <span className="text-gray-400 font-normal text-sm ml-1">(Optional)</span></h3>
                            <p className="text-xs text-gray-500">Add a title or choose which type of media you&apos;ll use for this header.</p>
                        </div>
                        <select 
                            className="w-full p-4 border border-gray-200 rounded-lg text-sm font-medium outline-none bg-white focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all" 
                            value={formData.headerType} 
                            onChange={(e) => {
                              setFormData({...formData, headerType: e.target.value});
                              // Clear previous media when header type changes
                              setHeaderMedia(null);
                              setUploadedMediaUrl(null);
                              if (headerFileRef.current) {
                                headerFileRef.current.value = '';
                              }
                            }}
                        >
                            <option>None</option>
                            <option>Text</option>
                            <option>Image</option>
                            <option>Video</option>
                            <option>Document</option>
                        </select>

                        {formData.headerType === 'Text' && (
                          <div className="mt-4 space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Header Text</label>
                            <input 
                              type="text" 
                              placeholder="Enter header title..." 
                              value={formData.headerText}
                              onChange={(e) => setFormData({...formData, headerText: e.target.value})}
                              className="w-full p-4 border border-gray-200 rounded-lg outline-none text-sm font-medium focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all" 
                            />
                            <p className="text-[10px] text-gray-400">Max 60 characters. You can use variables like {"{{1}}"} here.</p>
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
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 flex-1">
                                    {headerMedia.type === 'image' && (
                                      <img src={headerMedia.preview} alt="preview" className="h-16 w-16 rounded-lg object-cover"/>
                                    )}
                                    {headerMedia.type === 'video' && (
                                      <video src={headerMedia.preview} className="h-16 w-16 rounded-lg object-cover"/>
                                    )}
                                    {headerMedia.type === 'document' && (
                                      <div className="h-16 w-16 rounded-lg bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs">
                                        {headerMedia.name.split('.').pop().toUpperCase()}
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-gray-800 truncate">{headerMedia.name}</p>
                                      {headerMedia.file && (
                                        <p className="text-xs text-gray-500">{(headerMedia.file.size / 1024 / 1024).toFixed(2)} MB</p>
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
                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 size={18}/>
                                  </button>
                                </div>
                                <button 
                                  type="button"
                                  onClick={triggerHeaderMediaPicker}
                                  className="w-full p-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                              <label className="w-16 text-sm font-semibold text-gray-700">{`{{${variableId}}}`}</label>
                              <input
                                type="text"
                                value={bodySamples[variableId] || ''}
                                onChange={(e) => handleBodySampleChange(variableId, e.target.value)}
                                placeholder={`Enter content for {{${variableId}}}`}
                                className="flex-1 p-3 border border-gray-200 rounded-lg text-sm font-medium bg-white outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all"
                              />
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
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm md:text-base font-bold text-gray-800">Buttons </h3>
                            <button onClick={addButton} disabled={buttons.length >= 3} className="text-xs font-bold text-blue-600 flex items-center gap-1.5 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-all disabled:opacity-30">
                                <Plus size={14}/> Add New
                            </button>
                        </div>
                        <div className="space-y-4">
                            {buttons.map((btn) => (
                                <div key={btn.id} className="p-4 md:p-5 bg-white border border-gray-200 rounded-xl flex items-center gap-4 relative group hover:border-gray-300 transition-all shadow-sm">
                                    <div className={`grid grid-cols-1 ${btn.type === 'Call phone number' ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4 md:gap-6 flex-1`}>
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-600 block mb-2 uppercase tracking-wide">Type of Action</label>
                                            <select 
                                              value={btn.type}
                                              onChange={(e) => updateButton(btn.id, 'type', e.target.value)}
                                              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-semibold bg-white outline-none focus:border-blue-400 transition-all cursor-pointer"
                                            >
                                              <option>Visit website</option>
                                              <option>Call phone number</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-600 block mb-2 uppercase tracking-wide">Button Text</label>
                                            <div className="relative">
                                              <input 
                                                type="text" 
                                                value={btn.text} 
                                                onChange={(e) => updateButton(btn.id, 'text', e.target.value)}
                                                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-semibold bg-white outline-none focus:border-blue-400 transition-all" 
                                                placeholder="Visit website"
                                              />
                                            </div>
                                        </div>
                                        
                                        {btn.type === 'Call phone number' ? (
                                          <>
                                            <div>
                                                <label className="text-[11px] font-bold text-gray-600 block mb-2 uppercase tracking-wide">Country</label>
                                                <select className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-semibold bg-white outline-none focus:border-blue-400 transition-all cursor-pointer">
                                                  <option>+91</option>
                                                  <option>+1</option>
                                                  <option>+44</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-bold text-gray-600 block mb-2 uppercase tracking-wide">Phone Number</label>
                                                <div className="relative">
                                                  <input 
                                                    type="text" 
                                                    value={btn.value} 
                                                    onChange={(e) => updateButton(btn.id, 'value', e.target.value)}
                                                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-semibold bg-white outline-none focus:border-blue-400 transition-all" 
                                                    placeholder="Mobile Number"
                                                  />
                                                </div>
                                            </div>
                                          </>
                                        ) : (
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
                    </div>
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

const MobilePreview = ({ name, body, footer, showImage = false, offer = "", isLimited = false, buttons = [], headerMedia = null, headerType = 'None', isSetupView = false }) => {
  if (isSetupView) {
    return (
      <div className="relative w-[320px] h-[640px] bg-white rounded-[3rem] border-[14px] border-[#1e293b] shadow-2xl overflow-hidden font-sans flex flex-col items-center">
        {/* Notch */}
        <div className="absolute top-0 w-36 h-[28px] bg-[#1e293b] rounded-b-[20px] z-20 flex justify-center">
           <div className="w-14 h-1.5 bg-white/20 rounded-full mt-2"></div>
        </div>
        
        {/* Screen Background */}
        <div className="w-full h-full bg-[#e5ddd5] pt-14 pb-6 px-4 overflow-y-auto custom-scrollbar flex flex-col">
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
    <div className="relative w-[320px] h-[640px] bg-white rounded-[3rem] border-[14px] border-[#1e293b] shadow-2xl overflow-hidden font-sans flex flex-col items-center">
      {/* Notch */}
      <div className="absolute top-0 w-36 h-[28px] bg-[#1e293b] rounded-b-[20px] z-20 flex justify-center">
         <div className="w-14 h-1.5 bg-white/20 rounded-full mt-2"></div>
      </div>
      
      {/* Screen Background */}
      <div className="w-full h-full bg-[#e5ddd5] pt-14 pb-6 px-4 overflow-y-auto custom-scrollbar flex flex-col">
         {/* Message Bubble Card */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mt-2 flex flex-col w-full shrink-0">
            {showImage && (
              <div className="w-full relative overflow-hidden bg-gray-50 shrink-0">
                {headerMedia ? (
                  <>
                    {headerMedia.type === 'image' && (
                      <img src={headerMedia.preview} alt="header" className="w-full h-36 object-contain bg-gray-50"/>
                    )}
                    {headerMedia.type === 'video' && (
                      <video src={headerMedia.preview} className="w-full h-36 object-contain bg-gray-50" controls={false}/>
                    )}
                    {headerMedia.type === 'document' && (
                      <div className="w-full h-36 bg-red-50 flex items-center justify-center flex-col gap-2">
                        <div className="text-3xl font-bold text-red-600">{headerMedia.name.split('.').pop().toUpperCase()}</div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-36 bg-gray-100 flex items-center justify-center text-gray-400">
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
            
            {buttons && buttons.length > 0 && (
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