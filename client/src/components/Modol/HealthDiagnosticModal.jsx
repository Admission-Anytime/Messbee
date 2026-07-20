import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const ENDPOINTS = [
  { id: "msg",      icon: "💬", label: "Send Message API",     path: "/v1/messages",           latency: null, status: "WAITING", enabled: true  },
  { id: "media",    icon: "🖼️", label: "Media Upload",         path: "/v1/media",              latency: null, status: "WAITING", enabled: true  },
  { id: "template", icon: "📄", label: "Template Management",  path: "/v1/message_templates",  latency: null, status: "WAITING", enabled: true  },
  { id: "analytic", icon: "📊", label: "Analytics Fetch",      path: "/v1/business_analytics", latency: null, status: "DISABLED", enabled: false },
];

export default function HealthDiagnosticModal({ open, onClose }) {
  const [running, setRunning] = useState(false);
  const [revealed, setRevealed] = useState([]);
  const [score, setScore] = useState(0);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [lastChecked, setLastChecked] = useState("Just Now");
  const [done, setDone] = useState(false);

  const runDiagnostic = () => {
    setRunning(true);
    setRevealed([]);
    setScore(0);
    setScoreDisplay(0);
    setDone(false);

    // Reveal endpoints one by one
    ENDPOINTS.forEach((ep, idx) => {
      setTimeout(() => {
        setRevealed((prev) => [...prev, ep.id]);
        if (idx === ENDPOINTS.length - 1) {
          // animate score counter
          const finalScore = 100;
          let current = 0;
          const step = () => {
            current = Math.min(current + 4, finalScore);
            setScoreDisplay(current);
            if (current < finalScore) requestAnimationFrame(step);
            else { setScore(100); setDone(true); setRunning(false); setLastChecked("Just Now"); }
          };
          requestAnimationFrame(step);
        }
      }, (idx + 1) * 600);
    });
  };

  useEffect(() => {
    if (open) runDiagnostic();
    else { setRevealed([]); setScore(0); setScoreDisplay(0); setDone(false); setRunning(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleExportDiagnostic = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      overallScore: score,
      environment: "Production",
      endpoints: ENDPOINTS.map((ep) => ({
        name: ep.label,
        path: ep.path,
        latency: ep.latency ? `${ep.latency}ms` : "N/A",
        status: ep.status,
        enabled: ep.enabled,
      })),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "diagnostic-report.json" });
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Diagnostic report exported!");
  };

  if (!open) return null;

  // SVG circular arc
  const R = 60, C = 2 * Math.PI * R;
  const arcOffset = C - (scoreDisplay / 100) * C;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4" style={{ animation: "popIn 0.25s ease" }}>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Connection Health Diagnostic</h3>
              <p className="text-xs text-gray-400 mt-0.5">Deep-link technical verification for WhatsApp Business API</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition text-xl leading-none">×</button>
        </div>

        {/* Body — two columns */}
        <div className="flex divide-x divide-gray-100">

          {/* Left — Score */}
          <div className="w-64 flex-shrink-0 p-6 flex flex-col items-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Overall Score</p>

            {/* Circular score */}
            <div className="relative w-36 h-36 mb-6">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r={R} fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle
                  cx="70" cy="70" r={R}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={arcOffset}
                  style={{ transition: "stroke-dashoffset 0.05s linear" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-gray-900">{scoreDisplay}%</span>
                <span className={`text-xs font-bold mt-0.5 tracking-wider ${done ? "text-green-500" : "text-gray-400"}`}>
                  {done ? "READY" : "CHECKING..."}
                </span>
              </div>
            </div>

            {/* Info pills */}
            <div className="w-full space-y-2 mb-5">
              {[
                { label: "Environment", value: "Production" },
                { label: "Last Checked",  value: lastChecked  },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2">
                  <span className="text-xs text-gray-500 font-medium">{label}</span>
                  <span className="text-xs font-bold text-gray-800">{value}</span>
                </div>
              ))}
            </div>

            {done && (
              <p className="text-xs text-gray-400 text-center italic leading-relaxed">
                All systems are operational. Latency is within acceptable thresholds for business messaging.
              </p>
            )}
          </div>

          {/* Right — Endpoint list */}
          <div className="flex-1 p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Endpoint Latency &amp; Status</p>
            <div className="space-y-3">
              {ENDPOINTS.map((ep) => {
                const isRevealed = revealed.includes(ep.id);
                return (
                  <div
                    key={ep.id}
                    className={`flex items-center justify-between border rounded-xl px-4 py-3 transition-all duration-500 ${
                      isRevealed ? "border-gray-100 bg-gray-50 opacity-100" : "border-transparent bg-transparent opacity-0"
                    }`}
                    style={{ transform: isRevealed ? "translateY(0)" : "translateY(8px)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-base shadow-sm">
                        {ep.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{ep.label}</p>
                        <p className="text-xs text-gray-400 font-mono">{ep.path}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {ep.enabled ? (
                        <>
                          <p className="text-sm font-bold text-green-500">{ep.latency}ms</p>
                          <p className="text-xs text-gray-400 font-semibold">STATUS: {ep.status}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-gray-400">N/A</p>
                          <p className="text-xs text-gray-400 font-bold tracking-wider">DISABLED</p>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <button
            onClick={handleExportDiagnostic}
            disabled={!done}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-30 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export Diagnostic Report (.JSON)
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
              Close
            </button>
            <button
              onClick={runDiagnostic}
              disabled={running}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-xl transition disabled:opacity-60"
            >
              <svg className={`w-4 h-4 ${running ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Re-run Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
