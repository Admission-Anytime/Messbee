import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeftIcon,
    QuestionMarkCircleIcon,
    InformationCircleIcon,
    ShieldCheckIcon,
    ChevronRightIcon,
    PencilIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

function TaxInformation() {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = React.useState(false);

    const [form, setForm] = useState({
        taxType: "VAT (Value Added Tax)",
        taxIdNumber: "",
        registeredAddress: "",
        city: "",
        state: "",
        postalCode: "",
    });

    const taxTypes = [
        "VAT (Value Added Tax)",
        "GST (Goods and Services Tax)",
        "HST (Harmonized Sales Tax)",
        "SST (Sales and Service Tax)",
        "Corporate Tax ID",
        "EIN (Employer Identification Number)",
        "Other",
    ];

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleDiscard = () => {
        setForm({
            taxType: "VAT (Value Added Tax)",
            taxIdNumber: "",
            registeredAddress: "",
            city: "",
            state: "",
            postalCode: "",
        });
    };

    const inputClass =
        "w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all placeholder:text-slate-300";

    const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

    return (
        <div className="font-['Urbanist']">
            {/* Main Content */}
            <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto flex flex-col gap-6">

                {/* Breadcrumb with back arrow */}
                <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                    <button
                        onClick={() => navigate("/admin/plan/statement")}
                        className="text-slate-500 hover:text-slate-800 transition-colors mr-1"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => navigate("/admin/plan/statement")}
                        className="hover:text-slate-600 transition-colors"
                    >
                        Billing
                    </button>
                    <ChevronRightIcon className="w-3.5 h-3.5" />
                    <span className="text-slate-700">Tax Information</span>
                </nav>

                {/* Form Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-5">

                    {/* Card Header with Edit/Cancel */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Business Tax Details</h2>
                            <p className="text-sm text-slate-400 mt-1">
                                Provide your official tax details for accurate invoicing.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                                Verification Pending
                            </span>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-1.5 text-sm font-bold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    <PencilIcon className="w-3.5 h-3.5" />
                                    Edit
                                </button>
                            ) : (
                                <button
                                    onClick={() => { setIsEditing(false); handleDiscard(); }}
                                    className="flex items-center gap-1.5 text-sm font-bold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    <XMarkIcon className="w-3.5 h-3.5" />
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tax Type + Tax ID Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Tax Type</label>
                            {isEditing ? (
                                <select name="taxType" value={form.taxType} onChange={handleChange} className={inputClass}>
                                    {taxTypes.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            ) : (
                                <p className="text-sm font-semibold text-slate-800 py-1">{form.taxType || <span className="text-slate-300">—</span>}</p>
                            )}
                        </div>
                        <div>
                            <label className={labelClass}>Tax Identification Number</label>
                            {isEditing ? (
                                <input type="text" name="taxIdNumber" value={form.taxIdNumber} onChange={handleChange} className={inputClass} placeholder="e.g. GB 123 4567 89" />
                            ) : (
                                <p className="text-sm font-semibold text-slate-800 py-1">{form.taxIdNumber || <span className="text-slate-300">—</span>}</p>
                            )}
                        </div>
                    </div>

                    {/* Registered Business Address */}
                    <div>
                        <label className={labelClass}>Registered Business Address</label>
                        {isEditing ? (
                            <textarea name="registeredAddress" value={form.registeredAddress} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} placeholder="Enter full legal business address as registered with tax authorities..." />
                        ) : (
                            <p className="text-sm font-semibold text-slate-800 py-1 min-h-[4rem]">{form.registeredAddress || <span className="text-slate-300">—</span>}</p>
                        )}
                    </div>

                    {/* City / State / Postal Code */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className={labelClass}>City</label>
                            {isEditing ? (
                                <input type="text" name="city" value={form.city} onChange={handleChange} className={inputClass} />
                            ) : (
                                <p className="text-sm font-semibold text-slate-800 py-1">{form.city || <span className="text-slate-300">—</span>}</p>
                            )}
                        </div>
                        <div>
                            <label className={labelClass}>State / Province</label>
                            {isEditing ? (
                                <input type="text" name="state" value={form.state} onChange={handleChange} className={inputClass} />
                            ) : (
                                <p className="text-sm font-semibold text-slate-800 py-1">{form.state || <span className="text-slate-300">—</span>}</p>
                            )}
                        </div>
                        <div>
                            <label className={labelClass}>Postal Code</label>
                            {isEditing ? (
                                <input type="text" name="postalCode" value={form.postalCode} onChange={handleChange} className={inputClass} />
                            ) : (
                                <p className="text-sm font-semibold text-slate-800 py-1">{form.postalCode || <span className="text-slate-300">—</span>}</p>
                            )}
                        </div>
                    </div>

                    {/* Action Row — only visible when editing */}
                    {isEditing && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-2">
                            <p className="flex items-center gap-2 text-xs text-slate-400">
                                <InformationCircleIcon className="w-4 h-4 shrink-0" />
                                Updating these details will apply to all future invoices.
                            </p>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => { handleDiscard(); setIsEditing(false); }}
                                    className="flex-1 sm:flex-none px-5 py-2.5 bg-white text-slate-700 border border-slate-200 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Discard Changes
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 sm:flex-none px-5 py-2.5 bg-[#1e293b] text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                                >
                                    Save Information
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Why is this required */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                                <ShieldCheckIcon className="w-5 h-5" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-800">Why is this required?</h4>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            To comply with international tax laws and provide legally valid invoices for your
                            accounting, we require your registered business details. This information is stored
                            securely and only used for tax compliance.
                        </p>
                    </div>

                    {/* Need help */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center shrink-0">
                                <QuestionMarkCircleIcon className="w-5 h-5" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-800">Need help?</h4>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed mb-4">
                            If you're unsure about your tax identification format or need assistance with tax
                            exemption certificates, please contact our support team.
                        </p>
                        <button
                            onClick={() => navigate("/admin/help/support")}
                            className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TaxInformation;
