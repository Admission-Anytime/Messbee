import React, { useState } from "react";
import TableData from "./TableData";
import OpenDrawer from "../../components/Drawer/Drawer";
import { SubHeading } from "../../components/header/SubHeading";
import YellowButton from "../../components/button/buttonReg/yellowButton";
// Removed: import MainSidebar ...
// Removed: import "./contact.scss"; (Assuming scss was mainly for layout, but keep if it has specific styles for table/buttons)

const Contact = () => {
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    // The main container now takes full height/width provided by the Outlet
    <div className="w-full h-full flex flex-col bg-slate-50 overflow-hidden font-['Urbanist']">
      
      {/* Header Section */}
      <div className="p-6 pb-0 shrink-0">
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

      {/* Table Section */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full overflow-hidden">
           <TableData />
        </div>
      </div>

    </div>
  );
};

export default Contact;