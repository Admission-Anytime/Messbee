import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, BarChart2, Copy, Trash2, ChevronDown } from 'lucide-react';

const CampaignDashboard = () => {
  const navigate = useNavigate();
  const campaigns = [
    { id: 1, title: "Dev Demo", message: "admission25", status: "Completed", progress: 100, createdBy: "Anil", hasAvatar: true },
    { id: 2, title: "Camp (24/07/25 12:38 pm)", message: "mbbs", status: "Completed", progress: 100, createdBy: "Anil", hasAvatar: true },
    { id: 3, title: "Camp (13/06/25 4:04 pm)", message: "result_alert_mb...", status: "Completed", progress: 100, createdBy: "Anil", hasAvatar: true },
    { id: 4, title: "Camp (13/06/25 3:58 pm)", message: "mbbs_abroadaspi...", status: "Processing", progress: 65, createdBy: "Anil", hasAvatar: true },
    { id: 5, title: "Camp (15/05/25 10:00 am)", message: "admission_promo_5", status: "Completed", progress: 100, createdBy: "Anil", hasAvatar: false },
    { id: 6, title: "Camp (16/05/25 10:00 am)", message: "admission_promo_6", status: "Completed", progress: 100, createdBy: "Anil", hasAvatar: false },
    { id: 7, title: "Camp (17/05/25 10:00 am)", message: "admission_promo_7", status: "Completed", progress: 100, createdBy: "Anil", hasAvatar: false },
    { id: 8, title: "Camp (18/05/25 10:00 am)", message: "admission_promo_8", status: "Completed", progress: 100, createdBy: "Anil", hasAvatar: false },
    { id: 9, title: "Camp (19/05/25 10:00 am)", message: "admission_promo_9", status: "Completed", progress: 100, createdBy: "Anil", hasAvatar: false },
    { id: 10, title: "Camp (20/05/25 10:00 am)", message: "admission_promo_10", status: "Completed", progress: 100, createdBy: "Anil", hasAvatar: false },
  ];

  return (
    <div className="min-h-screen bg-white p-8 font-sans text-slate-700">
      {/* Top Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Campaign</h1>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search here"
              className="pl-10 pr-4 py-2 w-72 border border-gray-200 rounded-md bg-gray-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
            />
          </div>
          <button
            onClick={() => navigate('/admin/campaign/create')}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md font-semibold transition-colors text-sm"
          >
            <Plus className="w-4 h-4" /> Create Campaign
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex gap-3 mb-8 items-center text-sm">
        <span className="text-gray-500">Filter by</span>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-slate-700 hover:bg-gray-200 transition-colors">
          Status <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
        <button className="px-3 py-1.5 bg-gray-100 rounded-full text-slate-700 hover:bg-gray-200 transition-colors">
          Template Name
        </button>
      </div>

      {/* Campaign Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <th className="pb-4 pr-4 w-8">#</th>
              <th className="pb-4 px-4">Title</th>
              <th className="pb-4 px-4">Message</th>
              <th className="pb-4 px-4">Status</th>
              <th className="pb-4 px-4">Created By</th>
              <th className="pb-4 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {campaigns.map((camp) => (
              <tr key={camp.id} className="group hover:bg-gray-50/50 transition-colors">
                <td className="py-5 pr-4 text-sm text-gray-400">{camp.id}</td>
                <td className="py-5 px-4 text-sm font-bold text-slate-800">{camp.title}</td>
                <td className="py-5 px-4 text-sm text-emerald-600 font-medium">{camp.message}</td>
                <td className="py-5 px-4">
                  <div className="flex items-center gap-2">
                    <StatusCircle percentage={camp.progress} color={camp.status === 'Processing' ? 'blue' : 'emerald'} />
                    <span className={`text-sm font-medium ${camp.status === 'Processing' ? 'text-blue-500' : 'text-emerald-500'}`}>
                      {camp.status}
                    </span>
                  </div>
                </td>
                <td className="py-5 px-4">
                  <div className="flex items-center gap-2">
                    {camp.hasAvatar ? (
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${camp.id}`}
                        alt="avatar"
                        className="w-7 h-7 rounded-full bg-slate-200"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-100" />
                    )}
                    <span className="text-sm text-slate-600 font-medium">{camp.createdBy}</span>
                  </div>
                </td>
                <td className="py-5 px-4">
                  <div className="flex justify-end gap-4">
                    <button className="text-slate-400 hover:text-emerald-500 transition-colors"><BarChart2 className="w-4 h-4" /></button>
                    <button className="text-slate-400 hover:text-blue-500 transition-colors"><Copy className="w-4 h-4" /></button>
                    <button className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// SVG Circular Progress Component
const StatusCircle = ({ percentage, color }) => {
  const strokeColor = color === 'blue' ? '#3b82f6' : '#10b981';
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-7 h-7 transform -rotate-90">
        <circle
          cx="14"
          cy="14"
          r="12"
          stroke="currentColor"
          strokeWidth="2"
          fill="transparent"
          className="text-gray-100"
        />
        <circle
          cx="14"
          cy="14"
          r="12"
          stroke={strokeColor}
          strokeWidth="2"
          fill="transparent"
          strokeDasharray={75.39}
          strokeDashoffset={75.39 - (percentage / 100) * 75.39}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[8px] font-bold text-slate-700">{percentage}%</span>
    </div>
  );
};

export default CampaignDashboard;