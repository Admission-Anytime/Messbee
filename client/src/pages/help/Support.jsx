import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon, RocketLaunchIcon, CodeBracketIcon, CreditCardIcon, ShieldCheckIcon, MegaphoneIcon,
  WrenchScrewdriverIcon, ChevronDownIcon, ChatBubbleLeftRightIcon, EnvelopeIcon, PhoneIcon, ClockIcon,
} from "@heroicons/react/24/solid";

export default function Support() {
  const navigate = useNavigate();
  const [openArticle, setOpenArticle] = useState(0);

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
    <div className="bg-gray-50 min-h-full pb-16">
      <div className="max-w-6xl mx-auto px-6 pt-14 pb-6 space-y-12">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-gray-900">How can we help you today?</h1>
          <p className="text-gray-500 text-lg">Search our knowledge base for answers about MessBee WhatsApp API</p>
          <div className="max-w-xl mx-auto flex items-center bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="pl-4 pr-2 text-gray-400"><MagnifyingGlassIcon className="w-5 h-5"/></div>
            <input placeholder="Search for articles, guides, and more..." className="flex-1 py-3 pr-4 text-sm outline-none" />
            <button className="bg-green-600 text-white font-bold px-6 py-2 rounded-xl mr-2 hover:bg-green-700 transition">Search</button>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Browse by Category</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.slug} onClick={() => navigate(`/admin/help/support/${cat.slug}`)} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition cursor-pointer">
                  <div className="w-10 h-10 flex items-center justify-center bg-green-50 rounded-lg mb-3"><Icon className="w-5 h-5 text-green-600" /></div>
                  <p className="font-semibold text-gray-900">{cat.title}</p>
                  <p className="text-sm text-gray-500">{cat.count} articles</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Support Ticket</h3>
            <div className="space-y-4">
              <input placeholder="Your Name" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm" />
              <input placeholder="Email Address" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm" />
              <input placeholder="Subject" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm" />
              <textarea rows="4" placeholder="Describe your issue..." className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm" />
              <button className="bg-green-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-green-700 transition">Submit Ticket</button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
              <h3 className="font-semibold text-gray-900 text-lg">Contact Information</h3>
              <div className="flex gap-3">
                <EnvelopeIcon className="w-5 h-5 text-green-600"/><div className="leading-tight"><p className="font-medium text-gray-900">Email</p><p className="text-sm text-gray-500">support@messbee.com</p></div>
              </div>
              <div className="flex gap-3">
                <PhoneIcon className="w-5 h-5 text-green-600"/><div className="leading-tight"><p className="font-medium text-gray-900">Phone</p><p className="text-sm text-gray-500">+91 876 543 2109</p></div>
              </div>
              <div className="flex gap-3">
                <ClockIcon className="w-5 h-5 text-green-600"/><div className="leading-tight"><p className="font-medium text-gray-900">Business Hours</p><p className="text-sm text-gray-500">Mon-Fri: 9:00 AM - 6:00 PM IST</p><p className="text-sm text-gray-500">24/7 Email Support</p></div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto pt-6">
          <h2 className="text-2xl font-bold text-center text-gray-900">Featured Articles</h2>
          <p className="text-gray-500 text-center mb-6">Most frequent questions from our partners</p>
          <div className="space-y-3">
            {articles.map((article, i) => {
              const open = openArticle === i;
              return (
                <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setOpenArticle(open ? null : i)} className="w-full flex justify-between items-center px-5 py-4 text-left font-semibold text-gray-800">
                    {article.title} <ChevronDownIcon className={`w-5 h-5 transition ${open ? "rotate-180" : ""}`} />
                  </button>
                  {open && <div className="px-5 pb-5 text-sm text-gray-500">{article.content}</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#0F172A] rounded-2xl px-10 py-10 text-center text-white mt-12">
          <h3 className="text-2xl font-semibold mb-2">Still need help?</h3>
          <p className="text-gray-300 mb-6">Can't find the answer you're looking for? Our dedicated support team is available 24/7 to help you.</p>
          <div className="flex justify-center gap-4">
            <button className="bg-green-600 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-green-700">
              <ChatBubbleLeftRightIcon className="w-5"/> Chat with us
            </button>
            <button className="bg-gray-700 px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-600">
              <EnvelopeIcon className="w-5"/> Email Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}