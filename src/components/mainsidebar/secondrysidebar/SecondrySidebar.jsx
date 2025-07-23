import "./secondrysidebar.scss";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Menu } from "antd";

const rootSubmenuKeys = ["sub1", "sub2", "sub4"];
// eslint-disable-next-line react/prop-types
const SecondrySidebar = ({ heading, items, customNavigate }) => {
  const [openKeys, setOpenKeys] = useState(["sub1"]);
  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (latestOpenKey && rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };
  const navigate = useNavigate();
  function handelClick(key) {
    if (key == "log-out") {
      return console.log("log-out");
    }
    return navigate(`${customNavigate}${key}`);
  }

  return (
    <div className="sec-container">
      <h2 className="profile-heading">{heading}</h2>
      <hr />
      <Menu
        mode="inline"
        openKeys={openKeys}
        onClick={(info) => handelClick(info.key)}
        onOpenChange={onOpenChange}
        style={{
          width: 256,
        }}
        items={items}
        defaultOpenKeys={["sub1"]}
      />
    </div>
  );
};

export default SecondrySidebar;
