import React, { useState } from 'react';

const Label = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState(null);
  
  // --- DELETE MODAL STATE ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [labelToDelete, setLabelToDelete] = useState(null);
  
  const [labelName, setLabelName] = useState('');
  const [labelDesc, setLabelDesc] = useState('');
  const [selectedColor, setSelectedColor] = useState('#EF4444'); 

  const colorPalette = [
    '#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#6366F1',
    '#A855F7', '#F43F5E', '#334155', '#14B8A6', '#06B6D4', '#D946EF'
  ];

  const [labels, setLabels] = useState([
    { id: 1, name: 'start first', desc: 'check', color: '#A82A00', bg: 'bg-red-100', text: 'text-red-800', creator: 'Abhyan Morkal', isSystem: false },
    { id: 2, name: 'Hot lead', desc: 'Most eligible customer to target', color: '#E76F51', bg: 'bg-orange-100', text: 'text-orange-800', creator: 'WhatsTool', isSystem: true },
    { id: 3, name: 'Cold lead', desc: 'Not very interest customer', color: '#219EBC', bg: 'bg-cyan-100', text: 'text-cyan-800', creator: 'WhatsTool', isSystem: true },
    { id: 4, name: 'Warm lead', desc: 'Very interested customer', color: '#E85D04', bg: 'bg-yellow-100', text: 'text-yellow-800', creator: 'WhatsTool', isSystem: true },
    { id: 5, name: 'Issue raised', desc: 'Issue has been raised by team', color: '#D00000', bg: 'bg-red-100', text: 'text-red-800', creator: 'WhatsTool', isSystem: true },
    { id: 6, name: 'Resolved', desc: 'Issue resolved', color: '#6A994E', bg: 'bg-green-100', text: 'text-green-800', creator: 'WhatsTool', isSystem: true },
    { id: 7, name: 'Payment pending', desc: 'Payment is not yet received', color: '#4361EE', bg: 'bg-blue-100', text: 'text-blue-800', creator: 'WhatsTool', isSystem: true },
    { id: 8, name: 'Payment received', desc: 'Payment has done by the customer', color: '#4361EE', bg: 'bg-blue-100', text: 'text-blue-800', creator: 'WhatsTool', isSystem: true },
    { id: 9, name: 'Invoice sent', desc: 'We have send the invoice', color: '#333D29', bg: 'bg-gray-200', text: 'text-gray-800', creator: 'WhatsTool', isSystem: true },
  ]);

  const handleOpenModal = (label = null) => {
    if (label) {
      setEditingLabel(label);
      setLabelName(label.name);
      setLabelDesc(label.desc);
      setSelectedColor(label.color);
    } else {
      setEditingLabel(null);
      setLabelName('');
      setLabelDesc('');
      setSelectedColor('#EF4444');
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!labelName.trim()) return alert("Please enter a label name");
    if (editingLabel) {
      setLabels(labels.map(l => l.id === editingLabel.id ? { ...l, name: labelName, desc: labelDesc, color: selectedColor } : l));
    } else {
      const newLabel = { id: Date.now(), name: labelName, desc: labelDesc, color: selectedColor, bg: 'bg-emerald-50', text: 'text-emerald-800', creator: 'Abhyan Morkal', isSystem: false };
      setLabels([...labels, newLabel]);
    }
    closeModal();
  };

  const confirmDelete = (id) => {
    setLabelToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = () => {
    setLabels(labels.filter(l => l.id !== labelToDelete));
    setIsDeleteModalOpen(false);
    setLabelToDelete(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLabel(null);
  };

  return (
    <div className="p-4 md:p-6 bg-[#F9FAFB] min-h-screen font-sans antialiased text-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-gray-800">Labels</h1>
          <span className="text-gray-400 cursor-pointer text-lg hover:text-gray-600">ⓘ</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
            <span className="text-blue-700 font-semibold text-xs whitespace-nowrap">Label used: {labels.length}/5</span>
          </div>
          <button onClick={() => handleOpenModal()} className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-sm">
            <span className="text-lg">+</span> Add Labels
          </button>
        </div>
      </div>

      {/* Table Section - Added responsive horizontal scroll */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-200">
              <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Colour</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Created By</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {labels.map((label) => (
              <tr key={label.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <span className={`${label.bg || 'bg-gray-100'} ${label.text || 'text-gray-800'} px-2.5 py-1 rounded-md text-[13px] font-semibold`}>
                    {label.name}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-[13px] font-medium leading-relaxed">{label.desc}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full shadow-inner" style={{ backgroundColor: label.color }}></span>
                    <span className="text-gray-400 font-mono text-[12px] uppercase tracking-tighter">{label.color}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500 border border-gray-200">
                      {label.isSystem ? 'WT' : 'AM'}
                    </div>
                    <span className="text-gray-700 text-[13px] font-semibold">{label.creator}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3 text-gray-400">
                    <button onClick={() => handleOpenModal(label)} className="hover:text-blue-500 transition-colors">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => confirmDelete(label.id)} className="hover:text-red-500 transition-colors">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- ADD/EDIT MODAL (RESPONSIVE) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[440px] max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
            <div className="sticky top-0 bg-white flex justify-between items-center px-6 py-4 border-b z-10">
              <h2 className="text-[17px] font-bold text-gray-800">{editingLabel ? 'Edit Label' : 'Add New Label'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl font-light transition-colors leading-none">&times;</button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[13px] font-bold text-gray-700">Label Name</label>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{labelName.length} / 25</span>
                </div>
                <input type="text" value={labelName} onChange={(e) => setLabelName(e.target.value)} placeholder="e.g. VIP Customer" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium bg-gray-50/30" />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Description</label>
                <textarea rows="3" value={labelDesc} onChange={(e) => setLabelDesc(e.target.value)} placeholder="Add a description for this label..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium resize-none bg-gray-50/30 leading-relaxed" />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-4">Label Colour</label>
                <div className="grid grid-cols-6 gap-3 mb-6">
                  {colorPalette.map((color) => (
                    <button key={color} onClick={() => setSelectedColor(color)} className={`aspect-square rounded-full transition-transform active:scale-95 flex items-center justify-center ${selectedColor === color ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110 shadow-sm' : 'hover:scale-105 shadow-inner'}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus-within:border-emerald-500 transition-colors">
                    <span className="text-gray-400 text-sm font-mono mr-1">#</span>
                    <input type="text" value={selectedColor.replace('#', '')} onChange={(e) => setSelectedColor(`#${e.target.value}`)} className="bg-transparent w-full outline-none text-sm font-mono font-bold uppercase text-gray-700" />
                  </div>
                  <div className="w-11 h-11 rounded-xl border border-gray-100 shadow-sm transition-colors" style={{ backgroundColor: selectedColor }} />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white flex justify-end items-center gap-3 px-6 py-4 border-t">
              <button onClick={closeModal} className="text-[13px] font-bold text-gray-500 hover:text-gray-700 transition-colors px-4 py-2">Cancel</button>
              <button onClick={handleSave} className="bg-[#10B981] hover:bg-[#059669] text-white px-6 py-2.5 rounded-xl font-bold text-[13px] transition-all shadow-md active:translate-y-px">Save Label</button>
            </div>
          </div>
        </div>
      )}

      {/* --- CUSTOM DELETE MODAL (RESPONSIVE) --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[360px] animate-in zoom-in duration-200 p-6 text-center">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-[18px] font-bold text-gray-800 mb-2 leading-tight">Delete Label?</h3>
            <p className="text-[13px] font-medium text-gray-500 mb-8 px-2 leading-relaxed">This will permanently remove the label. Are you sure you want to proceed?</p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 order-2 sm:order-1 px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={executeDelete} className="flex-1 order-1 sm:order-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[13px] font-bold transition-all shadow-md active:translate-y-px">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Label;