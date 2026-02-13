import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Plus, Type, Image as ImageIcon, 
  Sticker, Music, Video, FileText, Link, 
  User, Headset, ShoppingCart, Upload, X, Phone, Video as VideoIcon, CheckCircle2,
  Pencil, Trash2, AlertCircle 
} from 'lucide-react';

const QuickReply = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('TEXT');
  const [message, setMessage] = useState('');
  const [shortcut, setShortcut] = useState('');
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const fileInputRef = useRef(null);

  const [replies, setReplies] = useState([
    { shortcut: '/welcome', content: 'Hello! Welcome to our service. How can ...', type: 'TEXT', color: 'bg-emerald-100 text-emerald-600' },
    { shortcut: '/pricing', content: 'You can find our detailed pricing sheet ...', type: 'MEDIA', color: 'bg-purple-100 text-purple-600' },
    { shortcut: '/hours', content: 'Our business hours are Mon-Fri, 9am to ...', type: 'TEXT', color: 'bg-blue-100 text-blue-600' },
  ]);

  // Sync Logic: Preview ke liye data decide karna
  const previewData = isModalOpen 
    ? { content: message, type: selectedType } 
    : replies.length > 0 
      ? replies[replies.length - 1] 
      : null;

  useEffect(() => {
    if (showSuccessCard) {
      const timer = setTimeout(() => setShowSuccessCard(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessCard]);

  const handleSave = () => {
    const newReply = {
      shortcut: shortcut.startsWith('/') ? shortcut : `/${shortcut || 'new'}`,
      content: message || 'No content',
      type: selectedType,
      color: 'bg-blue-100 text-blue-600'
    };

    if (editingIndex !== null) {
      const updatedReplies = [...replies];
      updatedReplies[editingIndex] = newReply;
      setReplies(updatedReplies);
    } else {
      setReplies([...replies, newReply]);
    }

    setIsModalOpen(false);
    setShowSuccessCard(true);
    resetForm();
  };

  const handleEdit = (index) => {
    const item = replies[index];
    setShortcut(item.shortcut.replace('/', ''));
    setMessage(item.content);
    setSelectedType(item.type);
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    const updatedReplies = replies.filter((_, i) => i !== deleteIndex);
    setReplies(updatedReplies);
    setDeleteIndex(null);
    setShowSuccessCard(true);
  };

  const resetForm = () => {
    setMessage('');
    setShortcut('');
    setSelectedType('TEXT');
    setEditingIndex(null);
  };

  const addVariable = (variable) => {
    setMessage(prev => prev + ` {{${variable}}}`);
  };

  return (
    <div className="flex h-screen w-full font-sans relative overflow-hidden bg-white text-slate-700">
      
      {/* SUCCESS MODAL */}
      {showSuccessCard && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-300">
          <div className="bg-white border-emerald-100 border shadow-2xl rounded-3xl p-8 flex flex-col items-center gap-4 min-w-[320px] transform animate-in zoom-in duration-300">
            <div className="bg-emerald-500 p-4 rounded-full text-white shadow-xl shadow-emerald-200 animate-bounce">
              <CheckCircle2 size={40} />
            </div>
            <div className="text-center">
              <h4 className="text-xl font-bold text-slate-800">Saved Successfully!</h4>
              <p className="text-sm text-gray-500 mt-1">Your quick reply is now active.</p>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteIndex !== null && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border-red-100 border shadow-2xl rounded-3xl p-8 flex flex-col items-center max-w-sm w-full mx-4 transform animate-in zoom-in duration-200">
            <div className="bg-red-100 p-4 rounded-full text-red-600 mb-4">
              <AlertCircle size={48} />
            </div>
            <h4 className="text-xl font-bold mb-2 text-slate-800">Are you sure?</h4>
            <p className="text-center text-gray-500 text-sm mb-8">This action cannot be undone. This quick reply will be permanently removed.</p>
            <div className="flex w-full gap-3">
              <button onClick={() => setDeleteIndex(null)} className="flex-1 py-3 rounded-xl font-bold text-sm transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-200 transition-all active:scale-95">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* LEFT DASHBOARD */}
      <div className="flex-1 flex flex-col border-r border-gray-200">
        <div className="p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">Quick Replies</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search quick replies..." className="pl-10 pr-4 py-2 border rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 border-gray-200" />
            </div>
            <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-all active:scale-95">
              <Plus className="w-5 h-5" /> Create Quick Reply
            </button>
          </div>
        </div>

        <div className="px-6 overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-semibold uppercase tracking-wider border-b text-gray-400 border-gray-100">
                <th className="pb-4 w-1/4">Shortcut</th>
                <th className="pb-4 w-1/2">Message Content</th>
                <th className="pb-4">Type</th>
                <th className="pb-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {replies.map((reply, idx) => (
                <tr key={idx} className="group transition-colors hover:bg-slate-50">
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-md text-sm font-medium ${reply.color}`}>{reply.shortcut}</span>
                  </td>
                  <td className="py-4 text-sm text-gray-600">{reply.content}</td>
                  <td className="py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${reply.type === 'TEXT' ? 'text-blue-500 border-blue-200 bg-blue-50' : 'text-purple-500 border-purple-200 bg-purple-50'}`}>{reply.type}</span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleEdit(idx)} className="text-gray-400 hover:text-emerald-500 transition-colors"><Pencil size={18} /></button>
                      <button onClick={() => setDeleteIndex(idx)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT PREVIEW - SYNCED LOGIC */}
      <div className="w-[400px] flex flex-col items-center justify-center p-8 border-l bg-slate-50 border-gray-100">
        <div className="relative w-[280px] h-[580px] bg-black rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden">
          <div className="h-full w-full bg-[#e5ddd5] flex flex-col">
            <div className="bg-[#075e54] p-4 pt-8 flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold leading-tight">Preview Chat</p>
                <p className="text-[10px] opacity-80">online</p>
              </div>
              <div className="flex gap-3"><VideoIcon className="w-4 h-4" /><Phone className="w-4 h-4" /></div>
            </div>
            
            <div className="flex-1 p-3 space-y-4 overflow-y-auto">
              <div className="bg-white p-2 rounded-lg text-[11px] max-w-[80%] shadow-sm text-slate-800">
                Hi, I have a quick question about your services!
                <p className="text-[9px] text-right text-gray-400 mt-1">10:02 AM</p>
              </div>

              {previewData ? (
                <div key={replies.length} className="bg-[#dcf8c6] p-2 rounded-lg text-[11px] max-w-[80%] ml-auto shadow-sm break-words text-slate-800 animate-in slide-in-from-right-2 duration-300">
                  {previewData.type !== 'TEXT' && (
                     <div className="mb-2 p-3 bg-black/5 rounded-md flex flex-col items-center justify-center border border-black/5">
                        {previewData.type === 'IMAGE' && <ImageIcon size={24} className="text-gray-500" />}
                        {previewData.type === 'STICKER' && <Sticker size={24} className="text-gray-500" />}
                        {previewData.type === 'AUDIO' && <Music size={24} className="text-gray-500" />}
                        {previewData.type === 'VIDEO' && <Video size={24} className="text-gray-500" />}
                        {previewData.type === 'FILE' && <FileText size={24} className="text-gray-500" />}
                        <span className="text-[8px] mt-1 font-bold text-gray-400">{previewData.type} ATTACHMENT</span>
                     </div>
                  )}
                  <span className="whitespace-pre-wrap">{previewData.content || "Hello! Welcome to our service..."}</span>
                  <p className="text-[9px] text-right text-gray-400 mt-1 flex items-center justify-end gap-0.5">
                    10:02 AM <CheckCircle2 size={8} className="text-blue-400" />
                  </p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-40">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                    <Type className="text-gray-400" size={20}/>
                  </div>
                  <p className="text-[10px] text-gray-500">No active quick replies</p>
                </div>
              )}
            </div>

            <div className="p-2 bg-gray-50 flex items-center gap-2">
              <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-[11px] text-gray-400 border border-gray-200">Message</div>
            </div>
          </div>
        </div>
        <p className="mt-6 text-slate-500 font-semibold text-sm tracking-wide">Real-time Preview</p>
      </div>

      {/* CREATE/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border bg-white border-emerald-100">
            <div className="p-6 border-b flex justify-between items-center border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{editingIndex !== null ? 'Edit Quick Reply' : 'Create Multi-Format Quick Reply'}</h2>
                <p className="text-sm text-gray-500">Configure your automated response type and content.</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="text-sm font-semibold mb-3 block">Response Type</label>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {[{ icon: <Type />, label: 'TEXT' }, { icon: <ImageIcon />, label: 'IMAGE' }, { icon: <Sticker />, label: 'STICKER' }, { icon: <Music />, label: 'AUDIO' }, { icon: <Video />, label: 'VIDEO' }, { icon: <FileText />, label: 'FILE' }, { icon: <Link />, label: 'CTA URL' }].map((item, i) => (
                    <button key={i} onClick={() => setSelectedType(item.label)} className={`flex flex-col items-center justify-center min-w-[75px] h-20 rounded-xl border-2 transition-all ${selectedType === item.label ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100 text-gray-400'}`}>
                      {React.cloneElement(item.icon, { size: 20 })}
                      <span className="text-[10px] font-bold mt-2">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Shortcut</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">/</span>
                  <input type="text" value={shortcut} onChange={(e) => setShortcut(e.target.value)} placeholder="welcome" className="w-full pl-8 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 border-gray-200" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-semibold">Message Content</label>
                  <span className="text-[10px] text-gray-400">{message.length} / 4096</span>
                </div>
                <div className="flex gap-2 mb-3">
                  {['customer_name', 'agent_name', 'order_id'].map((v) => (
                    <button key={v} onClick={() => addVariable(v)} className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium transition-all bg-white border-gray-200 hover:bg-emerald-50">
                      {v === 'order_id' ? <ShoppingCart size={14}/> : v === 'agent_name' ? <Headset size={14}/> : <User size={14}/>} {`{{${v}}}`}
                    </button>
                  ))}
                </div>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows="4" placeholder="Type your message here..." className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none bg-slate-50 border-gray-200"></textarea>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Media Upload</label>
                <div onClick={() => fileInputRef.current.click()} className="border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer border-gray-200 bg-slate-50/50 hover:bg-emerald-50/30">
                  <Upload className="text-emerald-500 mb-4" />
                  <p className="text-sm">Drag and drop or <span className="text-emerald-500 font-semibold underline">browse</span></p>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" />
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-3 bg-slate-50/30 border-gray-100">
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-6 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
              <button onClick={handleSave} className="px-6 py-2 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-md transition-all active:scale-95">
                {editingIndex !== null ? 'Update Quick Reply' : 'Save Quick Reply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickReply;