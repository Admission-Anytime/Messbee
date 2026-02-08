import React, { useState } from "react";

// Icons
const ChevronDown = () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const ChevronRight = () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const InboxIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>;

const Infobox = ({ activeFilter, onFilterSelect }) => {
  // Config Data
  const INITIAL_SECTIONS = [
    {
      id: "inbox",
      title: "Inbox One",
      icon: <InboxIcon />,
      isOpen: true,
      items: ["All Chat", "My Chat", "Unassigned", "Pinned Chats", "Blocked Chats"]
    },
    {
      id: "api",
      title: "Wp API Number",
      icon: <span className="font-bold text-xs border border-current rounded px-1">#</span>,
      isOpen: false,
      items: ["Admission Anytime"]
    },
    {
      id: "status",
      title: "Status",
      icon: <span className="w-2 h-2 rounded-full bg-green-500"></span>,
      isOpen: false,
      items: ["Open", "Resolved"]
    },
    {
      id: "labels",
      title: "Labels",
      icon: <span className="w-2 h-2 rounded-full bg-blue-500"></span>,
      isOpen: false,
      items: ["Hot Lead", "Cold Lead"]
    }
  ];

  const [sections, setSections] = useState(INITIAL_SECTIONS);

  const toggleSection = (id) => {
    setSections(sections.map(sec => sec.id === id ? { ...sec, isOpen: !sec.isOpen } : sec));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-slate-100 shrink-0">
        <h2 className="text-xl font-bold text-slate-800">Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {sections.map((section) => (
          <div key={section.id} className="mb-2">
            <button 
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-400 group-hover:text-[#ba2525]">{section.icon}</span>
                <span className="text-sm font-bold">{section.title}</span>
              </div>
              <span className="text-slate-400">
                {section.isOpen ? <ChevronDown /> : <ChevronRight />}
              </span>
            </button>

            {section.isOpen && (
              <div className="mt-1 ml-4 pl-4 border-l border-slate-100 space-y-1">
                {section.items.map((label, idx) => (
                  <button 
                    key={idx}
                    onClick={() => onFilterSelect(label)} // ✅ Click Handler
                    className={`w-full text-left px-3 py-2 text-xs font-medium rounded-md transition-all 
                      ${activeFilter === label ? "text-[#ba2525] bg-[#ba2525]/5 font-bold" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Infobox;