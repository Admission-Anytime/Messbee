import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    X, Users, Tag, FileUp, ArrowRight, ChevronDown,
    Search, CheckCircle, Clock, Eye, Smartphone, ChevronLeft,
    Zap, Calendar, Info, Rocket, ExternalLink, User
} from 'lucide-react';

const CreateCampaign = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);

    // Step 1 State
    const [selectedOption, setSelectedOption] = useState('all');
    const [labels, setLabels] = useState(['New Leads', 'Follow-up']);

    // Step 2 State
    const [selectedTemplate, setSelectedTemplate] = useState('admission_promo_05');
    const [searchQuery, setSearchQuery] = useState('');

    // Step 3 State
    const [scheduleOption, setScheduleOption] = useState('now');
    const [completionAlert, setCompletionAlert] = useState(true);
    const [campaignName, setCampaignName] = useState('Dev Demo Q3');
    const [scheduledDate, setScheduledDate] = useState('2025-07-24');
    const [scheduledTime, setScheduledTime] = useState('12:00');

    const templates = [
        {
            id: 'admission_promo_05',
            status: 'approved',
            name: 'admission_promo_05',
            preview: 'Hello {{name}}, thank you for showing interest in {{program}}.\n\nWe are excited to invite you to our upcoming webinar on June 15th.\n\nLooking forward to seeing you there!',
            lastUsed: '2 days ago',
            category: 'Marketing'
        },
        {
            id: 'result_alert_mbbs',
            status: 'approved',
            name: 'result_alert_mbbs',
            preview: 'Dear {{student_name}}, your {{exam_type}} results for the 2024 session have been published.\n\nCheck your portal for detailed breakdown.\n\nBest regards,\nUniversity Admin',
            lastUsed: '5 days ago',
            category: 'Utility'
        },
        {
            id: 'welcome_onboarding',
            status: 'approved',
            name: 'welcome_onboarding',
            preview: 'Welcome to {{company_name}}! We\'re thrilled to have you.\n\nClick the button below to complete your profile setup and get started.\n\nSee you inside!',
            lastUsed: 'Never',
            category: 'Onboarding'
        },
        {
            id: 'event_reminder_01',
            status: 'pending',
            name: 'event_reminder_01',
            preview: "Don't miss out! Our session {{event_name}} starts in {{time_left}}.\n\nMake sure to join 5 minutes early to test your audio.",
            lastUsed: 'Never',
            category: 'Alerts'
        }
    ];

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => {
        if (currentStep === 1) {
            navigate('/admin/campaigns');
        } else {
            setCurrentStep(prev => Math.max(prev - 1, 1));
        }
    };

    const activeTemplate = templates.find(t => t.id === selectedTemplate);

    return (
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
                        <button className="text-slate-500 font-bold hover:text-slate-700 transition-colors text-sm">
                            Save as Draft
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
                            <h2 className="text-xl font-bold text-slate-800">Who should receive this campaign?</h2>
                            <p className="text-gray-500 mt-1">Select the contacts you want to reach out to.</p>
                        </div>

                        <div className="space-y-4">
                            {/* Option 1: All Contacts */}
                            <SelectionCard
                                id="all"
                                title="All Contacts"
                                description="Send this campaign to everyone in your contact list (1,240 contacts)."
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
                                        <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-200 rounded-lg bg-gray-50/50">
                                            {labels.map(label => (
                                                <span key={label} className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-md text-sm text-gray-700 shadow-sm">
                                                    {label} <X className="w-3 h-3 text-gray-400 cursor-pointer" />
                                                </span>
                                            ))}
                                            <input
                                                placeholder="Add labels..."
                                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-400 min-w-[100px]"
                                            />
                                            <ChevronDown className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Option 3: Upload CSV */}
                            <SelectionCard
                                id="csv"
                                title="Upload CSV"
                                description="Import a list of contacts from a CSV or Excel file."
                                icon={<FileUp className="w-5 h-5 text-gray-400" />}
                                selected={selectedOption === 'csv'}
                                onClick={() => setSelectedOption('csv')}
                            />
                        </div>

                        {/* Footer Info & Actions */}
                        <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <div className="w-4 h-4 bg-gray-400 text-white rounded-full flex items-center justify-center text-[10px] italic font-serif">i</div>
                                <span>Estimated audience: <strong className="text-slate-800 font-bold">1,240 contacts</strong></span>
                            </div>
                            <div className="flex gap-3">
                                <button className="px-8 py-2.5 rounded-lg border border-gray-200 font-bold text-slate-700 hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button
                                    onClick={nextStep}
                                    className="px-8 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 font-bold text-white flex items-center gap-2 transition-colors"
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
                                        <User size={24} className="bg-white/20 rounded-full p-1"/>
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
                                                    {activeTemplate.preview.split(/(\{\{.*?\}\})/).map((part, index) =>
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
                                            {selectedTemplate} <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <span className="text-gray-500 text-sm">Selected Audience</span>
                                        <span className="font-bold text-slate-800 text-right">1,248 Contacts</span>
                                    </div>
                                    <div className="flex justify-between items-start pt-2">
                                        <span className="text-gray-500 text-sm">Estimated Cost</span>
                                        <div className="text-right">
                                            <div className="font-bold text-slate-800">₹936.00</div>
                                            <div className="text-[10px] text-gray-400 italic">~1,248 Credits</div>
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
                                <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg shadow-emerald-500/20">
                                    <Rocket className="w-5 h-5" /> Launch Campaign
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
                            <button className="text-slate-500 font-bold hover:text-slate-700 transition-colors">
                                Save Draft
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