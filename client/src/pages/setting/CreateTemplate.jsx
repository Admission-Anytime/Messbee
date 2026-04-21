/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RotateCw, ArrowLeft, Image as ImageIcon, Send, Plus, ChevronRight, ExternalLink, Trash2, Globe, X, Clock, Bold, Italic, Link2, Strikethrough, Smile, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { createWhatsAppTemplate, updateWhatsAppTemplate, saveTemplateHeaderPreview } from '../../services/TemplateApi';
import { formatWhatsAppMarkdown } from '../../utils/markdownParser';
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
          preview: location.state.templateData.headerMediaUrl, 
          type: location.state.templateData.headerType?.toLowerCase() || 'image',
          name: 'Existing Media'
        } 
      : null
  );
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

  const handleHeaderMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 16 * 1024 * 1024; // 16MB max
    if (file.size > maxSize) {
      toast.error("File size must be less than 16MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setHeaderMedia({
        file: file,
        preview: event.target?.result,
        type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document',
        name: file.name
      });
    };
    reader.readAsDataURL(file);
    toast.success("Media uploaded successfully!");
  };

  const removeHeaderMedia = () => {
    setHeaderMedia(null);
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

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

    try {
      const components = [];
      const mediaHeaderExamples = {
        Image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
        Video: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
        Document: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      };
      
      // Add HEADER component only if valid
      if (formData.headerType && formData.headerType !== 'None') {
        if (formData.headerType === 'Text') {
          // TEXT header format: just type, format, and text
          components.push({ 
            type: 'HEADER', 
            format: 'TEXT', 
            text: formData.name.substring(0, 60) // Max 60 chars for header
          });
        } else if (formData.headerType === 'Image') {
          // Keep media header payload minimal; invalid sample handles/URLs often trigger
          // WhatsApp "Invalid parameter" on creation.
          components.push({ 
            type: 'HEADER', 
            format: 'IMAGE',
            example: { header_url: [mediaHeaderExamples.Image] }
          });
        } else if (formData.headerType === 'Video') {
          // Keep media header payload minimal; invalid sample handles/URLs often trigger
          // WhatsApp "Invalid parameter" on creation.
          components.push({ 
            type: 'HEADER', 
            format: 'VIDEO',
            example: { header_url: [mediaHeaderExamples.Video] }
          });
        } else if (formData.headerType === 'Document') {
          // Keep media header payload minimal; invalid sample handles/URLs often trigger
          // WhatsApp "Invalid parameter" on creation.
          components.push({ 
            type: 'HEADER', 
            format: 'DOCUMENT',
            example: { header_url: [mediaHeaderExamples.Document] }
          });
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
          console.log(`Updating existing template: ${originalName} (ID: ${templateData.id})`);
          return await updateWhatsAppTemplate(templateData.id, { components: payload.components });
        }
        
        console.log(`Creating new template: ${waName}`);
        return await createWhatsAppTemplate(payload);
      };

      try {
        createdTemplateResponse = await submitTemplate(templatePayload);
      } catch (primaryError) {
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

        let recovered = false;

        if (hasMediaHeader) {
          try {
            console.warn('⚠️ Media header template creation failed, retrying without HEADER component');
            createdTemplateResponse = await submitTemplate(payloadWithoutHeader);
            toast.warn('Template saved without media header sample due to WhatsApp validation constraints.');
            recovered = true;
          } catch (errorWithoutHeader) {
            primaryError = errorWithoutHeader;
          }
        }

        if (!recovered && isInvalidParameterError(primaryError)) {
          try {
            console.warn('⚠️ Invalid parameter from WhatsApp API, retrying with BODY/FOOTER only');
            createdTemplateResponse = await submitTemplate(payloadBodyFooterOnly);
            toast.warn('Template saved with simplified components due to WhatsApp parameter validation.');
            recovered = true;
          } catch (errorBodyFooter) {
            primaryError = errorBodyFooter;
          }
        }

        if (!recovered && isInvalidParameterError(primaryError)) {
          try {
            console.warn('⚠️ Invalid parameter persists, retrying with sanitized BODY-only payload');
            createdTemplateResponse = await submitTemplate(payloadBodyOnlySanitized);
            toast.warn('Template saved with BODY-only payload due to WhatsApp parameter validation.');
            recovered = true;
          } catch (errorBodyOnly) {
            primaryError = errorBodyOnly;
          }
        }

        if (!recovered) {
          throw primaryError;
        }
      }

      if (['Image', 'Video', 'Document'].includes(formData.headerType)) {
        const actualCreatedName =
          createdTemplateResponse?.templateName ||
          createdTemplateResponse?.data?.name ||
          waName;
        const previewByType = {
          Image: headerMedia?.preview || mediaHeaderExamples.Image,
          Video: headerMedia?.preview || mediaHeaderExamples.Video,
          Document: headerMedia?.preview || mediaHeaderExamples.Document
        };

        saveTemplateHeaderPreview(actualCreatedName, {
          url: previewByType[formData.headerType],
          type: formData.headerType
        });
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
      const errorSubcode = waError?.errorSubcode ?? waError?.error_subcode;
      const errorMsg =
        waError?.message ||
        nestedWaError?.message ||
        waError?.error_user_msg ||
        nestedWaError?.error_user_msg ||
        waError?.error_data?.details ||
        nestedWaError?.error_data?.details ||
        error?.response?.data?.message;
      const suggestedName = waError?.suggestedName;
      
      // Default error message
      let errorMessage =
        errorMsg ||
        error?.response?.data?.message ||
        "Failed to create template on WhatsApp. Please try again.";
      
      // Handle specific WhatsApp error codes with actionable guidance
      if (errorSubcode === 2388023) {
        errorMessage = `Template language is being deleted on WhatsApp for this name. Please wait 1-3 minutes and retry with the same name.${suggestedName ? `\n\nSuggested alternate name (manual): ${suggestedName}` : ''}`;
      } else if (errorSubcode === 2388024) {
        errorMessage = `Template content already exists in this language for the same name.${suggestedName ? `\n\nTry this alternate name: ${suggestedName}` : '\n\nPlease change template name and retry.'}`;
      }
      
      toast.error(errorMessage);
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
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Choose Category</label>
                        <div className="bg-gray-50 p-1 rounded-xl flex flex-wrap gap-1 border border-gray-100">
                            {['Marketing', 'Utility', 'Authentication'].map(cat => (
                                <button 
                                  key={cat} 
                                  onClick={() => handleCategoryChange(cat)} 
                                  className={`flex-1 min-w-[100px] py-3 md:py-4 px-3 rounded-lg flex items-center justify-center gap-2 text-xs md:text-sm font-semibold transition-all ${formData.category === cat ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {cat === 'Marketing' && <Send size={12}/>} {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        {formData.category === 'Authentication' ? (
                            <div className="p-4 md:p-5 border-2 rounded-xl border-[#10B981] bg-green-50/20">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                                    <span className="text-sm md:text-base font-semibold text-gray-800">One-time Passcode</span>
                                </div>
                                <p className="text-xs md:text-sm text-gray-500 font-medium ml-6">Send codes to verify a transaction or login.</p>
                            </div>
                        ) : (
                            (formData.category === 'Marketing' ? ['CUSTOM', 'CATALOG', 'LIMITED_TIME_OFFER'] : ['CUSTOM']).map((type) => (
                              <div key={type} onClick={() => setTemplateType(type)} className={`p-4 md:p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 ${templateType === type ? 'border-[#10B981] bg-green-50/20' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                                <div className="flex items-center gap-3 mb-1">
                                    <div className={`w-3 h-3 rounded-full transition-all ${templateType === type ? 'bg-[#10B981] scale-110' : 'bg-gray-200'}`}></div>
                                    <span className="text-sm md:text-base font-semibold text-gray-800">{type.replace(/_/g, ' ')}</span>
                                </div>
                                <p className="text-xs md:text-sm text-gray-500 font-medium ml-6">
                                    {type === 'CUSTOM' ? (formData.category === 'Utility' ? 'Send messages about an existing order or account.' : 'Send promotional offers & announcements.') 
                                    : type === 'CATALOG' ? 'Display your entire product catalog.'
                                    : 'Send an offer with a countdown timer to drive urgency.'}
                                </p>
                              </div>
                            ))
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Template Name</label>
                            <input 
                              type="text" 
                              placeholder="Enter template name..." 
                              disabled={isEditing}
                              value={typeof formData.name === 'string' ? formData.name : (formData.name?.name || '')}
                              className={`w-full p-4 md:p-5 border border-gray-200 rounded-lg outline-none text-sm font-medium focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 transition-all ${isEditing ? 'bg-gray-100 cursor-not-allowed opacity-75' : 'bg-white'}`} 
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
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Languages</label>
                            <select 
                              disabled={isEditing}
                              className={`w-full p-4 md:p-5 border border-gray-200 rounded-lg outline-none text-sm font-medium appearance-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 transition-all ${isEditing ? 'bg-gray-100 cursor-not-allowed opacity-75' : 'bg-white'}`} 
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
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Name your template</label>
                            <input 
                              type="text" 
                              disabled={isEditing}
                              value={typeof formData.name === 'string' ? formData.name : (formData.name?.name || '')}
                              onChange={(e) => setFormData({...formData, name: e.target.value})} 
                              className={`w-full p-4 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 transition-all ${isEditing ? 'bg-gray-100 cursor-not-allowed opacity-75' : 'bg-white'}`} 
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Select language</label>
                            <select 
                              disabled={isEditing}
                              className={`w-full p-4 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 transition-all ${isEditing ? 'bg-gray-100 cursor-not-allowed opacity-75' : 'bg-white'}`} 
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
                            className="w-full p-4 border border-gray-200 rounded-lg text-sm font-medium outline-none bg-white focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 transition-all" 
                            value={formData.headerType} 
                            onChange={(e) => {
                              setFormData({...formData, headerType: e.target.value});
                              // Clear previous media when header type changes
                              setHeaderMedia(null);
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

                        {formData.headerType !== 'None' && formData.headerType !== 'Text' && (
                          <div className="mt-6 space-y-4">
                            <input 
                              ref={headerFileRef}
                              type="file" 
                              hidden 
                              accept={formData.headerType === 'Image' ? 'image/*' : formData.headerType === 'Video' ? 'video/*' : '*'}
                              onChange={handleHeaderMediaUpload}
                            />
                            {!headerMedia ? (
                              <div 
                                onClick={triggerHeaderMediaPicker}
                                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#10B981] hover:bg-green-50/30 transition-all duration-300"
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <ImageIcon size={32} className="text-gray-400"/>
                                  <p className="text-sm font-semibold text-gray-700">Click to upload {formData.headerType.toLowerCase()}</p>
                                  <p className="text-xs text-gray-500">Max 16MB • {formData.headerType === 'Image' ? 'PNG, JPG, GIF' : formData.headerType === 'Video' ? 'MP4, WebM' : 'PDF, DOCX, XLSX'}</p>
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
                                      <p className="text-xs text-gray-500">{(headerMedia.file.size / 1024 / 1024).toFixed(2)} MB</p>
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
                                className="flex-1 p-3 border border-gray-200 rounded-lg text-sm font-medium bg-white outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 transition-all"
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
              />
            </div>
        </div>
      </div>
    </div>
  );
};

const MobilePreview = ({ name, body, footer, showImage = false, offer = "", isLimited = false, buttons = [], headerMedia = null, headerType = 'None' }) => (
  <div className="relative w-[300px] h-[580px] bg-[#0F172A] rounded-[3.5rem] border-[12px] border-[#1e293b] shadow-[0_50px_100px_rgba(0,0,0,0.15)] overflow-hidden font-sans">
    <div className="h-full bg-[#E5DDD5] pt-10">
      <div className="bg-[#075E54] p-5 flex items-center gap-3">
        <div className="w-9 h-9 bg-white/20 rounded-full border border-white/10" />
        <div className="text-white">
          <p className="text-sm font-bold leading-none">WhatsApp Business</p>
          <p className="text-[10px] opacity-60 font-semibold uppercase mt-1">online</p>
        </div>
      </div>
      <div className="p-4 overflow-y-auto max-h-[460px]">
        <div className="bg-white rounded-[1.25rem] rounded-tl-none shadow-lg overflow-hidden border border-gray-200/50">
          {showImage && (
            <>
              {headerMedia ? (
                <div className="relative bg-gray-900 flex items-center justify-center overflow-hidden">
                  {headerMedia.type === 'image' && (
                    <img src={headerMedia.preview} alt="header" className="w-full h-40 object-cover"/>
                  )}
                  {headerMedia.type === 'video' && (
                    <video src={headerMedia.preview} className="w-full h-40 object-cover" controls={false}/>
                  )}
                  {headerMedia.type === 'document' && (
                    <div className="w-full h-40 bg-red-50 flex items-center justify-center flex-col gap-2">
                      <div className="text-4xl font-bold text-red-600">{headerMedia.name.split('.').pop().toUpperCase()}</div>
                      <p className="text-xs text-gray-600">{headerMedia.name}</p>
                    </div>
                  )}
                  {offer && <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-[#10B981] text-white text-xs font-bold px-2 md:px-3 py-1 md:py-1.5 rounded-lg shadow-md">{offer}</div>}
                </div>
              ) : (
                <div className="h-32 md:h-36 bg-gray-50 flex flex-col items-center justify-center text-gray-300 gap-1 border-b border-dashed relative">
                  {offer && <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-[#10B981] text-white text-xs font-bold px-2 md:px-3 py-1 md:py-1.5 rounded-lg shadow-md">{offer}</div>}
                  {headerType === 'Image' && (
                    <>
                      <ImageIcon size={32} className="opacity-20"/>
                      <span className="text-xs font-bold uppercase opacity-30">Image Preview</span>
                    </>
                  )}
                  {headerType === 'Video' && (
                    <>
                      <div className="text-3xl opacity-20">▶️</div>
                      <span className="text-xs font-bold uppercase opacity-30">Video Preview</span>
                    </>
                  )}
                  {headerType === 'Document' && (
                    <>
                      <div className="text-3xl opacity-20">📄</div>
                      <span className="text-xs font-bold uppercase opacity-30">Document Preview</span>
                    </>
                  )}
                  {(headerType === 'None' || headerType === 'Text') && (
                    <>
                      <ImageIcon size={32} className="opacity-20"/>
                      <span className="text-xs font-bold uppercase opacity-30">Media Header</span>
                    </>
                  )}
                </div>
              )}
            </>
          )}
          <div className="p-4 md:p-5">
            <p className="text-xs text-[#10B981] font-bold mb-2 uppercase tracking-wide">[{name || 'TEMPLATE_NAME'}]</p>
            <div className="text-sm md:text-base text-gray-700 font-medium leading-relaxed mb-3 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: formatWhatsAppMarkdown(body) }}></div>
            
            {isLimited && (
                <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-red-500">Offer expires in:</span>
                    <span className="text-xs font-bold text-red-600 bg-white px-2 py-1 rounded-md shadow-sm">23:59:59</span>
                </div>
            )}

            {footer && <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100 font-medium italic">{footer}</p>}
          </div>
          {buttons.length > 0 && buttons.map(btn => (
            <div key={btn.id} className="bg-gray-50 p-2 border-t border-gray-100">
               <button className="text-sm text-blue-500 font-bold flex items-center justify-center gap-2 w-full py-2.5 md:py-3 bg-white rounded-xl shadow-sm border border-gray-100">
                  <ExternalLink size={14}/> {btn.text}
               </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default CreateTemplate;