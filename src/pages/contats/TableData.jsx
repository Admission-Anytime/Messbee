// eslint-disable-next-line no-unused-vars
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import { userColomn, userRow } from "./dataSources";
import "./TableData.scss";

export default function TabelData() {
  return (
    <Box sx={{ height: "88vh", width: "93vw" }}>
      <DataGrid
        rowHeight={35}
        rows={userRow}
        columns={userColomn}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 15,
            },
          },
        }}
        pageSizeOptions={[15]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Box>
  );
}
