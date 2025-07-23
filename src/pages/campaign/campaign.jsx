// eslint-disable-next-line no-unused-vars
import CssBaseline from "@mui/material/CssBaseline";
import MainSidebar from "../../components/mainsidebar/MainSidebar";
import "./campaign.scss";
import { SubHeading } from "../../components/header/SubHeading";
import YellowButton from "../../components/button/buttonReg/yellowButton";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";

import { useRowsApi, userColomnsCamp } from "./CampaignTable";
import { useNavigate } from "react-router-dom";

const campaign = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const rows = useRowsApi();
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/admin/campaign-create");
  };
  return (
    <div className="main">
      <MainSidebar />
      <div
        className="body"
        style={{
          width: "100%",
          height: "100vh",
        }}
      >
        <SubHeading title="Campaign">
          <YellowButton
            title="ADD CAMPAIGN"
            padding="0.8rem 0.7rem"
            onClick={handleClick}
          />
        </SubHeading>
        <div
          className="data-table-body"
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "10px",
            justifyContent: "center",
          }}
        >
          <Box sx={{ height: "88vh", width: "93vw" }}>
            <DataGrid
              columns={userColomnsCamp}
              rows={rows}
              rowHeight={35}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 15,
                  },
                },
              }}
              pageSizeOptions={[15]}
              disableRowSelectionOnClick
            />
          </Box>
        </div>
      </div>
    </div>
  );
};

export default campaign;
