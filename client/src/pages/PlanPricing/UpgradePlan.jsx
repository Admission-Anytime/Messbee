import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckIcon, MinusIcon } from "@heroicons/react/24/solid";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import {
  CheckCircle,
  Lock,
  ShieldCheck,
  CreditCard,
  Building2,
  PlusCircle,
  ArrowLeft,
  ShoppingCart,
  Smartphone,
  FileText,
} from "lucide-react";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ═══════════════════════════════════════════
   SAVED CARD ROW
   ═══════════════════════════════════════════ */
const SavedCardRow = ({ card, selected, onSelect }) => (
  <button
    onClick={() => onSelect(card.id)}
    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left ${selected
        ? "border-emerald-400 bg-emerald-50/40 shadow-sm"
        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
      }`}
  >
    <div
      className={`w-9 h-9 rounded-lg ${card.iconBg} flex items-center justify-center flex-shrink-0`}
    >
      <span className={`text-[9px] font-extrabold ${card.iconColor}`}>
        {card.type}
      </span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-slate-700">{card.label}</p>
      <p className="text-[11px] text-slate-400">{card.sublabel}</p>
    </div>
    <div
      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? "border-emerald-500" : "border-slate-300"
        }`}
    >
      {selected && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
    </div>
  </button>
);

/* ═══════════════════════════════════════════
   CARD DETAILS FORM (shown only after selecting a card)
   ═══════════════════════════════════════════ */
const CardDetailsForm = () => (
  <div className="mt-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
      Enter Card Details
    </p>

    {/* Cardholder Name */}
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">
        Cardholder Name
      </label>
      <input
        type="text"
        placeholder="Johnathan Doe"
        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
      />
    </div>

    {/* Card Number */}
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">
        Card Number
      </label>
      <div className="relative">
        <input
          type="text"
          placeholder="0000 0000 0000 0000"
          maxLength={19}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition pr-16"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex gap-1">
          <span className="text-[8px] font-extrabold text-blue-600 bg-blue-50 px-1 py-0.5 rounded">
            VISA
          </span>
          <span className="text-[8px] font-extrabold text-orange-600 bg-orange-50 px-1 py-0.5 rounded">
            MC
          </span>
        </div>
      </div>
    </div>

    {/* Expiry + CVV */}
    <div className="grid grid-cols-2 gap-2.5">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Expiry Date
        </label>
        <input
          type="text"
          placeholder="MM/YY"
          maxLength={5}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
          CVV
          <span
            className="w-3.5 h-3.5 rounded-full border border-slate-300 text-[8px] text-slate-400 flex items-center justify-center cursor-help"
            title="3-digit security code on back of card"
          >
            ?
          </span>
        </label>
        <input
          type="password"
          placeholder="•••"
          maxLength={4}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
        />
      </div>
    </div>

    {/* Save card */}
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        className="w-3.5 h-3.5 accent-emerald-500 cursor-pointer"
      />
      <span className="text-xs text-slate-500">
        Save this card for future billing
      </span>
    </label>
  </div>
);

/* ═══════════════════════════════════════════
   CHECKOUT PAYMENT PANEL (Tabbed)
   ═══════════════════════════════════════════ */
