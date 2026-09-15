/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect, useContext } from 'react';
import { Eye, ChevronDown, Check, ChevronLeft, Video, Phone, Image as ImageIcon, CheckCheck, Smile, Paperclip, Send, Loader2, Layers, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchWhatsAppTemplates, mergeTemplates } from '../../services/TemplateApi';
import { userContext } from '../../context/Context';
import { getPlanLimit } from '../../utils/planLimits';

const TemplatesGallery = () => {
  const navigate = useNavigate();
  const { user } = useContext(userContext);
  const currentPlan = (user?.subscriptionPlan || 'free').toLowerCase();
  const currentPlanCapitalized = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);
  const templateLimit = getPlanLimit(currentPlan, 'templates');
  const [userTemplateCount, setUserTemplateCount] = useState(0);
  const [upgradeModal, setUpgradeModal] = useState({ isOpen: false, featureName: 'Templates', message: '' });

  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Templates');
  const [loading, setLoading] = useState(true);
  
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [categories, setCategories] = useState([{ name: 'All Templates', count: 0 }]);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      try {
        const whatsappTemplates = await fetchWhatsAppTemplates();
        const templatesArray = whatsappTemplates.data?.data || [];
        setUserTemplateCount(templatesArray.length);
        const formatted = mergeTemplates(templatesArray, []);
        
        // Filter approved templates
        const approvedTemplates = formatted.filter(t => t.status === 'Approved');
        
        const galleryTemplates = approvedTemplates.map(t => {
          let category = 'General';
          if (t.category) {
            category = t.category.charAt(0).toUpperCase() + t.category.slice(1).toLowerCase();
          }
          return {
            id: t.id,
            title: t.name,
            tag: category,
            content: t.bodyText || '',
            originalData: t,
            headerType: t.headerType,
            headerMediaUrl: t.headerMediaUrl || t.headerMediaUrlPreview,
            buttons: t.buttons,
            footerText: t.footerText
          };
        });
        
        setTemplates(galleryTemplates);
        if (galleryTemplates.length > 0) {
          setSelectedTemplate(galleryTemplates[0]);
        }
        
        // Compute categories
        const catCounts = { 'All Templates': galleryTemplates.length };
        galleryTemplates.forEach(t => {
          catCounts[t.tag] = (catCounts[t.tag] || 0) + 1;
        });
        
        const catArray = Object.keys(catCounts).map(name => ({
          name, count: catCounts[name]
        }));
        setCategories(catArray);
        
      } catch (error) {
        console.error('Failed to load templates:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTemplates();
  }, []);

  const isLimitReached = templateLimit !== -1 && userTemplateCount >= templateLimit;

  const handleUseTemplate = (tpl) => {
    if (isLimitReached) {
      setUpgradeModal({
        isOpen: true,
        featureName: 'Templates',
        message: `You have reached your limit of ${templateLimit} templates on the ${currentPlanCapitalized} plan. Upgrade to create and use more templates!`
      });
      return;
    }
    if (tpl) {
      navigate('/admin/templates/create', { state: { fromGallery: true, isDuplicate: true, templateData: tpl.originalData } });
    } else {
      navigate('/admin/templates/create', { state: { fromGallery: true } });
    }
  };

  const filteredTemplates = selectedCategory === 'All Templates' 
    ? templates 
    : templates.filter(t => t.tag === selectedCategory);

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] font-sans antialiased text-[#334155] relative">
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
            <h3 className="text-xl font-bold text-slate-900 mb-2">Upgrade to Use More Templates</h3>
            <p className="text-slate-500 text-xs sm:text-sm mb-6 leading-relaxed">
              {upgradeModal.message || `You have reached the template limit for the ${currentPlanCapitalized} plan. Upgrade to unlock higher limits and premium features.`}
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
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT CONTENT */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between px-4 md:px-10 py-8 bg-[#F8FAFC]">
            <div className="mb-4 lg:mb-0">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
                  <Layers className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Template Gallery</h2>
              </div>
              <p className="text-[13px] text-gray-500 mt-1 font-medium">Choose a template to start your campaign</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <button 
                  onClick={() => setShowCategories(!showCategories)}
                  className="flex items-center gap-3 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] font-semibold text-[#475569] shadow-sm hover:border-[#10B981] transition-all"
                >
                  Category: <span className="text-[#10B981]">{selectedCategory}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showCategories ? 'rotate-180' : ''}`} />
                </button>

                {showCategories && (
                  <div className="absolute right-0 mt-3 w-60 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 py-3">
                    {categories.map((cat, i) => (
                      <button 
                        key={i}
                        onClick={() => { setSelectedCategory(cat.name); setShowCategories(false); }}
                        className="flex justify-between items-center w-full px-5 py-2.5 text-[13px] text-[#475569] hover:bg-[#F0FDF4] hover:text-[#10B981] font-medium transition-colors"
                      >
                        {cat.name}
                        <span className="text-[10px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded-lg border border-gray-100 font-bold">{cat.count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Plan quota indicator */}
              <div
                title={`${userTemplateCount} of ${templateLimit === -1 ? 'unlimited' : templateLimit} templates used`}
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border ${
                  isLimitReached 
                    ? 'bg-amber-50 text-amber-800 border-amber-200' 
                    : 'bg-white text-slate-700 border-gray-200'
                }`}
              >
                <span>{userTemplateCount} / {templateLimit === -1 ? '∞' : templateLimit} Templates</span>
                {isLimitReached && <Lock className="w-3.5 h-3.5 text-amber-600" />}
              </div>

              <button 
                onClick={() => handleUseTemplate(null)}
                className={`px-6 py-2.5 rounded-xl font-bold text-[13px] flex items-center gap-2 transition-all shadow-lg cursor-pointer ${
                  isLimitReached 
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-100' 
                    : 'bg-[#10B981] hover:bg-[#059669] text-white shadow-emerald-100'
                }`}
              >
                {isLimitReached ? <Lock size={15} /> : <span className="text-lg">+</span>}
                <span>{isLimitReached ? 'Upgrade Plan' : 'Create Template'}</span>
              </button>
            </div>
          </div>

          {/* Grid */}
          <main className="flex-1 px-4 md:px-10 pb-10 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Loading templates...</p>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <p>No templates found for this category.</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
              {filteredTemplates.map((tpl) => (
                <div 
                  key={tpl.id} 
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`bg-white border-2 rounded-3xl p-6 transition-all duration-200 cursor-pointer flex flex-col h-full ${selectedTemplate?.id === tpl.id ? 'border-[#10B981] shadow-lg shadow-emerald-50' : 'border-white shadow-sm hover:border-[#E2E8F0]'}`}
                >
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-[#94A3B8] text-[10px] font-black tracking-widest uppercase font-mono">{tpl.title}</span>
                    <Eye className={`w-4 h-4 ${selectedTemplate?.id === tpl.id ? 'text-[#10B981]' : 'text-[#CBD5E1]'}`} />
                  </div>
                  
                  <p className="text-[14px] text-[#475569] mb-8 leading-relaxed font-medium line-clamp-3 flex-1 italic">
                    "{tpl.content?.substring(0, 110)}"
                   </p>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseTemplate(tpl);
                    }}
                    className={`w-full py-3 rounded-2xl font-bold text-[13px] transition-all duration-300 cursor-pointer ${
                      selectedTemplate?.id === tpl.id 
                        ? 'bg-[#10B981] text-white' 
                        : 'bg-[#F8FAFC] text-[#64748B] hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
            )}
          </main>
        </div>

        {/* RIGHT LIVE PREVIEW */}
        <aside className="hidden xl:flex w-[400px] bg-white border-l border-gray-100 flex-col items-center p-8 relative overflow-y-auto">
          <div className="w-full flex-1 flex flex-col justify-center">
            <h2 className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[3px] mb-6 text-center">Live Preview</h2>
            
            <div className="mx-auto w-full max-w-[276px]">
              <MobilePreview 
                name={selectedTemplate?.title || 'Template Name'} 
                body={selectedTemplate?.content?.replace('{{1}}', '[Customer Name]')?.replace('{{2}}', '[Details]') || ''}
              />
            </div>
            
            <div className="mt-8">
              <button 
                onClick={() => handleUseTemplate(selectedTemplate)}
                className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] text-white py-3.5 rounded-2xl flex items-center justify-center gap-3 text-[13px] font-extrabold hover:from-[#0ea372] hover:to-[#047857] transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98] cursor-pointer"
              >
                Use this template <Check className="w-4 h-4 bg-white text-[#059669] rounded-full p-0.5" />
              </button>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

const MobilePreview = ({ 
  name, 
  body, 
  headerType, 
  headerMediaUrl = '', 
  footerText, 
  buttons=[],
  isLimited = false,
  limitedTimeOfferText = 'Expiring offer!',
  hasExpiration = true,
  offerCode = ''
}) => {
  const isMedia = headerType && ['Image', 'Video', 'Document'].includes(headerType);
  const isTextHeader = headerType === 'Text';
  const previewName = name || 'Business Update';

  return (
  <div className="relative w-full max-w-[215px] sm:max-w-[245px] aspect-[245/500] mx-auto bg-gradient-to-b from-[#0b1118] via-[#111b24] to-[#0b1118] rounded-[2.25rem] sm:rounded-[2.75rem] border-[7px] sm:border-[9px] border-[#0a0f14] shadow-[0_28px_48px_-16px_rgba(0,0,0,0.45)] overflow-hidden font-sans flex flex-col">
    <div className="absolute inset-x-0 top-0 h-6 sm:h-7 bg-gradient-to-b from-black/40 to-transparent z-20 pointer-events-none" />
    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-4.5 sm:h-5 bg-black rounded-full z-30 border border-white/10" />
    <div className="h-full bg-[#e7ddd1] pt-7 sm:pt-8 relative flex flex-col">
      <div className="absolute inset-0 opacity-[0.22] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 24px 24px, #c7bbb0 1.2px, transparent 1.2px)', backgroundSize: '22px 22px' }}></div>
      <div className="absolute top-1.5 sm:top-2 inset-x-0 z-40 px-4 sm:px-5 flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-[#0b1118] pointer-events-none">
        <span>9:41</span>
        <div className="flex items-center gap-1.5 text-[#1f2937]">
          <span>5G</span>
          <span className="inline-flex items-center gap-[2px]">
            <span className="w-1 h-1 rounded-full bg-[#1f2937]" />
            <span className="w-1 h-1 rounded-full bg-[#1f2937]" />
            <span className="w-1 h-1 rounded-full bg-[#1f2937]" />
          </span>
        </div>
      </div>

      <div className="relative z-10 bg-[#0b6a61] px-3 sm:px-3.5 py-1.5 sm:py-2 flex items-center gap-2 sm:gap-2.5 shadow-lg shrink-0">
        <button className="text-white/90 text-base leading-none" type="button" aria-label="Back">
          <ChevronLeft size={16} />
        </button>
        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-[#14b8a6] to-[#0f766e] rounded-full flex items-center justify-center border border-white/20 shrink-0">
          <span className="text-white text-[11px] sm:text-xs font-bold">MB</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-[11px] sm:text-[12px] font-bold leading-tight truncate">Your Business</p>
          <p className="text-white/80 text-[9px] sm:text-[10px] font-medium">verified business</p>
        </div>
        <div className="flex gap-2.5 text-white/90 text-sm items-center">
          <Video size={14} />
          <Phone size={14} />
        </div>
      </div>

      <div className="relative z-10 p-2.5 sm:p-3 overflow-y-auto flex-1 pb-10 sm:pb-11 no-scrollbar">
        <div className="bg-white rounded-2xl rounded-tl-md shadow-[0_12px_24px_-14px_rgba(15,23,42,0.65)] overflow-hidden max-w-[95%] border border-[#eef1f4]">
          {isMedia && (
            <>
              {headerType === 'Image' && headerMediaUrl ? (
                <img src={headerMediaUrl} className="h-28 sm:h-36 w-full object-cover border-b border-gray-200/70" />
              ) : headerType === 'Video' && headerMediaUrl ? (
                <video src={headerMediaUrl} className="h-28 sm:h-36 w-full object-cover border-b border-gray-200/70 bg-black" autoPlay muted loop playsInline />
              ) : headerType === 'Document' && headerMediaUrl ? (
                <div className="h-28 sm:h-36 w-full border-b border-gray-200/70 bg-red-50 flex flex-col items-center justify-center gap-1.5">
                  <span className="text-xl">📄</span>
                  <span className="text-[9px] font-semibold text-red-700 uppercase tracking-wide">Document</span>
                </div>
              ) : (
                <div className="h-28 sm:h-36 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center text-gray-300 gap-1.5 border-b border-gray-200/70">
                  <ImageIcon size={32} className="opacity-30" />
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">{headerType}</span>
                </div>
              )}
            </>
          )}
          <div className="p-2.5 sm:p-3">
            {isTextHeader && (
              <p className="text-[12px] sm:text-[13px] text-gray-900 font-bold mb-1 leading-tight">{previewName}</p>
            )}
            {!isTextHeader && (
              <p className="text-[8px] sm:text-[9px] text-gray-400 font-bold mb-1.5 uppercase tracking-tight opacity-75 break-all leading-tight">{previewName}</p>
            )}
            <div className="text-[11px] sm:text-[13px] text-gray-800 font-medium leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: body }}></div>
            
            {isLimited && (
              <div className="mt-2.5 p-2 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200 flex flex-col gap-1 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-red-600 tracking-tight">
                    {limitedTimeOfferText || 'Expiring offer!'}
                  </span>
                  {hasExpiration && (
                    <span className="text-[8.5px] font-bold text-red-600 bg-white px-1.5 py-0.5 rounded shadow-xs border border-red-100 flex items-center gap-1">
                      ⏱ 23:59:59
                    </span>
                  )}
                </div>
                {offerCode && (
                  <div className="flex items-center justify-between bg-white/90 px-1.5 py-0.5 rounded border border-dashed border-red-300">
                    <span className="text-[8px] font-medium text-gray-500">Code:</span>
                    <span className="text-[8.5px] font-mono font-bold text-gray-800 tracking-wider bg-gray-50 px-1 rounded">{offerCode}</span>
                  </div>
                )}
              </div>
            )}

            {!isLimited && footerText && (
              <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium mt-1.5 leading-tight">{footerText}</p>
            )}
            <div className="flex items-center justify-end gap-1 mt-1.5">
              <span className="text-[8px] text-gray-400 font-medium">12:30 PM</span>
              <CheckCheck size={11} className="text-[#34b7f1]" />
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-10 px-2 sm:px-2.5 pb-2 sm:pb-2.5">
        <div className="bg-white/95 backdrop-blur rounded-full border border-white/70 shadow-sm px-3 py-2 min-h-[36px] sm:min-h-[40px] flex items-center gap-2">
          <Smile size={15} className="text-gray-400" />
          <span className="text-[11px] sm:text-[12px] text-gray-400 font-medium flex-1">Type a message</span>
          <Paperclip size={15} className="text-gray-400" />
          <span className="text-white bg-[#00a884] w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full inline-flex items-center justify-center">
            <Send size={11} />
          </span>
        </div>
      </div>
    </div>
  </div>
)};

export default TemplatesGallery;
