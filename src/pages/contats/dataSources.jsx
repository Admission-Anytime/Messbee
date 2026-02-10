/* eslint-disable react/prop-types */
import icon from "../../assets/setting.svg";

export const userColomn = [
  { field: "id", headerName: "ID", width: 70 },

  {
    field: "name",
    headerName: "Name",
    width: 200,
    renderCell: (params) => {
      return <ActionsCell row={params.row} />;
    },
  },

  {
    field: "whatsapp",
    headerName: "WhatsApp",
    width: 200,
  },

  {
    field: "status",
    headerName: "Status",
    width: 100,
    renderCell: (params) => {
      return <ActionStatus status={params.row.status} />;
    },
  },

  {
    field: "email",
    headerName: "Email",
    width: 200,
  },

  {
    field: "address",
    headerName: "Address",
    width: 200,
  },

  {
    field: "instuteName",
    headerName: "Institute Name",
    width: 200,
  },

  {
    field: "label",
    headerName: "Label",
    width: 100,
  },

  {
    field: "note",
    headerName: "Note",
    width: 300,
    renderCell: () => {
      return (
        <div className="w-full">
          <textarea className="w-full border rounded-md p-1 text-sm resize-none" />
        </div>
      );
    },
  },
];


// ---------------- ROW DATA ---------------- //

export const userRow = [
  {
    id: 1,
    name: "Abhyan Morkal",
    whatsapp: "+911234567001",
    status: "pending",
    email: "xyz@gmail.com",
    address: "xyz",
    instuteName: "xyz University",
    label: "calling",
    note: "xyz",
  },
  {
    id: 2,
    name: "Abhyan Morkal",
    whatsapp: "+911234567001",
    status: "deactive",
    email: "xyz@gmail.com",
    address: "xyz",
    instuteName: "xyz University",
    label: "calling",
    note: "xyz",
  },
];


// ---------------- CELLS ---------------- //

function ActionsCell({ row }) {
  return (
    <div className="flex items-center justify-between px-2 w-full">
      <span className="text-sm">{row.name}</span>

      <img
        src={icon}
        alt="icon"
        className="w-[15px] h-[15px]"
      />
    </div>
  );
}

function ActionStatus({ status }) {
  const base = "px-2 py-[2px] rounded text-xs font-medium";

  const color =
    status === "active"
      ? "bg-green-200 text-green-800"
      : status === "pending"
      ? "bg-yellow-200 text-yellow-800"
      : "bg-red-200 text-red-800";

  return <div className={`${base} ${color}`}>{status}</div>;
}
