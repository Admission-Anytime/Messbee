import React, { useState, useEffect } from "react";
import { 
  ArrowLeftIcon, 
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ArrowsRightLeftIcon,
  MegaphoneIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline";
import chatService from "../../services/chatService";
import dayjs from "dayjs";

// ✅ Receives 'onBack' and 'data' as props from Chat.jsx
const ActivityLog = ({ onBack, data }) => {
  const [activeTab, setActiveTab] = useState("All Activity");
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState({
    stats: {
      totalInteractions: 0,
      interactionsThisWeek: 0,
      avgResponseTimeMinutes: 0,
      leadSince: null
    },
    timeline: []
  });

  const tabs = ["All Activity", "Messages", "Status Updates", "Campaigns", "Notes"];

  useEffect(() => {
    if (data?._id) {
      fetchActivityLogs();
    }
  }, [data?._id]);

  const fetchActivityLogs = async () => {
    setLoading(true);
    const result = await chatService.getActivityLogs(data._id);
    if (result.success) {
      setActivityData(result.data);
    }
    setLoading(false);
  };

  const formatPhone = (phone) => {
    if (!phone) return "**********";
    const digits = phone.replace(/\D/g, "");
    if (!digits) return "**********";
    return digits;
  };

  const getFilteredTimeline = () => {
    const { timeline } = activityData;
    if (activeTab === "All Activity") return timeline;
    if (activeTab === "Messages") return timeline.filter(item => item.type === 'outgoing' || item.type === 'incoming');
    if (activeTab === "Status Updates") return timeline.filter(item => item.type === 'lifecycle');
    if (activeTab === "Campaigns") return timeline.filter(item => item.type === 'campaign');
    if (activeTab === "Notes") return timeline.filter(item => item.type === 'note');
    return timeline;
  };

  const renderTimelineItem = (item) => {
    const timeFormatted = dayjs(item.time).format("hh:mm A");
    const dateFormatted = dayjs(item.time).format("MMM DD, hh:mm A");

    switch (item.type) {
      case 'note':
        return (
          <div key={item.id} className="relative pl-8 md:pl-10">
            <span className="absolute top-5 -left-[7px] w-3 h-3 bg-amber-400 rounded-full ring-4 ring-[#F9FAFB]"></span>
            <div className="bg-[#fffbeb] border border-amber-200 p-5 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-xs">
                  <DocumentTextIcon className="w-5 h-5" /> Internal Note
                </div>
                <span className="text-xs font-bold text-amber-500">
                  {timeFormatted}
                </span>
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed mb-4">
                "{item.content}"
              </p>
              <div className="flex items-center gap-2">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.author || 'Agent')}&background=f1f5f9`} className="w-6 h-6 rounded-full" alt="Agent" />
                <span className="text-xs font-bold text-slate-800">{item.author || "Unknown Agent"}</span>
              </div>
            </div>
          </div>
        );
      case 'outgoing':
      case 'incoming':
        const isOutgoing = item.type === 'outgoing';
        return (
          <div key={item.id} className="relative pl-8 md:pl-10">
            <span className={`absolute top-5 -left-[7px] w-3 h-3 ${isOutgoing ? 'bg-[#22C55E]' : 'bg-slate-400'} rounded-full ring-4 ring-[#F9FAFB]`}></span>
            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-3">
                <div className={`flex items-center gap-2 ${isOutgoing ? 'text-[#22C55E]' : 'text-slate-500'} font-bold text-xs`}>
                  <ChatBubbleLeftRightIcon className="w-5 h-5" /> {isOutgoing ? 'Outgoing Message' : 'Incoming Message'}
                </div>
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  {timeFormatted} 
                  {isOutgoing && (
                    <span className={`${item.status === 'read' ? 'text-[#3b82f6]' : 'text-slate-300'} text-[10px]`}>
                      {item.status === 'read' ? '✓✓' : '✓'}
                    </span>
                  )}
                </span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-xs text-slate-700">
                  {item.content}
                </p>
              </div>
            </div>
          </div>
        );
      case 'lifecycle':
        return (
          <div key={item.id} className="relative pl-8 md:pl-10">
            <span className="absolute top-5 -left-[7px] w-3 h-3 bg-blue-500 rounded-full ring-4 ring-[#F9FAFB]"></span>
            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
                  <ArrowsRightLeftIcon className="w-5 h-5" /> Lifecycle Change
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {dateFormatted}
                </span>
              </div>
              <p className="text-xs text-slate-600 flex items-center flex-wrap gap-1.5">
                {item.content}
              </p>
            </div>
          </div>
        );
      case 'campaign':
        return (
          <div key={item.id} className="relative pl-8 md:pl-10">
            <span className="absolute top-5 -left-[7px] w-3 h-3 bg-purple-500 rounded-full ring-4 ring-[#F9FAFB]"></span>
            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 text-purple-600 font-bold text-xs">
                  <MegaphoneIcon className="w-5 h-5" /> Campaign Broadcast
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">
                    {dateFormatted}
                  </span>
                  {item.status && (
                    <span className={`px-2 py-0.5 ${item.status === 'sent' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} font-bold rounded text-[9px] uppercase tracking-wider`}>
                      {item.status}
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                  <DocumentTextIcon className="w-3.5 h-3.5" /> TEMPLATE: {item.templateName || "Unknown"}
                </p>
                <p className="text-xs text-slate-700 line-clamp-2">
                  "{item.content}"
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F9FAFB] w-full font-sans text-slate-900 overflow-hidden">
      
      {/* 1. HEADER */}
      <div className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 shrink-0 shadow-sm">
        
        {/* Left: Back Button & User Info */}
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack} // ✅ Triggers the back function
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" /> Back to Chat
          </button>
          
          <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
          
          <div className="flex items-center gap-3">
            <img src={data?.avatar || `https://ui-avatars.com/api/?name=${(data?.name || 'User').replace(' ', '+')}&background=0D8ABC&color=fff`} alt="" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-slate-900">{data?.name || "Unknown User"}</h2>
                <span className="px-2 py-0.5 bg-[#f0fdf4] text-[#16a34a] text-[9px] font-bold rounded uppercase tracking-widest border border-[#bbf7d0]">
                  {data?.chatStatus || "Lead"}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{formatPhone(data?.phone || data?.whatsappId)}</p>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm hidden sm:block">
            Export Log
          </button>
        </div>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto px-6 py-10">
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 mb-2 tracking-wide uppercase">Total Interactions</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-slate-800">{activityData.stats.totalInteractions}</h3>
                {activityData.stats.interactionsThisWeek > 0 && (
                  <span className="text-xs font-bold text-[#22C55E] bg-green-50 px-2 py-0.5 rounded-md">
                    +{activityData.stats.interactionsThisWeek} this week
                  </span>
                )}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 mb-2 tracking-wide uppercase">Avg. Agent Response Time</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-slate-800">
                  {activityData.stats.avgResponseTimeMinutes > 0 ? `${activityData.stats.avgResponseTimeMinutes}m` : '--'}
                </h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 mb-2 tracking-wide uppercase">Lead Since</p>
              <h3 className="text-2xl font-black text-slate-800">
                {activityData.stats.leadSince ? dayjs(activityData.stats.leadSince).format("MMM DD, YYYY") : '--'}
              </h3>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-10 pb-2">
            {tabs.map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm border
                  ${activeTab === tab ? "bg-[#0f172a] border-[#0f172a] text-white" : "bg-white text-slate-500 hover:bg-slate-50 border-slate-200"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 3. TIMELINE */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#0f172a] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Activity...</p>
            </div>
          ) : getFilteredTimeline().length > 0 ? (
            <div className="relative border-l-2 border-slate-200 ml-4 md:ml-6 pb-10 space-y-8">
              {getFilteredTimeline().map((item) => renderTimelineItem(item))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DocumentTextIcon className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 mb-1">No Activity Found</h3>
              <p className="text-xs text-slate-500 font-medium">There are no records matching the selected filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;