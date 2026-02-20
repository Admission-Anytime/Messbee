
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  XMarkIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";

/* ─── Step Indicator ─────────────────────────────────────────────────────────── */
const StepIndicator = ({ currentStep = 1 }) => {
  const steps = [
    { number: 1, label: "UPLOAD CSV", icon: ArrowUpTrayIcon },
    {
      number: 2,
      label: "MAP FIELDS",
      icon: ({ className }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h3m0 0V4m0 2v2M9 6h3m0 0V4m0 2v2m3-2h3m0 0V4m0 2v2M3 12h18M3 18h3m0 0v-2m0 2v2m6-2h3m0 0v-2m0 2v2m3-2h3m0 0v-2m0 2v2" />
        </svg>
      ),
    },
    {
      number: 3,
      label: "REVIEW & IMPORT",
      icon: ({ className }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center justify-center mb-8 px-4">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isActive = step.number === currentStep;
        const isCompleted = step.number < currentStep;
        const isLast = idx === steps.length - 1;
        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                isActive ? "bg-green-500 border-green-500 text-white shadow-md shadow-green-200"
                  : isCompleted ? "bg-green-500 border-green-500 text-white"
                  : "bg-white border-gray-300 text-gray-400"}`}>
                {isCompleted ? <CheckCircleSolid className="w-5 h-5 text-white" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`text-[11px] font-bold tracking-widest whitespace-nowrap ${
                isActive ? "text-green-600" : isCompleted ? "text-green-500" : "text-gray-400"}`}>
                {step.number}. {step.label}
              </span>
            </div>
            {!isLast && (
              <div className={`h-0.5 w-40 sm:w-56 lg:w-72 mx-2 mb-5 rounded-full transition-colors ${isCompleted ? "bg-green-500" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ─── CSV Parser ─────────────────────────────────────────────────────────────── */
const parseCSV = (text) => {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] || ""; });
    return row;
  });
};

/* ─── Map CSV row → contact object ──────────────────────────────────────────── */
const AVATAR_COLORS = [
  "#4CAF50", "#FF9800", "#607D8B", "#5C6BC0", "#E91E63",
  "#009688", "#795548", "#3F51B5", "#FF5722", "#9C27B0",
];

