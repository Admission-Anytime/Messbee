import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomToast from "../../components/ui/CustomToast";
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
  PencilSquareIcon,
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
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

/* ─── API helpers ────────────────────────────────────────────────────────────────
   All calls go to VITE_API_URL (falls back to localhost:5000).
   JWT is read from localStorage key "token" — adjust if yours differs.
────────────────────────────────────────────────────────────────────────────────── */
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const apiFetch = async (method, path, body = null) => {
  const res  = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...authHeader() },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
};

const fetchContacts   = (params = {}) => {
  const qs = new URLSearchParams();
  if (params.page)   qs.set("page",   params.page);
  if (params.limit)  qs.set("limit",  params.limit);
  if (params.status && params.status !== "All Contacts") qs.set("status", params.status);
  if (params.search) qs.set("search", params.search);
  if (params.labels?.length) qs.set("labels", params.labels.join(","));
  return apiFetch("GET", `/api/contacts?${qs}`);
};
const createContact   = (data)    => apiFetch("POST",   "/api/contacts",              data);
const updateContact   = (id, data) => apiFetch("PUT",   `/api/contacts/${id}`,         data);
const deleteContact   = (id)      => apiFetch("DELETE", `/api/contacts/${id}`);
const bulkDelete      = (ids)     => apiFetch("DELETE", "/api/contacts/bulk-delete",   { ids });

/* ─── Static config ──────────────────────────────────────────────────────────── */
const ALL_COLUMNS = [
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
const ROWS_OPTIONS    = [5, 10, 25, 50];
const ALL_STATUSES    = ["ACTIVE", "WARM", "INACTIVE", "COLD"];
const ALL_LABELS      = ["start first","Cold lead","Hot lead","Issue raised","Resolved","Warm lead","Payment pending","Payment received","Invoice sent"];

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

/* ─── Toast helper ───────────────────────────────────────────────────────────── */
const showToast = (type, title, message) =>
  toast(({ closeToast }) => <CustomToast type={type} title={title} message={message} closeToast={closeToast} />, {
    position: "top-center", autoClose: 3000, hideProgressBar: true, closeButton: false,
    style: { background: "transparent", boxShadow: "none", padding: 0 },
  });

/* ─── Atoms ──────────────────────────────────────────────────────────────────── */
function Avatar({ initials, color, size = "sm" }) {
  const cls = size === "lg" ? "w-14 h-14 text-base" : "w-8 h-8 text-xs";
  return (
    <div className={`${cls} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 tracking-wide`} style={{ background: color }}>
      {initials}
    </div>
  );
}
function StatusBadge({ status }) {
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide ${STATUS_CLS[status] || ""}`}>{status}</span>;
}
function LabelBadge({ label }) {
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-1 ${LABEL_CLS[label] || "bg-gray-100 text-gray-500"}`}>{label}</span>;
}
function CircularCheckbox({ checked, onChange, indeterminate }) {
  return (
    <div onClick={onChange} className="cursor-pointer inline-flex items-center justify-center select-none">
      {checked ? (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="9" fill="#4CAF50"/><path d="M5.5 9.5L7.8 12L12.5 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      ) : indeterminate ? (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8.5" stroke="#4CAF50" strokeWidth="1.5" fill="#f0fdf4"/><rect x="5" y="8.25" width="8" height="1.5" rx="0.75" fill="#4CAF50"/></svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8.5" stroke="#D1D5DB" strokeWidth="1.5" fill="white"/></svg>
      )}
    </div>
  );
}

