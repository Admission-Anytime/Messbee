import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BoltIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

/* ─── Constants ──────────────────────────────────────────────────────────────── */
const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
  : "";

// All CRM fields the user can map to
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

// Smart-match rules: normalize header → CRM field value
const normalize = (s) => s.toLowerCase().replace(/[\s_\-().]/g, "");

const SMART_MATCH_RULES = [
  // phone / whatsapp
  { patterns: ["phone","phonenumber","mobilenumber","mobile","whatsapp","whatsappnumber","cell","cellphone","contact","contactnumber","mob","tel","telephone"], field: "phone" },
  // first name
  { patterns: ["firstname","fname","first","givenname","forename"], field: "firstName" },
  // last name
  { patterns: ["lastname","lname","last","surname","familyname"], field: "lastName" },
  // full name
  { patterns: ["fullname","name","contactname","clientname","customername","fullname"], field: "fullName" },
  // email
  { patterns: ["email","emailaddress","emailid","mail","emailid"], field: "email" },
  // company
  { patterns: ["company","companyname","org","organisation","organization","business","businessname"], field: "company" },
  // city
  { patterns: ["city","town","district","locality"], field: "city" },
  // country
  { patterns: ["country","countrycode","nation","countryname","region"], field: "country" },
  // address
  { patterns: ["address","streetaddress","street","fulladdress","addr"], field: "address" },
  // status
  { patterns: ["status","contactstatus","leadstatus"], field: "status" },
  // labels / tags
  { patterns: ["labels","tags","label","tag","category","categories"], field: "labels" },
];

const smartMatch = (header) => {
  const norm = normalize(header);
  for (const rule of SMART_MATCH_RULES) {
    if (rule.patterns.includes(norm)) return { field: rule.field, auto: true };
  }
  return { field: "skip", auto: false };
};

