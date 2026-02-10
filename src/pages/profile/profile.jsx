import MainSidebar from "../../components/mainsidebar/MainSidebar";
import FirstHeader from "../../components/header/FirstHeader";
import MainHeading from "../../components/header/MainHeading";
import SecondrySidebar from "../../components/mainsidebar/secondrysidebar/SecondrySidebar";
import { Outlet } from "react-router-dom";

import {
  AppstoreOutlined,
  UserOutlined,
  LogoutOutlined,
  PartitionOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const Profile = () => {
  return (
    <div className="flex w-full min-h-screen">
      {/* MAIN SIDEBAR */}
      <MainSidebar />

      {/* SECONDARY SIDEBAR */}
      <SecondrySidebar
        heading="Profile"
        items={items}
        customNavigate={`/admin/profile/`}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 bg-[#fafafa] pl-6 pt-4">
        <FirstHeader />
        <MainHeading />
        <Outlet />
      </div>
    </div>
  );
};

export default Profile;

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}

const items = [
  getItem(
    "Profile Information",
    "sub1",
    null,
    [
      getItem("User Profile", "user/:id", <UserOutlined />),
      getItem(
        "Business Profile",
        "business-profile/:id",
        <PartitionOutlined />
      ),
    ],
    "group"
  ),
  getItem(
    "Plan & Subscription",
    "P&S",
    null,
    [
      getItem("Upgrade Plan", "upgrade-plans", <AppstoreOutlined />),
      getItem("Add-Ons Plans", "active-plans", <DollarOutlined />),
    ],
    "group"
  ),
  getItem("Log Out", "log-out", <LogoutOutlined />),
];
