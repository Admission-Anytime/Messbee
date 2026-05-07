import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import CampaignApi from '../../services/CampaignApi';
import LabelApi from '../../services/LabelApi';
import StatusApi from '../../services/StatusApi';
import axios from '../../context/axios';
import { fetchWhatsAppTemplates, mergeTemplates } from '../../services/TemplateApi';
import { toast } from 'react-toastify';
import { userContext } from '../../context/Context';
import {
    X, Users, Tag, FileUp, ArrowRight, ChevronDown,
    Search, CheckCircle, Clock, Eye, Smartphone, ChevronLeft,
    Zap, Calendar, Info, Rocket, ExternalLink, User,
    Filter
} from 'lucide-react';

const CreateCampaign = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useContext(userContext);
    const [currentStep, setCurrentStep] = useState(1);

    // Dynamic Data State
    const [labelsList, setLabelsList] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [totalContacts, setTotalContacts] = useState(0);
    const [estimatedCount, setEstimatedCount] = useState(0);
    const [templates, setTemplates] = useState([]);

    // Initial Data Fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [lbls, stats, contacts] = await Promise.all([
                    LabelApi.getAllLabels(),
                    StatusApi.getAllStatuses(),
                    axios.get('/contacts?limit=1')
                ]);
                
                if (Array.isArray(lbls)) setLabelsList(lbls.map(l => l.name));
                if (Array.isArray(stats)) setStatusOptions(stats.map(s => s.name));
                if (contacts.data?.success) {
                    setTotalContacts(contacts.data.pagination.total);
                    setEstimatedCount(contacts.data.pagination.total);
                }
            } catch (err) {
                console.error("Failed to fetch campaign initial data:", err);
            }
        };
        fetchInitialData();
    }, []);

    const loadTemplates = useCallback(async () => {
        try {
            const whatsappTemplates = await fetchWhatsAppTemplates();
            const approvedTemplates = whatsappTemplates.approvedTemplates || whatsappTemplates.data?.approvedTemplates || [];
            const formatted = mergeTemplates(approvedTemplates, []).map((template) => ({
                id: template.id,
                name: template.name,
                status: String(template.status || 'Pending').toLowerCase(),
                preview: template.bodyText || '',
                language: template.language || 'en_US',
                lastUsed: template.updated || 'Never',
                category: template.category || 'General'
            }));

            setTemplates(formatted);
            if (formatted.length > 0) {
                setSelectedTemplate((prev) => prev || formatted[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch approved templates:', error);
        }
    }, []);

    useEffect(() => {
        loadTemplates();
    }, [loadTemplates]);

    // Step 1 State
    const [selectedOption, setSelectedOption] = useState('all');
    const [selectedLabels, setSelectedLabels] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('');

    // Step 1 Effect for estimated audience
    useEffect(() => {
        const updateEstimatedCount = async () => {
            try {
                let params = new URLSearchParams();
                params.set('limit', '1');
                
                if (selectedOption === 'labels' && selectedLabels.length > 0) {
                    params.set('labels', selectedLabels.join(','));
                } else if (selectedOption === 'status' && selectedStatus) {
                    params.set('status', selectedStatus);
                }
                
                if (selectedOption !== 'csv') {
                    const res = await axios.get(`/contacts?${params.toString()}`);
                    if (res.data?.success) {
                        setEstimatedCount(res.data.pagination.total);
                    }
                } else {
                    setEstimatedCount(0); // For CSV, count comes from file parse which isn't implemented here yet
                }
            } catch (err) {
                console.error("Error updating estimated count:", err);
            }
        };
        updateEstimatedCount();
    }, [selectedOption, selectedLabels, selectedStatus]);

    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Step 3 State
    const [scheduleOption, setScheduleOption] = useState('now');
    const [completionAlert, setCompletionAlert] = useState(true);
    const [campaignName, setCampaignName] = useState(() => {
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yy = String(now.getFullYear()).slice(-2);
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12 || 12;
        return `Camp (${dd}/${mm}/${yy} ${hours}:${minutes} ${ampm})`;
    });
    const [scheduledDate, setScheduledDate] = useState('2025-07-24');
    const [scheduledTime, setScheduledTime] = useState('12:00');
    const [isLaunching, setIsLaunching] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const fileInputRef = React.useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCsvFile(file);
            setSelectedOption('csv');
        }
    };

    const estimatedCost = estimatedCount * 0.80;

    const handleLaunch = async () => {
        if (!campaignName.trim()) {
            toast.error('Campaign name is required.');
            return;
        }

        if (scheduleOption === 'later') {
            if (!scheduledDate || !scheduledTime) {
                toast.error('Please specify the date and time for the scheduled campaign.');
                return;
            }
            const selectedDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
            if (selectedDateTime <= new Date()) {
                toast.error('Scheduled time must be in the future.');
                return;
            }
        }

        if (user?.credits < estimatedCost) {
            setShowCreditModal(true);
            return;
        }

        try {
            setIsLaunching(true);

            const campaignData = {
                name: campaignName,
                messageTemplate: activeTemplate?.name || selectedTemplate,
                templateLanguage: activeTemplate?.language || 'en_US',
                status: scheduleOption === 'now' ? 'active' : 'scheduled',
                scheduledDate: scheduleOption === 'later' ? new Date(`${scheduledDate}T${scheduledTime}`) : null,
                audienceFilter: {
                    tags: selectedOption === 'labels' ? selectedLabels : [],
                    status: selectedOption === 'status' ? selectedStatus : null,
                }
            };

            const res = await CampaignApi.createCampaign(campaignData);
            if (res.success) {
                // Record the transaction - The backend will now automatically deduct the credits
                await axios.post("/billing/transactions", {
                    desc: `Campaign Launch - ${campaignName}`,
                    amount: -estimatedCost,
                    status: "Paid"
                });

                // Fetch latest user data to sync credits
                try {
                    const userRes = await axios.get("/auth/me");
                    if (userRes.data && userRes.data.data) {
                        updateUser(userRes.data.data);
                    }
                } catch (err) {
                    const newCredits = parseFloat((user.credits - estimatedCost).toFixed(2));
                    if (user) updateUser({ ...user, credits: newCredits });
                }

                const calculatedMinutes = Math.max(1, Math.ceil(estimatedCount / 100));
                
                toast.success(scheduleOption === 'now' ? 'Campaign launched successfully!' : 'Campaign scheduled successfully!');
                navigate('/admin/campaign-success', {
                    state: {
                        campaignName,
                        contacts: estimatedCount,
                        credits: estimatedCost,
                        duration: `${calculatedMinutes} minute${calculatedMinutes > 1 ? 's' : ''}`
                    }
                });
            } else {
                toast.error(res.message || 'Failed to launch campaign');
            }
        } catch (error) {
            console.error('Error launching campaign:', error);
            toast.error(error.response?.data?.message || 'Failed to launch campaign');
        } finally {
            setIsLaunching(false);
        }
    };

    const handleSaveAsDraft = async () => {
        try {
            setIsSavingDraft(true);
            const campaignData = {
                name: campaignName,
                messageTemplate: activeTemplate?.name || selectedTemplate,
                templateLanguage: activeTemplate?.language || 'en_US',
                status: 'draft',
                audienceFilter: {
                    tags: selectedOption === 'labels' ? selectedLabels : [],
                    status: selectedOption === 'status' ? selectedStatus : null,
                }
            };
            const res = await CampaignApi.createCampaign(campaignData);
            if (res.success) {
                toast.success('Campaign saved as draft!');
                navigate('/admin/campaigns');
            } else {
                toast.error(res.message || 'Failed to save draft');
            }
        } catch (error) {
            console.error('Error saving draft:', error);
            toast.error(error.response?.data?.message || 'Failed to save draft');
        } finally {
            setIsSavingDraft(false);
        }
    };

    const nextStep = () => {
        if (currentStep === 1) {
            if (selectedOption === 'labels' && selectedLabels.length === 0) {
                toast.error('Please select at least one label.');
                return;
            }
            if (selectedOption === 'status' && !selectedStatus) {
                toast.error('Please select a status.');
                return;
            }
            if (selectedOption === 'csv' && !csvFile) {
                toast.error('Please upload a CSV file.');
                return;
            }
            if (estimatedCount === 0 && selectedOption !== 'csv') {
                toast.error('Selected audience has 0 contacts.');
                return;
            }
        } else if (currentStep === 2) {
            if (!selectedTemplate) {
                setShowTemplateModal(true);
                return;
            }
        }
        setCurrentStep(prev => Math.min(prev + 1, 3));
    };
    const prevStep = () => {
        if (currentStep === 1) {
            navigate('/admin/campaigns');
        } else {
            setCurrentStep(prev => Math.max(prev - 1, 1));
        }
    };

    const activeTemplate = templates.find(t => t.id === selectedTemplate) || templates[0] || null;

    return (
        <>
            {showCreditModal && (
                <div className="fixed inset-0 z-[700] flex items-center justify-center font-sans">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setShowCreditModal(false)} />
                    <div className="relative bg-white rounded-[1.5rem] shadow-2xl w-[92vw] max-w-[400px] p-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
                        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5 ring-8 ring-red-50/50">
                            <Zap className="w-6 h-6 text-red-500 stroke-[2.5]" />
                        </div>
                        <h2 className="text-xl font-extrabold text-gray-900 mb-2 tracking-tight">Insufficient Credits!</h2>
                        <p className="text-[13.5px] text-gray-500 mb-8 leading-relaxed px-2 font-medium">
                            You need <span className="font-bold text-gray-900">₹{estimatedCost.toFixed(2)}</span> to launch this campaign.
                        </p>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setShowCreditModal(false)}
                                className="flex-1 px-4 py-3 bg-white border-2 border-gray-100 rounded-xl text-[13px] font-bold text-gray-600 hover:border-gray-200 hover:bg-gray-50 transition-all active:scale-[0.98]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => navigate('/admin/plan/addons')}
                                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[13px] font-bold transition-all shadow-[0_4px_12px_rgba(239,68,68,0.25)] hover:shadow-[0_6px_16px_rgba(239,68,68,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                            >
                                Add Credits
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showTemplateModal && (
                <div className="fixed inset-0 z-[700] flex items-center justify-center font-sans">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setShowTemplateModal(false)} />
                    <div className="relative bg-white rounded-[1.5rem] shadow-2xl w-[92vw] max-w-[400px] p-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
                        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-5 ring-8 ring-emerald-50/50">
                            <Info className="w-6 h-6 text-emerald-500 stroke-[2.5]" />
                        </div>
                        <h2 className="text-xl font-extrabold text-gray-900 mb-2 tracking-tight">No Template Selected</h2>
                        <p className="text-[13.5px] text-gray-500 mb-8 leading-relaxed px-2 font-medium">
                            You haven't selected a message template. If you don't have one ready, you can create a new template now.
                        </p>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setShowTemplateModal(false)}
                                className="flex-1 px-4 py-3 bg-white border-2 border-gray-100 rounded-xl text-[13px] font-bold text-gray-600 hover:border-gray-200 hover:bg-gray-50 transition-all active:scale-[0.98]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => navigate('/admin/templates/create')}
                                className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[13px] font-bold transition-all shadow-[0_4px_12px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_16px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                            >
                                Create Template
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="min-h-screen bg-white font-sans">
                <div className="w-full">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <button onClick={prevStep} className="text-gray-600 hover:bg-gray-100 p-1 rounded-md">
                            <ArrowRight className="w-5 h-5 rotate-180" />
                        </button>
                        <h1 className="text-lg font-bold text-slate-800">Create Campaign</h1>
                    </div>

                    {currentStep === 3 ? (
                        <button
                            onClick={handleSaveAsDraft}
                            disabled={isSavingDraft}
                            className="text-slate-500 font-bold hover:text-slate-700 transition-colors text-sm disabled:opacity-50"
                        >
                            {isSavingDraft ? 'Saving...' : 'Save as Draft'}
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/admin/campaigns')}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    )}
                </div>

                {/* Stepper */}
                <div className={`flex justify-center py-8 ${currentStep === 3 ? 'bg-gray-50 border-b border-gray-200' : ''}`}>
                    <div className="flex items-center w-full max-w-md">
                        <Step number={1} label="Select Audience" active={currentStep >= 1} current={currentStep === 1} />
                        <div className={`flex-1 h-px mx-2 mb-6 ${currentStep >= 2 ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                        <Step number={2} label="Choose Template" active={currentStep >= 2} current={currentStep === 2} />
                        <div className={`flex-1 h-px mx-2 mb-6 ${currentStep >= 3 ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                        <Step number={3} label="Schedule & Review" active={currentStep >= 3} current={currentStep === 3} />
                    </div>
                </div>

                {/* Step Content */}
                {currentStep === 1 && (
                    <div className="px-12 pb-12 transition-all duration-300">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-slate-800">Create a New Campaign</h2>
                            <p className="text-gray-500 mt-1">Give your campaign a name, then select the audience to reach.</p>
                        </div>

                        {/* Campaign Name Input */}
                        <div className="mb-6 p-5 rounded-xl border-2 border-gray-100 bg-white">
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                Campaign Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={campaignName}
                                onChange={(e) => setCampaignName(e.target.value)}
                                placeholder="e.g. Summer Admission Drive 2025"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-slate-800 font-medium placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 bg-gray-50 transition"
                            />
                            {campaignName.trim() === '' && (
                                <p className="text-[11px] text-gray-400 mt-1.5">A name helps you identify this campaign later.</p>
                            )}
                        </div>

                        <div className="mb-4">
                            <h3 className="text-base font-bold text-slate-800">Who should receive this campaign?</h3>
                            <p className="text-gray-500 text-sm mt-0.5">Select the contacts you want to reach out to.</p>
                        </div>

                        <div className="space-y-4">
                            {/* Option 1: All Contacts */}
                            <SelectionCard
                                id="all"
                                title="All Contacts"
                                description={`Send this campaign to everyone in your contact list (${totalContacts.toLocaleString()} contacts).`}
                                icon={<Users className="w-5 h-5 text-gray-400" />}
                                selected={selectedOption === 'all'}
                                onClick={() => setSelectedOption('all')}
                            />

                            {/* Option 2: Filter by Labels */}
                            <div
                                onClick={() => setSelectedOption('labels')}
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedOption === 'labels' ? 'border-emerald-500 bg-white' : 'border-gray-100 bg-white'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedOption === 'labels' ? 'border-emerald-500' : 'border-gray-300'
                                        }`}>
                                        {selectedOption === 'labels' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <h3 className="font-bold text-slate-800">Filter by Labels</h3>
                                            <Tag className="w-5 h-5 text-gray-300 fill-gray-100" />
                                        </div>
                                        <p className="text-gray-500 text-sm mb-3">Select specific segments of your audience using labels.</p>

                                        {/* Tags Input Area */}
                                        <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-200 rounded-lg bg-gray-50/50 relative">
                                            {selectedLabels.map(label => (
                                                <span key={label} className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-md text-sm text-gray-700 shadow-sm">
                                                    {label} <X className="w-3 h-3 text-gray-400 cursor-pointer" onClick={() => setSelectedLabels(prev => prev.filter(l => l !== label))} />
                                                </span>
                                            ))}
                                            <select 
                                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-400 min-w-[150px] outline-none"
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val && !selectedLabels.includes(val)) {
                                                        setSelectedLabels(prev => [...prev, val]);
                                                    }
                                                    e.target.value = "";
                                                }}
                                            >
                                                <option value="">Add labels...</option>
                                                {labelsList.filter(l => !selectedLabels.includes(l)).map(l => (
                                                    <option key={l} value={l}>{l}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Option 2.5: Filter by Status */}
                            <div
                                onClick={() => setSelectedOption('status')}
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedOption === 'status' ? 'border-emerald-500 bg-white' : 'border-gray-100 bg-white'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedOption === 'status' ? 'border-emerald-500' : 'border-gray-300'
                                        }`}>
                                        {selectedOption === 'status' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <h3 className="font-bold text-slate-800">Filter by Status</h3>
                                            <Filter className="w-5 h-5 text-gray-300" />
                                        </div>
                                        <p className="text-gray-500 text-sm mb-3">Send messages based on contact lead status.</p>

                                        <select 
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500"
                                        >
                                            <option value="">Select Status...</option>
                                            {statusOptions.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Option 3: Upload CSV */}
                            <div
                                onClick={() => {
                                    setSelectedOption('csv');
                                    fileInputRef.current.click();
                                }}
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedOption === 'csv' ? 'border-emerald-500 bg-white' : 'border-gray-100 bg-white'}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedOption === 'csv' ? 'border-emerald-500' : 'border-gray-300'}`}>
                                        {selectedOption === 'csv' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <h3 className="font-bold text-slate-800">Upload CSV</h3>
                                            <FileUp className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 text-sm mt-1">Import a list of contacts from a CSV or Excel file.</p>

                                        {/* File Selected State */}
                                        {csvFile && (
                                            <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg animate-in slide-in-from-top-1 duration-300">
                                                <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center text-emerald-600 font-bold text-[10px]">CSV</div>
                                                <span className="text-xs font-bold text-emerald-700 truncate">{csvFile.name}</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCsvFile(null);
                                                    }}
                                                    className="ml-auto text-emerald-400 hover:text-emerald-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Info & Actions */}
                        <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <div className="w-4 h-4 bg-gray-400 text-white rounded-full flex items-center justify-center text-[10px] italic font-serif">i</div>
                                <span>Estimated audience: <strong className="text-slate-800 font-bold">{estimatedCount.toLocaleString()} contacts</strong></span>
                            </div>
                            <div className="flex gap-3">
                                <button className="px-8 py-2.5 rounded-lg border border-gray-200 font-bold text-slate-700 hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button
                                    onClick={nextStep}
                                    disabled={campaignName.trim() === ''}
                                    className={`px-8 py-2.5 rounded-lg font-bold text-white flex items-center gap-2 transition-colors ${campaignName.trim() === '' ? 'bg-emerald-300 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                                >
                                    Next <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="flex h-[calc(100vh-200px)]">
                        {/* LEFT SIDE: Template Selection */}
                        <div className="w-1/2 px-12 overflow-y-auto border-r border-gray-100">
                            {/* Filters */}
                            <div className="flex gap-4 mb-6">
                                <div className="relative flex-1">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search templates..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-gray-50/50"
                                    />
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-gray-50">
                                    Category: All <ChevronDown className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>

                            {/* Template Grid */}
                            <div className="grid grid-cols-2 gap-4 pb-12">
                                {templates.map((template) => (
                                    <div
                                        key={template.id}
                                        onClick={() => setSelectedTemplate(template.id)}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md relative group ${selectedTemplate === template.id
                                            ? 'border-emerald-500 bg-emerald-50/10'
                                            : 'border-gray-100 bg-white hover:border-gray-200'
                                            }`}
                                    >
                                        {selectedTemplate === template.id && (
                                            <div className="absolute top-3 right-3 text-emerald-500">
                                                <CheckCircle className="w-5 h-5 fill-emerald-500 text-white" />
                                            </div>
                                        )}
                                        {/* Status Badge */}
                                        <div className="flex items-center gap-1.5 mb-3">
                                            {template.status === 'approved' ? (
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                    <CheckCircle className="w-3 h-3" /> Approved
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                    <Clock className="w-3 h-3" /> Pending
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="font-bold text-slate-800 mb-2 text-sm">{template.name}</h3>
                                        <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-3">
                                            {template.preview.split(/(\{\{.*?\}\})/).map((part, index) =>
                                                part.startsWith('{{') ? <span key={index} className="text-emerald-600 font-medium">{part}</span> : <span key={index}>{part}</span>
                                            )}
                                        </p>

                                        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                            <span className="text-[10px] text-gray-400 font-medium">Last used: {template.lastUsed}</span>
                                            <span className="text-[10px] font-bold text-slate-600 bg-gray-100 px-2 py-1 rounded-md">{template.category}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT SIDE: Preview */}
                        <div className="w-1/2 bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">

                            {/* Mobile Mockup */}
                            <div className="relative w-[280px] h-[400px] flex-shrink-0 bg-slate-900 rounded-[3rem] border-[10px] border-slate-800 shadow-2xl overflow-hidden transition-transform">
                                <div className="h-full w-full bg-[#f0f2f5] flex flex-col overflow-hidden">
                                    {/* App Header */}
                                    <div className="bg-[#00a884] p-4 pt-5 flex items-center gap-3 text-white">
                                        <ArrowRight className="w-5 h-5 rotate-180" />
                                        <User size={24} className="bg-white/20 rounded-full p-1" />
                                        <div className="flex-1">
                                            <p className="text-xs font-bold">University Admission</p>
                                            <p className="text-[9px] text-white/80">Official Account</p>
                                        </div>
                                    </div>

                                    {/* Chat Area */}
                                    <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-[#e5ddd5]">
                                        {activeTemplate && (
                                            <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm text-xs max-w-[85%] animate-in slide-in-from-left duration-300">
                                                <p className="whitespace-pre-wrap leading-relaxed mb-2">
                                                    {(activeTemplate?.preview || '').split(/(\{\{.*?\}\})/).map((part, index) =>
                                                        part.startsWith('{{') ? (
                                                            <span key={index} className="text-emerald-600 font-bold bg-emerald-50 px-1 rounded mx-0.5">{part}</span>
                                                        ) : (
                                                            <span key={index}>{part}</span>
                                                        )
                                                    )}
                                                </p>
                                                <div className="flex justify-end">
                                                    <span className="text-[9px] text-gray-400">12:45 PM</span>
                                                </div>
                                                {/* Action Buttons */}
                                                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                                                    <button className="w-full py-2 text-center text-emerald-500 font-bold text-[10px] border border-emerald-100 rounded bg-emerald-50 hover:bg-emerald-100 transition-colors">
                                                        📅 Join Webinar
                                                    </button>
                                                    <button className="w-full py-2 text-center text-emerald-500 font-bold text-[10px] border border-emerald-100 rounded bg-emerald-50 hover:bg-emerald-100 transition-colors">
                                                        📞 Contact Counselor
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Input Area */}
                                    <div className="p-2 bg-[#f0f2f5] flex items-center gap-2 pb-3">
                                        <div className="text-xl cursor-pointer">😊</div>
                                        <div className="flex-1 bg-white rounded-3xl px-3 py-2 text-[10px] text-gray-400">Type a message</div>
                                        <div className="w-8 h-8 rounded-full bg-[#00a884] text-white flex items-center justify-center">
                                            🎤
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3 Content (Schedule) */}
                {currentStep === 3 && (
                    <div className="flex flex-col md:flex-row gap-8 px-12 pt-10 pb-12 bg-gray-50 min-h-[calc(100vh-140px)]">
                        {/* Left Column */}
                        <div className="flex-1 space-y-6">
                            <div className="mb-2">
                                <h2 className="text-xl font-bold text-slate-800">Schedule Campaign</h2>
                                <p className="text-gray-500 text-sm mt-1">Choose when you want your messages to be delivered.</p>
                            </div>

                            {/* Option 1: Send Now */}
                            <div
                                onClick={() => setScheduleOption('now')}
                                className={`p-6 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all bg-white hover:shadow-sm ${scheduleOption === 'now' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${scheduleOption === 'now' ? 'border-emerald-500' : 'border-gray-300'
                                        }`}>
                                        {scheduleOption === 'now' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">Send Now</h3>
                                        <p className="text-gray-500 text-xs mt-0.5">Campaign will start immediately after clicking 'Launch'</p>
                                    </div>
                                </div>
                                <Zap className={`w-5 h-5 ${scheduleOption === 'now' ? 'text-emerald-500 fill-emerald-500' : 'text-gray-400'}`} />
                            </div>

                            {/* Option 2: Schedule for later */}
                            <div
                                onClick={() => setScheduleOption('later')}
                                className={`p-6 rounded-xl border-2 cursor-pointer transition-all bg-white hover:shadow-sm ${scheduleOption === 'later' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${scheduleOption === 'later' ? 'border-emerald-500' : 'border-gray-300'
                                            }`}>
                                            {scheduleOption === 'later' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">Schedule for later</h3>
                                            <p className="text-gray-500 text-xs mt-0.5">Select a specific date and time for delivery</p>
                                        </div>
                                    </div>
                                    <Calendar className={`w-5 h-5 ${scheduleOption === 'later' ? 'text-emerald-500' : 'text-gray-400'}`} />
                                </div>

                                {scheduleOption === 'later' && (
                                    <div className="flex gap-4 pl-9 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Select Date</label>
                                            <input
                                                type="date"
                                                value={scheduledDate}
                                                onChange={(e) => setScheduledDate(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-50"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Select Time</label>
                                            <input
                                                type="time"
                                                value={scheduledTime}
                                                onChange={(e) => setScheduledTime(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-50"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Completion Alert */}
                            <div className="p-6 rounded-xl border border-gray-200 bg-white flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm">Campaign Completion Alert</h3>
                                    <p className="text-gray-500 text-xs mt-0.5">Receive a WhatsApp notification when the campaign finishes.</p>
                                </div>
                                <button
                                    onClick={() => setCompletionAlert(!completionAlert)}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${completionAlert ? 'bg-emerald-500' : 'bg-gray-300'
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${completionAlert ? 'translate-x-6' : 'translate-x-0'
                                        }`} />
                                </button>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="w-full md:w-[420px] space-y-6">
                            {/* Summary Card */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="font-bold text-slate-800 mb-6 pb-4 border-b border-gray-100">Campaign Summary</h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-start">
                                        <span className="text-gray-500 text-sm">Campaign Name</span>
                                        <span className="font-bold text-slate-800 text-right">{campaignName}</span>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <span className="text-gray-500 text-sm">Template</span>
                                        <a href="#" className="font-bold text-emerald-500 text-right flex items-center gap-1 hover:text-emerald-600">
                                            {activeTemplate?.name || selectedTemplate} <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <span className="text-gray-500 text-sm">Selected Audience</span>
                                        <span className="font-bold text-slate-800 text-right">{estimatedCount.toLocaleString()} Contacts</span>
                                    </div>
                                    <div className="flex justify-between items-start pt-2">
                                        <span className="text-gray-500 text-sm">Estimated Cost</span>
                                        <div className="text-right">
                                            <div className="font-bold text-slate-800">₹{estimatedCost.toFixed(2)}</div>
                                            <div className="text-[10px] text-gray-400 italic">~{estimatedCount} Messages</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Info Box */}
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-3 mb-6">
                                    <Info className="w-5 h-5 text-blue-500 shrink-0" />
                                    <p className="text-xs text-blue-600 leading-relaxed">
                                        Total cost includes estimated Meta conversation fees and platform credits.
                                    </p>
                                </div>

                                {/* Launch Button */}
                                <button
                                    onClick={handleLaunch}
                                    disabled={isLaunching}
                                    className={`w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg shadow-emerald-500/20 ${isLaunching ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isLaunching ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Rocket className="w-5 h-5" />
                                    )}
                                    {isLaunching ? 'Launching...' : 'Launch Campaign'}
                                </button>

                                <p className="text-[10px] text-gray-400 text-center mt-3">By launching, you agree to our WhatsApp Policy Guidelines.</p>
                            </div>

                            {/* Mini Preview */}
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-white/50">
                                <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <Eye className="w-4 h-4" /> Message Preview
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                    <div className="text-xs text-gray-800 leading-relaxed mb-4">
                                        Hello <strong>[Name]!</strong> 👋
                                        <br /><br />
                                        Admissions are now open for 2025 batch. Apply now and get early bird discounts...
                                    </div>
                                    <button className="w-full py-1.5 text-center text-emerald-500 font-bold text-[10px] border border-emerald-100 rounded bg-emerald-50 hover:bg-emerald-100 transition-colors">
                                        Apply Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Fixed Footer for Step 2 only */}
                {currentStep === 2 && (
                    <div className="bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 px-12 z-10 flex items-center justify-between">
                        <button
                            onClick={prevStep}
                            className="flex items-center gap-2 text-slate-600 font-bold hover:text-slate-800 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" /> Back
                        </button>
                        <div className="flex gap-4">
                            <button
                                onClick={handleSaveAsDraft}
                                disabled={isSavingDraft}
                                className="text-slate-500 font-bold hover:text-slate-700 transition-colors disabled:opacity-50"
                            >
                                {isSavingDraft ? 'Saving...' : 'Save Draft'}
                            </button>
                            <button
                                onClick={nextStep}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
                            >
                                Next Step <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </>
    );
};

// Helper Components
const Step = ({ number, label, active, current }) => (
    <div className="flex flex-col items-center gap-2 min-w-[100px]">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${active ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-gray-200 text-gray-500'
            }`}>
            {number}
        </div>
        <span className={`text-xs font-bold whitespace-nowrap transition-colors duration-300 ${active || current ? 'text-emerald-500' : 'text-gray-400'
            }`}>
            {label}
        </span>
    </div>
);

const SelectionCard = ({ title, description, icon, selected, onClick }) => (
    <div
        onClick={onClick}
        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${selected ? 'border-emerald-500 bg-white' : 'border-gray-100 bg-white'
            }`}
    >
        <div className="flex items-start gap-4">
            <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? 'border-emerald-500' : 'border-gray-300'
                }`}>
                {selected && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
            </div>
            <div className="flex-1">
                <div className="flex justify-between">
                    <h3 className="font-bold text-slate-800">{title}</h3>
                    {icon}
                </div>
                <p className="text-gray-500 text-sm mt-1">{description}</p>
            </div>
        </div>
    </div>
);

export default CreateCampaign;