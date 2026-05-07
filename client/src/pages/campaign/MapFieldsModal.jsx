import React, { useState, useMemo, useCallback } from "react";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BoltIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
  : "";

const CRM_FIELDS = [
  { value: "skip",      label: "-- Skip Column --",        required: false },
  { value: "phone",     label: "Phone Number (Required)",   required: true  },
  { value: "firstName", label: "First Name",               required: false },
  { value: "lastName",  label: "Last Name",                required: false },
  { value: "fullName",  label: "Full Name",                required: false },
  { value: "email",     label: "Email Address",            required: false },
  { value: "company",   label: "Company",                  required: false },
  { value: "city",      label: "City",                     required: false },
  { value: "country",   label: "Country / Country Code",   required: false },
  { value: "address",   label: "Address",                  required: false },
  { value: "status",    label: "Status",                   required: false },
  { value: "labels",    label: "Labels / Tags",            required: false },
];

const normalize = (s) => s.toLowerCase().replace(/[\s_\-().]/g, "");

const SMART_MATCH_RULES = [
  { patterns: ["phone","phonenumber","mobilenumber","mobile","whatsapp","whatsappnumber","cell","cellphone","contact","contactnumber","mob","tel","telephone"], field: "phone" },
  { patterns: ["firstname","fname","first","givenname","forename"], field: "firstName" },
  { patterns: ["lastname","lname","last","surname","familyname"], field: "lastName" },
  { patterns: ["fullname","name","contactname","clientname","customername","fullname"], field: "fullName" },
  { patterns: ["email","emailaddress","emailid","mail","emailid"], field: "email" },
  { patterns: ["company","companyname","org","organisation","organization","business","businessname"], field: "company" },
  { patterns: ["city","town","district","locality"], field: "city" },
  { patterns: ["country","countrycode","nation","countryname","region"], field: "country" },
  { patterns: ["address","streetaddress","street","fulladdress","addr"], field: "address" },
  { patterns: ["status","contactstatus","leadstatus"], field: "status" },
  { patterns: ["labels","tags","label","tag","category","categories"], field: "labels" },
];

const smartMatch = (header) => {
  const norm = normalize(header);
  for (const rule of SMART_MATCH_RULES) {
    if (rule.patterns.includes(norm)) return { field: rule.field, auto: true };
  }
  return { field: "skip", auto: false };
};

const StatusBadge = ({ mapping, isAuto }) => {
  if (mapping === "skip") {
    return <span className="inline-block w-5 h-5 rounded-full border-2 border-gray-200" />;
  }
  if (isAuto) {
    return (
      <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 border border-green-200 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight whitespace-nowrap">
        <BoltIcon className="w-3 h-3" />
        Smart Match
      </span>
    );
  }
  return <CheckCircleSolid className="w-5 h-5 text-green-400" />;
};

