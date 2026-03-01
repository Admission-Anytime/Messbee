/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, RotateCw, Image as ImageIcon} from 'lucide-react';

const Templates = ({ activeTab, }) => {
  const navigate = useNavigate();
  
  // Syncing internal view with Sidebar activeTab
  const [view, setView] = useState('list');

  useEffect(() => {
    if (activeTab === 'create-template') {
      setView('choose');
    } else if (activeTab === 'template-list') {
      setView('list');
    } else if (activeTab === 'template-gallery') {
      setView('gallery'); 
    }
  }, [activeTab]);

  // --- TEMPLATE DATA ---
  const [templates] = useState([
    { id: 'tmp_82931', name: 'mbbs_admission', category: 'Marketing', updated: '24 Jul, 2025', status: 'Approved', lang: 'EN' },
    { id: 'tmp_82932', name: 'auth_otp_v2', category: 'Authentication', updated: '22 Jul, 2025', status: 'Approved', lang: 'EN' },
    { id: 'tmp_82933', name: 'payment_reminder', category: 'Utility', updated: '21 Jul, 2025', status: 'Pending', lang: 'EN' },
    { id: 'tmp_82934', name: 'order_update', category: 'Utility', updated: '20 Jul, 2025', status: 'Rejected', lang: 'EN' },
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);

  // --- VIEW 1: LIST VIEW ---
  if (view === 'list') {
    return (
      <div className="flex flex-col lg:flex-row h-full w-full bg-[#F9FAFB] p-4 lg:p-6 gap-6 overflow-hidden font-sans antialiased">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-6 gap-3">
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-800">Templates</h1>
              <span className="text-gray-400 cursor-pointer text-lg hover:text-gray-600">ⓘ</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button className="flex items-center gap-2 text-gray-600 border border-gray-200 hover:bg-gray-50 px-3 md:px-4 py-2 rounded-lg transition-all font-semibold text-sm">
                <RotateCw size={16} className="md:hidden" />
                <RotateCw size={18} className="hidden md:block" />
                <span className="hidden sm:inline">Sync</span>
              </button>
              
              {/* FIXED BUTTON: Ab yeh direct navigation handle  */}
              <button 
                onClick={() => navigate('/admin/templates/create')} 
                className="flex items-center gap-1.5 md:gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-3 md:px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm whitespace-nowrap"
              >
                <Plus size={16} className="md:hidden" />
                <Plus size={18} className="hidden md:block" />
                <span className="hidden sm:inline">Create Template</span>
                <span className="sm:hidden">Create</span>
              </button>
            </div>
          </div>
          
          {/* SEARCH & FILTERS */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search templates..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm font-medium bg-white" />
            </div>
            <select className="px-3 md:px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 bg-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-semibold text-sm min-w-0">
              <option>Status: All</option>
              <option>Approved</option><option>Pending</option><option>Rejected</option>
            </select>
          </div>

          {/* TABLE */}
          <div className="flex-1 overflow-auto bg-white rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 sticky top-0 border-b border-gray-200">
                <tr>
                  <th className="px-4 md:px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 md:px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Update Date</th>
                  <th className="px-4 md:px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 md:px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {templates.map((temp) => (
                  <tr key={temp.id} onClick={() => setSelectedTemplate(temp)} className={`hover:bg-gray-50/50 cursor-pointer transition-colors ${selectedTemplate?.id === temp.id ? 'bg-green-50/60' : ''}`}>
                    <td className="px-4 md:px-6 py-4 text-sm font-medium text-gray-900">{temp.name}</td>
                    <td className="px-4 md:px-6 py-4 text-gray-500 text-[13px] font-medium hidden sm:table-cell">{temp.updated}</td>
                    <td className="px-4 md:px-6 py-4"><span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-600">{temp.category}</span></td>
                    <td className="px-4 md:px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${temp.status === 'Approved' ? 'bg-green-500' : temp.status === 'Rejected' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                            <span className="text-[13px] font-semibold text-gray-700">{temp.status}</span>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* RIGHT PREVIEW */}
        <div className="w-full lg:w-[350px] bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">

            
            {/* Mobile Preview */}
            <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100/50">
              <MobilePreview name={selectedTemplate?.name} body={`Hello! This is a preview of your template "${selectedTemplate?.name}".`} />
            </div>
            
            {/* Preview Footer */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-[10px] text-gray-400 text-center font-medium">
                Preview simulates actual WhatsApp appearance
              </p>
            </div>
        </div>
      </div>
    );
  }

  // --- DEFAULT VIEW  ---
  return null; 
};

// --- MOBILE PREVIEW COMPONENT ---
const MobilePreview = ({ name, body, showImage = false }) => (
  <div className="relative w-[220px] sm:w-[260px] h-[420px] sm:h-[460px] bg-gradient-to-b from-[#0F172A] to-[#1e293b] rounded-[2rem] sm:rounded-[2.5rem] border-[6px] sm:border-[8px] border-[#0F172A] shadow-2xl overflow-hidden font-sans">
    {/* Phone notch */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#0F172A] rounded-b-2xl z-10"></div>
    
    {/* Screen content */}
    <div className="h-full bg-[#E5DDD5] pt-8 sm:pt-10 relative">
      {/* WhatsApp Header */}
      <div className="bg-[#075E54] px-3 sm:px-4 py-3 sm:py-3.5 flex items-center gap-2 sm:gap-3 shadow-md">
        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/30 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">BA</span>
        </div>
        <div className="flex-1">
          <p className="text-white text-[11px] sm:text-[12px] font-bold leading-tight">Business AI</p>
          <p className="text-white/70 text-[8px] sm:text-[9px] font-semibold">online</p>
        </div>
        <div className="flex gap-3 sm:gap-4">
          <div className="w-1 h-1 bg-white/60 rounded-full"></div>
          <div className="w-1 h-1 bg-white/60 rounded-full"></div>
          <div className="w-1 h-1 bg-white/60 rounded-full"></div>
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="p-3 sm:p-4 overflow-hidden">
        <div className="bg-white rounded-xl rounded-tl-sm shadow-md overflow-hidden max-w-[85%]">
          {showImage && (
            <div className="h-28 sm:h-36 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center text-gray-300 gap-1.5 border-b border-gray-200/50">
                <ImageIcon size={28} className="opacity-30 sm:hidden"/>
                <ImageIcon size={32} className="opacity-30 hidden sm:block"/>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Media</span>
            </div>
          )}
          <div className="p-3 sm:p-3.5">
            <p className="text-[8px] sm:text-[9px] text-gray-400 font-bold mb-1.5 uppercase tracking-tight opacity-75">{name}</p>
            <p className="text-[11px] sm:text-[13px] text-gray-800 font-medium leading-relaxed whitespace-pre-line">{body}</p>
            <div className="flex items-center justify-end gap-1 mt-2">
              <span className="text-[8px] text-gray-400 font-medium">12:30 PM</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* WhatsApp Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#F0F0F0] px-3 py-2 border-t border-gray-200/50">
        <div className="bg-white rounded-full px-3 py-2 flex items-center gap-2 shadow-sm">
          <div className="w-5 h-5 rounded-full bg-gray-200/50"></div>
          <div className="flex-1 h-3 bg-gray-100 rounded"></div>
          <div className="w-5 h-5 rounded-full bg-gray-200/50"></div>
        </div>
      </div>
    </div>
  </div>
);

export default Templates;