/* ─── Step Indicator ─────────────────────────────────────────────────────────── */
const StepIndicator = () => (
  <div className="flex items-center justify-center mb-0 px-4 py-6 border-b border-gray-100 bg-white">
    <div className="max-w-3xl w-full flex items-center justify-between">

      {/* Step 1 — completed */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-green-500 flex items-center justify-center">
          <CheckCircleSolid className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Step 1</p>
          <p className="text-sm font-semibold text-gray-600">Upload CSV</p>
        </div>
      </div>

      {/* Connector line */}
      <div className="flex-1 h-0.5 bg-green-400 mx-6 rounded-full" />

      {/* Step 2 — active */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-green-500 flex items-center justify-center">
          <span className="text-white text-sm font-bold">2</span>
        </div>
        <div>
          <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Step 2</p>
          <p className="text-sm font-bold text-gray-900">Map Fields</p>
        </div>
      </div>

      {/* Connector line */}
      <div className="flex-1 h-0.5 bg-gray-200 mx-6 rounded-full" />

      {/* Step 3 — pending */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center">
          <span className="text-gray-400 text-sm font-bold">3</span>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Step 3</p>
          <p className="text-sm font-semibold text-gray-400">Review &amp; Summary</p>
        </div>
      </div>

    </div>
  </div>
);

/* ─── Status Badge ───────────────────────────────────────────────────────────── */
const StatusBadge = ({ mapping, isAuto }) => {
  if (mapping === "skip") {
    return (
      <span className="inline-block w-5 h-5 rounded-full border-2 border-gray-200" />
    );
  }
  if (isAuto) {
    return (
      <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 border border-green-200 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight whitespace-nowrap">
        <BoltIcon className="w-3 h-3" />
        Smart Match
      </span>
    );
  }
  return (
    <CheckCircleSolid className="w-5 h-5 text-green-400" />
  );
};

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export default function MapFields() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // State passed from Step 1
  const {
    file = null,
    headers = [],
    sampleRows = [],
  } = location.state || {};

  // Redirect if landed without state
  useEffect(() => {
    if (!file || !headers.length) {
      navigate("/admin/contacts/import", { replace: true });
    }
  }, [file, headers.length, navigate]);

  if (!file || !headers.length) return null;

  // ── Initial mappings via smart-match ──────────────────────────────────────────
  const initialMappings = useMemo(() => {
    const result = {};
    const autoFlags = {};
    headers.forEach((h) => {
      const { field, auto } = smartMatch(h);
      result[h]    = field;
      autoFlags[h] = auto;
    });
    return { result, autoFlags };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [mappings,   setMappings]   = useState(initialMappings.result);
  const [autoFlags,  setAutoFlags]  = useState(initialMappings.autoFlags);
  const [showAll,    setShowAll]    = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [uploadErr,  setUploadErr]  = useState("");

  // ── Derived stats ──────────────────────────────────────────────────────────────
  const mappedCount  = Object.values(mappings).filter((v) => v !== "skip").length;
  const totalCount   = headers.length;
  const phoneIsMapped = Object.values(mappings).includes("phone");

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleChange = useCallback((header, value) => {
    setMappings((prev) => ({ ...prev, [header]: value }));
    setAutoFlags((prev) => ({ ...prev, [header]: false }));
  }, []);

  const handleResetAll = useCallback(() => {
    setMappings(initialMappings.result);
    setAutoFlags(initialMappings.autoFlags);
  }, [initialMappings]);

  // ── Get sample values for a header ────────────────────────────────────────────
  const getSample = (header) => {
    const vals = sampleRows
      .map((row) => row[header])
      .filter(Boolean)
      .slice(0, 3)
      .join(", ");
    return vals ? `${vals}...` : "—";
  };

  // ── Upload CSV with mapping to backend ─────────────────────────────────────────
  const handleContinue = async () => {
    if (!phoneIsMapped) return; // button is disabled anyway
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

      navigate("/admin/contacts/review", {
        state: {
          fileName:   file.name,
          fileSize:   file.size,
          total:      data.total,
          successful: data.successful,
          failed:     data.failed,
          failedRows: data.failedRows ?? [],
          message:    data.message,
        },
      });
    } catch (err) {
      setUploadErr(err.message || "Upload failed. Please try again.");
      setUploading(false);
    }
  };

  // ── Displayed rows (paginated) ─────────────────────────────────────────────────
  const INITIAL_ROWS = 6;
  const displayedHeaders = showAll ? headers : headers.slice(0, INITIAL_ROWS);
  const hiddenCount      = headers.length - INITIAL_ROWS;

  // ── Dropdown bg/border style based on state ───────────────────────────────────
  const selectStyle = (header) => {
    const val  = mappings[header];
    const auto = autoFlags[header];
    if (val === "skip")  return "bg-white border border-gray-200 text-gray-400";
    if (auto)            return "bg-green-50 border border-green-200 text-gray-900";
    return "bg-white border border-gray-200 text-gray-900";
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">

      {/* Step indicator */}
      <StepIndicator />

      {/* Main scrollable area */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-5xl mx-auto">

          {/* ── Header row ── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-7">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Map CSV Columns</h1>
              <p className="text-sm text-gray-500 mt-1">
                Reconcile your spreadsheet headers with MessBee CRM attributes.
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Mapping status chip */}
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

              {/* Reset All */}
              <button
                onClick={handleResetAll}
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Reset All
              </button>
            </div>
          </div>

          {/* ── Warning banner — phone not mapped ── */}
          {!phoneIsMapped && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4">
              <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900">Required Mapping Missing</h4>
                <p className="text-sm text-amber-700 mt-0.5">
                  The column for{" "}
                  <span className="font-bold underline">Phone Number</span> is mandatory for WhatsApp
                  messaging. Ensure it is mapped correctly before continuing.
                </p>
              </div>
            </div>
          )}

          {/* ── Upload error ── */}
          {uploadErr && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm font-semibold text-red-700">{uploadErr}</p>
            </div>
          )}

          {/* ── Mapping table ── */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-1/4">
                    Source Column
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-1/4">
                    Sample Data
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    Map to CRM Field
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center w-32">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {displayedHeaders.map((header) => {
                  const val  = mappings[header] ?? "skip";
                  const auto = autoFlags[header] ?? false;

                  return (
                    <tr
                      key={header}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      {/* Source column */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900 uppercase tracking-tight">
                          {header}
                        </span>
                      </td>

                      {/* Sample data */}
                      <td className="px-6 py-4 max-w-[180px]">
                        <span className="text-xs italic text-gray-400 truncate block">
                          {getSample(header)}
                        </span>
                      </td>

                      {/* Dropdown */}
                      <td className="px-6 py-4">
                        <div className="relative">
                          <select
                            value={val}
                            onChange={(e) => handleChange(header, e.target.value)}
                            className={`appearance-none w-full rounded-xl px-4 py-2.5 pr-9 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-400 transition-all cursor-pointer ${selectStyle(header)}`}
                          >
                            {CRM_FIELDS.map((f) => (
                              <option key={f.value} value={f.value}>
                                {f.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDownIcon
                            className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                              auto ? "text-green-500" : "text-gray-400"
                            }`}
                          />
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-4 text-center">
                        <StatusBadge mapping={val} isAuto={auto} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Load more / collapse */}
            {hiddenCount > 0 && (
              <div className="border-t border-gray-100 bg-gray-50 text-center py-4">
                <button
                  onClick={() => setShowAll((p) => !p)}
                  className="text-xs font-bold text-gray-500 hover:text-gray-800 uppercase tracking-widest transition-colors flex items-center gap-1.5 mx-auto"
                >
                  {showAll ? (
                    <>Collapse ↑</>
                  ) : (
                    <>Load {hiddenCount} More Column{hiddenCount !== 1 ? "s" : ""}</>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* ── Pro Tip ── */}
          <div className="flex items-center gap-5 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="w-11 h-11 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
              <InformationCircleIcon className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-gray-900">Pro Tip: Standardized Headers</h5>
              <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                MessBee automatically recognizes headers like &quot;Cell&quot;, &quot;Mobile&quot;, or &quot;Mob&quot;.
                Standardizing your CSV headers will improve future Smart Matches by up to 90%.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Footer action bar ── */}
      <div className="bg-white border-t border-gray-100 py-4 px-6 shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">

          {/* Back */}
          <button
            onClick={() => navigate("/admin/contacts/import")}
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors px-4 py-2.5 rounded-xl hover:bg-gray-100"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Upload
          </button>

          <div className="flex items-center gap-6">
            {/* Estimated time */}
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                Estimated Import Time
              </span>
              <span className="text-xs font-bold text-gray-900">~ 2 Minutes</span>
            </div>

            {/* Continue */}
            <button
              onClick={handleContinue}
              disabled={!phoneIsMapped || uploading}
              className={`flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all ${
                phoneIsMapped && !uploading
                  ? "bg-green-500 hover:bg-green-600 text-white shadow-green-200"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {uploading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  Importing…
                </>
              ) : (
                <>
                  Continue to Review
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
