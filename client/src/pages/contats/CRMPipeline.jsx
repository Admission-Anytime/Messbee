import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Columns3,
  Plus,
  Search,
  RefreshCw,
  Phone,
  Mail,
  Building2,
  Calendar,
  MessageCircle,
  MoreVertical,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Filter,
  CheckCircle2,
  Clock,
  Flame,
  Snowflake,
  User,
  ArrowRight,
  Sparkles,
  Edit3,
  Trash2,
  X,
  PlusCircle,
  GripVertical
} from "lucide-react";
import axios from "../../context/axios";
import { getAllStatuses } from "../../services/StatusApi";

// Distinct color generator for label tags
const PRESET_LABEL_COLORS = {
  "start first": "#e11d48",
  "cold lead": "#0284c7",
  "hot lead": "#ea580c",
  "issue raised": "#dc2626",
  "resolved": "#16a34a",
  "warm lead": "#f59e0b",
  "payment pending": "#d97706",
  "payment received": "#059669",
  "invoice sent": "#7c3aed",
  "new lead": "#ec4899",
  "enterprise": "#8b5cf6",
  "follow-up": "#10b981",
  "vip": "#6366f1",
  "customer": "#06b6d4",
  "prospect": "#f97316",
};

const DISTINCT_PALETTE = [
  "#e11d48", "#0284c7", "#16a34a", "#ea580c", "#7c3aed", "#0891b2",
  "#db2777", "#ca8a04", "#4f46e5", "#059669", "#c026d3", "#d97706",
  "#2563eb", "#9333ea", "#0d9488", "#be123c", "#65a30d", "#b45309"
];

const getLabelColor = (label, labelConfig = []) => {
  if (!label) return "#3b82f6";
  const name = typeof label === "string" ? label : label?.name || "";
  const norm = name.trim().toLowerCase();

  const found = (labelConfig || []).find(l => {
    const n = typeof l === "string" ? l : l?.name;
    return String(n || "").trim().toLowerCase() === norm;
  });
  if (found && typeof found === "object" && found.color) return found.color;
  if (PRESET_LABEL_COLORS[norm]) return PRESET_LABEL_COLORS[norm];

  let hash = 5381;
  for (let i = 0; i < norm.length; i++) {
    hash = ((hash << 5) + hash) + norm.charCodeAt(i);
  }
  return DISTINCT_PALETTE[Math.abs(hash) % DISTINCT_PALETTE.length];
};

const DEFAULT_STAGES = [
  { id: "ACTIVE", name: "Active", color: "#10B981" },
  { id: "WARM", name: "Warm", color: "#F59E0B" },
  { id: "COLD", name: "Cold", color: "#3B82F6" },
  { id: "INACTIVE", name: "Inactive", color: "#94A3B8" },
];

