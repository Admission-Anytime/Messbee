import React from "react";

const Introduction = () => {
  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 font-['Urbanist'] text-slate-800">
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 rounded-3xl p-10 md:p-16 mb-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 opacity-20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500 opacity-20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10">
          <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-400/30">Help & Support</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-4 mb-6 leading-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Messbee Business</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed">
            Your all-in-one platform for scaling WhatsApp communication. Discover how to automate, manage, and analyze your customer interactions effortlessly.
          </p>
        </div>
      </div>

      {/* Core Features Grid */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          Core Capabilities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Smart Automation", desc: "Set up auto-replies, chatbots, and routing to handle inquiries 24/7 without manual intervention.", icon: "🤖" },
            { title: "Campaign Management", desc: "Broadcast targeted promotional messages to segmented lists and track delivery and read rates in real-time.", icon: "📢" },
            { title: "Unified Inbox", desc: "Manage thousands of conversations from a single intuitive dashboard built for team collaboration.", icon: "📥" },
            { title: "Rich Media Support", desc: "Send images, videos, documents, and interactive buttons to create engaging customer experiences.", icon: "🖼️" },
            { title: "Advanced Analytics", desc: "Gain actionable insights into agent performance, campaign ROI, and customer engagement metrics.", icon: "📊" },
            { title: "Developer API", desc: "Integrate Messbee directly into your existing CRM, ERP, or custom software via our robust REST APIs.", icon: "⚙️" },
          ].map((feature, i) => (
             <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow hover:-translate-y-1 duration-300 group">
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform origin-left">{feature.icon}</div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
             </div>
          ))}
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 md:p-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Quick Start Guide</h2>
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
          {[
            { step: "1", title: "Connect WhatsApp", desc: "Navigate to Settings > WAPI and link your official WhatsApp Business Number." },
            { step: "2", title: "Import Contacts", desc: "Upload your customer list via CSV in the Contact Management section." },
            { step: "3", title: "Create a Template", desc: "Design a message template and submit it for WhatsApp approval." },
            { step: "4", title: "Launch Campaign", desc: "Select your audience, attach your approved template, and hit send!" },
          ].map((item, i) => (
             <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-500 text-white font-bold text-sm shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                   {item.step}
                </div>
                {/* Content */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-2xl border border-slate-100 shadow-sm group-hover:shadow-md transition-shadow">
                   <h3 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h3>
                   <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
             </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <p className="mt-12 text-center text-sm text-slate-400">
        Need more help? Navigate to the Support Center to chat with our team or submit a ticket.
      </p>
    </div>
  );
};

export default Introduction;