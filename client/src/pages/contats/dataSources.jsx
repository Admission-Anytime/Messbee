/* eslint-disable react/prop-types */
import { useState } from "react";
import icon from "../../assets/setting.svg";
import OpenDrawer from "../../components/Drawer/Drawer";

/* ------------------ COLUMNS ------------------ */

export const userColomn = [
  {
    field: "id",
    headerName: "ID",
    flex: 0.4,
    minWidth: 60,
  },

  {
    field: "name",
    headerName: "Name",
    flex: 1,
    minWidth: 140,
    renderCell: (params) => <ActionsCell row={params.row} />,
  },

  {
    field: "whatsapp",
    headerName: "WhatsApp",
    flex: 1,
    minWidth: 140,
  },

  {
    field: "status",
    headerName: "Status",
    flex: 0.6,
    minWidth: 90,
    renderCell: (params) => <ActionStatus status={params.row.status} />,
  },

  {
    field: "email",
    headerName: "Email",
    flex: 1.2,
    minWidth: 170,
  },

  {
    field: "address",
    headerName: "Address",
    flex: 1,
    minWidth: 140,
  },

  {
    field: "instuteName",
    headerName: "Institute Name",
    flex: 1.2,
    minWidth: 170,
  },

  {
    field: "label",
    headerName: "Label",
    flex: 0.6,
    minWidth: 90,
  },

  {
    field: "note",
    headerName: "Note",
    flex: 1,
    minWidth: 160,
    renderCell: () => (
      <textarea
        className="w-full resize-none rounded-md border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400"
        rows={1}
      />
    ),
  },
];

/* ------------------ ROWS (AUTO GENERATED) ------------------ */

export const userRow = Array.from({ length: 30 }).map((_, i) => ({
  id: i + 1,
  name: "Abhyan Morkal",
  whatsapp: "+911234567001",
  status: ["active", "pending", "deactive"][i % 3],
  email: "xyz@gmail.com",
  address: "xyz",
  instuteName: "xyz University",
  label: "calling",
  note: "",
}));

/* ------------------ NAME CELL ------------------ */

function ActionsCell({ row }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 px-1">
      <span
        onClick={() => setOpen(true)}
        className="cursor-pointer truncate font-medium"
      >
        {row.name}
      </span>

      <img
        src={icon}
        alt="icon"
        className="h-4 w-4 cursor-pointer opacity-70"
        onClick={() => setOpen(true)}
      />

      <OpenDrawer
        title="Add Contact"
        onClose={() => setOpen(false)}
        open={open}
      />
    </div>
  );
}

/* ------------------ STATUS BADGE ------------------ */

function ActionStatus({ status }) {
  const map = {
    active: "bg-green-200 text-green-800",
    pending: "bg-yellow-200 text-yellow-800",
    deactive: "bg-red-200 text-red-800",
  };

  return (
    <span
      className={`rounded-md px-2 py-[2px] text-xs font-medium ${
        map[status] || "bg-slate-200"
      }`}
    >
      {status}
    </span>
  );
}