export default function MapFieldsModal({ file, headers, sampleRows, onClose, onSuccess }) {
  const initialMappings = useMemo(() => {
    const result = {};
    const autoFlags = {};
    headers.forEach((h) => {
      const { field, auto } = smartMatch(h);
      result[h]    = field;
      autoFlags[h] = auto;
    });
    return { result, autoFlags };
  }, [headers]);

  const [mappings,   setMappings]   = useState(initialMappings.result);
  const [autoFlags,  setAutoFlags]  = useState(initialMappings.autoFlags);
  const [showAll,    setShowAll]    = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [uploadErr,  setUploadErr]  = useState("");

  const mappedCount  = Object.values(mappings).filter((v) => v !== "skip").length;
  const totalCount   = headers.length;
  const phoneIsMapped = Object.values(mappings).includes("phone");

  const handleChange = useCallback((header, value) => {
    setMappings((prev) => ({ ...prev, [header]: value }));
    setAutoFlags((prev) => ({ ...prev, [header]: false }));
  }, []);

  const handleResetAll = useCallback(() => {
    setMappings(initialMappings.result);
    setAutoFlags(initialMappings.autoFlags);
  }, [initialMappings]);

  const getSample = (header) => {
    const vals = sampleRows
      .map((row) => row[header])
      .filter(Boolean)
      .slice(0, 3)
      .join(", ");
    return vals ? `${vals}...` : "—";
  };

  const handleContinue = async () => {
    if (!phoneIsMapped) return;
    setUploading(true);
    setUploadErr("");
    try {
      const token    = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fieldMapping", JSON.stringify(mappings));

      const res  = await fetch(`${API_BASE}/api/contacts/import`, {
        method:      "POST",
        headers:     token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
        body:        formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || `Import failed (${res.status})`);

      onSuccess(data);
    } catch (err) {
      setUploadErr(err.message || "Upload failed. Please try again.");
      setUploading(false);
    }
  };

  const INITIAL_ROWS = 6;
  const displayedHeaders = showAll ? headers : headers.slice(0, INITIAL_ROWS);
  const hiddenCount      = headers.length - INITIAL_ROWS;

  const selectStyle = (header) => {
    const val  = mappings[header];
    const auto = autoFlags[header];
    if (val === "skip")  return "bg-white border border-gray-200 text-gray-400";
    if (auto)            return "bg-green-50 border border-green-200 text-gray-900";
    return "bg-white border border-gray-200 text-gray-900";
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center font-sans">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-[95vw] max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Map CSV Columns</h2>
            <p className="text-sm text-gray-500 mt-1">
              Reconcile your spreadsheet headers with CRM attributes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 bg-gray-50">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-6">
            <div className="flex items-center gap-4 ml-auto">
              <div className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl flex items-center gap-3 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">
                    Mapping Status
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-bold text-gray-900">
                      {mappedCount} / {totalCount} Mapped
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleResetAll}
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Reset All
              </button>
            </div>
          </div>

          {!phoneIsMapped && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4">
              <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900">Required Mapping Missing</h4>
                <p className="text-sm text-amber-700 mt-0.5">
                  The column for <span className="font-bold underline">Phone Number</span> is mandatory.
                </p>
              </div>
            </div>
          )}

          {uploadErr && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm font-semibold text-red-700">{uploadErr}</p>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-1/4">Source Column</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-1/4">Sample Data</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Map to Field</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center w-32">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayedHeaders.map((header) => {
                  const val  = mappings[header] ?? "skip";
                  const auto = autoFlags[header] ?? false;

                  return (
                    <tr key={header} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900 uppercase tracking-tight">{header}</span>
                      </td>
                      <td className="px-6 py-4 max-w-[180px]">
                        <span className="text-xs italic text-gray-400 truncate block">{getSample(header)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <select
                            value={val}
                            onChange={(e) => handleChange(header, e.target.value)}
                            className={`appearance-none w-full rounded-xl px-4 py-2.5 pr-9 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all cursor-pointer ${selectStyle(header)}`}
                          >
                            {CRM_FIELDS.map((f) => (
                              <option key={f.value} value={f.value}>{f.label}</option>
                            ))}
                          </select>
                          <ChevronDownIcon className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${auto ? "text-emerald-500" : "text-gray-400"}`} />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge mapping={val} isAuto={auto} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {hiddenCount > 0 && (
              <div className="border-t border-gray-100 bg-gray-50 text-center py-4">
                <button
                  onClick={() => setShowAll((p) => !p)}
                  className="text-xs font-bold text-gray-500 hover:text-gray-800 uppercase tracking-widest transition-colors flex items-center gap-1.5 mx-auto"
                >
                  {showAll ? <>Collapse ↑</> : <>Load {hiddenCount} More Column{hiddenCount !== 1 ? "s" : ""}</>}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-5 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="w-11 h-11 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
              <InformationCircleIcon className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-gray-900">Pro Tip: Standardized Headers</h5>
              <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                MessBee automatically recognizes headers like &quot;Cell&quot;, &quot;Mobile&quot;, or &quot;Mob&quot;.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-100 py-5 px-8 shrink-0 flex items-center justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={!phoneIsMapped || uploading}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
              phoneIsMapped && !uploading
                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-200"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {uploading ? "Importing..." : "Confirm & Import"}
          </button>
        </div>
      </div>
    </div>
  );
}
