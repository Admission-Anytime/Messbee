import { useState, useRef, useEffect } from 'react';
import axios from '../../context/axios';
import { 
  Plus, Type, Image as ImageIcon, 
  Sticker, Music, Video as VideoIcon, FileText, Link, 
  User, Upload, X, Pencil, Trash2, ExternalLink, AlertTriangle 
} from 'lucide-react';
import { toast } from 'react-toastify';
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
    <div className="p-4 md:p-6 bg-[#F9FAFB] min-h-screen font-sans antialiased text-gray-900">
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-gray-800">Quick Replies</h1>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                Total: {replies.length}
              </span>
            </div>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-sm"
            >
              <Plus size={18} /> Add Quick Reply
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {loading ? (
              <table className="w-full table-fixed text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200">
                    <th className="w-[24%] px-4 md:px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Shortcut</th>
                    <th className="w-[44%] px-4 md:px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Message Content</th>
                    <th className="w-[16%] px-4 md:px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Type</th>
                    <th className="w-[16%] px-4 md:px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 md:px-6 py-4"><div className="h-6 w-20 md:w-24 bg-gray-200 animate-pulse rounded-md" /></td>
                      <td className="px-4 md:px-6 py-4"><div className="h-4 w-4/5 bg-gray-200 animate-pulse rounded" /></td>
                      <td className="px-4 md:px-6 py-4"><div className="h-5 w-12 md:w-16 bg-gray-200 animate-pulse rounded-md" /></td>
                      <td className="px-4 md:px-6 py-4"><div className="flex justify-end gap-3"><div className="h-4 w-4 bg-gray-200 animate-pulse rounded" /><div className="h-4 w-4 bg-gray-200 animate-pulse rounded" /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : replies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 px-4">
                <Type size={52} className="mb-3 text-gray-300" />
                <p className="text-lg font-semibold text-gray-600">No quick replies found</p>
                <p className="text-sm mt-1">Create your first quick reply to speed up responses.</p>
              </div>
            ) : (
              <table className="w-full table-fixed text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200">
                    <th className="w-[24%] px-4 md:px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Shortcut</th>
                    <th className="w-[44%] px-4 md:px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Message Content</th>
                    <th className="w-[16%] px-4 md:px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Type</th>
                    <th className="w-[16%] px-4 md:px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {replies.map((reply, idx) => (
                    <tr
                      key={reply._id || idx}
                      onClick={() => setActivePreview(reply)}
                      className={`transition-colors cursor-pointer ${activePreview?._id === reply._id ? 'bg-emerald-50/60' : 'hover:bg-gray-50/60'}`}
                    >
                      <td className="px-4 md:px-6 py-4">
                        <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[12px] font-semibold text-emerald-700">
                          {reply.shortcut}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-[13px] text-gray-600 font-medium">
                        <p className="truncate md:pr-2">{reply.content || 'Media only quick reply'}</p>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span className="inline-flex rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-[10px] font-bold tracking-wider uppercase text-blue-600">
                          {reply.type}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-right">
                        <div className="flex justify-end gap-3 text-gray-400">
                          <button
                            onClick={(e) => handleEdit(e, idx)}
                            className="hover:text-blue-500 transition-colors"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={(e) => openDeleteConfirmation(e, reply._id)}
                            className="hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="hidden xl:block xl:w-[360px] 2xl:w-[420px]">
          <div className="sticky top-6 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold tracking-wide uppercase text-gray-500">Reply Preview</h2>
              <span className="text-[11px] text-gray-400 font-semibold">WhatsApp style</span>
            </div>

            <div className="relative mx-auto w-[230px] h-[460px] 2xl:w-[280px] 2xl:h-[560px] bg-slate-900 rounded-[2.7rem] border-[9px] border-slate-800 shadow-2xl overflow-hidden transition-all">
              <div className="h-full w-full bg-[#f0f2f5] flex flex-col">
                <div className="bg-[#00a884] p-4 pt-9 flex items-center gap-2.5 text-white">
                  <User size={20} className="bg-white/20 rounded-full p-1" />
                  <p className="text-xs font-semibold">Preview Chat</p>
                </div>
                <div className="flex-1 p-4 flex flex-col justify-end">
                  {previewData ? (
                    <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm text-[12px] leading-relaxed max-w-[86%] animate-in slide-in-from-left duration-300">
                      {previewData.type !== 'TEXT' && (
                        <div className="mb-2 min-h-32 bg-slate-100 rounded-lg overflow-hidden flex flex-col items-center justify-center border border-slate-200">
                          {getPreviewImage() ? (
                            <img src={getPreviewImage()} alt="preview" className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <ImageIcon size={24} className="text-slate-300" />
                              <span className="text-[9px] mt-1 uppercase font-bold text-slate-400">{previewData.type} placeholder</span>
                            </>
                          )}
                        </div>
                      )}
                      <p className="whitespace-pre-wrap text-slate-700">{previewData.content || 'Your quick reply message preview appears here.'}</p>
                      {previewData.buttonText && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-center text-blue-500 text-[11px] font-semibold gap-1">
                          <ExternalLink size={12} /> {previewData.buttonText}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white p-3 rounded-xl shadow-sm text-[12px] text-gray-400 max-w-[86%]">
                      Select any quick reply to view its preview.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[360px] animate-in zoom-in duration-200 p-6 text-center">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-[18px] font-bold text-gray-800 mb-2">Delete Quick Reply?</h3>
            <p className="text-[13px] font-medium text-gray-500 mb-8 px-2 leading-relaxed">
              This action will permanently remove the quick reply.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 order-2 sm:order-1 px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 order-1 sm:order-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[13px] font-bold transition-all shadow-md active:translate-y-px"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-[100] p-0 sm:p-4">
          <div className="bg-white w-full h-full sm:h-auto sm:max-w-3xl sm:max-h-[92vh] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-200">
            <div className="sticky top-0 bg-white flex justify-between items-center px-6 py-4 border-b z-10">
              <div>
                <h2 className="text-[18px] font-bold text-gray-800">{editingIndex !== null ? 'Edit Quick Reply' : 'Add New Quick Reply'}</h2>
                <p className="text-[12px] text-gray-500 font-medium mt-0.5">Set message, media, and shortcut in one place.</p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl font-light transition-colors leading-none">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-7">
              <div>
                <label className="text-[13px] font-bold text-gray-700 mb-3 block">Response Type</label>
                <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                  {[
                    { id: 'TEXT', label: 'TEXT', icon: <Type size={17} /> },
                    { id: 'IMAGE', label: 'IMAGE', icon: <ImageIcon size={17} /> },
                    { id: 'STICKER', label: 'STICKER', icon: <Sticker size={17} /> },
                    { id: 'AUDIO', label: 'AUDIO', icon: <Music size={17} /> },
                    { id: 'VIDEO', label: 'VIDEO', icon: <VideoIcon size={17} /> },
                    { id: 'FILE', label: 'FILE', icon: <FileText size={17} /> },
                    { id: 'CTA URL', label: 'CTA URL', icon: <Link size={17} /> }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setSelectedType(type.id);
                        setSelectedFile(null);
                      }}
                      className={`flex flex-col items-center justify-center min-w-[74px] h-[74px] rounded-xl border transition-all ${selectedType === type.id ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                      {type.icon}
                      <span className="text-[9px] font-bold mt-1 uppercase">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-bold text-gray-700 mb-1.5 block">Shortcut</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold group-focus-within:text-emerald-500">/</span>
                    <input
                      type="text"
                      value={shortcut}
                      onChange={(e) => setShortcut(e.target.value)}
                      placeholder="welcome"
                      className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium bg-gray-50/30"
                    />
                  </div>
                </div>

                {(selectedType === 'CTA URL' || selectedType === 'IMAGE') && (
                  <>
                    <div>
                      <label className="text-[13px] font-bold text-gray-700 mb-1.5 block">Button Text (Optional)</label>
                      <input
                        type="text"
                        value={buttonText}
                        onChange={(e) => setButtonText(e.target.value)}
                        placeholder="e.g. Visit"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium bg-gray-50/30"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[13px] font-bold text-gray-700 mb-1.5 block">URL (Optional)</label>
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium bg-gray-50/30"
                      />
                    </div>
                  </>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[13px] font-bold text-gray-700">Message Content</label>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{message.length} / 4096</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {['customer_name', 'agent_name', 'order_id'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setMessage((p) => p + ` {{${v}}}`)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-50 hover:text-emerald-500 transition-colors"
                    >
                      <span className="text-emerald-500 mr-1">{'{'}</span>
                      {v}
                      <span className="text-emerald-500 ml-1">{'}'}</span>
                    </button>
                  ))}
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="5"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium resize-none bg-gray-50/30 leading-relaxed"
                  placeholder="Type message..."
                />
              </div>

              {selectedType !== 'TEXT' && (
                <div>
                  <label className="text-[13px] font-bold text-gray-700 mb-2 block">Media Upload</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept={selectedType === 'IMAGE' ? 'image/*' : selectedType === 'AUDIO' ? 'audio/*' : selectedType === 'VIDEO' ? 'video/*' : '*/*'}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className={`w-full border-2 border-dashed rounded-2xl p-7 flex flex-col items-center justify-center transition-all group ${selectedFile ? 'border-emerald-400 bg-emerald-50/50 shadow-inner' : 'border-gray-200 bg-gray-50 hover:bg-emerald-50/30 hover:border-emerald-200'}`}
                  >
                    <div className="w-11 h-11 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400 group-hover:text-emerald-500 mb-3 transition-transform group-active:scale-95">
                      <Upload size={22} />
                    </div>
                    <p className="text-[12px] font-semibold text-slate-600 text-center">
                      {selectedFile ? (
                        <span className="text-emerald-600">Selected: {selectedFile.name}</span>
                      ) : (
                        <>
                          Drag and drop your file here, or <span className="text-emerald-500 underline">browse</span>
                        </>
                      )}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Max 16MB</p>
                  </button>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white flex justify-end items-center gap-3 px-6 py-4 border-t">
              <button onClick={closeModal} className="text-[13px] font-bold text-gray-500 hover:text-gray-700 transition-colors px-4 py-2">
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-[#10B981] hover:bg-[#059669] text-white px-6 py-2.5 rounded-xl font-bold text-[13px] transition-all shadow-md active:translate-y-px"
              >
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