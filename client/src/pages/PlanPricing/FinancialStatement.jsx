import React, { useState } from "react";
import {
    ArrowDownTrayIcon,
    FunnelIcon,
    ChevronDownIcon,
    PlusCircleIcon,
    MinusCircleIcon,
} from "@heroicons/react/24/outline";

const allTransactions = [
    {
        id: 1,
        date: "Oct 28, 2024",
        time: "14:22:10",
        refId: "TXN-882910",
        description: "Campaign: Diwali Sale Blast",
        subDesc: "Conversations: 1,420 messages",
        amount: -426.0,
        balance: 618.51,
        type: "debit",
    },
    {
        id: 2,
        date: "Oct 26, 2024",
        time: "11:05:44",
        refId: "TOP-441299",
        description: "WCC Top-up via UPI",
        subDesc: "Payment Successful",
        amount: 2500.0,
        balance: 1044.51,
        type: "credit",
    },
    {
        id: 3,
        date: "Oct 25, 2024",
        time: "09:12:00",
        refId: "TXN-882103",
        description: "Automated Template Update",
        subDesc: "Service Charge",
        amount: -50.0,
        balance: 1455.49,
        type: "debit",
    },
    {
        id: 4,
        date: "Oct 20, 2024",
        time: "18:45:12",
        refId: "TXN-881900",
        description: "Daily Utility Conversations",
        subDesc: "Bulk Deduct: 310 messages",
        amount: -93.0,
        balance: 1505.49,
        type: "debit",
    },
    {
        id: 5,
        date: "Oct 15, 2024",
        time: "10:00:00",
        refId: "TOP-440112",
        description: "WCC Top-up via UPI",
        subDesc: "Payment Successful",
        amount: 2500.0,
        balance: 1598.49,
        type: "credit",
    },
    {
        id: 6,
        date: "Oct 01, 2024",
        time: "00:00:01",
        refId: "SUB-991022",
        description: "Monthly Platform Fee",
        subDesc: "Enterprise Plan",
        amount: -4999.0,
        balance: 1240.0,
        type: "debit",
    },
];

function FinancialStatement() {
    const [filter, setFilter] = useState("All Transactions");
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 3;

    const filtered =
        filter === "All Transactions"
            ? allTransactions
            : filter === "Credits"
                ? allTransactions.filter((t) => t.type === "credit")
                : allTransactions.filter((t) => t.type === "debit");

    const totalCredited = allTransactions
        .filter((t) => t.type === "credit")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalDebited = allTransactions
        .filter((t) => t.type === "debit")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const openingBalance = 1240.0;

    const fmt = (v) =>
        `₹${Math.abs(v).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

    return (
        <div className="font-['Urbanist']">
            {/* Main Content */}
            <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto flex flex-col gap-6">

                {/* Page Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-xl font-black text-slate-900">Financial Statement</h1>
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Date Range Selector */}
                        <button className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                            <span>📅</span>
                            Oct 1, 2024 – Oct 31, 2024
                            <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                        </button>
                        {/* Download Button */}
                        <button className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            Download PDF/CSV
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {/* Opening Balance */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 relative overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Opening Balance</p>
                        <div className="absolute top-4 right-4 text-slate-200">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <p className="text-2xl font-black text-slate-900">{fmt(openingBalance)}</p>
                        <p className="text-xs text-slate-400 mt-1">As of Oct 1, 2024</p>
                    </div>

                    {/* Total Credited */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 relative overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Total Credited</p>
                        <div className="absolute top-4 right-4 text-emerald-300">
                            <PlusCircleIcon className="w-6 h-6" />
                        </div>
                        <p className="text-2xl font-black text-emerald-500">+{fmt(totalCredited)}</p>
                        <p className="text-xs text-slate-400 mt-1">
                            {allTransactions.filter((t) => t.type === "credit").length} transactions
                        </p>
                    </div>

                    {/* Total Debited */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 relative overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Total Debited</p>
                        <div className="absolute top-4 right-4 text-slate-300">
                            <MinusCircleIcon className="w-6 h-6" />
                        </div>
                        <p className="text-2xl font-black text-slate-800">-{fmt(totalDebited)}</p>
                        <p className="text-xs text-slate-400 mt-1">
                            {allTransactions.filter((t) => t.type === "debit").length} transactions
                        </p>
                    </div>
                </div>

                {/* Transaction History Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Table Header */}
                    <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-800">Transaction History</h3>
                        {/* Filter Dropdown */}
                        <div className="relative">
                            <button
                                className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                                onClick={() => {
                                    const opts = ["All Transactions", "Credits", "Debits"];
                                    const next = opts[(opts.indexOf(filter) + 1) % opts.length];
                                    setFilter(next);
                                }}
                            >
                                <FunnelIcon className="w-3.5 h-3.5" />
                                {filter}
                                <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                        </div>
                    </div>

                    {/* Column Headers */}
                    <div className="grid grid-cols-12 px-6 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <div className="col-span-2">Date &amp; Time</div>
                        <div className="col-span-2">Reference ID</div>
                        <div className="col-span-4">Description</div>
                        <div className="col-span-2 text-right">Amount</div>
                        <div className="col-span-2 text-right">Running Balance</div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-slate-100">
                        {filtered.map((tx) => (
                            <div key={tx.id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors">
                                <div className="col-span-2">
                                    <p className="text-sm font-semibold text-slate-800">{tx.date}</p>
                                    <p className="text-xs text-slate-400">{tx.time}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                        {tx.refId}
                                    </span>
                                </div>
                                <div className="col-span-4">
                                    <p className="text-sm font-semibold text-slate-800">{tx.description}</p>
                                    <p
                                        className={`text-xs font-medium ${tx.type === "credit" ? "text-emerald-500" : "text-slate-400"
                                            }`}
                                    >
                                        {tx.subDesc}
                                    </p>
                                </div>
                                <div className="col-span-2 text-right">
                                    <span
                                        className={`text-sm font-black ${tx.type === "credit" ? "text-emerald-500" : "text-slate-800"
                                            }`}
                                    >
                                        {tx.type === "credit" ? "+" : "-"}
                                        {fmt(tx.amount)}
                                    </span>
                                </div>
                                <div className="col-span-2 text-right">
                                    <span className="text-sm font-bold text-slate-700">{fmt(tx.balance)}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs text-slate-400 font-medium">Showing 6 of 144 transactions</p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Prev
                            </button>
                            {[1, 2, 3].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setCurrentPage(p)}
                                    className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors border ${currentPage === p
                                        ? "bg-slate-800 text-white border-slate-800"
                                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default FinancialStatement;