const rowToContact = (row, index) => {
  const name = row.fullName || row.name || row.Name || row.FullName || "";
  const phone = row.Phone || row.phone || row.whatsapp || row.WhatsApp || "";
  const initials = name.trim().substring(0, 2).toUpperCase() || "??";
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return {
    id: Date.now() + index,
    initials,
    color,
    name,
    whatsapp: phone.startsWith("+") ? phone : phone ? `+91${phone}` : "",
    phone: phone.startsWith("+") ? phone : phone ? `+91${phone}` : "",
    status: "ACTIVE",
    labels: [],
    email: row.Email || row.email || "",
    company: row.Company || row.company || "",
    city: row.City || row.city || "",
    country: row["Country Code"] || row.country || row.Country || "",
    institute: row.Institute || row.institute || "",
    address: row.Address || row.address || [row.City || row.city, row["Country Code"] || row.country].filter(Boolean).join(", "),
  };
};

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export default function ImportContacts() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [parsing, setParsing] = useState(false);

  /* ── Download Sample CSV ── */
  const downloadSampleCSV = () => {
    const headers = ["fullName", "Phone", "Email", "Company", "City", "Country Code"];
    const sampleData = ["John Doe", "9876543210", "john@example.com", "MessBee", "New York", "+1"];
    const csvContent = [headers.join(","), sampleData.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "messbee_sample_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /* ── File validation ── */
  const handleFile = (f) => {
    if (!f) return;
    setFileError("");
    const allowedTypes = ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    const allowedExts = [".csv", ".xlsx", ".xls"];
    const hasValidType = allowedTypes.includes(f.type);
    const hasValidExt = allowedExts.some((ext) => f.name.toLowerCase().endsWith(ext));
    if (!hasValidType && !hasValidExt) {
      setFileError("Invalid file type. Please upload a .CSV or .XLSX file.");
      return;
    }
    if (f.size > 25 * 1024 * 1024) {
      setFileError("File too large. Maximum allowed size is 25MB.");
      return;
    }
    setFile(f);
  };

  const onDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); };
  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const removeFile = (e) => { e.stopPropagation(); setFile(null); setFileError(""); if (fileRef.current) fileRef.current.value = ""; };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  /* ── Next: Parse CSV → save to localStorage → navigate ── */
  const handleNext = () => {
    if (!file) return;
    setParsing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const rows = parseCSV(text);

        if (rows.length === 0) {
          setFileError("The file appears to be empty or has no data rows.");
          setParsing(false);
          return;
        }

        // Convert CSV rows → contact objects
        const importedContacts = rows.map((row, i) => rowToContact(row, i));

        // ✅ KEY FIX: Save imported contacts to localStorage
        // contact.jsx reads from this on mount — so it will show ONLY these contacts
        localStorage.setItem("messbee_contacts", JSON.stringify(importedContacts));

        // Navigate to map fields, passing parsed data for preview
        navigate("/admin/contacts/map", {
          state: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            parsedRows: rows,
            contactCount: importedContacts.length,
          },
        });
      } catch (err) {
        setFileError("Failed to parse the file. Please check the format and try again.");
        setParsing(false);
      }
    };

    reader.onerror = () => {
      setFileError("Failed to read the file. Please try again.");
      setParsing(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <StepIndicator currentStep={1} />

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-8 flex gap-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Import Your Contacts</h1>
              <p className="text-sm text-gray-500 mb-6">Upload your database to start managing your WhatsApp campaigns.</p>

              <div
                onClick={() => !file && fileRef.current?.click()}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={`relative rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center py-14 px-6 text-center
                  ${file ? "border-green-400 bg-green-50 cursor-default"
                    : dragging ? "border-green-400 bg-green-50 cursor-copy scale-[1.01]"
                    : fileError ? "border-red-300 bg-red-50 cursor-pointer hover:bg-red-50"
                    : "border-green-400 bg-white cursor-pointer hover:bg-green-50"}`}
              >
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />

                {file ? (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
                      <CheckCircleSolid className="w-9 h-9 text-green-500" />
                    </div>
                    <p className="text-base font-bold text-gray-900 mb-0.5">{file.name}</p>
                    <p className="text-sm text-gray-400 mb-5">{formatSize(file.size)}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                        className="inline-flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 font-semibold border border-green-200 hover:border-green-300 bg-white rounded-lg px-3 py-1.5 transition-colors"
                      >
                        Replace File
                      </button>
                      <button
                        onClick={removeFile}
                        className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-semibold border border-red-200 hover:border-red-300 bg-white rounded-lg px-3 py-1.5 transition-colors"
                      >
                        <XMarkIcon className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-5 ${fileError ? "bg-red-100" : "bg-green-100"}`}>
                      {fileError ? (
                        <ExclamationCircleIcon className="w-7 h-7 text-red-500" />
                      ) : (
                        <svg className="w-7 h-7 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="12" y1="18" x2="12" y2="12" />
                          <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                      )}
                    </div>
                    {fileError ? (
                      <>
                        <p className="text-sm font-semibold text-red-600 mb-1">{fileError}</p>
                        <p className="text-xs text-red-400 mb-6">Click to try again</p>
                      </>
                    ) : (
                      <>
                        <p className="text-base font-semibold text-gray-800 mb-1">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-400 mb-6">Supported formats: .CSV, .XLSX (Max 25MB)</p>
                      </>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                      className="px-7 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg shadow-sm shadow-green-200 transition-colors"
                    >
                      Select File
                    </button>
                  </>
                )}
              </div>

              {/* ── Download template row ── */}
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={downloadSampleCSV}
                  className="flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Download Sample CSV Template
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500 border border-gray-200 rounded px-2 py-0.5 bg-gray-50">UTF-8</span>
                  <span className="text-xs font-semibold text-gray-500 border border-gray-200 rounded px-2 py-0.5 bg-gray-50">EXCEL</span>
                </div>
              </div>
            </div>

            {/* ── Right Tips Panel ── */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 h-full">
                <div className="flex items-center gap-2 mb-3">
                  <LightBulbIcon className="w-4 h-4 text-blue-500" />
                  <span className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Pro Tip</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Use Standardized Headers</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  For the fastest matching, name your columns:{" "}
                  <code className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded text-[11px] font-mono">fullName</code>,{" "}
                  <code className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded text-[11px] font-mono">Phone</code>, and{" "}
                  <code className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded text-[11px] font-mono">Email</code>.
                </p>
                <div className="flex flex-col gap-2.5 mb-5">
                  {["Include country codes (e.g., +91) for WhatsApp numbers.", "Custom fields (like GSTN) can be mapped in the next step."].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircleSolid className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-start gap-2">
                    <ShieldCheckIcon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-400 leading-relaxed">Your data is encrypted and secure according to GDPR standards.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="border-t border-gray-100 px-8 py-5 flex items-center justify-between bg-white">
            <button onClick={() => navigate(-1)} className="text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors">
              Cancel
            </button>
            <button
              disabled={!file || parsing}
              onClick={handleNext}
              className={`flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                file && !parsing ? "bg-green-500 hover:bg-green-600 text-white shadow-sm shadow-green-200" : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {parsing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  Parsing...
                </>
              ) : (
                <>
                  Next: Map Fields
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Need help with your file?{" "}
          <a href="#" className="text-green-600 font-semibold hover:underline">Contact Support</a> or{" "}
          <a href="#" className="text-green-600 font-semibold hover:underline">Read Guide</a>
        </p>
      </div>
    </div>
  );
}