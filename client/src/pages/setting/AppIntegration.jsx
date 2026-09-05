/* eslint-disable react/prop-types */
import { useState, useMemo } from "react";
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
  Grid3x3,
  X,
  User,
  ShieldCheck,
  Copy,
  ExternalLink,
  Bell,
  Sparkles,
  Zap,
} from "lucide-react";

/* ── Brand Logos & SVGs ── */
const BrandLogos = {
  zapier: (
    <div className="w-12 h-12 rounded-2xl bg-[#FF4A00] flex items-center justify-center shadow-md shadow-[#FF4A00]/25">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M12 3V21M3 12H21M5.636 5.636L18.364 18.364M5.636 18.364L18.364 5.636" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  ),
  shopify: (
    <div className="w-12 h-12 rounded-2xl bg-[#95BF47]/15 flex items-center justify-center">
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
  hubspot: (
    <div className="w-12 h-12 rounded-2xl bg-[#FF7A59]/15 flex items-center justify-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="4.2" fill="#FF7A59" />
        <circle cx="12" cy="3.5" r="2.2" fill="#FF7A59" />
        <circle cx="19.5" cy="16.5" r="2.2" fill="#FF7A59" />
        <circle cx="4.5" cy="16.5" r="2.2" fill="#FF7A59" />
        <line x1="12" y1="5.7" x2="12" y2="7.8" stroke="#FF7A59" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="15.2" y1="13.8" x2="17.7" y2="15.2" stroke="#FF7A59" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="8.8" y1="13.8" x2="6.3" y2="15.2" stroke="#FF7A59" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </div>
  ),
  googleSheets: (
    <div className="w-12 h-12 rounded-2xl bg-[#0F9D58]/15 flex items-center justify-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="2" width="16" height="20" rx="3" fill="#0F9D58"/>
        <path d="M14 2L20 8H14V2Z" fill="#87CEAC"/>
        <rect x="7" y="10" width="10" height="9" rx="1" fill="white" fillOpacity="0.25"/>
        <line x1="7" y1="13" x2="17" y2="13" stroke="white" strokeWidth="1.2"/>
        <line x1="7" y1="16" x2="17" y2="16" stroke="white" strokeWidth="1.2"/>
        <line x1="12" y1="10" x2="12" y2="19" stroke="white" strokeWidth="1.2"/>
      </svg>
    </div>
  ),
  slack: (
    <div className="w-12 h-12 rounded-2xl bg-[#4A154B]/10 flex items-center justify-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#4A154B"/>
        <path d="M5.5 10.5C5.5 9.67 6.17 9 7 9C7.83 9 8.5 9.67 8.5 10.5V14H7C6.17 14 5.5 13.33 5.5 12.5V10.5Z" fill="#E01E5A"/>
        <circle cx="7" cy="6.5" r="1.5" fill="#E01E5A"/>
        <path d="M10.5 5.5C9.67 5.5 9 6.17 9 7C9 7.83 9.67 8.5 10.5 8.5H14V7C14 6.17 13.33 5.5 12.5 5.5H10.5Z" fill="#36C5F0"/>
        <circle cx="17.5" cy="7" r="1.5" fill="#36C5F0"/>
        <path d="M18.5 13.5C18.5 14.33 17.83 15 17 15C16.17 15 15.5 14.33 15.5 13.5V10H17C17.83 10 18.5 10.67 18.5 11.5V13.5Z" fill="#2EB67D"/>
        <circle cx="17" cy="17.5" r="1.5" fill="#2EB67D"/>
        <path d="M13.5 18.5C14.33 18.5 15 17.83 15 17C15 16.17 14.33 15.5 13.5 15.5H10V17C10 17.83 10.67 18.5 11.5 18.5H13.5Z" fill="#ECB22E"/>
        <circle cx="6.5" cy="17" r="1.5" fill="#ECB22E"/>
      </svg>
    </div>
  ),
  mailchimp: (
    <div className="w-12 h-12 rounded-2xl bg-[#FFE01B]/35 flex items-center justify-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#FFE01B"/>
        <circle cx="12" cy="12" r="7.5" fill="#241C15"/>
        <circle cx="10" cy="10" r="1.2" fill="#FFE01B"/>
        <circle cx="14" cy="10" r="1.2" fill="#FFE01B"/>
        <path d="M9.5 13.5C10.2 14.8 13.8 14.8 14.5 13.5" stroke="#FFE01B" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="12" cy="12.2" r="1" fill="#FFE01B"/>
      </svg>
    </div>
  ),
  salesforce: (
    <div className="w-12 h-12 rounded-2xl bg-[#00A1E0]/15 flex items-center justify-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M19.5 15.5C19.5 13.6 18 12.1 16.1 12.1C16 12.1 15.8 12.1 15.6 12.2C15.1 9.8 13 8 10.5 8C8.5 8 6.7 9.2 5.8 10.9C5.3 10.6 4.7 10.5 4.1 10.5C2.4 10.5 1 11.9 1 13.6C1 15.1 2.1 16.3 3.5 16.6C3.7 16.6 4 16.6 4.2 16.6H19.2C19.4 16.6 19.5 16.1 19.5 15.5Z" fill="#00A1E0"/>
        <path d="M9.5 11C10.5 10 12.5 10 13.5 11" stroke="white" strokeWidth="0.8" strokeLinecap="round"/>
        <text x="5.5" y="15" fill="white" fontWeight="900" fontSize="4.5" fontFamily="sans-serif">salesforce</text>
      </svg>
    </div>
  ),
  woocommerce: (
    <div className="w-12 h-12 rounded-2xl bg-[#7F54B3]/15 flex items-center justify-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#7F54B3"/>
        <text x="3.5" y="15.5" fill="white" fontWeight="900" fontSize="8.5" fontFamily="sans-serif">WOO</text>
      </svg>
    </div>
  ),
  stripe: (
    <div className="w-12 h-12 rounded-2xl bg-[#635BFF]/15 flex items-center justify-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#635BFF"/>
        <path d="M12.5 7.5C10.8 7.5 9.8 8.4 9.8 9.7C9.8 11.8 13.8 11.4 13.8 13.2C13.8 14.1 12.8 14.6 11.8 14.6C10.3 14.6 9.2 13.8 9 12.8H7.2C7.5 14.8 9.3 16.2 11.8 16.2C13.8 16.2 15.8 15.2 15.8 13.2C15.8 10.9 11.8 11.4 11.8 9.8C11.8 9.1 12.6 8.8 13.4 8.8C14.7 8.8 15.5 9.4 15.8 10.3H17.5C17.2 8.6 15.2 7.5 12.5 7.5Z" fill="white"/>
      </svg>
    </div>
  ),
  zoho: (
    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
      <div className="grid grid-cols-2 gap-1">
        <div className="w-3 h-3 rounded-sm bg-[#E53935]" />
        <div className="w-3 h-3 rounded-sm bg-[#43A047]" />
        <div className="w-3 h-3 rounded-sm bg-[#1E88E5]" />
        <div className="w-3 h-3 rounded-sm bg-[#FB8C00]" />
      </div>
    </div>
  ),
  webhooks: (
    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="2 2" />
      </svg>
    </div>
  ),
  notion: (
    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M4.5 5.5L16.5 4L19.5 6V19.5L8 21L4.5 18.5V5.5Z" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M8.5 8V17M8.5 8L15.5 17M15.5 8V17" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  ),
  airtable: (
    <div className="w-12 h-12 rounded-2xl bg-[#FCB400]/15 flex items-center justify-center">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 6.5L12 11L22 6.5L12 2Z" fill="#FCB400"/>
        <path d="M2 8.5V15.5L11 19.5V12.5L2 8.5Z" fill="#18BFFF"/>
        <path d="M13 12.5V19.5L22 15.5V8.5L13 12.5Z" fill="#F82B60"/>
      </svg>
    </div>
  ),
};

/* ── integration card data ── */
const initialIntegrations = [
  {
    id: "shopify",
    name: "Shopify",
    category: "E-Commerce",
    description: "Sync orders, send automated cart recovery messages and order updates via WhatsApp.",
    icon: BrandLogos.shopify,
    status: "connected",
    action: "configure",
    popularity: 98,
  },
  {
    id: "hubspot",
    name: "HubSpot",
    category: "CRM & Sales",
    description: "Log WhatsApp conversations directly into HubSpot contact timelines and automate deals.",
    icon: BrandLogos.hubspot,
    status: "new",
    action: "install",
    popularity: 95,
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    category: "Productivity & Dev",
    description: "Export chat history or trigger bulk messaging campaigns directly from spreadsheet rows.",
    icon: BrandLogos.googleSheets,
    status: "connected",
    action: "configure",
    popularity: 96,
  },
  {
    id: "slack",
    name: "Slack",
    category: "Productivity & Dev",
    description: "Receive WhatsApp notifications and reply directly from your favorite Slack channels.",
    icon: BrandLogos.slack,
    status: "coming_soon",
    action: "notify",
    popularity: 88,
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    category: "Marketing",
    description: "Segment your audiences and bridge the gap between email and WhatsApp marketing.",
    icon: BrandLogos.mailchimp,
    status: "new",
    action: "install",
    popularity: 89,
  },
  {
    id: "salesforce",
    name: "Salesforce",
    category: "CRM & Sales",
    description: "Enterprise-grade CRM integration for deep sales tracking and automated lead engagement.",
    icon: BrandLogos.salesforce,
    status: null,
    action: "install",
    popularity: 91,
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    category: "E-Commerce",
    description: "Instant order receipts, delivery dispatch alerts, and abandoned cart nudges.",
    icon: BrandLogos.woocommerce,
    status: null,
    action: "install",
    popularity: 87,
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "E-Commerce",
    description: "Trigger payment confirmation receipts, invoice links, and recurring renewal reminders.",
    icon: BrandLogos.stripe,
    status: null,
    action: "install",
    popularity: 92,
  },
  {
    id: "webhooks",
    name: "Webhooks & API",
    category: "Productivity & Dev",
    description: "Custom REST endpoints to send WhatsApp messages triggered from any server or backend.",
    icon: BrandLogos.webhooks,
    status: "connected",
    action: "configure",
    popularity: 94,
  },
  {
    id: "zoho",
    name: "Zoho CRM",
    category: "CRM & Sales",
    description: "Synchronize customer WhatsApp inquiries directly with Zoho CRM leads and contacts.",
    icon: BrandLogos.zoho,
    status: null,
    action: "install",
    popularity: 84,
  },
  {
    id: "notion",
    name: "Notion",
    category: "Productivity & Dev",
    description: "Create database items from incoming customer inquiries and sync documentation updates.",
    icon: BrandLogos.notion,
    status: null,
    action: "install",
    popularity: 86,
  },
  {
    id: "airtable",
    name: "Airtable",
    category: "Productivity & Dev",
    description: "Trigger multi-step WhatsApp campaigns directly from linked Airtable bases and records.",
    icon: BrandLogos.airtable,
    status: null,
    action: "install",
    popularity: 85,
  },
];

/* ── sync history sample data ── */
const syncHistoryData = [
  {
    id: "SYN-001",
    status: "success",
    integration: "Shopify",
    integrationIcon: BrandLogos.shopify,
    operation: "Inventory Sync",
    records: "142 rows",
    duration: "1.2s",
    timestamp: "Oct 24, 2026 14:20:01",
  },
  {
    id: "SYN-002",
    status: "failed",
    integration: "Google Sheets",
    integrationIcon: BrandLogos.googleSheets,
    operation: "Contact Export",
    records: "0 rows",
    duration: "0.5s",
    timestamp: "Oct 24, 2026 13:15:22",
  },
  {
    id: "SYN-003",
    status: "processing",
    integration: "Webhooks",
    integrationIcon: BrandLogos.webhooks,
    operation: "Data Ingest",
    records: "89 rows",
    duration: "--",
    timestamp: "Oct 24, 2026 15:45:10",
  },
  {
    id: "SYN-004",
    status: "success",
    integration: "Salesforce",
    integrationIcon: BrandLogos.salesforce,
    operation: "Lead Sync",
    records: "12 rows",
    duration: "2.1s",
    timestamp: "Oct 24, 2026 12:00:45",
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
  webhooks: {
    fields: [
      { messbeeField: "Event", sheetColumn: "payload.event_type" },
      { messbeeField: "Phone", sheetColumn: "payload.customer.phone" },
      { messbeeField: "Message", sheetColumn: "payload.message_text" },
      { messbeeField: "Metadata", sheetColumn: "payload.custom_data" },
    ],
    sheetOptions: [
      "payload.event_type",
      "payload.customer.phone",
      "payload.message_text",
      "payload.custom_data",
      "payload.timestamp",
    ],
  },
  woocommerce: {
    fields: [
      { messbeeField: "Customer", sheetColumn: "billing.first_name" },
      { messbeeField: "Phone", sheetColumn: "billing.phone" },
      { messbeeField: "Order ID", sheetColumn: "order.id" },
      { messbeeField: "Total", sheetColumn: "order.total" },
    ],
    sheetOptions: [
      "billing.first_name",
      "billing.phone",
      "order.id",
      "order.total",
      "order.status",
      "shipping.tracking_number",
    ],
  },
  stripe: {
    fields: [
      { messbeeField: "Customer", sheetColumn: "customer.name" },
      { messbeeField: "Phone", sheetColumn: "customer.phone" },
      { messbeeField: "Amount", sheetColumn: "charge.amount" },
      { messbeeField: "Invoice URL", sheetColumn: "invoice.hosted_url" },
    ],
    sheetOptions: [
      "customer.name",
      "customer.phone",
      "charge.amount",
      "charge.currency",
      "invoice.hosted_url",
      "subscription.status",
    ],
  },
  zoho: {
    fields: [
      { messbeeField: "Name", sheetColumn: "Full_Name" },
      { messbeeField: "Phone", sheetColumn: "Phone" },
      { messbeeField: "Lead Status", sheetColumn: "Lead_Status" },
      { messbeeField: "Owner", sheetColumn: "Owner.name" },
    ],
    sheetOptions: [
      "Full_Name",
      "Phone",
      "Lead_Status",
      "Owner.name",
      "Email",
      "Company",
    ],
  },
  notion: {
    fields: [
      { messbeeField: "Title", sheetColumn: "properties.Name.title" },
      { messbeeField: "Phone", sheetColumn: "properties.Phone.phone_number" },
      { messbeeField: "Status", sheetColumn: "properties.Status.select" },
      { messbeeField: "Notes", sheetColumn: "properties.Notes.rich_text" },
    ],
    sheetOptions: [
      "properties.Name.title",
      "properties.Phone.phone_number",
      "properties.Status.select",
      "properties.Notes.rich_text",
      "created_time",
    ],
  },
  airtable: {
    fields: [
      { messbeeField: "Record Name", sheetColumn: "fields.Name" },
      { messbeeField: "Phone", sheetColumn: "fields.Phone" },
      { messbeeField: "Stage", sheetColumn: "fields.Status" },
      { messbeeField: "Custom Trigger", sheetColumn: "fields.Trigger" },
    ],
    sheetOptions: [
      "fields.Name",
      "fields.Phone",
      "fields.Status",
      "fields.Trigger",
      "fields.Email",
      "createdTime",
    ],
  },
};

/* ── status badge component ── */
const StatusBadge = ({ status }) => {
  if (!status) return null;

  const config = {
    connected: {
      label: "CONNECTED",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-200",
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
  <div className="flex items-center justify-between gap-4">
    <div>
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <p className="text-xs text-slate-400">{sublabel}</p>
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
        enabled ? "bg-emerald-500" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

/* ════════════════════════════════════════════════
   CONFIGURE MODAL
   ════════════════════════════════════════════════ */
const ConfigureModal = ({ integration, onClose, onSaveSuccess }) => {
  const mapping = dataMappingConfig[integration?.id] || dataMappingConfig["google-sheets"];

  const [fieldMappings, setFieldMappings] = useState(
    mapping.fields.map((f) => ({ ...f }))
  );
  const [syncAuto, setSyncAuto] = useState(true);
  const [updateRows, setUpdateRows] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!integration) return null;

  const handleColumnChange = (index, value) => {
    setFieldMappings((prev) =>
      prev.map((f, i) => (i === index ? { ...f, sheetColumn: value } : f))
    );
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      if (onSaveSuccess) onSaveSuccess(integration.id);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150 border border-slate-100">
        
        {/* Header */}
        <div className="flex items-start justify-between px-7 pt-7 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {integration.icon}
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Configure {integration.name}
              </h2>
              <p className="text-xs text-emerald-600 font-bold">
                MessBee Integration Settings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-7 py-6">
          {/* STEP 1: Account Connection */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider">
                Step 1
              </span>
              <h3 className="text-sm font-bold text-slate-700">Account Connection</h3>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center border border-emerald-200 shadow-sm">
                  <User className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 leading-none mb-1">Connected as</p>
                  <p className="text-sm font-bold text-slate-800">marketing@messbee.com</p>
                </div>
              </div>
              <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer">
                Change Account
              </button>
            </div>
          </div>

          {/* STEP 2: Data Mapping Table */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider">
                  Step 2
                </span>
                <h3 className="text-sm font-bold text-slate-700">Field Mapping</h3>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Auto-Synced
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-200">
                <div className="px-4 py-2.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    MessBee Fields
                  </span>
                </div>
                <div className="px-4 py-2.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Target Column
                  </span>
                </div>
              </div>

              {fieldMappings.map((field, index) => (
                <div
                  key={field.messbeeField}
                  className={`grid grid-cols-2 items-center ${
                    index < fieldMappings.length - 1 ? "border-b border-slate-100" : ""
                  }`}
                >
                  <div className="px-4 py-3">
                    <span className="text-[13px] font-semibold text-slate-700">
                      {field.messbeeField}
                    </span>
                  </div>
                  <div className="px-3 py-2">
                    <div className="relative">
                      <select
                        value={field.sheetColumn}
                        onChange={(e) => handleColumnChange(index, e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="">Select column...</option>
                        {mapping.sheetOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 3: Toggles */}
          <div className="space-y-4 mb-6 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
            <ToggleSwitch
              enabled={syncAuto}
              onChange={setSyncAuto}
              label="Sync Automatically"
              sublabel="Real-time webhooks for new records"
            />
            <ToggleSwitch
              enabled={updateRows}
              onChange={setUpdateRows}
              label="Two-Way Row Updates"
              sublabel="Push status updates back to connected app"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Test Connection
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 rounded-full bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
              >
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                {saving ? "Saving..." : "Save & Activate"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════
   ZAPIER CONNECT MODAL
   ════════════════════════════════════════════════ */
const ZapierConnectModal = ({ onClose }) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const apiKey = "mb_live_99f2e87c0411a5bc901e";
  const webhookUrl = "https://api.messbee.com/v1/integrations/zapier/hook";

  const handleCopy = (text, setCopied) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150 border border-slate-100">
        
        {/* Header */}
        <div className="bg-[#FF4A00] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 3V21M3 12H21M5.636 5.636L18.364 18.364M5.636 18.364L18.364 5.636" stroke="#FF4A00" strokeWidth="3.2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black">Connect Zapier & MessBee</h2>
              <p className="text-xs text-white/90 font-medium">Trigger WhatsApp notifications from 5,000+ Apps</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Your MessBee API Key
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <input
                type="text"
                readOnly
                value={apiKey}
                className="bg-transparent font-mono text-xs text-slate-700 flex-1 outline-none font-semibold"
              />
              <button
                onClick={() => handleCopy(apiKey, setCopiedKey)}
                className="flex items-center gap-1 text-xs font-bold text-[#FF4A00] hover:text-[#e04000] px-3 py-1 rounded-lg bg-orange-50 border border-orange-200 transition-colors"
              >
                {copiedKey ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Zapier Inbound Webhook URL
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="bg-transparent font-mono text-xs text-slate-700 flex-1 outline-none font-semibold truncate"
              />
              <button
                onClick={() => handleCopy(webhookUrl, setCopiedUrl)}
                className="flex items-center gap-1 text-xs font-bold text-[#FF4A00] hover:text-[#e04000] px-3 py-1 rounded-lg bg-orange-50 border border-orange-200 transition-colors"
              >
                {copiedUrl ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedUrl ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <h4 className="text-xs font-black text-slate-800 mb-2">Supported Zapier Triggers:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                New Lead / Contact
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                E-Commerce Order Placed
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                Form Submission Event
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                Payment Received
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-5 border-t border-slate-100 flex items-center justify-between">
          <a
            href="https://zapier.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-[#FF4A00] hover:underline"
          >
            Open Zapier Dashboard <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════
   ZAPIER TUTORIAL MODAL
   ════════════════════════════════════════════════ */
const ZapierTutorialModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150 border border-slate-100">
        
        {/* Header */}
        <div className="bg-[#0f172a] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-1 text-emerald-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Step-by-Step Guide
          </div>
          <h2 className="text-xl font-black">How to Automate WhatsApp with Zapier</h2>
          <p className="text-xs text-slate-400 font-medium">3 simple steps to connect any app to MessBee</p>
        </div>

        {/* Steps */}
        <div className="p-6 space-y-4">
          <div className="flex gap-4 items-start p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0">
              1
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Create a New Zap</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Log into Zapier, click <strong>Create Zap</strong>, and select your trigger app (e.g. Typeform, Calendly, Google Forms, Stripe).
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-[#FF4A00] text-white flex items-center justify-center font-black text-sm shrink-0">
              2
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Select MessBee Action</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Choose <strong>MessBee WhatsApp Automation</strong> as your action app and select <strong>Send WhatsApp Template Message</strong>.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center font-black text-sm shrink-0">
              3
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Map Phone & Variables</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Paste your MessBee API Key, choose the pre-approved WhatsApp template, and map customer name/phone parameters. Turn on your Zap!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-5 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════
   NOTIFY ME MODAL
   ════════════════════════════════════════════════ */
const NotifyMeModal = ({ integration, onClose }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-slate-800">Get Notified</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-6">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">You're on the list!</h4>
            <p className="text-xs text-slate-500 mt-1">
              We'll email you the moment {integration?.name} integration launches.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              <strong>{integration?.name}</strong> integration is currently in private beta. Enter your email to be notified as soon as it is publicly available.
            </p>
            <div>
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-bold shadow-sm"
              >
                Notify Me
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

/* ── integration card component ── */
const IntegrationCard = ({ integration, isInstalled, onInstall, onConfigure, onNotify }) => {
  const [installing, setInstalling] = useState(false);

  if (!integration) return null;

  const { name, description, icon, status, action } = integration;
  const isComingSoon = status === "coming_soon";

  const effectiveAction = action === "install" && isInstalled ? "configure" : action;
  const effectiveStatus = action === "install" && isInstalled ? "connected" : status;

  const handleInstall = async () => {
    setInstalling(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setInstalling(false);
    onInstall(integration.id);
    onConfigure(integration);
  };

  const actionButton = () => {
    if (installing) {
      return (
        <button
          disabled
          className="w-full py-2.5 px-4 rounded-full bg-blue-600 text-white font-bold text-xs cursor-not-allowed flex items-center justify-center gap-2"
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
            className="w-full py-2.5 px-4 rounded-full border-2 border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 cursor-pointer"
          >
            Configure
          </button>
        );
      case "install":
        return (
          <button
            onClick={handleInstall}
            className="w-full py-2.5 px-4 rounded-full bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all duration-200 shadow-sm shadow-blue-200 cursor-pointer"
          >
            Install
          </button>
        );
      case "notify":
        return (
          <button
            onClick={() => onNotify(integration)}
            className="w-full py-2.5 px-4 rounded-full border-2 border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer bg-slate-50"
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
      className={`bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all duration-300 group ${
        isComingSoon ? "opacity-90" : ""
      }`}
    >
      <div className="flex-1">
        <div className="flex items-start justify-between mb-4">
          {icon}
          <StatusBadge status={effectiveStatus} />
        </div>
        <h3 className="text-base font-extrabold text-slate-900 mb-1.5">{name}</h3>
        <p className="text-[12px] text-slate-500 font-medium leading-relaxed">{description}</p>
      </div>

      <div className="mt-6">{actionButton()}</div>
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

  const filteredHistory = syncHistoryData.filter((row) => {
    const matchApp = appFilter === "All" || row.integration === appFilter;
    const matchStatus = statusFilter === "All" || row.status === statusFilter;
    const matchSearch =
      !searchQuery ||
      row.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.operation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.integration.toLowerCase().includes(searchQuery.toLowerCase());
    return matchApp && matchStatus && matchSearch;
  });

  return (
    <div className="p-6 min-h-screen overflow-y-auto">
      {/* header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="mt-1.5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Sync History</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Monitor and audit your automated workflows and data transfers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-full border-2 border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" />
            Clear History
          </button>
          <button className="px-4 py-2 rounded-full bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-sm cursor-pointer flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Force Sync
          </button>
        </div>
      </div>

      {/* filter bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Sync ID, app or operation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500"
          />
        </div>
        <div className="relative">
          <Grid3x3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={appFilter}
            onChange={(e) => setAppFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none appearance-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="All">All Apps</option>
            <option value="Shopify">Shopify</option>
            <option value="Google Sheets">Google Sheets</option>
            <option value="Webhooks">Webhooks</option>
            <option value="Salesforce">Salesforce</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none appearance-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="processing">Processing</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6">
        <div className="grid grid-cols-7 bg-slate-50/70 border-b border-slate-100 px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Status</span>
          <span className="col-span-2">Integration</span>
          <span>Operation</span>
          <span>Records</span>
          <span>Duration</span>
          <span className="text-right">Timestamp</span>
        </div>

        <div className="divide-y divide-slate-50">
          {filteredHistory.map((row) => (
            <div key={row.id} className="grid grid-cols-7 items-center px-6 py-4 hover:bg-slate-50/50 transition-colors">
              <div>
                <SyncStatusBadge status={row.status} />
              </div>
              <div className="col-span-2 flex items-center gap-3">
                {row.integrationIcon}
                <span className="text-xs font-bold text-slate-800">{row.integration}</span>
              </div>
              <span className="text-xs font-semibold text-slate-600">{row.operation}</span>
              <span className="text-xs font-mono font-bold text-slate-700">{row.records}</span>
              <span className="text-xs font-semibold text-slate-500">{row.duration}</span>
              <span className="text-xs font-medium text-slate-400 text-right">{row.timestamp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">
              Success Rate
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">98.4%</p>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Average across all integrations</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider">
              Avg Latency
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">0.84s</p>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Processing time per request</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">
              Total Rows
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">42,891</p>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Synced in the last 7 days</p>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ════════════════════════════════════════════════ */
const AppIntegration = () => {
  const [sortBy, setSortBy] = useState("Most Popular");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [activeView, setActiveView] = useState("integrations");
  const [installedApps, setInstalledApps] = useState(new Set(["shopify", "google-sheets", "webhooks"]));
  const [configureTarget, setConfigureTarget] = useState(null);
  const [notifyTarget, setNotifyTarget] = useState(null);
  const [showZapierConnect, setShowZapierConnect] = useState(false);
  const [showZapierTutorial, setShowZapierTutorial] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const categories = ["All", "E-Commerce", "CRM & Sales", "Marketing", "Productivity & Dev"];

  const handleInstall = (appId) => {
    setInstalledApps((prev) => new Set([...prev, appId]));
  };

  const handleConfigure = (integration) => {
    setConfigureTarget(integration);
  };

  const handleNotify = (integration) => {
    setNotifyTarget(integration);
  };

  // Filter & Sort
  const processedIntegrations = useMemo(() => {
    let list = [...initialIntegrations];

    // Category filter
    if (categoryFilter !== "All") {
      list = list.filter((item) => item.category === categoryFilter);
    }

    // Sort
    if (sortBy === "Most Popular") {
      list.sort((a, b) => b.popularity - a.popularity);
    } else if (sortBy === "Alphabetical (A-Z)") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "Connected First") {
      list.sort((a, b) => {
        const aConn = installedApps.has(a.id) || a.status === "connected";
        const bConn = installedApps.has(b.id) || b.status === "connected";
        return bConn - aConn;
      });
    } else if (sortBy === "Newest") {
      list.sort((a, b) => (b.status === "new" ? 1 : 0) - (a.status === "new" ? 1 : 0));
    }

    return list;
  }, [categoryFilter, sortBy, installedApps]);

  const displayedIntegrations = showAll ? processedIntegrations : processedIntegrations.slice(0, 6);

  if (activeView === "sync-history") {
    return <SyncHistoryView onBack={() => setActiveView("integrations")} />;
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen overflow-y-auto pb-16">
      {/* Configure Modal */}
      {configureTarget && (
        <ConfigureModal
          integration={configureTarget}
          onClose={() => setConfigureTarget(null)}
          onSaveSuccess={handleInstall}
        />
      )}

      {/* Zapier Connect Modal */}
      {showZapierConnect && (
        <ZapierConnectModal onClose={() => setShowZapierConnect(false)} />
      )}

      {/* Zapier Tutorial Modal */}
      {showZapierTutorial && (
        <ZapierTutorialModal onClose={() => setShowZapierTutorial(false)} />
      )}

      {/* Notify Me Modal */}
      {notifyTarget && (
        <NotifyMeModal
          integration={notifyTarget}
          onClose={() => setNotifyTarget(null)}
        />
      )}

      {/* ── Featured Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b132b] via-[#1c2541] to-[#0b132b] p-8 md:p-10 shadow-xl mb-8">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/90 text-xs font-semibold tracking-wide">
                Featured Integration
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight mb-3">
              Connect Zapier &amp; Automate your Workflows
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-lg leading-relaxed mb-6 font-medium">
              Send automated WhatsApp messages triggered by 5,000+ apps in your Zapier ecosystem. No coding required.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setShowZapierConnect(true)}
                className="px-5 py-2.5 rounded-full bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-md shadow-blue-600/30 cursor-pointer flex items-center gap-2"
              >
                <Link2 className="w-4 h-4" />
                Install Zapier
              </button>
              <button
                onClick={() => setShowZapierTutorial(true)}
                className="px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold text-xs hover:bg-white/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <PlayCircle className="w-4 h-4" />
                View Tutorial
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center justify-center">
            <div className="w-36 h-36 rounded-3xl bg-[#1e293b]/60 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl">
              <div className="w-20 h-20 rounded-2xl bg-[#FF4A00] flex items-center justify-center shadow-lg shadow-[#FF4A00]/40">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3V21M3 12H21M5.636 5.636L18.364 18.364M5.636 18.364L18.364 5.636" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section Heading & Controls ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            Popular Integrations
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Enhance your MessBee workspace with these tools.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setActiveView("sync-history")}
            className="px-4 py-2 rounded-full border-2 border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5" />
            Sync History
          </button>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer bg-white"
            >
              <span className="text-slate-400 font-medium">Sort by:</span>
              <span className="font-bold text-slate-800">{sortBy}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-20 animate-in fade-in zoom-in-95">
                  {["Most Popular", "Connected First", "Alphabetical (A-Z)", "Newest"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSortBy(opt);
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${
                        sortBy === opt ? "text-emerald-600 bg-emerald-50" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Category Filter Pills ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              categoryFilter === cat
                ? "bg-[#10B981] text-white shadow-sm shadow-emerald-500/20"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Integration Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedIntegrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            isInstalled={installedApps.has(integration.id)}
            onInstall={handleInstall}
            onConfigure={handleConfigure}
            onNotify={handleNotify}
          />
        ))}
      </div>

      {/* ── Load More / Show Less Button ── */}
      {processedIntegrations.length > 6 && (
        <div className="flex justify-center mt-10 mb-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-8 py-2.5 rounded-full border-2 border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-sm"
          >
            {showAll ? "Show Less" : `Load More Integrations (${processedIntegrations.length - 6} more)`}
          </button>
        </div>
      )}
    </div>
  );
};

export default AppIntegration;
