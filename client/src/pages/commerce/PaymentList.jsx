import { Table, Tag, DatePicker, Select, Button } from "antd";
import {
  FilterOutlined,
  DownloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";

const PaymentList = () => {
  const columns = [
    {
      title: "WHATSAPP NUMBER",
      dataIndex: "number",
      key: "number",
      render: (text, record) => (
        <div>
          <div className="font-bold">{text}</div>
          <div className="text-xs text-gray-400">{record.name}</div>
        </div>
      ),
    },
    {
      title: "REFERENCE ID",
      dataIndex: "refId",
      key: "refId",
      render: (text) => <span className="text-gray-400 text-sm">{text}</span>,
    },
    {
      title: "AMOUNT",
      dataIndex: "amount",
      key: "amount",
      render: (text) => <span className="font-bold">₹{text}</span>,
    },
    { title: "CURRENCY", dataIndex: "currency", key: "currency" },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "Paid" ? "green" : status === "Pending" ? "gold" : "red"
          }
        >
          {status}
        </Tag>
      ),
    },
    { title: "CREATED DATE", dataIndex: "date", key: "date" },
    {
      title: "DETAILS",
      key: "action",
      render: () => <EyeOutlined className="text-gray-400 cursor-pointer" />,
    },
  ];

  const data = [
    {
      key: "1",
      number: "+91 98765 43210",
      name: "Rohit Sharma",
      refId: "TXN_20260219_A8F",
      amount: "1,249.00",
      currency: "INR",
      status: "Paid",
      date: "19-02-2026 14:32",
    },
    {
      key: "1",
      number: "+91 98765 43210",
      name: "Rohit Sharma",
      refId: "TXN_20260219_A8F",
      amount: "1,249.00",
      currency: "INR",
      status: "Paid",
      date: "19-02-2026 14:32",
    },
    {
      key: "1",
      number: "+91 98765 43210",
      name: "Rohit Sharma",
      refId: "TXN_20260219_A8F",
      amount: "1,249.00",
      currency: "INR",
      status: "Paid",
      date: "19-02-2026 14:32",
    },
    {
      key: "1",
      number: "+91 98765 43210",
      name: "Rohit Sharma",
      refId: "TXN_20260219_A8F",
      amount: "1,249.00",
      currency: "INR",
      status: "Paid",
      date: "19-02-2026 14:32",
    },
    {
      key: "1",
      number: "+91 98765 43210",
      name: "Rohit Sharma",
      refId: "TXN_20260219_A8F",
      amount: "1,249.00",
      currency: "INR",
      status: "Paid",
      date: "19-02-2026 14:32",
    },
    {
      key: "1",
      number: "+91 98765 43210",
      name: "Rohit Sharma",
      refId: "TXN_20260219_A8F",
      amount: "1,249.00",
      currency: "INR",
      status: "Paid",
      date: "19-02-2026 14:32",
    },
    // Add more dummy data here...
  ];

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payment List</h1>
        <Button icon={<DownloadOutlined />}>Download Report</Button>
      </div>

      <div className="bg-white p-4 rounded-xl border mb-6 flex gap-4 items-end shadow-sm">
        <div className="flex-1">
          <label className="text-xs font-bold text-gray-400 block mb-1 uppercase">
            From Date
          </label>
          <DatePicker className="w-full" />
        </div>
        <div className="flex-1">
          <label className="text-xs font-bold text-gray-400 block mb-1 uppercase">
            To Date
          </label>
          <DatePicker className="w-full" />
        </div>
        <div className="flex-1">
          <label className="text-xs font-bold text-gray-400 block mb-1 uppercase">
            Status
          </label>
          <Select
            className="w-full"
            defaultValue="All Status"
            options={[{ value: "all", label: "All Status" }]}
          />
        </div>
        <Button
          type="primary"
          className="bg-[#10b981]"
          icon={<FilterOutlined />}
        >
          Apply Filter
        </Button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <Table
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 5 }}
        />
      </div>
    </div>
  );
};
export default PaymentList;
