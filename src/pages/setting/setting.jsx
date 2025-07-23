import MainSidebar from "../../components/mainsidebar/MainSidebar";
import FirstHeader from "../../components/header/FirstHeader";
import MainHeading from "../../components/header/MainHeading";
import "./setting.scss";
import { Outlet } from "react-router-dom";
import SecondrySidebar from "../../components/mainsidebar/secondrysidebar/SecondrySidebar";
import {
  AppstoreOutlined,
  WhatsAppOutlined,
  ClusterOutlined,
  FileImageOutlined,
  PartitionOutlined,
  DollarOutlined,
  ReconciliationOutlined,
  PullRequestOutlined,
  ThunderboltOutlined,
  ProjectOutlined,
} from "@ant-design/icons";

const setting = () => {
  return (
    <div className="main">
      <MainSidebar />
      <SecondrySidebar
        heading="Setting"
        items={items}
        customNavigate={`/admin/setting/`}
      />
      <div className="body">
        <FirstHeader></FirstHeader>
        <MainHeading></MainHeading>
        <Outlet />
      </div>
    </div>
  );
};

export default setting;

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}

export const items = [
  getItem(
    "Organization ",
    "sub1",
    null,
    [
      getItem("WhatsApp Api No.", "wapi", <WhatsAppOutlined />),
      getItem("Templates", "templates", <PartitionOutlined />),
      getItem("Template Gallery", "templates-gallery", <ClusterOutlined />),
      getItem("Media", "media", <FileImageOutlined />),
    ],
    "group"
  ),
  getItem(
    "Contacts",
    "sub2",
    null,
    [
      getItem("Labels Plan", "labels", <ReconciliationOutlined />),
      getItem("Custom Fields", "custom-fields", <PullRequestOutlined />),
      getItem("Status", "status", <ProjectOutlined />),
      getItem("Quick Reply", "quick-reply", <ThunderboltOutlined />),
    ],
    "group"
  ),
  getItem(
    "API & Integration",
    "sub3",
    null,
    [getItem("Developers API", "dev-api/:id", <AppstoreOutlined />)],
    "group"
  ),
];
