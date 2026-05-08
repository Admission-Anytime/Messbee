import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  Squares2X2Icon,
  ArrowUpTrayIcon,
  PlusIcon,
  LockClosedIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  UserCircleIcon,
  TrashIcon,
  TagIcon,
  ArrowPathIcon,
  MegaphoneIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  ArchiveBoxIcon,
  UserMinusIcon,
  ChatBubbleLeftIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

/* ─── API helpers ─────────────────────────────────────────────────────────────── */
const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
  : "";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const apiFetch = async (method, path, body = null) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...authHeader() },
    credentials: "include",
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) {
    const detailMsg = data?.details ? (Array.isArray(data.details) ? data.details.join(", ") : data.details) : "";
    throw new Error(data?.message ? `${data.message}${detailMsg ? ": " + detailMsg : ""}` : `Request failed (${res.status})`);
  }
  return data;
};

const fetchContacts = (params = {}) => {
  const qs = new URLSearchParams();
  if (params.page)  qs.set("page",  params.page);
  if (params.limit) qs.set("limit", params.limit);
  if (params.statuses && params.statuses.length > 0) {
    qs.set("status", params.statuses.join(","));
  } else if (params.status && params.status !== "All Contacts") {
    qs.set("status", params.status);
  }
  if (params.search)         qs.set("search", params.search);
  if (params.labels?.length) qs.set("labels", params.labels.join(","));
  return apiFetch("GET", `/api/contacts?${qs}`);
};

const createContact     = (data)     => apiFetch("POST",   "/api/contacts",            data);
const updateContact     = (id, data) => apiFetch("PUT",    `/api/contacts/${id}`,       data);
const deleteContact     = (id)       => apiFetch("DELETE", `/api/contacts/${id}`);
const bulkDelete        = (ids)      => apiFetch("DELETE", "/api/contacts/bulk-delete", { ids });
const bulkAddLabels     = (ids, labels) => apiFetch("PUT",    "/api/contacts/bulk-labels", { ids, labels });
const bulkRemoveLabels  = (ids, labels) => apiFetch("PUT",    "/api/contacts/bulk-labels-remove", { ids, labels });
const bulkUpdateStatus  = (ids, status) => apiFetch("PUT",    "/api/contacts/bulk-status", { ids, status });
const createCustomField = (data)     => apiFetch("POST",   "/api/custom-fields",        data);

/* ─── Static config ──────────────────────────────────────────────────────────── */
const BASE_COLUMNS = [
  { key: "name",      label: "Name",      locked: true  },
  { key: "whatsapp",  label: "WhatsApp",  locked: false },
  { key: "status",    label: "Status",    locked: false },
  { key: "labels",    label: "Labels",    locked: false },
  { key: "email",     label: "Email",     locked: false },
  { key: "institute", label: "Institute", locked: false },
  { key: "address",   label: "Address",   locked: false },
  { key: "phone",     label: "Phone",     locked: false },
  { key: "company",   label: "Company",   locked: false },
  { key: "city",      label: "City",      locked: false },
  { key: "country",   label: "Country",   locked: false },
];

const DEFAULT_VISIBLE = ["name", "whatsapp", "status", "labels", "email"];
const ROWS_OPTIONS    = [10, 25, 50, 100];
const ALL_STATUSES    = ["ACTIVE", "WARM", "INACTIVE", "COLD"];
const FIELD_TYPES     = ["Text", "Number", "Date", "Email", "URL", "Phone"];

const DEFAULT_LABELS = [
  "start first", "Cold lead", "Hot lead", "Issue raised", "Resolved",
  "Warm lead", "Payment pending", "Payment received", "Invoice sent",
];

const STATUS_CLS = {
  ACTIVE:   "bg-green-50 text-green-800 border border-green-200",
  WARM:     "bg-yellow-50 text-yellow-700 border border-yellow-200",
  INACTIVE: "bg-gray-100 text-gray-500 border border-gray-200",
  COLD:     "bg-blue-50 text-blue-800 border border-blue-200",
};
const STATUS_BTN_SEL = {
  ACTIVE:   "bg-green-50 text-green-800 border-green-300",
  WARM:     "bg-yellow-50 text-yellow-700 border-yellow-300",
  INACTIVE: "bg-gray-100 text-gray-500 border-gray-300",
  COLD:     "bg-blue-50 text-blue-800 border-blue-300",
};
const LABEL_CLS = {
  "Enterprise": "bg-purple-50 text-purple-700",
  "New Lead":   "bg-pink-50 text-pink-700",
  "Follow-up":  "bg-green-50 text-green-700",
  "+2":         "bg-violet-50 text-violet-700",
};

