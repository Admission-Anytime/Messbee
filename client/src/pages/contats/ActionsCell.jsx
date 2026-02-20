import { useState, useRef, useEffect } from "react";
import {
  EllipsisVerticalIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

/* ─── Three-dot menu ─────────────────────────────────────────────────────────── */
export function ThreeDotMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const menuItems = [
    { label: "View Contact", Icon: EyeIcon,         cls: "text-gray-700 hover:bg-gray-50" },
    { label: "Edit",         Icon: PencilSquareIcon, cls: "text-gray-700 hover:bg-gray-50" },
    { label: "Delete",       Icon: TrashIcon,        cls: "text-red-600  hover:bg-red-50"  },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
      >
        <EllipsisVerticalIcon className="w-5 h-5" />
      </button>
      {open && (
        <div className="absolute right-0 top-[110%] bg-white border border-gray-200 rounded-xl shadow-lg z-[300] min-w-[160px] overflow-hidden py-1">
          {menuItems.map(({ label, Icon, cls }) => (
            <button
              key={label}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${cls}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}