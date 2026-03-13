import { useState, useRef, useEffect } from 'react';
import axios from '../../context/axios';
import { 
  Plus, Type, Image as ImageIcon, 
  Sticker, Music, Video as VideoIcon, FileText, Link, 
  User, Upload, X, Pencil, Trash2, ExternalLink, AlertTriangle 
} from 'lucide-react';
import { toast } from '../../utils/showToast';
import ErrorState from '../../components/ui/ErrorState'; 

const QuickReply = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Delete confirmation state
  const [itemToDelete, setItemToDelete] = useState(null); // ID of item to delete
  const [selectedType, setSelectedType] = useState('TEXT');
  const [message, setMessage] = useState('');
  const [shortcut, setShortcut] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [url, setUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null); 
  const [editingIndex, setEditingIndex] = useState(null);
  const fileInputRef = useRef(null);

  const [replies, setReplies] = useState([]);
  const [activePreview, setActivePreview] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = '/quick-replies';
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; 

  useEffect(() => {
    fetchReplies();
  }, []);

  const fetchReplies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(API_URL);
      const data = Array.isArray(response.data) ? response.data : [];
      setReplies(data);
      if (data.length > 0) setActivePreview(data[0]);
    } catch (error) {
      setReplies([]);
      setError(error.response?.data?.message || "Could not connect to server. Please check if backend is running.");
      toast.error("⚠️ Could not connect to server. Please check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 16 * 1024 * 1024) { 
        toast.error("File size too large! Max 16MB.");
        return;
      }
      setSelectedFile(file);
      toast.success(`📎 File selected: ${file.name}`);
    }
  };

  // Open confirmation card instead of window.confirm
  const openDeleteConfirmation = (e, id) => {
    e.stopPropagation();
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  //  Final Delete Logic
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${itemToDelete}`);
      toast.success("Deleted successfully!"); // Toaster message
      fetchReplies();
      if (activePreview?._id === itemToDelete) setActivePreview(null);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error("❌ Failed to delete quick reply. Please try again.");
    }
  };

  const getPreviewImage = () => {
    if (isModalOpen && selectedFile) {
      return URL.createObjectURL(selectedFile);
    }
    if (activePreview?.mediaUrl) {
      return `${BASE_URL}${activePreview.mediaUrl}`;
    }
    return null;
  };

  const previewData = isModalOpen 
    ? { content: message, type: selectedType, buttonText, url } 
    : activePreview;

  const handleSave = async () => {
    // Validation
    if (!shortcut.trim()) {
      toast.warning("⚠️ Please enter a shortcut!");
      return;
    }
    if (!message.trim() && !selectedFile) {
      toast.warning("⚠️ Please add a message or select a file!");
      return;
    }

    const formData = new FormData();
    formData.append('shortcut', shortcut.startsWith('/') ? shortcut : `/${shortcut || 'new'}`);
    formData.append('content', message || '');
    formData.append('type', selectedType);
    formData.append('buttonText', buttonText);
    formData.append('url', url);
    
    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    try {
      // Don't set Content-Type manually - browser will set it with correct boundary for FormData
      
      if (editingIndex !== null) {
        const id = replies[editingIndex]._id;
        await axios.put(`${API_URL}/${id}`, formData);
        toast.success("Updated Successfully!");
      } else {
        await axios.post(API_URL, formData);
        toast.success("Saved Successfully!"); 
      }
      fetchReplies();
      closeModal();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to save quick reply";
      toast.error(`❌ ${errorMsg}`);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setMessage('');
    setShortcut('');
    setSelectedType('TEXT');
    setButtonText('');
    setUrl('');
    setSelectedFile(null);
    setEditingIndex(null);
  };

  const handleEdit = (e, index) => {
    e.stopPropagation(); 
    const item = replies[index];
    setShortcut(item.shortcut.replace('/', ''));
    setMessage(item.content);
    setSelectedType(item.type);
    setButtonText(item.buttonText || '');
    setUrl(item.url || '');
    setEditingIndex(index);
    setIsModalOpen(true);
      toast.info(`✏️ Editing: ${item.shortcut}`);
  };

  // Show error state if error occurred
  if (error && !loading) {
    return <ErrorState onRetry={fetchReplies} message={error} />;
  }

  return (
    <div className="flex h-screen w-full font-sans bg-white text-slate-700 overflow-hidden">
      
      <div className="flex-1 flex flex-col min-w-0 border-r border-gray-100">
        <div className="p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Quick Replies</h1>
          <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm active:scale-95">
            <Plus size={20} /> Create Quick Reply
          </button>
        </div>

        <div className="px-6 flex-1 overflow-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">
                <th className="px-4 pb-2">Shortcut</th>
                <th className="px-4 pb-2">Message Content</th>
                <th className="px-4 pb-2">Type</th>
                <th className="px-4 pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {replies.map((reply, idx) => (
                <tr 
                  key={reply._id || idx} 
                  onClick={() => setActivePreview(reply)}
                  className={`group cursor-pointer transition-all ${activePreview === reply ? 'bg-emerald-50/60 shadow-sm' : 'hover:bg-slate-50'}`}
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">{reply.shortcut}</span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600 truncate max-w-[200px] md:max-w-xs">{reply.content || "Media Only"}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md border border-blue-200 bg-blue-50 text-blue-500 uppercase">{reply.type}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={(e) => handleEdit(e, idx)} className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"><Pencil size={16} /></button>
                      {/*  Trigger Confirmation Card */}
                      <button onClick={(e) => openDeleteConfirmation(e, reply._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PREVIEW SIDEBAR */}
      <div className="hidden lg:flex w-[380px] xl:w-[450px] bg-slate-50 flex-col items-center justify-center p-10">
         <div className="relative w-[280px] h-[580px] bg-slate-900 rounded-[3rem] border-[10px] border-slate-800 shadow-2xl overflow-hidden scale-90 xl:scale-100 transition-transform">
            <div className="h-full w-full bg-[#f0f2f5] flex flex-col">
                <div className="bg-[#00a884] p-4 pt-10 flex items-center gap-3 text-white">
                  <User size={24} className="bg-white/20 rounded-full p-1"/>
                  <div className="flex-1"><p className="text-xs font-bold">Preview Chat</p></div>
                </div>
                <div className="flex-1 p-4 space-y-4">
                   {previewData && (
                     <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm text-xs max-w-[85%] animate-in slide-in-from-left duration-300">
                        {previewData.type !== 'TEXT' && (
                          <div className="mb-2 min-h-32 bg-slate-100 rounded-lg overflow-hidden flex flex-col items-center justify-center border border-slate-200">
                            {getPreviewImage() ? (
                                <img src={getPreviewImage()} alt="preview" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <ImageIcon size={24} className="text-slate-300" />
                                    <span className="text-[9px] mt-1 uppercase font-bold text-slate-400">{previewData.type} Placeholder</span>
                                </>
                            )}
                          </div>
                        )}
                        <p className="whitespace-pre-wrap leading-relaxed">{previewData.content}</p>
                        {previewData.buttonText && (
                          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-center text-blue-500 font-bold gap-1">
                            <ExternalLink size={12} /> {previewData.buttonText}
                          </div>
                        )}
                     </div>
                   )}
                </div>
            </div>
         </div>
      </div>

      {/* ✅ DELETE CONFIRMATION CARD (MODAL) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Confirm Delete</h3>
            <p className="text-sm text-slate-500 mb-6">Are you sure you want to remove this quick reply? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={handleConfirmDelete} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold shadow-lg shadow-red-200 transition-all active:scale-95">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE/EDIT MODAL AREA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full h-full sm:h-auto sm:max-w-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[100vh] sm:max-h-[90vh]">
            
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">Create Multi-Format Quick Reply</h2>
                <p className="text-xs text-gray-400 font-medium">Configure your automated response and content.</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={22} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Type Selection */}
              <div>
                <label className="text-sm font-bold text-slate-700 mb-4 block">Response Type</label>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {[
                    { id: 'TEXT', label: 'TEXT', icon: <Type size={18}/> },
                    { id: 'IMAGE', label: 'IMAGE', icon: <ImageIcon size={18}/> },
                    { id: 'STICKER', label: 'STICKER', icon: <Sticker size={18}/> },
                    { id: 'AUDIO', label: 'AUDIO', icon: <Music size={18}/> },
                    { id: 'VIDEO', label: 'VIDEO', icon: <VideoIcon size={18}/> },
                    { id: 'FILE', label: 'FILE', icon: <FileText size={18}/> },
                    { id: 'CTA URL', label: 'CTA URL', icon: <Link size={18}/> }
                  ].map((type) => (
                    <button 
                      key={type.id} 
                      onClick={() => { setSelectedType(type.id); setSelectedFile(null); }}
                      className={`flex flex-col items-center justify-center min-w-[70px] h-[70px] rounded-2xl border-2 transition-all ${selectedType === type.id ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                    >
                      {type.icon}
                      <span className="text-[9px] font-black mt-1 uppercase">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Shortcut & CTA Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Shortcut</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold group-focus-within:text-emerald-500">/</span>
                    <input type="text" value={shortcut} onChange={(e) => setShortcut(e.target.value)} placeholder="welcome" className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm" />
                  </div>
                </div>
                
                {(selectedType === 'CTA URL' || selectedType === 'IMAGE') && (
                  <>
                    <div>
                      <label className="text-sm font-bold text-slate-700 mb-2 block">Button Text (Optional)</label>
                      <input type="text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} placeholder="e.g. Visit" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none text-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-bold text-slate-700 mb-2 block">URL (Optional)</label>
                      <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none text-sm" />
                    </div>
                  </>
                )}
              </div>

              {/* Message Content Area */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-slate-700">Message Content</label>
                  <span className="text-[10px] font-bold text-gray-300">{message.length} / 4096</span>
                </div>
                <div className="flex gap-2 mb-3">
                  {['customer_name', 'agent_name', 'order_id'].map((v) => (
                    <button key={v} onClick={() => setMessage(p => p + ` {{${v}}}`)} className="px-3 py-1.5 border border-gray-100 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-50 hover:text-emerald-500 transition-colors">
                      <span className="text-emerald-500 mr-1">{"{"}</span>{v}<span className="text-emerald-500 ml-1">{"}"}</span>
                    </button>
                  ))}
                </div>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows="5" className="w-full px-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm resize-none" placeholder="Type message..."></textarea>
              </div>

              {/* Media Upload Area */}
              {selectedType !== 'TEXT' && (
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Media Upload</label>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept={selectedType === 'IMAGE' ? 'image/*' : selectedType === 'AUDIO' ? 'audio/*' : selectedType === 'VIDEO' ? 'video/*' : '*/*'}
                  />
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-emerald-50/30 transition-all cursor-pointer group ${selectedFile ? 'border-emerald-400 bg-emerald-50/50 shadow-inner' : 'border-gray-200 hover:border-emerald-200'}`}
                  >
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400 group-hover:text-emerald-500 mb-3 transition-transform group-active:scale-90">
                      <Upload size={24} />
                    </div>
                    <p className="text-xs font-bold text-slate-600 text-center">
                      {selectedFile ? (
                        <span className="text-emerald-600">Selected: {selectedFile.name}</span>
                      ) : (
                        <>Drag and drop your file here, or <span className="text-emerald-500 underline">browse</span></>
                      )}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-black tracking-widest">
                      Max 16MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end items-center gap-4 bg-white">
              <button onClick={closeModal} className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95">
                {editingIndex !== null ? 'Update Quick Reply' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickReply;