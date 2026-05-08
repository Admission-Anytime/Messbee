/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  CheckCircle,
  ChevronDown,
  Link2,
  PlayCircle,
  History,
  ArrowLeft,
  Search,
  Trash2,
  RefreshCw,
  Eye,
  XCircle,
  Clock,
  Calendar,
  Grid3x3,
  X,
  User,
  ShieldCheck,
} from "lucide-react";

/* ── integration card data ── */
const integrations = [
  {
    id: "shopify",
    name: "Shopify",
    description:
      "Sync orders, send automated cart recovery messages and order updates via WhatsApp.",
    icon: (
      <div className="w-12 h-12 rounded-xl bg-[#95BF47]/10 flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 256 292" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M223.774 57.34c-.201-1.46-1.48-2.268-2.537-2.357-1.055-.088-23.383-1.743-23.383-1.743s-15.507-15.395-17.209-17.099c-1.703-1.703-5.029-1.185-6.32-.828-.183.05-3.37 1.036-8.627 2.654-5.128-14.794-14.18-28.39-30.103-28.39h-1.394C129.553 3.677 124.524 0 120.142 0 83.26 0 65.55 46.547 59.968 70.233c-14.576 4.514-24.934 7.724-26.194 8.12-8.152 2.557-8.402 2.811-9.47 10.534C23.369 95.16 0 275.197 0 275.197l176.918 30.428L256 285.563s-32.016-226.87-32.226-228.223zM161.066 43.677c-4.12 1.274-8.827 2.734-13.95 4.322V44.89c0-8.444-1.166-15.268-3.078-20.6 7.655 .951 12.774 9.717 17.028 19.387zm-29.98-17.496c2.167 5.418 3.569 13.115 3.569 23.695v1.453c-9.282 2.876-19.407 6.01-29.553 9.153C111.362 36.95 121.538 21.96 131.086 26.18zm-13.153-12.312c1.701 0 3.394.607 5.04 1.806-12.76 5.994-26.446 21.086-32.198 51.273l-23.42 7.254C73.49 51.49 88.057 13.868 117.933 13.868z"
            fill="#95BF47"
          />
          <path
            d="M221.237 54.983c-1.055-.088-23.383-1.743-23.383-1.743s-15.507-15.395-17.209-17.099c-.637-.634-1.496-.956-2.394-1.062l-1.333 272.546 79.082-20.062S223.975 56.443 223.774 54.983h-.001l-2.536.001z"
            fill="#5E8E3E"
          />
          <path
            d="M135.888 104.585l-11.126 33.072s-9.773-5.212-21.7-5.212c-17.554 0-18.438 11.01-18.438 13.785 0 15.136 39.456 20.934 39.456 56.428 0 27.913-17.703 45.89-41.586 45.89-28.657 0-43.331-17.836-43.331-17.836l7.674-25.34s15.094 12.964 27.836 12.964c8.322 0 11.724-6.556 11.724-11.35 0-19.792-32.367-20.664-32.367-53.13 0-27.326 19.6-53.77 59.24-53.77 15.262 0 22.617 4.4 22.617 4.4z"
            fill="#FFF"
          />
        </svg>
      </div>
    ),
    smallIcon: (
      <div className="w-10 h-10 rounded-xl bg-[#95BF47]/10 flex items-center justify-center">
        <div className="w-5 h-5 rounded bg-[#95BF47]" />
      </div>
    ),
    status: "connected",
    action: "configure",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description:
      "Log WhatsApp conversations directly into HubSpot contact timelines and automate deals.",
    icon: (
      <div className="w-12 h-12 rounded-xl bg-[#A2B86C]/10 flex items-center justify-center">
        <div className="w-7 h-7 rounded-md bg-[#A2B86C]" />
      </div>
    ),
    smallIcon: (
      <div className="w-10 h-10 rounded-xl bg-[#A2B86C]/10 flex items-center justify-center">
        <div className="w-5 h-5 rounded bg-[#A2B86C]" />
      </div>
    ),
    status: "new",
    action: "install",
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    description:
      "Export chat history or trigger bulk messaging campaigns directly from spreadsheet rows.",
    icon: (
      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z"
            fill="#E8EAF6"
            stroke="#5C6BC0"
            strokeWidth="0.5"
          />
          <path d="M7 7H11V11H7V7Z" fill="#5C6BC0" />
          <path d="M13 7H17V11H13V7Z" fill="#5C6BC0" opacity="0.5" />
          <path d="M7 13H11V17H7V13Z" fill="#5C6BC0" opacity="0.5" />
          <path d="M13 13H17V17H13V13Z" fill="#5C6BC0" opacity="0.3" />
        </svg>
      </div>
    ),
    smallIcon: (
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" fill="#E8EAF6" stroke="#5C6BC0" strokeWidth="0.5" />
          <path d="M7 7H11V11H7V7Z" fill="#5C6BC0" />
          <path d="M13 7H17V11H13V7Z" fill="#5C6BC0" opacity="0.5" />
          <path d="M7 13H11V17H7V13Z" fill="#5C6BC0" opacity="0.5" />
          <path d="M13 13H17V17H13V13Z" fill="#5C6BC0" opacity="0.3" />
        </svg>
      </div>
    ),
    status: "connected",
    action: "configure",
  },
  {
    id: "slack",
    name: "Slack",
    description:
      "Receive WhatsApp notifications and reply directly from your favorite Slack channels.",
    icon: (
      <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="4" fill="#4A154B" />
          <text x="5.5" y="16" fill="white" fontWeight="700" fontSize="11" fontFamily="sans-serif">
            slack
          </text>
        </svg>
      </div>
    ),
    smallIcon: (
      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
        <div className="w-5 h-5 rounded bg-[#4A154B]" />
      </div>
    ),
    status: "coming_soon",
    action: "notify",
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description:
      "Segment your audiences and bridge the gap between email and WhatsApp marketing.",
    icon: (
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="4" width="16" height="16" rx="3" fill="#1a1a2e" />
          <rect x="7" y="9" width="3" height="6" rx="1" fill="#fff" />
          <rect x="11" y="7" width="3" height="8" rx="1" fill="#fff" opacity="0.7" />
          <rect x="15" y="10" width="2" height="5" rx="1" fill="#fff" opacity="0.5" />
        </svg>
      </div>
    ),
    smallIcon: (
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
        <div className="w-5 h-5 rounded bg-[#1a1a2e]" />
      </div>
    ),
    status: null,
    action: "install",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description:
      "Enterprise-grade CRM integration for deep sales tracking and automated lead engagement.",
    icon: (
      <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="4" fill="#00A1E0" />
          <text x="7" y="15.5" fill="white" fontWeight="700" fontSize="7" fontFamily="sans-serif">
            —
          </text>
        </svg>
      </div>
    ),
    smallIcon: (
      <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
        <div className="w-5 h-5 rounded bg-[#00A1E0]" />
      </div>
    ),
    status: null,
    action: "install",
  },
];

/* ── sync history sample data ── */
const syncHistoryData = [
  {
    id: "SYN-001",
    status: "success",
    integration: "Shopify",
    integrationIcon: (
      <div className="w-8 h-8 rounded-lg bg-[#95BF47]/15 flex items-center justify-center">
        <div className="w-4 h-4 rounded bg-[#95BF47]" />
      </div>
    ),
    operation: "Inventory Sync",
    records: "142 rows",
    duration: "1.2s",
    timestamp: "Oct 24, 2023 14:20:01",
  },
  {
    id: "SYN-002",
    status: "failed",
    integration: "Google Sheets",
    integrationIcon: (
      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
        <div className="w-4 h-4 rounded bg-[#0F9D58]" />
      </div>
    ),
    operation: "Contact Export",
    records: "0 rows",
    duration: "0.5s",
    timestamp: "Oct 24, 2023 13:15:22",
  },
  {
    id: "SYN-003",
    status: "processing",
    integration: "Webhooks",
    integrationIcon: (
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
        <div className="w-4 h-4 rounded bg-slate-500" />
      </div>
    ),
    operation: "Data Ingest",
    records: "89 rows",
    duration: "--",
    timestamp: "Oct 24, 2023 15:45:10",
  },
  {
    id: "SYN-004",
    status: "success",
    integration: "Salesforce",
    integrationIcon: (
      <div className="w-8 h-8 rounded-lg bg-[#00A1E0]/15 flex items-center justify-center">
        <div className="w-4 h-4 rounded bg-[#00A1E0]" />
      </div>
    ),
    operation: "Lead Sync",
    records: "12 rows",
    duration: "2.1s",
    timestamp: "Oct 24, 2023 12:00:45",
  },
];

/* ── data mapping config per integration ── */
const dataMappingConfig = {
  "google-sheets": {
    fields: [
      { messbeeField: "Name", sheetColumn: "Column A: Full Name" },
      { messbeeField: "Phone", sheetColumn: "Column B: Phone Number" },
      { messbeeField: "Label", sheetColumn: "Column C: Tag" },
      { messbeeField: "Custom Field", sheetColumn: "" },
    ],
    sheetOptions: [
      "Column A: Full Name",
      "Column B: Phone Number",
      "Column C: Tag",
      "Column D: Email",
      "Column E: Address",
    ],
  },
  shopify: {
    fields: [
      { messbeeField: "Name", sheetColumn: "Customer Name" },
      { messbeeField: "Phone", sheetColumn: "Phone Number" },
      { messbeeField: "Label", sheetColumn: "Order Tag" },
      { messbeeField: "Custom Field", sheetColumn: "" },
    ],
    sheetOptions: [
      "Customer Name",
      "Phone Number",
      "Order Tag",
      "Email",
      "Order ID",
    ],
  },
  hubspot: {
    fields: [
      { messbeeField: "Name", sheetColumn: "Contact Name" },
      { messbeeField: "Phone", sheetColumn: "Phone" },
      { messbeeField: "Label", sheetColumn: "Deal Stage" },
      { messbeeField: "Custom Field", sheetColumn: "" },
    ],
    sheetOptions: [
      "Contact Name",
      "Phone",
      "Deal Stage",
      "Company",
      "Email",
    ],
  },
  mailchimp: {
    fields: [
      { messbeeField: "Name", sheetColumn: "Subscriber Name" },
      { messbeeField: "Phone", sheetColumn: "Phone" },
      { messbeeField: "Label", sheetColumn: "Audience Tag" },
      { messbeeField: "Custom Field", sheetColumn: "" },
    ],
    sheetOptions: [
      "Subscriber Name",
      "Phone",
      "Audience Tag",
      "Email",
      "List ID",
    ],
  },
  salesforce: {
    fields: [
      { messbeeField: "Name", sheetColumn: "Lead Name" },
      { messbeeField: "Phone", sheetColumn: "Phone" },
      { messbeeField: "Label", sheetColumn: "Lead Source" },
      { messbeeField: "Custom Field", sheetColumn: "" },
    ],
    sheetOptions: [
      "Lead Name",
      "Phone",
      "Lead Source",
      "Company",
      "Email",
    ],
  },
};

/* ── status badge component ── */
const StatusBadge = ({ status }) => {
  if (!status) return null;

  const config = {
    connected: {
      label: "CONNECTED",
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-green-200",
    },
    new: {
      label: "NEW",
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-200",
    },
    coming_soon: {
      label: "COMING SOON",
      bg: "bg-orange-50",
      text: "text-orange-500",
      border: "border-orange-200",
    },
  };

  const c = config[status];
  if (!c) return null;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${c.bg} ${c.text} border ${c.border}`}
    >
      {c.label}
    </span>
  );
};

/* ── sync status badge ── */
const SyncStatusBadge = ({ status }) => {
  const config = {
    success: {
      label: "Success",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-200",
      icon: <CheckCircle className="w-3 h-3" />,
    },
    failed: {
      label: "Failed",
      bg: "bg-red-50",
      text: "text-red-500",
      border: "border-red-200",
      icon: <XCircle className="w-3 h-3" />,
    },
    processing: {
      label: "Processing",
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-200",
      icon: <Clock className="w-3 h-3" />,
    },
  };

  const c = config[status];
  if (!c) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text} border ${c.border}`}
    >
      {c.icon}
      {c.label}
    </span>
  );
};

/* ── toggle switch component ── */
const ToggleSwitch = ({ enabled, onChange, label, sublabel }) => (
  <div className="flex items-center gap-3">
    <div>
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <p className="text-xs text-slate-400">{sublabel}</p>
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${enabled ? "bg-emerald-400" : "bg-slate-300"
        }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${enabled ? "translate-x-5" : "translate-x-0"
          }`}
      />
    </button>
  </div>
);

/* ════════════════════════════════════════════════
   CONFIGURE MODAL
   ════════════════════════════════════════════════ */
const ConfigureModal = ({ integration, onClose }) => {
  const mapping = dataMappingConfig[integration?.id] || dataMappingConfig["google-sheets"];

  const [fieldMappings, setFieldMappings] = useState(
    mapping.fields.map((f) => ({ ...f }))
  );
  const [syncAuto, setSyncAuto] = useState(true);
  const [updateRows, setUpdateRows] = useState(false);

  if (!integration) return null;

  const handleColumnChange = (index, value) => {
    setFieldMappings((prev) =>
      prev.map((f, i) => (i === index ? { ...f, sheetColumn: value } : f))
    );
  };

  return (
    /* backdrop */
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      {/* modal card */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[540px] max-h-[90vh] overflow-y-auto animate-in">
        {/* ── header ── */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            {integration.smallIcon}
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Configure {integration.name}
              </h2>
              <p className="text-xs text-blue-500 font-medium">
                MessBee Integration Settings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="px-5 pb-5">
          {/* ── STEP 1 : Account Connection ── */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded-md bg-emerald-400 text-white text-[10px] font-bold uppercase tracking-wider">
                Step 1
              </span>
              <h3 className="text-sm font-bold text-slate-700">Account Connection</h3>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center border-2 border-white shadow-sm">
                  <User className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 leading-none mb-0.5">Connected as</p>
                  <p className="text-sm font-semibold text-slate-700">marketing@admissionanytime.com</p>
                </div>
              </div>
              <button className="text-sm font-semibold text-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer">
                Change Account
              </button>
            </div>
          </div>

          {/* ── STEP 2 : Data Mapping Table ── */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-400 text-white text-[10px] font-bold uppercase tracking-wider">
                  Step 2
                </span>
                <h3 className="text-sm font-bold text-slate-700">Data Mapping Table</h3>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Auto-Saved
              </span>
            </div>

            {/* mapping table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              {/* table header */}
                    MessBee Fields
                  </span>
                </div>
                <div className="px-4 py-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Sheet Columns
                  </span>
                </div>
              </div>

              {/* table rows */}
              {fieldMappings.map((field, index) => (
                <div
                  key={field.messbeeField}
                  className={`grid grid-cols-2 items-center ${index < fieldMappings.length - 1 ? "border-b border-slate-100" : ""
                    }`}
                >
                  <div className="px-4 py-2.5">
                    <span className="text-sm font-medium text-slate-700">
                      {field.messbeeField}
                    </span>
                  </div>
                  <div className="px-4 py-2">
                    <div className="relative">
                      <select
                        value={field.sheetColumn}
                        onChange={(e) => handleColumnChange(index, e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm appearance-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all cursor-pointer ${field.sheetColumn ? "text-slate-700" : "text-slate-400"
                          }`}
                      >
                        <option value="">Select Sheet Column...</option>
                        {mapping.sheetOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── toggles ── */}
          <div className="flex items-center gap-8 mb-8 px-1">
            <ToggleSwitch
              enabled={syncAuto}
              onChange={setSyncAuto}
              label="Sync automatically"
              sublabel="New contacts from sheet"
            />
            <ToggleSwitch
              enabled={updateRows}
              onChange={setUpdateRows}
              label="Update rows"
              sublabel="Sync changes to sheet"
            />
          </div>

          {/* ── footer actions ── */}
          <div className="flex items-center justify-between pt-5 border-t border-slate-200">
            <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer">
              <ShieldCheck className="w-4 h-4" />
              Test Connection
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-all duration-200 shadow-sm shadow-emerald-200 cursor-pointer flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5" />
                Save & Activate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── integration card component ── */
