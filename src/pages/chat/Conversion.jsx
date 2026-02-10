import React, { useState, useEffect, useRef } from "react";
import { 
  PaperClipIcon, FaceSmileIcon, MicrophoneIcon, 
  EllipsisVerticalIcon, MagnifyingGlassIcon, ClockIcon 
} from "@heroicons/react/24/outline";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

const Conversion = ({ data, onSendMessage, onBack, onToggleProfile }) => {
  const [inputText, setInputText] = useState("");
  const [inputMode, setInputMode] = useState("reply"); // 'reply' or 'note'
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data.messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText("");
  };

  return (
    <div className="flex flex-col h-full relative bg-[#efeae2]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none z-0" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')"}}></div>

      {/* --- 1. HEADER (With Timer) --- */}
      <div className="h-16 px-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-sm z-20">
         <div className="flex items-center gap-3 cursor-pointer" onClick={onToggleProfile}>
            <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="md:hidden p-2 -ml-2 text-slate-500">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <img src={data.avatar} alt="" className="w-10 h-10 rounded-full" />
            <div>
               <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-800">{data.name}</h3>
               </div>
               <p className="text-[11px] text-slate-500">{data.phone}</p>
            </div>
         </div>
         
         <div className="flex items-center gap-4">
            {/* TIMER */}
            {data.timer && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100">
                    <ClockIcon className="w-4 h-4" />
                    <span className="text-xs font-mono font-bold">{data.timer}</span>
                </div>
            )}
            
            <div className="flex text-slate-500 gap-1">
               <button className="p-2 hover:bg-slate-100 rounded-full"><MagnifyingGlassIcon className="w-5 h-5" /></button>
               <button className="p-2 hover:bg-slate-100 rounded-full"><EllipsisVerticalIcon className="w-5 h-5" /></button>
            </div>
         </div>
      </div>

      {/* --- 2. MESSAGES --- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10 custom-scrollbar">
         {data.messages.map((msg, index) => (
           <div key={index} className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"}`}>
              
              {/* Message Bubble */}
              <div className={`relative px-3 py-2 text-sm rounded-lg shadow-sm max-w-[85%] md:max-w-[65%] 
                 ${msg.sender === "me" ? "bg-[#d9fdd3] text-slate-900 rounded-tr-none" : "bg-white text-slate-900 rounded-tl-none"}`}>
                 
                 <p className="leading-relaxed text-[14px]">{msg.text}</p>
                 <span className="text-[10px] block text-right mt-1 text-slate-400">{msg.time}</span>
              </div>

              {/* Action Buttons (India / Abroad) */}
              {msg.buttons && (
                  <div className="flex gap-2 mt-2">
                      {msg.buttons.map((btn, idx) => (
                          <button key={idx} className="px-4 py-1.5 bg-white text-[#ba2525] text-sm font-bold shadow-sm rounded border border-slate-100 hover:bg-slate-50">
                              {btn}
                          </button>
                      ))}
                  </div>
              )}
           </div>
         ))}
         <div ref={messagesEndRef} />
      </div>

      {/* --- 3. FOOTER (Tabs + Toolbar + Input) --- */}
      <div className="bg-white border-t border-slate-200 z-20">
         
         {/* Reply / Private Note Tabs */}
         <div className="flex px-4 pt-2 gap-6">
            <button 
                onClick={() => setInputMode("reply")}
                className={`pb-2 text-sm font-bold border-b-2 transition-all ${inputMode === 'reply' ? 'text-[#ba2525] border-[#ba2525]' : 'text-slate-400 border-transparent'}`}
            >
                Reply
            </button>
            <button 
                onClick={() => setInputMode("note")}
                className={`pb-2 text-sm font-bold border-b-2 transition-all ${inputMode === 'note' ? 'text-amber-500 border-amber-500' : 'text-slate-400 border-transparent'}`}
            >
                Private note
            </button>
         </div>

         {/* Input Area */}
         <div className={`p-3 ${inputMode === 'note' ? 'bg-amber-50/30' : 'bg-slate-50'}`}>
             <form onSubmit={handleSubmit} className="flex items-end gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                
                {/* Toolbar (B, I, Emoji, Attach) */}
                <div className="flex gap-1 pb-1">
                    <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600"><FaceSmileIcon className="w-5 h-5" /></button>
                    <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600"><PaperClipIcon className="w-5 h-5" /></button>
                    {/* Rich Text Fakes */}
                    <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600 font-bold font-serif px-2">B</button>
                    <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600 italic font-serif px-2">I</button>
                </div>

                {/* Text Field */}
                <input 
                   type="text" 
                   value={inputText} 
                   onChange={(e) => setInputText(e.target.value)} 
                   placeholder={inputMode === 'note' ? "Add a private note..." : "Type a message..."} 
                   className="flex-1 bg-transparent border-none outline-none text-sm px-2 py-2 max-h-32" 
                />

                {/* Send Button */}
                <button type="submit" className={`p-2 rounded-lg text-white shadow-md transition-all active:scale-95 ${inputMode === 'note' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#ba2525] hover:bg-[#a01f1f]'}`}>
                   <PaperAirplaneIcon className="w-5 h-5" />
                </button>
             </form>
             
             {/* Bottom Hint */}
             <p className="text-[10px] text-slate-400 mt-1 px-2">
                Use Ctrl + Enter to send.
             </p>
         </div>
      </div>

    </div>
  );
};

export default Conversion;