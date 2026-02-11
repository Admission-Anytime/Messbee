// import React, { useState } from "react";
// import { 
//   InboxIcon, 
//   HashtagIcon, 
//   CheckCircleIcon, 
//   TagIcon, 
//   ChevronLeftIcon,
//   ChevronRightIcon,
//   ChevronDownIcon 
// } from "@heroicons/react/24/outline";

// const Infobox = ({ activeFilter, onFilterSelect }) => {
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   // Configuration Data
//   const INITIAL_SECTIONS = [
//     {
//       id: "inbox",
//       title: "Inbox One",
//       icon: <InboxIcon className="w-5 h-5" />,
//       isOpen: true,
//       items: ["All Chat", "My Chat", "Unassigned", "Pinned Chats", "Blocked Chats"]
//     },
//     {
//       id: "api",
//       title: "Wp API Number",
//       icon: <HashtagIcon className="w-5 h-5" />,
//       isOpen: false,
//       items: ["Admission Anytime"]
//     },
//     {
//       id: "status",
//       title: "Status",
//       icon: <CheckCircleIcon className="w-5 h-5" />,
//       isOpen: false,
//       items: ["Open", "Resolved"]
//     },
//     {
//       id: "labels",
//       title: "Labels",
//       icon: <TagIcon className="w-5 h-5" />,
//       isOpen: false,
//       items: ["Hot Lead", "Cold Lead"]
//     }
//   ];

//   const [sections, setSections] = useState(INITIAL_SECTIONS);

//   const toggleSection = (id) => {
//     if (isCollapsed) setIsCollapsed(false); // Auto-expand if clicking an icon
//     setSections(sections.map(sec => sec.id === id ? { ...sec, isOpen: !sec.isOpen } : sec));
//   };

//   return (
//     <div 
//       className={`flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-300 ease-in-out
//       ${isCollapsed ? "w-16" : "w-64"} shrink-0`}
//     >
      
//       {/* 1. HEADER */}
//       <div className={`h-16 flex items-center border-b border-slate-100 shrink-0 ${isCollapsed ? "justify-center" : "justify-between px-5"}`}>
//         {!isCollapsed && <h2 className="text-xl font-bold text-slate-800 whitespace-nowrap">Chat</h2>}
        
//         <button 
//           onClick={() => setIsCollapsed(!isCollapsed)}
//           className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
//           title={isCollapsed ? "Expand" : "Collapse"}
//         >
//           {isCollapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
//         </button>
//       </div>

//       {/* 2. LIST AREA */}
//       <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
//         {sections.map((section) => (
//           <div key={section.id} className="relative group">
            
//             {/* Main Button */}
//             <button 
//               onClick={() => toggleSection(section.id)}
//               className={`w-full flex items-center px-3 py-2.5 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors
//                 ${isCollapsed ? "justify-center" : "justify-between"}
//               `}
//             >
//               <div className="flex items-center gap-3">
//                 <span className={`text-slate-500 group-hover:text-[#ba2525] transition-colors ${activeFilter && section.items.includes(activeFilter) ? "text-[#ba2525]" : ""}`}>
//                   {section.icon}
//                 </span>
//                 {!isCollapsed && <span className="text-sm font-bold truncate">{section.title}</span>}
//               </div>
              
//               {!isCollapsed && (
//                 <span className={`text-slate-400 transition-transform duration-200 ${section.isOpen ? "rotate-180" : ""}`}>
//                   <ChevronDownIcon className="w-3.5 h-3.5" />
//                 </span>
//               )}
//             </button>

//             {/* Tooltip (Visible ONLY when collapsed & hovered) */}
//             {isCollapsed && (
//               <div className="absolute left-14 top-2 z-50 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
//                 {section.title}
//               </div>
//             )}

//             {/* Sub-Items (Hidden if collapsed) */}
//             {!isCollapsed && section.isOpen && (
//               <div className="mt-1 ml-4 pl-4 border-l-2 border-slate-100 space-y-0.5">
//                 {section.items.map((label, idx) => (
//                   <button 
//                     key={idx}
//                     onClick={() => onFilterSelect(label)} 
//                     className={`w-full text-left px-3 py-2 text-xs font-medium rounded-md transition-all truncate
//                       ${activeFilter === label 
//                         ? "text-[#ba2525] bg-[#ba2525]/5 font-bold border-l-2 border-[#ba2525]" 
//                         : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}
//                     `}
//                   >
//                     {label}
//                   </button>
//                 ))}
//               </div>
//             )}

//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Infobox;