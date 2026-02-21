import { Button, Table, Tag, Input, Select, Space, Switch, Tooltip } from 'antd';
import { 
  AlertOutlined, 
  SearchOutlined, 
  FilterOutlined, 
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  PlusOutlined
} from '@ant-design/icons';

const Inventory = () => {
  // Stats Data
  const cards = [
    { title: 'TOTAL PRODUCTS', value: '1,429', change: '+12%', color: 'blue' },
    { title: 'OUT OF STOCK', value: '12', change: '+12%', color: 'red' },
    { title: 'REVENUE', value: '₹4.8L', change: '+12%', color: 'green' },
  ];

  // Table Data 
  const dataSource = [
    {
      key: '1',
      product: { name: 'Premium Wireless Headphones', desc: 'v2.0 Noise Cancelling', img: '🎧' },
      sku: 'SKU-WH-992',
      stock: 84,
      goal: 100,
      price: '₹4,499.00',
      category: 'Electronics',
      status: 'In stock',
      shop: true,
    },
    {
      key: '2',
      product: { name: 'Smart Watch Series 7', desc: 'Limited Edition Blue', img: '⌚' },
      sku: 'SKU-SW-001',
      stock: 8,
      goal: 50,
      price: '₹18,999.00',
      category: 'Gadgets',
      status: 'Low Stock',
      shop: true,
    },
    {
      key: '3',
      product: { name: 'Pro Graphics Tablet', desc: 'Stylus Included', img: '✍️' },
      sku: 'SKU-TB-512',
      stock: 0,
      goal: 20,
      price: '₹32,500.00',
      category: 'Professional',
      status: 'OUT OF STOCK',
      shop: false,
    },
  ];

  const columns = [
    {
      title: 'PRODUCT INFO',
      dataIndex: 'product',
      render: (product) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl shadow-sm">
            {product.img}
          </div>
          <div>
            <div className="font-bold text-slate-800 text-[13px]">{product.name}</div>
            <div className="text-[11px] text-gray-400 italic font-medium">{product.desc}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      render: (sku) => <span className="text-[11px] font-bold text-gray-400 tracking-tight">{sku}</span>,
    },
    {
      title: 'STOCK LEVEL',
      render: (_, record) => (
        <div className="w-32">
          <div className="flex justify-between mb-1">
            <span className={`text-[10px] font-bold ${record.stock === 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {record.stock} in stock
            </span>
            <span className="text-[9px] text-gray-300 font-bold uppercase">Goal: {record.goal}</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${record.stock === 0 ? 'bg-red-400' : record.stock < 10 ? 'bg-orange-400' : 'bg-emerald-400'}`}
              style={{ width: `${(record.stock / record.goal) * 100}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      title: 'PRICE',
      dataIndex: 'price',
      render: (price) => <span className="font-black text-slate-800 text-[13px]">{price}</span>,
    },
    {
      title: 'CATEGORY',
      dataIndex: 'category',
      render: (cat) => <Tag className="border-none bg-slate-100 text-slate-500 font-bold text-[10px] px-3 rounded-full uppercase tracking-tighter">{cat}</Tag>,
    },
    {
      title: 'WHATSAPP SHOP',
      dataIndex: 'shop',
      render: (checked) => <Switch size="small" defaultChecked={checked} className={checked ? 'bg-emerald-500' : ''} />,
    },
    {
      title: 'ACTIONS',
      render: () => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined className="text-gray-400 hover:text-blue-500" />} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button type="text" icon={<DeleteOutlined className="text-gray-400 hover:text-red-500" />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-['Urbanist']">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <h1 className="text-[22px] font-black text-[#1e293b] tracking-tight uppercase">Inventory Management</h1>
          <Tag color="blue" className="rounded-md font-bold text-[10px] border-none bg-blue-50 text-blue-500">V2.4.0</Tag>
        </div>
        <Space size="middle">
          <Button icon={<PlusOutlined />} type="primary" className="bg-[#10b981] border-none h-10 px-6 rounded-xl font-bold hover:opacity-90 transition-all">Add Product</Button>
          <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm cursor-pointer hover:bg-slate-50">
             <AlertOutlined className="text-gray-400" />
          </div>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-8 mb-10">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">{card.title}</div>
            <div className="text-4xl font-black text-[#0f172a] mb-5">{card.value}</div>
            <div className="flex items-center gap-2">
              <Tag color="green" className="border-none bg-green-50 text-green-500 font-black rounded-full px-3 text-[11px]">{card.change}</Tag>
              <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-t-[32px] border border-gray-100 border-b-0 flex items-center justify-between gap-4">
        <Input 
          prefix={<SearchOutlined className="text-gray-400" />} 
          placeholder="Search by SKU, Product name..." 
          className="max-w-md h-12 bg-slate-50 border-none rounded-2xl font-bold text-xs"
        />
        <Space size="middle">
          <Select 
            placeholder="Category" 
            className="w-40" 
            options={[
              { value: 'elec', label: 'Electronics' },
              { value: 'gadget', label: 'Gadgets' },
              { value: 'pro', label: 'Professional' }
            ]}
          />
          <Select 
            placeholder="Stock Levels" 
            className="w-40" 
            options={[
              { value: 'in', label: 'In Stock' },
              { value: 'low', label: 'Low Stock' },
              { value: 'out', label: 'Out of Stock' }
            ]}
          />
          <Button icon={<FilterOutlined />} className="h-12 w-12 rounded-2xl border-gray-100 shadow-sm flex items-center justify-center" />
          <Button icon={<DownloadOutlined />} className="h-12 px-6 rounded-2xl border-gray-100 shadow-sm font-bold text-xs text-slate-600 hover:text-emerald-500">Export CSV</Button>
        </Space>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-b-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <Table 
          dataSource={dataSource} 
          columns={columns} 
          pagination={false}
          className="custom-table"
        />
        <div className="p-6 border-t border-gray-50 flex justify-between items-center bg-white">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Showing 1 to 3 of 1,284 products</span>
          <div className="flex gap-2">
             <Button size="small" className="rounded-lg font-bold text-[10px] hover:text-emerald-500">PREV</Button>
             <Button size="small" type="primary" className="bg-[#10b981] border-none rounded-lg font-bold text-[10px]">1</Button>
             <Button size="small" className="rounded-lg font-bold text-[10px] hover:text-emerald-500 border-gray-100">2</Button>
             <Button size="small" className="rounded-lg font-bold text-[10px] hover:text-emerald-500 border-gray-100">NEXT</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;