/* ─── Edit Contact Modal ─────────────────────────────────────────────────────── */
function EditContactModal({ contact, onClose, onSave }) {
  const [form, setForm]     = useState({ ...contact });
  const [saving, setSaving] = useState(false);
  if (!contact) return null;
  const fields = [
    { key: "name", label: "Full Name" },   { key: "email",     label: "Email"     },
    { key: "phone", label: "Phone" },      { key: "whatsapp",  label: "WhatsApp"  },
    { key: "company", label: "Company" },  { key: "institute", label: "Institute" },
    { key: "address", label: "Address" },  { key: "city",      label: "City"      },
    { key: "country", label: "Country" },
  ];
  const handleSave = async () => {
    setSaving(true);
    try { await onSave(form); onClose(); } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center font-sans">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-2xl w-[520px] max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Avatar initials={form.initials} color={form.color} size="sm"/>
            <div><h2 className="text-base font-bold text-gray-900">Edit Contact</h2><p className="text-xs text-gray-400">Update contact information</p></div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"><XMarkIcon className="w-5 h-5"/></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            {fields.map(({ key, label }) => (
              <div key={key} className={key === "address" ? "col-span-2" : ""}>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">{label}</label>
                <input type="text" value={form[key] || ""} onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 transition-colors"/>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2 text-sm font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors shadow-sm disabled:opacity-60">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Contact Profile Side Panel ─────────────────────────────────────────────── */
function ContactProfilePanel({ contact, onClose, onEdit, onDelete }) {
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
  return (
    <div className="w-72 flex-shrink-0 border-l border-gray-100 bg-white flex flex-col animate-in slide-in-from-right duration-200">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Profile</span>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600 transition-colors"><XMarkIcon className="w-4 h-4"/></button>
      </div>
      <div className="flex flex-col items-center px-4 py-5 border-b border-gray-100">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3 shadow-sm" style={{ background: contact.color }}>{contact.initials}</div>
        <h3 className="text-base font-bold text-gray-900 text-center">{contact.name}</h3>
        <p className="text-xs text-gray-400 mt-0.5">{contact.company || "—"}</p>
        <div className="mt-2"><StatusBadge status={contact.status}/></div>
        {contact.labels?.length > 0 && <div className="flex flex-wrap justify-center gap-1 mt-2">{contact.labels.map(l => <LabelBadge key={l} label={l}/>)}</div>}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {infoRows.map(({ Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-md bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5"><Icon className="w-3.5 h-3.5 text-gray-400"/></div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
              <p className="text-sm text-gray-700 font-medium mt-0.5 break-all leading-snug">{value || "—"}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-4 border-t border-gray-100 flex gap-2">
        <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          <PencilSquareIcon className="w-4 h-4 text-gray-500"/>Edit
        </button>
        <button onClick={onDelete} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors">
          <TrashIcon className="w-4 h-4"/>Delete
        </button>
      </div>
    </div>
  );
}

/* ─── Add Contact Drawer ─────────────────────────────────────────────────────── */
function AddContactDrawer({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({ name: "", whatsapp: "", labels: [] });
  const [adding, setAdding]     = useState(false);
  const [error, setError]       = useState("");
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!formData.name || !formData.whatsapp) { setError("Name and WhatsApp number are required."); return; }
    setError(""); setAdding(true);
    try {
      await onAdd({ name: formData.name, whatsapp: `+91${formData.whatsapp}`, labels: formData.labels, status: "ACTIVE" });
      setFormData({ name: "", whatsapp: "", labels: [] }); onClose();
    } catch (err) {
      setError(err.message || "Failed to add contact.");
    } finally { setAdding(false); }
  };

  return (
    <div className="fixed inset-0 z-[600] flex justify-end font-sans">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onClose}/>
      <div className="relative w-[480px] bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><ChevronLeftIcon className="w-5 h-5 text-gray-500"/></button>
            <h2 className="text-lg font-bold text-gray-900">Add Contact</h2>
          </div>
          <button onClick={handleSubmit} disabled={adding}
            className="bg-green-500 text-white px-8 py-1.5 rounded-lg text-sm font-bold hover:bg-green-600 transition-colors disabled:opacity-60">
            {adding ? "Adding…" : "Add"}
          </button>
        </div>
        <form className="p-6 flex-1 overflow-y-auto flex flex-col gap-8" onSubmit={handleSubmit}>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5 font-medium">{error}</div>}
          <section>
            <h3 className="text-sm font-bold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-blue-900 uppercase mb-1.5 tracking-wider">Enter Name</label>
                <input type="text" placeholder="Enter name"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-2 ring-green-100"
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}/>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-blue-900 uppercase mb-1.5 tracking-wider">Enter WhatsApp Number</label>
                <div className="flex gap-2">
                  <div className="w-16 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-400 text-center font-medium">+91</div>
                  <input type="text" placeholder="Enter WhatsApp Number"
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-2 ring-green-100"
                    value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}/>
                </div>
              </div>
            </div>
          </section>
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Select Labels</h3>
              <PlusIcon className="w-4 h-4 text-green-500 cursor-pointer"/>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ALL_LABELS.map(l => (
                <div key={l}
                  onClick={() => setFormData({ ...formData, labels: formData.labels.includes(l) ? formData.labels.filter(x => x !== l) : [...formData.labels, l] })}
                  className={`flex items-center gap-3 px-3 py-2.5 border rounded-lg cursor-pointer transition-all ${formData.labels.includes(l) ? "border-green-500 bg-green-50" : "border-gray-100 hover:bg-gray-50"}`}>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.labels.includes(l) ? "bg-green-500 border-green-500" : "bg-white border-gray-300"}`}>
                    {formData.labels.includes(l) && <div className="w-1.5 h-1.5 bg-white rounded-full"/>}
                  </div>
                  <span className="text-xs font-medium text-gray-500">{l}</span>
                </div>
              ))}
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}

/* ─── Manage Columns Dropdown ────────────────────────────────────────────────── */
function ManageColumnsDropdown({ visibleColumns, onToggle, onReset, onClose }) {
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  const filtered = ALL_COLUMNS.filter(c => c.label.toLowerCase().includes(search.toLowerCase()));
  return (
    <div ref={ref} className="absolute top-[calc(100%+8px)] left-0 bg-white border border-gray-200 rounded-xl shadow-2xl z-[250] w-64 overflow-hidden">
      <div className="px-4 pt-3.5 pb-2.5 border-b border-gray-100">
        <p className="text-sm font-bold text-gray-900 mb-2.5">Manage Columns</p>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
          <input type="text" placeholder="Search fields..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 outline-none focus:border-green-400 transition-colors"/>
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto py-1.5">
        {filtered.map(col => {
          const isVisible = visibleColumns.includes(col.key);
          return (
            <div key={col.key} onClick={() => !col.locked && onToggle(col.key)}
              className={`flex items-center justify-between px-4 py-2.5 select-none transition-colors ${col.locked ? "cursor-default" : "cursor-pointer hover:bg-gray-50"}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  {isVisible ? <CheckCircleIcon className="w-4 h-4 text-green-500"/> : <div className="w-4 h-4 rounded-full border-2 border-gray-300"/>}
                </div>
                <span className={`text-sm font-medium ${col.locked ? "text-gray-400" : "text-gray-800"}`}>{col.label}</span>
              </div>
              {col.locked && <LockClosedIcon className="w-3.5 h-3.5 text-gray-400 opacity-60"/>}
            </div>
          );
        })}
        {filtered.length === 0 && <div className="flex flex-col items-center py-6 text-gray-400"><MagnifyingGlassIcon className="w-6 h-6 mb-1.5 opacity-50"/><p className="text-sm">No fields found</p></div>}
      </div>
      <div className="border-t border-gray-100 px-4 py-2.5 flex justify-center">
        <button onClick={onReset} className="text-sm font-semibold text-green-600 px-2 py-1 rounded-md hover:bg-green-50 transition-colors">Reset to Default</button>
      </div>
    </div>
  );
}

