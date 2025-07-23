import { useState } from "react";
import { AppstoreOutlined, MailOutlined, FundFilled } from "@ant-design/icons";
import { Menu } from "antd";
import "./infobox.scss";
import Divider from "@mui/material/Divider";

const rootSubmenuKeys = ["sub1", "sub2", "sub4"];
const Infobox = () => {
  const [openKeys, setOpenKeys] = useState(["sub1"]);
  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (latestOpenKey && rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };
  return (
    <div className="info-container">
      <div className="heading">
        <h2 id="heading">Chat</h2>
      </div>
      <Divider />
      <div className="menu">
        <Menu
          mode="inline"
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          style={{}}
          items={items}
        />
      </div>
    </div>
  );
};

export default Infobox;

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
  getItem("Inbox One", "sub1", <MailOutlined />, [
    getItem("All Chat", "1"),
    getItem("My Chat", "2"),
    getItem("Unassigned", "3"),
    getItem("Pinned Chats", "4"),
    getItem("Blocked Chats", "5"),
  ]),
  getItem("Wp API Number", "sub2", <AppstoreOutlined />, [
    getItem("Admission Any time", "6"),
  ]),
  getItem("Status", "sub4", <FundFilled />, []),
  getItem("Labels", "sub5", <FundFilled />, [getItem("hot call", "7")]),
];
