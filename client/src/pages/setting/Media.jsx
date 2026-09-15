import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "../../context/axios";
import { resolveMediaUrlForDev } from "../../services/TemplateApi";

// ─── Constants ─────────────────────────────────────────────────────────────────
const TABS = ["All Assets", "Images", "Videos", "Documents", "Audio"];
const MEDIA_VIEW_MODE_KEY = "messbee_media_view_mode";

const BADGE_CONFIG = {
  IMAGE:   { label: "Image",    bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-400" },
  VIDEO:   { label: "Video",    bg: "bg-rose-100",    text: "text-rose-700",    dot: "bg-rose-400"    },
  PDF:     { label: "PDF",      bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-400"   },
  AUDIO:   { label: "Audio",    bg: "bg-violet-100", text: "text-violet-700", dot: "bg-violet-400" },
  ARCHIVE: { label: "Archive",  bg: "bg-amber-100",  text: "text-amber-700",  dot: "bg-amber-400"  },
};

const INITIAL_ASSETS = [];

const FILE_ICONS = {
  PDF:     { bg: "bg-blue-100",   color: "text-blue-600",   icon: (cls="w-7 h-7") => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  AUDIO:   { bg: "bg-purple-100", color: "text-purple-600", icon: (cls="w-7 h-7") => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg> },
  ARCHIVE: { bg: "bg-orange-100", color: "text-orange-600", icon: (cls="w-7 h-7") => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg> },
  VIDEO:   { bg: "bg-red-100",    color: "text-red-600",    icon: (cls="w-7 h-7") => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> },
  IMAGE:   { bg: "bg-green-100",  color: "text-green-600",  icon: (cls="w-7 h-7") => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
};

// ─── Helpers ────────────────────────────────────────────────────────────────────
function getAssetType(file) {
  const t = file.type || "";
  const name = file.name || "";
  if (t.startsWith("image/")) return "IMAGE";
  if (t.startsWith("video/")) return "VIDEO";
  if (t.startsWith("audio/")) return "AUDIO";
  if (t === "application/pdf") return "PDF";
  
  // Fallback if mimetype is missing or generic
  const extMatch = name.match(/\.([^.]+)$/);
  if (extMatch) {
    const ext = extMatch[1].toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return "IMAGE";
    if (['mp4', 'mov', 'avi', '3gp', 'mkv'].includes(ext)) return "VIDEO";
    if (['mp3', 'ogg', 'wav', 'aac'].includes(ext)) return "AUDIO";
    if (ext === 'pdf') return "PDF";
  }
  return "ARCHIVE";
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getLocalUrl(url) {
  return resolveMediaUrlForDev(url);
}

function withPdfPreviewParams(url) {
  if (!url) return "";
  const finalUrl = getLocalUrl(url);
  return `${finalUrl}${finalUrl.includes("?") ? "&" : "?"}toolbar=0&navpanes=0&scrollbar=0`;
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteConfirmModal({ asset, onConfirm, onCancel }) {
  if (!asset) return null;
  const fi = FILE_ICONS[asset.type] || FILE_ICONS.IMAGE;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6"
        style={{ animation: "popIn 0.2s ease" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Delete Asset?</h3>
        <p className="text-sm text-gray-500 text-center mb-4">
          This will permanently delete <span className="font-semibold text-gray-700">"{asset.name}"</span>. This action cannot be undone.
        </p>
        {/* File preview row */}
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 mb-5">
          <div className={`w-9 h-9 rounded-lg ${fi.bg} flex items-center justify-center flex-shrink-0 ${fi.color}`}>{fi.icon("w-5 h-5")}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{asset.name}</p>
            <p className="text-xs text-gray-400">{asset.size} • {asset.ext}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TypeBadge ──────────────────────────────────────────────────────────────────
function TypeBadge({ type, size = "sm" }) {
  const b = BADGE_CONFIG[type] || BADGE_CONFIG.IMAGE;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${b.bg} ${b.text} ${
      size === "xs" ? "text-[10px]" : "text-xs"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${b.dot} flex-shrink-0`} />
      {b.label}
    </span>
  );
}

// ─── AssetCard ─────────────────────────────────────────────────────────────────
function AssetCard({ asset, onDeleteRequest, viewMode, selected, onSelect, onPreview }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fi = FILE_ICONS[asset.type] || FILE_ICONS.IMAGE;
  const rawUrl = asset.thumb || ((asset.type === "IMAGE" || asset.type === "VIDEO") ? asset.url : "");
  const previewSrc = getLocalUrl(rawUrl);
  const pdfPreviewSrc = asset.type === "PDF" ? withPdfPreviewParams(asset.url) : "";

  if (viewMode === "list") {
    return (
      <div className={`flex items-center gap-4 bg-white border rounded-2xl px-5 py-3.5 hover:shadow-md transition-all duration-200 group ${selected ? "border-emerald-400 bg-emerald-50/40 ring-2 ring-emerald-200" : "border-slate-200/80 hover:border-slate-300"}`}>
        {/* Checkbox */}
        <button 
          onClick={() => onSelect(asset.id)} 
          className={`w-5 h-5 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-all ${selected ? "bg-emerald-500 border-emerald-500 shadow-sm" : "border-slate-300 hover:border-emerald-400 bg-white"}`}
        >
          {selected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
        </button>

        {/* Media Icon or Mini Thumbnail */}
        <div 
          onClick={() => onPreview && onPreview(asset)}
          className={`w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 cursor-pointer shadow-sm ${fi.bg} ${fi.color}`}
        >
          {previewSrc && asset.type === "IMAGE" && !imgError ? (
            <img src={previewSrc} alt={asset.name} onError={() => setImgError(true)} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          ) : (
            fi.icon("w-5 h-5")
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onPreview && onPreview(asset)}>
          <p className="text-sm font-bold text-slate-800 truncate group-hover:text-emerald-600 transition-colors">{asset.name}</p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">{asset.size} • {asset.ext} • {new Date(asset.createdAt || Date.now()).toLocaleDateString()}</p>
        </div>

        <TypeBadge type={asset.type} />

        {/* Actions Menu */}
        <div className="relative">
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 z-30 bg-white border border-slate-100 rounded-2xl shadow-2xl py-1.5 w-44" onMouseLeave={() => setMenuOpen(false)}>
              <a 
                href={getLocalUrl(asset.url)} 
                download={asset.name}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download
              </a>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(getLocalUrl(asset.url));
                  toast.success("Link copied to clipboard");
                }} 
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Copy Public URL
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => { onDeleteRequest(asset); setMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete Asset
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group relative flex flex-col justify-between ${selected ? "border-emerald-400 ring-2 ring-emerald-200 shadow-md" : "border-slate-200/90 hover:border-emerald-300/80"}`}>
      {/* Checkbox overlay */}
      <button
        onClick={() => onSelect(asset.id)}
        className={`absolute top-3 right-3 z-20 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 shadow-sm ${
          selected ? "bg-emerald-500 border-emerald-500 opacity-100" : "bg-white/90 backdrop-blur-sm border-slate-300 opacity-0 group-hover:opacity-100 hover:border-emerald-500"
        }`}
      >
        {selected && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
      </button>

      {/* Thumbnail */}
      <div 
        onClick={() => onPreview && onPreview(asset)}
        className="relative h-44 bg-slate-50 flex items-center justify-center overflow-hidden cursor-pointer group-hover:bg-slate-100/50 transition-colors"
      >
        {previewSrc && asset.type === "IMAGE" && !imgError ? (
          <img 
            src={previewSrc} 
            alt={asset.name} 
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : previewSrc && asset.type === "VIDEO" ? (
          <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
            <video
              src={previewSrc}
              className="w-full h-full object-cover opacity-80"
              muted
              playsInline
              preload="metadata"
            />
            <div className="absolute w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 text-white shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
        ) : asset.type === "AUDIO" && asset.url ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-violet-600 mb-2 border border-violet-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
            </div>
            <audio src={getLocalUrl(asset.url)} controls className="w-full max-w-[95%] h-8 mt-1" preload="metadata" onClick={(e) => e.stopPropagation()} />
          </div>
        ) : asset.type === "PDF" && pdfPreviewSrc ? (
          <iframe title={asset.name} src={pdfPreviewSrc} className="w-full h-full border-0 pointer-events-none" />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className={`w-16 h-16 rounded-2xl ${fi.bg} flex items-center justify-center ${fi.color} shadow-sm border border-white/60`}>
              {fi.icon("w-8 h-8")}
            </div>
          </div>
        )}

        {/* Floating Type Badge */}
        <div className="absolute top-3 left-3 z-10 shadow-sm">
          <TypeBadge type={asset.type} size="xs" />
        </div>

        {asset.duration && (
          <span className="absolute bottom-2.5 right-2.5 text-[11px] font-bold bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded-lg shadow-sm">
            {asset.duration}
          </span>
        )}
      </div>

      {/* Info row */}
      <div className="flex items-center justify-between p-3.5 border-t border-slate-100 bg-white">
        <div className="min-w-0 flex-1 pr-2">
          <p className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-600 transition-colors" title={asset.name}>
            {asset.name}
          </p>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
            {asset.size} • <span className="uppercase text-slate-500">{asset.ext}</span>
          </p>
        </div>

        {/* 3 dots menu */}
        <div className="relative flex-shrink-0">
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 bottom-10 z-30 bg-white border border-slate-100 rounded-2xl shadow-2xl py-1.5 w-44" onMouseLeave={() => setMenuOpen(false)}>
              <a 
                href={getLocalUrl(asset.url)} 
                download={asset.name}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download
              </a>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(getLocalUrl(asset.url));
                  toast.success("Link copied to clipboard");
                }} 
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Copy Link
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => { onDeleteRequest(asset); setMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── NewAssetCard ───────────────────────────────────────────────────────────────
function NewAssetCard({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white border-2 border-dashed border-gray-200 rounded-2xl h-full min-h-[220px] flex flex-col items-center justify-center gap-2 hover:border-green-400 hover:bg-green-50/50 transition-all duration-200 group"
    >
      <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-green-100 flex items-center justify-center transition">
        <svg className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <span className="text-sm text-gray-400 group-hover:text-green-600 font-medium transition">New Asset</span>
    </button>
  );
}

// ─── Upload File Row ────────────────────────────────────────────────────────────
function UploadFileRow({ file, preError, onCompleted }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("uploading"); // uploading | processing | done | error
  const [errorMessage, setErrorMessage] = useState("");
  const [localPreview, setLocalPreview] = useState("");
  const fi = FILE_ICONS[getAssetType(file)] || FILE_ICONS.IMAGE;
  const fileType = getAssetType(file);
  // Guard: prevent React 18 StrictMode double-invoke from uploading twice
  const didUpload = useRef(false);

  useEffect(() => {
    if (!["IMAGE", "VIDEO", "AUDIO", "PDF"].includes(fileType)) {
      setLocalPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file, fileType]);

  useEffect(() => {
    if (didUpload.current) return; // already started
    didUpload.current = true;

    if (preError) {
      setStatus("error");
      setErrorMessage(preError);
      setProgress(100);
      onCompleted(null);
      return;
    }

    const uploadFile = async () => {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post("/media", formData, {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const pct = Math.min(100, Math.max(0, Math.round((progressEvent.loaded * 100) / progressEvent.total)));
              setProgress(pct);
              if (pct >= 100) setStatus("processing");
            }
          },
        });

        if (response.data && response.data.success) {
          setProgress(100);
          setStatus("done");
          onCompleted(response.data.data);
        } else {
          setStatus("error");
          const msg = response.data?.message || "Upload failed";
          setErrorMessage(msg);
          toast.error(`${file.name}: ${msg}`);
          onCompleted(null);
        }
      } catch (err) {
        setStatus("error");
        const msg = err.response?.data?.message || err.message || "Upload failed";
        setErrorMessage(msg);
        toast.error(`${file.name}: ${msg}`);
        onCompleted(null);
      }
    };

    uploadFile();
  }, [file, onCompleted, preError]);

  const statusIcon = status === "done"
    ? <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
    : status === "error"
    ? <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
    : status === "processing"
    ? <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
    : <span className="text-xs font-bold text-green-600">{Math.round(progress)}%</span>;

  const barColor = status === "error" ? "bg-red-400" : "bg-green-500";

  return (
    <div className={`border rounded-xl px-4 py-3 overflow-hidden ${
      status === "done" ? "bg-green-50 border-green-100" :
      status === "error" ? "bg-red-50 border-red-100" :
      "bg-white border-gray-100"
    }`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 ${localPreview ? "bg-gray-100" : `${fi.bg} ${fi.color}`}`}>
          {localPreview && fileType === "IMAGE" ? (
            <img src={localPreview} alt={file.name} className="w-full h-full object-cover" />
          ) : localPreview && fileType === "VIDEO" ? (
            <video src={localPreview} className="w-full h-full object-cover" muted playsInline preload="metadata" />
          ) : localPreview && fileType === "AUDIO" ? (
            <div className="w-full h-full flex items-center justify-center bg-violet-100 text-violet-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
            </div>
          ) : localPreview && fileType === "PDF" ? (
            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
          ) : (
            fi.icon("w-5 h-5")
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
          {status === "error" && errorMessage ? (
            <p className="text-xs text-red-500 truncate">{errorMessage}</p>
          ) : (
            <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
          )}
        </div>
        {statusIcon}
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-200`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

// Map of tab name → file input accept string
const TAB_ACCEPT = {
  "All Assets": "image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar",
  "Images":     "image/*",
  "Videos":     "video/*",
  "Documents":  ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,application/pdf,application/msword",
  "Audio":      "audio/*",
};

// ─── Upload Modal ───────────────────────────────────────────────────────────────
function UploadModal({ open, onClose, onUploadComplete, activeTab = "All Assets", existingAssets = [] }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [completedCount, setCompletedCount] = useState(0); // files that finished (success OR error)
  const [successAssets, setSuccessAssets] = useState([]);  // only successfully uploaded assets
  const fileInputRef = useRef();
  const rollingBackRef = useRef(false);

  useEffect(() => {
    if (!open) {
      setUploadFiles([]);
      setCompletedCount(0);
      setSuccessAssets([]);
    }
  }, [open]);

  const handleFiles = (files) => {
    const incoming = Array.from(files || []);
    if (!incoming.length) return;

    const normalizeName = (name) => String(name || "").trim().toLowerCase();
    const existingNameSet = new Set(
      existingAssets
        .map((a) => normalizeName(a?.name))
        .filter(Boolean)
    );

    const queuedSignatureSet = new Set(
      uploadFiles.map((entry) => `${normalizeName(entry.file?.name)}__${entry.file?.size}__${entry.file?.type}`)
    );

    const batchSignatureSet = new Set();
    const nextEntries = [];
    let oversizedCount = 0;
    let duplicateCount = 0;

    incoming.forEach((file, idx) => {
      if (file.size > 25 * 1024 * 1024) {
        oversizedCount += 1;
        return;
      }

      const nameKey = normalizeName(file.name);
      const signature = `${nameKey}__${file.size}__${file.type}`;
      const isDuplicate =
        existingNameSet.has(nameKey) ||
        queuedSignatureSet.has(signature) ||
        batchSignatureSet.has(signature);

      if (isDuplicate) {
        duplicateCount += 1;
        nextEntries.push({
          id: `${Date.now()}-dup-${idx}-${file.name}`,
          file,
          preError: `Duplicate file: ${file.name}`,
        });
        return;
      }

      batchSignatureSet.add(signature);
      nextEntries.push({
        id: `${Date.now()}-ok-${idx}-${file.name}`,
        file,
        preError: "",
      });
    });

    if (oversizedCount) toast.error(`${oversizedCount} file(s) exceed 25MB limit`);
    if (duplicateCount) toast.error(`${duplicateCount} duplicate file(s) skipped`);
    if (nextEntries.length) setUploadFiles((prev) => [...prev, ...nextEntries]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  // Called by each UploadFileRow when it finishes (either success or error)
  // asset will be the server response data on success, or null on error
  const handleFileCompleted = useCallback((asset) => {
    setCompletedCount((n) => n + 1);
    if (asset) {
      setSuccessAssets((prev) => [...prev, asset]);
    }
  }, []);

  const handleDone = () => {
    const validAssets = successAssets.filter(Boolean);
    onUploadComplete(validAssets);
    onClose();
    if (validAssets.length > 0) {
      toast.success(`${validAssets.length} file(s) uploaded successfully!`);
    }
  };

  const handleRequestClose = async () => {
    if (rollingBackRef.current) return;

    const uploadedThisSession = successAssets
      .map((asset) => asset?._id || asset?.id)
      .filter(Boolean);

    if (uploadedThisSession.length > 0) {
      try {
        rollingBackRef.current = true;
        await Promise.allSettled(
          uploadedThisSession.map((id) => axios.delete(`/media/${id}`))
        );
        toast.info("Upload canceled. Files were not saved.");
      } catch (err) {
        // Ignore rollback failures here to keep close flow reliable.
      } finally {
        rollingBackRef.current = false;
      }
    }

    onClose();
  };

  // Done is enabled when every queued file has completed (success OR error)
  const allDone = uploadFiles.length > 0 && completedCount >= uploadFiles.length;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-sm" onClick={handleRequestClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-hidden flex flex-col"
        style={{ animation: "popIn 0.25s ease" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Upload Assets</h3>
            <p className="text-sm text-gray-400 mt-0.5">Max file size 25MB</p>
          </div>
          <button onClick={handleRequestClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition text-xl">×</button>
        </div>

        <div className="px-6 pb-6 overflow-y-auto">
          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-5 sm:p-8 flex flex-col items-center gap-3 transition-all duration-200 mb-5 ${
              dragOver ? "border-green-400 bg-green-50" : "border-green-200 bg-green-50/40"
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
              <div className="text-center">
              <p className="font-bold text-gray-800">Drag and drop files here</p>
              <p className="text-sm text-gray-400 mt-0.5">
                {activeTab === "All Assets" ? "Supports images, videos, audio, PDFs & docs" :
                 activeTab === "Images"     ? "Images only (JPG, PNG, WEBP, GIF)" :
                 activeTab === "Videos"     ? "Videos only (MP4, MOV, AVI, 3GP)" :
                 activeTab === "Documents"  ? "Documents only (PDF, DOC, XLS, PPT...)" :
                 activeTab === "Audio"      ? "Audio files only (MP3, OGG, WAV, AAC)" :
                 "Files up to 25MB supported"}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={TAB_ACCEPT[activeTab] || TAB_ACCEPT["All Assets"]}
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition"
            >
              Browse Files
            </button>
          </div>

          {/* Uploading files list */}
          {uploadFiles.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {uploadFiles.length} FILE{uploadFiles.length > 1 ? "S" : ""}
                </p>
                {allDone && (
                  <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    All done!
                  </span>
                )}
              </div>
              <div className="space-y-3 max-h-56 sm:max-h-64 overflow-y-auto pr-1">
                {uploadFiles.map((entry) => (
                  <UploadFileRow
                    key={entry.id}
                    file={entry.file}
                    preError={entry.preError}
                    onCompleted={handleFileCompleted}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleRequestClose}
              className="px-5 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDone}
              disabled={!allDone}
              className={`px-6 py-2 text-sm font-semibold rounded-xl transition ${
                allDone
                  ? "bg-green-500 hover:bg-green-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {allDone ? `Done (${successAssets.filter(Boolean).length} uploaded)` : "Done"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MediaGallery() {
  const [activeTab, setActiveTab] = useState("All Assets");
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window === "undefined") return "grid";
    const saved = window.localStorage.getItem(MEDIA_VIEW_MODE_KEY);
    return saved === "list" || saved === "grid" ? saved : "grid";
  }); // grid | list
  const [search, setSearch] = useState("");
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);   // asset to confirm delete
  const [selectedIds, setSelectedIds] = useState([]);        // bulk selection

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/media");
      if (data.success) {
        // Map _id to id for component compatibility
        const mapped = data.data.map(a => ({ ...a, id: a._id }));
        setAssets(mapped);
      }
    } catch (err) {
      toast.error("Failed to load media assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(MEDIA_VIEW_MODE_KEY, viewMode);
    }
  }, [viewMode]);

  const handleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map((a) => a.id));
  };

  const handleDeleteConfirm = async () => {
    try {
      const { data } = await axios.delete(`/media/${deleteTarget.id}`);
      if (data.success) {
        setAssets((prev) => prev.filter((a) => a.id !== deleteTarget.id));
        toast.success(`"${deleteTarget.name}" deleted successfully`);
        setDeleteTarget(null);
      }
    } catch (err) {
      toast.error("Failed to delete asset");
    }
  };

  const handleBulkDelete = async () => {
    try {
      const { data } = await axios.post("/media/bulk-delete", { ids: selectedIds });
      if (data.success) {
        const count = selectedIds.length;
        setAssets((prev) => prev.filter((a) => !selectedIds.includes(a.id)));
        setSelectedIds([]);
        toast.success(`${count} asset${count > 1 ? "s" : ""} deleted`);
      }
    } catch (err) {
      toast.error("Failed to delete selected assets");
    }
  };

  // Filter assets by tab + search
  const filtered = assets.filter((a) => {
    const matchTab =
      activeTab === "All Assets" ? true :
      activeTab === "Images"    ? a.type === "IMAGE" :
      activeTab === "Videos"    ? a.type === "VIDEO" :
      activeTab === "Documents" ? (a.type === "PDF" || a.type === "ARCHIVE") :
      activeTab === "Audio"     ? a.type === "AUDIO" : true;
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleUploadComplete = (newAssetsRaw) => {
    const newAssets = newAssetsRaw.map(a => ({ ...a, id: a._id }));
    setAssets((prev) => [...newAssets, ...prev]);
  };

  // Storage usage calculation
  const totalAssets = assets.length;
  // Simple sum of sizes (assuming size string like "1.2 MB")
  const totalSizeBytes = assets.reduce((acc, a) => {
    const val = parseFloat(a.size);
    if (a.size.includes("MB")) return acc + val * 1024 * 1024;
    if (a.size.includes("KB")) return acc + val * 1024;
    return acc + val;
  }, 0);
  const storageUsed = (totalSizeBytes / (1024 * 1024)).toFixed(1); // in MB

  // Count per tab dynamically
  const counts = {
    all: assets.length,
    images: assets.filter(a => a.type === "IMAGE").length,
    videos: assets.filter(a => a.type === "VIDEO").length,
    documents: assets.filter(a => a.type === "PDF" || a.type === "ARCHIVE").length,
    audio: assets.filter(a => a.type === "AUDIO").length,
  };

  const [previewModalAsset, setPreviewModalAsset] = useState(null);

  return (
    <>
      <style>{`
        @keyframes popIn { from { transform: scale(0.94); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <DeleteConfirmModal
        asset={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <UploadModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onUploadComplete={handleUploadComplete}
        activeTab={activeTab}
        existingAssets={assets}
      />

      {/* ── PREVIEW LIGHTBOX MODAL ── */}
      {previewModalAsset && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" 
          onClick={() => setPreviewModalAsset(null)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]"
            style={{ animation: "popIn 0.2s ease" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3 min-w-0">
                <TypeBadge type={previewModalAsset.type} />
                <h3 className="text-sm font-bold text-slate-800 truncate" title={previewModalAsset.name}>
                  {previewModalAsset.name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={getLocalUrl(previewModalAsset.url)} 
                  download={previewModalAsset.name} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-600 bg-white border border-slate-200 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download
                </a>
                <button 
                  onClick={() => setPreviewModalAsset(null)} 
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex items-center justify-center min-h-[320px] bg-slate-900/5">
              {previewModalAsset.type === "IMAGE" ? (
                <img 
                  src={getLocalUrl(previewModalAsset.url)} 
                  alt={previewModalAsset.name} 
                  className="max-h-[60vh] max-w-full object-contain rounded-2xl shadow-lg" 
                />
              ) : previewModalAsset.type === "VIDEO" ? (
                <video 
                  src={getLocalUrl(previewModalAsset.url)} 
                  controls 
                  autoPlay 
                  className="max-h-[60vh] max-w-full rounded-2xl shadow-lg" 
                />
              ) : previewModalAsset.type === "AUDIO" ? (
                <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                  </div>
                  <p className="font-semibold text-slate-800 text-center">{previewModalAsset.name}</p>
                  <audio src={getLocalUrl(previewModalAsset.url)} controls className="w-full" autoPlay />
                </div>
              ) : previewModalAsset.type === "PDF" ? (
                <iframe 
                  title={previewModalAsset.name} 
                  src={getLocalUrl(previewModalAsset.url)} 
                  className="w-full h-[65vh] rounded-2xl border border-slate-200 shadow" 
                />
              ) : (
                <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center">
                  <p className="text-sm font-semibold text-slate-700">Preview not supported for this file format.</p>
                  <a 
                    href={getLocalUrl(previewModalAsset.url)} 
                    download={previewModalAsset.name}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    Download to view
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Size: <strong className="text-slate-700">{previewModalAsset.size}</strong></span>
              <span>Format: <strong className="text-slate-700 uppercase">{previewModalAsset.ext}</strong></span>
              <span>Uploaded: <strong className="text-slate-700">{new Date(previewModalAsset.createdAt || Date.now()).toLocaleDateString()}</strong></span>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-['Urbanist',sans-serif]">
        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 p-6 max-w-7xl mx-auto w-full">

          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Media Gallery</h1>
                <p className="text-sm text-slate-500 font-medium mt-0.5">Manage and preview digital assets for WhatsApp campaigns and broadcasts</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition w-60 shadow-sm"
                />
              </div>

              {/* Upload button */}
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Media
              </button>
            </div>
          </div>

          {/* ── STATS ROW ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Assets</p>
                <p className="text-2xl font-black text-slate-800 mt-1">{totalAssets}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                📁
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Images & Videos</p>
                <p className="text-2xl font-black text-slate-800 mt-1">{counts.images + counts.videos}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                🎬
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Storage Used</p>
                <p className="text-2xl font-black text-slate-800 mt-1">{storageUsed} <span className="text-xs font-bold text-slate-400">MB</span></p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                💾
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Docs & Audio</p>
                <p className="text-2xl font-black text-slate-800 mt-1">{counts.documents + counts.audio}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                🎵
              </div>
            </div>
          </div>

          {/* Tabs + View toggle */}
          <div className="flex items-center justify-between mb-6 bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-sm">
            <div className="flex gap-1 overflow-x-auto">
              {[
                { name: "All Assets", count: counts.all },
                { name: "Images", count: counts.images },
                { name: "Videos", count: counts.videos },
                { name: "Documents", count: counts.documents },
                { name: "Audio", count: counts.audio }
              ].map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    activeTab === tab.name
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {tab.name}
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    activeTab === tab.name ? "bg-white/20 text-white" : "bg-slate-200/70 text-slate-600"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Grid / List toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition ${viewMode === "grid" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}
                title="Grid View"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition ${viewMode === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}
                title="List View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Bulk action bar ── */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between bg-rose-50 border border-rose-200 rounded-2xl px-5 py-3 mb-5" style={{ animation: "fadeUp 0.2s ease" }}>
              <div className="flex items-center gap-3">
                <button onClick={handleSelectAll} className="text-xs font-bold text-rose-600 hover:text-rose-700 underline underline-offset-2 transition cursor-pointer">
                  {selectedIds.length === filtered.length ? "Deselect All" : "Select All"}
                </button>
                <span className="text-sm font-bold text-rose-800">{selectedIds.length} asset{selectedIds.length > 1 ? "s" : ""} selected</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedIds([])} className="px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 transition cursor-pointer">
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition shadow-sm cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Delete ({selectedIds.length})
                </button>
              </div>
            </div>
          )}

          {/* Assets Grid / List */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" style={{ animation: "fadeUp 0.3s ease" }}>
              {loading ? (
                <div className="col-span-full py-24 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-400 mt-4 font-semibold text-sm">Loading media assets...</p>
                </div>
              ) : (
                <>
                  {/* New Asset card — always first */}
                  <NewAssetCard onClick={() => setShowUpload(true)} />
                  {filtered.map((asset) => (
                    <AssetCard 
                      key={asset.id} 
                      asset={asset} 
                      onDeleteRequest={setDeleteTarget} 
                      viewMode="grid" 
                      selected={selectedIds.includes(asset.id)} 
                      onSelect={handleSelect}
                      onPreview={setPreviewModalAsset}
                    />
                  ))}
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3" style={{ animation: "fadeUp 0.3s ease" }}>
              {loading ? (
                <div className="py-24 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-400 mt-4 font-semibold text-sm">Loading media assets...</p>
                </div>
              ) : (
                <>
                  {filtered.map((asset) => (
                    <AssetCard 
                      key={asset.id} 
                      asset={asset} 
                      onDeleteRequest={setDeleteTarget} 
                      viewMode="list" 
                      selected={selectedIds.includes(asset.id)} 
                      onSelect={handleSelect}
                      onPreview={setPreviewModalAsset}
                    />
                  ))}
                  {filtered.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm">
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-2xl">
                        🔍
                      </div>
                      <p className="text-base font-bold text-slate-700">No assets found</p>
                      <p className="text-xs text-slate-400 mt-1">Try a different search keyword or upload new media assets</p>
                      <button 
                        onClick={() => setShowUpload(true)} 
                        className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow transition"
                      >
                        Upload Now
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}