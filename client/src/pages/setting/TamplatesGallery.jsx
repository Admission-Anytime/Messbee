/* eslint-disable react/no-unescaped-entities */
import { useState } from 'react';
import { Eye, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TemplatesGallery = () => {
  const navigate = useNavigate();
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Templates');
  
  const [selectedTemplate, setSelectedTemplate] = useState({
    id: 2,
    title: 'food_order_on_th...',
    content: "Hey [Customer Name]! Your pizza adventure is officially on its way! 🍕🚀 \n\nExpect the mouthwatering goodness to arrive at your doorstep by [Time]! Thank you for choosing..."
  });

  const categories = [
    { name: 'All Templates', count: 142 },
    { name: 'Special Occasion', count: 24 },
    { name: 'Festival Season', count: 18 },
    { name: 'Food delivery', count: 12 },
    { name: 'Travel', count: 9 },
    { name: 'Commerce', count: 31 },
    { name: 'Services', count: 15 },
    { name: 'Education', count: 8 },
  ];

  const templates = [
    { id: 1, title: 'new_food_menu', tag: 'MARKETING', success: '98.2%', content: "Hey {{1}}! We've just rolled out a brand new menu that's bursting with Italian flavors. 🍕 To celebrate this, we are offering a 20% discount!" },
    { id: 2, title: 'food_order_on_th...', tag: 'UTILITY', success: '99.5%', content: "Hey {{1}}! Your pizza adventure is officially on its way! 🍕🚀 \n\nExpect the mouthwatering goodness to arrive at your doorstep by {{2}}! Thank you for choosing...", active: true },
    { id: 3, title: 'food_order_deliv...', tag: 'UTILITY', success: '4.2k Uses', content: "Hey {{1}}! Your order from {{2}} has been successfully delivered to your doorstep. 🍔🍟 \n\nWe hope you're as hungry as we are..." },
    { id: 4, title: 'food_order_confi...', tag: 'UTILITY', success: '99.1%', content: "Your Food Order is confirmed. Hey {{1}}! Thank you for placing an order with {{2}}. Our talented chefs are busy cooking..." },
    { id: 5, title: 'holiday_package_v1', tag: 'MARKETING', success: '1.8k Uses', content: "Ready for your next adventure? 🏖️ Book our exclusive Bali package today and get a complimentary spa voucher! Limited slots..." },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] font-sans antialiased text-[#334155]">
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT CONTENT */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 md:px-6 py-4 bg-[#F8FAFC]">
            <div>
              <h2 className="text-xl font-bold text-[#1E293B] tracking-tight">Template Gallery</h2>
              <p className="text-[12px] text-gray-500 mt-1 font-medium">Choose a template to start your campaign</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button 
                  onClick={() => setShowCategories(!showCategories)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[11px] font-semibold text-[#475569] shadow-sm hover:border-[#10B981] transition-all whitespace-nowrap"
                >
                  Category: <span className="text-[#10B981]">{selectedCategory}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showCategories ? 'rotate-180' : ''}`} />
                </button>

                {showCategories && (
                  <div className="absolute right-0 mt-3 w-60 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 py-3">
                    {categories.map((cat, i) => (
                      <button 
                        key={i}
                        onClick={() => { setSelectedCategory(cat.name); setShowCategories(false); }}
                        className="flex justify-between items-center w-full px-5 py-2.5 text-[11px] text-[#475569] hover:bg-[#F0FDF4] hover:text-[#10B981] font-medium transition-colors"
                      >
                        {cat.name}
                        <span className="text-[10px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded-lg border border-gray-100 font-bold">{cat.count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={() => navigate('/admin/templates/create', { state: { fromGallery: true } })}
                className="bg-[#10B981] text-white px-3.5 py-2 rounded-lg font-bold text-[11px] flex items-center gap-1.5 hover:bg-[#059669] transition-all shadow-lg shadow-emerald-100 whitespace-nowrap"
              >
                <span className="text-sm">+</span> Create Template
              </button>
            </div>
          </div>

          {/* Grid */}
          <main className="flex-1 px-4 md:px-12 pb-10 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {templates.map((tpl) => (
                <div 
                  key={tpl.id} 
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`bg-white border-2 rounded-xl py-6 px-3.5 transition-all duration-200 cursor-pointer flex flex-col h-full ${selectedTemplate?.id === tpl.id ? 'border-[#10B981] shadow-lg shadow-emerald-50' : 'border-white shadow-sm hover:border-[#E2E8F0]'}`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[#94A3B8] text-[10px] font-black tracking-widest uppercase font-mono">{tpl.title}</span>
                    <Eye className={`w-4 h-4 ${selectedTemplate?.id === tpl.id ? 'text-[#10B981]' : 'text-[#CBD5E1]'}`} />
                  </div>
                  
                  <p className="text-[12px] text-[#475569] mb-4 leading-relaxed font-medium line-clamp-3 flex-1 italic">
                    "{tpl.content?.substring(0, 110)}"
                   </p>
                  
                  <button className={`w-full py-2.5 rounded-lg font-bold text-[11px] transition-all duration-300 ${selectedTemplate?.id === tpl.id ? 'bg-[#10B981] text-white' : 'bg-[#F8FAFC] text-[#64748B]'}`}>
                    {selectedTemplate?.id === tpl.id ? 'Selected' : 'Use Template'}
                  </button>
                </div>
              ))}
            </div>
          </main>
        </div>

        {/* RIGHT LIVE PREVIEW (RESTORED) */}
        <aside className="hidden xl:flex w-[350px] bg-white border-l border-gray-100 flex-col items-center justify-center p-6 relative">
          <div className="w-full mb-10">
            <h2 className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[3px] mb-6 text-center">Live Preview</h2>
            
            <div className="relative mx-auto border-[10px] border-[#0F172A] rounded-[2rem] h-[465px] w-[232px] shadow-2xl bg-white overflow-hidden ring-4 ring-[#F1F5F9]">
              <div className="absolute top-0 inset-x-0 h-8 flex justify-center items-start pt-2 z-20">
                 <div className="w-16 h-4 bg-[#0F172A] rounded-b-xl"></div>
              </div>
              
              <div className="h-full bg-[#E5DDD5] pt-12 p-3 relative overflow-hidden"> 
                {selectedTemplate && (
                  <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm relative z-10 border border-white/50 max-w-full">
                    <p className="text-[11px] text-[#1E293B] font-medium leading-[1.5] whitespace-pre-wrap break-words">
                      {selectedTemplate.content.replace('{{1}}', '[Customer Name]').replace('{{2}}', '[Details]')}
                    </p>
                    <div className="text-right text-[8px] text-[#94A3B8] mt-1 font-bold">10:15 AM ✓✓</div>
                    <div className="absolute top-0 -left-2 w-0 h-0 border-t-[10px] border-t-white border-l-[10px] border-l-transparent"></div>
                  </div>
                )}
                
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center mt-20">End-to-end encrypted</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/admin/templates/create', { state: { fromGallery: true } })}
            className="w-full bg-[#0F172A] text-white py-3.5 rounded-lg flex items-center justify-center gap-3 text-[13px] font-extrabold hover:bg-black transition-all shadow-xl shadow-slate-200"
          >
            Use this template <Check className="w-3.5 h-3.5 bg-[#10B981] text-white rounded-full p-0.5" />
          </button>
        </aside>

      </div>
    </div>
  );
};

export default TemplatesGallery;
