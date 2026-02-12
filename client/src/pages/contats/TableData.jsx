import React, { useMemo, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { MenuItem, Select, Box } from "@mui/material";

const statuses = ["Active", "Inactive", "Pending", "Warm", "Cold"];

const rowsData = Array.from({ length: 120 }).map((_, i) => ({
  id: i + 1,
  name: `Lead ${i + 1}`,
  email: `lead${i + 1}@mail.com`,
  phone: `99999111${i}`,
  whatsapp: `+91 88888${1000 + i}`,
  company: `Company ${i % 10}`,
  status: statuses[i % statuses.length],
  source: ["Website", "Referral", "Ads"][i % 3],
  owner: `Sales ${i % 5}`,
}));

const STATUS_COLORS = {
  Active: { bg: "#bbf7d0", text: "#166534" },
  Inactive: { bg: "#fecaca", text: "#991b1b" },
  Pending: { bg: "#fef08a", text: "#854d0e" },
  Warm: { bg: "#fed7aa", text: "#9a3412" },
  Cold: { bg: "#bae6fd", text: "#075985" },
};

const columns = [
  { field: "id", headerName: "ID", minWidth: 60, flex: 0.5 },
  { field: "name", headerName: "Name", minWidth: 120, flex: 1.3 },
  { field: "email", headerName: "Email", minWidth: 150, flex: 1.5 },
  { field: "phone", headerName: "Phone", minWidth: 110, flex: 1 },
  { field: "whatsapp", headerName: "WhatsApp", minWidth: 120, flex: 1 },
  { field: "company", headerName: "Company", minWidth: 120, flex: 1 },

  {
    field: "status",
    headerName: "Status",
    minWidth: 100,
    flex: 0.9,
    renderCell: (params) => {
      const s = params.value;
      return (
        <span
          style={{
            backgroundColor: STATUS_COLORS[s].bg,
            color: STATUS_COLORS[s].text,
            padding: "4px 10px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {s}
        </span>
      );
    },
  },

  { field: "source", headerName: "Source", minWidth: 90, flex: 0.8 },
  { field: "owner", headerName: "Owner", minWidth: 90, flex: 0.8 },
];

const TableData = () => {
  const [statusFilter, setStatusFilter] = useState("");

  const filteredRows = useMemo(() => {
    if (!statusFilter) return rowsData;
    return rowsData.filter((row) => row.status === statusFilter);
  }, [statusFilter]);

  return (
    <div className="h-full w-full flex flex-col">

      {/* FILTER BAR */}
      <Box className="shrink-0 flex gap-3 items-center px-2 py-2">
        <span className="text-sm font-medium">Filter Status:</span>

        <Select
          size="small"
          value={statusFilter}
          displayEmpty
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          {statuses.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* GRID AREA */}
      <div className="flex-1 min-h-0">
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25, page: 0 },
            },
          }}
          disableRowSelectionOnClick
          sx={{
            height: "100%",
            width: "100%",
            border: "none",

            "& .MuiDataGrid-cell": {
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          }}
        />
      </div>
    </div>
  );
};

export default TableData;
