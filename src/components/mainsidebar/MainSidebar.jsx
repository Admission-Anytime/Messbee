import "./MainSidebar.scss";
import { Link, useLocation } from "react-router-dom";
import IconFrame from "../iconfram/IconFram";
import logo from "../../assets/logo.svg";
import icon from "./assets/Chat.svg";
import contacts from "./assets/contacts.svg";
import campaign from "./assets/campaign.svg";
import automatin from "./assets/automation.svg";
import analytic from "./assets/analys.svg";
import setting from "./assets/Setting.svg";
import help from "./assets/help.svg";

const MainSidebar = () => {
  const profileName = "AB";
  const location = useLocation();
  return (
    <div className="mainSideBar">
      <Link to="/" location={location}>
        <img className="logo" src={logo} />
      </Link>
      <Link to="/admin/profile/user/:id" location={location}>
        <div className="profile">
          <p>{profileName}</p>
        </div>
      </Link>
      <div className="menuContener">
        <Link to="/admin/chat" location={location}>
          <IconFrame
            title="Chat"
            src={icon}
            alt={"chat icon"}
            url={"/admin/chat"}
          />
        </Link>
        <Link to="/admin/contact" location={location}>
          <IconFrame title="Contacts" src={contacts} alt={"chat icon"} />
        </Link>
        <Link to="/admin/campaign" location={location}>
          <IconFrame title="Campaign" src={campaign} alt={"chat icon"} />
        </Link>
        <Link to="/admin/automation" location={location}>
          <IconFrame title="Automation" src={automatin} alt={"chat icon"} />
        </Link>
      </div>
      <div className="menuContener1">
        <Link to="/admin/analytic" location={location}>
          <IconFrame title="Analytics" src={analytic} alt={"chat icon"} />
        </Link>

        <Link to="/admin/setting" location={location}>
          <IconFrame title="Settings" src={setting} alt={"chat icon"} />
        </Link>
        <Link to="/admin/help/introduction" location={location}>
          <IconFrame title="Help" src={help} alt={"chat icon"} />
        </Link>
      </div>
    </div>
  );
};

export default MainSidebar;
