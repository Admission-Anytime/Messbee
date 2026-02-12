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

  // --- UPDATED DELETE ACTION ---
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
    <div className="p-6 bg-gray-50 min-h-screen font-sans relative">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800">Labels</h1>
          <span className="text-gray-400 cursor-pointer text-lg">ⓘ</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-blue-50 border border-blue-200 px-4 py-1.5 rounded-full shadow-sm">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
            <span className="text-blue-700 font-medium text-sm">Label used: {labels.length}/5</span>
          </div>
          <button onClick={() => handleOpenModal()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg font-medium flex items-center gap-2 transition-all">
            <span className="text-xl">+</span> Add Labels
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Description</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Colour</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Created By</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {labels.map((label) => (
              <tr key={label.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-5">
                  <span className={`${label.bg || 'bg-gray-100'} ${label.text || 'text-gray-800'} px-3 py-1 rounded-full text-sm font-medium border border-transparent`}>
                    {label.name}
                  </span>
                </td>
                <td className="px-6 py-5 text-gray-600 text-sm italic font-light">{label.desc}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: label.color }}></span>
                    <span className="text-gray-400 font-mono text-xs uppercase">{label.color}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-600">
                      {label.isSystem ? 'WT' : 'AM'}
                    </div>
                    <span className="text-gray-700 text-sm font-medium">{label.creator}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-3 text-gray-400">
                    <button onClick={() => handleOpenModal(label)} className="hover:text-blue-500 cursor-pointer">✎</button>
                    <button onClick={() => confirmDelete(label.id)} className="hover:text-red-500 cursor-pointer">🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- ADD/EDIT MODAL (SAME AS BEFORE) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">{editingLabel ? 'Edit Label' : 'Add New Label'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl font-light">&times;</button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-semibold text-gray-700">Label Name</label>
                  <span className="text-[10px] text-gray-400">{labelName.length} / 25</span>
                </div>
                <input type="text" value={labelName} onChange={(e) => setLabelName(e.target.value)} placeholder="e.g. VIP Customer" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-emerald-500 outline-none text-sm bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea rows="3" value={labelDesc} onChange={(e) => setLabelDesc(e.target.value)} placeholder="Add a description for this label..." className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:border-emerald-500 outline-none text-sm resize-none bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Label Colour</label>
                <div className="grid grid-cols-6 gap-y-4 gap-x-2 mb-6">
                  {colorPalette.map((color) => (
                    <button key={color} onClick={() => setSelectedColor(color)} className={`w-10 h-10 rounded-full transition-all relative flex items-center justify-center ${selectedColor === color ? 'ring-2 ring-offset-2 ring-emerald-500' : ''}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 focus-within:border-emerald-500 transition-colors">
                    <span className="text-gray-400 text-sm mr-1">#</span>
                    <input type="text" value={selectedColor.replace('#', '')} onChange={(e) => setSelectedColor(`#${e.target.value}`)} className="bg-transparent w-full outline-none text-sm font-mono uppercase text-gray-700" />
                  </div>
                  <div className="w-10 h-10 rounded-lg border border-gray-100 shadow-sm" style={{ backgroundColor: selectedColor }} />
                </div>
              </div>
            </div>
            <div className="flex justify-end items-center gap-4 px-6 py-4 border-t bg-gray-50/30">
              <button onClick={closeModal} className="text-sm font-semibold text-gray-500 hover:text-gray-700">Cancel</button>
              <button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-sm">Save Label</button>
            </div>
          </div>
        </div>
      )}

      {/* --- CUSTOM DELETE MODAL (NEW) --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200 text-center p-6">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              🗑️
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Label?</h3>
            <p className="text-sm text-gray-500 mb-8">Are you sure you want to delete this label? This action cannot be undone.</p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                No, Keep it
              </button>
              <button 
                onClick={executeDelete} 
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Label;