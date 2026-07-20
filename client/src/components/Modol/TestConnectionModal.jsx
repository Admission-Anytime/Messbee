import React, { useState, useEffect } from "react";

const TEST_STEPS = [
  { id: "handshake",  label: "Handshake with Meta Servers",       badge: "SUCCESS",    delay: 800  },
  { id: "token",      label: "Validating System User Access Token",badge: "VERIFIED",   delay: 1600 },
  { id: "phone",      label: "Checking Phone Number ID Status",    badge: "ACTIVE",     delay: 2400 },
  { id: "webhook",    label: "Testing Webhook Response",           badge: "PROCESSING", delay: 3200 },
];

export default function TestConnectionModal({ open, onClose, onDone }) {
  const [stepStates, setStepStates] = useState({}); // id -> "pending"|"done"|"processing"
  const [phase, setPhase] = useState("idle"); // idle | running | done
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) { setStepStates({}); setPhase("idle"); setProgress(0); return; }
    setPhase("running");
    setStepStates({});
    setProgress(0);

    // Animate circular progress
    let frame;
    let start = null;
    const totalDuration = 3600;
    const animateProgress = (ts) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      setProgress(Math.min((elapsed / totalDuration) * 100, 100));
      if (elapsed < totalDuration) frame = requestAnimationFrame(animateProgress);
    };
    frame = requestAnimationFrame(animateProgress);

    // Fire each step
    TEST_STEPS.forEach((step, idx) => {
      // mark processing right before it completes
      setTimeout(() => {
        setStepStates((prev) => ({ ...prev, [step.id]: "processing" }));
      }, step.delay - 400);
      setTimeout(() => {
        setStepStates((prev) => ({ ...prev, [step.id]: "done" }));
        if (idx === TEST_STEPS.length - 1) {
          setTimeout(() => { setPhase("done"); cancelAnimationFrame(frame); setProgress(100); }, 400);
        }
      }, step.delay);
    });

    return () => cancelAnimationFrame(frame);
  }, [open]);

  if (!open) return null;

  // SVG arc for circular progress
  const R = 54;
  const C = 2 * Math.PI * R;
  const offset = C - (progress / 100) * C;

  const stepColor = (id) => {
    const s = stepStates[id];
    if (!s) return "text-gray-300";
    if (s === "done") return "text-green-500";
    return "text-gray-400";
  };
  const badgeColor = (badge) => {
    if (badge === "SUCCESS") return "text-green-600";
    if (badge === "VERIFIED") return "text-green-600";
    if (badge === "ACTIVE") return "text-green-600";
    return "text-gray-400";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={phase === "done" ? onClose : undefined}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8"
        style={{ animation: "popIn 0.25s ease" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Test Connection</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition text-lg font-light">×</button>
        </div>

        {/* Circular progress */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-36 h-36">
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 124 124">
              {/* Track */}
              <circle cx="62" cy="62" r={R} fill="none" stroke="#e5e7eb" strokeWidth="6" />
              {/* Progress */}
              <circle
                cx="62" cy="62" r={R}
                fill="none"
                stroke={phase === "done" ? "#22c55e" : "#22c55e"}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 0.1s linear" }}
              />
            </svg>
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              {phase === "done" ? (
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
              )}
            </div>
          </div>
          <p className={`mt-4 text-base font-semibold ${phase === "done" ? "text-green-600" : "text-gray-700"}`}>
            {phase === "done" ? "Connection Successful" : "Testing connectivity..."}
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-6">
          {TEST_STEPS.map((step) => {
            const s = stepStates[step.id];
            const isDone = s === "done";
            const isProcessing = s === "processing";
            const isPending = !s;
            return (
              <div key={step.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    {isDone && (
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {isProcessing && (
                      <svg className="w-5 h-5 text-gray-400" style={{ animation: "spin 1s linear infinite" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    {isPending && (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-200" />
                    )}
                  </div>
                  <span className={`text-sm font-medium transition-colors duration-300 ${isDone ? "text-gray-700" : isProcessing ? "text-gray-500" : "text-gray-300"}`}>
                    {step.label}
                  </span>
                </div>
                <span className={`text-xs font-bold tracking-wider transition-all duration-300 ${
                  isDone ? badgeColor(step.badge) :
                  isProcessing ? "text-gray-400" : "text-gray-200"
                }`}>
                  {isDone ? step.badge : isProcessing ? "PROCESSING" : "—"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Success banner */}
        <div className={`rounded-xl border transition-all duration-500 overflow-hidden ${phase === "done" ? "max-h-24 opacity-100 border-green-200 bg-green-50 p-4 mb-6" : "max-h-0 opacity-0 border-transparent p-0 mb-0"}`}>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Connection established successfully.</p>
              <p className="text-xs text-gray-500 mt-0.5">API is ready for messaging through your configuration.</p>
            </div>
          </div>
        </div>

        {/* Close button */}
        <div className="flex justify-end">
          <button
            onClick={() => onDone()}
            disabled={phase !== "done"}
            className={`px-8 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
              phase === "done"
                ? "bg-green-500 hover:bg-green-600 text-white shadow-md"
                : "bg-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
