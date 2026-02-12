import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { SubHeading } from "../../components/header/SubHeading";
import YellowButton from "../../components/button/buttonReg/yellowButton";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import { useRowsApi, userColomnsCamp } from "./CampaignTable";
import { useNavigate } from "react-router-dom";

// ❌ REMOVED: import "./campaign.scss"; 
// ❌ REMOVED: import MainSidebar ...

const Campaign = () => {
  const rows = useRowsApi();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/admin/campaign/create");
  };

  return (
    // .main -> flex w-full h-full bg-slate-50
    <div className="flex w-full h-full bg-slate-50 font-['Urbanist'] overflow-hidden">
      
      {/* .body -> flex-1 flex flex-col w-full */}
      <div className="flex-1 flex flex-col w-full h-full">
        
        {/* Header Section */}
        <div className="p-6 shrink-0">
          <SubHeading title="Campaign">
            <YellowButton
              title="ADD CAMPAIGN"
              padding="0.8rem 0.7rem"
              onClick={handleClick}
            />
          </SubHeading>
        </div>

        {/* Data Grid Section */}
        <div className="flex-1 px-6 pb-6 w-full overflow-hidden">
          <Box
            sx={{
              height: "100%",
              width: "100%",
              bgcolor: "white",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              "& .MuiDataGrid-root": {
                border: "none",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid #f1f5f9",
                fontFamily: "Urbanist",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
                fontFamily: "Urbanist",
                fontWeight: 700,
                color: "#475569",
              },
            }}
          >
            <DataGrid
              columns={userColomnsCamp}
              rows={rows}
              rowHeight={50}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 15,
                  },
                },
              }}
              pageSizeOptions={[15, 25, 50]}
              disableRowSelectionOnClick
            />
          </Box>
        </div>
      </div>
    </div>
  );
};

export default Campaign;