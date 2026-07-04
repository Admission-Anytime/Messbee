import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeftIcon,
    ArrowLeftCircleIcon,
    PencilIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

function BillingAddress() {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = React.useState(false);

    const [form, setForm] = useState({
        businessName: "Acme Corporation",
        addressLine1: "123 Innovation Drive",
        addressLine2: "Suite 400",
        city: "San Francisco",
        state: "CA",
        postalCode: "94107",
        country: "United States",
    });

    const countries = [
        "United States",
        "United Kingdom",
        "Canada",
        "Australia",
        "India",
        "Germany",
        "France",
        "Singapore",
        "UAE",
        "Other",
    ];

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleDiscard = () => {
        setForm({
            businessName: "Acme Corporation",
            addressLine1: "123 Innovation Drive",
            addressLine2: "Suite 400",
            city: "San Francisco",
            state: "CA",
            postalCode: "94107",
            country: "United States",
        });
    };

    const inputClass =
        "w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all placeholder:text-slate-300";

    const labelClass =
        "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5";

    return (
        <div className="font-['Urbanist']">
            {/* Main Content */}
            <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto flex flex-col gap-6">

                {/* Page Heading with back arrow */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/admin/plan/statement")}
                        className="text-slate-500 hover:text-slate-800 transition-colors shrink-0"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Billing Address</h2>
                        <p className="text-sm text-slate-400 mt-0.5">
                            Update your company's billing information for invoices and receipts.
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-5">

                    {/* Card Header with Edit/Cancel */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-800">Address Details</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Your billing address for invoices and receipts.</p>
                        </div>
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

                    {/* Business Name */}
                    <div>
                        <label className={labelClass}>Business Name</label>
                        {isEditing ? (
                            <input type="text" name="businessName" value={form.businessName} onChange={handleChange} className={inputClass} placeholder="Your company name" />
                        ) : (
                            <p className="text-sm font-semibold text-slate-800 py-1">{form.businessName || <span className="text-slate-300">—</span>}</p>
                        )}
                    </div>

                    {/* Address Line 1 */}
                    <div>
                        <label className={labelClass}>Address Line 1</label>
                        {isEditing ? (
                            <input type="text" name="addressLine1" value={form.addressLine1} onChange={handleChange} className={inputClass} placeholder="Street address" />
                        ) : (
                            <p className="text-sm font-semibold text-slate-800 py-1">{form.addressLine1 || <span className="text-slate-300">—</span>}</p>
                        )}
                    </div>

                    {/* Address Line 2 */}
                    <div>
                        <label className={labelClass}>Address Line 2 (Optional)</label>
                        {isEditing ? (
                            <input type="text" name="addressLine2" value={form.addressLine2} onChange={handleChange} className={inputClass} placeholder="Apartment, suite, unit, etc." />
                        ) : (
                            <p className="text-sm font-semibold text-slate-800 py-1">{form.addressLine2 || <span className="text-slate-300">—</span>}</p>
                        )}
                    </div>

                    {/* City / State / Postal Code */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className={labelClass}>City</label>
                            {isEditing ? (
                                <input type="text" name="city" value={form.city} onChange={handleChange} className={inputClass} placeholder="City" />
                            ) : (
                                <p className="text-sm font-semibold text-slate-800 py-1">{form.city || <span className="text-slate-300">—</span>}</p>
                            )}
                        </div>
                        <div>
                            <label className={labelClass}>State / Province</label>
                            {isEditing ? (
                                <input type="text" name="state" value={form.state} onChange={handleChange} className={inputClass} placeholder="State" />
                            ) : (
                                <p className="text-sm font-semibold text-slate-800 py-1">{form.state || <span className="text-slate-300">—</span>}</p>
                            )}
                        </div>
                        <div>
                            <label className={labelClass}>Postal Code</label>
                            {isEditing ? (
                                <input type="text" name="postalCode" value={form.postalCode} onChange={handleChange} className={inputClass} placeholder="Postal code" />
                            ) : (
                                <p className="text-sm font-semibold text-slate-800 py-1">{form.postalCode || <span className="text-slate-300">—</span>}</p>
                            )}
                        </div>
                    </div>

                    {/* Country */}
                    <div>
                        <label className={labelClass}>Country</label>
                        {isEditing ? (
                            <select name="country" value={form.country} onChange={handleChange} className={inputClass}>
                                {countries.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-sm font-semibold text-slate-800 py-1">{form.country || <span className="text-slate-300">—</span>}</p>
                        )}
                    </div>

                    {/* Footer Row — only visible when editing */}
                    {isEditing && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-2">
                            <p className="text-xs text-slate-400 italic">
                                Changes will be applied to your next generated invoice.
                            </p>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => { handleDiscard(); setIsEditing(false); }}
                                    className="flex-1 sm:flex-none px-5 py-2.5 bg-white text-slate-700 border border-slate-200 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Discard
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-500 text-white text-sm font-bold rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Return Link */}
                <button
                    onClick={() => navigate("/admin/plan/statement")}
                    className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors w-fit"
                >
                    <ArrowLeftCircleIcon className="w-4 h-4" />
                    Return to Subscription Overview
                </button>
            </div>
        </div>
    );
}

export default BillingAddress;
