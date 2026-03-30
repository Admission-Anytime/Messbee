import React, { useState } from "react";
import { 
  XMarkIcon, 
  PlusIcon, 
  AtSymbolIcon, 
  InformationCircleIcon, 
  LockClosedIcon, 
  LinkIcon, 
  PaperClipIcon 
} from "@heroicons/react/24/outline";

const UserProfilePanel = ({ data, onClose, onViewHistory, availableLabels = [], statusOptions = [] }) => {
  
  // --- 1. STATE FOR PROFILE DATA ---
  const [profileData, setProfileData] = useState({
    name: data?.name || "",
    phone: data?.phone || "",
    email: data?.email || "",
    status: data?.chatStatus || "Open",
    institute: "University Of Delhi",
    gstn: "09AAX... (Verified)",
    city: "Ghaziabad, UP"
  });

  // Effect to sync when data changes
  React.useEffect(() => {
    setProfileData(prev => ({
      ...prev,
      name: data?.name || "",
      phone: data?.phone || "",
      email: data?.email || "",
      status: data?.chatStatus || "Open",
    }));
  }, [data]);

  // Derived labels for display
  const currentLabels = availableLabels.filter(l => data?.labels?.includes(l.name));

  // State to manage the Edit Form inputs before saving
  const [editForm, setEditForm] = useState({ ...profileData });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // --- 2. STATE FOR NOTES ---
  const [notes, setNotes] = useState([
    { 
      text: "Customer inquired about the new curriculum for Q3. Highly interested in the premium plan if GST billing is enabled.", 
      author: "Agent John", 
      date: "Feb 12" 
    }
  ]);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");

  // --- HANDLERS ---
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = () => {
    setProfileData(editForm); // Applies changes to the UI instantly!
    setIsEditModalOpen(false);
  };

  const handleSaveNote = () => {
    if (!newNoteContent.trim()) return;
    
    const newNote = {
      text: newNoteContent,
      author: "You", // Or current logged-in user
      date: "Just now"
    };

    setNotes([newNote, ...notes]); // Adds the new note to the top of the list!
    setNewNoteContent("");
    setIsNoteModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-100 relative w-full font-sans">
      
      {/* HEADER WITH CLOSE BUTTON */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 shrink-0 bg-white">
        <h3 className="text-sm font-bold text-slate-800">Contact Info</h3>
        <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all">
           <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        
        {/* TOP PROFILE INFO */}
        <div className="p-8 flex flex-col items-center border-b border-slate-50">
          <div className="relative mb-4">
              <img src={data?.avatar || `https://ui-avatars.com/api/?name=${profileData.name.replace(' ', '+')}&background=f3f4f6&color=6b7280`} alt="" className="w-24 h-24 rounded-2xl shadow-sm object-cover" />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#22C55E] border-[3px] border-white rounded-full"></span>
          </div>
          
          <h2 className="text-lg font-extrabold text-slate-900 text-center">{profileData.name}</h2>
          <p className="text-xs text-slate-500 font-medium mb-4">{profileData.phone}</p>
          
          <span className="px-4 py-1 text-[10px] font-bold rounded-md border uppercase tracking-widest shadow-sm" style={{
             backgroundColor: (statusOptions.find(s => s.label.toLowerCase() === profileData.status?.toLowerCase())?.original?.color + '15') || '#f1f5f9',
             color: statusOptions.find(s => s.label.toLowerCase() === profileData.status?.toLowerCase())?.original?.color || '#64748b',
             borderColor: (statusOptions.find(s => s.label.toLowerCase() === profileData.status?.toLowerCase())?.original?.color + '30') || '#e2e8f0'
          }}>
             {profileData.status}
          </span>
        </div>

        {/* CRM DETAILS CONTAINER */}
        <div className="p-6 space-y-8">
          
          {/* LABELS */}
          <div>
             <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Labels</h4>
             <div className="flex flex-wrap gap-2 items-center">
                 {currentLabels.length === 0 && <p className="text-[10px] text-slate-400 italic">No labels applied</p>}
                 {currentLabels.map(label => (
                    <span key={label._id || label.id} className="px-3 py-1.5 text-xs font-bold rounded-lg border shadow-sm" style={{
                       backgroundColor: label.color + '15',
                       color: label.color,
                       borderColor: label.color + '30'
                    }}>{label.name}</span>
                 ))}
                 <button className="w-8 h-8 flex items-center justify-center bg-white text-slate-400 rounded-full hover:bg-slate-50 border border-slate-200 transition-colors shadow-sm"><PlusIcon className="w-4 h-4" /></button>
             </div>
          </div>

          {/* CUSTOM FIELDS (Dynamically reading from state) */}
          <div>
             <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Custom Fields</h4>
             <div className="space-y-4">
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5 tracking-wider">Institute</p>
                    <p className="text-xs font-bold text-slate-900">{profileData.institute}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5 tracking-wider">GSTN</p>
                    <p className="text-xs font-bold text-slate-900">{profileData.gstn}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5 tracking-wider">City</p>
                    <p className="text-xs font-bold text-slate-900">{profileData.city}</p>
                 </div>
             </div>
          </div>
          
          {/* RECENT NOTES (Dynamically rendering from list) */}
          <div>
             <div className="flex justify-between items-center mb-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Notes</h4>
                <button onClick={() => setIsNoteModalOpen(true)} className="text-xs font-bold text-[#22C55E] hover:text-green-600 transition-colors">Add Note</button>
             </div>
             
             <div className="space-y-3">
               {notes.map((note, index) => (
                 <div key={index} className="bg-[#FFFDF0] border border-[#FDF0B4] p-4 rounded-xl relative">
                    <p className="text-xs text-slate-700 italic leading-relaxed mb-4">"{note.text}"</p>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                       <span>By {note.author}</span>
                       <span>{note.date}</span>
                    </div>
                 </div>
               ))}
             </div>
          </div>

        </div>
      </div>

      {/* FIXED FOOTER BUTTONS */}
      <div className="shrink-0 w-full bg-white border-t border-slate-100 p-6 flex flex-col gap-3 z-10">
         <button 
            onClick={() => { setEditForm(profileData); setIsEditModalOpen(true); }}
            className="w-full py-3.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
         >
            Edit Profile
         </button>
         <button onClick={onViewHistory} className="w-full py-3.5 bg-[#0f172a] text-white text-xs font-bold rounded-xl hover:bg-black transition-colors shadow-md">
            View Full History
         </button>
      </div>


      {/* ======================================================= */}
      {/* 🟢 1. "EDIT CONTACT PROFILE" MODAL (Fully Functional) 🟢 */}
      {/* ======================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-[600px] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
              
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                 <h3 className="font-bold text-slate-800">Edit Contact Profile</h3>
                 <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors"><XMarkIcon className="w-5 h-5"/></button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
                 <div className="flex justify-center mb-2">
                    <img src={`https://ui-avatars.com/api/?name=${editForm.name.replace(' ', '+')}`} alt="Avatar" className="w-16 h-16 rounded-full object-cover shadow-sm border border-slate-100" />
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Full Name</label>
                       <input type="text" name="name" value={editForm.name} onChange={handleEditChange} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] outline-none transition-shadow"/>
                    </div>
                    <div>
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">WhatsApp Number</label>
                       <input type="text" value={editForm.phone} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 outline-none cursor-not-allowed" readOnly/>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Email Address</label>
                       <input type="email" name="email" value={editForm.email} onChange={handleEditChange} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] outline-none transition-shadow"/>
                    </div>
                    <div>
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Status</label>
                       <select name="status" value={editForm.status} onChange={handleEditChange} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] outline-none transition-shadow">
                          {statusOptions.map(option => (
                             <option key={option.id} value={option.label.toLowerCase()}>{option.label}</option>
                          ))}
                          {statusOptions.length === 0 && <option value="open">Open</option>}
                       </select>
                    </div>
                 </div>

                 {/* Labels Box */}
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Labels</label>
                    <div className="min-h-[46px] border border-slate-200 rounded-xl p-2 flex flex-wrap gap-2 items-center focus-within:border-[#22C55E] focus-within:ring-1 focus-within:ring-[#22C55E] bg-white transition-shadow">
                        {currentLabels.map(label => (
                           <span key={label._id || label.id} className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border" style={{
                              backgroundColor: label.color + '15',
                              color: label.color,
                              borderColor: label.color + '30'
                           }}>{label.name} <XMarkIcon className="w-3 h-3 cursor-pointer opacity-70 hover:opacity-100"/></span>
                        ))}
                        <input type="text" placeholder="Search and add labels..." className="flex-1 min-w-[150px] outline-none text-sm px-1 py-1 text-slate-700 placeholder:text-slate-400 bg-transparent" />
                    </div>
                 </div>

                 {/* Custom Fields */}
                 <div className="pt-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Custom Fields</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Institute</label>
                          <input type="text" name="institute" value={editForm.institute} onChange={handleEditChange} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-[#22C55E] outline-none transition-shadow"/>
                       </div>
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">GSTN</label>
                          <input type="text" name="gstn" value={editForm.gstn} onChange={handleEditChange} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-[#22C55E] outline-none transition-shadow"/>
                       </div>
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">City</label>
                          <input type="text" name="city" value={editForm.city} onChange={handleEditChange} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-[#22C55E] outline-none transition-shadow"/>
                       </div>
                    </div>
                 </div>

              </div>

              <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                 <button onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors">Cancel</button>
                 <button onClick={handleSaveProfile} className="px-6 py-2.5 bg-[#22C55E] hover:bg-green-500 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">Save Changes</button>
              </div>
           </div>
        </div>
      )}


      {/* ======================================================= */}
      {/* 🟢 2. "ADD INTERNAL NOTE" MODAL (Based on Screenshot) 🟢 */}
      {/* ======================================================= */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                 <h3 className="font-bold text-slate-800">Add Internal Note</h3>
                 <button onClick={() => setIsNoteModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors"><XMarkIcon className="w-5 h-5"/></button>
              </div>

              <div className="p-6 space-y-5">
                 
                 {/* Mention Input */}
                 <div>
                    <label className="text-[11px] text-slate-500 font-medium mb-1.5 block">Mention Team Member</label>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-[#22C55E] focus-within:ring-1 focus-within:ring-[#22C55E] transition-all">
                       <AtSymbolIcon className="w-4 h-4 text-slate-400" />
                       <input type="text" placeholder="Search colleagues (e.g., @Arshlan)" className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400" />
                    </div>
                 </div>

                 {/* Note Content Area */}
                 <div>
                    <label className="text-[11px] text-slate-500 font-medium mb-1.5 block">Note Content</label>
                    
                    {/* The box itself matches the screenshot with the amber border inside */}
                    <div className="border border-amber-300 rounded-xl overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-amber-100 transition-shadow">
                       <textarea 
                          value={newNoteContent}
                          onChange={(e) => setNewNoteContent(e.target.value)}
                          placeholder="Write your internal note here..." 
                          className="w-full h-28 p-3 outline-none text-sm text-slate-800 placeholder:text-slate-400 resize-none bg-white"
                          autoFocus
                       ></textarea>
                       
                       {/* Amber Formatting Toolbar */}
                       <div className="bg-[#fffbeb] border-t border-amber-200 px-3 py-2.5 flex items-center justify-between">
                          
                          {/* Formatting Icons */}
                          <div className="flex items-center gap-3 text-slate-600">
                             <button className="font-serif font-bold text-sm hover:text-black">B</button>
                             <button className="font-serif italic font-bold text-sm hover:text-black">I</button>
                             <button className="hover:text-black"><LinkIcon className="w-4 h-4"/></button>
                             <button className="hover:text-black"><PaperClipIcon className="w-4 h-4"/></button>
                          </div>
                          
                          {/* Badge */}
                          <div className="flex items-center gap-1.5 text-amber-600 text-[10px] font-bold tracking-wider">
                             <LockClosedIcon className="w-3.5 h-3.5" /> INTERNAL ONLY
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Visibility info box */}
                 <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-500 leading-relaxed">
                    <InformationCircleIcon className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <p><strong className="text-slate-700">Visibility:</strong> This note is internal and will never be seen by the customer. Use it to collaborate with your team privately.</p>
                 </div>

              </div>

              <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-end gap-3">
                 <button onClick={() => setIsNoteModalOpen(false)} className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                 <button onClick={handleSaveNote} disabled={!newNoteContent.trim()} className="px-6 py-2 bg-[#22C55E] hover:bg-green-500 text-white text-sm font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Save Note</button>
              </div>

           </div>
        </div>
      )}

    </div>
  );
};

export default UserProfilePanel;