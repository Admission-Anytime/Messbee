import { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import Chart from "react-apexcharts";
import { FileText, Megaphone, Settings, ShieldCheck, UserRound, Download, ChevronRight } from "lucide-react";

const ConversationAnalytics = () => {
  const [view, setView] = useState("table");
  const [dateRange, setDateRange] = useState([dayjs('2023-10-01'), dayjs('2023-10-31')]);

  const tableData = [
    { date: "Oct 01, 2023", marketing: { qty: 1240, cost: 1860 }, utility: { qty: 450, cost: 450 }, auth: { qty: 120, cost: 36 }, service: { qty: 890, cost: 0 }, totalConv: 2700, totalCharges: 2346 },
    { date: "Oct 02, 2023", marketing: { qty: 980, cost: 1470 }, utility: { qty: 520, cost: 520 }, auth: { qty: 145, cost: 43 }, service: { qty: 760, cost: 0 }, totalConv: 2405, totalCharges: 2033 },
    { date: "Oct 03, 2023", marketing: { qty: 1560, cost: 2340 }, utility: { qty: 310, cost: 310 }, auth: { qty: 88, cost: 26 }, service: { qty: 1120, cost: 0 }, totalConv: 3078, totalCharges: 2676 },
    { date: "Oct 04, 2023", marketing: { qty: 2100, cost: 3150 }, utility: { qty: 670, cost: 670 }, auth: { qty: 201, cost: 60 }, service: { qty: 940, cost: 0 }, totalConv: 3911, totalCharges: 3880 },
    { date: "Oct 05, 2023", marketing: { qty: 1850, cost: 2775 }, utility: { qty: 420, cost: 420 }, auth: { qty: 110, cost: 33 }, service: { qty: 1050, cost: 0 }, totalConv: 3430, totalCharges: 3228 },
    { date: "Oct 06, 2023", marketing: { qty: 1420, cost: 2130 }, utility: { qty: 580, cost: 580 }, auth: { qty: 130, cost: 39 }, service: { qty: 820, cost: 0 }, totalConv: 2950, totalCharges: 2749 },
    { date: "Oct 07, 2023", marketing: { qty: 1680, cost: 2520 }, utility: { qty: 490, cost: 490 }, auth: { qty: 150, cost: 45 }, service: { qty: 910, cost: 0 }, totalConv: 3230, totalCharges: 3055 },
    { date: "Oct 08, 2023", marketing: { qty: 1950, cost: 2925 }, utility: { qty: 610, cost: 610 }, auth: { qty: 170, cost: 51 }, service: { qty: 780, cost: 0 }, totalConv: 3510, totalCharges: 3586 },
    { date: "Oct 09, 2023", marketing: { qty: 1100, cost: 1650 }, utility: { qty: 380, cost: 380 }, auth: { qty: 90, cost: 27 }, service: { qty: 1200, cost: 0 }, totalConv: 2770, totalCharges: 2057 },
    { date: "Oct 10, 2023", marketing: { qty: 2300, cost: 3450 }, utility: { qty: 720, cost: 720 }, auth: { qty: 220, cost: 66 }, service: { qty: 850, cost: 0 }, totalConv: 4090, totalCharges: 4236 },
  ];

  const chartOptions = {
    chart: { type: 'bar', stacked: false, toolbar: { show: false }, fontFamily: 'Urbanist, sans-serif' },
    colors: ['#3b82f6', '#10b981', '#06b6d4', '#f97316'],
    plotOptions: { bar: { horizontal: false, columnWidth: '60%', borderRadius: 3 } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      categories: ['14 Apr', '15 Apr', '16 Apr', '17 Apr'],
      axisBorder: { show: false }, axisTicks: { show: false },
      labels: { style: { colors: '#94a3b8', fontWeight: 600, fontSize: '12px' } }
    },
    yaxis: { labels: { style: { colors: '#94a3b8', fontWeight: 600, fontSize: '12px' } } },
    fill: { opacity: 1 },
    legend: { position: 'top', horizontalAlign: 'right', fontSize: '12px', fontWeight: 700, markers: { radius: 12 } },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 }
  };

  const chartSeries = [
    { name: 'MARKETING', data: [44, 55, 41, 67] },
    { name: 'UTILITY', data: [13, 23, 20, 8] },
    { name: 'AUTH', data: [11, 17, 15, 15] },
    { name: 'SERVICE', data: [21, 7, 25, 13] }
  ];

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px', bgcolor: 'white', height: '42px',
      '& fieldset': { borderColor: '#e2e8f0' },
      '&:hover fieldset': { borderColor: '#10b981' },
      '&.Mui-focused fieldset': { borderColor: '#10b981' },
      '& .MuiInputBase-input': { fontWeight: 600, color: '#1e293b', fontSize: '0.875rem', padding: '0 10px' }
    }
  };

  const sidebarCards = [
    { label: 'MARKETING', count: view === 'table' ? '5,880' : '208', avgCharge: '₹1.50', chargeColor: 'text-slate-900', icon: <Megaphone className="w-5 h-5 text-[#10B981]" />, iconBg: 'bg-emerald-50' },
    { label: 'UTILITY', count: view === 'table' ? '1,950' : '0', avgCharge: '₹1.00', chargeColor: 'text-slate-900', icon: <Settings className="w-5 h-5 text-blue-500" />, iconBg: 'bg-blue-50' },
    { label: 'AUTHENTICATION', count: view === 'table' ? '554' : '0', avgCharge: '₹0.30', chargeColor: 'text-rose-500', icon: <ShieldCheck className="w-5 h-5 text-rose-500" />, iconBg: 'bg-rose-50' },
    { label: 'SERVICE', count: view === 'table' ? '3,710' : '85', avgCharge: '₹0.00', chargeColor: 'text-slate-900', icon: <UserRound className="w-5 h-5 text-slate-500" />, iconBg: 'bg-slate-100' },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden font-['Urbanist']">
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">

            {/* HEADER */}
            <div className="mb-6">
              <h1 className="text-3xl font-black text-slate-900 mb-1">Conversational Analytics</h1>
              <p className="text-sm text-slate-500 font-medium">Detailed performance metrics across communication channels</p>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

              {/* LEFT - TABLE or CHART */}
              <div className="xl:col-span-2 space-y-4">

                {/* FILTERS ROW inside left column */}
                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">From Date</p>
                    <DatePicker value={dateRange[0]} onChange={(val) => setDateRange([val, dateRange[1]])}
                      slotProps={{ textField: { sx: { width: 170, ...inputSx } } }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">To Date</p>
                    <DatePicker value={dateRange[1]} onChange={(val) => setDateRange([dateRange[0], val])}
                      slotProps={{ textField: { sx: { width: 170, ...inputSx } } }} />
                  </div>

                  {/* Toggle — pill style matching Marketing/Utility/Authentication tabs */}
                  <div className="flex bg-gray-50/50 p-1.5 rounded-xl border border-gray-100 gap-1 h-fit">
                    <button
                      onClick={() => setView('table')}
                      className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
                        ${view === 'table'
                          ? 'bg-white shadow-sm text-gray-900 border border-gray-100'
                          : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Table View
                    </button>
                    <button
                      onClick={() => setView('chart')}
                      className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
                        ${view === 'chart'
                          ? 'bg-white shadow-sm text-gray-900 border border-gray-100'
                          : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Chart View
                    </button>
                  </div>
                </div>
                {view === 'table' ? (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse min-w-[700px]">
                        <thead>
                          <tr className="bg-[#f8fafc]">
                            <th rowSpan="2" className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 bg-[#f1f5f9] border-r border-slate-100 text-left w-24">Date</th>
                            <th colSpan="2" className="px-3 py-4 text-[10px] font-black text-[#10B981] uppercase tracking-widest text-center border-b border-slate-200 border-r border-slate-100">Marketing</th>
                            <th colSpan="2" className="px-3 py-4 text-[10px] font-black text-blue-500 uppercase tracking-widest text-center border-b border-slate-200 border-r border-slate-100">Utility</th>
                            <th colSpan="2" className="px-3 py-4 text-[10px] font-black text-rose-500 uppercase tracking-widest text-center border-b border-slate-200 border-r border-slate-100">Auth</th>
                            <th colSpan="2" className="px-3 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-b border-slate-200 border-r border-slate-100">Service</th>
                            <th rowSpan="2" className="px-3 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-200 border-r border-slate-100 text-center bg-[#f8fafc] leading-tight">Total<br/>Conv.</th>
                            <th rowSpan="2" className="px-3 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-200 whitespace-nowrap text-center bg-[#f8fafc] leading-tight">Total<br/>Charges<br/>(INR)</th>
                          </tr>
                          <tr className="bg-[#f8fafc]">
                            {['Qty','Cost','Qty','Cost','Qty','Cost','Qty','Cost'].map((l, i) => (
                              <th key={i} className={`px-3 py-2 text-[10px] font-semibold text-slate-400 text-center border-b border-slate-200 ${i % 2 === 1 ? 'border-r border-slate-100' : ''}`}>{l}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.map((row, i) => (
                            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                              <td className={`px-4 py-5 text-sm text-slate-900 font-bold border-r border-slate-100 leading-snug ${i % 2 === 0 ? 'bg-[#f1f5f9]' : 'bg-[#f8fafc]'}`}>
                                <div className="flex flex-col">
                                  <span>{row.date.split(' ')[0]}</span>
                                  <span>{row.date.split(' ')[1]}</span>
                                  <span>{row.date.split(' ')[2]}</span>
                                </div>
                              </td>
                              <td className="px-3 py-5 text-sm text-slate-700 text-center font-semibold">{row.marketing.qty.toLocaleString()}</td>
                              <td className="px-3 py-5 text-sm text-slate-700 text-center font-semibold border-r border-slate-100">₹{row.marketing.cost.toLocaleString()}</td>
                              <td className="px-3 py-5 text-sm text-slate-700 text-center font-semibold">{row.utility.qty.toLocaleString()}</td>
                              <td className="px-3 py-5 text-sm text-slate-700 text-center font-semibold border-r border-slate-100">₹{row.utility.cost.toLocaleString()}</td>
                              <td className="px-3 py-5 text-sm text-slate-700 text-center font-semibold">{row.auth.qty.toLocaleString()}</td>
                              <td className="px-3 py-5 text-sm text-slate-700 text-center font-semibold border-r border-slate-100">₹{row.auth.cost.toLocaleString()}</td>
                              <td className="px-3 py-5 text-sm text-slate-700 text-center font-semibold">{row.service.qty.toLocaleString()}</td>
                              <td className="px-3 py-5 text-sm text-slate-700 text-center font-semibold border-r border-slate-100">₹{row.service.cost.toLocaleString()}</td>
                              <td className="px-3 py-5 text-sm font-bold text-slate-900 border-r border-slate-100 text-center">{row.totalConv.toLocaleString()}</td>
                              <td className="px-3 py-5 text-sm font-bold text-[#10B981] whitespace-nowrap text-center">₹{row.totalCharges.toLocaleString()}.00</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                      <h3 className="text-xl font-black text-slate-900">Conversation Volume</h3>
                      <p className="text-sm text-slate-500 mb-2">Daily traffic categorized by intent</p>
                      <Chart options={chartOptions} series={chartSeries} type="bar" height={380} />
                    </div>
                    <div className="bg-[#ecfdf5] border border-emerald-100 rounded-2xl p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-[#10B981] rounded-full flex items-center justify-center text-white shrink-0">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">Growth Opportunity Detected</h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">Marketing conversations are up 24% compared to last week.<br />Consider scaling your current campaign.</p>
                        </div>
                      </div>
                      <button className="shrink-0 px-5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-black rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                        View Analysis
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* RIGHT SIDEBAR */}
              <div className="xl:col-span-1 space-y-4">

                {/* Apply Filter Button — top-margin matches date-label height so it aligns with the toggle row */}
                <button className="w-full h-[42px] mt-[21px] bg-[#10B981] text-white text-sm font-black rounded-2xl hover:bg-[#059669] transition-all shadow-lg shadow-emerald-500/25">
                  Apply Filter
                </button>

                {view === 'table' ? (
                  /* TABLE VIEW SIDEBAR */
                  <>
                    {/* Green Summary Card */}
                    <div className="bg-[#10B981] rounded-2xl p-6 text-white relative overflow-hidden">
                      <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-xl"></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-center mb-6">
                          <div className="p-2.5 bg-white/25 rounded-xl">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <span className="px-4 py-1 bg-white/25 rounded-full text-[10px] font-black uppercase tracking-[0.15em]">Report</span>
                        </div>
                        <div className="mb-5">
                          <p className="text-[9px] font-black text-white/70 uppercase tracking-[0.18em] mb-1.5">Total Conversations</p>
                          <p className="text-5xl font-black leading-none">12,094</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-white/70 uppercase tracking-[0.18em] mb-1.5">Total Charges</p>
                          <p className="text-4xl font-black leading-none">₹10,935.00</p>
                        </div>
                      </div>
                    </div>

                    {/* Category Breakdown Cards */}
                    {sidebarCards.map((card, i) => (
                      <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                            {card.icon}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{card.label}</p>
                            <p className="text-xl font-black text-slate-900 leading-tight">{card.count} <span className="text-xs text-slate-400 font-semibold normal-case tracking-normal">Items</span></p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                          <span className="text-sm font-medium text-slate-400">Avg Charge</span>
                          <span className={`text-sm font-black ${card.chargeColor}`}>{card.avgCharge}</span>
                        </div>
                      </div>
                    ))}

                    {/* Export Report */}
                    <button className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-[#10B981] hover:text-[#059669] transition-colors">
                      <Download className="w-4 h-4" />
                      Export Detailed Report
                    </button>
                  </>
                ) : (
                  /* CHART VIEW SIDEBAR */
                  <>
                    {/* White Summary Report Card */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between px-5 pt-5 pb-3">
                        <h3 className="text-base font-black text-slate-900">Summary Report</h3>
                        <button className="text-slate-300 hover:text-slate-500 text-lg leading-none">···</button>
                      </div>
                      <div className="px-5 py-4 border-l-4 border-[#10B981] ml-0">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Conversation</p>
                        <p className="text-4xl font-black text-slate-900">293</p>
                      </div>
                      <div className="px-5 py-4 border-t border-slate-50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Charges</p>
                        <p className="text-3xl font-black text-[#10B981]">₹197.60</p>
                      </div>
                    </div>

                    {/* Marketing */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
                        <span className="text-sm font-black text-slate-700">Marketing</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Count</p>
                          <p className="text-2xl font-black text-slate-900">208</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Charges</p>
                          <p className="text-2xl font-black text-slate-900">₹197.60</p>
                        </div>
                      </div>
                    </div>

                    {/* Service */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-400 shrink-0"></span>
                        <span className="text-sm font-black text-slate-700">Service</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Count</p>
                          <p className="text-2xl font-black text-slate-900">85</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Charges</p>
                          <p className="text-2xl font-black text-slate-900">₹0.00</p>
                        </div>
                      </div>
                    </div>

                    {/* Utility + Auth Row */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Utility</span>
                          </div>
                          <p className="text-3xl font-black text-slate-900">0</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0"></span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Auth</span>
                          </div>
                          <p className="text-3xl font-black text-slate-900">0</p>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Details */}
                    <div className="bg-[#064e3b] rounded-2xl p-5 text-white cursor-pointer group hover:bg-[#065f46] transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-1">Pricing Details</p>
                          <p className="text-sm font-black">WhatsApp Conversation Pricing</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 transition-transform shrink-0" />
                      </div>
                    </div>
                  </>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default ConversationAnalytics;
