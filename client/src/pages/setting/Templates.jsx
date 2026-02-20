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
      <div className="flex flex-col lg:flex-row h-full w-full bg-white p-4 lg:p-6 gap-6 overflow-hidden font-sans">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Templates</h1>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 text-slate-600 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl transition-all font-bold text-sm">
                <RotateCw size={18} /> Sync
              </button>
              
              {/* FIXED BUTTON: Ab yeh direct navigation handle  */}
              <button 
                onClick={() => navigate('/admin/templates/create')} 
                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1fb855] text-white px-5 py-2.5 rounded-xl font-black transition-all shadow-md active:scale-95 text-sm"
              >
                <Plus size={18} /> CREATE TEMPLATE
              </button>
            </div>
          </div>
          
          {/* SEARCH & FILTERS */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search templates..." className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none font-medium text-sm" />
            </div>
            <select className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-white outline-none font-bold text-sm">
              <option>Status: All</option>
              <option>Approved</option><option>Pending</option><option>Rejected</option>
            </select>
          </div>

          {/* TABLE */}
          <div className="flex-1 overflow-auto border border-slate-100 rounded-2xl shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Update Date</th>
                  <th className="px-6 py-4 text-center">Category</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {templates.map((temp) => (
                  <tr key={temp.id} onClick={() => setSelectedTemplate(temp)} className={`hover:bg-green-50/40 cursor-pointer transition-colors ${selectedTemplate?.id === temp.id ? 'bg-green-50/60' : ''}`}>
                    <td className="px-6 py-4 font-bold text-slate-800">{temp.name}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-bold">{temp.updated}</td>
                    <td className="px-6 py-4 text-center"><span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-blue-50 text-blue-600 tracking-wider">{temp.category}</span></td>
                    <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${temp.status === 'Approved' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : temp.status === 'Rejected' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                            <span className="text-xs font-black uppercase tracking-tight">{temp.status}</span>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* RIGHT PREVIEW */}
        <div className="w-full lg:w-[400px] bg-slate-50/50 rounded-3xl p-8 flex flex-col items-center border border-slate-100">
            <p className="text-slate-400 text-[10px] font-black mb-6 tracking-[0.2em] uppercase">Preview Mode</p>
            <MobilePreview name={selectedTemplate?.name} body={`Hello! This is a preview of your template "${selectedTemplate?.name}".`} />
        </div>
      </div>
    );
  }

  // --- DEFAULT VIEW  ---
  return null; 
};

// --- MOBILE PREVIEW COMPONENT ---
const MobilePreview = ({ name, body, showImage = false }) => (
  <div className="relative w-[280px] h-[550px] bg-[#0F172A] rounded-[3.5rem] border-[10px] border-[#1e293b] shadow-2xl overflow-hidden transform scale-95 origin-top font-sans">
    <div className="h-full bg-[#E5DDD5] pt-10">
      <div className="bg-[#075E54] p-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-white/20 rounded-full" />
        <div className="text-white"><p className="text-[11px] font-black leading-none tracking-tight">Business AI</p><p className="text-[8px] opacity-70 font-bold uppercase tracking-widest">online</p></div>
      </div>
      <div className="p-4">
        <div className="bg-white rounded-2xl rounded-tl-none shadow-lg overflow-hidden">
          {showImage && (
            <div className="h-32 bg-slate-50 flex flex-col items-center justify-center text-slate-300 gap-1 border-b border-slate-50 border-dashed relative">
                <ImageIcon size={28} className="opacity-20"/>
                <span className="text-[8px] font-black uppercase tracking-widest opacity-30">Header Image</span>
            </div>
          )}
          <div className="p-4">
            <p className="text-[9px] text-slate-400 font-black mb-2 uppercase tracking-tight">[{name}]</p>
            <p className="text-[12px] text-slate-800 font-bold leading-snug mb-2 whitespace-pre-line tracking-tight">{body}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Templates;