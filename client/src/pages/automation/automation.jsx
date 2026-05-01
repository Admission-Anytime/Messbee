import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
    Plus,
    X,
    Zap,
    Play,
    ChevronDown,
    Bot,
    ShoppingBag,
    CheckCircle,
    BellRing,
    Clock3,
    ShieldCheck,
    RefreshCw,
    ArrowRight,
    Pencil,
    Trash2,
    Hand,
    ShoppingCart,
    Headset
} from 'lucide-react';
import AutomationApi from '../../services/AutomationApi';

const triggerLabels = {
    inbound: 'Inbound Msg',
    abandoned: 'Cart Abandoned',
    optin: 'New Opt-in',
    tag: 'Tag Added'
};

const actionLabels = {
    ai: 'AI Agent Response',
    template: 'Template Dispatch',
    human: 'Assigned to Human'
};

const getAutomationVisual = ({ actionType, selectedAgent, triggerType }) => {
    if (actionType === 'human') {
        return {
            icon: Headset,
            iconBg: 'bg-blue-50 dark:bg-blue-900/20',
            iconColor: 'text-blue-500'
        };
    }

    if (selectedAgent === 'sales-assistant' || triggerType === 'abandoned') {
        return {
            icon: ShoppingCart,
            iconBg: 'bg-orange-50 dark:bg-orange-900/20',
            iconColor: 'text-orange-500'
        };
    }

    return {
        icon: Hand,
        iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
        iconColor: 'text-[#10B981]'
    };
};

const inferActionType = (actions = []) => {
    const firstAction = actions[0];

    if (!firstAction) return 'ai';
    if (firstAction.type === 'add_tag' && firstAction.value === 'requires-human') return 'human';
    if (firstAction.type === 'send_message' && firstAction.value === actionLabels.template) return 'template';

    return 'ai';
};

const getSuccessRate = (stats = {}) => {
    const triggered = Number(stats.triggered || 0);
    const executed = Number(stats.executed || 0);

    if (!triggered) return 0;

    return Math.min(100, Math.round((executed / triggered) * 100));
};

const mapAutomationFromApi = (automation) => {
    const triggerType = automation.uiConfig?.triggerType || automation.trigger?.value || 'inbound';
    const actionType = automation.uiConfig?.actionType || inferActionType(automation.actions);
    const selectedAgent = automation.uiConfig?.selectedAgent || 'support-pro';
    const visual = getAutomationVisual({ actionType, selectedAgent, triggerType });

    return {
        id: automation._id,
        name: automation.name,
        channel: actionLabels[actionType] || actionLabels.ai,
        trigger: triggerLabels[triggerType] || triggerLabels.inbound,
        triggerType,
        actionType,
        selectedAgent,
        notifyNegativeSentiment: Boolean(automation.uiConfig?.notifyNegativeSentiment),
        successRate: getSuccessRate(automation.stats),
        monthlyConv: Number(automation.stats?.triggered || 0).toLocaleString('en-US'),
        status: Boolean(automation.isActive),
        ...visual
    };
};

const buildAutomationPayload = ({ automationName, triggerType, actionType, selectedAgent, notifyNegativeSentiment }) => {
    const action = actionType === 'human'
        ? { type: 'add_tag', value: 'requires-human', delay: 0 }
        : { type: 'send_message', value: actionLabels[actionType], delay: 0 };

    return {
        name: automationName.trim(),
        description: `${triggerLabels[triggerType]} -> ${actionLabels[actionType]}`,
        trigger: {
            type: 'event',
            value: triggerType
        },
        actions: [action],
        uiConfig: {
            triggerType,
            actionType,
            selectedAgent,
            notifyNegativeSentiment
        }
    };
};

const settingsCards = [
    {
        id: 'delivery-rules',
        icon: Clock3,
        title: 'Global Delivery Rules',
        description: 'Set quiet hours and message frequency caps across all active automations.',
        cta: 'Configure Rules'
    },
    {
        id: 'spam-protection',
        icon: ShieldCheck,
        title: 'Spam Protection',
        description: 'Advanced AI filtering to detect and block malicious content and duplicate senders.',
        cta: 'Security Settings'
    },
    {
        id: 'crm-sync',
        icon: RefreshCw,
        title: 'CRM Sync',
        description: 'Real-time data synchronization with HubSpot, Salesforce, and Zapier integrations.',
        cta: 'Manage Sync'
    }
];

