import MainSidebar from "../../components/mainsidebar/MainSidebar";
import "./help.scss";
import SecondrySidebar from "../../components/mainsidebar/secondrysidebar/SecondrySidebar";
import { Outlet } from "react-router-dom";

const help = () => {
  return (
    <div className="main">
      <MainSidebar />
      <div className="body">
        <div className="left">
          <SecondrySidebar
            heading="Help Center"
            items={items}
            customNavigate={`/admin/help/`}
          />
        </div>
        <div className="right">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default help;

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
  getItem("Introduction ", "introduction", null),
  getItem(
    "Contacts",
    "sub2",
    null,
    [
      getItem("Labels Plan", "labels"),
      getItem("Custom Fields", "custom-fields"),
      getItem("Status", "status"),
      getItem("Quick Reply", "quick-reply"),
    ],
    "group"
  ),
  getItem(
    "API & Integration",
    "sub3",
    null,
    [
      getItem("Developers API", "dev-api/:id"),
      getItem("App Integration", "app/:id"),
    ],
    "group"
  ),
];
