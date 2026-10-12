import React, { useState } from "react";
import {
  CpuChipIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  FunnelIcon,
  CodeBracketIcon,
  SparklesIcon,
  ClockIcon,
  VariableIcon,
  ShieldCheckIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  BookOpenIcon,
  ShoppingBagIcon,
  TagIcon,
  ArrowsRightLeftIcon,
  LightBulbIcon,
  ListBulletIcon
} from "@heroicons/react/24/outline";

export default function AutomationDocs() {
  const [activeSection, setActiveSection] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedText, setCopiedText] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const sections = [
    { id: "overview", label: "Overview & Visual Canvas", icon: BookOpenIcon },
    { id: "triggers", label: "Trigger Nodes (Entry Points)", icon: LightBulbIcon },
    { id: "messages", label: "Messages & Buttons", icon: ChatBubbleLeftRightIcon },
    { id: "input-collection", label: "Ask Question & Input Data", icon: QuestionMarkCircleIcon },
    { id: "condition-logic", label: "Condition (If / Else Logic)", icon: FunnelIcon },
    { id: "actions-crm", label: "Action Nodes & CRM Tags", icon: TagIcon },
    { id: "ai-assistant", label: "AI Assistant (OpenAI GPT-4o)", icon: SparklesIcon },
    { id: "api-webhooks", label: "API Calls & Webhooks", icon: CodeBracketIcon },
    { id: "delays-timers", label: "Smart Delays & Queues", icon: ClockIcon },
    { id: "ecommerce", label: "Shopify & Meta Commerce", icon: ShoppingBagIcon },
    { id: "variables", label: "Variables & Dynamic Syntax", icon: VariableIcon },
    { id: "best-practices", label: "Routing & Best Practices", icon: ShieldCheckIcon }
  ];

  const filteredSections = sections.filter(s => 
    s.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 font-['Urbanist'] text-slate-800">
      
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 rounded-2xl p-6 sm:p-8 mb-8 overflow-hidden shadow-lg text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400 opacity-20 rounded-full blur-2xl -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/30 backdrop-blur-sm mb-3">
            <CpuChipIcon className="w-3.5 h-3.5" /> Complete Automation Guide
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">
            Messbee WhatsApp Automation &amp; Flow Engine
          </h1>
          <p className="text-xs sm:text-sm text-white/90 max-w-2xl leading-relaxed font-medium">
            Master the visual flow builder. Learn how every node processes messages, handles user responses, evaluates conditions, and connects to the next step.
          </p>
        </div>
      </div>

      {/* Main Layout: Sidebar & Content Area */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="sticky top-6 space-y-4">
            
            {/* Search Input */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search guide sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
              />
            </div>

            {/* Section Links */}
            <nav className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm space-y-1">
              {filteredSections.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 shadow-xs border border-emerald-200"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Quick Stats / Help Box */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-4 text-xs">
              <h4 className="font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
                <SparklesIcon className="w-4 h-4 text-indigo-600" /> Pro Automation Tip
              </h4>
              <p className="text-indigo-700/80 leading-relaxed">
                Connect every leaf interactive node to a <span className="font-semibold text-indigo-900">Next Step</span> so customers never reach an unhandled dead-end in WhatsApp.
              </p>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          
          {/* SECTION 1: OVERVIEW */}
          {activeSection === "overview" && (
            <div className="space-y-6">
              <div>
                <span className="text-emerald-600 font-bold text-xs uppercase tracking-wider">Fundamentals</span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  How the Automation Canvas Works
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Messbee Automations run on an asynchronous, graph-based workflow engine. You build customer journeys by dragging nodes onto the canvas and drawing connection lines (<strong className="text-slate-800">Edges</strong>) between handles.
                </p>
              </div>

              {/* Engine Architecture Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-3">1</div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Nodes (Tasks)</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Each node is a single action: sending a WhatsApp message, asking a question, making an API call, or running conditional logic.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mb-3">2</div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Handles (Ports)</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Outputs on the right of each node (e.g., <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">main-handle</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">true</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">btn-1</code>). Lines drag from outputs to the next node’s input port.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs mb-3">3</div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Session Engine</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Maintains contact session status (<code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">ACTIVE</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">WAITING_FOR_INPUT</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">HANDOFF</code>) to guarantee proper step-by-step sequencing.
                  </p>
                </div>
              </div>

              {/* Session State Lifecycle */}
              <div className="border border-emerald-100 bg-emerald-50/40 rounded-xl p-5">
                <h3 className="text-xs sm:text-sm font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                  <ShieldCheckIcon className="w-4 h-4 text-emerald-600" /> Customer Session States Explained
                </h3>
                <ul className="text-xs text-emerald-800/90 space-y-2 leading-relaxed">
                  <li>• <strong className="text-emerald-950">ACTIVE:</strong> The engine is running nodes automatically (e.g. sending text, adding tags, evaluating conditions).</li>
                  <li>• <strong className="text-emerald-950">WAITING_FOR_INPUT:</strong> The bot asked a question (Input Node) and is paused waiting for the customer to reply.</li>
                  <li>• <strong className="text-emerald-950">WAITING_FOR_EVENT:</strong> The bot is waiting for a button click, poll vote, or timeout timer.</li>
                  <li>• <strong className="text-emerald-950">HANDOFF:</strong> The bot is paused for this customer because a human agent took over in the Live Chat Inbox.</li>
                  <li>• <strong className="text-emerald-950">COMPLETED:</strong> The flow has reached its terminal step and the conversation is ready for future triggers.</li>
                </ul>
              </div>
            </div>
          )}

          {/* SECTION 2: TRIGGERS */}
          {activeSection === "triggers" && (
            <div className="space-y-6">
              <div>
                <span className="text-purple-600 font-bold text-xs uppercase tracking-wider">Entry Points</span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  Trigger Nodes: How Automations Start
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Every automation must begin with a Trigger Node (or a Root Template Node). Triggers evaluate inbound WhatsApp messages or external events and route immediately to their <code className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-mono text-xs">main-handle</code>.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: "Keyword Matching (Exact, Contains, Starts With)",
                    desc: "Activates when a customer texts specific keywords (e.g. 'hi, hello, menu, price'). You can enter multiple comma-separated keywords.",
                    example: "Keyword: 'price, pricing, cost' -> Triggers price list message.",
                    badge: "Most Popular"
                  },
                  {
                    title: "Incoming Message (Any)",
                    desc: "Matches any message received from any contact. Ideal for generic auto-responders or when no specific keyword is provided.",
                    example: "Customer sends 'Can someone call me?' -> Triggers Welcome / Lead Capture Flow.",
                    badge: "Fallback"
                  },
                  {
                    title: "Click-to-WhatsApp Ad (Meta Ads)",
                    desc: "Triggers specifically when a user clicks on an Instagram or Facebook WhatsApp CTA Ad.",
                    example: "Ad pre-filled message -> Launches promotional discount flow.",
                    badge: "Marketing"
                  },
                  {
                    title: "QR Code / Click-to-Chat wa.me Link",
                    desc: "Initiates when customers scan your printable QR code in-store or click a customized wa.me link on your website.",
                    example: "In-store Table QR -> Starts Restaurant Digital Menu bot.",
                    badge: "Omnichannel"
                  },
                  {
                    title: "Media Received (Image, Video, Document, Voice, Location)",
                    desc: "Triggers when customer shares attachments. For instance, payment screenshot verification or voice notes.",
                    example: "Receipt photo sent -> Starts transaction verification.",
                    badge: "Media"
                  },
                  {
                    title: "API Webhook & CRM Event",
                    desc: "Starts the automation when an external web server sends a POST request with the contact's phone number.",
                    example: "Shopify order placed -> Starts order confirmation flow.",
                    badge: "API"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900">{item.title}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">{item.badge}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                    <div className="mt-2 text-[11px] font-mono text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                      💡 <strong>Example:</strong> {item.example}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: MESSAGES & BUTTONS */}
          {activeSection === "messages" && (
            <div className="space-y-6">
              <div>
                <span className="text-blue-600 font-bold text-xs uppercase tracking-wider">Outbound Content</span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  Message, Interactive &amp; Menu Nodes
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  WhatsApp supports rich interactive formats beyond plain text. These nodes allow you to present buttons, menus, and media to guide user choices.
                </p>
              </div>

              {/* Interactive Node Comparisons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔘</span>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900">Quick Reply Buttons (Interactive Node)</h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Displays up to 3 quick-reply buttons directly under your message. Each button has its own output handle (<code className="text-indigo-600 font-mono text-[10px]">btn-0</code>, <code className="text-indigo-600 font-mono text-[10px]">btn-1</code>).
                  </p>
                  <div className="text-[11px] bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-700">Rules &amp; Limits:</div>
                    <div className="text-slate-600">• Maximum 3 buttons per message.</div>
                    <div className="text-slate-600">• Button label limit: 20 characters maximum.</div>
                    <div className="text-slate-600">• Tapping a button saves choice to <code className="font-mono text-indigo-600">{'{{selected_button}}'}</code>.</div>
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📋</span>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900">Interactive List Menu (Menu Node)</h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Sends a clean "View Options" button that opens a bottom-sheet drawer with up to 10 choices grouped into organized sections.
                  </p>
                  <div className="text-[11px] bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-700">Rules &amp; Limits:</div>
                    <div className="text-slate-600">• Up to 10 items total across all sections.</div>
                    <div className="text-slate-600">• Supports title (24 chars) and description (72 chars).</div>
                    <div className="text-slate-600">• Each row creates its own handle: <code className="font-mono text-emerald-600">row-0, row-1</code>.</div>
                  </div>
                </div>
              </div>

              {/* Template Node Card */}
              <div className="border border-sky-200 bg-sky-50/40 rounded-xl p-5 space-y-2">
                <h3 className="font-bold text-xs sm:text-sm text-sky-950 flex items-center gap-2">
                  <span>📑</span> WhatsApp Meta Templates (Template Node)
                </h3>
                <p className="text-xs text-sky-800 leading-relaxed">
                  Meta requires pre-approved templates for initiating conversations outside the 24-hour service window. The Template Node automatically maps your contact parameters (e.g., <code className="font-mono text-sky-900 bg-sky-100 px-1 py-0.5 rounded">{'{{1}} = contact.name'}</code>) and enables button handles on quick-reply templates.
                </p>
              </div>
            </div>
          )}

          {/* SECTION 4: ASK QUESTION & INPUT */}
          {activeSection === "input-collection" && (
            <div className="space-y-6">
              <div>
                <span className="text-amber-600 font-bold text-xs uppercase tracking-wider">Data Collection</span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  Ask Question Node (Input Node)
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  The Input Node asks a question, pauses execution (<code className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-mono text-xs">WAITING_FOR_INPUT</code>), validates the customer's response, and saves it into a variable.
                </p>
              </div>

              {/* Supported Validations Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-slate-50 font-bold text-slate-700 p-3 border-b border-slate-200 flex justify-between">
                  <span>Validation Type</span>
                  <span>Validation Rule &amp; Auto-Extraction</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { type: "Text (Default)", rule: "Accepts any non-empty user text response." },
                    { type: "Name", rule: "Validates at least 2 alphabetic letters, filters out conversational greetings (like 'hi', 'ok')." },
                    { type: "Phone / Mobile", rule: "Extracts 10-digit mobile numbers, strips +91, handles spaces & hyphens." },
                    { type: "Name and Phone", rule: "Intelligently extracts BOTH customer name and 10-digit phone number from a single message." },
                    { type: "Email", rule: "Uses regex to ensure standard user@domain.com format." },
                    { type: "Number", rule: "Validates integer or decimal numbers, removes currency symbols (₹, $)." },
                    { type: "Date & Time / Slot", rule: "Extracts dates (DD/MM/YYYY, 'Tomorrow', '15 Oct') and times ('4:30 PM', '5 baje')." },
                    { type: "Location Pin", rule: "Validates WhatsApp native GPS attachment, saves lat/long coordinates." },
                    { type: "Photo / Image", rule: "Ensures media image attachment was received, stores permanent media URL." },
                    { type: "Document / PDF", rule: "Validates PDF/Doc attachment." }
                  ].map((v, i) => (
                    <div key={i} className="p-3 flex justify-between items-center bg-white hover:bg-slate-50">
                      <span className="font-semibold text-slate-900">{v.type}</span>
                      <span className="text-slate-500 max-w-sm text-right">{v.rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Retry & Timeout System */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 text-xs space-y-2">
                <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                  <ExclamationTriangleIcon className="w-4 h-4 text-amber-600" /> 3-Strike Error Retry &amp; Timeout System
                </h4>
                <p className="text-amber-800/90 leading-relaxed">
                  • If the customer provides an invalid input (e.g. invalid email), the bot sends your configured custom error message and keeps waiting.<br />
                  • After 3 invalid attempts, the session automatically triggers human handoff to protect customer experience.<br />
                  • If the customer does not reply within configured timeout minutes, the <code className="font-mono text-amber-900 font-bold">timeout</code> handle runs to send a reminder.
                </p>
              </div>
            </div>
          )}

          {/* SECTION 5: CONDITION LOGIC */}
          {activeSection === "condition-logic" && (
            <div className="space-y-6">
              <div>
                <span className="text-indigo-600 font-bold text-xs uppercase tracking-wider">Branching Logic</span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  Condition Node: IF / ELSE Routing
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  The Condition Node compares user variables, CRM tags, or answers against configured criteria and branches instantly into <strong className="text-emerald-600">True</strong> or <strong className="text-rose-600">False</strong> paths.
                </p>
              </div>

              {/* Operators Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {[
                  { op: "equals (==)", desc: "Exact case-insensitive match" },
                  { op: "not_equals (!=)", desc: "Does not equal target value" },
                  { op: "contains", desc: "Substring search or Array has item" },
                  { op: "does_not_contain", desc: "Target string is absent" },
                  { op: "has_tag", desc: "Contact has specified CRM tag" },
                  { op: "starts_with", desc: "Variable begins with prefix" },
                  { op: "ends_with", desc: "Variable ends with suffix" },
                  { op: "greater_than (>)", desc: "Numerical comparison (e.g. score > 75)" },
                  { op: "less_than (<)", desc: "Numerical comparison (e.g. cart < 500)" },
                  { op: "in / is_in", desc: "Comma-separated list inclusion" },
                  { op: "is_empty", desc: "Checks if variable is blank or null" },
                  { op: "not_empty", desc: "Checks if variable contains data" }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="font-mono font-bold text-indigo-700">{item.op}</div>
                    <div className="text-slate-500 text-[11px] mt-1">{item.desc}</div>
                  </div>
                ))}
              </div>

              {/* Visual Branch Guide */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">Output Handle Routing</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                    <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> True Handle
                    </span>
                    <p className="text-emerald-700/80 mt-1 text-[11px]">
                      Runs when the condition passes. Example: User age is greater than 18.
                    </p>
                  </div>

                  <div className="flex-1 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs">
                    <span className="font-bold text-rose-800 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> False Handle
                    </span>
                    <p className="text-rose-700/80 mt-1 text-[11px]">
                      Runs when the condition fails. Example: User age is less than 18.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: ACTIONS & CRM */}
          {activeSection === "actions-crm" && (
            <div className="space-y-6">
              <div>
                <span className="text-pink-600 font-bold text-xs uppercase tracking-wider">CRM Management</span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  Action Node: Background CRM Operations
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Action Nodes execute backend tasks silently without sending messages to the customer. They execute instantaneously and pass control to the <code className="text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded font-mono text-xs">main-handle</code>.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  {
                    action: "Add Tag / Remove Tag",
                    desc: "Applies or removes labels (e.g., 'VIP', 'Lead_Hot', 'Interested') on the contact profile for targeted broadcasts."
                  },
                  {
                    action: "Update Contact Custom Field",
                    desc: "Updates contact properties like City, Alternate Phone, Company, or Course directly in the Messbee CRM database."
                  },
                  {
                    action: "Human Handoff (Live Chat)",
                    desc: "Pauses the bot for this customer, marks contact as HANDOFF, and alerts human support agents via real-time WebSocket notifications."
                  },
                  {
                    action: "Round Robin Agent Assignment",
                    desc: "Distributes incoming customer chats evenly among selected team members."
                  },
                  {
                    action: "Marketing Opt-in / Opt-out",
                    desc: "Updates customer compliance status (stops automated messages if user opts out)."
                  }
                ].map((act, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                    <TagIcon className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">{act.action}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">{act.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 7: AI ASSISTANT */}
          {activeSection === "ai-assistant" && (
            <div className="space-y-6">
              <div>
                <span className="text-emerald-600 font-bold text-xs uppercase tracking-wider">GenAI Capabilities</span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  AI Assistant Node (OpenAI GPT-4o)
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Injects ChatGPT intelligence directly into your flow. It takes the customer's query, processes it against your System Prompt and dynamic variables, and generates an accurate response.
                </p>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-5 space-y-3 text-xs">
                <h3 className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <SparklesIcon className="w-4 h-4 text-emerald-600" /> How to wire the AI Node
                </h3>
                <div className="space-y-2 text-emerald-800">
                  <div className="p-2.5 bg-white rounded-lg border border-emerald-200 font-mono text-[11px]">
                    Step 1: AI Node processes question -&gt; Saves answer into <span className="font-bold text-emerald-600">{'{{ai_response}}'}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-emerald-200 font-mono text-[11px]">
                    Step 2: Connect AI Node's "main-handle" to a Message Node containing <span className="font-bold text-emerald-600">{'{{ai_response}}'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 8: API & WEBHOOKS */}
          {activeSection === "api-webhooks" && (
            <div className="space-y-6">
              <div>
                <span className="text-cyan-600 font-bold text-xs uppercase tracking-wider">Integrations</span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  API Node: External REST Webhooks
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Connect your Messbee flow to your custom backend, Google Sheets, Zapier, Make.com, or CRM database via REST API calls.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900">Supported HTTP Methods:</div>
                  <div className="flex gap-2">
                    {["GET", "POST", "PUT", "DELETE"].map(m => (
                      <span key={m} className="px-2 py-1 bg-white border border-slate-200 rounded font-mono font-bold text-cyan-700">{m}</span>
                    ))}
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1">
                    Headers and request body support JSON payloads with dynamic variables, like: <code className="font-mono text-cyan-800">{'{ "phone": "{{contact.phone}}", "query": "{{user_input}}" }'}</code>.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="font-bold text-emerald-800 text-xs">Success (2xx HTTP Status)</div>
                    <div className="text-emerald-700/80 text-[11px] mt-1">Triggers when the third-party endpoint responds with 200–299 status code.</div>
                  </div>
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl">
                    <div className="font-bold text-rose-800 text-xs">Failure (4xx/5xx or Timeout)</div>
                    <div className="text-rose-700/80 text-[11px] mt-1">Triggers if external server crashes or takes longer than 10 seconds.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 9: DELAYS & TIMERS */}
          {activeSection === "delays-timers" && (
            <div className="space-y-6">
              <div>
                <span className="text-purple-600 font-bold text-xs uppercase tracking-wider">Queue Execution</span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  Smart Delays &amp; Wait for Event Nodes
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Messbee utilizes Redis Bull background queues to pause automations safely without blocking system resources or keeping HTTP connections open.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ClockIcon className="w-4 h-4 text-purple-600" /> Smart Delay Node
                  </div>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    Pauses the flow for a fixed duration (e.g., 15 Minutes, 2 Hours, 3 Days). When timer finishes, the queue worker automatically wakes up and triggers the <code className="font-mono text-purple-700">main-handle</code>.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ArrowsRightLeftIcon className="w-4 h-4 text-amber-600" /> Wait for Event Node
                  </div>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    Waits for customer response up to X hours. If customer replies, it follows <code className="font-mono text-emerald-700">event_happened</code>; if time expires, it follows <code className="font-mono text-amber-700">timeout</code>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 10: E-COMMERCE */}
          {activeSection === "ecommerce" && (
            <div className="space-y-6">
              <div>
                <span className="text-emerald-600 font-bold text-xs uppercase tracking-wider">Commerce &amp; Payments</span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  Shopify, Catalog &amp; Payment Nodes
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Directly connect your store catalog, generate Razorpay / Stripe payment links, or query Shopify orders inside WhatsApp conversations.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { title: "Shopify Node", desc: "Looks up customer orders by phone, fetches tracking URLs (In Transit, Delivered), and retrieves stock status." },
                  { title: "Commerce Node", desc: "Sends WhatsApp Review & Pay links, coupon codes (e.g. FLAT20), or OTP verification codes." },
                  { title: "Catalog Node", desc: "Displays Meta Commerce product cards with live prices, photos, and 'View Item' add-to-cart buttons." },
                  { title: "Carousel Node", desc: "Sends modern swipeable multi-card carousels (up to 10 cards) with image and CTA buttons on each card." }
                ].map((item, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-900">{item.title}</div>
                    <div className="text-slate-500 text-[11px] mt-1 leading-relaxed">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 11: VARIABLES CHEAT SHEET */}
          {activeSection === "variables" && (
            <div className="space-y-6">
              <div>
                <span className="text-indigo-600 font-bold text-xs uppercase tracking-wider">Dynamic Syntax</span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  Variables Reference &amp; Cheat Sheet
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  You can use variables in any message, button, header, or API payload using the double curly brace syntax: <code className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">{'{{variable_name}}'}</code>.
                </p>
              </div>

              {/* Variable Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-slate-50 font-bold text-slate-700 p-3 border-b border-slate-200 flex justify-between">
                  <span>Variable Tag</span>
                  <span>Description &amp; Auto-Resolved Value</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { tag: "{{contact.name}}", desc: "Customer full name (falls back to WhatsApp profile name)" },
                    { tag: "{{contact.phone}}", desc: "Customer phone number with country code" },
                    { tag: "{{contact.email}}", desc: "Customer email address" },
                    { tag: "{{contact.tags}}", desc: "Comma-separated list of assigned CRM tags" },
                    { tag: "{{system.date}}", desc: "Current date in DD/MM/YYYY format" },
                    { tag: "{{system.time}}", desc: "Current time (e.g. 10:30 AM)" },
                    { tag: "{{system.today}}", desc: "Today's label (e.g. 'Today (12 Oct)')" },
                    { tag: "{{system.tomorrow}}", desc: "Tomorrow's date label" },
                    { tag: "{{selected_button}}", desc: "Title of the button clicked in the previous interactive node" },
                    { tag: "{{selected_menu_option}}", desc: "Title of the row selected in the previous list menu" },
                    { tag: "{{selected_date}}", desc: "Extracted booking date from slot menu or customer reply" },
                    { tag: "{{selected_time}}", desc: "Extracted appointment time slot" },
                    { tag: "{{ai_response}}", desc: "The generated response text from AI Assistant node" },
                    { tag: "{{shopify.order_number}}", desc: "Customer Shopify order ID" },
                    { tag: "{{shopify.tracking_url}}", desc: "Shopify carrier tracking link" }
                  ].map((v, i) => (
                    <div key={i} className="p-3 flex items-center justify-between bg-white hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{v.tag}</code>
                        <button
                          onClick={() => copyToClipboard(v.tag, i)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                          title="Copy Tag"
                        >
                          {copiedText === i ? <CheckIcon className="w-3.5 h-3.5 text-emerald-600" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <span className="text-slate-500 max-w-sm text-right text-[11px]">{v.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fallback Syntax Tip */}
              <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-indigo-900">💡 Pro Tip: Fallback Syntax</div>
                <p className="text-indigo-800 leading-relaxed text-[11px]">
                  You can specify a fallback value in case a variable is empty: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-indigo-200">{'{{contact.name|there}}'}</code>. If contact name is missing, it will display "there" instead of blank!
                </p>
              </div>
            </div>
          )}

          {/* SECTION 12: BEST PRACTICES */}
          {activeSection === "best-practices" && (
            <div className="space-y-6">
              <div>
                <span className="text-emerald-600 font-bold text-xs uppercase tracking-wider">Quality Assurance</span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  Automation Rules &amp; Best Practices
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Follow these key principles to ensure high customer satisfaction and 100% Meta compliance.
                </p>
              </div>

              <div className="space-y-3.5 text-xs">
                {[
                  {
                    title: "1. 24-Hour Customer Care Window Compliance",
                    desc: "Meta allows non-template free-form messages only within 24 hours of customer's last message. If customer has not messaged you in 24 hours, always start your flow with a WhatsApp Template Node."
                  },
                  {
                    title: "2. The 'Restart' Escape Keyword",
                    desc: "The Messbee engine automatically monitors keywords: 'restart', 'reset', 'menu', 'exit'. If a customer gets confused in an input node, typing 'restart' immediately clears their session and restarts the flow from step 1."
                  },
                  {
                    title: "3. Prevent Infinite Graph Loops",
                    desc: "The engine contains a hard safety cap of 30 execution steps per session to prevent infinite recursion. Always ensure cyclic flows contain a blocking node (like an Ask Question or Delay node)."
                  },
                  {
                    title: "4. Always Connect the Timeout Port on Question Nodes",
                    desc: "If customers abandon a question midway, their session remains in WAITING_FOR_INPUT. Connecting the timeout port sends a timely reminder (e.g. after 30 minutes) to recover lost leads."
                  },
                  {
                    title: "5. Simulator Testing Before Publishing",
                    desc: "Use the built-in WhatsApp Web Simulator panel in the builder to simulate real-time conversations, button taps, and variable storage before setting your flow to Active status."
                  }
                ].map((rule, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{rule.title}</h3>
                    <p className="text-slate-600 text-xs mt-1.5 leading-relaxed">{rule.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
