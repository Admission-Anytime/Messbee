import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "react-toastify";

// ─── Constants ─────────────────────────────────────────────────────────────────
const TABS = ["All Assets", "Images", "Videos", "Documents", "Audio"];

const TYPE_COLORS = {
  IMAGE:   { bg: "bg-green-500",  text: "text-white" },
  VIDEO:   { bg: "bg-red-500",    text: "text-white" },
  PDF:     { bg: "bg-blue-500",   text: "text-white" },
  AUDIO:   { bg: "bg-purple-500", text: "text-white" },
  ARCHIVE: { bg: "bg-orange-500", text: "text-white" },
};

const INITIAL_ASSETS = [
  { id: 1, name: "Summer_Promo_01.jpg",       size: "1.2 MB",  ext: "JPG",  type: "IMAGE",   duration: null,   thumb: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80" },
  { id: 2, name: "Price_List_2024.pdf",        size: "456 KB",  ext: "PDF",  type: "PDF",     duration: null,   thumb: null },
  { id: 3, name: "Customer_Story.mp4",         size: "12.5 MB", ext: "MP4",  type: "VIDEO",   duration: "0:15", thumb: "https://images.unsplash.com/photo-1606986628253-06eb27e29afc?w=400&q=80" },
  { id: 4, name: "Welcome_Voice_Msg.ogg",      size: "112 KB",  ext: "OGG",  type: "AUDIO",   duration: null,   thumb: null },
  { id: 5, name: "Analytics_Report_Oct.png",   size: "2.4 MB",  ext: "PNG",  type: "IMAGE",   duration: null,   thumb: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80" },
  { id: 6, name: "Resources_Pack.zip",         size: "85 MB",   ext: "ZIP",  type: "ARCHIVE", duration: null,   thumb: null },
  { id: 7, name: "Hero_Background.jpg",        size: "3.1 MB",  ext: "JPG",  type: "IMAGE",   duration: null,   thumb: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80" },
];

const FILE_ICONS = {
  PDF:     { bg: "bg-blue-100",   icon: "📄", color: "text-blue-600"   },
  AUDIO:   { bg: "bg-purple-100", icon: "🎵", color: "text-purple-600" },
  ARCHIVE: { bg: "bg-orange-100", icon: "🗂️", color: "text-orange-600" },
  VIDEO:   { bg: "bg-red-100",    icon: "🎬", color: "text-red-600"    },
  IMAGE:   { bg: "bg-green-100",  icon: "🖼️", color: "text-green-600"  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────────
function getAssetType(file) {
  const t = file.type;
  if (t.startsWith("image/")) return "IMAGE";
  if (t.startsWith("video/")) return "VIDEO";
  if (t.startsWith("audio/")) return "AUDIO";
  if (t === "application/pdf") return "PDF";
  return "ARCHIVE";
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
          <div className={`w-9 h-9 rounded-lg ${fi.bg} flex items-center justify-center text-base flex-shrink-0`}>{fi.icon}</div>
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

// ─── AssetCard ─────────────────────────────────────────────────────────────────
function AssetCard({ asset, onDeleteRequest, viewMode, selected, onSelect }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const c = TYPE_COLORS[asset.type] || TYPE_COLORS.IMAGE;
  const fi = FILE_ICONS[asset.type] || FILE_ICONS.IMAGE;

  if (viewMode === "list") {
    return (
      <div className={`flex items-center gap-4 bg-white border rounded-xl px-4 py-3 hover:shadow-sm transition group ${selected ? "border-red-200 bg-red-50/30" : "border-gray-100 hover:border-gray-200"}`}>
        {/* Checkbox */}
        <button onClick={() => onSelect(asset.id)} className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition ${selected ? "bg-red-500 border-red-500" : "border-gray-300 hover:border-red-400"}`}>
          {selected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
        </button>
        <div className={`w-10 h-10 rounded-lg ${fi.bg} flex items-center justify-center text-lg flex-shrink-0`}>{fi.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{asset.name}</p>
          <p className="text-xs text-gray-400">{asset.size} • {asset.ext}</p>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>{asset.type}</span>
        {/* 3-dot menu */}
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-20 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 w-40" onMouseLeave={() => setMenuOpen(false)}>
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download
              </button>
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Copy Link
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => { onDeleteRequest(asset); setMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 group relative ${selected ? "border-red-300 ring-2 ring-red-200" : "border-gray-100 hover:border-gray-200"}`}>
      {/* Checkbox overlay */}
      <button
        onClick={() => onSelect(asset.id)}
        className={`absolute top-2.5 right-2.5 z-10 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${
          selected ? "bg-red-500 border-red-500 opacity-100" : "bg-white/80 border-gray-300 opacity-0 group-hover:opacity-100"
        }`}
      >
        {selected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
      </button>

      {/* Thumbnail */}
      <div className="relative h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
        {asset.thumb ? (
          <img src={asset.thumb} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className={`w-16 h-16 rounded-2xl ${fi.bg} flex items-center justify-center text-3xl`}>{fi.icon}</div>
        )}
        <span className={`absolute top-2.5 left-2.5 text-xs font-bold px-2 py-0.5 rounded-md ${c.bg} ${c.text} tracking-wide`}>{asset.type}</span>
        {asset.duration && (
          <span className="absolute bottom-2 right-2 text-xs font-semibold bg-black/60 text-white px-1.5 py-0.5 rounded-md">{asset.duration}</span>
        )}
      </div>

      {/* Info row */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-800 truncate">{asset.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{asset.size} • {asset.ext}</p>
        </div>
        <div className="relative flex-shrink-0 ml-1">
          <button onClick={() => setMenuOpen(!menuOpen)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 bottom-9 z-20 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 w-40" onMouseLeave={() => setMenuOpen(false)}>
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download
              </button>
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Copy Link
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => { onDeleteRequest(asset); setMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition font-medium"
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
function UploadFileRow({ file, onCancel }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const fi = FILE_ICONS[getAssetType(file)] || FILE_ICONS.IMAGE;

  useEffect(() => {
    const speed = Math.random() * 15 + 8;
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + speed * (Math.random() * 0.5 + 0.75);
        if (next >= 100) { clearInterval(interval); setDone(true); return 100; }
        return next;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-9 h-9 rounded-lg ${fi.bg} flex items-center justify-center text-base flex-shrink-0`}>{fi.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
          <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
        </div>
        <span className={`text-sm font-bold ${done ? "text-green-500" : "text-green-500"}`}>{Math.round(progress)}%</span>
        <button onClick={() => onCancel(file.name)} className="w-6 h-6 rounded-full bg-gray-200 hover:bg-red-100 flex items-center justify-center transition">
          <svg className="w-3 h-3 text-gray-500 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// ─── Upload Modal ───────────────────────────────────────────────────────────────
function UploadModal({ open, onClose, onUploadComplete }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [allDone, setAllDone] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    if (!open) { setUploadFiles([]); setAllDone(false); }
  }, [open]);

  useEffect(() => {
    if (uploadFiles.length > 0) {
      const timer = setTimeout(() => setAllDone(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadFiles]);

  const handleFiles = (files) => {
    const valid = Array.from(files).filter((f) => f.size <= 25 * 1024 * 1024);
    const oversized = Array.from(files).filter((f) => f.size > 25 * 1024 * 1024);
    if (oversized.length) toast.error(`${oversized.length} file(s) exceed 25MB limit`);
    if (valid.length) setUploadFiles((prev) => [...prev, ...valid]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDone = () => {
    onUploadComplete(uploadFiles);
    onClose();
    toast.success(`${uploadFiles.length} file(s) uploaded successfully!`);
  };

  const totalRemaining = uploadFiles.reduce((acc, f) => acc + f.size, 0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4"
        style={{ animation: "popIn 0.25s ease" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Upload Assets</h3>
            <p className="text-sm text-gray-400 mt-0.5">Max file size 25MB</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition text-xl">×</button>
        </div>

        <div className="px-6 pb-6">
          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 transition-all duration-200 mb-5 ${
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
              <p className="text-sm text-gray-400 mt-0.5">Files up to 25MB supported (MP4, PNG, JPG, PDF)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.zip,.rar"
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
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                {uploadFiles.length} FILES UPLOADING ({formatBytes(totalRemaining)} REMAINING)
              </p>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {uploadFiles.map((file, idx) => (
                  <UploadFileRow
                    key={`${file.name}-${idx}`}
                    file={file}
                    onCancel={(name) => setUploadFiles((prev) => prev.filter((f) => f.name !== name))}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setUploadFiles([])}
              className="px-5 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition"
            >
              Cancel All
            </button>
            <button
              onClick={handleDone}
              disabled={uploadFiles.length === 0}
              className={`px-6 py-2 text-sm font-semibold rounded-xl transition ${
                uploadFiles.length > 0 && allDone
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Done
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
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [search, setSearch] = useState("");
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [showUpload, setShowUpload] = useState(false);
  const [nextId, setNextId] = useState(100);
  const [deleteTarget, setDeleteTarget] = useState(null);   // asset to confirm delete
  const [selectedIds, setSelectedIds] = useState([]);        // bulk selection

  const handleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map((a) => a.id));
  };

  const handleDeleteConfirm = () => {
    setAssets((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    toast.success(`"${deleteTarget.name}" deleted successfully`);
    setDeleteTarget(null);
  };

  const handleBulkDelete = () => {
    const count = selectedIds.length;
    setAssets((prev) => prev.filter((a) => !selectedIds.includes(a.id)));
    setSelectedIds([]);
    toast.success(`${count} asset${count > 1 ? "s" : ""} deleted`);
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

  const handleUploadComplete = (files) => {
    const newAssets = Array.from(files).map((file, i) => ({
      id: nextId + i,
      name: file.name,
      size: formatBytes(file.size),
      ext: file.name.split(".").pop().toUpperCase(),
      type: getAssetType(file),
      duration: null,
      thumb: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));
    setAssets((prev) => [...newAssets, ...prev]);
    setNextId((n) => n + files.length);
  };

  // Storage usage mock
  const storageUsed = 42;
  const totalAssets = 142;

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
      />

      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 p-6">

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Media Gallery</h1>
              <p className="text-sm text-gray-400 mt-0.5">Manage all digital assets for your WhatsApp campaigns</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Find assets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition w-56"
                />
              </div>
              {/* Upload button */}
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl shadow-sm transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Media
              </button>
            </div>
          </div>

          {/* Tabs + View toggle */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-1 border-b border-gray-200 w-full">
              <div className="flex gap-1 flex-1">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-semibold transition-all relative whitespace-nowrap ${
                      activeTab === tab
                        ? "text-gray-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-green-500 after:rounded-t"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {/* Grid / List toggle */}
              <div className="flex items-center gap-1 pb-2 flex-shrink-0">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition ${viewMode === "grid" ? "bg-gray-100 text-gray-700" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition ${viewMode === "list" ? "bg-gray-100 text-gray-700" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* ── Bulk action bar ── */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-4" style={{ animation: "fadeUp 0.2s ease" }}>
              <div className="flex items-center gap-3">
                <button onClick={handleSelectAll} className="text-xs font-semibold text-red-600 hover:text-red-700 underline underline-offset-2 transition">
                  {selectedIds.length === filtered.length ? "Deselect All" : "Select All"}
                </button>
                <span className="text-sm font-semibold text-red-700">{selectedIds.length} asset{selectedIds.length > 1 ? "s" : ""} selected</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedIds([])} className="px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Delete {selectedIds.length} selected
                </button>
              </div>
            </div>
          )}

          {/* Assets Grid / List */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-4 gap-4" style={{ animation: "fadeUp 0.3s ease" }}>
              {/* New Asset card — always first */}
              <NewAssetCard onClick={() => setShowUpload(true)} />
              {filtered.map((asset) => (
                <AssetCard key={asset.id} asset={asset} onDeleteRequest={setDeleteTarget} viewMode="grid" selected={selectedIds.includes(asset.id)} onSelect={handleSelect} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2" style={{ animation: "fadeUp 0.3s ease" }}>
              {filtered.map((asset) => (
                <AssetCard key={asset.id} asset={asset} onDeleteRequest={setDeleteTarget} viewMode="list" selected={selectedIds.includes(asset.id)} onSelect={handleSelect} />
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-lg font-semibold">No assets found</p>
                  <p className="text-sm mt-1">Try a different search or upload new files</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}