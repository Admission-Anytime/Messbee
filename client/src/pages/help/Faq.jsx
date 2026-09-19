import React, { useState } from "react";
import {
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  CodeBracketIcon,
  BellAlertIcon,
  UserGroupIcon,
  ChevronDownIcon,
  BookOpenIcon,
  PhoneIcon,  
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

const Faq = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaqId, setOpenFaqId] = useState(null);

  const categories = [
    { id: "all", label: "All Topics", icon: BookOpenIcon, color: "slate" },
    { id: "general", label: "General", icon: QuestionMarkCircleIcon, color: "blue" },
    { id: "messaging", label: "Messaging", icon: ChatBubbleLeftRightIcon, color: "green" },
    { id: "billing", label: "Billing", icon: CreditCardIcon, color: "purple" },
    { id: "account", label: "Account", icon: ShieldCheckIcon, color: "orange" },
    { id: "api", label: "API & Integration", icon: CodeBracketIcon, color: "red" },
    { id: "automation", label: "Automation", icon: BellAlertIcon, color: "indigo" },
    { id: "contacts", label: "Contacts", icon: UserGroupIcon, color: "teal" },
  ];

  const faqs = [
    {
      id: 1,
      category: "general",
      question: "What is Messbee Business?",
      answer: "Messbee Business is a comprehensive WhatsApp Business API platform that enables businesses to automate customer communication, manage conversations, send bulk messages, and analyze messaging metrics.",
    },
    {
      id: 2,
      category: "general",
      question: "How does Messbee differ from WhatsApp Business app?",
      answer: "While the WhatsApp Business app is limited to one device and manual operations, Messbee uses the official WhatsApp Business API which allows multiple users, automation, bulk messaging, CRM integration, advanced analytics, and API access.",
    },
    {
      id: 3,
      category: "messaging",
      question: "How many messages can I send per day?",
      answer: "Message limits depend on your WhatsApp Business Account tier and phone number quality rating. Typically, new accounts start with lower limits (1,000 conversations/day) which automatically increase based on message quality.",
    },
    {
      id: 4,
      category: "messaging",
      question: "What is the difference between template and session messages?",
      answer: "Template messages are pre-approved messages used to initiate conversations with customers. Session messages are free-form messages that can only be sent within 24 hours after a customer messages you first.",
    },
    {
      id: 5,
      category: "messaging",
      question: "How long does it take for message templates to be approved?",
      answer: "Most templates are reviewed and approved within 24 hours. However, during high-volume periods, it might take up to 48 hours.",
    },
    {
      id: 6,
      category: "billing",
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), debit cards, UPI, net banking, and digital wallets.",
    },
    {
      id: 7,
      category: "billing",
      question: "How does WhatsApp conversation-based pricing work?",
      answer: "WhatsApp charges per conversation, not per message. A conversation is a 24-hour window that starts when you send a template message or when a customer messages you.",
    },
    {
      id: 8,
      category: "billing",
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time from the Plan & Pricing section. Your service will remain active until the end of your current billing period.",
    },
    {
      id: 9,
      category: "account",
      question: "How do I connect my WhatsApp Business Account?",
      answer: "Go to Settings > WhatsApp API and click 'Connect Number'. You'll need to verify your business phone number via OTP.",
    },
    {
      id: 10,
      category: "account",
      question: "Can I use multiple phone numbers on one account?",
      answer: "Yes, our Business and Enterprise plans support multiple phone numbers. Each number will have its own message quota and can be managed separately.",
    },
    {
      id: 11,
      category: "account",
      question: "How do I add team members to my account?",
      answer: "Go to Settings > Manage Teams and click 'Invite Team Member'. Enter their email address and assign a role.",
    },
    {
      id: 12,
      category: "api",
      question: "How do I get my API key?",
      answer: "Navigate to Settings > Developer API. Your API key and secret will be displayed there. You can also regenerate keys if needed.",
    },
    {
      id: 13,
      category: "api",
      question: "What are the API rate limits?",
      answer: "Standard plans have a rate limit of 100 requests per minute per API key. Premium plans get 500 requests per minute.",
    },
    {
      id: 14,
      category: "api",
      question: "Do you have webhooks for incoming messages?",
      answer: "Yes, you can configure webhooks to receive real-time notifications for incoming messages, message status updates, and other events.",
    },
    {
      id: 15,
      category: "automation",
      question: "How do I set up automated responses?",
      answer: "Go to Automation section and create a new flow. You can set triggers and define automated responses.",
    },
    {
      id: 16,
      category: "automation",
      question: "Can I schedule messages for later?",
      answer: "Yes, when creating a campaign, select 'Schedule for Later' and choose your desired date and time.",
    },
    {
      id: 17,
      category: "contacts",
      question: "How do I import my existing contacts?",
      answer: "Go to Contacts > Import and upload a CSV or Excel file. We support bulk imports of up to 50,000 contacts at once.",
    },
    {
      id: 18,
      category: "contacts",
      question: "How do custom fields work?",
      answer: "Custom fields let you store additional information about contacts beyond standard fields (name, phone, email).",
    },
    {
      id: 19,
      category: "contacts",
      question: "What are contact labels and how do I use them?",
      answer: "Labels are tags you can assign to contacts for organization and segmentation. Create labels in Settings > Labels.",
    },
    {
      id: 20,
      category: "general",
      question: "Is my data secure on Messbee?",
      answer: "Yes, we take security seriously. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We're compliant with global security standards including GDPR.",
    },
    {
      id: 21,
      category: "messaging",
      question: "How does the 24-hour customer service window work?",
      answer: "When a customer sends a message to your WhatsApp business phone number, a 24-hour customer service window opens. Within this window, your business can send free-form session messages without pre-approved templates. Once the 24 hours expire, you can only re-engage the customer using an approved template message.",
    },
    {
      id: 22,
      category: "messaging",
      question: "What causes WhatsApp message templates to get rejected?",
      answer: "Templates are rejected by Meta if they violate Commerce or Business policies. Common reasons include: missing sample variable values, aggressive or misleading promotional language, grammar errors, asking for sensitive personal or banking info, or selecting the wrong category (e.g., submitting marketing content under utility).",
    },
    {
      id: 23,
      category: "messaging",
      question: "What are the allowed media file formats and size limits?",
      answer: "Messbee supports documents (PDF, DOCX up to 100MB), images (JPEG, PNG up to 5MB), audio (AAC, MP3 up to 16MB), and videos (MP4, 3GPP up to 16MB). For best delivery speed, we recommend compressing videos and keeping PDFs under 10MB.",
    },
    {
      id: 24,
      category: "messaging",
      question: "How does the Phone Number Quality Rating affect messaging?",
      answer: "Meta assigns a Quality Rating (High/Green, Medium/Yellow, Low/Red) to your number based on user feedback (blocks, reports, and spam flags). If your rating drops to Red, your messaging tier limit may be restricted. To maintain a High rating, only message opted-in users and avoid sending irrelevant broadcasts.",
    },
    {
      id: 25,
      category: "messaging",
      question: "How do Messaging Tier limits scale over time?",
      answer: "New verified accounts typically start at Tier 1 (1,000 unique recipients per rolling 24-hour period). When you consistently send at least half of your current limit with high quality over 7 days, Meta automatically upgrades your account to Tier 2 (10,000), Tier 3 (100,000), and ultimately Tier 4 (Unlimited).",
    },
    {
      id: 26,
      category: "billing",
      question: "What are WhatsApp Conversation Credits (WCC)?",
      answer: "WCC is your prepaid messaging wallet in Messbee. Every conversation dispatched (Marketing, Utility, Authentication, or Service) automatically deducts the exact Meta rate from your WCC balance. You can top up your wallet anytime via card, UPI, or net banking.",
    },
    {
      id: 27,
      category: "billing",
      question: "What happens when my WCC wallet balance runs low?",
      answer: "When your balance drops below the threshold (default ₹200), an automated real-time alert is triggered in your dashboard and via email. Active campaigns may be paused if your credits reach zero to prevent message delivery failures.",
    },
    {
      id: 28,
      category: "billing",
      question: "Do customer-initiated Service conversations cost money?",
      answer: "Meta provides 1,000 free Service conversations per WhatsApp Business Account every calendar month. Beyond the free tier, customer service conversations are billed at the standard Meta domestic service rate.",
    },
    {
      id: 29,
      category: "account",
      question: "How can I get the official WhatsApp Green Tick badge?",
      answer: "The Green Tick (Official Business Account badge) is granted directly by Meta to verified, notable brands. To apply: your Meta Business Manager must be fully verified, 2FA enabled, and your brand must have strong organic media presence. You can submit your application directly from Settings > WAPI.",
    },
    {
      id: 30,
      category: "account",
      question: "Can I migrate an existing WhatsApp number from another BSP to Messbee?",
      answer: "Yes! You can seamlessly migrate your existing WABA number without losing your phone number or business profile. Simply initiate the 2FA migration process in our Embedded Signup, and your number will transition to Messbee with zero downtime.",
    },
    {
      id: 31,
      category: "account",
      question: "What role permissions are supported in Messbee?",
      answer: "Messbee provides Role-Based Access Control (RBAC): ADMIN (full workspace control, billing, API keys), MANAGER (campaign creation, contact import, template management), and AGENT (live inbox chatting, ticket replies, customer interaction only).",
    },
    {
      id: 32,
      category: "automation",
      question: "How do Flow Canvas and Chatbot automations work?",
      answer: "Our visual drag-and-drop Flow Canvas lets you design multi-step conversational flows, interactive button menus, conditional routing, and automated webhook triggers without writing a single line of code.",
    },
    {
      id: 33,
      category: "automation",
      question: "How do I set up automated Away Messages during non-business hours?",
      answer: "Navigate to Automation > Welcome & Away Messages. Set your working hours and define an automated out-of-office response that immediately notifies customers when your team is offline.",
    },
    {
      id: 34,
      category: "automation",
      question: "Can chatbots hand off conversations to human agents?",
      answer: "Yes. In any automation flow, you can add an 'Agent Assignment' node. When triggered, the bot steps back, assigns the conversation to a designated team or agent, and notifies them in the Unified Inbox.",
    },
    {
      id: 35,
      category: "contacts",
      question: "What is WhatsApp Opt-in and why is it mandatory?",
      answer: "Meta policies strictly require that customers explicitly consent to receive business messages. Opt-in can be collected via website checkboxes, SMS confirmation, or direct customer-initiated WhatsApp messages. Sending un-solicited messages will trigger account bans.",
    },
    {
      id: 36,
      category: "contacts",
      question: "How do I handle customer unsubscribes / STOP keywords?",
      answer: "Messbee automatically recognizes opt-out keywords like STOP, CANCEL, or UNSUBSCRIBE. When received, the contact is flagged as opted-out and automatically excluded from future marketing broadcasts.",
    },
    {
      id: 37,
      category: "contacts",
      question: "Can I segment contacts based on custom tags and attributes?",
      answer: "Yes! You can create dynamic segments using labels, city, lifetime purchase value, or custom field values. Segments automatically update as new contacts matching the criteria are added.",
    },
    {
      id: 38,
      category: "general",
      question: "What is the difference between Domestic and International messaging rates?",
      answer: "Domestic messages (+91 to India) use base Meta conversation pricing. International numbers apply country-specific multipliers (e.g., 1.8x for USA/Canada, 3.8x for UAE) based on Meta's global destination pricing tables.",
    }
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategory === "all" || faq.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 p-4 sm:p-6 font-['Urbanist']">
      <div className="bg-gradient-to-r from-[#10B981] to-[#059669] rounded-xl p-5 sm:p-6 text-white shadow-md">
        <div className="flex items-start gap-3">
          <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
            <QuestionMarkCircleIcon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-bold mb-1">Frequently Asked Questions</h1>
            <p className="text-white/90 text-xs sm:text-sm">
              Find answers to common questions about Messbee Business.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/95 backdrop-blur-sm text-xs sm:text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-white/30 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-5">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200 sticky top-4">
            <h3 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wide">Categories</h3>
            <div className="space-y-0.5">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;
                const categoryCount = faqs.filter((faq) => category.id === "all" || faq.category === category.id).length;

                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left transition-all ${
                      isActive ? "bg-emerald-50 text-[#10B981] font-semibold" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-xs">{category.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-[#10B981] text-white" : "bg-slate-200 text-slate-600"}`}>
                      {categoryCount}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                <h4 className="text-xs font-bold text-blue-900 mb-1">Still Need Help?</h4>
                <p className="text-[11px] text-blue-700 mb-2.5">Our support team is ready to assist you.</p>
                <a href="/admin/help/support" className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center text-xs font-semibold py-1.5 rounded-md transition-colors">
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600">
              Showing <span className="font-semibold text-slate-800">{filteredFaqs.length}</span> {filteredFaqs.length === 1 ? "question" : "questions"}
              {searchQuery && <span> for "<span className="font-semibold">{searchQuery}</span>"</span>}
            </p>
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-xs text-[#10B981] hover:underline font-medium">Clear search</button>
            )}
          </div>

          {filteredFaqs.length > 0 ? (
            <div className="space-y-2.5">
              {filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                const categoryInfo = categories.find((cat) => cat.id === faq.category);

                return (
                  <div key={faq.id} className={`bg-white rounded-lg border transition-all ${isOpen ? "border-[#10B981] shadow-sm" : "border-slate-200 hover:border-slate-300"}`}>
                    <button onClick={() => toggleFaq(faq.id)} className="w-full p-3.5 text-left flex items-start gap-3">
                      <div className={`flex-shrink-0 mt-0.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                        <ChevronDownIcon className={`w-4 h-4 ${isOpen ? "text-[#10B981]" : "text-slate-400"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-xs sm:text-sm font-semibold mb-1 ${isOpen ? "text-[#10B981]" : "text-slate-800"}`}>{faq.question}</h3>
                        {categoryInfo && <span className="inline-block text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{categoryInfo.label}</span>}
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-3.5 pl-10">
                        <div className="prose prose-xs max-w-none"><p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 text-center border-2 border-dashed border-slate-200">
              <QuestionMarkCircleIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800 mb-1">No results found</h3>
              <p className="text-xs text-slate-600">We couldn't find any FAQs matching "{searchQuery}".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Faq;