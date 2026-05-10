
import { useState, useEffect } from "react";
import { MessageSquare, Umbrella, Bot, RotateCcw, X, Loader2 } from 'lucide-react';
import AutomationApi from "../../services/AutomationApi";
import { showToast } from "../../utils/showToast";

const Automation = () => {
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [saving, setSaving] = useState(false);

  const automationTypes = [
    { 
      id: 'welcome', 
      name: 'Welcome Message', 
      desc: 'Welcome new customer automatically', 
      icon: MessageSquare,
      triggerType: 'event',
      triggerValue: 'new_contact'
    },
    { 
      id: 'away', 
      name: 'Away Message', 
      desc: 'Reply automatically when you are away', 
      icon: Umbrella,
      triggerType: 'event',
      triggerValue: 'out_of_office'
    },
    { 
      id: 'fallback', 
      name: 'Fallback Message', 
      desc: 'Send fallback message when no keywords match', 
      icon: RotateCcw,
      triggerType: 'event',
      triggerValue: 'no_match'
    },
    { 
      id: 'chatbot', 
      name: 'Chatbot Builder', 
      desc: 'Automate advance trigger based on keywords', 
      icon: Bot,
      triggerType: 'keyword',
      triggerValue: ''
    }
  ];

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    try {
      setLoading(true);
      const data = await AutomationApi.getAllAutomations();
      setAutomations(data);
    } catch (error) {
      showToast.error("Error", "Failed to load automations");
    } finally {
      setLoading(false);
    }
  };

  const getAutomationByTypeName = (name) => {
    return automations.find(a => a.name === name);
  };

  const handleToggle = async (type) => {
    const existing = getAutomationByTypeName(type.name);
    
    if (!existing) {
      // Create new if doesn't exist
      try {
        const newAuto = await AutomationApi.createAutomation({
          name: type.name,
          trigger: { type: type.triggerType, value: type.triggerValue },
          actions: [{ type: 'send_message', value: 'Hello! How can we help you today?' }],
          isActive: true
        });
        setAutomations([...automations, newAuto]);
        showToast.success("Success", `${type.name} enabled`);
      } catch (error) {
        showToast.error("Error", `Failed to enable ${type.name}`);
      }
    } else {
      // Toggle existing
      try {
        const updated = await AutomationApi.toggleAutomation(existing._id);
        setAutomations(automations.map(a => a._id === updated._id ? updated : a));
        showToast.success("Success", `${type.name} ${updated.isActive ? 'enabled' : 'disabled'}`);
      } catch (error) {
        showToast.error("Error", "Failed to update status");
      }
    }
  };

  const openEditModal = (type) => {
    const existing = getAutomationByTypeName(type.name);
    setSelectedAutomation({ ...type, dbId: existing?._id });
    
    // Find the send_message action value
    const msgAction = existing?.actions?.find(act => act.type === 'send_message');
    setMessageText(msgAction ? msgAction.value : "");
    setModalOpen(true);
  };

  const handleSaveMessage = async () => {
    if (!messageText.trim()) {
      showToast.warning("Warning", "Message cannot be empty");
      return;
    }

    try {
      setSaving(true);
      if (selectedAutomation.dbId) {
        // Update
        const updated = await AutomationApi.updateAutomation(selectedAutomation.dbId, {
          actions: [{ type: 'send_message', value: messageText }]
        });
        setAutomations(automations.map(a => a._id === updated._id ? updated : a));
      } else {
        // Create
        const newAuto = await AutomationApi.createAutomation({
          name: selectedAutomation.name,
          trigger: { type: selectedAutomation.triggerType, value: selectedAutomation.triggerValue },
          actions: [{ type: 'send_message', value: messageText }],
          isActive: true
        });
        setAutomations([...automations, newAuto]);
      }
      showToast.success("Success", "Message saved successfully");
      setModalOpen(false);
    } catch (error) {
      showToast.error("Error", "Failed to save message");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-gray-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
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
            <h2 className="text-xl font-semibold mb-5 text-gray-900">Greet People</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {automationTypes.slice(0, 2).map((type) => {
                const auto = getAutomationByTypeName(type.name);
                const Icon = type.icon;
                return (
                  <div key={type.id} className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg border border-gray-200 hover:border-blue-400 transition-all duration-300 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                          <Icon size={20} />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">{type.name}</h3>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={auto?.isActive || false}
                          onChange={() => handleToggle(type)}
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                    <p className="text-gray-600 text-sm mb-5 leading-relaxed">{type.desc}</p>
                    <button 
                      onClick={() => openEditModal(type)}
                      className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                    >
                      Set Message
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Advance Automation Section */}
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Advance Automation</h2>
            <p className="text-gray-600 text-sm mb-5">Automate repetitive processes with advance chat bot builder</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {automationTypes.slice(2).map((type) => {
                const auto = getAutomationByTypeName(type.name);
                const Icon = type.icon;
                return (
                  <div key={type.id} className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg border border-gray-200 hover:border-blue-400 transition-all duration-300 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                          <Icon size={20} />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">{type.name}</h3>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={auto?.isActive || false}
                          onChange={() => handleToggle(type)}
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                    <p className="text-gray-600 text-sm mb-5 leading-relaxed">{type.desc}</p>
                    <div className="flex gap-3 flex-wrap">
                      <button 
                        onClick={() => openEditModal(type)}
                        className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                      >
                        {type.id === 'chatbot' ? 'View Chatbots' : 'Set Message'}
                      </button>
                      {type.id === 'chatbot' && (
                        <button className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white shadow-sm hover:shadow-md transition-all duration-200">
                          Create Automation
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Message Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Set {selectedAutomation?.name}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Message Content</label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full h-32 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-gray-800"
                placeholder="Enter your automatic response message..."
              />
              <p className="text-xs text-gray-500 mt-2">This message will be sent automatically based on the trigger.</p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50">
              <button 
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveMessage}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving...' : 'Save Message'}
              </button>
            </div>
          </div>
        </div>
      )}
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