import React, { useState, useEffect, useRef } from "react";
import {
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  XMarkIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const AnimatedCounter = ({ target, duration = 1500 }) => {
  const [count, setCount] = useState(0);
  const startTime = useRef(null);

  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const animate = (ts) => {
      if (!startTime.current) startTime.current = ts;
      const progress = Math.min((ts - startTime.current) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - progress, 3)) * target));
      if (progress < 1) requestAnimationFrame(animate);
      else setCount(target);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return <>{count.toLocaleString()}</>;
};

const CircularProgress = ({ percentage }) => {
  const [pct, setPct] = useState(0);
  const radius = 70;
  const stroke = 8;
  const normalizedR = radius - stroke / 2;
  const circumf = 2 * Math.PI * normalizedR;
  const offset = circumf - (pct / 100) * circumf;

  useEffect(() => {
    if (percentage === 0) { setPct(0); return; }
    let start = null;
    const animate = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / 1200, 1);
      setPct((1 - Math.pow(1 - progress, 3)) * percentage);
      if (progress < 1) requestAnimationFrame(animate);
      else setPct(percentage);
    };
    requestAnimationFrame(animate);
  }, [percentage]);

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
        <circle cx={radius} cy={radius} r={normalizedR} fill="none" stroke="#f0fdf4" strokeWidth={stroke}/>
        <circle cx={radius} cy={radius} r={normalizedR} fill="none" stroke="#22c55e" strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circumf} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.05s linear" }}
        />
      </svg>
      <div className="text-center z-10">
        <p className="text-2xl font-black text-gray-900">{pct.toFixed(1)}%</p>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Success</p>
      </div>
    </div>
  );
};

const reasonColor = (reason = "") => {
  const lower = reason.toLowerCase();
  if (lower.includes("duplicate"))
    return { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-400" };
  if (lower.includes("missing") || lower.includes("required"))
    return { bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-400" };
  return { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" };
};

export default function ReviewSummaryModal({ importData, onClose }) {
  const TOTAL = importData.total ?? 0;
  const SUCCESSFUL = importData.successful ?? 0;
  const FAILED = importData.failed ?? 0;
  const FAIL_ROWS = Array.isArray(importData.failedRows) ? importData.failedRows : [];
  const PERCENTAGE = TOTAL > 0 ? Math.min(100, (SUCCESSFUL / TOTAL) * 100) : 0;

  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? FAIL_ROWS : FAIL_ROWS.slice(0, 4);

  const handleDownloadError = () => {
    const header = "Row ID,Entry Data,Name,Reason";
    const rows = FAIL_ROWS.map(f =>
      `${f.row},"${(f.data || "").replace(/"/g, '""')}","${(f.name || "").replace(/"/g, '""')}","${(f.reason || "").replace(/"/g, '""')}"`
    );
    const csv = [header, ...rows].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "import_errors.csv" });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center font-sans">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-[95vw] max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-xl font-black text-gray-900">Review & Summary</h2>
            <p className="text-sm text-gray-500 mt-1">
              Here is the result of your CSV import.
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
        <div className="flex-1 overflow-y-auto px-6 py-4.5 bg-gray-50">
          
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="flex flex-col items-center py-8 px-6">
              <CircularProgress percentage={PERCENTAGE} />

              <h1 className="text-xl font-black text-gray-900 mt-5 mb-1">Import Complete</h1>

              <p className="text-sm text-gray-500 text-center max-w-sm mt-2">
                {importData.message ? importData.message : (
                  <>
                    We have finished processing{" "}
                    <span className="font-bold text-gray-800">{importData.fileName || "your file"}</span>.
                  </>
                )}{" "}
                <span className="font-bold text-emerald-600"><AnimatedCounter target={SUCCESSFUL}/></span> out of{" "}
                <AnimatedCounter target={TOTAL}/> contacts were successfully added.
              </p>

              <div className="flex items-center gap-10 mt-6 pt-6 border-t border-gray-100 w-full justify-center">
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Processed</p>
                  <p className="text-xl font-black text-gray-900"><AnimatedCounter target={TOTAL}/></p>
                </div>
                <div className="w-px h-10 bg-gray-200"/>
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Successful</p>
                  <p className="text-xl font-black text-emerald-500"><AnimatedCounter target={SUCCESSFUL}/></p>
                </div>
                <div className="w-px h-10 bg-gray-200"/>
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Failed</p>
                  <p className="text-xl font-black text-red-500">{FAILED.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {FAIL_ROWS.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-amber-500"/>
                  <h2 className="text-sm font-bold text-gray-900">Error Report ({FAILED} Failed Rows)</h2>
                </div>
                <button
                  onClick={handleDownloadError}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-white rounded-lg px-3 py-2 transition-all"
                >
                  <ArrowDownTrayIcon className="w-3.5 h-3.5"/>Download Log
                </button>
              </div>

              <div className="grid grid-cols-[100px_1fr_200px] gap-4 px-6 py-2.5 bg-gray-50 border-b border-gray-100">
                {["ROW ID", "FAILED ENTRY DATA", "REASON FOR FAILURE"].map(h => (
                  <p key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</p>
                ))}
              </div>

              {displayed.map((f, idx) => {
                const colors = reasonColor(f.reason);
                return (
                  <div
                    key={`${f.row}-${idx}`}
                    className={`grid grid-cols-[100px_1fr_200px] gap-4 items-center px-5 py-2.5 ${idx < displayed.length - 1 ? "border-b border-gray-50" : ""} hover:bg-gray-50/50 transition-colors`}
                  >
                    <p className="text-sm font-bold text-gray-700">Row {f.row}</p>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 truncate">{f.data || "—"}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Name: {f.name || "Unknown"}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.dot}`}/>
                      {f.reason || "Unknown error"}
                    </span>
                  </div>
                );
              })}

              {FAIL_ROWS.length > 4 && (
                !showAll
                  ? <button
                      onClick={() => setShowAll(true)}
                      className="w-full py-4 text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors border-t border-gray-100 flex items-center justify-center gap-1.5"
                    >
                      View All {FAILED} Failures<ChevronDownIcon className="w-4 h-4"/>
                    </button>
                  : <button
                      onClick={() => setShowAll(false)}
                      className="w-full py-4 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                    >
                      Collapse ↑
                    </button>
              )}
            </div>
          )}

          <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <InformationCircleIcon className="w-4 h-4 text-blue-500"/>
            </div>
            <p className="text-sm text-gray-600">
              <span className="font-bold text-gray-800">Next Steps:</span>{" "}
              Click Continue to use these successfully imported contacts as the audience for your new broadcast campaign.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-100 py-3.5 px-6 shrink-0 flex items-center justify-end gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-200"
          >
            Continue to Campaign <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
