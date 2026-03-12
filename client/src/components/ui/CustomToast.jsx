import React from "react";

/* ─────────────────────────────────────────────
   Icon colours per toast type
   ───────────────────────────────────────────── */
const typeStyles = {
  success: { bg: "#10b981" },   // emerald-500
  error:   { bg: "#ef4444" },   // red-500
  info:    { bg: "#3b82f6" },   // blue-500
  warning: { bg: "#f59e0b" },   // amber-500
};

/* SVG paths for each type (rendered white‑on‑colour) */
const typeIcons = {
  success: (
    <path
      d="M9 12.75L11.25 15 15 9.75"
      stroke="white"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  error: (
    <>
      <path d="M12 9v3.75" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="12" cy="16" r="0.9" fill="white" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="8.5" r="0.9" fill="white" />
      <path d="M12 11v5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
    </>
  ),
  warning: (
    <>
      <path d="M12 9v3.75" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="12" cy="16" r="0.9" fill="white" />
    </>
  ),
};

const CustomToast = ({ title, message, type = "success", closeToast }) => {
  const style = typeStyles[type] || typeStyles.success;
  const iconPath = typeIcons[type] || typeIcons.success;

  return (
    <div className="flex items-start gap-4 w-full relative" style={{ padding: "2px 28px 2px 0" }}>

      {/* ── ICON: solid colour circle with white symbol ── */}
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-full"
        style={{
          width: 32,
          height: 32,
          minWidth: 32,
          backgroundColor: style.bg,
          marginTop: 1,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          {iconPath}
        </svg>
      </div>

      {/* ── TEXT ── */}
      <div className="flex-1 min-w-0" style={{ paddingTop: 1 }}>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 700,
            color: "#1a202c",
            lineHeight: 1.35,
            fontFamily: "'Urbanist', sans-serif",
          }}
        >
          {title || (type === "success" ? "Success" : type === "error" ? "Error Occurred" : type === "info" ? "Information" : "Warning")}
        </p>
        {message && (
          <p
            style={{
              margin: "3px 0 0 0",
              fontSize: 13,
              fontWeight: 400,
              color: "#6b7280",
              lineHeight: 1.5,
              fontFamily: "'Urbanist', sans-serif",
            }}
          >
            {message}
          </p>
        )}
      </div>

      {/* ── CLOSE BUTTON ── */}
      <button
        onClick={closeToast}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 4,
          lineHeight: 0,
          color: "#9ca3af",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#4b5563")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
        aria-label="Close notification"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};

export default CustomToast;
