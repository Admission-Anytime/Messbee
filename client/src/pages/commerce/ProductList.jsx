import { useState } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Drawer,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CloudUploadOutlined,
  InfoCircleOutlined,
  CopyOutlined,
} from "@ant-design/icons";

const ProductList = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const dataSource = [
    {
      key: "1",
      name: "Classic Oxford Shirt",
      sku: "AP-OX-2024-WT",
      category: "Apparel",
      price: "1,899",
      stock: 42,
      img: "👕",
    },
    {
      key: "2",
      name: "Genuine Leather Belt",
      sku: "AC-LB-0012-BR",
      category: "Accessories",
      price: "2,450",
      stock: 8,
      img: "ベルト",
    },
    {
      key: "3",
      name: "Premium Silk Scarf",
      sku: "AC-SS-9912-FL",
      category: "Accessories",
      price: "999",
      stock: 0,
      img: "🧣",
    },
  ];

  const columns = [
    {
      title: "PRODUCT",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="flex items-center gap-3 py-2">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl shadow-sm">
            {record.img}
          </div>
          <div className="font-bold text-slate-800 text-[14px]">{text}</div>
        </div>
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      render: (sku) => (
        <span className="text-[11px] text-gray-400 uppercase tracking-tight font-bold">
          {sku}
        </span>
      ),
    },
    {
      title: "CATEGORY",
      dataIndex: "category",
      key: "category",
      render: (cat) => (
        <Tag className="rounded-full px-3 border-none bg-blue-50 text-blue-500 font-bold text-[10px] uppercase">
          {cat}
        </Tag>
      ),
    },
    {
      title: "PRICE",
      dataIndex: "price",
      key: "price",
      render: (p) => <span className="font-black text-slate-800">₹{p}</span>,
    },
    {
      title: "STOCK",
      dataIndex: "stock",
      key: "stock",
      render: (s) => (
        <div>
          <span
            className={`text-[12px] font-bold ${s > 10 ? "text-emerald-500" : s > 0 ? "text-orange-500" : "text-red-500"}`}
          >
            {s === 0 ? "Out of Stock" : s < 10 ? "Low Stock" : "In Stock"}
          </span>
          <div className="text-[10px] text-gray-400 font-medium">
            {s} units remaining
          </div>
        </div>
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      render: () => (
        <Space size="large" className="text-gray-400">
          <Tooltip title="Edit">
            <EditOutlined className="hover:text-blue-500 cursor-pointer text-lg" />
          </Tooltip>
          <Tooltip title="Copy SKU">
            <CopyOutlined className="hover:text-emerald-500 cursor-pointer text-lg" />
          </Tooltip>
          <Tooltip title="Delete">
            <DeleteOutlined className="hover:text-red-500 cursor-pointer text-lg" />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-['Urbanist']">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Product List
          </h1>
          <p className="text-gray-400 text-sm font-medium italic">
            Manage your digital catalog & inventory
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          className="bg-[#10b981] hover:!bg-[#059669] border-none font-bold rounded-xl h-12 px-6 flex items-center gap-2 shadow-lg shadow-emerald-100"
          icon={<PlusOutlined />}
          onClick={() => setIsDrawerOpen(true)}
        >
          Add Product
        </Button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm mb-6 flex gap-4 items-center">
        <Input
          placeholder="Search by name, SKU..."
          className="h-12 rounded-xl bg-slate-50 border-none font-medium text-sm flex-1"
        />
        <Select
          placeholder="Category"
          className="w-48 h-12"
          options={[
            { value: "apparel", label: "Apparel" },
            { value: "accessories", label: "Accessories" },
          ]}
        />
        <Select
          placeholder="Stock Status"
          className="w-48 h-12"
          options={[
            { value: "in", label: "In Stock" },
            { value: "out", label: "Out of Stock" },
          ]}
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={{ position: ["bottomRight"], className: "p-4" }}
        />
      </div>

      {/* DRAWER */}
      <Drawer
        title={
          <div className="flex justify-between items-center w-full px-2">
            <span className="text-lg font-black tracking-tight text-slate-800 uppercase">
              ADD NEW PRODUCT
            </span>
            <Space size="middle">
              <Button
                onClick={() => setIsDrawerOpen(false)}
                className="font-bold border-none text-gray-400 hover:text-red-400"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                className="bg-[#10b981] border-none font-bold h-10 px-8 rounded-xl shadow-md"
              >
                Save Product
              </Button>
            </Space>
          </div>
        }
        placement="right"
        width={580}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        closable={false}
      >
        <div className="space-y-10">
          {/* SECTION 1: BASIC INFO */}
          <section>
            <h3 className="text-[#10b981] font-black text-[11px] tracking-[0.2em] mb-6 flex items-center gap-2 uppercase">
              <InfoCircleOutlined /> Basic Information
            </h3>
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest">
                  Product Name
                </label>
                <Input
                  placeholder="e.g. Premium Cotton Polo"
                  className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-700 shadow-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest">
                    SKU ID
                  </label>
                  <Input
                    placeholder="PRD-001"
                    className="h-14 rounded-2xl bg-slate-50 border-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest">
                    Category
                  </label>
                  <Select
                    className="w-full h-14 custom-select"
                    placeholder="Select Category"
                    options={[{ value: "1", label: "Apparel" }]}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: MEDIA */}
          <section>
            <h3 className="text-[#10b981] font-black text-[11px] tracking-[0.2em] mb-6 uppercase">
              Product Media
            </h3>
            <div className="border-2 border-dashed border-slate-100 rounded-[24px] p-14 text-center bg-slate-50/30 hover:bg-slate-50 hover:border-emerald-300 transition-all cursor-pointer group">
              <CloudUploadOutlined className="text-5xl text-slate-200 mb-4 group-hover:text-[#10b981] transition-colors" />
              <p className="text-slate-800 font-black text-base">
                Drag & drop images here
              </p>
              <p className="text-gray-400 text-[11px] font-bold mt-2 uppercase tracking-tighter">
                PNG, JPG or WebP up to 5MB
              </p>
            </div>
          </section>

          {/* SECTION 3: PRICING & STOCK  */}
          <section>
            <h3 className="text-[#10b981] font-black text-[11px] tracking-[0.2em] mb-6 uppercase">
              Pricing & Inventory
            </h3>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest">
                  Price (INR)
                </label>
                <Input
                  placeholder="0.00"
                  prefix={<span className="text-gray-300 font-bold">₹</span>}
                  className="h-14 rounded-2xl bg-slate-50 border-none font-black"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest">
                  Initial Stock
                </label>
                <Input
                  placeholder="0"
                  className="h-14 rounded-2xl bg-slate-50 border-none font-black"
                />
              </div>
            </div>
          </section>
        </div>
      </Drawer>
    </div>
  );
};

export default ProductList;
