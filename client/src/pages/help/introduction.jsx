import React from "react";

const Introduction = () => {
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 font-['Urbanist'] text-slate-800">
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#10B981] to-[#059669] rounded-2xl p-5 sm:p-7 mb-6 overflow-hidden shadow-md text-white">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-teal-300 opacity-20 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10">
          <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/30 backdrop-blur-sm shadow-sm inline-block">Help &amp; Support</span>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-2.5 mb-2 leading-tight drop-shadow-sm">
            Welcome to <span className="text-emerald-100">Messbee Business</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed font-medium">
            Your all-in-one platform for scaling WhatsApp communication. Discover how to automate, manage, and analyze your customer interactions effortlessly.
          </p>
        </div>
      </div>

      {/* Core Features Grid */}
      <div className="mb-8">
        <h2 className="text-base font-bold text-slate-900 mb-3.5 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          Core Capabilities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[
            { title: "Smart Automation", desc: "Set up auto-replies, chatbots, and routing to handle inquiries 24/7 without manual intervention.", icon: "🤖" },
            { title: "Campaign Management", desc: "Broadcast targeted promotional messages to segmented lists and track delivery and read rates in real-time.", icon: "📢" },
            { title: "Unified Inbox", desc: "Manage thousands of conversations from a single intuitive dashboard built for team collaboration.", icon: "📥" },
            { title: "Rich Media Support", desc: "Send images, videos, documents, and interactive buttons to create engaging customer experiences.", icon: "🖼️" },
            { title: "Advanced Analytics", desc: "Gain actionable insights into agent performance, campaign ROI, and customer engagement metrics.", icon: "📊" },
            { title: "Developer API", desc: "Integrate Messbee directly into your existing CRM, ERP, or custom software via our robust REST APIs.", icon: "⚙️" },
          ].map((feature, i) => (
             <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow hover:-translate-y-0.5 duration-200 group">
                <div className="text-2xl mb-2 group-hover:scale-105 transition-transform origin-left">{feature.icon}</div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">{feature.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{feature.desc}</p>
             </div>
          ))}
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 mb-8">
        <h2 className="text-base font-bold text-slate-900 mb-5 text-center">Quick Start Guide</h2>
        <div className="space-y-5 relative before:absolute before:inset-0 before:ml-3.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
          {[
            { step: "1", title: "Connect WhatsApp", desc: "Navigate to Settings > WAPI and link your official WhatsApp Business Number." },
            { step: "2", title: "Import Contacts", desc: "Upload your customer list via CSV in the Contact Management section." },
            { step: "3", title: "Create a Template", desc: "Design a message template and submit it for WhatsApp approval." },
            { step: "4", title: "Launch Campaign", desc: "Select your audience, attach your approved template, and hit send!" },
          ].map((item, i) => (
             <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Icon */}
                <div className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-white bg-emerald-500 text-white font-bold text-xs shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                   {item.step}
                </div>
                {/* Content */}
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] bg-white p-3 sm:p-3.5 rounded-xl border border-slate-100 shadow-sm group-hover:shadow-md transition-shadow">
                   <h3 className="text-xs font-bold text-slate-900 mb-0.5">{item.title}</h3>
                   <p className="text-[11px] text-slate-500 leading-normal">{item.desc}</p>
                </div>
             </div>
          ))}
        </div>
      </div>

      {/* Popular Setup Guides & Best Practices */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            Popular Setup Guides
          </h2>
          <span className="text-[11px] text-emerald-600 font-semibold cursor-pointer hover:underline">View all guides →</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { tag: "Meta Verification", title: "Getting Green Tick Verified", readTime: "4 min read", desc: "Step-by-step checklist to get the Official Business Account badge from Meta." },
            { tag: "Automation", title: "Building Multi-Step Chatbots", readTime: "6 min read", desc: "Design 24/7 automated flows with button menus, conditions, and agent handover." },
            { tag: "Campaigns", title: "High-Converting Templates", readTime: "5 min read", desc: "Best practices for writing approved WhatsApp templates that drive real customer action." },
            { tag: "Compliance", title: "Maintaining Quality Rating", readTime: "3 min read", desc: "How to avoid user spam reports, protect your tier limits, and keep your number Green." }
          ].map((guide, idx) => (
            <div key={idx} className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group cursor-pointer">
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">{guide.tag}</span>
              <h3 className="text-xs font-bold text-slate-900 mt-2 mb-1 group-hover:text-emerald-600 transition-colors">{guide.title}</h3>
              <p className="text-[11px] text-slate-500 line-clamp-2 mb-2.5 leading-normal">{guide.desc}</p>
              <span className="text-[10px] text-slate-400 font-medium">{guide.readTime}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Reliability Badges */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 sm:p-5 text-white mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-emerald-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <p className="text-xs font-bold">End-to-End Encryption</p>
              <p className="text-[10px] text-slate-400">TLS 1.3 in transit &amp; AES-256 at rest</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-teal-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <p className="text-xs font-bold">99.9% High Availability</p>
              <p className="text-[10px] text-slate-400">Direct Meta Cloud API infrastructure</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-blue-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <div>
              <p className="text-xs font-bold">Dedicated BSP Support</p>
              <p className="text-[10px] text-slate-400">24/7 technical assistance for enterprises</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <p className="mt-4 text-center text-xs text-slate-400">
        Need more help? Navigate to the Support Center to chat with our team or submit a ticket.
      </p>
    </div>
  );
};

export default Introduction;