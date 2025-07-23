import * as React from "react";
import Drawer from "@mui/material/Drawer";

export function ActionCell({ userRow }) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleOpenDrawer = () => {
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  return (
    <div>
      <button onClick={handleOpenDrawer}>Open Drawer</button>
      <Drawer anchor="right" open={drawerOpen} onClose={handleCloseDrawer}>
        <div>
          <p>Information</p>
          {userRow.name}
        </div>
      </Drawer>
    </div>
  );
}
