import MainSidebar from "../../components/mainsidebar/MainSidebar";
import "./contact.scss";
import TableData from "./TableData";
import OpenDrawer from "../../components/Drawer/Drawer";
import { useState } from "react";
import { SubHeading } from "../../components/header/SubHeading";
import YellowButton from "../../components/button/buttonReg/yellowButton";

const contact = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [open, setOpen] = useState(false);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  return (
    <div className="main">
      <MainSidebar />
      <div className="body">
        <div className="contact-container">
          <SubHeading title="Contact & CRM">
            <YellowButton title="IMPORT CONTACT" padding="0.8rem 0.7rem" />
            <YellowButton
              title="ADD CONTACT"
              padding="0.8rem 0.7rem"
              onDrawerOpen={handleDrawerOpen}
            />
            <OpenDrawer title="Add Contact" onClose={onClose} open={open} />
          </SubHeading>
          <div className="contact-table">
            <TableData />
          </div>
        </div>
      </div>
    </div>
  );
};

export default contact;
