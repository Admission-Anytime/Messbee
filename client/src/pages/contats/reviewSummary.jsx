import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";

/* ─── Step Indicator ─────────────────────────────────────────────────────────── */
const StepIndicator = ({ currentStep = 3 }) => {
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
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm font-bold transition-all ${
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
            {!isLast && (
              <div className={`h-0.5 w-48 sm:w-64 lg:w-80 mx-4 rounded-full ${isCompleted ? "bg-green-500" : step.number < currentStep ? "bg-green-500" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ─── Animated Counter ───────────────────────────────────────────────────────── */
const AnimatedCounter = ({ target, duration = 1500, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const startTime = useRef(null);

  useEffect(() => {
    const animate = (ts) => {
      if (!startTime.current) startTime.current = ts;
      const progress = Math.min((ts - startTime.current) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
      else setCount(target);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return <>{count.toLocaleString()}{suffix}</>;
};

/* ─── Circular Progress ──────────────────────────────────────────────────────── */
const CircularProgress = ({ percentage }) => {
  const [displayPct, setDisplayPct] = useState(0);
  const radius      = 70;
  const stroke      = 8;
  const normalizedR = radius - stroke / 2;
  const circumf     = 2 * Math.PI * normalizedR;
  const offset      = circumf - (displayPct / 100) * circumf;

  useEffect(() => {
    let start = null;
    const animate = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / 1200, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      setDisplayPct(eased * percentage);
      if (progress < 1) requestAnimationFrame(animate);
      else setDisplayPct(percentage);
    };
    requestAnimationFrame(animate);
  }, [percentage]);

  return (
    <div className="relative w-44 h-44 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="176" height="176" viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
        <circle
          cx={radius} cy={radius} r={normalizedR}
          fill="none" stroke="#f0fdf4" strokeWidth={stroke}
        />
        <circle
          cx={radius} cy={radius} r={normalizedR}
          fill="none" stroke="#22c55e" strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumf}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.05s linear" }}
        />
      </svg>
      <div className="text-center z-10">
        <p className="text-3xl font-black text-gray-900">{displayPct.toFixed(1)}%</p>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Success</p>
      </div>
    </div>
  );
};

/* ─── Mock failed rows ───────────────────────────────────────────────────────── */
const ALL_FAILURES = [
  { row: 14,  data: "91 1234 567",      name: "Akash Verma",  reason: "Invalid Phone Format",  type: "error"   },
  { row: 258, data: "+91 9988776655",   name: "Priya Singh",  reason: "Duplicate Entry",       type: "warning" },
  { row: 412, data: "Unknown",          name: "Empty",        reason: "Missing Required Field", type: "error"  },
  { row: 899, data: "91 0000 000000",   name: "Rajesh K.",    reason: "Invalid Phone Format",  type: "error"   },
  { row: 1001,data: "+91 9876543210",   name: "Meera Patel",  reason: "Duplicate Entry",       type: "warning" },
  { row: 1042,data: "N/A",             name: "Unknown",       reason: "Missing Required Field", type: "error"  },
  { row: 1100,data: "91 1111 000000",   name: "Dev Kumar",    reason: "Invalid Phone Format",  type: "error"   },
  { row: 1144,data: "+91 9867001234",   name: "Sana Shaikh",  reason: "Duplicate Entry",       type: "warning" },
  { row: 1202,data: "00000000000",      name: "Test User",    reason: "Invalid Phone Format",  type: "error"   },
  { row: 1277,data: "N/A",             name: "Blank Row",     reason: "Missing Required Field", type: "error"  },
  { row: 1300,data: "+91 9900112233",   name: "Rina Mehta",   reason: "Duplicate Entry",       type: "warning" },
  { row: 1350,data: "00 1234 56789",    name: "Farhan A.",    reason: "Invalid Phone Format",  type: "error"   },
  { row: 1398,data: "N/A",             name: "Empty",         reason: "Missing Required Field", type: "error"  },
  { row: 1450,data: "+91 9812345678",   name: "Kiran Joshi",  reason: "Duplicate Entry",       type: "warning" },
  { row: 1499,data: "91 9999 000000",   name: "Amit Roy",     reason: "Invalid Phone Format",  type: "error"   },
  { row: 1523,data: "N/A",             name: "Blank",         reason: "Missing Required Field", type: "error"  },
];

const REASON_COLORS = {
  "Invalid Phone Format":   { bg: "bg-red-50",    text: "text-red-600",    dot: "bg-red-500"    },
  "Duplicate Entry":        { bg: "bg-amber-50",  text: "text-amber-600",  dot: "bg-amber-400"  },
  "Missing Required Field": { bg: "bg-red-50",    text: "text-red-600",    dot: "bg-red-500"    },
};

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export default function ReviewSummary() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const importData = location.state || {};

  const TOTAL      = 1000;
  const SUCCESSFUL = 984;
  const FAILED     = ALL_FAILURES.length;
  const PERCENTAGE = (SUCCESSFUL / TOTAL) * 100;
  const LABELS     = 2;

  const [showAllFailures, setShowAllFailures] = useState(false);
  const displayedFailures = showAllFailures ? ALL_FAILURES : ALL_FAILURES.slice(0, 4);

  const handleDownloadError = () => {
    const csv = [
      "Row ID,Entry Data,Name,Reason",
      ...ALL_FAILURES.map(f => `${f.row},"${f.data}","${f.name}","${f.reason}"`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "import_errors.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-3xl mx-auto px-6 py-10">

        <StepIndicator currentStep={3} />

        {/* ── Success card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="flex flex-col items-center py-10 px-8">
            <CircularProgress percentage={PERCENTAGE} />

            <h1 className="text-2xl font-black text-gray-900 mt-6 mb-1">Import Complete</h1>
            <p className="text-sm text-gray-500 text-center max-w-sm">
              We've finished processing your file.{" "}
              <span className="font-bold text-green-600"><AnimatedCounter target={SUCCESSFUL} /></span> out of{" "}
              <AnimatedCounter target={TOTAL} /> contacts were successfully added to your CRM.
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-12 mt-8 pt-8 border-t border-gray-100 w-full justify-center">
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Processed</p>
                <p className="text-2xl font-black text-gray-900"><AnimatedCounter target={TOTAL} /></p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Successful</p>
                <p className="text-2xl font-black text-green-500"><AnimatedCounter target={SUCCESSFUL} /></p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Failed</p>
                <p className="text-2xl font-black text-red-500">{FAILED}</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100 px-3 py-1.5 rounded-full">
                  labels_applied: {LABELS}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Error Report ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-bold text-gray-900">Error Report ({FAILED} Failed Rows)</h2>
            </div>
            <button
              onClick={handleDownloadError}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-white rounded-lg px-3 py-2 transition-all"
            >
              <ArrowDownTrayIcon className="w-3.5 h-3.5" />
              Download Error Log
            </button>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[100px_1fr_160px] gap-4 px-6 py-2.5 bg-gray-50 border-b border-gray-100">
            {["ROW ID", "FAILED ENTRY DATA", "REASON FOR FAILURE"].map(h => (
              <p key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</p>
            ))}
          </div>

          {/* Failure rows */}
          {displayedFailures.map((f, idx) => {
            const colors = REASON_COLORS[f.reason] || REASON_COLORS["Invalid Phone Format"];
            const isLast = idx === displayedFailures.length - 1;
            return (
              <div key={f.row} className={`grid grid-cols-[100px_1fr_160px] gap-4 items-center px-6 py-4 ${!isLast ? "border-b border-gray-50" : ""} hover:bg-gray-50/50 transition-colors`}>
                <p className="text-sm font-bold text-gray-700">Row {f.row}</p>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{f.data}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Name: {f.name}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.dot}`} />
                  {f.reason}
                </span>
              </div>
            );
          })}

          {/* View all / collapse */}
          {!showAllFailures ? (
            <button
              onClick={() => setShowAllFailures(true)}
              className="w-full py-4 text-sm font-bold text-green-600 hover:text-green-700 hover:bg-green-50 transition-colors border-t border-gray-100 flex items-center justify-center gap-1.5"
            >
              View All {FAILED} Failures
              <ChevronDownIcon className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowAllFailures(false)}
              className="w-full py-4 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
            >
              Collapse ↑
            </button>
          )}
        </div>

        {/* ── Next Steps tip ── */}
        <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 mb-8 shadow-sm">
          <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <InformationCircleIcon className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-sm text-gray-600">
            <span className="font-bold text-gray-800">Next Steps:</span>{" "}
            You can now start a new broadcast campaign or assign these contacts to a specific team member from the CRM dashboard.
          </p>
        </div>

        {/* ── CTA row ── */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/admin/contacts/import")}
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Import Another File
          </button>

          <button
            onClick={() => navigate("/admin/contacts")}
            className="flex items-center gap-2 px-7 py-3 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl shadow-sm shadow-green-200 transition-all"
          >
            <UserGroupIcon className="w-4 h-4" />
            Go to Contacts
          </button>
        </div>
      </div>
    </div>
  );
}