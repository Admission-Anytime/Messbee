import MainSidebar from "../../components/mainsidebar/MainSidebar";
import FirstHeader from "../../components/header/FirstHeader";
import MainHeading from "../../components/header/MainHeading";
import "./setting.scss";
import { Outlet } from "react-router-dom";
import SecondrySidebar from "../../components/mainsidebar/secondrysidebar/SecondrySidebar";
import {
  Grid3x3,
  MessageCircle,
  Layers,
  FileImage,
  Split,
  DollarSign,
  FileCheck,
  GitPullRequest,
  Zap,
  FolderKanban,
} from "lucide-react";

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
      getItem("WhatsApp Api No.", "wapi", <MessageCircle className="w-4 h-4" />),
      getItem("Onboarding", "onboarding", <FolderKanban className="w-4 h-4" />),
      getItem("Templates", "templates", <Split className="w-4 h-4" />),
      getItem("Template Gallery", "templates-gallery", <Layers className="w-4 h-4" />),
      getItem("Media", "media", <FileImage className="w-4 h-4" />),
    ],
    "group"
  ),
  getItem(
    "Contacts",
    "sub2",
    null,
    [
      getItem("Labels Plan", "labels", <FileCheck className="w-4 h-4" />),
      getItem("Custom Fields", "custom-fields", <GitPullRequest className="w-4 h-4" />),
      getItem("Status", "status", <FolderKanban className="w-4 h-4" />),
      getItem("Quick Reply", "quick-reply", <Zap className="w-4 h-4" />),
    ],
    "group"
  ),
  getItem(
    "API & Integration",
    "sub3",
    null,
    [getItem("Developers API", "dev-api/:id", <Grid3x3 className="w-4 h-4" />)],
    "group"
  ),
];
