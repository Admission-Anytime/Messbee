import React, { useState } from "react";
import { Segmented, ConfigProvider, DatePicker } from "antd";
import YellowButton from "../../components/button/buttonReg/YellowButton";
import Analyticbody from "./Analyticbody";

// ❌ DELETE THIS LINE: import MainSidebar from ... 
// ❌ DELETE THIS LINE: import "./analytic.scss";

const { RangePicker } = DatePicker;

const Analytic = () => {
  return (
    // ✅ Use this container to fill the screen correctly
    <div className="flex w-full h-full flex-col bg-slate-50 font-['Urbanist'] overflow-hidden">
      
      {/* HEADER */}
      <div className="w-full h-[70px] bg-white px-6 border-b border-gray-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Analytics</h2>
          <Tab />
        </div>
        <div className="flex items-center gap-4">
          <RangePicker className="font-['Urbanist'] border-gray-300 hover:border-gray-400 py-1.5" />
          <YellowButton title="Apply Filter" padding="0.5rem 1rem" />
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 w-full overflow-y-auto p-6">
        <Analyticbody />
      </div>

    </div>
  );
};

export default Analytic;

// ... keep your Tab component code below ...
export const Tab = () => {
  const [value, setValue] = useState("Conversation");
  return (
    <ConfigProvider
      theme={{
        components: {
          Segmented: {
            itemSelectedBg: "#ba2525",
            itemSelectedColor: "#ffffff",
            itemColor: "#64748b", 
            trackBg: "#f1f5f9",
            borderRadius: 8,
          },
        },
      }}
    >
      <Segmented
        options={["Conversation", "Message", "Campaign"]}
        value={value}
        onChange={setValue}
        className="font-bold shadow-sm border border-slate-100"
      />
    </ConfigProvider>
  );
};