const Automation = () => {
    const [automations, setAutomations] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAutomation, setEditingAutomation] = useState(null);
    const [automationName, setAutomationName] = useState('');
    const [triggerType, setTriggerType] = useState('inbound');
    const [actionType, setActionType] = useState('ai');
    const [selectedAgent, setSelectedAgent] = useState('support-pro');
    const [notifyNegativeSentiment, setNotifyNegativeSentiment] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setAutomationName('');
        setTriggerType('inbound');
        setActionType('ai');
        setSelectedAgent('support-pro');
        setNotifyNegativeSentiment(false);
        setEditingAutomation(null);
    };

    const fetchAutomations = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await AutomationApi.getAutomations();
            const nextAutomations = Array.isArray(response.data)
                ? response.data.map(mapAutomationFromApi)
                : [];

            setAutomations(nextAutomations);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load automations');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAutomations();
    }, [fetchAutomations]);

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (automation) => {
        setEditingAutomation(automation);
        setAutomationName(automation.name);
        setTriggerType(automation.triggerType);
        setActionType(automation.actionType);
        setSelectedAgent(automation.selectedAgent);
        setNotifyNegativeSentiment(automation.notifyNegativeSentiment);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (isSubmitting) return;
        setIsModalOpen(false);
        resetForm();
    };

    const toggleStatus = async (id) => {
        const currentAutomations = automations;

        setAutomations((prev) =>
            prev.map((item) => (item.id === id ? { ...item, status: !item.status } : item))
        );

        try {
            const response = await AutomationApi.toggleAutomation(id);
            setAutomations((prev) =>
                prev.map((item) => (item.id === id ? mapAutomationFromApi(response.data) : item))
            );
        } catch (error) {
            setAutomations(currentAutomations);
            toast.error(error.response?.data?.message || 'Failed to update automation status');
        }
    };

    const handleSaveAutomation = async () => {
        if (!automationName.trim()) return;

        const payload = buildAutomationPayload({
            automationName,
            triggerType,
            actionType,
            selectedAgent,
            notifyNegativeSentiment
        });

        try {
            setIsSubmitting(true);
            const response = editingAutomation
                ? await AutomationApi.updateAutomation(editingAutomation.id, payload)
                : await AutomationApi.createAutomation(payload);
            const savedAutomation = mapAutomationFromApi(response.data);

            setAutomations((prev) => editingAutomation
                ? prev.map((item) => (item.id === editingAutomation.id ? savedAutomation : item))
                : [savedAutomation, ...prev]
            );
            toast.success(editingAutomation ? 'Automation updated successfully' : 'Automation created successfully');
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save automation');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAutomation = async (id) => {
        const confirmed = window.confirm('Delete this automation?');

        if (!confirmed) return;

        try {
            await AutomationApi.deleteAutomation(id);
            setAutomations((prev) => prev.filter((item) => item.id !== id));
            toast.success('Automation deleted successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete automation');
        }
    };

    return (
        <div className="w-full min-h-screen font-['Urbanist'] bg-[#f8fafc] text-slate-900 overflow-y-auto relative">
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
            `}</style>

            <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 space-y-6 lg:space-y-8">
                <section className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Automations</h1>
                        <p className="text-sm text-[#64748B] mt-1 font-medium">
                            Manage and monitor your AI-powered messaging workflows across all channels.
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-[#10B981] hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Create New Automation
                    </button>
                </section>

                <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[720px] lg:min-w-[820px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Automation Name</th>
                                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Trigger</th>
                                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Success Rate</th>
                                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Monthly Conv.</th>
                                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading && (
                                    <tr>
                                        <td className="px-6 py-10 text-center text-sm font-semibold text-slate-500" colSpan={6}>
                                            Loading automations...
                                        </td>
                                    </tr>
                                )}

                                {!isLoading && automations.length === 0 && (
                                    <tr>
                                        <td className="px-6 py-10 text-center text-sm font-semibold text-slate-500" colSpan={6}>
                                            No automations found. Create your first workflow to get started.
                                        </td>
                                    </tr>
                                )}

                                {!isLoading && automations.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 lg:px-6 py-3.5 lg:py-4">
                                            <div className="flex items-center gap-2.5 lg:gap-3">
                                                <div className={`size-9 lg:size-10 rounded-lg ${item.iconBg} flex items-center justify-center ${item.iconColor}`}>
                                                    <item.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 truncate">{item.name}</p>
                                                    <p className="text-xs lg:text-[13px] font-medium text-slate-500 truncate">{item.channel}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 lg:px-6 py-3.5 lg:py-4">
                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg border border-slate-200">
                                                {item.trigger}
                                            </span>
                                        </td>
                                        <td className="px-4 lg:px-6 py-3.5 lg:py-4">
                                            <div className="flex items-center gap-2 lg:gap-3">
                                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#10B981]" style={{ width: `${item.successRate}%` }}></div>
                                                </div>
                                                <span className="text-xs font-bold text-slate-800">{item.successRate}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 lg:px-6 py-3.5 lg:py-4 text-sm font-semibold text-slate-700">{item.monthlyConv}</td>
                                        <td className="px-4 lg:px-6 py-3.5 lg:py-4">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={item.status}
                                                    onChange={() => toggleStatus(item.id)}
                                                    disabled={isSubmitting}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]"></div>
                                            </label>
                                        </td>
                                        <td className="px-4 lg:px-6 py-3.5 lg:py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="p-1.5 text-slate-400 hover:text-[#1E293B] transition-colors"
                                                    aria-label="Edit automation"
                                                    type="button"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAutomation(item.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                                    aria-label="Delete automation"
                                                    type="button"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-900">Global Settings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                        {settingsCards.map((card) => (
                            <article
                                key={card.id}
                                className="bg-white border border-slate-200 p-5 lg:p-6 rounded-xl hover:shadow-md transition-shadow"
                            >
                                <div className="size-12 rounded-full bg-slate-50 flex items-center justify-center text-[#10B981] mb-4">
                                    <card.icon className="w-6 h-6" />
                                </div>
                                <h4 className="text-base font-bold text-slate-800 mb-2">{card.title}</h4>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed">{card.description}</p>
                                <button className="inline-flex items-center gap-1 mt-4 text-[#10B981] text-sm font-semibold hover:gap-2 transition-all" type="button">
                                    {card.cta}
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </article>
                        ))}
                    </div>
                </section>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 overflow-y-auto">
                    <div className="w-full max-w-[760px] lg:max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 my-4 max-h-[calc(100vh-2rem)]">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                                    {editingAutomation ? 'Edit Automation' : 'Create New Automation'}
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">Set up automated workflows to engage your customers.</p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                                aria-label="Close create automation modal"
                                type="button"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 lg:p-6 space-y-5 lg:space-y-6 overflow-y-auto min-h-0 flex-1 custom-scrollbar">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Automation Name</label>
                                <input
                                    value={automationName}
                                    onChange={(e) => setAutomationName(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E] outline-none transition-all placeholder:text-slate-400 text-sm"
                                    placeholder="e.g., Welcome Message Sequence"
                                    type="text"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-[#22C55E]" /> Trigger
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={triggerType}
                                            onChange={(e) => setTriggerType(e.target.value)}
                                            className="w-full h-12 pl-4 pr-10 rounded-xl border border-slate-200 bg-slate-50 appearance-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E] outline-none transition-all text-sm"
                                        >
                                            <option value="inbound">Inbound Message</option>
                                            <option value="abandoned">Abandoned Cart</option>
                                            <option value="optin">New Opt-in</option>
                                            <option value="tag">Tag Added</option>
                                        </select>
                                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <Play className="w-4 h-4 text-[#22C55E]" /> Action
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={actionType}
                                            onChange={(e) => setActionType(e.target.value)}
                                            className="w-full h-12 pl-4 pr-10 rounded-xl border border-slate-200 bg-slate-50 appearance-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E] outline-none transition-all text-sm"
                                        >
                                            <option value="ai">AI Agent Response</option>
                                            <option value="template">Send Template</option>
                                            <option value="human">Assign to Human</option>
                                        </select>
                                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Configuration</span>
                                </div>

                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600">Select AI Agent Profile</label>
                                        <div className="grid grid-cols-1 gap-2.5">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedAgent('support-pro')}
                                                className={`flex items-center gap-3 p-3.5 rounded-xl text-left transition-colors ${
                                                    selectedAgent === 'support-pro'
                                                        ? 'border-2 border-[#22C55E] bg-[#22C55E]/5'
                                                        : 'border border-slate-200 bg-white hover:border-slate-300'
                                                }`}
                                            >
                                                <div className="w-10 h-10 rounded-full bg-[#22C55E] flex items-center justify-center text-white">
                                                    <Bot className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">Customer Support Pro</p>
                                                    <p className="text-xs text-slate-500">Trained on knowledge base & FAQs</p>
                                                </div>
                                                {selectedAgent === 'support-pro' && (
                                                    <div className="ml-auto">
                                                        <CheckCircle className="w-5 h-5 text-[#22C55E]" />
                                                    </div>
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setSelectedAgent('sales-assistant')}
                                                className={`flex items-center gap-3 p-3.5 rounded-xl text-left transition-colors ${
                                                    selectedAgent === 'sales-assistant'
                                                        ? 'border-2 border-[#22C55E] bg-[#22C55E]/5'
                                                        : 'border border-slate-200 bg-white hover:border-slate-300'
                                                }`}
                                            >
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                    <ShoppingBag className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">Sales Assistant</p>
                                                    <p className="text-xs text-slate-500">Optimized for lead conversion</p>
                                                </div>
                                                {selectedAgent === 'sales-assistant' && (
                                                    <div className="ml-auto">
                                                        <CheckCircle className="w-5 h-5 text-[#22C55E]" />
                                                    </div>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-1.5 border-t border-slate-200">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                checked={notifyNegativeSentiment}
                                                onChange={(e) => setNotifyNegativeSentiment(e.target.checked)}
                                                className="w-5 h-5 rounded-md border-slate-300 text-[#22C55E] focus:ring-[#22C55E]"
                                                type="checkbox"
                                            />
                                            <span className="text-sm text-slate-600 flex items-center gap-2">
                                                <BellRing className="w-4 h-4 text-slate-400" />
                                                Notify agent if AI sentiment is negative
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-end items-center gap-2.5">
                            <button
                                onClick={closeModal}
                                className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                                type="button"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveAutomation}
                                className="w-full sm:w-auto px-10 py-3 rounded-xl font-bold text-white bg-[#22C55E] hover:bg-[#16A34A] shadow-lg shadow-[#22C55E]/20 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                                type="button"
                                disabled={!automationName.trim() || isSubmitting}
                            >
                                {isSubmitting
                                    ? 'Saving...'
                                    : editingAutomation ? 'Update Automation' : 'Create Automation'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Automation;