const getLabelColor = (label) => {
  const colors = ['#f97316', '#eab308', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = label.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

/* ─── Toast helper ───────────────────────────────────────────────────────────── */
const showToast = (type, title, message) => {
  const text = title && message ? `${title}: ${message}` : title || message;
  if (type === "success") toast.success(text);
  else if (type === "error") toast.error(text);
  else toast(text);
};

/* ─── Atoms ──────────────────────────────────────────────────────────────────── */
function Avatar({ initials, color, size = "sm" }) {
  const cls = size === "lg" ? "w-14 h-14 text-base" : "w-8 h-8 text-xs";
  return (
    <div
      className={`${cls} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 tracking-wide`}
      style={{ background: color }}
    >
      {initials}
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide ${STATUS_CLS[status] || ""}`}>
      {status}
    </span>
  );
}

function LabelBadge({ label }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-1 ${LABEL_CLS[label] || "bg-gray-100 text-gray-500"}`}>
      {label}
    </span>
  );
}

function CircularCheckbox({ checked, onChange, indeterminate }) {
  return (
    <div onClick={onChange} className="cursor-pointer inline-flex items-center justify-center select-none">
      {checked ? (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="9" fill="#4CAF50" />
          <path d="M5.5 9.5L7.8 12L12.5 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : indeterminate ? (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="8.5" stroke="#4CAF50" strokeWidth="1.5" fill="#f0fdf4" />
          <rect x="5" y="8.25" width="8" height="1.5" rx="0.75" fill="#4CAF50" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="8.5" stroke="#D1D5DB" strokeWidth="1.5" fill="white" />
        </svg>
      )}
    </div>
  );
}

/* ─── Add New Custom Field Panel ─────────────────────────────────────────────── */
function AddCustomFieldPanel({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({
    displayName: "",
    key: "",
    description: "",
    type: "Text",
    showInContacts: true,
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  useEffect(() => {
    if (isOpen) {
      setForm({ displayName: "", key: "", description: "", type: "Text", showInContacts: true });
      setError("");
    }
  }, [isOpen]);

  const handleDisplayNameChange = (val) => {
    const autoKey = val
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 30);
    setForm(prev => ({ ...prev, displayName: val, key: autoKey }));
  };

  const handleAdd = async () => {
    if (!form.displayName.trim()) { setError("Display name is required."); return; }
    if (!form.key.trim())         { setError("Key is required.");           return; }
    setError(""); setSaving(true);
    try {
      const payload = {
        name:           form.displayName.trim(),
        key:            form.key.trim(),
        description:    form.description.trim(),
        type:           form.type,
        showInContacts: form.showInContacts,
      };
      const res     = await createCustomField(payload);
      const created = res.data || res;
      showToast("success", "Custom Field Created", `"${form.displayName}" has been created.`);
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create custom field.");
    } finally { setSaving(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[700] flex justify-end font-sans">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-[400px] bg-white h-full shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeftIcon className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-base font-bold text-gray-900">Add New Custom Field</h2>
          </div>
          <button
            onClick={handleAdd}
            disabled={saving}
            className="bg-green-500 text-white px-6 py-1.5 rounded-lg text-sm font-bold hover:bg-green-600 transition-colors disabled:opacity-60"
          >
            {saving ? "Adding…" : "+ Add"}
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-4 py-2.5 font-medium">{error}</div>
          )}

          {/* Display Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Display Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              maxLength={25}
              placeholder="Enter Display Name"
              value={form.displayName}
              onChange={e => handleDisplayNameChange(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 transition-colors"
            />
            <p className="text-[10px] text-gray-400 mt-1">Maximum length of display name is 25</p>
          </div>

          {/* Key */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Key <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter Key"
              value={form.key}
              onChange={e => setForm(prev => ({
                ...prev,
                key: e.target.value.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""),
              }))}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 transition-colors font-mono"
            />
            <p className="text-[10px] text-gray-400 mt-1">Auto-generated from display name. Lowercase, underscores only.</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Description</label>
            <textarea
              placeholder="Enter Description"
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 transition-colors resize-none"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Type</label>
            <div className="relative">
              <select
                value={form.type}
                onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
                className="w-full appearance-none pl-3.5 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 transition-colors cursor-pointer bg-white"
              >
                {FIELD_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Visibility toggle */}
          <div className="flex items-start gap-3 pt-1">
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, showInContacts: !prev.showInContacts }))}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none mt-0.5 ${
                form.showInContacts ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                form.showInContacts ? "translate-x-4" : "translate-x-0"
              }`} />
            </button>
            <div>
              <p className="text-sm font-medium text-gray-800 leading-snug">
                Contact &amp; CRM page visibility (as a column)
              </p>
              <p className={`text-xs mt-0.5 font-medium transition-colors ${form.showInContacts ? "text-green-600" : "text-gray-400"}`}>
                {form.showInContacts
                  ? "✓ Will appear as a column in the contacts table"
                  : "✗ Will not appear as a column in the contacts table"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Edit Contact Modal ─────────────────────────────────────────────────────── */
function EditContactModal({ contact, onClose, onSave, customFields = [], labels = [] }) {
  const [form,   setForm]   = useState({ ...contact, labels: contact.labels || [] });
  const [saving, setSaving] = useState(false);
  const [labelSearch, setLabelSearch] = useState("");
  const [showLabelOptions, setShowLabelOptions] = useState(false);
  const dropdownRef = useRef(null);

  const baseFields = [
    { key: "name",      label: "Full Name" },
    { key: "email",     label: "Email"     },
    { key: "phone",     label: "Phone"     },
    { key: "whatsapp",  label: "WhatsApp"  },
    { key: "company",   label: "Company"   },
    { key: "institute", label: "Institute" },
    { key: "address",   label: "Address"   },
    { key: "city",      label: "City"      },
    { key: "country",   label: "Country"   },
  ];

  const handleSave = async () => {
    setSaving(true);
    try { 
      await onSave(form); 
      onClose(); 
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save contact. Please check for duplicate WhatsApp numbers.");
    } finally { 
      setSaving(false); 
    }
  };

  const getCustomValue = (field) => {
    const fId = field._id || field.id;
    const row  = (form.customFields || []).find(r => r.fieldId === fId);
    return row?.value || "";
  };

  const setCustomValue = (field, val) => {
    const fId   = field._id || field.id;
    const fName = field.name || field.fieldName || field.label || "";
    setForm(prev => {
      const existing = (prev.customFields || []).filter(r => r.fieldId !== fId);
      const updated  = val.trim() ? [...existing, { fieldId: fId, fieldName: fName, value: val }] : existing;
      return { ...prev, customFields: updated };
    });
  };

  useEffect(() => {
    if (!contact) return;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLabelOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [contact]);

  const toggleLabel = (l) => {
    if (!l) return;
    setForm(prev => {
      const currentLabels = prev.labels || [];
      const isSelected = currentLabels.includes(l);
      const updated = isSelected 
        ? currentLabels.filter(x => x !== l) 
        : [...currentLabels, l];
      return { ...prev, labels: updated };
    });
  };

  if (!contact) return null;

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center font-sans">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[92vw] max-w-[520px] max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Avatar initials={form.initials} color={form.color} size="sm" />
            <div>
              <h2 className="text-base font-bold text-gray-900">Edit Contact</h2>
              <p className="text-xs text-gray-400">Update contact information</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            {baseFields.map(({ key, label }) => (
              <div key={key} className={key === "address" ? "col-span-2" : ""}>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">{label}</label>
                <input
                  type="text"
                  value={form[key] || ""}
                  onChange={e => {
                    let val = e.target.value;
                    if (key === "phone" || key === "whatsapp") {
                      val = val.replace(/\D/g, '').slice(0, 10);
                    }
                    setForm({ ...form, [key]: val });
                  }}
                  placeholder={
                    key === "phone"
                      ? "Enter 10-digit phone number"
                      : key === "whatsapp"
                      ? "Enter 10-digit WhatsApp number"
                      : ""
                  }
                  maxLength={(key === "phone" || key === "whatsapp") ? 10 : undefined}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 transition-colors"
                />
              </div>
            ))}
            {customFields.length > 0 && (
              <div className="col-span-2 border-t border-gray-100 pt-4 mt-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Custom Fields</p>
                <div className="grid grid-cols-2 gap-4">
                  {customFields.map(field => (
                    <div key={field._id || field.id}>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">
                        {field.name || field.fieldName || field.label}
                      </label>
                      <input
                        type="text"
                        value={getCustomValue(field)}
                        onChange={e => setCustomValue(field, e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="col-span-2 border-t border-gray-100 pt-4 mt-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Manage Labels</p>
              <div className="relative" ref={dropdownRef}>
                <div 
                  onClick={() => setShowLabelOptions(!showLabelOptions)}
                  className={`min-h-[46px] w-full bg-gray-50 border rounded-2xl p-2 flex flex-wrap gap-1.5 cursor-pointer transition-all ${showLabelOptions ? 'border-emerald-500 ring-4 ring-emerald-50 bg-white' : 'border-gray-100 hover:border-emerald-200'}`}
                >
                  {form.labels.length > 0 ? (
                    form.labels.map(l => (
                      <span key={l} className="bg-emerald-500 text-white px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 animate-in zoom-in-95 duration-200">
                        {l}
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleLabel(l); }}
                          className="hover:bg-emerald-600 rounded-full p-0.5 transition-colors"
                        >
                          <XMarkIcon className="w-3 h-3 stroke-[3]" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs py-1.5 px-2 font-medium">Select labels...</span>
                  )}
                  <div className="flex-1 flex items-center justify-end pr-1">
                    <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showLabelOptions ? 'rotate-180 text-emerald-500' : ''}`} />
                  </div>
                </div>

                {showLabelOptions && (
                  <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-gray-100 z-[100] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <input 
                        autoFocus
                        type="text"
                        placeholder="Find labels..."
                        value={labelSearch}
                        onChange={(e) => setLabelSearch(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F8F9FA] border-none rounded-md text-sm font-medium outline-none focus:bg-[#F1F5F9] transition-colors placeholder:text-gray-400"
                      />
                    </div>
                    <div className="max-h-[180px] overflow-y-auto custom-scrollbar-labels flex flex-col py-1">
                      {[...new Set([...labels, ...form.labels])].filter(l => l.toLowerCase().includes(labelSearch.toLowerCase())).length === 0 ? (
                        <div className="py-8 text-center flex flex-col items-center">
                          <TagIcon className="w-8 h-8 text-gray-100 mb-2" />
                          <p className="text-[12px] text-gray-400 font-bold italic">No labels found</p>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          {[...new Set([...labels, ...form.labels])]
                            .filter(l => l.toLowerCase().includes(labelSearch.toLowerCase()))
                            .map(l => {
                              const isSelected = form.labels.includes(l);
                              return (
                                <button
                                  key={l}
                                  type="button"
                                  onClick={() => toggleLabel(l)}
                                  className={`flex items-center justify-between w-full px-5 py-2.5 transition-all group ${isSelected ? 'bg-[#F4F6F8]' : 'hover:bg-[#F8F9FA]'}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="w-2.5 h-2.5 rounded-full"
                                      style={{ backgroundColor: getLabelColor(l) }}
                                    />
                                    <span className={`text-sm ${isSelected ? 'text-[#1A233A] font-semibold' : 'text-[#2A3B52] font-medium'}`}>{l}</span>
                                  </div>
                                  {isSelected && <CheckCircleIcon className="w-4 h-4 text-emerald-500" />}
                                </button>
                              );
                            })
                          }
                        </div>
                      )}
                    </div>
                    {form.labels.length > 0 && (
                      <div className="p-2 border-t border-gray-50 bg-gray-50/50">
                        <button 
                          type="button"
                          onClick={() => { setForm(prev => ({ ...prev, labels: [] })); setLabelSearch(""); }}
                          className="w-full py-2 text-[10px] font-black text-red-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                        >
                          Clear All Labels
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-sm font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors shadow-sm disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Contact Profile Side Panel ─────────────────────────────────────────────── */
function ContactProfilePanel({ contact, onClose, onEdit, onDelete, customFields = [] }) {
  if (!contact) return null;

  const infoRows = [
    { Icon: EnvelopeIcon,       label: "Email",     value: contact.email     },
    { Icon: PhoneIcon,          label: "Phone",     value: contact.phone     },
    { Icon: PhoneIcon,          label: "WhatsApp",  value: contact.whatsapp  },
    { Icon: BuildingOfficeIcon, label: "Company",   value: contact.company   },
    { Icon: AcademicCapIcon,    label: "Institute", value: contact.institute },
    { Icon: MapPinIcon,         label: "Address",   value: contact.address   },
    { Icon: GlobeAltIcon,       label: "Country",   value: contact.country   },
  ];

  const customRows = customFields
    .map(field => {
      const fId = field._id || field.id;
      const row  = (contact.customFields || []).find(r => r.fieldId === fId);
      return { label: field.name || field.fieldName || field.label, value: row?.value || "" };
    })
    .filter(r => r.value);

  return (
    <div className="w-64 xl:w-72 flex-shrink-0 border-l border-gray-100 bg-white flex flex-col animate-in slide-in-from-right duration-200">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Profile</span>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600 transition-colors">
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-col items-center px-4 py-5 border-b border-gray-100">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3 shadow-sm"
          style={{ background: contact.color }}
        >
          {contact.initials}
        </div>
        <h3 className="text-base font-bold text-gray-900 text-center">{contact.name}</h3>
        <p className="text-xs text-gray-400 mt-0.5">{contact.company || "—"}</p>
        <div className="mt-2"><StatusBadge status={contact.status} /></div>
        {contact.labels?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 mt-2">
            {contact.labels.map(l => <LabelBadge key={l} label={l} />)}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {infoRows.map(({ Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-md bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
              <p className="text-sm text-gray-700 font-medium mt-0.5 break-all leading-snug">{value || "—"}</p>
            </div>
          </div>
        ))}
        {customRows.length > 0 && (
          <>
            <div className="border-t border-gray-100 pt-2 mt-1">
              <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-2">Custom Fields</p>
            </div>
            {customRows.map(({ label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-md bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TagIcon className="w-3.5 h-3.5 text-green-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                  <p className="text-sm text-gray-700 font-medium mt-0.5 break-all leading-snug">{value}</p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      <div className="px-4 py-4 border-t border-gray-100 flex gap-2">
        <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>Edit
        </button>
        <button onClick={onDelete} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>Delete
        </button>
      </div>
    </div>
  );
}

/* ─── Add Contact Drawer ─────────────────────────────────────────────────────── */
function AddContactDrawer({ isOpen, onClose, onAdd, labels = DEFAULT_LABELS, customFields = [], onOpenAddCustomField }) {
  const [formData,        setFormData]        = useState({ name: "", whatsapp: "", labels: [] });
  const [customFieldRows, setCustomFieldRows] = useState([{ fieldId: "", fieldName: "", value: "" }]);
  const [adding,          setAdding]          = useState(false);
  const [error,           setError]           = useState("");
  const [labelSearch, setLabelSearch] = useState("");
  const [showLabelOptions, setShowLabelOptions] = useState(false);
  const labelDropdownRef = useRef(null);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!formData.name || !formData.whatsapp) {
      setError("Name and WhatsApp number are required.");
      return;
    }
    setError(""); setAdding(true);
    try {
      const customFieldsPayload = customFieldRows
        .filter(r => r.fieldId && r.value.trim())
        .map(r => ({ fieldId: r.fieldId, fieldName: r.fieldName, value: r.value.trim() }));

      await onAdd({
        name:     formData.name,
        whatsapp: `+91${formData.whatsapp}`,
        labels:   formData.labels,
        status:   "ACTIVE",
        ...(customFieldsPayload.length > 0 ? { customFields: customFieldsPayload } : {}),
      });
      setFormData({ name: "", whatsapp: "", labels: [] });
      setCustomFieldRows([{ fieldId: "", fieldName: "", value: "" }]);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to add contact.");
    } finally { setAdding(false); }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (labelDropdownRef.current && !labelDropdownRef.current.contains(event.target)) {
        setShowLabelOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleLabel = (l) => {
    if (!l) return;
    setFormData(prev => {
      const currentLabels = prev.labels || [];
      const isSelected = currentLabels.includes(l);
      const updated = isSelected 
        ? currentLabels.filter(x => x !== l) 
        : [...currentLabels, l];
      return { ...prev, labels: updated };
    });
  };

  const addCustomFieldRow    = () =>
    setCustomFieldRows(prev => [...prev, { fieldId: "", fieldName: "", value: "" }]);

  const removeCustomFieldRow = (idx) =>
    setCustomFieldRows(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

  const updateCustomFieldRow = (idx, key, val) =>
    setCustomFieldRows(prev =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        if (key === "fieldId") {
          const found = customFields.find(f => (f._id || f.id) === val);
          return { ...row, fieldId: val, fieldName: found ? (found.name || found.fieldName || found.label || "") : "" };
        }
        return { ...row, [key]: val };
      })
    );

  const usedFieldIds = customFieldRows.map(r => r.fieldId).filter(Boolean);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex justify-end font-sans">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-[420px] bg-white h-full shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeftIcon className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-base font-bold text-gray-900">Add Contact</h2>
          </div>
          <button
            onClick={handleSubmit}
            disabled={adding}
            className="bg-green-500 text-white px-7 py-1.5 rounded-lg text-sm font-bold hover:bg-green-600 active:bg-green-700 transition-colors disabled:opacity-60"
          >
            {adding ? "Adding…" : "Add"}
          </button>
        </div>

        {/* Body */}
        <form className="flex-1 overflow-y-auto" onSubmit={handleSubmit}>
          {error && (
            <div className="mx-5 mt-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-4 py-2.5 font-medium">{error}</div>
          )}

          {/* Basic Information */}
          <div className="px-5 pt-5 pb-5">
            <p className="text-sm font-bold text-gray-900 mb-4">Basic Information</p>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Enter Name</label>
                <input
                  type="text"
                  placeholder="Enter name"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 transition-colors"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Enter WhatsApp Number</label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center w-14 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 font-semibold flex-shrink-0">
                    +91
                  </div>
                  <input
                    type="text"
                    placeholder="Enter 10-digit WhatsApp number"
                    className="flex-1 px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 transition-colors"
                    value={formData.whatsapp}
                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    maxLength={10}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Select Labels */}
          <div className="px-5 pt-4 pb-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Select Labels</p>
            <div className="relative" ref={labelDropdownRef}>
              <div 
                onClick={() => setShowLabelOptions(!showLabelOptions)}
                className={`min-h-[46px] w-full bg-gray-50 border rounded-2xl p-2 flex flex-wrap gap-1.5 cursor-pointer transition-all ${showLabelOptions ? 'border-emerald-500 ring-4 ring-emerald-50 bg-white' : 'border-gray-100 hover:border-emerald-200'}`}
              >
                {formData.labels.length > 0 ? (
                  formData.labels.map(l => (
                    <span key={l} className="bg-emerald-500 text-white px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 animate-in zoom-in-95 duration-200">
                      {l}
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleLabel(l); }}
                        className="hover:bg-emerald-600 rounded-full p-0.5 transition-colors"
                      >
                        <XMarkIcon className="w-3 h-3 stroke-[3]" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-xs py-1.5 px-2 font-medium">Select labels...</span>
                )}
                <div className="flex-1 flex items-center justify-end pr-1">
                  <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showLabelOptions ? 'rotate-180 text-emerald-500' : ''}`} />
                </div>
              </div>

              {showLabelOptions && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-gray-100 z-[100] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden flex flex-col">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <input 
                      autoFocus
                      type="text"
                      placeholder="Find labels..."
                      value={labelSearch}
                      onChange={(e) => setLabelSearch(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8F9FA] border-none rounded-md text-sm font-medium outline-none focus:bg-[#F1F5F9] transition-colors placeholder:text-gray-400"
                    />
                  </div>
                  <div className="max-h-[180px] overflow-y-auto custom-scrollbar-labels flex flex-col py-1">
                    {labels.filter(l => l.toLowerCase().includes(labelSearch.toLowerCase())).length === 0 ? (
                      <div className="py-8 text-center flex flex-col items-center">
                        <TagIcon className="w-8 h-8 text-gray-100 mb-2" />
                        <p className="text-[12px] text-gray-400 font-bold italic">No labels found</p>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {labels
                          .filter(l => l.toLowerCase().includes(labelSearch.toLowerCase()))
                          .map(l => {
                            const isSelected = formData.labels.includes(l);
                            return (
                              <button
                                key={l}
                                type="button"
                                onClick={() => toggleLabel(l)}
                                className={`flex items-center justify-between w-full px-5 py-2.5 transition-all group ${isSelected ? 'bg-[#F4F6F8]' : 'hover:bg-[#F8F9FA]'}`}
                              >
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: getLabelColor(l) }}
                                  />
                                  <span className={`text-sm ${isSelected ? 'text-[#1A233A] font-semibold' : 'text-[#2A3B52] font-medium'}`}>{l}</span>
                                </div>
                                {isSelected && <CheckCircleIcon className="w-4 h-4 text-emerald-500" />}
                              </button>
                            );
                          })
                        }
                      </div>
                    )}
                  </div>
                  {formData.labels.length > 0 && (
                    <div className="p-2 border-t border-gray-50 bg-gray-50/50">
                      <button 
                        type="button"
                        onClick={() => { setFormData(prev => ({ ...prev, labels: [] })); setLabelSearch(""); }}
                        className="w-full py-2 text-[10px] font-black text-red-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                      >
                        Clear All Labels
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Select Custom Fields */}
          <div className="px-5 pt-4 pb-8">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-gray-900">Select Custom Field</p>
              <button
                type="button"
                onClick={onOpenAddCustomField}
                className="w-6 h-6 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors"
                title="Create new custom field"
              >
                <PlusIcon className="w-3.5 h-3.5 text-white stroke-[3]" />
              </button>
            </div>

            {customFields.length === 0 ? (
              <div className="flex flex-col items-center py-4 text-center">
                <p className="text-xs text-gray-400 italic mb-2">No custom fields yet.</p>
                <button
                  type="button"
                  onClick={onOpenAddCustomField}
                  className="flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-700 transition-colors"
                >
                  <PlusIcon className="w-3.5 h-3.5 stroke-[3]" />Create your first custom field
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {customFieldRows.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        value={row.fieldId}
                        onChange={e => updateCustomFieldRow(idx, "fieldId", e.target.value)}
                        className="w-full appearance-none pl-3 pr-7 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 transition-colors cursor-pointer"
                      >
                        <option value="">Select Custom Field</option>
                        {customFields.map(f => {
                          const fId         = f._id || f.id;
                          const fName       = f.name || f.fieldName || f.label || "";
                          const alreadyUsed = usedFieldIds.includes(fId) && fId !== row.fieldId;
                          return (
                            <option key={fId} value={fId} disabled={alreadyUsed}>{fName}</option>
                          );
                        })}
                      </select>
                      <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    </div>

                    <input
                      type="text"
                      placeholder="Value"
                      value={row.value}
                      onChange={e => updateCustomFieldRow(idx, "value", e.target.value)}
                      disabled={!row.fieldId}
                      className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
                    />

                    <button
                      type="button"
                      onClick={() => removeCustomFieldRow(idx)}
                      className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {usedFieldIds.filter(Boolean).length < customFields.length && (
                  <button
                    type="button"
                    onClick={addCustomFieldRow}
                    className="flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-700 mt-1 transition-colors"
                  >
                    <PlusIcon className="w-3.5 h-3.5 stroke-[3]" />Add another field
                  </button>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Manage Columns Dropdown ────────────────────────────────────────────────── */
function ManageColumnsDropdown({ allColumns, visibleColumns, onToggle, onReset, onClose }) {
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  const filtered = allColumns.filter(c => c.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={ref} className="absolute top-[calc(100%+8px)] left-0 bg-white border border-gray-200 rounded-xl shadow-2xl z-[250] w-64 overflow-hidden">
      <div className="px-4 pt-3.5 pb-2.5 border-b border-gray-100">
        <p className="text-sm font-bold text-gray-900 mb-2.5">Manage Columns</p>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search fields..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 outline-none focus:border-green-400 transition-colors"
          />
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto py-1.5">
        {filtered.map(col => {
          // Custom columns: always visible (controlled by showInContacts on the field itself)
          // Base locked columns: always visible, not toggleable
          // Base unlocked columns: user can toggle
          const isCustom     = col.isCustom;
          const isBaseLocked = col.locked && !isCustom;
          const isToggleable = !isCustom && !col.locked;
          const isVisible    = isCustom ? true : visibleColumns.includes(col.key);

          return (
            <div
              key={col.key}
              onClick={() => isToggleable && onToggle(col.key)}
              className={`flex items-center justify-between px-4 py-2.5 select-none transition-colors ${
                isToggleable ? "cursor-pointer hover:bg-gray-50" : "cursor-default"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  {isVisible
                    ? <CheckCircleIcon className={`w-4 h-4 ${isCustom ? "text-green-400" : "text-green-500"}`} />
                    : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  }
                </div>
                <span className={`text-sm font-medium ${isBaseLocked ? "text-gray-400" : "text-gray-800"}`}>
                  {col.label}
                </span>
                {isCustom && (
                  <span className="text-[9px] bg-green-100 text-green-600 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">Custom</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {isBaseLocked && <LockClosedIcon className="w-3.5 h-3.5 text-gray-400 opacity-60" />}
                {isCustom && (
                  <span title="Visibility controlled via Custom Fields settings" className="text-[9px] text-gray-400 italic">auto</span>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-6 text-gray-400">
            <MagnifyingGlassIcon className="w-6 h-6 mb-1.5 opacity-50" />
            <p className="text-sm">No fields found</p>
          </div>
        )}
      </div>
      <div className="border-t border-gray-100 px-4 py-2.5 flex flex-col items-center gap-1">
        {/* Resets ONLY base columns back to DEFAULT_VISIBLE — custom columns are unaffected */}
        <button onClick={onReset} className="text-sm font-semibold text-green-600 px-2 py-1 rounded-md hover:bg-green-50 transition-colors">
          Reset to Default
        </button>
        <p className="text-[10px] text-gray-400 text-center">Custom columns are managed via their field settings</p>
      </div>
    </div>
  );
}

/* ─── More Filters Panel ─────────────────────────────────────────────────────── */
function MoreFiltersPanel({ filters, onApply, onClose, labels = DEFAULT_LABELS }) {
  const [labelSearch, setLabelSearch] = useState("");
  const [showLabelOptions, setShowLabelOptions] = useState(false);
  const labelDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onClose();
      if (labelDropdownRef.current && !labelDropdownRef.current.contains(event.target)) {
        setShowLabelOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const toggleArr = (field, val) =>
    setLocal(prev => {
      const arr = prev[field] || [];
      return { ...prev, [field]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] };
    });

  const activeCount = (local.statuses?.length || 0) + (local.labels?.length || 0);

  return (
    <div ref={ref} className="absolute top-[calc(100%+8px)] left-0 bg-white border border-gray-200 rounded-xl shadow-2xl z-[250] w-80">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-bold text-gray-900">More Filters</span>
          {activeCount > 0 && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{activeCount}</span>
          )}
        </div>
        <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="px-4 py-4 flex flex-col gap-4">
        <div>
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-2">Status</p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_STATUSES.map(s => {
              const sel = (local.statuses || []).includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleArr("statuses", s)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border tracking-wide transition-all ${sel ? STATUS_BTN_SEL[s] : "bg-gray-100 text-gray-500 border-gray-200 hover:border-gray-300"}`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-2">Labels</p>
          <div className="relative" ref={labelDropdownRef}>
            <div 
              onClick={() => setShowLabelOptions(!showLabelOptions)}
              className={`min-h-[42px] w-full bg-gray-50 border rounded-xl p-1.5 flex flex-wrap gap-1.5 cursor-pointer transition-all ${showLabelOptions ? 'border-emerald-500 ring-4 ring-emerald-50 bg-white' : 'border-gray-200 hover:border-emerald-200 shadow-sm'}`}
            >
              {(local.labels || []).length > 0 ? (
                (local.labels || []).map(l => (
                  <span key={l} className="bg-emerald-500 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 animate-in zoom-in-95 duration-200">
                    {l}
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleArr("labels", l); }}
                      className="hover:bg-emerald-600 rounded-full p-0.5 transition-colors"
                    >
                      <XMarkIcon className="w-2.5 h-2.5 stroke-[3]" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-xs py-1 px-1.5 font-medium">Any label...</span>
              )}
              <div className="flex-1 flex items-center justify-end pr-0.5">
                <ChevronDownIcon className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${showLabelOptions ? 'rotate-180 text-emerald-500' : ''}`} />
              </div>
            </div>

            {showLabelOptions && (
              <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] border border-gray-100 z-[300] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden flex flex-col">
                <div className="px-3 py-2.5 border-b border-gray-50">
                  <input 
                    autoFocus
                    type="text"
                    placeholder="Find labels..."
                    value={labelSearch}
                    onChange={(e) => setLabelSearch(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F9FA] border-none rounded-md text-[13px] font-medium outline-none focus:bg-[#F1F5F9] transition-colors placeholder:text-gray-400"
                  />
                </div>
                <div className="max-h-[160px] overflow-y-auto custom-scrollbar-labels flex flex-col py-1">
                  {labels.filter(l => l.toLowerCase().includes(labelSearch.toLowerCase())).length === 0 ? (
                    <div className="py-6 text-center flex flex-col items-center">
                      <TagIcon className="w-7 h-7 text-gray-100 mb-1.5" />
                      <p className="text-[11px] text-gray-400 font-bold italic">No labels found</p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {labels
                        .filter(l => l.toLowerCase().includes(labelSearch.toLowerCase()))
                        .map(l => {
                          const isSelected = (local.labels || []).includes(l);
                          return (
                            <button
                              key={l}
                              type="button"
                              onClick={() => toggleArr("labels", l)}
                              className={`flex items-center justify-between w-full px-4 py-2 transition-all group ${isSelected ? 'bg-[#F4F6F8]' : 'hover:bg-[#F8F9FA]'}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div 
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: getLabelColor(l) }}
                                />
                                <span className={`text-[13px] ${isSelected ? 'text-[#1A233A] font-semibold' : 'text-[#2A3B52] font-medium'}`}>{l}</span>
                              </div>
                              {isSelected && <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500" />}
                            </button>
                          );
                        })
                      }
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 px-4 py-3 flex justify-between items-center">
        <button
          onClick={() => { const e = { statuses: [], labels: [] }; setLocal(e); onApply(e); }}
          className="text-sm text-gray-400 font-medium hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          Clear All
        </button>
        <button
          onClick={() => { onApply(local); onClose(); }}
          className="text-sm font-semibold text-white bg-green-500 hover:bg-green-600 px-5 py-1.5 rounded-lg shadow-sm transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}

function FilterTag({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 bg-green-50 border border-green-200 rounded-full text-xs font-semibold text-green-700">
      {label}
      <button onClick={onRemove} className="flex items-center text-green-500 hover:text-green-700 transition-colors ml-0.5">
        <XMarkIcon className="w-3 h-3" />
      </button>
    </span>
  );
}

/* ─── Delete Confirm Modal ───────────────────────────────────────────────────── */
function DeleteConfirmModal({ isOpen, onConfirm, onCancel, count, loading }) {
  if (!isOpen) return null;
  const isBulk = count > 1;
  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[400px] p-6 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <TrashIcon className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          {isBulk ? `Delete ${count} Contacts?` : "Delete Contact?"}
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          {isBulk
            ? `You're about to permanently delete ${count} contacts. This action cannot be undone.`
            : "You're about to permanently delete this contact. This action cannot be undone."}
        </p>
        <div className="flex gap-3 w-full">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60"
          >
            {loading ? "Deleting…" : isBulk ? `Delete ${count} Contacts` : "Delete Contact"}
          </button>
        </div>
      </div>
    </div>
  );
}



/* ─── Pagination ─────────────────────────────────────────────────────────────── */
function Pagination({ currentPage, totalPages, rowsPerPage, totalCount, onPageChange, onRowsChange }) {
  const start = totalCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const end   = Math.min(currentPage * rowsPerPage, totalCount);

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 flex-wrap gap-2 font-sans">
      <span className="text-sm text-gray-500">Total contacts: <strong className="text-gray-900">{totalCount}</strong></span>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500">Rows per page:</span>
        <select
          value={rowsPerPage}
          onChange={e => { onRowsChange(Number(e.target.value)); onPageChange(1); }}
          className="border border-gray-200 rounded-md text-sm text-gray-700 px-2 py-1 cursor-pointer outline-none focus:border-green-400"
        >
          {ROWS_OPTIONS.map(n => <option key={n}>{n}</option>)}
        </select>
        <span className="text-sm text-gray-500 min-w-[90px] text-center">{start}–{end} of {totalCount}</span>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 border border-gray-200 rounded-md text-gray-500 hover:border-green-400 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        <div className="flex gap-1">
          {getPages().map((p, i) =>
            p === "..."
              ? <span key={`d${i}`} className="px-2 py-1 text-sm text-gray-400">…</span>
              : <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`min-w-[32px] px-2 py-1 border rounded-md text-sm font-medium transition-all ${p === currentPage ? "bg-green-500 text-white border-green-500 font-bold" : "bg-white text-gray-500 border-gray-200 hover:border-green-400 hover:text-green-700"}`}
                >
                  {p}
                </button>
          )}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="p-1.5 border border-gray-200 rounded-md text-gray-500 hover:border-green-400 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── Bulk Action Toolbar ────────────────────────────────────────────────────── */
function BulkActionToolbar({ selectedCount, onClear, onDelete, onLabel, onRemoveLabel, onStatus, onCampaign, labels = [], statuses = [] }) {
  const [activeMenu, setActiveMenu] = useState(null); // 'label' | 'status' | 'more' | null
  const [showOptions, setShowOptions] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!activeMenu) {
      setShowOptions(false);
      setSelectedLabels([]);
    }
  }, [activeMenu]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (selectedCount === 0) return null;

  const filteredLabels = labels;
  const filteredStatuses = statuses;

  const toggleLabel = (l) => {
    setSelectedLabels(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
  };

  return (
    <div className="fixed bottom-2 left-1/2 z-[500] w-[min(920px,calc(100vw-0.75rem))] -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-300 font-sans sm:bottom-3" ref={menuRef}>
      {/* Dropdown Menu - Labels */}
      {activeMenu === 'label' && (
        <div className="absolute bottom-[calc(100%+10px)] left-0 w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.12)] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-white to-white px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 shadow-sm shadow-emerald-200">
                <TagIcon className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold text-slate-900 leading-none">Manage labels</span>
                <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-600">{selectedLabels.length} selected</span>
              </div>
            </div>
            <button onClick={() => setActiveMenu(null)} className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" title="Close">
              <XMarkIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex flex-col" ref={searchRef}>
            <div className="max-h-[180px] overflow-y-auto custom-scrollbar-labels py-1 animate-in fade-in slide-in-from-top-2 duration-200">
              {filteredLabels.length === 0 ? (
                <div className="flex flex-col items-center px-4 py-6 text-center">
                  <TagIcon className="mb-1.5 h-7 w-7 text-slate-200" />
                  <p className="text-xs font-medium italic text-slate-400">No labels found</p>
                </div>
              ) : filteredLabels.map((l, i) => {
                const isSel = selectedLabels.includes(l);
                return (
                  <button
                    key={l}
                    onClick={(e) => { e.stopPropagation(); toggleLabel(l); }}
                    style={{ animationDelay: `${i * 15}ms` }}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors animate-in fade-in slide-in-from-bottom-2 fill-mode-both ${
                      isSel ? 'bg-emerald-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getLabelColor(l) }} />
                      <span className={`text-[13px] ${isSel ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>{l}</span>
                    </div>
                    {isSel && <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500" />}
                  </button>
                );
              })}
              </div>
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-3.5 py-2.5">
            {selectedLabels.length > 0 ? (
              <div className="flex gap-2 w-full">
                <button onClick={() => { onRemoveLabel(selectedLabels); setActiveMenu(null); }} className="flex-1 rounded-xl border border-red-100 bg-white px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-red-500 transition-colors hover:bg-red-50">Remove</button>
                <button onClick={() => { onLabel(selectedLabels); setActiveMenu(null); }} className="flex-1 rounded-xl bg-emerald-500 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white shadow-sm shadow-emerald-200 transition-colors hover:bg-emerald-600">Assign</button>
              </div>
            ) : (
              <>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Bulk actions</span>
                <button onClick={() => setActiveMenu(null)} className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 transition-colors hover:text-red-500">Cancel</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Dropdown Menu - Status */}
      {activeMenu === 'status' && (
        <div className="absolute bottom-[calc(100%+10px)] left-0 w-[290px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.12)] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-white to-white px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 shadow-sm shadow-emerald-200">
                <ArrowPathIcon className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold text-slate-900 leading-none">Set status</span>
              </div>
            </div>
          </div>
          <div className="p-2.5" ref={searchRef}>
            <div className="mt-2 max-h-[180px] overflow-y-auto custom-scrollbar px-0.5 pb-1 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-200">
              {filteredStatuses.length === 0 ? (
                <div className="flex flex-col items-center px-4 py-6 text-center">
                  <ArrowPathIcon className="mb-1.5 h-7 w-7 text-slate-200" />
                  <p className="text-xs font-medium italic text-slate-400">No statuses found</p>
                </div>
              ) : filteredStatuses.map((s, i) => (
                <button
                  key={s.name || s}
                  onClick={(e) => { e.stopPropagation(); onStatus(s.name || s); setActiveMenu(null); }}
                  style={{ animationDelay: `${i * 15}ms` }}
                  className="group flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-[13px] font-medium text-slate-700 transition-colors animate-in fade-in slide-in-from-bottom-2 fill-mode-both hover:bg-emerald-50"
                >
                  <div
                    className="h-3 w-3 rounded-full shadow-sm ring-4 ring-transparent transition-all group-hover:ring-emerald-100"
                    style={{ backgroundColor: s.color || '#10B981' }}
                  />
                  <span className="truncate">{s.name || s}</span>
                </button>
              ))}
              </div>
          </div>
          <div className="flex justify-end border-t border-slate-100 bg-slate-50/70 px-3.5 py-2.5">
            <button onClick={() => setActiveMenu(null)} className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 transition-colors hover:text-red-500">Cancel</button>
          </div>
        </div>
      )}

      {/* Dropdown Menu - More Actions */}
      {activeMenu === 'more' && (
        <div className="absolute bottom-[calc(100%+10px)] right-0 w-[240px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.12)] animate-in fade-in slide-in-from-bottom-4 duration-300 py-2">
          {[
            { label: 'Closed chats',     icon: CheckCircleIcon,       color: 'text-slate-600' },
            { label: 'Archived chats',   icon: ArchiveBoxIcon,        color: 'text-slate-600' },
            { label: 'Unarchived chats', icon: ArrowUpTrayIcon,       color: 'text-slate-600' },
            { divider: true },
            { label: 'Delete chat',      icon: TrashIcon,             color: 'text-red-500' },
            { label: 'Delete contact',   icon: UserMinusIcon,         color: 'text-red-500' },
            { divider: true },
            { label: 'Pin chat',         icon: MapPinIcon,            color: 'text-slate-600' },
            { label: 'Unpin chat',       icon: MapPinIcon,            color: 'text-slate-400' },
            { label: 'Mark as un-read',  icon: ChatBubbleLeftIcon,    color: 'text-slate-600' },
          ].map((item, i) => item.divider ? (
            <div key={`d-${i}`} className="mx-3.5 my-1.5 h-px bg-slate-100" />
          ) : (
            <button 
              key={item.label}
              onClick={() => { setActiveMenu(null); }}
              style={{ animationDelay: `${i * 20}ms` }}
              className="group flex w-full items-center gap-2.5 px-4 py-2 text-left transition-colors animate-in fade-in slide-in-from-bottom-1 fill-mode-both hover:bg-slate-50"
            >
              <item.icon className={`h-3.5 w-3.5 ${item.color} transition-transform group-hover:scale-110`} />
              <span className={`text-[12px] font-semibold ${item.color}`}>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mx-auto flex w-full flex-col gap-2 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 md:min-w-[180px] md:flex-shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-600 ring-1 ring-emerald-100">{selectedCount}</div>
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-slate-900 leading-none">Contacts selected</span>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-600">Bulk mode active</span>
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-1 sm:grid-cols-4">
          <button 
            onClick={() => setActiveMenu(activeMenu === 'label' ? null : 'label')} 
            className={`flex min-w-0 flex-col items-center justify-center rounded-xl border px-2 py-2 transition-all group ${activeMenu === 'label' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <TagIcon className={`mb-0.5 h-4 w-4 ${activeMenu === 'label' ? 'text-emerald-600' : 'group-hover:text-emerald-600'}`} />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] leading-none">Add Label</span>
          </button>
          <button 
            onClick={() => setActiveMenu(activeMenu === 'status' ? null : 'status')} 
            className={`flex min-w-0 flex-col items-center justify-center rounded-xl border px-2 py-2 transition-all group ${activeMenu === 'status' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <ArrowPathIcon className={`mb-0.5 h-4 w-4 ${activeMenu === 'status' ? 'rotate-180 text-emerald-600 transition-transform' : 'group-hover:text-emerald-600'}`} />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] leading-none text-center">Change<br />Status</span>
          </button>
          <button onClick={onCampaign} className="flex min-w-0 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-2 py-2 text-slate-500 transition-all group hover:border-emerald-200 hover:bg-slate-50 hover:text-slate-900">
            <MegaphoneIcon className="mb-0.5 h-4 w-4 group-hover:-rotate-12 group-hover:text-emerald-600" />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] leading-none text-center">Send<br />Campaign</span>
          </button>
          <button 
            onClick={() => setActiveMenu(activeMenu === 'more' ? null : 'more')}
            className={`flex min-w-0 flex-col items-center justify-center rounded-xl border px-2 py-2 transition-all group ${activeMenu === 'more' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <div className="flex flex-col items-center">
              <EllipsisHorizontalIcon className={`mb-0.5 h-4 w-4 ${activeMenu === 'more' ? 'text-emerald-600' : 'group-hover:text-emerald-600'}`} />
              <span className="flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-[0.12em] leading-none">
                Actions <ChevronDownIcon className={`h-2.5 w-2.5 transition-transform ${activeMenu === 'more' ? 'rotate-180' : ''}`} />
              </span>
            </div>
          </button>
        </div>
        <div className="flex items-center gap-1.5 border-t border-slate-100 pt-2 md:border-l md:border-t-0 md:pl-2 md:pt-0">
          <button onClick={onDelete} className="flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-[11px] font-bold text-red-600 transition-all active:scale-[0.98] hover:bg-red-500 hover:text-white">
            <TrashIcon className="h-4 w-4" />Delete
          </button>
          <button onClick={onClear} className="rounded-full border border-slate-200 p-2.5 text-slate-400 transition-all active:rotate-90 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900" title="Clear Selection">
            <XMarkIcon className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}


/* ─── Main Component ──────────────────────────────────────────────────────────── */
export default function ContactsCRM() {
  const navigate = useNavigate();

  const [contacts,           setContacts]          = useState([]);
  const [pagination,         setPagination]        = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading,            setLoading]           = useState(false);
  const [apiError,           setApiError]          = useState("");
  const [selectedRows,       setSelectedRows]      = useState([]);
  const [filterStatus,       setFilterStatus]      = useState("All Contacts");
  const [searchQuery,        setSearchQuery]       = useState("");
  const [showColumns,        setShowColumns]       = useState(false);
  const [showMoreFilters,    setShowMoreFilters]   = useState(false);
  const [visibleColumns,     setVisibleColumns]    = useState(DEFAULT_VISIBLE);
  const [advFilters,         setAdvFilters]        = useState({ statuses: [], labels: [] });
  const [currentPage,        setCurrentPage]       = useState(1);
  const [rowsPerPage,        setRowsPerPage]       = useState(10);
  const [isDrawerOpen,       setIsDrawerOpen]      = useState(false);
  const [deleteModal,        setDeleteModal]       = useState({ isOpen: false, id: null, count: 1, loading: false });
  const [editingContact,     setEditingContact]    = useState(null);
  const [profileContact,     setProfileContact]    = useState(null);
  const [allLabels,          setAllLabels]         = useState(DEFAULT_LABELS);
  const [allCustomFields,    setAllCustomFields]   = useState([]);
  const [showAddCustomField, setShowAddCustomField]= useState(false);
  const searchTimeout = useRef(null);

  // ─── FIX: allColumns is derived from allCustomFields (fetched from API on every load).
  // Only fields with showInContacts === true appear as columns.
  // This means columns are always correct after refresh — no manual state tracking needed.
  const allColumns = [
    ...BASE_COLUMNS,
    ...allCustomFields
      .filter(f => f.showInContacts === true)
      .map(f => ({
        key:      `cf_${f._id || f.id}`,
        label:    f.name || f.fieldName || f.label || "Custom",
        locked:   false,
        isCustom: true,
        fieldId:  f._id || f.id,
      })),
  ];

  /* ── Fetch labels ── */
  useEffect(() => {
    apiFetch("GET", "/api/labels")
      .then(res => {
        const list  = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : [];
        const names = list.map(l => (typeof l === "string" ? l : l.name)).filter(Boolean);
        if (names.length > 0) setAllLabels(names);
      })
      .catch(() => {});
  }, []);

  /* ── Fetch custom fields ── */
  const loadCustomFields = useCallback(() => {
    apiFetch("GET", "/api/custom-fields")
      .then(res => {
        const list = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : [];
        setAllCustomFields(list);
      })
      .catch(() => {});
  }, []);

  useEffect(() => { loadCustomFields(); }, [loadCustomFields]);
  const [allStatuses,        setAllStatuses]       = useState([]);

  /* ── Fetch statuses ── */
  useEffect(() => {
    apiFetch("GET", "/api/statuses")
      .then(res => {
        const list = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : [];
        if (list.length > 0) setAllStatuses(list);
      })
      .catch(() => {});
  }, []);

  // ─── Listen for cross-page custom field changes (delete / toggle / create).
  // CustomFieldsSection fires window.dispatchEvent("customFieldsChanged") with the
  // latest fields array as e.detail — giving instant sync with no polling/refresh.
  useEffect(() => {
    const onChanged = (e) => {
      if (Array.isArray(e.detail)) setAllCustomFields(e.detail);
      else loadCustomFields(); // fallback re-fetch if no payload
    };
    window.addEventListener("customFieldsChanged", onChanged);
    return () => window.removeEventListener("customFieldsChanged", onChanged);
  }, [loadCustomFields]);

  /* ── Fetch contacts ── */
  const loadContacts = useCallback(async () => {
    setLoading(true); setApiError("");
    try {
      const res = await fetchContacts({
        page:     currentPage,
        limit:    rowsPerPage,
        status:   filterStatus,
        statuses: advFilters.statuses,
        search:   searchQuery,
        labels:   advFilters.labels,
      });
      setContacts(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setApiError(err.message || "Failed to load contacts.");
    } finally { setLoading(false); }
  }, [currentPage, rowsPerPage, filterStatus, searchQuery, advFilters]);

  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(loadContacts, searchQuery ? 350 : 0);
    return () => clearTimeout(searchTimeout.current);
  }, [loadContacts, searchQuery]);

  const applyFilters      = f => { setAdvFilters(f); setCurrentPage(1); };
  const activeFilterCount = advFilters.statuses.length + advFilters.labels.length;

  /* ── Add contact ── */
  const handleAdd = async (data) => {
    const res = await createContact(data);
    showToast("success", "Contact Added", `${res.data.name} has been added successfully.`);
    setCurrentPage(1);
    loadContacts();
  };

  // ─── FIX: Just append to allCustomFields. orderedVisibleCols auto-derives from it.
  // showInContacts=true  → field is in allColumns (filtered above) → shown in table
  // showInContacts=false → field excluded from allColumns           → hidden in table
  // Both survive refresh because allCustomFields is re-fetched from the API on load.
  const handleCustomFieldCreated = (newField) => {
    setAllCustomFields(prev => [...prev, newField]);
  };

  /* ── Edit contact ── */
  const handleSaveEdit = async (updated) => {
    const res = await updateContact(updated._id, updated);
    setContacts(prev => prev.map(c => c._id === res.data._id ? res.data : c));
    if (profileContact?._id === res.data._id) setProfileContact(res.data);
    showToast("success", "Contact Updated", `${res.data.name} has been updated successfully.`);
    loadContacts(); 
  };

  /* ── Delete ── */
  const handleDeleteSingle = (id) => setDeleteModal({ isOpen: true, id, count: 1, loading: false });
  const handleBulkDelete   = ()  => setDeleteModal({ isOpen: true, id: null, count: selectedRows.length, loading: false });

  const confirmDelete = async () => {
    setDeleteModal(prev => ({ ...prev, loading: true }));
    try {
      if (deleteModal.id !== null) {
        await deleteContact(deleteModal.id);
        if (profileContact?._id === deleteModal.id) setProfileContact(null);
        showToast("success", "Contact Deleted", "The contact has been removed successfully.");
      } else {
        await bulkDelete(selectedRows);
        setSelectedRows([]);
        showToast("success", "Contacts Deleted", `${deleteModal.count} contacts have been removed.`);
      }
      setDeleteModal({ isOpen: false, id: null, count: 1, loading: false });
      loadContacts();
    } catch (err) {
      showToast("error", "Delete Failed", err.message || "Something went wrong.");
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const cancelDelete = () => setDeleteModal({ isOpen: false, id: null, count: 1, loading: false });
  
  const handleBulkLabel = async (labels) => {
    try {
      const res = await bulkAddLabels(selectedRows, labels);
      if (res.success) {
        showToast("success", "Labels Added", `Added labels to ${res.updated || 0} contacts.`);
        setSelectedRows([]);
        loadContacts();
      } else {
        showToast("error", "Failed to add labels", res.message);
      }
    } catch (err) {
      showToast("error", "Error", err.message || "An error occurred while adding labels");
    }
  };

  const handleBulkRemoveLabel = async (labels) => {
    try {
      const res = await bulkRemoveLabels(selectedRows, labels);
      if (res.success) {
        showToast("success", "Labels Removed", `Removed labels from ${res.updated || 0} contacts.`);
        setSelectedRows([]);
        loadContacts();
      } else {
        showToast("error", "Failed to remove labels", res.message);
      }
    } catch (err) {
      showToast("error", "Error", err.message || "An error occurred while removing labels");
    }
  };

  const handleBulkStatus = async (status) => {
    try {
      const res = await bulkUpdateStatus(selectedRows, status);
      if (res.success) {
        showToast("success", "Status Updated", `Updated status for ${res.updated || 0} contacts.`);
        setSelectedRows([]);
        loadContacts();
      } else {
        showToast("error", "Failed to update status", res.message);
      }
    } catch (err) {
      showToast("error", "Error", err.message || "An error occurred while updating status");
    }
  };

  const handleSendCampaign = () => {
    navigate("/admin/campaign/create", { 
      state: { 
        selectedContactIds: selectedRows,
        source: "contacts_bulk_action"
      }
    });
  };

  /* ── Row click → profile ── */
  const handleRowClick = (contact, e) => {
    if (e.target.closest("td:first-child") || e.target.closest(".action-btn")) return;
    setProfileContact(prev => prev?._id === contact._id ? null : contact);
  };

  /* ── Selection ── */
  const allPageSelected  = contacts.length > 0 && contacts.every(c => selectedRows.includes(c._id));
  const somePageSelected = !allPageSelected && contacts.some(c => selectedRows.includes(c._id));

  const toggleSelectAll = () => {
    const ids = contacts.map(c => c._id);
    setSelectedRows(prev => allPageSelected ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])]);
  };

  // ─── FIX: Custom field columns always show (they're already filtered by showInContacts
  // in allColumns above). Base columns are controlled by visibleColumns state as before.
  const orderedVisibleCols = allColumns.filter(col =>
    col.isCustom ? true : visibleColumns.includes(col.key)
  );
  const hasFilters = activeFilterCount > 0 || filterStatus !== "All Contacts" || Boolean(searchQuery.trim());

  const filterTags = [
    ...advFilters.statuses.map(s => ({
      label:  `Status: ${s}`,
      remove: () => applyFilters({ ...advFilters, statuses: advFilters.statuses.filter(x => x !== s) }),
    })),
    ...advFilters.labels.map(l => ({
      label:  `Label: ${l}`,
      remove: () => applyFilters({ ...advFilters, labels: advFilters.labels.filter(x => x !== l) }),
    })),
  ];

  /* ── Cell renderer ── */
  const renderCell = (contact, col) => {
    if (col.isCustom) {
      const row = (contact.customFields || []).find(r => r.fieldId === col.fieldId);
      return <span className="text-gray-500 text-sm">{row?.value || <span className="text-gray-300 text-xs italic">—</span>}</span>;
    }
    switch (col.key) {
      case "name":      return (
        <div className="flex items-center gap-2.5">
          <Avatar initials={contact.initials} color={contact.color} size="sm" />
          <span className="font-medium text-gray-900 truncate">{contact.name}</span>
          {contact.isVerified && (
            <svg className="w-4 h-4 text-blue-500 fill-blue-500 shrink-0" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      );
      case "whatsapp":  return <span className="text-gray-500 text-sm">{contact.whatsapp || "Not provided"}</span>;
      case "status":    return <StatusBadge status={contact.status} />;
      case "labels":    return contact.labels?.length === 0 ? <span className="text-gray-300 text-xs italic">No labels</span> : <>{contact.labels.map(l => <LabelBadge key={l} label={l} />)}</>;
      case "email":     return <span className="text-gray-500 text-sm">{contact.email}</span>;
      case "institute": return <span className="text-gray-500 text-sm">{contact.institute}</span>;
      case "address":   return <span className="text-gray-500 text-sm">{contact.address}</span>;
      case "phone":     return <span className="text-gray-500 text-sm">{contact.phone || "Not provided"}</span>;
      case "company":   return <span className="text-gray-500 text-sm">{contact.company}</span>;
      case "city":      return <span className="text-gray-500 text-sm">{contact.city}</span>;
      case "country":   return <span className="text-gray-500 text-sm">{contact.country}</span>;
      default:          return null;
    }
  };

  return (
    <div className="font-sans bg-gradient-to-b from-slate-50 via-[#f8fbf8] to-[#f6faf7] min-h-screen p-4 sm:p-5 xl:p-7 box-border pb-28 sm:pb-32">

      {editingContact && (
        <EditContactModal
          contact={editingContact}
          onClose={() => setEditingContact(null)}
          onSave={handleSaveEdit}
          customFields={allCustomFields}
          labels={allLabels}
        />
      )}

      <AddCustomFieldPanel
        isOpen={showAddCustomField}
        onClose={() => setShowAddCustomField(false)}
        onCreated={handleCustomFieldCreated}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Contacts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage people, labels, and custom fields from one place.</p>
        </div>
        <div className="flex gap-2.5 flex-wrap w-full lg:w-auto">
          <button
            onClick={() => navigate("/admin/contacts/import")}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-700 text-[13px] font-bold hover:border-emerald-500 hover:text-emerald-700 transition-all shadow-sm active:translate-y-px flex-1 lg:flex-none"
          >
            <ArrowUpTrayIcon className="w-4 h-4" />Import Contacts
          </button>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-[13px] font-bold transition-all shadow-md active:translate-y-px flex-1 lg:flex-none"
          >
            <PlusIcon className="w-4 h-4 stroke-[3]" />Add Contact
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">

        {/* Filter bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-gray-100 gap-3 flex-wrap rounded-t-2xl">
          <div className="flex items-center gap-2.5 flex-wrap flex-1 min-w-0">
            <span className="text-sm text-gray-500 font-medium">Filter Status:</span>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={e => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                  setAdvFilters(prev => ({ ...prev, statuses: [] }));
                }}
                className="appearance-none pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium bg-white cursor-pointer outline-none focus:border-green-400 transition-colors"
              >
                <option>All Contacts</option>
                {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowMoreFilters(!showMoreFilters)}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm font-semibold transition-all ${showMoreFilters || activeFilterCount > 0 ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 bg-white text-gray-600 hover:border-green-400 hover:text-green-700"}`}
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4" />More Filters
                {activeFilterCount > 0 && (
                  <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{activeFilterCount}</span>
                )}
              </button>
              {showMoreFilters && (
                <MoreFiltersPanel filters={advFilters} onApply={applyFilters} onClose={() => setShowMoreFilters(false)} labels={allLabels} />
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setShowColumns(!showColumns)}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm font-semibold transition-all ${showColumns ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 bg-white text-gray-600 hover:border-green-400 hover:text-green-700"}`}
              >
                <Squares2X2Icon className="w-4 h-4" />Columns
              </button>
              {showColumns && (
                <ManageColumnsDropdown
                  allColumns={allColumns}
                  visibleColumns={[...visibleColumns, ...allColumns.filter(c => c.isCustom).map(c => c.key)]}
                  onToggle={key => {
                    // Only allow toggling base columns; custom columns are controlled by showInContacts
                    const col = allColumns.find(c => c.key === key);
                    if (!col?.isCustom) {
                      setVisibleColumns(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
                    }
                  }}
                  onReset={() => setVisibleColumns(DEFAULT_VISIBLE)}
                  onClose={() => setShowColumns(false)}
                />
              )}
            </div>
            {hasFilters && (
              <button
                onClick={() => {
                  setFilterStatus("All Contacts");
                  setSearchQuery("");
                  applyFilters({ statuses: [], labels: [] });
                  setCurrentPage(1);
                }}
                className="text-xs text-red-500 font-semibold hover:bg-red-50 px-2.5 py-1.5 rounded-md transition-colors"
              >
                Reset All Filters
              </button>
            )}
          </div>
          <div className="relative w-full sm:w-72 xl:w-60 xl:ml-auto">
            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-8 pr-8 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 w-full outline-none focus:border-green-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                title="Clear search"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {filterTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 px-5 py-2.5 border-b border-gray-100">
            <FunnelIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-400 font-medium">Active filters:</span>
            {filterTags.map((t, i) => <FilterTag key={i} label={t.label} onRemove={t.remove} />)}
            <button
              onClick={() => applyFilters({ statuses: [], labels: [] })}
              className="text-xs text-red-500 font-semibold hover:bg-red-50 px-2 py-0.5 rounded-md transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {apiError && (
          <div className="px-5 py-3 bg-red-50 border-b border-red-100 text-sm text-red-700 font-medium flex items-center justify-between">
            {apiError}
            <button onClick={loadContacts} className="text-xs font-bold text-red-600 underline ml-3">Retry</button>
          </div>
        )}

        {/* Table + Profile Panel */}
        <div className="flex min-w-0">
          <div className="flex-1 overflow-x-auto min-w-0">
            <table className="w-full border-collapse min-w-[760px] xl:min-w-[980px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="w-11 px-4 py-3 text-center border-b-2 border-gray-100">
                    <CircularCheckbox checked={allPageSelected} indeterminate={somePageSelected} onChange={toggleSelectAll} />
                  </th>
                  {orderedVisibleCols.map(col => (
                    <th key={col.key} className="px-4 py-3 text-left text-[11px] font-bold text-gray-400 tracking-widest uppercase border-b-2 border-gray-100 whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        {col.label}
                        {col.isCustom && (
                          <span className="text-[8px] bg-green-100 text-green-600 font-bold px-1 py-0.5 rounded uppercase tracking-wide normal-case">Custom</span>
                        )}
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-[11px] font-bold text-gray-400 tracking-widest uppercase border-b-2 border-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: rowsPerPage }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="px-4 py-4"><div className="w-4 h-4 rounded-full bg-gray-200 animate-pulse mx-auto" /></td>
                      {orderedVisibleCols.map(col => (
                        <td key={col.key} className="px-4 py-4"><div className="h-3 bg-gray-200 animate-pulse rounded w-3/4" /></td>
                      ))}
                      <td className="px-4 py-4"><div className="h-3 bg-gray-200 animate-pulse rounded w-12 mx-auto" /></td>
                    </tr>
                  ))
                ) : contacts.length === 0 ? (
                  <tr>
                    <td colSpan={orderedVisibleCols.length + 2} className="text-center py-14">
                      <div className="flex flex-col items-center text-gray-400 max-w-sm mx-auto">
                        <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                          <UserCircleIcon className="w-10 h-10 opacity-40" />
                        </div>
                        <p className="text-base font-semibold text-gray-700">No contacts found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {hasFilters
                            ? "Try clearing filters or adjusting your search query."
                            : "Add your first contact to start building your CRM list."}
                        </p>
                        <div className="flex items-center gap-2 mt-4">
                          {hasFilters && (
                            <button
                              onClick={() => {
                                setFilterStatus("All Contacts");
                                setSearchQuery("");
                                applyFilters({ statuses: [], labels: [] });
                              }}
                              className="px-3.5 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                            >
                              Clear Filters
                            </button>
                          )}
                          <button
                            onClick={() => setIsDrawerOpen(true)}
                            className="px-3.5 py-2 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600"
                          >
                            Add Contact
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : contacts.map(contact => {
                  const isSelected = selectedRows.includes(contact._id);
                  const isActive   = profileContact?._id === contact._id;
                  return (
                    <tr
                      key={contact._id}
                      onClick={e => handleRowClick(contact, e)}
                      className={`group border-b border-gray-50 transition-colors duration-100 cursor-pointer
                        ${isActive ? "bg-green-50 border-l-2 border-l-green-400" : isSelected ? "bg-green-50" : "bg-white hover:bg-slate-50"}`}
                    >
                      <td className="w-11 px-4 py-3.5 text-center">
                        <CircularCheckbox
                          checked={isSelected}
                          onChange={() => setSelectedRows(prev => isSelected ? prev.filter(r => r !== contact._id) : [...prev, contact._id])}
                        />
                      </td>
                      {orderedVisibleCols.map(col => (
                        <td key={col.key} className="px-4 py-3.5 text-sm text-gray-800 align-middle">
                          {renderCell(contact, col)}
                        </td>
                      ))}
                      <td className="px-4 py-3.5 text-center align-middle">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={e => { e.stopPropagation(); setEditingContact(contact); }}
                            title="Edit"
                            className="action-btn p-1.5 rounded-md text-gray-300 group-hover:text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleDeleteSingle(contact._id); }}
                            title="Delete"
                            className="action-btn p-1.5 rounded-md text-gray-300 group-hover:text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {profileContact && (
            <ContactProfilePanel
              contact={profileContact}
              onClose={() => setProfileContact(null)}
              onEdit={() => setEditingContact(profileContact)}
              onDelete={() => handleDeleteSingle(profileContact._id)}
              customFields={allCustomFields}
            />
          )}
        </div>

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          rowsPerPage={rowsPerPage}
          totalCount={pagination.total}
          onPageChange={setCurrentPage}
          onRowsChange={n => { setRowsPerPage(n); setCurrentPage(1); }}
        />
      </div>

      <BulkActionToolbar 
        selectedCount={selectedRows.length} 
        onClear={() => setSelectedRows([])} 
        onDelete={handleBulkDelete}
        onLabel={handleBulkLabel}
        onRemoveLabel={handleBulkRemoveLabel}
        onStatus={handleBulkStatus}
        onCampaign={handleSendCampaign}
        labels={[...new Set([...allLabels, ...contacts.filter(c => selectedRows.includes(c._id)).flatMap(c => c.labels || [])])]}
        statuses={allStatuses}
      />

      <AddContactDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onAdd={handleAdd}
        labels={allLabels}
        customFields={allCustomFields}
        onOpenAddCustomField={() => setShowAddCustomField(true)}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        count={deleteModal.count}
        loading={deleteModal.loading}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}