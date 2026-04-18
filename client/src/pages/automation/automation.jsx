import React, { useState } from 'react';

const Automation = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [automations, setAutomations] = useState([
        {
            id: 1,
            name: 'Welcome Sequence',
            channel: 'Email + SMS Channel',
            trigger: 'New Opt-in',
            successRate: 92,
            monthlyConv: '1,240',
            status: true,
            icon: 'waving_hand',
            iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
            iconColor: 'text-[#10B981]'
        },
        {
            id: 2,
            name: 'Abandoned Cart AI',
            channel: 'Direct AI Response',
            trigger: 'Cart Abandoned',
            successRate: 78,
            monthlyConv: '850',
            status: true,
            icon: 'shopping_cart_checkout',
            iconBg: 'bg-orange-50 dark:bg-orange-900/20',
            iconColor: 'text-orange-500'
        },
        {
            id: 3,
            name: 'Support Triage',
            channel: 'Priority Classification',
            trigger: 'Inbound Msg',
            successRate: 95,
            monthlyConv: '3,100',
            status: true,
            icon: 'support_agent',
            iconBg: 'bg-blue-50 dark:bg-blue-900/20',
            iconColor: 'text-blue-500'
        }
    ]);

    const toggleStatus = (id) => {
        setAutomations(prev => prev.map(item => 
            item.id === id ? { ...item, status: !item.status } : item
        ));
    };

    return (
        <div className="w-full min-h-screen font-['Inter'] bg-[#f8fafc] dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 overflow-y-auto relative">
            {/* Custom Styles */}
            <style>{`
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }
                h1, h2, h3, h4 {
                    font-family: 'Inter Tight', sans-serif;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1e293b;
                }
            `}</style>

            <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
                {/* Page Heading */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="max-w-2xl">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E293B] dark:text-slate-100 tracking-tight">Automations</h1>
                        <p className="text-[#64748B] mt-1 text-sm md:text-base font-medium leading-relaxed">Manage and monitor your AI-powered messaging workflows across all channels.</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#10B981] hover:bg-emerald-600 active:scale-95 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm shrink-0"
                    >
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        Create New Automation
                    </button>
                </div>

                {/* Table Section */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-5 py-3 text-[11px] font-bold text-[#1E293B] dark:text-slate-200 uppercase tracking-widest">Automation Name</th>
                                    <th className="px-5 py-3 text-[11px] font-bold text-[#1E293B] dark:text-slate-200 uppercase tracking-widest">Trigger</th>
                                    <th className="px-5 py-3 text-[11px] font-bold text-[#1E293B] dark:text-slate-200 uppercase tracking-widest">Success Rate</th>
                                    <th className="px-5 py-3 text-[11px] font-bold text-[#1E293B] dark:text-slate-200 uppercase tracking-widest">Monthly Conv.</th>
                                    <th className="px-5 py-3 text-[11px] font-bold text-[#1E293B] dark:text-slate-200 uppercase tracking-widest">Status</th>
                                    <th className="px-5 py-3 text-[11px] font-bold text-[#1E293B] dark:text-slate-200 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {automations.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-200">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className={`size-9 md:size-10 rounded-lg ${item.iconBg} flex items-center justify-center ${item.iconColor} shrink-0 shadow-sm`}>
                                                    <span className="material-symbols-outlined text-xl md:text-2xl">{item.icon}</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-[#1E293B] dark:text-slate-100 text-sm md:text-[15px] truncate">{item.name}</p>
                                                    <p className="text-[11px] md:text-xs text-[#64748B] truncate">{item.channel}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-slate-300 text-[10px] md:text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-800">
                                                {item.trigger}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-24 md:w-32 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shrink-0">
                                                    <div className="h-full bg-[#10B981] rounded-full transition-all duration-1000" style={{ width: `${item.successRate}%` }}></div>
                                                </div>
                                                <span className="text-xs font-bold text-[#1E293B] dark:text-slate-100">{item.successRate}%</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs md:text-sm font-semibold text-[#64748B] dark:text-slate-300">{item.monthlyConv}</td>
                                        <td className="px-5 py-3.5">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={item.status} 
                                                    onChange={() => toggleStatus(item.id)}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2.5px] after:left-[2.5px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-[#10B981]"></div>
                                            </label>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex justify-end gap-1 md:gap-2">
                                                <button className="p-1.5 text-slate-400 hover:text-[#1E293B] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                                                    <span className="material-symbols-outlined text-lg md:text-xl">edit</span>
                                                </button>
                                                <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all">
                                                    <span className="material-symbols-outlined text-lg md:text-xl">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {automations.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400">No automations found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Global Settings Section */}
                <section className="space-y-4 md:space-y-6">
                    <h2 className="text-lg md:text-xl font-bold text-[#1E293B] dark:text-slate-100 tracking-tight">Global Settings</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {/* Delivery Rules */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl hover:shadow-md hover:border-[#10B981]/30 transition-all group">
                            <div className="size-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[#10B981] mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-xl">schedule</span>
                            </div>
                            <h4 className="font-bold text-[#1E293B] dark:text-slate-100 mb-1.5 text-[15px]">Global Delivery Rules</h4>
                            <p className="text-xs text-[#64748B] leading-relaxed">Set quiet hours and message frequency caps across all active automations.</p>
                            <a className="inline-flex items-center gap-1 mt-4 text-[#10B981] text-xs font-bold hover:gap-2 transition-all" href="#">
                                Configure Rules <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </a>
                        </div>
                        {/* Spam Protection */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl hover:shadow-md hover:border-[#10B981]/30 transition-all group">
                            <div className="size-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[#10B981] mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-xl">security</span>
                            </div>
                            <h4 className="font-bold text-[#1E293B] dark:text-slate-100 mb-1.5 text-[15px]">Spam Protection</h4>
                            <p className="text-xs text-[#64748B] leading-relaxed">Advanced AI filtering to detect and block malicious content and duplicate senders.</p>
                            <a className="inline-flex items-center gap-1 mt-4 text-[#10B981] text-xs font-bold hover:gap-2 transition-all" href="#">
                                Security Settings <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </a>
                        </div>
                        {/* CRM Sync */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl hover:shadow-md hover:border-[#10B981]/30 transition-all group">
                            <div className="size-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[#10B981] mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-xl">sync</span>
                            </div>
                            <h4 className="font-bold text-[#1E293B] dark:text-slate-100 mb-1.5 text-[15px]">CRM Sync</h4>
                            <p className="text-xs text-[#64748B] leading-relaxed">Real-time data synchronization with HubSpot, Salesforce, and Zapier integrations.</p>
                            <a className="inline-flex items-center gap-1 mt-4 text-[#10B981] text-xs font-bold hover:gap-2 transition-all" href="#">
                                Manage Sync <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </a>
                        </div>
                    </div>
                </section>
            </div>

            {/* Create New Automation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Overlay */}
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-[4px] animate-in fade-in duration-300" 
                        onClick={() => setIsModalOpen(false)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-300">
                        {/* Modal Header */}
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-[#1E293B] dark:text-slate-100">Create New Automation</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-[13px]">Set up automated workflows to engage your customers.</p>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="size-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <span className="material-symbols-outlined text-xl uppercase">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            {/* Automation Name */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#1E293B] dark:text-slate-200">Automation Name</label>
                                <input 
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none transition-all placeholder:text-slate-400" 
                                    placeholder="e.g., Welcome Message Sequence" 
                                    type="text"
                                />
                            </div>

                            {/* Trigger and Action Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#1E293B] dark:text-slate-200 flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-sm text-[#10B981] fill-[#10B981]">bolt</span>
                                        Trigger
                                    </label>
                                    <div className="relative">
                                        <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-3.5 pr-10 text-sm appearance-none focus:ring-2 focus:ring-[#10B981] outline-none transition-all cursor-pointer">
                                            <option>Inbound Message</option>
                                            <option>New Opt-in</option>
                                            <option>Cart Abandoned</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">expand_more</span>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#1E293B] dark:text-slate-200 flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-sm text-blue-500">play_arrow</span>
                                        Action
                                    </label>
                                    <div className="relative">
                                        <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-3.5 pr-10 text-sm appearance-none focus:ring-2 focus:ring-[#10B981] outline-none transition-all cursor-pointer">
                                            <option>AI Agent Response</option>
                                            <option>Send Template</option>
                                            <option>Assign to Team</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">expand_more</span>
                                    </div>
                                </div>
                            </div>

                            {/* Configuration Box */}
                            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 p-4 rounded-2xl space-y-3">
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Configuration</span>
                                
                                <div className="space-y-2.5">
                                    <label className="text-xs font-bold text-[#1E293B] dark:text-slate-200">Select AI Agent Profile</label>
                                    
                                    {/* Option 1: Selected */}
                                    <div className="bg-white dark:bg-slate-900 border-2 border-[#10B981] p-3 rounded-xl flex items-center justify-between cursor-pointer shadow-sm active:scale-[0.98] transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="size-9 rounded-lg bg-emerald-500 flex items-center justify-center text-white shrink-0">
                                                <span className="material-symbols-outlined text-lg">smart_toy</span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[13px] font-bold text-[#1E293B] dark:text-slate-100 truncate">Customer Support Pro</p>
                                                <p className="text-[10px] text-slate-500 truncate">Trained on knowledge base & FAQs</p>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined text-[#10B981] fill-[#10B981] text-lg">check_circle</span>
                                    </div>

                                    {/* Option 2: Default */}
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 active:scale-[0.98] transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="size-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-[#10B981]/10 group-hover:text-[#10B981] transition-colors shrink-0">
                                                <span className="material-symbols-outlined text-lg">shopping_bag</span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[13px] font-bold text-[#1E293B] dark:text-slate-100 truncate">Sales Assistant</p>
                                                <p className="text-[10px] text-slate-500 truncate">Optimized for lead conversion</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Checkbox */}
                            <div className="flex items-center gap-2.5 px-0.5">
                                <input 
                                    type="checkbox" 
                                    id="notify-agent"
                                    className="size-4.5 rounded border-slate-300 text-[#10B981] focus:ring-[#10B981] cursor-pointer"
                                />
                                <label htmlFor="notify-agent" className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                                    Notify agent if AI sentiment is negative
                                </label>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-[13px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button className="bg-[#10B981] hover:bg-emerald-600 active:scale-95 text-white px-6 py-2 rounded-xl font-bold text-[13px] transition-all shadow-md">
                                Create Automation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Automation;