/* ─── More Filters Panel ─────────────────────────────────────────────────────── */
function MoreFiltersPanel({ filters, onApply, onClose }) {
  const [local, setLocal] = useState({ ...filters });
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  const toggleArr = (field, val) =>
    setLocal(prev => { const arr = prev[field] || []; return { ...prev, [field]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] }; });
  const activeCount = (local.statuses?.length || 0) + (local.labels?.length || 0);
  return (
    <div ref={ref} className="absolute top-[calc(100%+8px)] left-0 bg-white border border-gray-200 rounded-xl shadow-2xl z-[250] w-80">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-4 h-4 text-gray-500"/>
          <span className="text-sm font-bold text-gray-900">More Filters</span>
          {activeCount > 0 && <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{activeCount}</span>}
        </div>
        <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"><XMarkIcon className="w-4 h-4"/></button>
      </div>
      <div className="px-4 py-4 flex flex-col gap-4">
        <div>
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-2">Status</p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_STATUSES.map(s => {
              const sel = (local.statuses || []).includes(s);
              return <button key={s} onClick={() => toggleArr("statuses", s)}
                className={`px-3 py-1 rounded-full text-xs font-bold border tracking-wide transition-all ${sel ? STATUS_BTN_SEL[s] : "bg-gray-100 text-gray-500 border-gray-200 hover:border-gray-300"}`}>{s}</button>;
            })}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-2">Labels</p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_LABELS.map(l => {
              const sel = (local.labels || []).includes(l);
              return <button key={l} onClick={() => toggleArr("labels", l)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${sel ? "bg-gray-100 text-gray-700 border-gray-400" : "bg-gray-100 text-gray-500 border-gray-200 hover:border-gray-300"}`}>{l}</button>;
            })}
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 px-4 py-3 flex justify-between items-center">
        <button onClick={() => { const e = { statuses: [], labels: [] }; setLocal(e); onApply(e); }}
          className="text-sm text-gray-400 font-medium hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">Clear All</button>
        <button onClick={() => { onApply(local); onClose(); }}
          className="text-sm font-semibold text-white bg-green-500 hover:bg-green-600 px-5 py-1.5 rounded-lg shadow-sm transition-colors">Apply Filters</button>
      </div>
    </div>
  );
}

function FilterTag({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 bg-green-50 border border-green-200 rounded-full text-xs font-semibold text-green-700">
      {label}
      <button onClick={onRemove} className="flex items-center text-green-500 hover:text-green-700 transition-colors ml-0.5"><XMarkIcon className="w-3 h-3"/></button>
    </span>
  );
}

/* ─── Delete Confirm Modal ───────────────────────────────────────────────────── */
function DeleteConfirmModal({ isOpen, onConfirm, onCancel, count, loading }) {
  if (!isOpen) return null;
  const isBulk = count > 1;
  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onCancel}/>
      <div className="relative bg-white rounded-2xl shadow-2xl w-[400px] p-6 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4"><TrashIcon className="w-7 h-7 text-red-500"/></div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">{isBulk ? `Delete ${count} Contacts?` : "Delete Contact?"}</h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          {isBulk ? `You're about to permanently delete ${count} contacts. This action cannot be undone.` : "You're about to permanently delete this contact. This action cannot be undone."}
        </p>
        <div className="flex gap-3 w-full">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60">
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
    pages.push(totalPages); return pages;
  };
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 flex-wrap gap-2 font-sans">
      <span className="text-sm text-gray-500">Total contacts: <strong className="text-gray-900">{totalCount}</strong></span>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500">Rows per page:</span>
        <select value={rowsPerPage} onChange={e => { onRowsChange(Number(e.target.value)); onPageChange(1); }}
          className="border border-gray-200 rounded-md text-sm text-gray-700 px-2 py-1 cursor-pointer outline-none focus:border-green-400">
          {ROWS_OPTIONS.map(n => <option key={n}>{n}</option>)}
        </select>
        <span className="text-sm text-gray-500 min-w-[90px] text-center">{start}–{end} of {totalCount}</span>
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
          className="p-1.5 border border-gray-200 rounded-md text-gray-500 hover:border-green-400 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <ChevronLeftIcon className="w-4 h-4"/>
        </button>
        <div className="flex gap-1">
          {getPages().map((p, i) => p === "..."
            ? <span key={`d${i}`} className="px-2 py-1 text-sm text-gray-400">…</span>
            : <button key={p} onClick={() => onPageChange(p)}
                className={`min-w-[32px] px-2 py-1 border rounded-md text-sm font-medium transition-all ${p === currentPage ? "bg-green-500 text-white border-green-500 font-bold" : "bg-white text-gray-500 border-gray-200 hover:border-green-400 hover:text-green-700"}`}>{p}</button>
          )}
        </div>
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}
          className="p-1.5 border border-gray-200 rounded-md text-gray-500 hover:border-green-400 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <ChevronRightIcon className="w-4 h-4"/>
        </button>
      </div>
    </div>
  );
}

