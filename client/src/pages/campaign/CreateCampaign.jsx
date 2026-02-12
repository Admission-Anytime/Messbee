import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

// ❌ REMOVED: import MainSidebar from ... (Fixes Double Sidebar)

const CreateCampaign = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Campaign Created!");
    // Add your create logic here
  };

  return (
    // Main Container (Fills the Outlet)
    <div className="w-full h-full bg-slate-50 font-['Urbanist'] overflow-y-auto p-6">
      
      {/* 1. Header with Back Button */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Create New Campaign</h1>
          <p className="text-sm text-slate-500">Set up a new broadcast message for your customers.</p>
        </div>
      </div>

      {/* 2. Form Card */}
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Campaign Name Input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">
              Campaign Name <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="name" 
              placeholder="e.g. Diwali Sale 2026" 
              required 
              className="w-full px-4 py-3 rounded-lg border border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ba2525]/20 focus:border-[#ba2525] transition-all"
            />
          </div>

          {/* Select Template Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="template" className="text-sm font-bold text-slate-700">
              Select Template <span className="text-red-500">*</span>
            </label>
            <select 
              id="template" 
              name="template"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#ba2525]/20 focus:border-[#ba2525] transition-all appearance-none"
            >
              <option value="" disabled selected>-- Choose a Template --</option>
              <option value="welcome">Welcome Message</option>
              <option value="offer">Special Offer</option>
              <option value="reminder">Payment Reminder</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Don't see your template? <span className="text-blue-500 cursor-pointer hover:underline">Create a new one here.</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-8 py-2.5 rounded-lg text-sm font-bold text-white bg-[#ba2525] hover:bg-[#a01f1f] shadow-lg shadow-red-100 transition-all transform active:scale-95"
            >
              Create Campaign
            </button>
          </div>

        </form>
      </div>
      
    </div>
  );
};

export default CreateCampaign;