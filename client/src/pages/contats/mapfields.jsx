import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BoltIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";

/* ─── Step Indicator ─────────────────────────────────────────────────────────── */
const StepIndicator = ({ currentStep = 2 }) => {
  const steps = [
    { number: 1, label: "Upload File" },
    { number: 2, label: "Map Fields" },
    { number: 3, label: "Review & Summary" },
  ];

  return (
    <div className="flex items-center justify-center mb-8 px-4">
      {steps.map((step, idx) => {
        const isActive    = step.number === currentStep;
        const isCompleted = step.number < currentStep;
        const isLast      = idx === steps.length - 1;

        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all text-sm font-bold ${
                    isActive
                      ? "bg-green-500 border-green-500 text-white"
                      : isCompleted
                      ? "bg-green-500 border-green-500 text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {isCompleted ? <CheckCircleSolid className="w-4 h-4" /> : step.number}
                </div>
                <div>
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${isActive ? "text-green-600" : isCompleted ? "text-green-500" : "text-gray-400"}`}>
                    Step {step.number}
                  </p>
                  <p className={`text-xs font-bold ${isActive ? "text-gray-900" : isCompleted ? "text-gray-600" : "text-gray-400"}`}>
                    {step.label}
                  </p>
                </div>
              </div>
            </div>
            {!isLast && (
              <div className={`h-0.5 w-48 sm:w-64 lg:w-80 mx-4 rounded-full ${isCompleted ? "bg-green-500" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ─── CRM Fields available for mapping ───────────────────────────────────────── */
const CRM_FIELDS = [
  { value: "", label: "-- Skip Column --" },
  { value: "phone", label: "Phone Number (Required)" },
  { value: "first_name", label: "First Name" },
  { value: "last_name", label: "Last Name" },
  { value: "full_name", label: "Full Name" },
  { value: "email", label: "Email Address" },
  { value: "company", label: "Company" },
  { value: "country", label: "Country" },
  { value: "country_code", label: "Country Code" },
  { value: "city", label: "City" },
  { value: "state", label: "State / Province" },
  { value: "address", label: "Address" },
  { value: "zip", label: "ZIP / Postal Code" },
  { value: "notes", label: "Notes" },
  { value: "tags", label: "Tags" },
  { value: "custom_1", label: "Custom Field 1" },
  { value: "custom_2", label: "Custom Field 2" },
];

/* ─── Mock CSV columns ───────────────────────────────────────────────────────── */
const INITIAL_COLUMNS = [
  { id: 1, source: "PH. NUMBER",    sample: "+44 7911 123456...", mapped: "phone",      smartMatch: true  },
  { id: 2, source: "FNAME",         sample: "Jonathan, Sarah, Alex...", mapped: "first_name", smartMatch: false },
  { id: 3, source: "CUST_ID",       sample: "MB-9923, MB-9924...", mapped: "",           smartMatch: false },
  { id: 4, source: "EMAIL",         sample: "john@example.com, sarah@corp...", mapped: "email", smartMatch: true  },
  { id: 5, source: "COUNTRY_CODE",  sample: "UK, DE, FR...",      mapped: "",           smartMatch: false },
];

const EXTRA_COLUMNS = [
  { id: 6,  source: "LNAME",        sample: "Smith, Johnson...",  mapped: "last_name",  smartMatch: true  },
  { id: 7,  source: "COMPANY_NAME", sample: "Acme, Corp...",      mapped: "company",    smartMatch: true  },
  { id: 8,  source: "CITY",         sample: "London, Berlin...",  mapped: "city",       smartMatch: true  },
  { id: 9,  source: "GSTN",         sample: "29ABCDE1234F1Z5...", mapped: "custom_1",   smartMatch: false },
  { id: 10, source: "NOTES",        sample: "VIP, New client...", mapped: "notes",      smartMatch: false },
  { id: 11, source: "TAGS",         sample: "lead, prospect...",  mapped: "tags",       smartMatch: false },
  { id: 12, source: "ZIP_CODE",     sample: "EC1A 1BB, 10115...", mapped: "zip",        smartMatch: true  },
];

/* ─── Status badge ───────────────────────────────────────────────────────────── */
const StatusBadge = ({ mapped, smartMatch, isPhone }) => {
  if (smartMatch && mapped) {
    return (
      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
        <BoltIcon className="w-3 h-3" /> Smart Match
      </span>
    );
  }
  if (mapped) {
    return <CheckCircleSolid className="w-6 h-6 text-green-500" />;
  }
  if (isPhone) {
    return (
      <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
        <ExclamationTriangleIcon className="w-3.5 h-3.5 text-red-500" />
      </span>
    );
  }
  return <span className="w-5 h-5 rounded-full border-2 border-gray-300 block" />;
};

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export default function MapFields() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const fileInfo  = location.state || {};

  const [columns, setColumns]         = useState(INITIAL_COLUMNS);
  const [showExtra, setShowExtra]     = useState(false);
  const allColumns = showExtra ? [...columns, ...EXTRA_COLUMNS.map(c => ({ ...c, id: c.id }))] : columns;

  const mappedCount = [...columns, ...(showExtra ? EXTRA_COLUMNS : [])].filter(c => c.mapped).length;
  const totalCount  = columns.length + (showExtra ? EXTRA_COLUMNS.length : 0) + (showExtra ? 0 : EXTRA_COLUMNS.length);

  const phoneRow    = columns.find(c => c.source === "PH. NUMBER");
  const phoneMapped = phoneRow?.mapped === "phone";

  const handleMap = (id, value) => {
    setColumns(prev => prev.map(c => c.id === id ? { ...c, mapped: value, smartMatch: false } : c));
  };

  const handleReset = () => {
    setColumns(INITIAL_COLUMNS);
    setShowExtra(false);
  };

  const handleContinue = () => {
    if (!phoneMapped) return;
    const mappingData = [...columns, ...(showExtra ? EXTRA_COLUMNS : [])].reduce((acc, col) => {
      if (col.mapped) acc[col.source] = col.mapped;
      return acc;
    }, {});
    navigate("/admin/contacts/review", {
      state: { ...fileInfo, mapping: mappingData, mappedCount, totalColumns: allColumns.length },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-5xl mx-auto px-6 py-10">

        <StepIndicator currentStep={2} />

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Map CSV Columns</h1>
            <p className="text-sm text-gray-500">Reconcile your spreadsheet headers with MessBee CRM attributes.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-gray-500 font-medium">MAPPING STATUS</span>
              <span className="text-sm font-bold text-gray-900">{mappedCount} / {totalCount} Mapped</span>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 font-semibold border border-gray-200 bg-white rounded-lg px-3 py-2 hover:border-gray-300 transition-colors shadow-sm"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Reset All
            </button>
          </div>
        </div>

        {/* Warning banner */}
        {!phoneMapped && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800">Required Mapping Missing</p>
              <p className="text-sm text-amber-700 mt-0.5">
                The column for <span className="font-bold underline text-amber-800">Phone Number</span> is mandatory for WhatsApp messaging. Ensure it is mapped correctly before continuing.
              </p>
            </div>
          </div>
        )}

        {/* Mapping Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1.2fr_1.4fr_120px] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200">
            {["SOURCE COLUMN", "SAMPLE DATA", "MAP TO CRM FIELD", "STATUS"].map(h => (
              <p key={h} className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{h}</p>
            ))}
          </div>

          {/* Rows */}
          {allColumns.map((col, idx) => {
            const isLast     = idx === allColumns.length - 1;
            const isRequired = col.source === "PH. NUMBER";
            const isPending  = !col.mapped && isRequired;

            return (
              <div
                key={col.id}
                className={`grid grid-cols-[1fr_1.2fr_1.4fr_120px] gap-4 items-center px-6 py-4 ${!isLast ? "border-b border-gray-100" : ""} ${isPending ? "bg-red-50/30" : "hover:bg-gray-50/60"} transition-colors`}
              >
                {/* Source */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800">{col.source}</span>
                  {isRequired && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">REQ</span>}
                </div>

                {/* Sample */}
                <p className="text-sm text-gray-400 truncate">{col.sample}</p>

                {/* Dropdown */}
                <select
                  value={col.mapped}
                  onChange={e => handleMap(col.id, e.target.value)}
                  className={`w-full text-sm rounded-lg border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all ${
                    isPending
                      ? "border-red-300 text-gray-600 focus:border-red-400"
                      : col.mapped
                      ? "border-gray-200 text-gray-800"
                      : "border-gray-200 text-gray-400"
                  }`}
                >
                  {CRM_FIELDS.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>

                {/* Status */}
                <div className="flex justify-end">
                  <StatusBadge mapped={col.mapped} smartMatch={col.smartMatch} isPhone={isRequired && !col.mapped} />
                </div>
              </div>
            );
          })}

          {/* Load more */}
          {!showExtra && (
            <button
              onClick={() => setShowExtra(true)}
              className="w-full py-4 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100 tracking-wider uppercase"
            >
              Load {EXTRA_COLUMNS.length} More Columns
            </button>
          )}
        </div>

        {/* Pro tip */}
        <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 mb-8 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <InformationCircleIcon className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Pro Tip: Standardized Headers</p>
            <p className="text-sm text-gray-500 mt-0.5">
              MessBee automatically recognizes headers like "Cell", "Mobile", or "Mob". Standardizing your CSV headers will improve future Smart Matches by up to 90%.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Upload
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Estimated Import Time</p>
              <p className="text-sm font-bold text-gray-700">~ 2 Minutes</p>
            </div>
            <button
              disabled={!phoneMapped}
              onClick={handleContinue}
              className={`flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold transition-all ${
                phoneMapped
                  ? "bg-green-500 hover:bg-green-600 text-white shadow-sm shadow-green-200"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Continue to Review
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}