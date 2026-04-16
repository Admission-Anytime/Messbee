import fs from 'fs';

const filePath = 'c:/Users/prana/OneDrive/Desktop/Messbee/client/src/pages/PlanPricing/UpgradePlan.jsx';
let c = fs.readFileSync(filePath, 'utf8');

c = c.replace(
  /const originalPrices = \{ basic: \d+, professional: \d+, enterprise: \d+ \};/,
  'const originalPrices = { basic: 1537, professional: 2306, enterprise: 3844 };'
);

// We need to change the displayed text for basic, professional and enterprise cards.
c = c.replace(
  /<p className="text-xs text-emerald-600 font-bold">\s*<span className="line-through text-slate-400 mr-1">₹\{formatPrice\(getOriginalTotal\(originalPrices\.basic\)\)\}<\/span>\s*₹\{formatPrice\(getDiscountedTotal\(originalPrices\.basic\)\)\} billed \{billingLabel\} \(save \{discount\}%\)\s*<\/p>/,
  '<p className="text-xs text-emerald-600 font-bold">\n                    <span className="line-through text-slate-400 mr-1">₹{formatPrice(originalPrices.basic)}</span>\n                    ₹{formatPrice(prices.basic.monthly)} billed {billingLabel} (save {discount}%)\n                  </p>'
);

c = c.replace(
  /<p className="text-xs text-emerald-600 font-bold">\s*<span className="line-through text-slate-400 mr-1">₹\{formatPrice\(getOriginalTotal\(originalPrices\.professional\)\)\}<\/span>\s*₹\{formatPrice\(getDiscountedTotal\(originalPrices\.professional\)\)\} billed \{billingLabel\} \(save \{discount\}%\)\s*<\/p>/,
  '<p className="text-xs text-emerald-600 font-bold">\n                    <span className="line-through text-slate-400 mr-1">₹{formatPrice(originalPrices.professional)}</span>\n                    ₹{formatPrice(prices.professional.monthly)} billed {billingLabel} (save {discount}%)\n                  </p>'
);

c = c.replace(
  /<p className="text-xs text-emerald-600 font-bold">\s*<span className="line-through text-slate-400 mr-1">₹\{formatPrice\(getOriginalTotal\(originalPrices\.enterprise\)\)\}<\/span>\s*₹\{formatPrice\(getDiscountedTotal\(originalPrices\.enterprise\)\)\} billed \{billingLabel\} \(save \{discount\}%\)\s*<\/p>/,
  '<p className="text-xs text-emerald-600 font-bold">\n                    <span className="line-through text-slate-400 mr-1">₹{formatPrice(originalPrices.enterprise)}</span>\n                    ₹{formatPrice(prices.enterprise.monthly)} billed {billingLabel} (save {discount}%)\n                  </p>'
);

// Update Free Features List
let freeOld = `{["Free WhatsApp Business API", "300 messages replies per month", "1 Dedicated User"].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-slate-500">
                      <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" /></svg>
                      {f}
                    </li>
                  ))}`;

let freeNew = `{[
                    "Free WhatsApp Business API",
                    "300 messages replies per month",
                    "300 contacts",
                    "1 Automation with 3 nodes",
                    "Send campaign to 50/months",
                    "Shared team inbox",
                    "Tags, Custom Fields - 5",
                    "Upload contacts with CRM",
                    "Template Management"
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-slate-500">
                      <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" /></svg>
                      <span>{f}</span>
                    </li>
                  ))}`;
c = c.replace(freeOld, freeNew);

// Update Basic Features List
let basicOld = `{["Send bulk WhatsApp message", "Import CSV & broadcast", "Basic Chatbot Builder"].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-slate-500">
                      <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" /></svg>
                      {f}
                    </li>
                  ))}`;
let basicNew = `{[
                    "Send bulk WhatsApp message",
                    "Import CSV & broadcast",
                    "Auto reply on broadcast",
                    "Send welcome messages with multimedia",
                    "Set away message & holidays",
                    "Shared team inbox with collaborative features",
                    "Automation with choice based bots",
                    "Assign Agents & track",
                    "Upload contacts with CRM",
                    "Template Management"
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-slate-500">
                      <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" /></svg>
                      <span>{f}</span>
                    </li>
                  ))}`;
c = c.replace(basicOld, basicNew);

// Update Pro Features List
let proOld = `{[
                    { text: "All Basic features +", bold: true },
                    { text: "Schedule Bulk Message", bold: false },
                    { text: "Multi-agent Support", bold: false },
                  ].map((f) => (
                    <li key={f.text} className={\`flex items-center gap-3 text-sm \${f.bold ? "font-semibold text-slate-700" : "text-slate-500"}\`}>
                      <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" /></svg>
                      {f.text}
                    </li>
                  ))}`;
let proNew = `{[
                    { text: "All Starter features +", bold: true },
                    { text: "Schedule Bulk Message", bold: false },
                    { text: "Auto assign agents with round robin", bold: false },
                    { text: "Retarget with smart categorisation", bold: false },
                    { text: "Send Message with API", bold: false },
                    { text: "Add contacts, Run campaign APIs", bold: false },
                    { text: "Ask questions, Assign Agents in chatbot", bold: false },
                    { text: "Payment, Google Sheet Integration", bold: false },
                    { text: "Advance analytics", bold: false },
                    { text: "Export Contacts & Campaign Reports", bold: false },
                  ].map((f) => (
                    <li key={f.text} className={\`flex items-start gap-3 text-sm \${f.bold ? "font-semibold text-slate-700" : "text-slate-500"}\`}>
                      <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" /></svg>
                      <span>{f.text}</span>
                    </li>
                  ))}`;
c = c.replace(proOld, proNew);

// Update Enterprise Features List
let entOld = `{[
                    { text: "All features in Professional +", bold: true },
                    { text: "Advance Chatbot Builder", bold: false },
                    { text: "Dedicated Support", bold: false },
                  ].map((f) => (
                    <li key={f.text} className={\`flex items-center gap-3 text-sm \${f.bold ? "font-semibold text-slate-700" : "text-slate-500"}\`}>
                      <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" /></svg>
                      {f.text}
                    </li>
                  ))}`;

let entNew = `{[
                    { text: "All featues in Growth +", bold: true },
                    { text: "Advance chatbot builder", bold: false },
                    { text: "Recurring Campaigns", bold: false },
                    { text: "Campaign Automation", bold: false },
                    { text: "Number masking", bold: false },
                    { text: "10 Agents", bold: false },
                    { text: "5 App integrations", bold: false },
                    { text: "More uses access", bold: false },
                    { text: "Save billing in marketing message", bold: false },
                    { text: "Added Support and Services", bold: false },
                    { text: "Higher uses and longer backup", bold: false },
                    { text: "Webhook", bold: false },
                  ].map((f) => (
                    <li key={f.text} className={\`flex items-start gap-3 text-sm \${f.bold ? "font-semibold text-slate-700" : "text-slate-500"}\`}>
                      <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" /></svg>
                      <span>{f.text}</span>
                    </li>
                  ))}`;
c = c.replace(entOld, entNew);

fs.writeFileSync(filePath, c);
console.log("Replaced features and pricing display text logic successfully");
