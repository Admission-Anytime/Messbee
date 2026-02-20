import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RotateCw, ArrowLeft, Image as ImageIcon, Send, Plus, ChevronRight, ExternalLink, Trash2, Globe, CheckCircle2, X, Clock } from 'lucide-react';

const Templates = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ KEY FIX: gallery vs direct create
  const [view, setView] = useState(
    location.state?.fromGallery ? 'setup' : 'choose'
  );

  const [templateType, setTemplateType] = useState('CUSTOM');
  const [buttons, setButtons] = useState([{ id: 1, type: 'Visit Website', text: 'Visit website', url: 'https://example.com' }]);
  const [toast, setToast] = useState(null);

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
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
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

  const handleSubmit = () => {
    showToast("Template submitted successfully!");
  };

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const Toast = () => (
    <div className={`fixed top-4 md:top-10 right-4 md:right-10 z-[100] flex items-center gap-3 px-4 md:px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right duration-300 bg-white ${toast.type === 'success' ? 'border-green-100 text-green-600' : 'border-red-100 text-red-500'}`}>
      {toast.type === 'success' ? <CheckCircle2 size={20} /> : <Trash2 size={20} />}
      <p className="font-bold text-[11px] md:text-[13px] tracking-tight uppercase">{toast.message}</p>
      <button onClick={() => setToast(null)} className="ml-4 opacity-40 hover:opacity-100"><X size={16}/></button>
    </div>
  );

  // ================= CHOOSE SCREEN =================
  if (view === 'choose') {
    return (
      <div className="min-h-screen w-full bg-[#f8fafc] p-4 md:p-6 lg:p-12 flex flex-col items-center font-['Inter'] overflow-x-hidden">
        {toast && <Toast />}
        <div className="text-center w-full max-w-2xl mt-8 md:mt-12 mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-[900] text-slate-900 mb-3 tracking-tighter">Choose template method</h2>
          <p className="text-slate-400 text-[10px] md:text-xs font-[800] uppercase tracking-[0.2em] opacity-80">Custom built or library presets</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full max-w-4xl px-2">
          {/* CREATE NEW */}
          <div
            onClick={() => setView('setup')}
            className="flex-1 bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-2 border-transparent hover:border-[#25D366] shadow-[0_20px_50px_rgba(0,0,0,0.05)] cursor-pointer group transition-all duration-500 transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mb-6 md:mb-8 group-hover:bg-[#25D366] group-hover:text-white transition-all duration-500 shadow-inner">
              <Plus size={28}/>
            </div>
            <h3 className="text-xl md:text-2xl font-[900] mb-3 text-slate-800 uppercase tracking-tighter">Create new template</h3>
            <p className="text-slate-400 text-[10px] md:text-[11px] font-[700] mb-8 md:mb-10 leading-relaxed tracking-wide uppercase">
              Full control over design and custom variables.
            </p>
            <div className="flex items-center text-[#25D366] font-[900] gap-2 uppercase text-[11px] md:text-[12px] tracking-[0.15em]">
              Start Building <ChevronRight size={18}/>
            </div>
          </div>

          {/* GALLERY */}
          <div
            onClick={() => navigate('/admin/templates/gallery')}
            className="flex-1 bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-2 border-transparent hover:border-blue-500 shadow-[0_20px_50px_rgba(0,0,0,0.05)] cursor-pointer group transition-all duration-500 transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 md:mb-8 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 shadow-inner">
              <Globe size={28}/>
            </div>
            <h3 className="text-xl md:text-2xl font-[900] mb-3 text-slate-800 uppercase tracking-tighter">Template Gallery</h3>
            <p className="text-slate-400 text-[10px] md:text-[11px] font-[700] mb-8 md:mb-10 leading-relaxed tracking-wide uppercase">
              Pre-approved layouts for high conversion.
            </p>
            <div className="flex items-center text-blue-500 font-[900] gap-2 uppercase text-[11px] md:text-[12px] tracking-[0.15em]">
              Browse Library <ChevronRight size={18}/>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= SETUP / CONTENT UI (UNCHANGED) =================
  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-white overflow-hidden font-['Inter'] animate-in fade-in duration-500">
      {toast && <Toast />}
      {/* REST OF YOUR ORIGINAL FILE BELOW — 100% SAME */}

      
      {/* Scrollable Form Container */}
      <div className="flex-1 p-4 md:p-6 lg:p-10 overflow-y-auto border-r border-slate-100 bg-[#F8FAFC]">
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setView('choose')} className="flex items-center gap-2 text-slate-400 font-[900] hover:text-black text-[10px] tracking-[0.2em] transition-colors">
                <ArrowLeft size={14}/> BACK
            </button>
            <div className="text-[9px] md:text-[10px] font-[900] text-slate-300 tracking-[0.2em] uppercase">
                {view === 'setup' ? 'STEP 1 OF 2: SETUP' : 'STEP 2 OF 2: CONTENT'}
            </div>
          </div>

          {view === 'setup' ? (
            <div className="space-y-6">
                <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-200 shadow-sm space-y-6 md:space-y-8">
                    <h2 className="text-2xl md:text-3xl font-[900] text-slate-900 tracking-tighter">Set up your template</h2>
                    <div className="space-y-3">
                        <label className="text-[10px] font-[900] text-slate-400 uppercase tracking-[0.2em]">Choose Category</label>
                        <div className="bg-slate-50 p-1 rounded-[1.25rem] flex flex-wrap gap-1 border border-slate-100">
                            {['Marketing', 'Utility', 'Authentication'].map(cat => (
                                <button key={cat} onClick={() => handleCategoryChange(cat)} className={`flex-1 min-w-[100px] py-3 md:py-4 px-3 rounded-xl flex items-center justify-center gap-2 text-[10px] md:text-[11px] font-[900] tracking-tight transition-all ${formData.category === cat ? 'bg-white shadow-md text-slate-900' : 'text-slate-400'}`}>
                                    {cat === 'Marketing' && <Send size={12}/>} {cat.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        {formData.category === 'Authentication' ? (
                            <div className="p-4 md:p-6 border-2 rounded-2xl md:rounded-3xl border-[#25D366] bg-green-50/20">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="w-3 h-3 rounded-full bg-[#25D366] shadow-[0_0_10px_rgba(37,211,102,0.4)]"></div>
                                    <span className="text-xs md:text-sm font-[900] text-slate-800 uppercase tracking-widest">One-time Passcode</span>
                                </div>
                                <p className="text-[10px] md:text-[11px] text-slate-400 font-[700] uppercase tracking-wide ml-6">Send codes to verify a transaction or login.</p>
                            </div>
                        ) : (
                            (formData.category === 'Marketing' ? ['CUSTOM', 'CATALOG', 'LIMITED_TIME_OFFER'] : ['CUSTOM']).map((type) => (
                              <div key={type} onClick={() => setTemplateType(type)} className={`p-4 md:p-6 border-2 rounded-2xl md:rounded-3xl cursor-pointer transition-all duration-300 ${templateType === type ? 'border-[#25D366] bg-green-50/20' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                                <div className="flex items-center gap-3 mb-1">
                                    <div className={`w-3 h-3 rounded-full transition-all ${templateType === type ? 'bg-[#25D366] scale-110 shadow-[0_0_10px_rgba(37,211,102,0.4)]' : 'bg-slate-200'}`}></div>
                                    <span className="text-xs md:text-sm font-[900] text-slate-800 uppercase tracking-widest">{type.replace(/_/g, ' ')}</span>
                                </div>
                                <p className="text-[10px] md:text-[11px] text-slate-400 font-[700] uppercase tracking-wide ml-6">
                                    {type === 'CUSTOM' ? (formData.category === 'Utility' ? 'Send messages about an existing order or account.' : 'Send promotional offers & announcements.') 
                                    : type === 'CATALOG' ? 'Display your entire product catalog.'
                                    : 'Send an offer with a countdown timer to drive urgency.'}
                                </p>
                              </div>
                            ))
                        )}
                    </div>
                    <div className="space-y-3 pt-4">
                        <label className="text-[10px] font-[900] text-slate-400 uppercase tracking-[0.2em]">Template Name</label>
                        <input type="text" placeholder="ENTER NAME..." className="w-full p-4 md:p-5 border-2 border-slate-50 rounded-xl md:rounded-2xl outline-none text-xs font-[800] bg-slate-50/30 focus:border-green-100 transition-all uppercase" onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-[900] text-slate-400 uppercase tracking-[0.2em]">Languages</label>
                        <select className="w-full p-4 md:p-5 border-2 border-slate-50 rounded-xl md:rounded-2xl bg-white outline-none text-xs font-[800] appearance-none uppercase tracking-widest"><option>ENGLISH (US)</option><option>HINDI</option></select>
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <button onClick={() => setView('content')} className="w-full md:w-auto bg-[#25D366] text-white px-14 py-4 md:py-5 rounded-xl md:rounded-[1.5rem] font-[900] text-xs shadow-xl shadow-green-100 hover:bg-[#1fb855] transition-all tracking-[0.2em]">CONTINUE</button>
                </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                {(formData.category === 'Marketing' || templateType === 'LIMITED_TIME_OFFER') && (
                <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 p-6 md:p-8 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-green-100 text-green-600 rounded-lg flex items-center justify-center shadow-sm"><Clock size={14}/></div>
                        <h3 className="text-xs md:text-sm font-[900] text-slate-800 uppercase tracking-widest">Offer Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <label className="text-[9px] font-[900] text-slate-400 uppercase tracking-[0.2em]">Offer title</label>
                            <input type="text" value={formData.offerTitle} onChange={(e) => setFormData({...formData, offerTitle: e.target.value})} className="w-full p-4 border border-slate-100 rounded-xl text-[10px] md:text-[11px] font-[800] bg-slate-50/50 outline-none focus:border-green-200 transition-all uppercase" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-[900] text-slate-400 uppercase tracking-[0.2em]">Expiration (Hours)</label>
                            <select className="w-full p-4 border border-slate-100 rounded-xl text-[10px] md:text-[11px] font-[800] bg-slate-50/50 outline-none uppercase" value={formData.expirationDate} onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}>
                                <option>12h</option>
                                <option>24h</option>
                                <option>48h</option>
                                <option>72h</option>
                            </select>
                        </div>
                    </div>
                </div>
                )}
                <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 p-6 md:p-8 shadow-sm">
                    <h3 className="text-xs md:text-sm font-[900] text-slate-800 mb-1 uppercase tracking-widest border-b border-slate-50 pb-4">Content Area</h3>
                    <div className="space-y-6 md:space-y-8 mt-6">
                        {formData.category !== 'Authentication' && (
                        <div>
                            <label className="text-[9px] font-[900] text-slate-400 uppercase mb-3 block tracking-[0.2em]">Media Header <span className="lowercase font-[600] text-slate-300 ml-2">(Optional)</span></label>
                            <select className="w-full p-4 border border-slate-100 rounded-xl text-[10px] md:text-[11px] font-[800] outline-none bg-slate-50/30 uppercase tracking-widest"><option>IMAGE</option><option>VIDEO</option></select>
                        </div>
                        )}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-[9px] font-[900] text-slate-400 uppercase tracking-[0.2em]">Message Body</label>
                                <button className="text-[8px] md:text-[9px] font-[900] text-blue-600 flex items-center gap-1 uppercase tracking-widest bg-blue-50 px-2 md:px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all"><Plus size={10}/> Add Variable</button>
                            </div>
                            <div className="border border-slate-100 rounded-2xl md:rounded-3xl overflow-hidden focus-within:border-green-300 transition-all shadow-inner">
                                <textarea rows="5" className="w-full p-4 md:p-6 outline-none resize-none text-[12px] md:text-[13px] font-[600] text-slate-700 leading-relaxed bg-slate-50/10" value={formData.bodyText} onChange={(e) => setFormData({...formData, bodyText: e.target.value})} />
                            </div>
                        </div>
                        {formData.category !== 'Authentication' && (
                        <div>
                            <label className="text-[9px] font-[900] text-slate-400 uppercase mb-3 block tracking-[0.2em]">Footer Text <span className="lowercase font-[600] text-slate-300 ml-2">(Optional)</span></label>
                            <input type="text" className="w-full p-4 border border-slate-100 rounded-xl text-[10px] md:text-[11px] font-[800] outline-none focus:border-green-200 transition-all bg-slate-50/30 uppercase" value={formData.footerText} onChange={(e) => setFormData({...formData, footerText: e.target.value})} />
                        </div>
                        )}
                    </div>
                </div>
                {formData.category !== 'Authentication' && (
                <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 p-6 md:p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h3 className="text-xs md:text-sm font-[900] text-slate-800 uppercase tracking-widest">Action Buttons</h3>
                        <button onClick={addButton} disabled={buttons.length >= 3} className="text-[9px] md:text-[10px] font-[900] text-green-600 flex items-center gap-2 border-2 border-green-50 px-4 md:px-5 py-2 md:py-2.5 rounded-xl hover:bg-green-50 transition-all disabled:opacity-30">
                          <Plus size={14}/> ADD NEW
                        </button>
                    </div>
                    <div className="space-y-4">
                        {buttons.map((btn) => (
                          <div key={btn.id} className="border border-slate-100 rounded-2xl md:rounded-[2rem] p-4 md:p-6 bg-slate-50/30 space-y-5 relative group hover:border-slate-200 transition-all">
                              <button onClick={() => removeButton(btn.id)} className="absolute top-4 right-4 md:top-6 md:right-6 text-red-300 hover:text-red-500 transition-colors">
                                <Trash2 size={18}/>
                              </button>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                                  <div>
                                      <label className="text-[9px] font-[900] text-slate-400 uppercase block mb-2 tracking-widest">Type</label>
                                      <select className="w-full p-3 md:p-4 border border-slate-100 rounded-xl text-[10px] font-[800] bg-white uppercase tracking-tighter"><option>Visit Website</option><option>Call Number</option></select>
                                  </div>
                                  <div className="sm:pr-10">
                                      <label className="text-[9px] font-[900] text-slate-400 uppercase block mb-2 tracking-widest">Label</label>
                                      <input type="text" defaultValue={btn.text} className="w-full p-3 md:p-4 border border-slate-100 rounded-xl text-[10px] font-[800] bg-white uppercase tracking-tighter" />
                                  </div>
                              </div>
                          </div>
                        ))}
                    </div>
                </div>
                )}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-10">
                    <button onClick={() => setView('setup')} className="text-slate-400 font-[900] text-[10px] uppercase tracking-[0.2em] hover:text-slate-800 transition-colors px-4 py-2 order-2 sm:order-1">Previous Step</button>
                    <button onClick={handleSubmit} className="w-full sm:w-auto bg-[#25D366] text-white px-10 md:px-16 py-4 md:py-5 rounded-xl md:rounded-[1.5rem] font-[900] text-xs shadow-2xl shadow-green-100 hover:bg-[#1fb855] transition-all tracking-[0.2em] order-1 sm:order-2">SUBMIT TEMPLATE</button>
                </div>
            </div>
          )}
        </div>
      </div>

      {/* Responsive Preview Sidebar */}
      <div className="w-full lg:w-[450px] xl:w-[480px] bg-white p-6 md:p-10 flex flex-col items-center border-t lg:border-t-0 lg:border-l border-slate-100 relative overflow-y-auto">
        <div className="lg:sticky lg:top-0 w-full flex flex-col items-center">
            <div className="flex justify-between w-full mb-8 lg:mb-12">
                <p className="text-slate-900 font-[900] text-[10px] md:text-[11px] tracking-[0.25em] uppercase">LIVE PREVIEW</p>
                <div className="flex items-center gap-2 bg-green-50 px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
                    <span className="text-[8px] md:text-[9px] font-[900] text-green-600 uppercase tracking-widest">SYNCED</span>
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
  <div className="relative w-[300px] h-[580px] bg-[#0F172A] rounded-[3.5rem] border-[12px] border-[#1e293b] shadow-[0_50px_100px_rgba(0,0,0,0.15)] overflow-hidden font-['Inter']">
    <div className="h-full bg-[#E5DDD5] pt-10">
      <div className="bg-[#075E54] p-5 flex items-center gap-3">
        <div className="w-9 h-9 bg-white/20 rounded-full border border-white/10" />
        <div className="text-white">
          <p className="text-[12px] font-[800] leading-none tracking-tight">WhatsApp Business</p>
          <p className="text-[9px] opacity-60 font-[700] uppercase tracking-widest mt-1">online</p>
        </div>
      </div>
      <div className="p-4 overflow-y-auto max-h-[460px]">
        <div className="bg-white rounded-[1.25rem] rounded-tl-none shadow-lg overflow-hidden border border-slate-200/50">
          {showImage && (
            <div className="h-32 md:h-36 bg-slate-50 flex flex-col items-center justify-center text-slate-300 gap-1 border-b border-dashed relative">
                {offer && <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-[#25D366] text-white text-[9px] md:text-[10px] font-[900] px-2 md:px-3 py-1 md:py-1.5 rounded-lg shadow-lg tracking-tighter uppercase">{offer}</div>}
                <ImageIcon size={32} className="opacity-20"/><span className="text-[9px] font-[900] uppercase opacity-30 tracking-[0.1em]">Media Header</span>
            </div>
          )}
          <div className="p-4 md:p-5">
            <p className="text-[9px] md:text-[10px] text-[#25D366] font-[900] mb-2 uppercase tracking-widest">[{name || 'TEMPLATE_NAME'}]</p>
            <p className="text-[12px] md:text-[13px] text-slate-700 font-[600] leading-[1.6] mb-3 whitespace-pre-line">{body}</p>
            
            {isLimited && (
                <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between">
                    <span className="text-[10px] font-[900] text-red-500 uppercase">Offer expires in:</span>
                    <span className="text-[10px] font-[900] text-red-600 bg-white px-2 py-1 rounded-md shadow-sm">23:59:59</span>
                </div>
            )}

            {footer && <p className="text-[10px] md:text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100 font-[600] italic">{footer}</p>}
          </div>
          {buttons.length > 0 && buttons.map(btn => (
            <div key={btn.id} className="bg-slate-50 p-2 border-t border-slate-100">
               <button className="text-[11px] md:text-[12px] text-blue-500 font-[800] flex items-center justify-center gap-2 w-full py-2.5 md:py-3 bg-white rounded-xl shadow-sm border border-slate-100 uppercase tracking-tighter">
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