const IntegrationCard = ({ integration, isInstalled, onInstall, onConfigure }) => {
  const [installing, setInstalling] = useState(false);
  
  if (!integration) return null;
  
  const { name, description, icon, status, action } = integration;

  const isComingSoon = status === "coming_soon";

  // Determine effective action: if originally "install" but now installed → "configure"
  const effectiveAction = action === "install" && isInstalled ? "configure" : action;
  const effectiveStatus =
    action === "install" && isInstalled ? "connected" : status;

  const handleInstall = async () => {
    setInstalling(true);
    // simulate installation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setInstalling(false);
    onInstall(integration.id);
  };

  const actionButton = () => {
    if (installing) {
      return (
        <button
          disabled
          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white font-semibold text-sm cursor-not-allowed flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          Installing...
        </button>
      );
    }

    switch (effectiveAction) {
      case "configure":
        return (
          <button
            onClick={() => onConfigure(integration)}
            className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 cursor-pointer"
          >
            Configure
          </button>
        );
      case "install":
        return (
          <button
            onClick={handleInstall}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all duration-200 shadow-sm shadow-blue-200 cursor-pointer"
          >
            Install
          </button>
        );
      case "notify":
        return (
          <button
            disabled
            className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-200 text-slate-400 font-semibold text-sm cursor-not-allowed bg-slate-50"
          >
            Notify Me
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between hover:shadow-lg hover:border-slate-300 transition-all duration-300 group ${isComingSoon ? "opacity-80" : ""
        }`}
    >
      {/* top section */}
      <div className="flex-1">
        <div className="flex items-start justify-between mb-4">
          {icon}
          <StatusBadge status={effectiveStatus} />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1.5">{name}</h3>
        <p className="text-[13px] text-slate-500 leading-relaxed">{description}</p>
      </div>

      {/* bottom action */}
      <div className="mt-5">{actionButton()}</div>
    </div>
  );
};

/* ════════════════════════════════════════════════
   SYNC HISTORY VIEW
   ════════════════════════════════════════════════ */
const SyncHistoryView = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [appFilter, setAppFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("Last 7 Days");
  const [currentPage, setCurrentPage] = useState(1);

  const totalRecords = 1240;

  return (
    <div className="p-4 md:p-5 min-h-screen overflow-y-auto">
      {/* ── header ── */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="mt-1.5 w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">Sync History</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Monitor and audit your automated workflows and data transfers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 cursor-pointer flex items-center gap-2">
            <Trash2 className="w-3.5 h-3.5" />
            Clear History
          </button>
          <button className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-all duration-200 shadow-sm shadow-emerald-200 cursor-pointer flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" />
            Force Sync
          </button>
        </div>
      </div>

      {/* ── filter bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Sync ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
          />
        </div>
        <div className="relative">
          <Grid3x3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={appFilter}
            onChange={(e) => setAppFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 appearance-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all cursor-pointer"
          >
            <option value="All">App: All</option>
            <option value="Shopify">Shopify</option>
            <option value="Google Sheets">Google Sheets</option>
            <option value="Webhooks">Webhooks</option>
            <option value="Salesforce">Salesforce</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 appearance-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all cursor-pointer"
          >
            <option value="All">Status: All</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
            <option value="Processing">Processing</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 appearance-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all cursor-pointer"
          >
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Last 90 Days">Last 90 Days</option>
            <option value="All Time">All Time</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* ── data table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-[100px_1fr_1fr_100px_100px_1fr_80px] gap-4 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Integration</span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Operation</span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Records</span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Duration</span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Timestamp</span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</span>
        </div>

        {syncHistoryData.map((row, index) => (
          <div
            key={row.id}
            className={`grid grid-cols-[100px_1fr_1fr_100px_100px_1fr_80px] gap-4 px-4 py-2.5 items-center border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${index === syncHistoryData.length - 1 ? "border-b-0" : ""
              }`}
          >
            <div>
              <SyncStatusBadge status={row.status} />
            </div>
            <div className="flex items-center gap-3">
              {row.integrationIcon}
              <span className="text-sm font-semibold text-slate-700">{row.integration}</span>
            </div>
            <span className="text-sm text-slate-500">{row.operation}</span>
            <span className="text-sm text-slate-600 font-mono">{row.records}</span>
            <span className="text-sm text-slate-500">{row.duration}</span>
            <span className="text-sm text-slate-500">{row.timestamp}</span>
            <div className="flex justify-end">
              <button className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer">
                <Eye className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-200">
          <span className="text-xs text-slate-400">
            Showing {syncHistoryData.length} of {totalRecords.toLocaleString()} records
          </span>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all cursor-pointer">
              Previous
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${currentPage === page
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-500 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200"
                  }`}
              >
                {page}
              </button>
            ))}
            <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all cursor-pointer">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">
              Success Rate
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-800">98.4%</p>
          <p className="text-xs text-slate-400 mt-1">Average across all integrations</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">
              Avg Latency
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-800">0.84s</p>
          <p className="text-xs text-slate-400 mt-1">Processing time per request</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C6.48 2 2 4.02 2 6.5V17.5C2 19.98 6.48 22 12 22C17.52 22 22 19.98 22 17.5V6.5C22 4.02 17.52 2 12 2Z" />
                <path d="M2 6.5C2 8.98 6.48 11 12 11C17.52 11 22 8.98 22 6.5" />
                <path d="M2 12C2 14.48 6.48 16.5 12 16.5C17.52 16.5 22 14.48 22 12" />
              </svg>
            </div>
            <span className="text-[11px] font-bold text-green-500 uppercase tracking-wider">
              Total Rows
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-800">42,891</p>
          <p className="text-xs text-slate-400 mt-1">Synced in the last 7 days</p>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ════════════════════════════════════════════════ */
