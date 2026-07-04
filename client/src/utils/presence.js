const ONLINE_WINDOW_MS = 2 * 60 * 1000;

const resolveDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getPresenceTimestamp = (chat) => {
  const candidate =
    chat?.lastInboundAt ||
    chat?.lastActivity ||
    chat?.lastSeen ||
    chat?.lastSeenAt ||
    chat?.updatedAt ||
    null;

  return resolveDate(candidate);
};

const formatLastSeenRelative = (date, nowMs) => {
  const diffMs = Math.max(0, nowMs - date.getTime());
  const minutes = Math.floor(diffMs / (60 * 1000));

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const now = new Date(nowMs);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) {
    return `yesterday ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}`;
  }

  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const getPresenceInfo = (chat, nowMs = Date.now()) => {
  const lastSeenDate = getPresenceTimestamp(chat);
  const isOnline =
    !!lastSeenDate && nowMs - lastSeenDate.getTime() <= ONLINE_WINDOW_MS;

  if (isOnline) {
    return {
      isOnline: true,
      status: "online",
      lastSeenDate,
      lastSeenAt: lastSeenDate?.toISOString?.() || null,
      label: "Online",
    };
  }

  if (lastSeenDate) {
    return {
      isOnline: false,
      status: "offline",
      lastSeenDate,
      lastSeenAt: lastSeenDate.toISOString(),
      label: `Last seen ${formatLastSeenRelative(lastSeenDate, nowMs)}`,
    };
  }

  return {
    isOnline: false,
    status: "offline",
    lastSeenDate: null,
    lastSeenAt: null,
    label: "Offline",
  };
};

export { ONLINE_WINDOW_MS };
