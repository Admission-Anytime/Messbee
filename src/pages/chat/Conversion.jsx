import React, { useState, useEffect, useRef } from "react";

const Conversion = ({ data, onSendMessage, onBack, onDeleteMessage, onClearChat, onDeleteChat, onToggleProfile }) => {
  const [inputText, setInputText] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data.messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText("");
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none z-0" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')"}}></div>

      {/* HEADER */}
      <div className="h-16 px-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-sm z-20">
         <div className="flex items-center gap-3 cursor-pointer" onClick={onToggleProfile}>
            <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="md:hidden p-2 -ml-2 text-slate-500 hover:text-[#ba2525]">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <img src={data.avatar} alt="" className="w-10 h-10 rounded-full border border-slate-100" />
            <div>
               <h3 className="text-sm font-bold text-slate-800">{data.name}</h3>
               <p className={`text-[10px] font-bold flex items-center gap-1 ${data.status === 'online' ? 'text-green-600' : 'text-slate-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${data.status === 'online' ? 'bg-green-500' : 'bg-slate-300'}`}></span> {data.status === 'online' ? 'Online' : 'Offline'}
               </p>
            </div>
         </div>
         
         <div className="flex gap-1 text-slate-400" ref={menuRef}>
             {/* Info Button */}
            <button onClick={onToggleProfile} className="p-2 hover:bg-slate-50 rounded-full hover:text-[#ba2525] transition-colors" title="Contact Info">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>

            {/* Menu Dropdown */}
            <div className="relative">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-2 rounded-full transition-colors ${isMenuOpen ? "bg-slate-100 text-slate-800" : "hover:bg-slate-50"}`}>
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                        <button onClick={() => { onClearChat(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                            <span>Clear chat</span>
                        </button>
                        <button onClick={() => { onDeleteChat(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                            <span>Delete chat</span>
                        </button>
                    </div>
                )}
            </div>
         </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 z-10 scroll-smooth custom-scrollbar">
         {data.messages.length === 0 ? (
             <div className="flex h-full items-center justify-center text-xs text-slate-400 uppercase tracking-widest font-bold opacity-50">No Messages</div>
         ) : (
             data.messages.map((msg, index) => (
               <div key={index} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"} group`}>
                  <div className="flex items-center gap-2 max-w-[85%] md:max-w-[65%]">
                      {msg.sender === "me" && (
                          <button onClick={() => onDeleteMessage(msg.id)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      )}
                      <div className={`relative px-4 py-2 text-sm rounded-xl shadow-sm ${msg.sender === "me" ? "bg-[#d9fdd3] text-slate-900 rounded-tr-none" : "bg-white text-slate-900 rounded-tl-none"}`}>
                         <p className="leading-relaxed text-[13px] md:text-sm">{msg.text}</p>
                         <span className="text-[9px] block text-right mt-1 font-medium opacity-60">{msg.time}</span>
                      </div>
                  </div>
               </div>
             ))
         )}
         <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-3 bg-white border-t border-slate-200 z-20">
         <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type a message..." className="flex-1 bg-slate-100 border-transparent text-sm px-4 py-3 rounded-xl focus:bg-white focus:border-[#ba2525] focus:ring-1 focus:ring-[#ba2525] outline-none transition-all" />
            <button type="submit" className="p-3 bg-[#ba2525] text-white rounded-xl hover:bg-[#a01f1f] shadow-md transition-all active:scale-95"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg></button>
         </form>
      </div>
    </div>
  );
};

export default Conversion;