export default function CRMPipeline() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [stages, setStages] = useState([]);
  const [labelsList, setLabelsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Drag & Drop & Active tracking
  const [draggingContactId, setDraggingContactId] = useState(null);
  const [dragOverStageId, setDragOverStageId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Quick Add Contact Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", whatsapp: "", email: "", company: "", status: "" });
  const [savingContact, setSavingContact] = useState(false);

  // Detail / Quick View Drawer
  const [viewingContact, setViewingContact] = useState(null);

  // 1. Fetch All Data
  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [statusRes, contactsRes, labelsRes] = await Promise.allSettled([
        getAllStatuses(),
        axios.get("/contacts?limit=250"),
        axios.get("/labels"),
      ]);

      // Stages
      let stageList = [];
      if (statusRes.status === "fulfilled" && Array.isArray(statusRes.value) && statusRes.value.length > 0) {
        stageList = statusRes.value.map((s) => ({
          id: s.name,
          name: s.name,
          color: s.color || "#10B981",
          description: s.description || "",
        }));
      } else {
        stageList = DEFAULT_STAGES;
      }
      setStages(stageList);

      // Contacts
      if (contactsRes.status === "fulfilled") {
        const raw = contactsRes.value.data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : [];
        setContacts(list);
      }

      // Labels
      if (labelsRes.status === "fulfilled") {
        const rawL = labelsRes.value.data;
        setLabelsList(Array.isArray(rawL) ? rawL : Array.isArray(rawL?.data) ? rawL.data : []);
      }
    } catch (err) {
      console.error("Failed to load CRM Pipeline data:", err);
      toast.error("Failed to load CRM pipeline");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Drag Start / Over / Drop
  const handleDragStart = (e, contactId) => {
    e.dataTransfer.setData("text/plain", contactId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingContactId(contactId);
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverStageId !== stageId) {
      setDragOverStageId(stageId);
    }
  };

  const handleDragLeave = (e, stageId) => {
    if (dragOverStageId === stageId) {
      setDragOverStageId(null);
    }
  };

  const handleDrop = async (e, targetStageName) => {
    e.preventDefault();
    setDragOverStageId(null);
    const contactId = e.dataTransfer.getData("text/plain") || draggingContactId;
    setDraggingContactId(null);

    if (!contactId) return;

    const contactToUpdate = contacts.find((c) => (c._id || c.id) === contactId);
    if (!contactToUpdate || contactToUpdate.status === targetStageName) return;

    // Optimistic UI update
    setContacts((prev) =>
      prev.map((c) =>
        (c._id || c.id) === contactId ? { ...c, status: targetStageName } : c
      )
    );

    try {
      setUpdatingStatusId(contactId);
      await axios.put(`/contacts/${contactId}`, { status: targetStageName });
      toast.success(`Moved ${contactToUpdate.name || "Contact"} to ${targetStageName}`);
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to move contact. Reverting...");
      setContacts((prev) =>
        prev.map((c) =>
          (c._id || c.id) === contactId ? { ...c, status: contactToUpdate.status } : c
        )
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Quick move via dropdown
  const handleMoveStage = async (contactId, newStatus) => {
    const contactToUpdate = contacts.find((c) => (c._id || c.id) === contactId);
    if (!contactToUpdate || contactToUpdate.status === newStatus) return;

    setContacts((prev) =>
      prev.map((c) =>
        (c._id || c.id) === contactId ? { ...c, status: newStatus } : c
      )
    );

    try {
      setUpdatingStatusId(contactId);
      await axios.put(`/contacts/${contactId}`, { status: newStatus });
      toast.success(`Moved to ${newStatus}`);
    } catch (err) {
      toast.error("Status update failed");
      setContacts((prev) =>
        prev.map((c) =>
          (c._id || c.id) === contactId ? { ...c, status: contactToUpdate.status } : c
        )
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Create New Contact from CRM
  const handleCreateContact = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.whatsapp.trim()) {
      toast.warning("Name and 10-digit WhatsApp number are required");
      return;
    }

    setSavingContact(true);
    try {
      const selectedStatus = addForm.status || stages[0]?.name || "ACTIVE";
      const payload = {
        name: addForm.name.trim(),
        whatsapp: addForm.whatsapp.replace(/\D/g, "").slice(0, 10),
        email: addForm.email.trim(),
        company: addForm.company.trim(),
        status: selectedStatus,
      };

      const res = await axios.post("/contacts", payload);
      const created = res.data?.data || res.data;
      setContacts((prev) => [created, ...prev]);
      toast.success("Contact added successfully to pipeline");
      setIsAddModalOpen(false);
      setAddForm({ name: "", whatsapp: "", email: "", company: "", status: "" });
    } catch (err) {
      console.error("Create contact error:", err);
      toast.error(err.response?.data?.message || "Failed to add contact");
    } finally {
      setSavingContact(false);
    }
  };

  // Filter contacts by search query
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const q = searchQuery.toLowerCase();
    return contacts.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.whatsapp && c.whatsapp.includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.company && c.company.toLowerCase().includes(q))
    );
  }, [contacts, searchQuery]);

  // Group contacts by stages
  const groupedContacts = useMemo(() => {
    const map = {};
    stages.forEach((st) => {
      map[st.id] = [];
    });

    filteredContacts.forEach((c) => {
      const cStatus = (c.status || "ACTIVE").trim().toUpperCase();
      const matchedStage = stages.find(
        (st) => st.id.trim().toUpperCase() === cStatus || st.name.trim().toUpperCase() === cStatus
      );

      if (matchedStage && map[matchedStage.id]) {
        map[matchedStage.id].push(c);
      } else {
        const firstStageId = stages[0]?.id || "ACTIVE";
        if (!map[firstStageId]) map[firstStageId] = [];
        map[firstStageId].push(c);
      }
    });

    return map;
  }, [stages, filteredContacts]);

  // Summary Metrics
  const totalLeads = contacts.length;

  return (
    <div className="flex flex-col h-full w-full bg-[#f8fafc] font-['Urbanist'] overflow-hidden">
      {/* ── TOP HEADER BAR ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-xs z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-2xs">
            <Columns3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                CRM Pipeline
              </h1>
              <span className="text-[11px] bg-emerald-500 text-white font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                {totalLeads} Total Leads
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Manage and track deal stages by dragging contacts across columns
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads, phone, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl w-64 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all font-medium"
            />
          </div>

          {/* Refresh button */}
          <button
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-50"
            title="Refresh pipeline"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-emerald-600" : ""}`} />
          </button>

          {/* Configure Stages Button */}
          <button
            onClick={() => navigate("/admin/contacts/status")}
            className="px-3.5 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            Configure Stages
          </button>

          {/* Add Contact Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>
      </div>

      {/* ── KANBAN COLUMNS WRAPPER ── */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold">Loading your CRM Pipeline…</p>
          </div>
        ) : stages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
            <Columns3 className="w-12 h-12 opacity-30" />
            <p className="text-base font-bold text-slate-700">No Stages Found</p>
            <button
              onClick={() => navigate("/admin/contacts/status")}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              Create Stages
            </button>
          </div>
        ) : (
          <div className="flex gap-5 h-full items-start pb-4 min-w-max">
            {stages.map((stage) => {
              const stageContacts = groupedContacts[stage.id] || [];
              const stageColor = stage.color || "#10B981";
              const isOver = dragOverStageId === stage.id;

              return (
                <div
                  key={stage.id}
                  onDragOver={(e) => handleDragOver(e, stage.id)}
                  onDragLeave={(e) => handleDragLeave(e, stage.id)}
                  onDrop={(e) => handleDrop(e, stage.id)}
                  className={`w-84 max-h-full flex flex-col rounded-2xl border transition-all duration-200 ${
                    isOver
                      ? "bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-300/40"
                      : "bg-slate-100/80 border-slate-200/80"
                  } p-3 shrink-0 shadow-xs`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between px-2 py-2 mb-2 select-none">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: stageColor }}
                      />
                      <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                        {stage.name}
                      </h2>
                    </div>
                    <span
                      className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white border text-slate-700 shadow-2xs"
                      style={{ borderColor: `${stageColor}40` }}
                    >
                      {stageContacts.length}
                    </span>
                  </div>

                  {/* Cards Scrollable Container */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar min-h-[160px]">
                    {stageContacts.length === 0 ? (
                      <div
                        className={`h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1.5 p-4 text-center transition-colors ${
                          isOver
                            ? "border-emerald-400 bg-emerald-100/50 text-emerald-700"
                            : "border-slate-200 text-slate-400"
                        }`}
                      >
                        <User className="w-5 h-5 opacity-40" />
                        <span className="text-xs font-semibold">Drop contacts here</span>
                      </div>
                    ) : (
                      stageContacts.map((contact) => {
                        const contactId = contact._id || contact.id;
                        const isUpdating = updatingStatusId === contactId;
                        const isDragging = draggingContactId === contactId;

                        return (
                          <div
                            key={contactId}
                            draggable
                            onDragStart={(e) => handleDragStart(e, contactId)}
                            className={`bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing group relative select-none ${
                              isDragging ? "opacity-30 scale-95 border-dashed border-emerald-400" : ""
                            } ${isUpdating ? "opacity-50 pointer-events-none" : ""}`}
                          >
                            {/* Card Header Row */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div
                                onClick={() => setViewingContact(contact)}
                                className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                              >
                                <div
                                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0 shadow-2xs"
                                  style={{
                                    backgroundColor:
                                      contact.color || stageColor || "#10B981",
                                  }}
                                >
                                  {contact.initials ||
                                    (contact.name
                                      ? contact.name.slice(0, 2).toUpperCase()
                                      : "U")}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-black text-slate-900 truncate leading-tight group-hover:text-emerald-600 transition-colors">
                                    {contact.name || "Unnamed Lead"}
                                  </p>
                                  {contact.company ? (
                                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1 truncate mt-0.5">
                                      <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                      {contact.company}
                                    </p>
                                  ) : (
                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                      Contact Lead
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* WhatsApp Chat Shortcut Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate("/admin/chat");
                                }}
                                className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors shrink-0"
                                title="Open in WhatsApp Inbox"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Contact Details */}
                            <div className="space-y-1.5 my-2.5 text-xs text-slate-600">
                              {contact.whatsapp && (
                                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                                  <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  <span>{contact.whatsapp}</span>
                                </div>
                              )}
                              {contact.email && (
                                <div className="flex items-center gap-1.5 text-slate-500 truncate font-medium">
                                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{contact.email}</span>
                                </div>
                              )}
                            </div>

                            {/* Labels tags with custom colors */}
                            {Array.isArray(contact.labels) && contact.labels.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {contact.labels.slice(0, 3).map((lbl, idx) => {
                                  const labelText = typeof lbl === "string" ? lbl : lbl?.name;
                                  const color = getLabelColor(labelText, labelsList);
                                  return (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                                      style={{
                                        backgroundColor: `${color}15`,
                                        color: color,
                                        border: `1px solid ${color}35`,
                                      }}
                                    >
                                      <span
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: color }}
                                      />
                                      {labelText}
                                    </span>
                                  );
                                })}
                                {contact.labels.length > 3 && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                    +{contact.labels.length - 3}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Card Footer: Quick Move Stage Selector */}
                            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                Stage:
                              </span>
                              <select
                                value={contact.status || stage.id}
                                onChange={(e) =>
                                  handleMoveStage(contactId, e.target.value)
                                }
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none hover:border-emerald-400 focus:border-emerald-500 transition-colors cursor-pointer"
                              >
                                {stages.map((st) => (
                                  <option key={st.id} value={st.id}>
                                    {st.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL: Quick Add Contact ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <h2 className="text-base font-black text-slate-900">Add New Lead</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp Number <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <span className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-600">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="10 digit number"
                    value={addForm.whatsapp}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        whatsapp: e.target.value.replace(/\D/g, "").slice(0, 10),
                      })
                    }
                    required
                    className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. rahul@example.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Tech"
                  value={addForm.company}
                  onChange={(e) => setAddForm({ ...addForm, company: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Initial Stage
                </label>
                <select
                  value={addForm.status || stages[0]?.id || "ACTIVE"}
                  onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 font-bold text-slate-700"
                >
                  {stages.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingContact}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold disabled:opacity-60 shadow-sm"
                >
                  {savingContact ? "Adding..." : "Add to Pipeline"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── QUICK CONTACT PREVIEW PANEL ── */}
      {viewingContact && (
        <div className="fixed inset-y-0 right-0 z-50 w-80 bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Lead Details
            </span>
            <button
              onClick={() => setViewingContact(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 text-center border-b border-slate-100">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black mx-auto mb-3 shadow-sm"
              style={{ backgroundColor: viewingContact.color || "#10B981" }}
            >
              {viewingContact.initials || viewingContact.name?.slice(0, 2).toUpperCase() || "U"}
            </div>
            <h3 className="text-base font-black text-slate-900">{viewingContact.name}</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {viewingContact.company || "No Company"}
            </p>
            <div className="mt-3 inline-block">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-black uppercase">
                Stage: {viewingContact.status}
              </span>
            </div>
          </div>

          <div className="p-5 space-y-4 flex-1 overflow-y-auto">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                WhatsApp
              </p>
              <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500" />
                {viewingContact.whatsapp || "—"}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                Email
              </p>
              <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                {viewingContact.email || "—"}
              </p>
            </div>

            {viewingContact.address && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Address
                </p>
                <p className="text-xs font-semibold text-slate-700">
                  {viewingContact.address}
                </p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
            <button
              onClick={() => navigate("/admin/chat")}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </button>
            <button
              onClick={() => navigate("/admin/contacts/list")}
              className="px-3 py-2.5 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
              title="Open full contact table"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
