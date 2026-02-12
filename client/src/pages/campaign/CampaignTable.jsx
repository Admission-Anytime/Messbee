import axios from "axios";
import "./campaign.scss";
import { useEffect, useState } from "react";
import analytic from "../../assets/analytic.svg";
import icondelete from "../../assets/delete.svg";

export const userColomnsCamp = [
  {
    field: "title",
    headerName: "Title",
    width: 200,
    valueGetter: (params) => `campaigns_${params.row.id}`,
  },
  {
    field: "message",
    headerName: "Message",
    width: 200,
  },
  {
    field: "createdBy",
    headerName: "Created By",
    width: 200,
  },
  {
    field: "count",
    headerName: "Count",
    width: 100,
  },
  {
    field: "createdOn",
    headerName: "Created On",
    width: 150,
  },
  {
    field: "completedOn",
    headerName: "Completed On",
    width: 150,
  },
  {
    field: "scheduledOn",
    headerName: "Scheduled On",
    width: 150,
  },
  {
    field: "status",
    headerName: "Completed",
    width: 110,
    renderCell: (params) => {
      return <ActionStatus status={params.row.status} />;
    },
  },
  {
    field: "action",
    headerName: "Action",
    width: 100,
    renderCell: (params) => {
      return <ActionsButton row={params.row} />;
    },
  },
];

export const useRowsApi = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/user")
      .then((response) => {
        // Log the data fetched from the API
        setRows(response.data); // Access the 'user' array from the response data
      })
      .catch((error) => console.log(error));
  }, []);

  return rows;
};

function ActionsButton() {
  return (
    <div
      className="action-box"
      style={{ display: "flex", flexDirection: "row", gap: "10px" }}
    >
      <img
        src={icondelete}
        alt="deleteicon"
        style={{
          cursor: "pointer",
        }}
        onClick={() => {
          console.log("delete clicked");
        }}
      />
      <img
        src={analytic}
        alt="analytic"
        style={{
          cursor: "pointer",
        }}
        onClick={() => {
          console.log("analytic clicked");
        }}
      />
    </div>
  );
}
function ActionStatus(status) {
  return <div className={`status${status.status}`}>{status.status}</div>;
}
