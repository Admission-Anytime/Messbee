/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RotateCw, ArrowLeft, Image as ImageIcon, Send, Plus, ChevronRight, ExternalLink, Trash2, Globe, CheckCircle2, X, Clock, Bold, Italic, Link2, Strikethrough, Smile, Info } from 'lucide-react';
import { toast } from 'react-toastify';

const Templates = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ KEY FIX: gallery vs direct create
  const [view, setView] = useState(
    location.state?.editTemplate ? 'content' : (location.state?.fromGallery ? 'setup' : 'choose')
  );

  const [templateType, setTemplateType] = useState('CUSTOM');
  const [buttons, setButtons] = useState([{ id: 1, type: 'Visit Website', text: 'Visit website', value: 'https://example.com' }]);
  const editorRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const EMOJIS = [
    '😀','😂','🥰','😍','🤩','😊','🎉','🔥',
    '❤️','👋','💪','✅','⭐','🚀','💡','🎯',
    '📢','📱','💰','🛒','🎁','👍','🙏','💬',
    '📧','⚡','🌟','🏆','💎','🤝','📞','🎊',
  ];

  // Initialize editor with bodyText on mount
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = formData.bodyText;
      setCharCount(editorRef.current.innerText.length);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]); // re-run when view changes so editor always has initial content

  const syncEditorContent = () => {
    if (!editorRef.current) return;
    const plain = editorRef.current.innerText;
    if (plain.length <= 1024) {
      setCharCount(plain.length);
      setFormData(prev => ({ ...prev, bodyText: editorRef.current.innerHTML }));
    } else {
      // truncate — restore selection to end
      editorRef.current.innerText = plain.slice(0, 1024);
      setCharCount(1024);
    }
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
    category: 'Marketing',
    name: '',
    language: 'English (US)',
    offerTitle: '20% OFF',
    headerType: 'Image',
    bodyText: 'Hello {{1}}, our Summer Sale is now live! Use code BUYONEGETONE for 50% off. Shop now!',
    footerText: 'Reply STOP to opt out',
    expirationDate: '24h',
  });

  const handleCategoryChange = (cat) => {
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
      setButtons([...buttons, { id: Date.now(), type: 'Visit Website', text: 'New Button', url: '' }]);
    }
  };

  const removeButton = (id) => {
    setButtons(buttons.filter(btn => btn.id !== id));
    showToast("Button deleted successfully", "error");
  };

  const updateButton = (id, field, value) => {
    setButtons(buttons.map(btn => btn.id === id ? { ...btn, [field]: value } : btn));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error("Template name is mandatory");
      return;
    }
    
    // Save to localStorage for demo persistence
    const newTemplate = {
      id: 'tmp_' + Date.now(),
      name: formData.name,
      category: formData.category,
      updated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Pending',
      lang: 'EN',
      bodyText: formData.bodyText
    };
    
    const existingTemplates = JSON.parse(localStorage.getItem('custom_templates') || '[]');
    localStorage.setItem('custom_templates', JSON.stringify([...existingTemplates, newTemplate]));

    showToast("Template submitted successfully!");
    // Redirect to Template List after short delay
    setTimeout(() => {
      navigate('/admin/templates/list');
    }, 1500);
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
            <button onClick={() => setView('choose')} className="flex items-center gap-2 text-gray-500 font-semibold hover:text-gray-800 text-sm transition-colors">
                <ArrowLeft size={16}/> Back
            </button>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {view === 'setup' ? 'Step 1 of 2: Setup' : 'Step 2 of 2: Content'}
            </div>
          </div>

          {view === 'setup' ? (
            <div className="space-y-5">
                <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-200 shadow-sm space-y-4 md:space-y-5">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Set Up Your Template</h2>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Choose Category</label>
                        <div className="bg-gray-50 p-1 rounded-xl flex flex-wrap gap-1 border border-gray-100">
                            {['Marketing', 'Utility', 'Authentication'].map(cat => (
                                <button key={cat} onClick={() => handleCategoryChange(cat)} className={`flex-1 min-w-[100px] py-3 md:py-4 px-3 rounded-lg flex items-center justify-center gap-2 text-xs md:text-sm font-semibold transition-all ${formData.category === cat ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}>
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
                            <input type="text" placeholder="Enter template name..." className="w-full p-4 md:p-5 border border-gray-200 rounded-lg outline-none text-sm font-medium bg-white focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 transition-all" onChange={(e) => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Languages</label>
                            <select className="w-full p-4 md:p-5 border border-gray-200 rounded-lg bg-white outline-none text-sm font-medium appearance-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 transition-all"><option>English (US)</option><option>Hindi</option></select>
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
                {(formData.category === 'Marketing' || templateType === 'LIMITED_TIME_OFFER') && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-green-50 text-green-600 rounded-lg flex items-center justify-center"><Clock size={14}/></div>
                        <h3 className="text-sm md:text-base font-semibold text-gray-800">Template name and language</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Name your template</label>
                            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-4 border border-gray-200 rounded-lg text-sm font-medium bg-white outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 transition-all" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Select language</label>
                            <select className="w-full p-4 border border-gray-200 rounded-lg text-sm font-medium bg-white outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 transition-all" value={formData.language} onChange={(e) => setFormData({...formData, language: e.target.value})}>
                                <option>English (US)</option>
                                <option>Hindi</option>
                            </select>
                        </div>
                    </div>
                </div>
                )}
                {formData.category !== 'Authentication' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm mt-5">
                    <div className="mb-8 border-b border-gray-100 pb-6">
                        <div className="flex flex-col gap-1 mb-3">
                            <h3 className="text-sm md:text-base font-bold text-gray-800">Header <span className="text-gray-400 font-normal text-sm ml-1">(Optional)</span></h3>
                            <p className="text-xs text-gray-500">Add a title or choose which type of media you'll use for this header.</p>
                        </div>
                        <select 
                            className="w-full p-4 border border-gray-200 rounded-lg text-sm font-medium outline-none bg-white focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 transition-all" 
                            value={formData.headerType} 
                            onChange={(e) => setFormData({...formData, headerType: e.target.value})}
                        >
                            <option>None</option>
                            <option>Text</option>
                            <option>Image</option>
                            <option>Video</option>
                            <option>Document</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1 mb-3">
                        <h3 className="text-sm md:text-base font-bold text-gray-800">Body</h3>
                        <p className="text-xs text-gray-500">Enter the text for your message in the language that you've selected.</p>
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

                    <div className="pt-8 border-t border-gray-100 mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm md:text-base font-bold text-gray-800">Call to action</h3>
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
                    <button onClick={() => setView('setup')} className="text-gray-500 font-semibold text-sm hover:text-gray-800 transition-colors px-4 py-2 order-2 sm:order-1">Previous Step</button>
                    <button onClick={handleSubmit} className="w-full sm:w-auto bg-[#10B981] text-white px-10 md:px-14 py-3 md:py-4 rounded-lg font-semibold text-sm shadow-sm hover:bg-[#059669] transition-all order-1 sm:order-2">Submit Template</button>
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
                showImage={formData.category !== 'Authentication'} 
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

const MobilePreview = ({ name, body, footer, showImage = false, offer = "", isLimited = false, buttons = [] }) => (
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
            <div className="h-32 md:h-36 bg-gray-50 flex flex-col items-center justify-center text-gray-300 gap-1 border-b border-dashed relative">
                {offer && <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-[#10B981] text-white text-xs font-bold px-2 md:px-3 py-1 md:py-1.5 rounded-lg shadow-md">{offer}</div>}
                <ImageIcon size={32} className="opacity-20"/><span className="text-xs font-bold uppercase opacity-30">Media Header</span>
            </div>
          )}
          <div className="p-4 md:p-5">
            <p className="text-xs text-[#10B981] font-bold mb-2 uppercase tracking-wide">[{name || 'TEMPLATE_NAME'}]</p>
            <p className="text-sm md:text-base text-gray-700 font-medium leading-relaxed mb-3 whitespace-pre-line">{body}</p>
            
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

export default Templates;