const AppIntegration = () => {
  const [sortBy] = useState("Most Popular");
  const [activeView, setActiveView] = useState("integrations");
  const [installedApps, setInstalledApps] = useState(new Set());
  const [configureTarget, setConfigureTarget] = useState(null); // integration object or null

  const handleInstall = (appId) => {
    setInstalledApps((prev) => new Set([...prev, appId]));
  };

  const handleConfigure = (integration) => {
    setConfigureTarget(integration);
  };

  /* ── show sync history view ── */
  if (activeView === "sync-history") {
    return <SyncHistoryView onBack={() => setActiveView("integrations")} />;
  }

  /* ── integrations view ── */
  return (
    <div className="p-6 min-h-screen overflow-y-auto pb-12">
      {/* ── Configure modal ── */}
      {configureTarget && (
        <ConfigureModal
          integration={configureTarget}
          onClose={() => setConfigureTarget(null)}
        />
      )}

      {/* ── Featured banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-8 md:p-10">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/80 text-xs font-medium tracking-wide">
                Featured Integration
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-3">
              Connect Zapier &amp; Automate
              <br />
              your Workflows
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-md leading-relaxed mb-6">
              Send automated WhatsApp messages triggered by 5,000+ apps in your
              Zapier ecosystem. No coding required.
            </p>

            <div className="flex items-center gap-3">
              <button className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-600/25 cursor-pointer flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Install Zapier
              </button>
              <button className="px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-white font-semibold text-sm hover:bg-white/20 transition-all duration-200 cursor-pointer flex items-center gap-2">
                <PlayCircle className="w-4 h-4" />
                View Tutorial
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center justify-center">
            <div className="w-36 h-36 rounded-2xl bg-[#8fa98a]/20 backdrop-blur-sm border border-white/10 flex items-center justify-center overflow-hidden">
              <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text x="10" y="70" fill="#8fa98a" fontWeight="800" fontSize="50" fontFamily="sans-serif" opacity="0.8">Z</text>
                <circle cx="75" cy="25" r="8" fill="#8fa98a" opacity="0.4" />
                <circle cx="80" cy="60" r="5" fill="#8fa98a" opacity="0.3" />
                <rect x="15" y="78" width="30" height="4" rx="2" fill="#8fa98a" opacity="0.3" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section heading ── */}
      <div className="flex items-end justify-between mt-8 mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Popular Integrations
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Enhance your MessBee workspace with these tools.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveView("sync-history")}
            className="px-4 py-2 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 cursor-pointer flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            Sync History
          </button>

          <div className="relative">
            <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">
              <span className="text-slate-400 text-xs">Sort by:</span>
              <span className="font-semibold text-slate-700">{sortBy}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Integration cards grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {integrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            isInstalled={installedApps.has(integration.id)}
            onInstall={handleInstall}
            onConfigure={handleConfigure}
          />
        ))}
      </div>

      {/* ── Load more ── */}
      <div className="flex justify-center mt-8 mb-4">
        <button className="px-8 py-2.5 rounded-full border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 cursor-pointer">
          Load More Integrations
        </button>
      </div>
    </div>
  );
};

export default AppIntegration;