/* ─── Bulk Action Toolbar ────────────────────────────────────────────────────── */
function BulkActionToolbar({ selectedCount, onClear, onDelete }) {
  if (selectedCount === 0) return null;
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[500] animate-in fade-in slide-in-from-bottom-4 duration-300 font-sans">
      <div className="bg-white border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.12)] rounded-2xl flex items-center p-2 min-w-[550px]">
        <div className="flex items-center gap-3 px-5 border-r border-gray-100 mr-2">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center font-bold text-green-600 text-lg">{selectedCount}</div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 leading-none">Contacts</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">selected</span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-1 px-2">
          <button className="flex flex-col items-center justify-center px-4 py-2 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors group">
            <TagIcon className="w-5 h-5 mb-1 group-hover:text-green-600"/><span className="text-[11px] font-bold">Add Label</span>
          </button>
          <button className="flex flex-col items-center justify-center px-4 py-2 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors group">
            <ArrowPathIcon className="w-5 h-5 mb-1 group-hover:text-green-600"/><span className="text-[11px] font-bold leading-tight text-center">Change<br/>Status</span>
          </button>
          <button className="flex flex-col items-center justify-center px-4 py-2 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors group">
            <MegaphoneIcon className="w-5 h-5 mb-1 group-hover:text-green-600"/><span className="text-[11px] font-bold leading-tight text-center">Send<br/>Campaign</span>
          </button>
        </div>
        <div className="flex items-center gap-2 pl-4 pr-2 border-l border-gray-100">
          <button onClick={onDelete} className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 font-bold text-sm transition-colors">
            <TrashIcon className="w-5 h-5"/>Delete
          </button>
          <button onClick={onClear} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><XMarkIcon className="w-5 h-5"/></button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────────────── */
export default function ContactsCRM() {
  const navigate = useNavigate();

  const [contacts, setContacts]         = useState([]);
  const [pagination, setPagination]     = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading]           = useState(false);
  const [apiError, setApiError]         = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All Contacts");
  const [searchQuery, setSearchQuery]   = useState("");
  const [showColumns, setShowColumns]   = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [visibleColumns, setVisibleColumns]   = useState(DEFAULT_VISIBLE);
  const [advFilters, setAdvFilters]     = useState({ statuses: [], labels: [] });
  const [currentPage, setCurrentPage]   = useState(1);
  const [rowsPerPage, setRowsPerPage]   = useState(10);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deleteModal, setDeleteModal]   = useState({ isOpen: false, id: null, count: 1, loading: false });
  const [editingContact, setEditingContact] = useState(null);
  const [profileContact, setProfileContact] = useState(null);
  const searchTimeout = useRef(null);

  /* ── Fetch ── */
  const loadContacts = useCallback(async () => {
    setLoading(true); setApiError("");
    try {
      const res = await fetchContacts({ page: currentPage, limit: rowsPerPage, status: filterStatus, search: searchQuery, labels: advFilters.labels });
      setContacts(res.data); setPagination(res.pagination);
    } catch (err) {
      setApiError(err.message || "Failed to load contacts.");
    } finally { setLoading(false); }
  }, [currentPage, rowsPerPage, filterStatus, searchQuery, advFilters]);

  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(loadContacts, searchQuery ? 350 : 0);
    return () => clearTimeout(searchTimeout.current);
  }, [loadContacts, searchQuery]);

  const applyFilters    = f => { setAdvFilters(f); setCurrentPage(1); };
  const activeFilterCount = advFilters.statuses.length + advFilters.labels.length;

  /* ── Add ── */
  const handleAdd = async (data) => {
    const res = await createContact(data);
    showToast("success", "Contact Added", `${res.data.name} has been added successfully.`);
    setCurrentPage(1); loadContacts();
  };

  /* ── Edit ── */
  const handleSaveEdit = async (updated) => {
    const res = await updateContact(updated._id, updated);
    setContacts(prev => prev.map(c => c._id === res.data._id ? res.data : c));
    if (profileContact?._id === res.data._id) setProfileContact(res.data);
    showToast("success", "Contact Updated", `${res.data.name} has been updated successfully.`);
  };

  /* ── Delete ── */
  const handleDeleteSingle = (id) => setDeleteModal({ isOpen: true, id, count: 1, loading: false });
  const handleBulkDelete   = ()   => setDeleteModal({ isOpen: true, id: null, count: selectedRows.length, loading: false });

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
      setDeleteModal({ isOpen: false, id: null, count: 1, loading: false }); loadContacts();
    } catch (err) {
      showToast("error", "Delete Failed", err.message || "Something went wrong.");
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const cancelDelete = () => setDeleteModal({ isOpen: false, id: null, count: 1, loading: false });

  /* ── Row click → profile ── */
  const handleRowClick = (contact, e) => {
    if (e.target.closest("td:first-child") || e.target.closest(".action-btn")) return;
    setProfileContact(prev => prev?._id === contact._id ? null : contact);
  };

  /* ── Selection ── */
  const allPageSelected  = contacts.length > 0 && contacts.every(c => selectedRows.includes(c._id));
  const somePageSelected = !allPageSelected && contacts.some(c => selectedRows.includes(c._id));
  const toggleSelectAll  = () => {
    const ids = contacts.map(c => c._id);
    setSelectedRows(prev => allPageSelected ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])]);
  };

  const orderedVisibleCols = ALL_COLUMNS.filter(col => visibleColumns.includes(col.key));

  const filterTags = [
    ...advFilters.statuses.map(s => ({ label: `Status: ${s}`, remove: () => applyFilters({ ...advFilters, statuses: advFilters.statuses.filter(x => x !== s) }) })),
    ...advFilters.labels.map(l  => ({ label: `Label: ${l}`,   remove: () => applyFilters({ ...advFilters, labels: advFilters.labels.filter(x => x !== l) }) })),
  ];

  const renderCell = (contact, colKey) => {
    switch (colKey) {
      case "name":      return <div className="flex items-center gap-2.5"><Avatar initials={contact.initials} color={contact.color} size="sm"/><span className="font-medium text-gray-900">{contact.name}</span></div>;
      case "whatsapp":  return <span className="text-gray-500 text-sm">{contact.whatsapp}</span>;
      case "status":    return <StatusBadge status={contact.status}/>;
      case "labels":    return contact.labels?.length === 0 ? <span className="text-gray-300 text-xs italic">No labels</span> : <>{contact.labels.map(l => <LabelBadge key={l} label={l}/>)}</>;
      case "email":     return <span className="text-gray-500 text-sm">{contact.email}</span>;
      case "institute": return <span className="text-gray-500 text-sm">{contact.institute}</span>;
      case "address":   return <span className="text-gray-500 text-sm">{contact.address}</span>;
      case "phone":     return <span className="text-gray-500 text-sm">{contact.phone}</span>;
      case "company":   return <span className="text-gray-500 text-sm">{contact.company}</span>;
      case "city":      return <span className="text-gray-500 text-sm">{contact.city}</span>;
      case "country":   return <span className="text-gray-500 text-sm">{contact.country}</span>;
      default: return null;
    }
  };

  return (
    <div className="font-sans bg-gray-50 min-h-screen p-7 box-border pb-32">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar closeButton={false}
        toastStyle={{ background: "transparent", boxShadow: "none", padding: 0 }}/>

      {editingContact && <EditContactModal contact={editingContact} onClose={() => setEditingContact(null)} onSave={handleSaveEdit}/>}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-snug">Contact &amp; CRM</h1>
          <p className="text-xs text-gray-400 mt-1">Click a row to view profile. Click edit/delete to manage contacts.</p>
        </div>
        <div className="flex gap-2.5">
          <button onClick={() => navigate("/admin/contacts/import")}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm font-semibold hover:border-green-500 transition-colors">
            <ArrowUpTrayIcon className="w-4 h-4"/>Import Contacts
          </button>
          <button onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold shadow-sm shadow-green-200 transition-colors">
            <PlusIcon className="w-4 h-4 stroke-[3]"/>Add Contact
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible">
        {/* Filter bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-sm text-gray-500 font-medium">Filter Status:</span>
            <div className="relative">
              <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="appearance-none pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium bg-white cursor-pointer outline-none focus:border-green-400 transition-colors">
                <option>All Contacts</option>
                {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"/>
            </div>
            <div className="relative">
              <button onClick={() => setShowMoreFilters(!showMoreFilters)}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm font-semibold transition-all ${showMoreFilters || activeFilterCount > 0 ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 bg-white text-gray-600 hover:border-green-400 hover:text-green-700"}`}>
                <AdjustmentsHorizontalIcon className="w-4 h-4"/>More Filters
                {activeFilterCount > 0 && <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{activeFilterCount}</span>}
              </button>
              {showMoreFilters && <MoreFiltersPanel filters={advFilters} onApply={applyFilters} onClose={() => setShowMoreFilters(false)}/>}
            </div>
            <div className="relative">
              <button onClick={() => setShowColumns(!showColumns)}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm font-semibold transition-all ${showColumns ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 bg-white text-gray-600 hover:border-green-400 hover:text-green-700"}`}>
                <Squares2X2Icon className="w-4 h-4"/>Columns
              </button>
              {showColumns && <ManageColumnsDropdown visibleColumns={visibleColumns}
                onToggle={key => setVisibleColumns(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])}
                onReset={() => setVisibleColumns(DEFAULT_VISIBLE)} onClose={() => setShowColumns(false)}/>}
            </div>
          </div>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
            <input type="text" placeholder="Search contacts..." value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 w-52 outline-none focus:border-green-400 transition-colors"/>
          </div>
        </div>

        {filterTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 px-5 py-2.5 border-b border-gray-100">
            <FunnelIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"/>
            <span className="text-xs text-gray-400 font-medium">Active filters:</span>
            {filterTags.map((t, i) => <FilterTag key={i} label={t.label} onRemove={t.remove}/>)}
            <button onClick={() => applyFilters({ statuses: [], labels: [] })}
              className="text-xs text-red-500 font-semibold hover:bg-red-50 px-2 py-0.5 rounded-md transition-colors">Clear all</button>
          </div>
        )}

        {apiError && (
          <div className="px-5 py-3 bg-red-50 border-b border-red-100 text-sm text-red-700 font-medium flex items-center justify-between">
            {apiError}
            <button onClick={loadContacts} className="text-xs font-bold text-red-600 underline ml-3">Retry</button>
          </div>
        )}

        {/* Table + Profile Panel */}
        <div className="flex">
          <div className="flex-1 overflow-x-auto min-w-0">
            <table className="w-full border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="w-11 px-4 py-3 text-center border-b-2 border-gray-100">
                    <CircularCheckbox checked={allPageSelected} indeterminate={somePageSelected} onChange={toggleSelectAll}/>
                  </th>
                  {orderedVisibleCols.map(col => (
                    <th key={col.key} className="px-4 py-3 text-left text-[11px] font-bold text-gray-400 tracking-widest uppercase border-b-2 border-gray-100 whitespace-nowrap">{col.label}</th>
                  ))}
                  <th className="px-4 py-3 text-center text-[11px] font-bold text-gray-400 tracking-widest uppercase border-b-2 border-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: rowsPerPage }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="px-4 py-4"><div className="w-4 h-4 rounded-full bg-gray-200 animate-pulse mx-auto"/></td>
                      {orderedVisibleCols.map(col => <td key={col.key} className="px-4 py-4"><div className="h-3 bg-gray-200 animate-pulse rounded w-3/4"/></td>)}
                      <td className="px-4 py-4"><div className="h-3 bg-gray-200 animate-pulse rounded w-12 mx-auto"/></td>
                    </tr>
                  ))
                ) : contacts.length === 0 ? (
                  <tr>
                    <td colSpan={orderedVisibleCols.length + 2} className="text-center py-14">
                      <div className="flex flex-col items-center text-gray-400">
                        <UserCircleIcon className="w-12 h-12 mb-3 opacity-30"/>
                        <p className="text-sm font-medium">No contacts found.</p>
                      </div>
                    </td>
                  </tr>
                ) : contacts.map(contact => {
                  const isSelected = selectedRows.includes(contact._id);
                  const isActive   = profileContact?._id === contact._id;
                  return (
                    <tr key={contact._id} onClick={e => handleRowClick(contact, e)}
                      className={`border-b border-gray-50 transition-colors duration-100 cursor-pointer
                        ${isActive ? "bg-green-50 border-l-2 border-l-green-400" : isSelected ? "bg-green-50" : "bg-white hover:bg-gray-50"}`}>
                      <td className="w-11 px-4 py-3.5 text-center">
                        <CircularCheckbox checked={isSelected}
                          onChange={() => setSelectedRows(prev => isSelected ? prev.filter(r => r !== contact._id) : [...prev, contact._id])}/>
                      </td>
                      {orderedVisibleCols.map(col => (
                        <td key={col.key} className="px-4 py-3.5 text-sm text-gray-800 align-middle">{renderCell(contact, col.key)}</td>
                      ))}
                      <td className="px-4 py-3.5 text-center align-middle">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={e => { e.stopPropagation(); setEditingContact(contact); }} title="Edit"
                            className="action-btn p-1.5 rounded-md text-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                            <PencilSquareIcon className="w-4 h-4"/>
                          </button>
                          <button onClick={e => { e.stopPropagation(); handleDeleteSingle(contact._id); }} title="Delete"
                            className="action-btn p-1.5 rounded-md text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                            <TrashIcon className="w-4 h-4"/>
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
            <ContactProfilePanel contact={profileContact} onClose={() => setProfileContact(null)}
              onEdit={() => setEditingContact(profileContact)} onDelete={() => handleDeleteSingle(profileContact._id)}/>
          )}
        </div>

        <Pagination
          currentPage={pagination.page} totalPages={pagination.totalPages}
          rowsPerPage={rowsPerPage} totalCount={pagination.total}
          onPageChange={setCurrentPage} onRowsChange={n => { setRowsPerPage(n); setCurrentPage(1); }}/>
      </div>

      <BulkActionToolbar selectedCount={selectedRows.length} onClear={() => setSelectedRows([])} onDelete={handleBulkDelete}/>
      <AddContactDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onAdd={handleAdd}/>
      <DeleteConfirmModal isOpen={deleteModal.isOpen} count={deleteModal.count} loading={deleteModal.loading} onConfirm={confirmDelete} onCancel={cancelDelete}/>
    </div>
  );
}