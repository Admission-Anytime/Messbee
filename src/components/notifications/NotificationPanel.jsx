import { useState } from "react";
import { X } from "lucide-react";

const NotificationPanel = ({
  open,
  onClose,
  data,
  markAllRead,
  markSingleRead,
  unreadCount,
}) => {
  const [tab, setTab] = useState("all");
  const [showUnread, setShowUnread] = useState(false);

  if (!open) return null;

  const filtered = data.filter((n) => {
    if (tab === "mentions" && !n.mention) return false;
    if (showUnread && n.read) return false;
    return true;
  });

  return (
    <div className="fixed top-[70px] left-[90px] w-[360px] bg-white rounded-xl shadow-2xl z-[100] animate-slideIn">

      {/* HEADER */}
      <div className="px-4 py-3 border-b">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">
            Notifications ({unreadCount})
          </h3>

          <div className="flex gap-3 items-center">
            <button
              onClick={markAllRead}
              className="text-sm font-semibold text-red-600 hover:underline"
            >
              Mark all as read
            </button>

            <X
              onClick={onClose}
              className="cursor-pointer"
              size={18}
            />
          </div>
        </div>

        {/* TABS + FILTER */}
        <div className="flex gap-4 mt-3 text-sm font-semibold">
          <button
            onClick={() => setTab("all")}
            className={`pb-1 ${
              tab === "all"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-400"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setTab("mentions")}
            className={`pb-1 ${
              tab === "mentions"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-400"
            }`}
          >
            Mentions
          </button>

          <button
            onClick={() => setShowUnread(!showUnread)}
            className={`ml-auto text-xs px-2 py-1 rounded ${
              showUnread
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="max-h-[420px] overflow-y-auto">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => markSingleRead(item.id)}
            className={`px-4 py-3 border-b cursor-pointer transition ${
              item.read
                ? "bg-white text-gray-500"
                : "bg-indigo-50 font-semibold"
            }`}
          >
            <h4 className="text-sm">{item.title}</h4>
            <p className="text-xs text-gray-600 mt-1">
              {item.desc}
            </p>
            <span className="text-[11px] text-gray-400">
              {item.time}
            </span>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-center py-6 text-sm text-gray-400">
            No notifications
          </p>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
