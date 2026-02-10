import { Bell } from "lucide-react";
import { useState } from "react";
import NotificationPanel from "../notifications/NotificationPanel";

import { Link, useLocation } from "react-router-dom";
import IconFrame from "../iconfram/IconFram";
import logo from "../../assets/logo.svg";
import {
  MessageCircle,
  Users,
  Megaphone,
  BarChart3,
  Settings,
  HelpCircle,
} from "lucide-react";

const MainSidebar = () => {
  const profileName = "AB";
  const location = useLocation();

  const [openNotification, setOpenNotification] = useState(false);

  // 🔥 EXTENDED DUMMY DATA
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Mentioned by Admin",
      desc: "@AB check campaign status",
      time: "Just now",
      read: false,
      mention: true,
    },
    {
      id: 2,
      title: "New Lead Assigned",
      desc: "You got a new contact",
      time: "5 min ago",
      read: false,
      mention: false,
    },
    {
      id: 3,
      title: "Campaign Approved",
      desc: "WhatsApp blast activated",
      time: "20 min ago",
      read: false,
      mention: false,
    },
    {
      id: 4,
      title: "Payment Successful",
      desc: "₹999 credited to wallet",
      time: "1 hour ago",
      read: true,
      mention: false,
    },
    {
      id: 5,
      title: "Mention in Group",
      desc: "@AB please review stats",
      time: "Yesterday",
      read: true,
      mention: true,
    },
    {
      id: 6,
      title: "Automation Triggered",
      desc: "Welcome flow sent",
      time: "2 days ago",
      read: true,
      mention: false,
    },
    {
      id: 7,
      title: "Subscription Expiring",
      desc: "Renew in 2 days",
      time: "3 days ago",
      read: false,
      mention: false,
    },
    {
      id: 8,
      title: "Template Approved",
      desc: "Marketing template live",
      time: "Last week",
      read: true,
      mention: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  const markSingleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  return (
    <>
      <NotificationPanel
        open={openNotification}
        onClose={() => setOpenNotification(false)}
        data={notifications}
        markAllRead={markAllRead}
        markSingleRead={markSingleRead}
        unreadCount={unreadCount}
      />

      {/* SIDEBAR */}
      <div className="w-[90px] bg-white h-screen flex flex-col items-center py-4 border-r">

        <Link to="/" location={location}>
          <img src={logo} className="w-10 mb-6" />
        </Link>

        <Link to="/admin/profile/user/:id">
          <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold mb-4">
            {profileName}
          </div>
        </Link>

        {/* 🔔 Bell */}
        <div
          onClick={() => setOpenNotification(true)}
          className="relative cursor-pointer mb-6 hover:text-red-600"
        >
          <Bell size={22} />

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Link to="/admin/chat">
            <IconFrame title="Chat" icon={MessageCircle} />
          </Link>

          <Link to="/admin/contact">
            <IconFrame title="Contacts" icon={Users} />
          </Link>

          <Link to="/admin/campaign">
            <IconFrame title="Campaign" icon={Megaphone} />
          </Link>

          <Link to="/admin/automation">
            <IconFrame title="Automation" icon={BarChart3} />
          </Link>
        </div>

        <div className="flex flex-col gap-6 mt-auto mb-4">
          <Link to="/admin/analytic">
            <IconFrame title="Analytics" icon={BarChart3} />
          </Link>

          <Link to="/admin/setting">
            <IconFrame title="Settings" icon={Settings} />
          </Link>

          <Link to="/admin/help/introduction">
            <IconFrame title="Help" icon={HelpCircle} />
          </Link>
        </div>
      </div>
    </>
  );
};

export default MainSidebar;
