import React, { useState } from "react";
import TableData from "./TableData";
import OpenDrawer from "../../components/Drawer/Drawer";
import { SubHeading } from "../../components/header/SubHeading";
import YellowButton from "../../components/button/buttonReg/yellowButton";

const Contact = () => {
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 overflow-hidden font-['Urbanist']">

      {/* Header */}
      <div className="p-4 shrink-0">
        <SubHeading title="Contact & CRM">
          <div className="flex gap-3">
            <YellowButton title="IMPORT CONTACT" padding="0.8rem 0.7rem" />
            <YellowButton
              title="ADD CONTACT"
              padding="0.8rem 0.7rem"
              onDrawerOpen={handleDrawerOpen}
            />
          </div>
          <OpenDrawer title="Add Contact" onClose={onClose} open={open} />
        </SubHeading>
      </div>

      {/* Table wrapper */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full overflow-hidden">
          <TableData />
        </div>
      </div>

    </div>
  );
};

export default Contact;
