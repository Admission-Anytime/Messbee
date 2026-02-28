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

  // FAQ Categories
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

  // FAQ Data
  const faqs = [
    {
      id: 1,
      category: "general",
      question: "What is Messbee Business?",
      answer: "Messbee Business is a comprehensive WhatsApp Business API platform that enables businesses to automate customer communication, manage conversations, send bulk messages, and analyze messaging metrics. It's designed for small to medium-sized businesses looking to leverage WhatsApp for customer engagement.",
    },
    {
      id: 2,
      category: "general",
      question: "How does Messbee differ from WhatsApp Business app?",
      answer: "While the WhatsApp Business app is limited to one device and manual operations, Messbee uses the official WhatsApp Business API which allows multiple users, automation, bulk messaging, CRM integration, advanced analytics, and API access. It's built for businesses with higher messaging volumes and automation needs.",
    },
    {
      id: 3,
      category: "messaging",
      question: "How many messages can I send per day?",
      answer: "Message limits depend on your WhatsApp Business Account tier and phone number quality rating. Typically, new accounts start with lower limits (1,000 conversations/day) which automatically increase based on message quality and engagement. Check your dashboard under Analytics to see your current limit.",
    },
    {
      id: 4,
      category: "messaging",
      question: "What is the difference between template and session messages?",
      answer: "Template messages are pre-approved messages used to initiate conversations with customers (can be sent anytime). Session messages are free-form messages that can only be sent within 24 hours after a customer messages you first. Template messages may incur charges while session messages are free.",
    },
    {
      id: 5,
      category: "messaging",
      question: "How long does it take for message templates to be approved?",
      answer: "Most templates are reviewed and approved within 24 hours. However, during high-volume periods, it might take up to 48 hours. Make sure your templates follow WhatsApp's guidelines to avoid rejection. You can check template status in the Templates section.",
    },
    {
      id: 6,
      category: "billing",
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), debit cards, UPI, net banking, and digital wallets. For enterprise plans, we also offer invoice-based billing with NET-30 terms. Payment information can be managed in Plan & Pricing > Payment Methods.",
    },
    {
      id: 7,
      category: "billing",
      question: "How does WhatsApp conversation-based pricing work?",
      answer: "WhatsApp charges per conversation, not per message. A conversation is a 24-hour window that starts when you send a template message or when a customer messages you. Multiple messages within this window count as one conversation. Pricing varies by country and conversation type (marketing, utility, service, or authentication).",
    },
    {
      id: 8,
      category: "billing",
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time from the Plan & Pricing section. Your service will remain active until the end of your current billing period. No partial refunds are provided for unused time, but you won't be charged for the next billing cycle.",
    },
    {
      id: 9,
      category: "account",
      question: "How do I connect my WhatsApp Business Account?",
      answer: "Go to Settings > WhatsApp API and click 'Connect Number'. You'll need to verify your business phone number via OTP. Make sure the number isn't registered on regular WhatsApp or WhatsApp Business app, as one number can only be used on one platform at a time.",
    },
    {
      id: 10,
      category: "account",
      question: "Can I use multiple phone numbers on one account?",
      answer: "Yes, our Business and Enterprise plans support multiple phone numbers. Each number will have its own message quota and can be managed separately. This is useful for businesses operating in multiple regions or departments. Contact support to add additional numbers.",
    },
    {
      id: 11,
      category: "account",
      question: "How do I add team members to my account?",
      answer: "Go to Settings > Manage Teams and click 'Invite Team Member'. Enter their email address and assign a role (Admin, Manager, Support Agent, or Sales Lead). They'll receive an invitation email with setup instructions. You can manage permissions for each role in the same section.",
    },
    {
      id: 12,
      category: "api",
      question: "How do I get my API key?",
      answer: "Navigate to Settings > Developer API. Your API key and secret will be displayed there. You can also regenerate keys if needed. Keep your API credentials secure and never share them publicly. Use environment variables when implementing in your applications.",
    },
    {
      id: 13,
      category: "api",
      question: "What are the API rate limits?",
      answer: "Standard plans have a rate limit of 100 requests per minute per API key. Premium plans get 500 requests per minute. Enterprise plans have custom limits based on requirements. Rate limit information is included in API response headers (X-RateLimit-Remaining, X-RateLimit-Reset).",
    },
    {
      id: 14,
      category: "api",
      question: "Do you have webhooks for incoming messages?",
      answer: "Yes, you can configure webhooks to receive real-time notifications for incoming messages, message status updates, and other events. Set up webhooks in Settings > Developer API > Webhooks. We'll send POST requests to your endpoint with event data in JSON format.",
    },
    {
      id: 15,
      category: "automation",
      question: "How do I set up automated responses?",
      answer: "Go to Automation section and create a new flow. You can set triggers (keywords, time-based, welcome messages) and define automated responses. Use quick replies for common questions or set up complex multi-step workflows with conditional logic for advanced scenarios.",
    },
    {
      id: 16,
      category: "automation",
      question: "Can I schedule messages for later?",
      answer: "Yes, when creating a campaign, select 'Schedule for Later' and choose your desired date and time. Scheduled messages will be sent automatically at the specified time. You can also set recurring campaigns for regular communications like newsletters or reminders.",
    },
    {
      id: 17,
      category: "contacts",
      question: "How do I import my existing contacts?",
      answer: "Go to Contacts > Import and upload a CSV or Excel file. Make sure your file has columns for phone numbers (in international format) and other details like name, email. Map the columns during import and review before confirming. We support bulk imports of up to 50,000 contacts at once.",
    },
    {
      id: 18,
      category: "contacts",
      question: "How do custom fields work?",
      answer: "Custom fields let you store additional information about contacts beyond standard fields (name, phone, email). Create custom fields in Settings > Custom Fields, then use them in contact profiles, message templates, and automation. Examples: industry, purchase history, or customer tier.",
    },
    {
      id: 19,
      category: "contacts",
      question: "What are contact labels and how do I use them?",
      answer: "Labels are tags you can assign to contacts for organization and segmentation. Create labels in Settings > Labels (e.g., 'VIP Customer', 'Lead', 'Support Required'). Use labels to filter contacts, create targeted campaigns, and organize your contact database efficiently.",
    },
    {
      id: 20,
      category: "general",
      question: "Is my data secure on Messbee?",
      answer: "Yes, we take security seriously. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We're compliant with GDPR and follow industry best practices. Regular security audits are conducted. We never share your data with third parties without explicit consent.",
    },
  ];

  // Filter FAQs based on search and category
  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategory === "all" || faq.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  // Toggle FAQ open/close
  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#10B981] to-[#059669] rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
            <QuestionMarkCircleIcon className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              Frequently Asked Questions
            </h1>
            <p className="text-white/90 text-lg">
              Find answers to common questions about Messbee Business. Can't
              find what you're looking for? Contact our support team.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/95 backdrop-blur-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-white/30 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Left Sidebar - Categories */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 sticky top-6">
            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
              Categories
            </h3>
            <div className="space-y-1">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;
                const categoryCount = faqs.filter(
                  (faq) => category.id === "all" || faq.category === category.id
                ).length;

                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                      isActive
                        ? "bg-emerald-50 text-[#10B981] font-semibold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1 text-sm">{category.label}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-[#10B981] text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {categoryCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Contact Support Card */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-bold text-blue-900 mb-2">
                  Still Need Help?
                </h4>
                <p className="text-xs text-blue-700 mb-3">
                  Our support team is ready to assist you.
                </p>
                <a
                  href="/admin/help/support"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center text-sm font-semibold py-2 rounded-lg transition-colors"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - FAQ List */}
        <div className="lg:col-span-3 space-y-6">
          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing{" "}
              <span className="font-semibold text-slate-800">
                {filteredFaqs.length}
              </span>{" "}
              {filteredFaqs.length === 1 ? "question" : "questions"}
              {searchQuery && (
                <span>
                  {" "}
                  for "<span className="font-semibold">{searchQuery}</span>"
                </span>
              )}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-sm text-[#10B981] hover:underline font-medium"
              >
                Clear search
              </button>
            )}
          </div>

          {/* FAQ List */}
          {filteredFaqs.length > 0 ? (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                const categoryInfo = categories.find(
                  (cat) => cat.id === faq.category
                );

                return (
                  <div
                    key={faq.id}
                    className={`bg-white rounded-xl border-2 transition-all ${
                      isOpen
                        ? "border-[#10B981] shadow-md"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full p-5 text-left flex items-start gap-4"
                    >
                      <div
                        className={`flex-shrink-0 mt-1 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        <ChevronDownIcon
                          className={`w-5 h-5 ${
                            isOpen ? "text-[#10B981]" : "text-slate-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-bold mb-1 ${
                            isOpen ? "text-[#10B981]" : "text-slate-800"
                          }`}
                        >
                          {faq.question}
                        </h3>
                        {categoryInfo && (
                          <span className="inline-block text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                            {categoryInfo.label}
                          </span>
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pl-14">
                        <div className="prose prose-sm max-w-none">
                          <p className="text-slate-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            // No Results
            <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-slate-200">
              <QuestionMarkCircleIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                No results found
              </h3>
              <p className="text-slate-600 mb-6">
                We couldn't find any FAQs matching "{searchQuery}".
                <br />
                Try different keywords or contact our support team.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                  className="px-5 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  Clear Filters
                </button>
                <a
                  href="/admin/help/support"
                  className="px-5 py-2 bg-[#10B981] text-white rounded-lg font-medium hover:bg-[#059669] transition-colors"
                >
                  Contact Support
                </a>
              </div>
            </div>
          )}

          {/* Help Footer */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 mt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  Didn't find your answer?
                </h3>
                <p className="text-sm text-slate-600">
                  Our support team is available 24/7 to help you.
                </p>
              </div>
              <div className="flex gap-3">
                <a
                  href="mailto:support@messbee.com"
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <EnvelopeIcon className="w-4 h-4" />
                  Email Us
                </a>
                <a
                  href="tel:+918765432109"
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#10B981] text-white rounded-lg font-medium hover:bg-[#059669] transition-colors shadow-sm"
                >
                  <PhoneIcon className="w-4 h-4" />
                  Call Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faq;