const CheckoutPaymentPanel = ({ totalDue, onPay, onNavigate }) => {
  const [activeTab, setActiveTab] = useState("card");
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedUpi, setSelectedUpi] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);

  const savedCards = [
    {
      id: "visa-4242",
      type: "VISA",
      label: "Visa ending in 4242",
      sublabel: "Expiry 12/26",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      id: "mc-8899",
      type: "MC",
      label: "Mastercard ending in 8899",
      sublabel: "Expiry 08/25",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  const upiOptions = [
    { id: "gpay", label: "Google Pay", sublabel: "Pay via GPay UPI" },
    { id: "phonepe", label: "PhonePe", sublabel: "Pay via PhonePe UPI" },
    { id: "paytm", label: "Paytm", sublabel: "Pay via Paytm UPI" },
    {
      id: "other-upi",
      label: "Other UPI ID",
      sublabel: "Enter your UPI ID manually",
    },
  ];

  const bankOptions = [
    { id: "sbi", label: "State Bank of India" },
    { id: "hdfc", label: "HDFC Bank" },
    { id: "icici", label: "ICICI Bank" },
    { id: "axis", label: "Axis Bank" },
    { id: "kotak", label: "Kotak Mahindra Bank" },
  ];

  const tabs = [
    {
      id: "card",
      label: "Credit/Debit Card",
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      id: "upi",
      label: "UPI Payment",
      icon: <Smartphone className="w-4 h-4" />,
    },
    {
      id: "netbanking",
      label: "Net Banking",
      icon: <Building2 className="w-4 h-4" />,
    },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer border-b-2 -mb-px ${activeTab === tab.id
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
          >
            <span className="w-3.5 h-3.5 flex-shrink-0">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB: Credit / Debit Card ── */}
      {activeTab === "card" && (
        <div className="space-y-3">
          {savedCards.map((card) => (
            <SavedCardRow
              key={card.id}
              card={card}
              selected={selectedCard === card.id}
              onSelect={(id) =>
                setSelectedCard((prev) => (prev === id ? null : id))
              }
            />
          ))}

          {/* Card form – only visible after a card is selected */}
          {selectedCard && <CardDetailsForm />}

          {/* Add new card */}
          <button
            onClick={onNavigate}
            className="w-full flex items-center justify-center gap-1.5 p-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 text-xs font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all mt-1 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add New Card
          </button>
        </div>
      )}

      {/* ── TAB: UPI ── */}
      {activeTab === "upi" && (
        <div className="space-y-3">
          {upiOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedUpi(opt.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left ${selectedUpi === opt.id
                  ? "border-emerald-400 bg-emerald-50/40 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
            >
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-3.5 h-3.5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-700">
                  {opt.label}
                </p>
                <p className="text-[11px] text-slate-400">{opt.sublabel}</p>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedUpi === opt.id
                    ? "border-emerald-500"
                    : "border-slate-300"
                  }`}
              >
                {selectedUpi === opt.id && (
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </div>
            </button>
          ))}
          {selectedUpi === "other-upi" && (
            <div className="mt-2">
              <input
                type="text"
                placeholder="yourname@upi"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
              />
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Net Banking ── */}
      {activeTab === "netbanking" && (
        <div className="space-y-3">
          {bankOptions.map((bank) => (
            <button
              key={bank.id}
              onClick={() => setSelectedBank(bank.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left ${selectedBank === bank.id
                  ? "border-emerald-400 bg-emerald-50/40 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-700">
                  {bank.label}
                </p>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedBank === bank.id
                    ? "border-emerald-500"
                    : "border-slate-300"
                  }`}
              >
                {selectedBank === bank.id && (
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pay button */}
      <button
        onClick={onPay}
        className="w-full mt-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base transition-all shadow-lg shadow-emerald-200 cursor-pointer flex items-center justify-center gap-2"
      >
        <Lock className="w-4 h-4" />
        Pay &amp; Upgrade Now - ${totalDue.toFixed(2)}
      </button>

      {/* Secured by logos */}
      <div className="mt-5 text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
          Secured &amp; Processed By
        </p>
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-1.5 text-slate-400">
            <CreditCard className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">VISA</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <CreditCard className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Mastercard</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M13 9h-2V7h2m0 10h-2v-6h2M12 2A10 10 0 002 12a10 10 0 0010 10 10 10 0 0010-10A10 10 0 0012 2z" />
            </svg>
            <span className="text-xs font-semibold">Razorpay</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   INVOICE PREVIEW (in-app)
   ═══════════════════════════════════════════ */
const InvoicePreview = ({ plan, billingCycle, txnId, subtotal, gstAmount, totalInr, fmt, onBack }) => {
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const handlePrint = () => window.print();

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: `Invoice ${txnId} – MessBee`, text: `Invoice for ₹${fmt(totalInr)}` }); } catch (_) { }
    }
  };

  const handleDownloadPDF = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Invoice ${txnId} – MessBee</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Inter',sans-serif;font-size:13px;color:#1e293b;background:#fff;padding:52px 60px;max-width:820px;margin:0 auto;}
    .hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;}
    .logo-row{display:flex;align-items:center;gap:10px;}
    .logo-circle{width:38px;height:38px;background:#10b981;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:17px;font-weight:900;}
    .logo-name{font-size:20px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;}
    .company-sub{font-size:10px;font-weight:600;color:#94a3b8;letter-spacing:1.5px;text-transform:uppercase;margin-top:4px;}
    .inv-title{font-size:42px;font-weight:900;color:#059669;text-align:right;}
    .inv-meta{text-align:right;margin-top:8px;}
    .inv-meta .lbl{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;}
    .inv-meta .val{font-size:14px;font-weight:700;color:#0f172a;}
    hr{border:none;border-top:1px solid #e2e8f0;margin:26px 0;}
    .parties{display:flex;gap:80px;margin-bottom:32px;}
    .pty-lbl{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#64748b;margin-bottom:8px;}
    .pty-name{font-size:14px;font-weight:700;color:#0f172a;margin-bottom:5px;}
    .pty-addr{font-size:12px;color:#64748b;line-height:1.8;}
    table{width:100%;border-collapse:collapse;margin-bottom:24px;}
    thead tr{border-bottom:1.5px solid #e2e8f0;}
    thead th{font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#94a3b8;padding:0 0 10px;text-align:left;}
    thead th.r{text-align:right;}
    tbody td{padding:20px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;}
    tbody td.r{text-align:right;}
    .item-n{font-size:14px;font-weight:700;color:#0f172a;}
    .item-s{font-size:11px;color:#94a3b8;margin-top:4px;}
    .totals{display:flex;justify-content:flex-end;margin-top:8px;}
    .tt{width:300px;}
    .tr{display:flex;justify-content:space-between;padding:7px 0;}
    .tl{font-size:13px;color:#64748b;} .tv{font-size:13px;font-weight:600;color:#0f172a;}
    .tdiv{border:none;border-top:1px solid #e2e8f0;margin:6px 0;}
    .total-row{display:flex;justify-content:space-between;padding:14px 0 0;}
    .total-lbl{font-size:14px;font-weight:800;color:#0f172a;text-transform:uppercase;}
    .total-val{font-size:24px;font-weight:900;color:#059669;}
    .ftr{margin-top:56px;display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid #e2e8f0;padding-top:26px;}
    .notes-lbl{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#64748b;margin-bottom:8px;}
    .notes-body{font-size:11px;color:#64748b;line-height:1.8;max-width:380px;}
    .thankyou{font-size:13px;font-weight:700;font-style:italic;color:#059669;margin-top:16px;}
    .sig{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#94a3b8;}
    @media print{body{padding:32px 40px;}@page{margin:0;}}
  </style>
</head>
<body>
  <div class="hdr">
    <div>
      <div class="logo-row">
        <div class="logo-circle">M</div>
        <span class="logo-name">MessBee</span>
      </div>
      <div class="company-sub">Solutions Pvt Ltd</div>
    </div>
    <div>
      <div class="inv-title">INVOICE</div>
      <div class="inv-meta"><div class="lbl">Invoice Number</div><div class="val">${txnId}</div></div>
      <div class="inv-meta" style="margin-top:10px;"><div class="lbl">Date</div><div class="val">${today}</div></div>
    </div>
  </div>
  <hr/>
  <div class="parties">
    <div>
      <div class="pty-lbl">From</div>
      <div class="pty-name">MessBee Solutions Pvt Ltd</div>
      <div class="pty-addr">123 Tech Park, Whitefield<br/>Bangalore, Karnataka, 560066<br/><br/>GSTIN: 29ABCDE1234F1Z5</div>
    </div>
    <div>
      <div class="pty-lbl">Bill To</div>
      <div class="pty-name">Customer</div>
      <div class="pty-addr">GST: N/A</div>
    </div>
  </div>
  <table>
    <thead><tr>
      <th style="width:54%">Description</th>
      <th class="r" style="width:10%">QTY</th>
      <th class="r" style="width:18%">Unit Price</th>
      <th class="r" style="width:18%">Amount</th>
    </tr></thead>
    <tbody><tr>
      <td><div class="item-n">WhatsApp Business API – ${plan.name} Plan (${billingCycle === "yearly" ? "Annual" : "Monthly"})</div>
          <div class="item-s">MessBee platform subscription for WhatsApp Business campaigns</div></td>
      <td class="r">1</td>
      <td class="r">₹${fmt(subtotal)}.00</td>
      <td class="r">₹${fmt(subtotal)}.00</td>
    </tr></tbody>
  </table>
  <div class="totals">
    <div class="tt">
      <div class="tr"><span class="tl">Subtotal</span><span class="tv">₹${fmt(subtotal)}.00</span></div>
      <div class="tr"><span class="tl">GST (18%)</span><span class="tv">₹${fmt(gstAmount)}.00</span></div>
      <hr class="tdiv"/>
      <div class="total-row"><span class="total-lbl">Total Amount</span><span class="total-val">₹${fmt(totalInr)}.00</span></div>
    </div>
  </div>
  <div class="ftr">
    <div>
      <div class="notes-lbl">Notes &amp; Terms</div>
      <div class="notes-body">Please pay within 15 days from the date of invoice. Bank transfer details: MessBee Solutions, HDFC Bank, A/C: 9876543210. Use ${txnId} as reference.</div>
      <div class="thankyou">Thank you for your business!</div>
    </div>
    <div><div class="sig">Authorized Signatory</div></div>
  </div>
  <script>window.onload=function(){window.print();}<\/script>
</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) win.focus();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  return (
    <div className="bg-[#F0F2F5] font-['Urbanist'] min-h-[calc(100vh-120px)] flex flex-col">
      {/* Scrollable invoice area */}
      <div className="flex-1 overflow-y-auto py-8 px-4 flex justify-center">
        <div className="bg-white rounded-2xl shadow-sm w-full max-w-3xl p-10 md:p-14">

          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-black text-lg select-none">M</div>
                <span className="text-xl font-black text-slate-900 tracking-tight">MessBee</span>
              </div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Solutions Pvt Ltd</p>
            </div>
            <div className="text-right">
              <p className="text-5xl font-black text-emerald-600 tracking-tight">INVOICE</p>
              <div className="mt-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Invoice Number</p>
                <p className="text-base font-bold text-slate-900">{txnId}</p>
              </div>
              <div className="mt-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Date</p>
                <p className="text-base font-bold text-slate-900">{today}</p>
              </div>
            </div>
          </div>

          <hr className="border-slate-200 my-7" />

          {/* Parties */}
          <div className="flex gap-20 mb-10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">From</p>
              <p className="text-sm font-bold text-slate-900 mb-1">MessBee Solutions Pvt Ltd</p>
              <p className="text-xs text-slate-500 leading-relaxed">123 Tech Park, Whitefield<br />Bangalore, Karnataka, 560066<br /><br />GSTIN: 29ABCDE1234F1Z5</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Bill To</p>
              <p className="text-sm font-bold text-slate-900 mb-1">Customer</p>
              <p className="text-xs text-slate-500 leading-relaxed">GST: N/A</p>
            </div>
          </div>

          {/* Line Items */}
          <div className="w-full">
            <div className="grid grid-cols-[1fr_60px_120px_120px] border-b border-slate-200 pb-3">
              {["Description", "QTY", "Unit Price", "Amount"].map((h, i) => (
                <p key={h} className={`text-[10px] font-bold uppercase tracking-widest text-slate-400 ${i > 0 ? "text-right" : ""}`}>{h}</p>
              ))}
            </div>
            <div className="grid grid-cols-[1fr_60px_120px_120px] py-5 border-b border-slate-100">
              <div>
                <p className="text-sm font-bold text-slate-900">WhatsApp Business API – {plan.name} Plan ({billingCycle === "yearly" ? "Annual" : "Monthly"})</p>
                <p className="text-[11px] text-slate-400 mt-1">MessBee platform subscription for WhatsApp Business campaigns</p>
              </div>
              <p className="text-sm text-right text-slate-700 self-start pt-0.5">1</p>
              <p className="text-sm font-semibold text-right text-slate-700 self-start pt-0.5">₹{fmt(subtotal)}.00</p>
              <p className="text-sm font-semibold text-right text-slate-700 self-start pt-0.5">₹{fmt(subtotal)}.00</p>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mt-6">
            <div className="w-72 space-y-2">
              <div className="flex justify-between"><span className="text-sm text-slate-500">Subtotal</span><span className="text-sm font-semibold text-slate-700">₹{fmt(subtotal)}.00</span></div>
              <div className="flex justify-between"><span className="text-sm text-slate-500">GST (18%)</span><span className="text-sm font-semibold text-slate-700">₹{fmt(gstAmount)}.00</span></div>
              <hr className="border-slate-200" />
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm font-black text-slate-900 uppercase tracking-wide">Total Amount</span>
                <span className="text-2xl font-black text-emerald-600">₹{fmt(totalInr)}.00</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-end mt-16 pt-7 border-t border-slate-200">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Notes &amp; Terms</p>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm">Please pay within 15 days from the date of invoice. Bank transfer details: MessBee Solutions, HDFC Bank, A/C: 9876543210. Use {txnId} as reference.</p>
              <p className="text-sm font-bold italic text-emerald-600 mt-4">Thank you for your business!</p>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Authorized Signatory</p>
          </div>
        </div>
      </div>

      {/* Sticky toolbar */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-md z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Back
        </button>
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} title="Print" className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all cursor-pointer">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
          </button>
          <button onClick={handleShare} title="Share" className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all cursor-pointer">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
          </button>
          <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all cursor-pointer shadow-md shadow-emerald-200">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   PAYMENT SUCCESS VIEW
   ═══════════════════════════════════════════ */
const PaymentSuccessView = ({ plan, totalDue, billingCycle }) => {
  const navigate = useNavigate();
  const [showInvoice, setShowInvoice] = useState(false);

  const txnId = React.useMemo(
    () => `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
    []
  );

  const baseInr = typeof plan.price === "number" ? plan.price : 999;
  const subtotal = billingCycle === "yearly"
    ? Math.round(baseInr * 12 * 0.65)
    : Math.round(baseInr * 0.75 * 3);
  const gstAmount = Math.round(subtotal * 0.18);
  const totalInr = subtotal + gstAmount;
  const fmt = (n) => Number(n).toLocaleString("en-IN");

  if (showInvoice) {
    return (
      <InvoicePreview
        plan={plan}
        billingCycle={billingCycle}
        txnId={txnId}
        subtotal={subtotal}
        gstAmount={gstAmount}
        totalInr={totalInr}
        fmt={fmt}
        onBack={() => setShowInvoice(false)}
      />
    );
  }

  return (
    <div className="bg-[#F8FAFC] font-['Urbanist'] min-h-[calc(100vh-120px)] flex items-center justify-center p-6">
      <div className="w-full max-w-lg text-center">

        {/* Animated green check */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-200"
            style={{ animation: "bounceIn 0.55s ease forwards" }}
          >
            <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {/* Title & subtitle */}
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 mb-3">
          You're now on the {plan.name} Plan!
        </h1>
        <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed mb-8">
          Congratulations! Your account has been successfully upgraded. You now
          have access to unlimited contacts, priority support, and advanced API features.
        </p>

        {/* Order details card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 text-left shadow-sm">
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <span className="text-sm text-slate-500">Order ID:</span>
            <span className="text-sm font-bold text-slate-800">{txnId}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <span className="text-sm text-slate-500">Amount Paid:</span>
            <span className="text-xl font-extrabold text-slate-800">₹{fmt(totalInr)}</span>
          </div>
          <div className="pt-4 text-center">
            <button
              onClick={() => setShowInvoice(true)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Download Invoice
            </button>
          </div>
        </div>

        {/* Go to Dashboard */}
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-200 cursor-pointer mb-4"
        >
          Go to Dashboard
        </button>

        <p className="text-xs text-slate-400">
          A confirmation email has been sent to your registered address.
        </p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   CHECKOUT / COMPLETE UPGRADE VIEW
   ═══════════════════════════════════════════ */
const CheckoutView = ({ plan, billingCycle, onBack }) => {
  const navigate = useNavigate();
  const [paymentDone, setPaymentDone] = useState(false);

  // Price calculation (INR) — plan.price is the BASE monthly price
  const basePrice = typeof plan.price === "number" ? plan.price : 999;
  const planAmount = billingCycle === "yearly"
    ? Math.round(basePrice * 12 * 0.65)   // 35% off yearly total
    : Math.round(basePrice * 0.75 * 3);   // 25% off × 3 months
  const gstRate = 0.18;
  const gstAmount = Math.round(planAmount * gstRate);
  const totalDue = planAmount + gstAmount;
  const fmtINR = (n) => Number(n).toLocaleString("en-IN");

  const handlePay = () => {
    setPaymentDone(true);
  };

  // Show success screen after payment
  if (paymentDone) {
    return <PaymentSuccessView plan={plan} totalDue={totalDue} billingCycle={billingCycle} />;
  }

  return (
    <div className="bg-[#F8FAFC] font-['Urbanist'] p-4 lg:p-8 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-10">
          {/* header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={onBack}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer mr-1"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-500" />
                </button>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
                  Complete Upgrade
                </h1>
              </div>
              <div className="flex items-center gap-2 ml-11">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-slate-500">
                  Your payment is secured with 256-bit SSL encryption
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-emerald-200 bg-emerald-50">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                Secure Connection Active
              </span>
            </div>
          </div>

          {/* two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* ── LEFT: Order Summary ── */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <ShoppingCart className="w-5 h-5 text-slate-500" />
                <h2 className="text-lg font-bold text-slate-800">
                  Order Summary
                </h2>
              </div>

              {/* plan card */}
              <div className="border border-slate-200 rounded-xl p-5 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                      Current Selection
                    </span>
                    <h3 className="text-lg font-bold text-slate-800 mt-1">
                      {plan.name} Plan
                    </h3>
                    <p className="text-sm text-slate-400">
                      {billingCycle === "yearly" ? "Yearly" : "Quarterly"} Billing Cycle
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-emerald-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Plan Amount</span>
                    <span className="text-sm font-semibold text-slate-700">₹{fmtINR(planAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">GST (18%)</span>
                    <span className="text-sm font-semibold text-slate-700">₹{fmtINR(gstAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-base font-bold text-slate-800">Total Due</span>
                    <span className="text-xl font-extrabold text-emerald-600">₹{fmtINR(totalDue)}</span>
                  </div>
                </div>
              </div>

              {/* benefits */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">
                      Unlimited WhatsApp Messages
                    </p>
                    <p className="text-xs text-slate-400">
                      Scalable infrastructure for your growth
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">
                      Priority 24/7 Support
                    </p>
                    <p className="text-xs text-slate-400">
                      Instant access to our developer team
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Payment Method (Tabbed) ── */}
            <div>
              <CheckoutPaymentPanel
                totalDue={totalDue}
                onPay={handlePay}
                onNavigate={() => navigate("/admin/plan/methods")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   MAIN UPGRADE PLAN PAGE
   ═══════════════════════════════════════════ */
const UpgradePlan = () => {
  const navigate = useNavigate();

  // FIX 1: unified billing cycle state (was split into billingCycle + billingPeriod)
  const [billingCycle, setBillingCycle] = useState("quarterly");
  const [selectedPlan, setSelectedPlan] = useState(null);

  // --- SLIDER STATE ---
  const [marketingCount, setMarketingCount] = useState(1000);
  const [utilityCount, setUtilityCount] = useState(1000);

  const marketingRate = 0.008;
  const utilityRate = 0.004;
  const estimatedTotal =
    marketingCount * marketingRate + utilityCount * utilityRate;

  // Pricing logic matching screenshot exactly:
  // Big number  = total billed for the cycle after discount
  // Strikethrough = total billed for the cycle WITHOUT discount
  // Sub-line    = "₹X billed quarterly/yearly (save Y%)"
  const isYearly = billingCycle === "yearly";
  const discount = isYearly ? 35 : 25;
  const billingLabel = isYearly ? "yearly" : "quarterly";
  const cycleMonths = isYearly ? 12 : 3;

  const originalPrices = { basic: 1537, professional: 2306, enterprise: 3844 };

  // total undiscounted for cycle
  const getOriginalTotal = (base) => base * cycleMonths;
  // total discounted for cycle (this is the BIG number shown on card)
  const getDiscountedTotal = (base) => Math.round(base * cycleMonths * (1 - discount / 100));

  // prices.x.monthly kept for checkout compatibility (discounted monthly equiv)
  const prices = {
    basic: { monthly: Math.round(originalPrices.basic * (1 - discount / 100)) },
    professional: { monthly: Math.round(originalPrices.professional * (1 - discount / 100)) },
    enterprise: { monthly: Math.round(originalPrices.enterprise * (1 - discount / 100)) },
  };

  const formatPrice = (n) => Number(n).toLocaleString("en-IN");

  // --- BUTTON HANDLER ---
  const handlePlanSelect = (plan) => {
    if (plan.name === "Enterprise") {
      window.location.href =
        "mailto:sales@messbee.com?subject=Enterprise Plan Inquiry";
    } else {
      setSelectedPlan(plan);
    }
  };

  const plans = [
    {
      name: "Free",
      price: 0,
      isFree: true,
      description: "Forever free",
      features: [
        "Free WhatsApp Business API",
        "300 messages replies per month",
        "300 contacts",
        "1 Automation with 3 nodes",
        "Send campaign to 50/months",
        "Shared team inbox",
        "Tags, Custom Fields - 5",
        "Upload contacts with CRM",
        "Template Management",
      ],
      cta: "Buy Now",
      popular: false,
    },
    {
      name: "Basic",
      price: 1537,
      description: "Perfect for small teams getting started.",
      features: [
        "Send bulk WhatsApp message",
        "Import CSV & broadcast",
        "Auto reply on broadcast",
        "Send welcome messages with multimedia",
        "Set away message & holidays",
        "Shared team inbox with collaborative features",
        "Automation with choice based bots",
        "Assign Agents & track",
        "Upload contacts with CRM",
        "Template Management"
      ],
      cta: "Buy Now",
      popular: false,
    },
    {
      name: "Professional",
      price: 2306,
      description: "Advanced tools for growing operations.",
      features: [
        "All Starter features +",
        "Schedule Bulk Message",
        "Auto assign agents with round robin",
        "Retarget with smart categorisation",
        "Send Message with API",
        "Add contacts, Run campaign APIs",
        "Ask questions, Assign Agents in chatbot",
        "Payment, Google Sheet Integration",
        "Advance analytics",
        "Export Contacts & Campaign Reports"
      ],
      cta: "Buy Now",
      popular: true,
    },
    {
      name: "Enterprise",
      price: 3844,
      description: "Custom solutions for large scale.",
      features: [
        "All featues in Growth +",
        "Advance chatbot builder",
        "Recurring Campaigns",
        "Campaign Automation",
        "Number masking",
        "10 Agents",
        "5 App integrations",
        "More uses access",
        "Save billing in marketing message",
        "Added Support and Services",
        "Higher uses and longer backup",
        "Webhook"
      ],
      cta: "Talk to us",
      popular: false,
    },
  ];

  /* ── CHECKOUT VIEW ── */
  if (selectedPlan) {
    return (
      <CheckoutView
        plan={selectedPlan}
        billingCycle={billingCycle}
        onBack={() => setSelectedPlan(null)}
      />
    );
  }

  /* ── PLAN SELECTION VIEW ── */
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8 font-['Urbanist'] pb-20 relative">
      <ToastContainer />

      <div className="max-w-7xl mx-auto space-y-16">
        {/* --- HEADER --- */}
        <div className="text-center space-y-6">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900">
            Scale your business with WhatsApp
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Choose the plan that grows with your business. From early-stage
            startups to global enterprises.
          </p>
        </div>

        {/* --- PRICING SECTION --- */}
        <section className="py-10 bg-white rounded-3xl" id="pricing">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900">Simple, transparent pricing</h2>
              <p className="mt-4 text-slate-500">Choose the plan that fits your business stage.</p>

              {/* ── Billing Toggle ── */}
              <div className="mt-10 flex items-center justify-center">
                <div style={{ backgroundColor: "#EEF2F7", borderRadius: "999px", padding: "6px", display: "inline-flex", alignItems: "center", gap: "0px" }}>
                  <button
                    onClick={() => setBillingCycle("quarterly")}
                    style={{
                      padding: "10px 32px",
                      borderRadius: "999px",
                      fontSize: "14px",
                      fontWeight: "700",
                      cursor: "pointer",
                      border: billingCycle === "quarterly" ? "1px solid #E2E8F0" : "1px solid transparent",
                      backgroundColor: billingCycle === "quarterly" ? "#FFFFFF" : "transparent",
                      color: billingCycle === "quarterly" ? "#1E293B" : "#94A3B8",
                      boxShadow: billingCycle === "quarterly" ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                      transition: "all 0.2s ease",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Quarterly - 25%
                  </button>
                  <button
                    onClick={() => setBillingCycle("yearly")}
                    style={{
                      padding: "10px 32px",
                      borderRadius: "999px",
                      fontSize: "14px",
                      fontWeight: "700",
                      cursor: "pointer",
                      border: billingCycle === "yearly" ? "1px solid #E2E8F0" : "1px solid transparent",
                      backgroundColor: billingCycle === "yearly" ? "#FFFFFF" : "transparent",
                      color: billingCycle === "yearly" ? "#1E293B" : "#94A3B8",
                      boxShadow: billingCycle === "yearly" ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                      transition: "all 0.2s ease",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Yearly - 35%
                  </button>
                </div>
              </div>
            </div>

            {/* ── Plan Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* Free */}
              <div className="p-8 rounded-2xl border border-slate-200 flex flex-col hover:shadow-xl transition-all bg-white relative">
                <div className="text-center mb-6">
                  <h3 className="font-bold text-xl mb-4 text-slate-900">Free</h3>
                  <div className="text-4xl font-extrabold text-slate-900 mb-1">Free</div>
                  <p className="text-sm text-slate-400">Forever free</p>
                </div>
                <button
                  onClick={() => handlePlanSelect(plans[0])}
                  className="w-full py-3 mb-8 bg-emerald-500 text-white rounded-xl font-bold hover:shadow-lg transition-all cursor-pointer hover:bg-emerald-600"
                >
                  Buy Now
                </button>
                <ul className="space-y-4 flex-grow">
                  {[
                    "Free WhatsApp Business API",
                    "300 messages replies per month",
                    "300 contacts",
                    "1 Automation with 3 nodes",
                    "Send campaign to 50/months",
                    "Shared team inbox",
                    "Tags, Custom Fields - 5",
                    "Upload contacts with CRM",
                    "Template Management"
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-slate-500">
                      <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" /></svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Basic */}
              <div className="p-8 rounded-2xl border border-slate-200 flex flex-col hover:shadow-xl transition-all bg-white relative">
                <div className="text-center mb-6">
                  <h3 className="font-bold text-xl mb-4 text-slate-900">Basic</h3>
                  <div className="text-4xl font-extrabold text-slate-900 mb-1">
                    ₹{formatPrice(prices.basic.monthly)}
                  </div>
                  <p className="text-xs text-slate-400 mb-2">per month</p>
                  <p className="text-xs text-emerald-600 font-bold">
                    <span className="line-through text-slate-400 mr-1">₹{formatPrice(originalPrices.basic)}</span>
                    ₹{formatPrice(prices.basic.monthly)} billed {billingLabel} (save {discount}%)
                  </p>
                </div>
                <button
                  onClick={() => handlePlanSelect(plans[1])}
                  className="w-full py-3 mb-8 bg-slate-900 text-white rounded-xl font-bold hover:shadow-lg transition-all cursor-pointer hover:bg-slate-800"
                >
                  Buy Now
                </button>
                <ul className="space-y-4 flex-grow">
                  {[
                    "Send bulk WhatsApp message",
                    "Import CSV & broadcast",
                    "Auto reply on broadcast",
                    "Send welcome messages with multimedia",
                    "Set away message & holidays",
                    "Shared team inbox with collaborative features",
                    "Automation with choice based bots",
                    "Assign Agents & track",
                    "Upload contacts with CRM",
                    "Template Management"
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-slate-500">
                      <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" /></svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Professional */}
              <div className="p-8 rounded-2xl border-2 border-emerald-500 bg-emerald-50/30 flex flex-col hover:shadow-xl transition-all relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Most Popular</div>
                <div className="text-center mb-6">
                  <h3 className="font-bold text-xl mb-4 text-emerald-500">Professional</h3>
                  <div className="text-4xl font-extrabold text-slate-900 mb-1">
                    ₹{formatPrice(prices.professional.monthly)}
                  </div>
                  <p className="text-xs text-slate-400 mb-2">per month</p>
                  <p className="text-xs text-emerald-600 font-bold">
                    <span className="line-through text-slate-400 mr-1">₹{formatPrice(originalPrices.professional)}</span>
                    ₹{formatPrice(prices.professional.monthly)} billed {billingLabel} (save {discount}%)
                  </p>
                </div>
                <button
                  onClick={() => handlePlanSelect(plans[2])}
                  className="w-full py-3 mb-8 bg-emerald-500 text-white rounded-xl font-bold hover:shadow-lg transition-all cursor-pointer hover:bg-emerald-600"
                >
                  Buy Now
                </button>
                <ul className="space-y-4 flex-grow">
                  {[
                    { text: "All Starter features +", bold: true },
                    { text: "Schedule Bulk Message", bold: false },
                    { text: "Auto assign agents with round robin", bold: false },
                    { text: "Retarget with smart categorisation", bold: false },
                    { text: "Send Message with API", bold: false },
                    { text: "Add contacts, Run campaign APIs", bold: false },
                    { text: "Ask questions, Assign Agents in chatbot", bold: false },
                    { text: "Payment, Google Sheet Integration", bold: false },
                    { text: "Advance analytics", bold: false },
                    { text: "Export Contacts & Campaign Reports", bold: false },
                  ].map((f) => (
                    <li key={f.text} className={`flex items-start gap-3 text-sm ${f.bold ? "font-semibold text-slate-700" : "text-slate-500"}`}>
                      <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" /></svg>
                      <span>{f.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Enterprise */}
              <div className="p-8 rounded-2xl border border-slate-200 flex flex-col hover:shadow-xl transition-all bg-white relative">
                <div className="text-center mb-6">
                  <h3 className="font-bold text-xl mb-4 text-slate-900">Enterprise</h3>
                  <div className="text-4xl font-extrabold text-slate-900 mb-1">
                    ₹{formatPrice(prices.enterprise.monthly)}
                  </div>
                  <p className="text-xs text-slate-400 mb-2">per month</p>
                  <p className="text-xs text-emerald-600 font-bold">
                    <span className="line-through text-slate-400 mr-1">₹{formatPrice(originalPrices.enterprise)}</span>
                    ₹{formatPrice(prices.enterprise.monthly)} billed {billingLabel} (save {discount}%)
                  </p>
                </div>
                <button
                  onClick={() => handlePlanSelect(plans[3])}
                  className="w-full py-3 mb-8 bg-slate-900 text-white rounded-xl font-bold hover:shadow-lg transition-all cursor-pointer hover:bg-slate-800"
                >
                  Talk to us
                </button>
                <ul className="space-y-4 flex-grow">
                  {[
                    { text: "All featues in Growth +", bold: true },
                    { text: "Advance chatbot builder", bold: false },
                    { text: "Recurring Campaigns", bold: false },
                    { text: "Campaign Automation", bold: false },
                    { text: "Number masking", bold: false },
                    { text: "10 Agents", bold: false },
                    { text: "5 App integrations", bold: false },
                    { text: "More uses access", bold: false },
                    { text: "Save billing in marketing message", bold: false },
                    { text: "Added Support and Services", bold: false },
                    { text: "Higher uses and longer backup", bold: false },
                    { text: "Webhook", bold: false },
                  ].map((f) => (
                    <li key={f.text} className={`flex items-start gap-3 text-sm ${f.bold ? "font-semibold text-slate-700" : "text-slate-500"}`}>
                      <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" /></svg>
                      <span>{f.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* --- COST ESTIMATOR SLIDER --- */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 w-full space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Estimate your Monthly Spend
              </h3>
              <p className="text-sm text-slate-500">
                Move the sliders to calculate your expected monthly messaging
                costs based on Meta's pricing.
              </p>
            </div>

            {/* Slider 1 */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Marketing Messages
                </label>
                <span className="text-sm font-bold text-emerald-600">
                  {marketingCount.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100000"
                step="100"
                value={marketingCount}
                onChange={(e) => setMarketingCount(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Slider 2 */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Utility Messages
                </label>
                <span className="text-sm font-bold text-emerald-600">
                  {utilityCount.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50000"
                step="100"
                value={utilityCount}
                onChange={(e) => setUtilityCount(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>

          <div className="w-full md:w-auto bg-slate-50 rounded-2xl p-8 min-w-[300px] text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Estimated Total
            </span>
            <div className="text-4xl font-extrabold text-slate-900 my-2">
              ${estimatedTotal.toFixed(2)}
            </div>
            <p className="text-xs text-slate-400">/month plus platform fee</p>
            <div className="mt-4 text-xs bg-white border border-gray-200 rounded-lg p-2 text-slate-500">
              Includes 1,000 monthly free service conversations per account.
            </div>
          </div>
        </div>

        {/* --- COMPARISON TABLE --- */}
        <div>
          <h3 className="text-2xl font-bold text-slate-900 text-center mb-10">
            Detailed Feature Comparison
          </h3>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-5 bg-gray-50/50 p-4 border-b border-gray-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <div className="col-span-1">Feature</div>
              <div className="text-center">Free</div>
              <div className="text-center">Basic</div>
              <div className="text-center text-emerald-600">Professional</div>
              <div className="text-center">Enterprise</div>
            </div>

            {[
              { name: "Shared Team Chat Inbox", free: true, basic: true, pro: true, ent: true },
              { name: "Private Note in chat", free: true, basic: true, pro: true, ent: true },
              { section: "Team Chat Inbox" },
              { name: "Multiple Agent chatting Inbox", free: true, basic: true, pro: true, ent: true },
              { name: "Pin, Archive, Block, Mark unread", free: true, basic: true, pro: true, ent: true },
              { name: "Open Close chats for support tracking", free: true, basic: true, pro: true, ent: true },
              { name: "Advance filter of crm and Tags", free: false, basic: true, pro: true, ent: true },
              { name: "Number Masking", free: false, basic: false, pro: true, ent: true },
              { section: "Contacts & CRM" },
              { name: "Bulk Actions for chats & contacts", free: true, basic: true, pro: true, ent: true },
              { name: "Labels", free: "5", basic: "20", pro: "50", ent: "100" },
              { name: "Custom Fields", free: "5", basic: "10", pro: "20", ent: "40" },
              { name: "Status", free: "5", basic: "10", pro: "20", ent: "20" },
              { name: "Quick Reply", free: "5", basic: "10", pro: "50", ent: "100" },
              { name: "Add contact via API", free: false, basic: false, pro: true, ent: true },
              { name: "Contacts Export in csv", free: false, basic: false, pro: true, ent: true },
              { name: "Manual Assigning Agents", free: true, basic: true, pro: true, ent: true },
              { name: "Round robin assignment", free: false, basic: false, pro: true, ent: true },
              { name: "Import CSV to add contacts", free: true, basic: true, pro: true, ent: true },
              { name: "Agents", free: "1", basic: "5", pro: "5", ent: "10" },
              { name: "Quick Reply – Canned Response", free: false, basic: true, pro: true, ent: true },
              { section: "Broadcast and Campaign" },
              { name: "Number of Campaign", free: "1", basic: "Unlimited", pro: "Unlimited", ent: "Unlimited" },
              { name: "Import csv to run campaign", free: true, basic: true, pro: true, ent: true },
              { name: "Campaign Analytics", free: true, basic: true, pro: true, ent: true },
              { name: "Schedule Campaign", free: false, basic: true, pro: true, ent: true },
              { name: "Send Marketing, Utility, Auth template", free: true, basic: true, pro: true, ent: true },
              { name: "Campaign price estimate", free: true, basic: true, pro: true, ent: true },
              { name: "Duplicate Campaign", free: false, basic: true, pro: true, ent: true },
              { name: "Export campaign result", free: false, basic: false, pro: true, ent: true },
              { name: "Retarget Campaign", free: false, basic: false, pro: true, ent: true },
              { name: "Recurring Campaign", free: false, basic: false, pro: false, ent: true },
              { name: "Send campaign via api", free: false, basic: false, pro: false, ent: true },
              { section: "Automation & Integration" },
              { name: "Chatbot Count", free: "1", basic: "3", pro: "5", ent: "5" },
              { name: "Chatbot Nodes", free: "3", basic: "20", pro: "50", ent: "100" },
              { name: "Drag & Drop Chatbot builder", free: true, basic: true, pro: true, ent: true },
              { name: "Set welcome and away message", free: true, basic: true, pro: true, ent: true },
              { name: "Fallback message automation", free: true, basic: true, pro: true, ent: true },
              { name: "Ask questions and save response", free: false, basic: false, pro: true, ent: true },
              { name: "Assign Agent", free: false, basic: false, pro: true, ent: true },
              { name: "Marketing opt in/out", free: false, basic: false, pro: true, ent: true },
              { name: "Rest API Calls", free: false, basic: false, pro: true, ent: true },
              { name: "Apps Integration", free: "0", basic: "1", pro: "2", ent: "5" },
              { name: "Webhook", free: false, basic: false, pro: false, ent: true },
              { name: "API calls/minute", free: "0", basic: "0", pro: "240", ent: "600" },
              { section: "More Features" },
              { name: "Template creation and management", free: true, basic: true, pro: true, ent: true },
              { name: "Template Analytics", free: false, basic: true, pro: true, ent: true },
              { name: "Message Analytics", free: true, basic: true, pro: true, ent: true },
              { name: "Multiple WhatsApp Business API Numbers", free: false, basic: true, pro: true, ent: true },
              { name: "Backup", free: "1 month", basic: "6 months", pro: "12 months", ent: "Subscription period" },
              { section: "Support" },
              { name: "Email", free: false, basic: true, pro: true, ent: true },
              { name: "Help Doc & Video", free: true, basic: true, pro: true, ent: true },
              { name: "WhatsApp", free: false, basic: false, pro: true, ent: true },
            ].map((row, idx) => {
              if (row.section) {
                return (
                  <div key={idx} className="grid grid-cols-5 bg-slate-50 px-4 py-2.5 border-b border-gray-100">
                    <div className="col-span-5 text-xs font-bold text-slate-600 uppercase tracking-wider">{row.section}</div>
                  </div>
                );
              }
              const renderCell = (val, highlight = false) => (
                <div className={`text-center text-sm text-slate-600 ${highlight ? "font-medium bg-emerald-50/50 py-1 rounded" : ""}`}>
                  {val === true ? (
                    <CheckIcon className="w-5 h-5 text-emerald-500 mx-auto" />
                  ) : val === false ? (
                    <MinusIcon className="w-4 h-4 text-gray-300 mx-auto" />
                  ) : (
                    <span className="font-medium">{val}</span>
                  )}
                </div>
              );
              return (
                <div key={idx} className="grid grid-cols-5 px-4 py-3.5 border-b border-gray-50 items-center hover:bg-slate-50/30 transition-colors">
                  <div className="text-sm text-slate-600 pr-4">{row.name}</div>
                  {renderCell(row.free)}
                  {renderCell(row.basic)}
                  {renderCell(row.pro, true)}
                  {renderCell(row.ent)}
                </div>
              );
            })}
          </div>
        </div>

        {/* --- WHATSAPP CONVERSATION CHARGES --- */}
        <div className="flex justify-center">
          <div className="w-full max-w-3xl bg-emerald-50 rounded-2xl overflow-hidden border border-emerald-100 shadow-sm">
            <div className="px-8 py-5 text-center">
              <h3 className="text-base font-bold text-slate-900">
                WhatsApp Conversation Charges{" "}
                <span className="text-slate-400 font-normal text-sm">(Prices in India)</span>
              </h3>
            </div>
            <div className="bg-white mx-4 mb-4 rounded-xl overflow-hidden border border-gray-100">
              <div className="grid grid-cols-5 border-b border-gray-100 px-5 py-3">
                <div className="text-sm font-semibold text-slate-700">Type</div>
                <div className="text-sm font-semibold text-slate-700 text-center">Free</div>
                <div className="text-sm font-semibold text-slate-700 text-center">Basic</div>
                <div className="text-sm font-semibold text-emerald-600 text-center">Professional</div>
                <div className="text-sm font-semibold text-slate-700 text-center">Enterprise</div>
              </div>
              <div className="grid grid-cols-5 px-5 py-4 border-b border-gray-50 items-center">
                <div className="text-sm text-slate-600">Marketing</div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`text-sm text-slate-700 text-center ${i === 2 ? "bg-emerald-50/60 py-1 rounded" : ""}`}>₹0.95</div>
                ))}
              </div>
              <div className="grid grid-cols-5 px-5 py-4 border-b border-gray-50 items-center">
                <div className="text-sm text-slate-600">Utility &amp; Authentication</div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`text-sm text-slate-700 text-center ${i === 2 ? "bg-emerald-50/60 py-1 rounded" : ""}`}>₹0.13</div>
                ))}
              </div>
              <div className="grid grid-cols-5 px-5 py-4 items-center">
                <div className="text-sm text-slate-600">Service</div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`text-sm font-bold text-emerald-600 text-center ${i === 2 ? "bg-emerald-50/60 py-1 rounded" : ""}`}>FREE</div>
                ))}
              </div>
            </div>
            <div className="text-center pb-5">
              <a href="#" className="text-sm text-emerald-600 font-medium hover:text-emerald-700 transition-colors">
                Other country pricing →
              </a>
            </div>
          </div>
        </div>

        {/* --- FAQ & SECURITY --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10 border-t border-gray-200">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900">
              Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Can I change plans later?
                </h4>
                <p className="text-sm text-slate-500 mt-1">
                  Yes, you can upgrade or downgrade your plan at any time.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Are Meta fees included?
                </h4>
                <p className="text-sm text-slate-500 mt-1">
                  No, Meta charges for business-initiated and user-initiated
                  conversations separately.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-8 flex flex-col justify-center items-center text-center">
            <ShieldCheckIcon className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="font-bold text-slate-900 mb-2">
              Secure Payment Guaranteed
            </h3>
            <p className="text-sm text-slate-500 max-w-xs">
              We use industry-standard encryption. No credit card required for
              trial.
            </p>
            <div className="mt-4 flex gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>🔒 PCI DSS Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePlan;