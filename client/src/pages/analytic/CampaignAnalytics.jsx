import { useState, memo } from "react";

import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Bell, 
  Settings, 
  ChevronDown,
  MoreHorizontal,
  Megaphone,
  Trash2,
  Copy,
  BarChart2,
  Check
} from "lucide-react";

// Reuse the StatusBadge logic from campaign.jsx styling
const StatusBadge = ({ status, progress }) => {
  const isCompleted = status === 'Completed' || progress === 100;
  
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18" cy="18" r="16"
            fill="none"
            className="stroke-gray-100"
            strokeWidth="3"
          />
          <circle
            cx="18" cy="18" r="16"
            fill="none"
            className={isCompleted ? "stroke-emerald-500" : "stroke-blue-500"}
            strokeWidth="3"
            strokeDasharray="100"
            strokeDashoffset={100 - (progress || 0)}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <span className={`absolute text-[9px] font-black ${isCompleted ? "text-emerald-600" : "text-blue-600"}`}>
          {progress}%
        </span>
      </div>
      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider ${
        isCompleted 
          ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
          : "bg-blue-50 text-blue-600 border border-blue-100"
      }`}>
        {status}
      </span>
    </div>
  );
};

const ActionBtn = ({ icon, onClick, title, hoverColor }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-2 rounded-xl text-slate-400 transition-all ${hoverColor || 'hover:bg-slate-100 hover:text-slate-600'}`}
  >
    {icon}
  </button>
);

const CampaignAnalytics = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterTemplate, setFilterTemplate] = useState("All");

  // Mock data matching the table structure in campaign.jsx
  const campaigns = [
    {
      id: 1,
      title: "Camp (22/04/26 3:31 pm)",
      templateName: "madara_uchiha",
      status: "Completed",
      progress: 100,
      sentOn: "22 Apr 2026, 03:31 pm",
      createdBy: "Vishal",
      initials: "VI"
    },
    {
      id: 2,
      title: "Camp 07/04/24 09:12:04",
      templateName: "miles_adamson",
      status: "Completed",
      progress: 100,
      sentOn: "07 Apr, 2026 5:07 pm",
      createdBy: "Ant Kumar Ass",
      initials: "AK"
    },
    {
      id: 3,
      title: "Dan Darius",
      templateName: "ainsleeusa25",
      status: "Completed",
      progress: 100,
      sentOn: "05 Feb, 2026 3:58 pm",
      createdBy: "Ant Kumar Ass",
      initials: "AK"
    },
    {
      id: 4,
      title: "Camp 04/02/25 12:34",
      templateName: "miles",
      status: "Completed",
      progress: 100,
      sentOn: "04 Feb, 2025 12:37 pm",
      createdBy: "Ant Kumar Ass",
      initials: "AK"
    }
  ];

  const filtered = campaigns.filter(c => 
    (filterStatus === "All" || c.status === filterStatus) &&
    (filterTemplate === "All" || c.templateName === filterTemplate) &&
    (c.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden font-['Urbanist']">
      
  

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 2xl:p-10">
        <div className="max-w-[1600px] mx-auto">
          
          {/* 2. HEADER SECTION */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-1"> Campaign Analytics</h1>
            <p className="text-xs md:text-sm font-bold text-slate-400">Detailed performance metrics across communication channels</p>
          </div>

          {/* 3. TABLE CONTAINER (Matching campaign.jsx styling) */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
            
            {/* Filter Header from campaign.jsx */}
            <div className="px-6 py-5 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-slate-400 text-sm font-bold mr-2">
                  <span className="opacity-60">Filter by</span>
                </div>
                
                <div className="relative group">
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="appearance-none flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-slate-600 hover:bg-gray-100 transition-colors font-bold text-xs outline-none cursor-pointer pr-8"
                  >
                    <option value="All">Status: All</option>
                    <option value="Completed">Completed</option>
                    <option value="Processing">Processing</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="relative group">
                  <select 
                    value={filterTemplate}
                    onChange={(e) => setFilterTemplate(e.target.value)}
                    className="appearance-none flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-slate-600 hover:bg-gray-100 transition-colors font-bold text-xs outline-none cursor-pointer pr-8"
                  >
                    <option value="All">Template: All</option>
                    <option value="madara_uchiha">madara_uchiha</option>
                    <option value="miles_adamson">miles_adamson</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search campaigns..."
                  className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#10B981]/50 focus:border-[#10B981] text-xs text-slate-700 placeholder:text-slate-400 font-bold transition"
                />
              </div>
            </div>

            {/* Table implementation from campaign.jsx */}
            <div className="w-full overflow-x-auto custom-scrollbar">
              <table className="w-full text-left table-fixed min-w-[1000px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 w-12 whitespace-nowrap">#</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[22%] whitespace-nowrap">Campaign Title</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[22%] whitespace-nowrap">Template</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[14%] whitespace-nowrap">Status</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[14%] whitespace-nowrap">Sent On</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[16%] whitespace-nowrap">Created By</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[10%] text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <Megaphone className="w-10 h-10 opacity-20 mb-2" />
                          <p className="text-sm font-bold">No campaigns found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((camp, index) => (
                      <tr key={camp.id} className="group hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-5 text-xs font-black text-slate-300 align-middle">{index + 1}</td>
                        <td className="px-5 py-5 align-middle">
                          <span className="text-xs font-black text-slate-800">{camp.title}</span>
                        </td>
                        <td className="px-5 py-5 align-middle">
                          <span className="inline-flex max-w-[240px] rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-black text-emerald-700 truncate align-middle">
                            {camp.templateName}
                          </span>
                        </td>
                        <td className="px-5 py-5 align-middle">
                          <StatusBadge status={camp.status} progress={camp.progress} />
                        </td>
                        <td className="px-5 py-5 align-middle">
                          <span className="text-[10px] text-slate-500 font-bold">{camp.sentOn}</span>
                        </td>
                        <td className="px-5 py-5 align-middle">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-[#10B981] flex items-center justify-center shrink-0">
                              <span className="text-[9px] font-black text-white uppercase">{camp.initials}</span>
                            </div>
                            <span className="text-xs font-black text-slate-700">{camp.createdBy}</span>
                          </div>
                        </td>
                        <td className="px-5 py-5 align-middle">
                          <div className="flex justify-end items-center gap-1">
                            <ActionBtn 
                              icon={<BarChart2 className="w-4 h-4" />} 
                              hoverColor="hover:text-[#10B981] hover:bg-emerald-50"
                              title="Analytics" 
                            />
                            <ActionBtn 
                              icon={<Copy className="w-4 h-4" />} 
                              hoverColor="hover:text-blue-500 hover:bg-blue-50"
                              title="Duplicate" 
                            />
                            <ActionBtn 
                              icon={<Trash2 className="w-4 h-4" />} 
                              hoverColor="hover:text-red-500 hover:bg-red-50"
                              title="Delete" 
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer from campaign.jsx */}
            {filtered.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/40">
                <p className="text-[11px] text-slate-400 font-bold">
                  Showing <span className="font-black text-slate-600">{filtered.length}</span> of <span className="font-black text-slate-600">{campaigns.length}</span> campaigns
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CampaignAnalytics;
