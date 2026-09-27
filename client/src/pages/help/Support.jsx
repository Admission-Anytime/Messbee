import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon, RocketLaunchIcon, CodeBracketIcon, CreditCardIcon, ShieldCheckIcon, MegaphoneIcon,
  WrenchScrewdriverIcon, ChevronDownIcon, ChatBubbleLeftRightIcon, EnvelopeIcon, PhoneIcon, ClockIcon,
} from "@heroicons/react/24/solid";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Support() {
  const navigate = useNavigate();
  const [openArticle, setOpenArticle] = useState(0);
  
  const [ticketData, setTicketData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'Technical',
    priority: 'Normal',
    description: ''
  });

  const [recentTickets, setRecentTickets] = useState([
    { id: 'TKT-89421', subject: 'Template variable mapping issue', category: 'Template', priority: 'High', status: 'In Review', date: 'Yesterday' },
    { id: 'TKT-89104', subject: 'WCC wallet top-up invoice request', category: 'Billing', priority: 'Normal', status: 'Resolved', date: '3 days ago' },
  ]);

  const handleTicketSubmit = () => {
    if (!ticketData.name || !ticketData.email || !ticketData.subject || !ticketData.description) {
      toast.error("Please fill all the fields before submitting.");
      return;
    }

    const newTicket = {
      id: `TKT-${Math.floor(10000 + Math.random() * 90000)}`,
      subject: ticketData.subject,
      category: ticketData.category,
      priority: ticketData.priority,
      status: 'Open',
      date: 'Just now'
    };

    setRecentTickets([newTicket, ...recentTickets]);
    toast.success(`Support ticket ${newTicket.id} created successfully! Our team will respond within 2 hours.`);
    setTicketData({ name: '', email: '', subject: '', category: 'Technical', priority: 'Normal', description: '' });
  };

  const handleChatWithUs = () => {
    toast.info("Live chat is connecting...");
  };

  const handleEmailSupport = () => {
    window.location.href = "mailto:support@messbee.com?subject=Support Request";
  };

  const categories = [
    { title: "Getting Started", icon: RocketLaunchIcon, count: 12, slug: "get-started" },
    { title: "API & Webhooks", icon: CodeBracketIcon, count: 24, slug: "api-webhooks" },
    { title: "Billing & Plans", icon: CreditCardIcon, count: 8, slug: "billing-plans" },
    // ✅ ADDED WHATSAPP COMPLIANCE BACK!
    { title: "WhatsApp Compliance", icon: ShieldCheckIcon, count: 15, slug: "whatsapp-compliance" },
    { title: "Campaigns", icon: MegaphoneIcon, count: 10, slug: "campaigns" },
    { title: "Troubleshooting", icon: WrenchScrewdriverIcon, count: 18, slug: "troubleshooting" },
  ];

  const articles = [
    {
      title: "How to connect your first phone number?",
      content: <>To connect your first phone number, navigate to <span className="text-green-600 font-semibold">Dashboard → Numbers</span> section. Click on “Add New Number” and follow the Meta embedded signup flow.</>,
    },
    {
      title: "What are the different WhatsApp Message templates?",
      content: "Templates allow businesses to send notifications such as order confirmations, shipping updates and reminders.",
    },
    {
      title: "How to handle incoming webhooks?",
      content: "Webhooks allow your system to receive real-time updates like incoming messages, delivery reports and read receipts.",
    },
    {
      title: "Managing your subscription and billing",
      content: "Billing and invoices can be managed from the Billing & Plans section inside your dashboard.",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-full pb-10 font-['Urbanist']">
      <ToastContainer />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-6 space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">How can we help you today?</h1>
          <p className="text-gray-500 text-xs sm:text-sm">Search our knowledge base for answers about MessBee WhatsApp API</p>
          <div className="max-w-md mx-auto flex items-center bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="pl-3 pr-2 text-gray-400"><MagnifyingGlassIcon className="w-4 h-4"/></div>
            <input placeholder="Search for articles, guides, and more..." className="flex-1 py-2 pr-3 text-xs outline-none" />
            <button className="bg-green-600 text-white font-bold px-4 py-1.5 rounded-lg text-xs mr-1.5 hover:bg-green-700 transition">Search</button>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.slug} onClick={() => navigate(`/admin/help/support/${cat.slug}`)} className="bg-white border border-gray-200 rounded-lg p-3.5 hover:shadow-md transition cursor-pointer">
                  <div className="w-7 h-7 flex items-center justify-center bg-green-50 rounded-md mb-2"><Icon className="w-4 h-4 text-green-600" /></div>
                  <p className="font-semibold text-xs text-gray-900">{cat.title}</p>
                  <p className="text-[11px] text-gray-500">{cat.count} articles</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white border border-gray-200 rounded-xl p-4.5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Submit Support Ticket</h3>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">SLA: &lt; 2h Response</span>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={ticketData.name} onChange={(e) => setTicketData({...ticketData, name: e.target.value})} placeholder="Your Name" className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" />
                  <input value={ticketData.email} onChange={(e) => setTicketData({...ticketData, email: e.target.value})} placeholder="Email Address" type="email" className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Category</label>
                    <select
                      value={ticketData.category}
                      onChange={(e) => setTicketData({...ticketData, category: e.target.value})}
                      className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-xs text-gray-700 bg-white outline-none focus:border-green-500"
                    >
                      <option value="Technical">Technical Issue</option>
                      <option value="Billing">Billing &amp; WCC Wallet</option>
                      <option value="Template">Template Approval</option>
                      <option value="WABA">WhatsApp WABA Connection</option>
                      <option value="General">General Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Priority</label>
                    <div className="flex gap-1.5">
                      {['Low', 'Normal', 'High', 'Urgent'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setTicketData({...ticketData, priority: p})}
                          className={`flex-1 py-1 text-[11px] font-semibold rounded border transition-colors ${
                            ticketData.priority === p
                              ? 'bg-green-600 text-white border-green-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <input value={ticketData.subject} onChange={(e) => setTicketData({...ticketData, subject: e.target.value})} placeholder="Subject / Summary" className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" />
                <textarea value={ticketData.description} onChange={(e) => setTicketData({...ticketData, description: e.target.value})} rows="3" placeholder="Describe your issue in detail..." className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all resize-none" />
                <button onClick={handleTicketSubmit} className="bg-green-600 text-white font-bold px-4 py-2 rounded-md text-xs hover:bg-green-700 transition active:scale-95 cursor-pointer">Submit Ticket</button>
              </div>
            </div>

            {/* Live Ticket Tracking Section */}
            {recentTickets.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-2.5">Your Active &amp; Recent Tickets</h4>
                <div className="space-y-2">
                  {recentTickets.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-white transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[11px] font-bold text-green-700 bg-green-100/70 px-2 py-0.5 rounded">{t.id}</span>
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{t.subject}</p>
                          <p className="text-[10px] text-gray-400">{t.category} • Priority: {t.priority} • {t.date}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : t.status === 'In Review' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm">Contact Information</h3>
              <div className="flex gap-2.5">
                <EnvelopeIcon className="w-4 h-4 text-green-600 mt-0.5"/><div className="leading-tight"><p className="font-medium text-xs text-gray-900">Email</p><p className="text-[11px] text-gray-500">support@messbee.com</p></div>
              </div>
              <div className="flex gap-2.5">
                <PhoneIcon className="w-4 h-4 text-green-600 mt-0.5"/><div className="leading-tight"><p className="font-medium text-xs text-gray-900">Phone</p><p className="text-[11px] text-gray-500">+91 876 543 2109</p></div>
              </div>
              <div className="flex gap-2.5">
                <ClockIcon className="w-4 h-4 text-green-600 mt-0.5"/><div className="leading-tight"><p className="font-medium text-xs text-gray-900">Business Hours</p><p className="text-[11px] text-gray-500">Mon-Fri: 9:00 AM - 6:00 PM IST</p><p className="text-[11px] text-gray-500">24/7 Email Support</p></div>
              </div>
            </div>

            {/* Platform Health Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">System Health</h4>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-gray-600">
                  <span>WhatsApp Cloud API</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Operational</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Campaign Dispatcher</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Operational</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Webhooks Gateway</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Operational</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Billing &amp; Payments</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto pt-3">
          <h2 className="text-base font-bold text-center text-gray-900">Featured Articles</h2>
          <p className="text-gray-500 text-xs text-center mb-4">Most frequent questions from our partners</p>
          <div className="space-y-2">
            {articles.map((article, i) => {
              const open = openArticle === i;
              return (
                <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => setOpenArticle(open ? null : i)} className="w-full flex justify-between items-center px-3.5 py-2.5 text-left text-xs font-semibold text-gray-800">
                    {article.title} <ChevronDownIcon className={`w-4 h-4 transition ${open ? "rotate-180" : ""}`} />
                  </button>
                  {open && <div className="px-3.5 pb-3 text-xs text-gray-500 leading-relaxed">{article.content}</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#0F172A] rounded-xl px-6 py-6 text-center text-white mt-8">
          <h3 className="text-base font-bold mb-1.5">Still need help?</h3>
          <p className="text-gray-300 text-xs mb-4 max-w-lg mx-auto">Can't find the answer you're looking for? Our dedicated support team is available 24/7 to help you.</p>
          <div className="flex justify-center gap-3">
            <button onClick={handleChatWithUs} className="bg-green-600 text-white font-bold px-4 py-2 rounded-md text-xs flex items-center gap-1.5 hover:bg-green-700 transition cursor-pointer shadow-sm">
              <ChatBubbleLeftRightIcon className="w-4 h-4"/> Chat with us
            </button>
            <button onClick={handleEmailSupport} className="bg-gray-700 text-white font-bold px-4 py-2 rounded-md text-xs flex items-center gap-1.5 hover:bg-gray-600 transition cursor-pointer shadow-sm">
              <EnvelopeIcon className="w-4 h-4"/> Email Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}