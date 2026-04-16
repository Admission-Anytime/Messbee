import React from "react";
import { Outlet } from "react-router-dom";
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  CreditCardIcon, 
  ArrowRightOnRectangleIcon 
} from "@heroicons/react/24/outline";

// ✅ FIXED IMPORT: Points to your secondary sidebar
import SecondrySidebar from "../../components/mainsidebar/secondrysidebar/SecondrySidebar"; 

// ❌ REMOVED: MainSidebar (Fixes double sidebar)
// ❌ REMOVED: SCSS (Using Tailwind)

const PROFILE_MENU_ITEMS = [
  {
    id: "info",
    label: "Profile Information",
    icon: <UserIcon className="w-5 h-5" />,
    children: [
      { label: "User Profile", path: "/admin/profile/info" },
      { label: "Business Profile", path: "/admin/profile/business" },
    ]
  },
  {
    id: "plan",
    label: "Plan & Subscription",
    icon: <CreditCardIcon className="w-5 h-5" />,
    children: [
      { label: "Upgrade Plan", path: "/admin/plan" },
      { label: "Billing History", path: "/admin/plan/billing" },
    ]
  },
  {
    id: "logout",
    label: "Log Out",
    path: "/login",
    icon: <ArrowRightOnRectangleIcon className="w-5 h-5" />
  }
];

const Profile = () => {
  return (
    // Layout Container
    <div className="flex w-full h-full bg-slate-50 font-['Urbanist'] overflow-hidden">
      
      {/* LEFT: Secondary Sidebar */}
      <div className="h-full shrink-0 border-r border-slate-200 bg-white">
         <SecondrySidebar 
            title="Profile" 
            menuItems={PROFILE_MENU_ITEMS} 
         />
      </div>

      {/* RIGHT: Content Area */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="max-w-5xl mx-auto">
           {/* This is where UserProfile or BusinessProfile will appear */}
           <Outlet />
        </div>
      </div>

    </div>
  );
};

export default Profile;