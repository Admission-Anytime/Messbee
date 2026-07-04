import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowDownTrayIcon, ShareIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { userContext } from "../../context/Context";

function InvoiceView() {
    const navigate = useNavigate();
    const { id } = useParams();
    const invoiceId = id || "INV-2024-001";

    const { user } = useContext(userContext);
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const { default: axios } = await import("../../context/axios");
                const response = await axios.get("/billing/transactions");
                const data = response.data.data;
                const foundTxn = data.find(t => t.transactionId === invoiceId);
                setTransaction(foundTxn);
            } catch (error) {
                console.error("Error fetching invoice", error);
            } finally {
                setLoading(false);
            }
        };

        if (invoiceId !== "INV-2024-001") {
            fetchInvoice();
        } else {
            setLoading(false);
        }
    }, [invoiceId]);

    const handlePrint = () => window.print();

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: `Invoice ${invoiceId}`, url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center font-['Urbanist']">Loading Invoice...</div>;
    }

    if (!transaction && invoiceId !== "INV-2024-001") {
        return <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center font-['Urbanist'] text-red-500 font-bold">Invoice Not Found.</div>;
    }

    const fmtINR = (n) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
    
    // Dynamic Calculations
    const totalAmount = transaction ? transaction.amount : 5900;
    const subtotal = totalAmount / 1.18;
    const gst = totalAmount - subtotal;
    const dateObj = transaction ? new Date(transaction.date) : new Date("2024-10-24");
    const dateString = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const desc = transaction ? transaction.desc : "WhatsApp Conversation Credits (WCC) Top-up";
    const subDesc = transaction?.desc.includes("Plan Renewal") ? "Subscription renewal charges" : "Usage-based messaging credits";
    
    const clientName = user?.company || user?.name || "ATRI ADMISSION ANYTIME PVT LTD";

    return (
        <div className="min-h-screen bg-[#F0F2F5] font-['Urbanist']">
            {/* Invoice Paper */}
            <div className="max-w-[700px] mx-auto py-8 px-4">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

                    {/* Invoice Body */}
                    <div className="p-10">

                        {/* Top: Logo + INVOICE word */}
                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-7 h-7 bg-[#10B981] rounded-full flex items-center justify-center">
                                        <span className="text-white text-[10px] font-black">M</span>
                                    </div>
                                    <span className="text-base font-black text-[#0f172a] tracking-tight">MessBee</span>
                                </div>
                                <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest">Solutions Pvt Ltd</p>
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-black text-[#059669] tracking-tight">INVOICE</p>
                                <div className="mt-3 text-xs text-[#94a3b8] space-y-1">
                                    <div className="flex justify-end gap-2">
                                        <span>Invoice Number</span>
                                    </div>
                                    <p className="font-black text-[#0f172a] text-sm">{invoiceId}</p>
                                    <div className="flex justify-end gap-2 mt-2">
                                        <span>Date</span>
                                    </div>
                                    <p className="font-bold text-[#0f172a]">{dateString}</p>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-100 my-6" />

                        {/* FROM / BILL TO */}
                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mb-3">From</p>
                                <p className="text-sm font-black text-[#0f172a]">MessBee Solutions Pvt Ltd</p>
                                <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                                    123 Tech Park, Whitefield<br />
                                    Bangalore, Karnataka, 560066
                                </p>
                                <p className="text-xs text-[#64748b] mt-2 font-medium">GSTIN: 29ABCDE1234F1Z5</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mb-3">Bill To</p>
                                <p className="text-sm font-black text-[#0f172a] uppercase">{clientName}</p>
                                <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                                    Customer ID: {user?._id?.substring(0, 8).toUpperCase() || "N/A"}
                                </p>
                            </div>
                        </div>

                        {/* Table Header */}
                        <div className="border-t border-slate-100 pt-4">
                            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-1 pb-3">
                                <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Description</p>
                                <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest w-12 text-center">Qty</p>
                                <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest w-24 text-right">Unit Price</p>
                                <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest w-24 text-right">Amount</p>
                            </div>
                            <div className="border-t border-slate-100" />

                            {/* Line Item */}
                            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-1 py-5 items-start">
                                <div>
                                    <p className="text-sm font-bold text-[#0f172a]">{desc}</p>
                                    <p className="text-xs text-[#94a3b8] mt-0.5">{subDesc}</p>
                                </div>
                                <p className="text-sm text-[#0f172a] w-12 text-center">1</p>
                                <p className="text-sm text-[#0f172a] w-24 text-right">{fmtINR(subtotal)}</p>
                                <p className="text-sm font-bold text-[#0f172a] w-24 text-right">{fmtINR(subtotal)}</p>
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="border-t border-slate-100 mt-4 pt-6">
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex justify-between w-56 text-sm text-[#64748b]">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-[#0f172a]">{fmtINR(subtotal)}</span>
                                </div>
                                <div className="flex justify-between w-56 text-sm text-[#64748b]">
                                    <span>GST (18%)</span>
                                    <span className="font-semibold text-[#0f172a]">{fmtINR(gst)}</span>
                                </div>
                                <div className="flex justify-between w-56 mt-3 pt-3 border-t border-slate-200">
                                    <span className="text-sm font-black text-[#0f172a] uppercase tracking-wide">Total Amount</span>
                                    <span className="text-xl font-black text-[#059669]">{fmtINR(totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Spacer */}
                        <div className="h-10" />

                        {/* Notes & Terms */}
                        <div className="border-t border-slate-100 pt-6">
                            <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mb-2">Notes &amp; Terms</p>
                            <p className="text-xs text-[#64748b] leading-relaxed max-w-xs">
                                Please pay within 15 days from the date of invoice. Bank transfer details:
                                MessBee Solutions, HDFC Bank, A/C: 9876543210. Use {invoiceId} as reference.
                            </p>
                            <div className="flex items-end justify-between mt-6">
                                <p className="text-sm font-bold text-[#059669] italic">Thank you for your business!</p>
                                <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Authorized Signatory</p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="border-t border-slate-100 bg-slate-50/60 px-8 py-4 flex items-center justify-between gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                        >
                            ← Back
                        </button>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handlePrint}
                                className="p-2 text-slate-400 hover:text-slate-700 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors"
                                title="Print"
                            >
                                <PrinterIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleShare}
                                className="p-2 text-slate-400 hover:text-slate-700 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors"
                                title="Share"
                            >
                                <ShareIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#10B981] text-white text-sm font-bold rounded-lg hover:bg-[#059669] transition-colors shadow-sm"
                            >
                                <ArrowDownTrayIcon className="w-4 h-4" />
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InvoiceView;
