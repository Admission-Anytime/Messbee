import React from "react";
import BarsDataset from "./BarsDataset";
import PieChartbox from "./PieChartbox";
import YellowButton from "../../components/button/buttonReg/YellowButton";

const Analyticbody = () => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto pb-10 font-['Urbanist']">
      
      {/* TOP ROW: Bar Chart */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm w-full transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Conversation Volume</h3>
          <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">+12% vs Last Month</span>
        </div>
        
        {/* Chart Wrapper - Set explicit height so MUI chart fills it */}
        <div className="w-full h-[350px]">
          <BarsDataset />
        </div>
      </div>

      {/* BOTTOM ROW: Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left: Pie Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm transition-shadow hover:shadow-md flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 mb-2">User Demographics</h3>
          <p className="text-4xl font-extrabold text-gray-900 mb-6">3,456 <span className="text-sm font-medium text-gray-400">Total Users</span></p>
          
          <div className="flex-1 flex items-center justify-center min-h-[250px]">
            <PieChartbox />
          </div>
        </div>

        {/* Middle: Summary Report 1 */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm transition-shadow hover:shadow-md flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Cost Summary</h3>
          
          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-600 font-medium">Total Conversation</span>
              <span className="font-bold text-gray-900">₹20</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-600 font-medium">Total Charges</span>
              <span className="font-bold text-red-500">₹20</span>
            </div>

            <div className="pt-4">
              <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Marketing</h4>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-600 font-medium">Total Delivered</span>
                <span className="font-bold text-gray-900">₹20</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-600 font-medium">Total Read</span>
                <span className="font-bold text-gray-900">₹20</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-2">
            <YellowButton title="View Pricing Guide" padding="0.75rem w-full" />
          </div>
        </div>

        {/* Right: Summary Report 2 */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm transition-shadow hover:shadow-md flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Utility & Service</h3>
          
          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-600 font-medium">Utility Sent</span>
              <span className="font-bold text-gray-900">1,240</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-600 font-medium">Utility Cost</span>
              <span className="font-bold text-red-500">₹20</span>
            </div>

            <div className="pt-4">
              <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Service</h4>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-600 font-medium">Service Sent</span>
                <span className="font-bold text-gray-900">890</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-600 font-medium">Service Cost</span>
                <span className="font-bold text-red-500">₹20</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analyticbody;