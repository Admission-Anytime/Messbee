
import  { useState } from "react";
// import MainSidebar from "../../components/mainsidebar/MainSidebar";
import { MessageSquare, Umbrella, Bot, RotateCcw } from 'lucide-react';

const Automation = () => {
  const [welcomeEnabled, setWelcomeEnabled] = useState(false);
  const [awayEnabled, setAwayEnabled] = useState(false);
  const [fallbackEnabled, setFallbackEnabled] = useState(false);
  const [chatbotEnabled, setChatbotEnabled] = useState(false);

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      {/* <MainSidebar /> */}
      
      <div className="flex-1 w-full overflow-auto">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="max-w-7xl">
            <h1 className="text-2xl font-bold text-gray-900">Automation</h1>
            <p className="text-sm text-gray-600 mt-1">
              Set up automations that manage your conversation and streamline your workflows
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 max-w-7xl">
          {/* Greet People Section */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-5 text-gray-900">
              Greet People
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Welcome Message Card */}
              <div className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg border border-gray-200 hover:border-blue-400 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                      <MessageSquare size={20} />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">Welcome message</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={welcomeEnabled}
                      onChange={(e) => setWelcomeEnabled(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
                <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                  Welcome new customer automatically
                </p>
                <button className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
                  Set Message
                </button>
              </div>

              {/* Away Message Card */}
              <div className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg border border-gray-200 hover:border-blue-400 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                      <Umbrella size={20} />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">Away message</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={awayEnabled}
                      onChange={(e) => setAwayEnabled(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
                <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                  Reply automatically when you are away
                </p>
                <button className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
                  Set Message
                </button>
              </div>
            </div>
          </div>

          {/* Advance Automation Section */}
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">
              Advance Automation
            </h2>
            <p className="text-gray-600 text-sm mb-5">
              Automate repetitive processes with advance chat bot builder
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Chatbot Builder Card */}
              <div className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg border border-gray-200 hover:border-blue-400 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <label className="flex items-center mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    checked={chatbotEnabled}
                    onChange={(e) => setChatbotEnabled(e.target.checked)}
                  />
                </label>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                    <Bot size={20} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Chatbot builder</h3>
                </div>
                <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                  Build with drag and drop chatbot builder to automate advance trigger based on keywords, template message and more
                </p>
                <div className="flex gap-3 flex-wrap">
                  <button className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
                    View Chatbots
                  </button>
                  <button className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white  shadow-sm hover:shadow-md transition-all duration-200">
                    Create Automation
                  </button>
                </div>
              </div>

              {/* Fallback Message Card */}
              <div className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg border border-gray-200 hover:border-blue-400 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                      <RotateCcw size={20} />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">Fallback message</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={fallbackEnabled}
                      onChange={(e) => setFallbackEnabled(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
                <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                  Send fallback message when no keywords or trigger for automation matches
                </p>
                <button className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
                  Set Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Automation;




// const CustomFieldsSection = () => {
//   const customFields = [
//     {
//       name: "Institute Name",
//       description: "Primary institute of the lead",
//       type: "text",
//       key: "college_name",
//       createdBy: { name: "Anil Kumar Atri", avatar: "AK", initials: "AK" },
//       isActive: true
//     },
//     {
//       name: "Email",
//       description: "Email id of contact",
//       type: "text",
//       key: "email_1",
//       createdBy: { name: "WhatsTool", avatar: "WT", initials: "WT" },
//       isActive: true
//     },
//     {
//       name: "Address",
//       description: "Address of contact",
//       type: "text",
//       key: "address_1",
//       createdBy: { name: "WhatsTool", avatar: "WT", initials: "WT" },
//       isActive: true
//     },
//     {
//       name: "Notes",
//       description: "Notes for contact",
//       type: "text",
//       key: "notes_1",
//       createdBy: { name: "WhatsTool", avatar: "WT", initials: "WT" },
//       isActive: true
//     },
//     {
//       name: "Additional Phone number",
//       description: "Alternate phone number of c...",
//       type: "text",
//       key: "additional_phone_number_1",
//       createdBy: { name: "WhatsTool", avatar: "WT", initials: "WT" },
//       isActive: true
//     },
//     {
//       name: "GSTN",
//       description: "GSTN of contact",
//       type: "text",
//       key: "gstn_1",
//       createdBy: { name: "WhatsTool", avatar: "WT", initials: "WT" },
//       isActive: true
//     },
//     {
//       name: "Creation Date",
//       description: "The date when the lead was...",
//       type: "date",
//       key: "created_at",
//       createdBy: { name: "WhatsTool", avatar: "WT", initials: "WT" },
//       isActive: true
//     },
//     {
//       name: "Order Value",
//       description: "Total monetary value of the ...",
//       type: "number",
//       key: "order_value",
//       createdBy: { name: "WhatsTool", avatar: "WT", initials: "WT" },
//       isActive: true
//     },
//     {
//       name: "Company Size",
//       description: "Total employees in the comp...",
//       type: "number",
//       key: "emp_count",
//       createdBy: { name: "WhatsTool", avatar: "WT", initials: "WT" },
//       isActive: true
//     }
//   ];

//   return (
//     <div className="flex-1 bg-gray-50 p-8">
//       <div className="bg-white rounded-lg shadow-sm">
//         {/* Header */}
//         <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
//           <div className="flex items-center gap-2">
//             <h1 className="text-xl font-semibold text-gray-900">Custom Fields</h1>
//             <button className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs">
//               ?
//             </button>
//           </div>
//           <div className="flex items-center gap-4">
//             <span className="text-sm text-gray-600">Custom field used: 11/5</span>
//             <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
//               <span className="text-lg">+</span>
//               <span>Create Custom Fields</span>
//             </button>
//             <button className="p-2">
//               <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
//                 <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
//               </svg>
//             </button>
//             <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-orange-800 font-medium">
//               U
//             </div>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="border-b border-gray-200 bg-gray-50">
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Name
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Description
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Type
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Key
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Created By
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   AC
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {customFields.map((field, index) => (
//                 <tr key={index} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm font-medium text-gray-900">{field.name}</div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="text-sm text-gray-600">{field.description}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className="px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded">
//                       {field.type}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-600 font-mono">{field.key}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center gap-2">
//                       <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700">
//                         {field.createdBy.initials}
//                       </div>
//                       <span className="text-sm text-gray-900">{field.createdBy.name}</span>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <button
//                       className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
//                         field.isActive ? 'bg-green-500' : 'bg-gray-300'
//                       }`}
//                     >
//                       <span
//                         className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
//                           field.isActive ? 'translate-x-6' : 'translate-x-1'
//                         }`}
//                       />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Footer */}
//         <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
//           <div className="text-sm text-gray-600">
//             Showing 9 custom fields
//           </div>
//           <div className="flex items-center gap-2">
//             <span className="text-sm text-gray-600">Page 1 of 2</span>
//             <button className="p-1 text-gray-400 hover:text-gray-600">
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//               </svg>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CustomFieldsSection;