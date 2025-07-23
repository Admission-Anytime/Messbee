import MainSidebar from "../../components/mainsidebar/MainSidebar";
import FirstHeader from "../../components/header/FirstHeader";
import MainHeading from "../../components/header/MainHeading";
import "./profile.scss";
import SecondrySidebar from "../../components/mainsidebar/secondrysidebar/SecondrySidebar";
import { Outlet } from "react-router-dom";
import {
  AppstoreOutlined,
  UserOutlined,
  LogoutOutlined,
  PartitionOutlined,
  DollarOutlined,
  // eslint-disable-next-line no-unused-vars
  CrownOutlined,
} from "@ant-design/icons";

const profile = () => {
  return (
    <div className="main">
      <MainSidebar />
      <SecondrySidebar
        heading="Profile"
        items={items}
        customNavigate={`/admin/profile/`}
      />
      <div className="body-profile">
        <FirstHeader />
        <MainHeading />
        <Outlet />
      </div>
    </div>
  );
};

export default profile;

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
      // getItem("Active Plans", "active-plans", <CrownOutlined />),
    ],
    "group"
  ),
  getItem("Log Out", "log-out", <LogoutOutlined />),
];
