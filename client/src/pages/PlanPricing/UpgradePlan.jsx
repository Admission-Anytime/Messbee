import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../context/Context";
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
  Sparkles,
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
      <div className="flex bg-slate-100/70 p-1 rounded-xl mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold transition-all duration-300 cursor-pointer rounded-lg ${activeTab === tab.id
              ? "bg-white text-emerald-600 shadow-sm border border-slate-200/50"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
          >
            <span className={`w-4 h-4 flex-shrink-0 transition-colors ${activeTab === tab.id ? 'text-emerald-500' : 'text-slate-400'}`}>{tab.icon}</span>
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
        className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-base transition-all duration-300 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
        <Lock className="w-4 h-4 relative z-10" />
        <span className="relative z-10">Pay &amp; Upgrade Now - ₹{totalDue.toFixed(2)}</span>
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
      <div className="flex-1 overflow-y-auto py-10 px-4 flex justify-center bg-slate-50/50">
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 w-full max-w-3xl p-10 md:p-14 relative overflow-hidden transition-all">
          {/* Subtle top decoration */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>

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
  const { user, updateUser, refreshUser } = useContext(userContext);

  // Price calculation (INR)
  const INR_MONTHLY = { basic: 899, growth: 1299, professional: 2500 };
  const basePrice = INR_MONTHLY[plan.id] || 899;
  const months = billingCycle === "yearly" ? 12 : billingCycle === "quarterly" ? 3 : 1;
  const planAmount = basePrice * months;
  const gstRate = 0.18;
  const gstAmount = Math.round(planAmount * gstRate);
  const totalDue = planAmount + gstAmount;
  const fmtINR = (n) => Number(n).toLocaleString("en-IN");


  const handlePay = async () => {
    try {
      const { default: axios } = await import("../../context/axios");

      // Step 1: Create Razorpay order on backend
      const orderResponse = await axios.post("/billing/razorpay/create-order", {
        scenario: "subscription",
        amount: totalDue,
        planType: plan.id,
        billingCycle: billingCycle
      });

      const { orderId, keyId, transactionId } = orderResponse.data.data;

      // Step 2: Open Razorpay checkout
      const options = {
        key: keyId,
        amount: totalDue * 100, // Amount in paisa
        currency: "INR",
        name: "MessBee",
        description: `${plan.name} Plan - ${billingCycle}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            const paymentId = response.razorpay_payment_id;
            const signature = response.razorpay_signature;

            // 1) Verify signature & update transaction
            const verifyResponse = await axios.post('/billing/razorpay/verify-payment', {
              orderId,
              paymentId,
              signature,
              transactionId
            });

            if (verifyResponse.data?.success) {
              toast.success('Payment signature verified');
            } else {
              toast.warn('Signature verification failed; proceeding to server checks');
            }

            // 2) Cross-verify with Razorpay
            const crossVerifyResponse = await axios.post('/billing/razorpay/cross-verify', {
              orderId,
              paymentId,
              transactionId
            });

            if (crossVerifyResponse.data?.verified || crossVerifyResponse.data?.success) {
              toast.success('Server confirmed payment with Razorpay');
            } else {
              toast.warn('Server could not fully verify payment with Razorpay');
            }

            // 3) Reconcile for final decision
            const reconcileResponse = await axios.post('/billing/razorpay/reconcile', {
              orderId,
              clientPaymentId: paymentId,
              clientSignature: signature,
              clientStatus: verifyResponse.data?.success ? 'success' : 'failed',
              transactionId
            });

            if (reconcileResponse.data?.success || reconcileResponse.data?.reconciled) {
              toast.success('Payment reconciled successfully');
              try {
                if (refreshUser) await refreshUser();
              } catch (_) {}
              setPaymentDone(true);
            } else {
              const reason = (reconcileResponse.data?.mismatches || []).join('; ') || reconcileResponse.data?.message || 'Reconciliation failed';
              toast.error('Payment reconciliation failed: ' + reason);
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error(error.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || ""
        },
        theme: {
          color: "#10B981" // Emerald color matching your UI
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled");
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error("Payment gateway unavailable. Please try again later or contact support.");
    }
  };

  // Show success screen after payment
  if (paymentDone) {
    return <PaymentSuccessView plan={plan} totalDue={totalDue} billingCycle={billingCycle} />;
  }

  return (
    <div className="bg-[#F8FAFC] font-['Urbanist'] p-4 lg:p-8 min-h-screen pb-20">
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
  const { user, updateUser, refreshUser, rolePermissions } = useContext(userContext);
  const userRole = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()) : "Agent";
  const isAdmin = userRole === "Admin";

  // Current plan from user data — used to highlight the active plan card
  const currentPlan = user?.subscriptionPlan?.toLowerCase() || "free";

  const isExpired = Boolean(
    user?.subscriptionEndDate && new Date(user.subscriptionEndDate) < new Date()
  );

  // Check manage_billing permission — reads from rolePermissions for all roles including Admin
  const DEFAULT_BILLING_PERMS = { Admin: true, Manager: false, Agent: false };
  const hasBillingAccess = rolePermissions?.[userRole]?.manage_billing
    ?? DEFAULT_BILLING_PERMS[userRole]
    ?? false;

  // Billing cycle & currency state
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [currency, setCurrency] = useState("INR");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [expandedPlans, setExpandedPlans] = useState({});

  const toggleExpand = (planId) => {
    setExpandedPlans((prev) => ({ ...prev, [planId]: !prev[planId] }));
  };

  // --- SLIDER STATE ---
  const [marketingCount, setMarketingCount] = useState(1000);
  const [utilityCount, setUtilityCount] = useState(1000);

  const marketingRate = 0.008;
  const utilityRate = 0.004;
  const estimatedTotal =
    marketingCount * marketingRate + utilityCount * utilityRate;

  // ── PRICING TABLE ──────────────────────────────────────────
  // USD base monthly prices
  const USD_MONTHLY = { basic: 12, growth: 18, professional: 35 };
  // INR base monthly prices
  const INR_MONTHLY = { basic: 899, growth: 1299, professional: 2500 };

  const CYCLE_CONFIG = {
    monthly:   { months: 1,  label: "month",           billingPrefix: "Billed monthly" },
    quarterly: { months: 3,  label: "month (quarterly)", billingPrefix: "Billed quarterly" },
    yearly:    { months: 12, label: "month (annual)",    billingPrefix: "Billed annually" },
  };

  const cfg = CYCLE_CONFIG[billingCycle];

  const getDisplayPrice = (planKey) => {
    if (planKey === "free" || planKey === "corporate") return null;
    const base = currency === "USD" ? USD_MONTHLY[planKey] : INR_MONTHLY[planKey];
    return base * cfg.months;
  };

  const getBillingTotal = (planKey) => {
    return getDisplayPrice(planKey);
  };

  const formatPrice = (n) =>
    currency === "USD"
      ? `$${n}`
      : `₹${Number(n).toLocaleString("en-IN")}`;



  // --- BUTTON HANDLER ---
  const handlePlanSelect = async (plan) => {
    if (plan.isFree) {
      if (isExpired && currentPlan === "free") {
        toast.error("Your 30-day Free trial has expired. Please select a paid plan to continue.");
        return;
      }
      if (currentPlan === "free") {
        toast.info("You are already on the 30-Day Free Trial.");
        return;
      }
      return;
    }
    if (plan.isCustom) {
      navigate("/admin/help/support");
      return;
    }
    setSelectedPlan(plan);
  };

  if (!hasBillingAccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#F8FAFC] p-4 font-['Urbanist']">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center space-y-6 border border-slate-100">
          <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <Lock className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            You don't have the access to manage billing or upgrade plans. 
            Please contact your administrator.
          </p>
          <button 
            onClick={() => navigate(-1)}
            className="w-full py-4 bg-[#1e293b] hover:bg-[#0f172a] text-white font-bold rounded-2xl transition-all shadow-lg shadow-slate-200 cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const plans = [
    {
      id: "free",
      name: "Free Trial",
      price: 0,
      isFree: true,
      description: "30-Day Free Access",
      cta: (isExpired && currentPlan === "free") ? "Trial Expired" : "Start Now",
      popular: false,
      features: [
        { text: "500 message replies/month" },
        { text: "500 contacts" },
        { text: "1 automation" },
        { text: "3 automation nodes" },
        { text: "1 chatbot" },
        { text: "3 chatbot nodes" },
        { text: "1 campaign" },
        { text: "Basic Team Inbox" },
        { text: "Multiple Agent Chat" },
        { text: "Private Notes" },
        { text: "Contact Management" },
        { text: "Basic CRM" },
        { text: "Labels" },
        { text: "Custom Fields" },
        { text: "Status Management" },
        { text: "Quick Replies" },
        { text: "Template Management" },
        { text: "Basic Campaign Analytics" },
        { text: "Basic Automation" },
        { text: "Welcome Message" },
        { text: "Away Message" },
        { text: "CSV Contact Import" },
      ],
    },
    {
      id: "basic",
      name: "Basic",
      price: null,
      isFree: false,
      description: "Perfect for small teams getting started.",
      cta: "Start Now",
      popular: false,
      features: [
        { text: "All Free features, plus:", bold: true },
        { text: "Bulk WhatsApp Campaigns" },
        { text: "Unlimited Campaigns" },
        { text: "CSV Campaign Import" },
        { text: "Campaign Scheduling" },
        { text: "Campaign Analytics" },
        { text: "Marketing Templates" },
        { text: "Utility Templates" },
        { text: "Authentication Templates" },
        { text: "Choice-Based Chatbot" },
        { text: "Welcome & Away Automation" },
        { text: "Fallback Automation" },
        { text: "Button-Based Automation" },
        { text: "Agent Assignment" },
        { text: "Agent Tracking" },
        { text: "CRM Contact Management" },
        { text: "Increased Labels" },
        { text: "Increased Custom Fields" },
        { text: "Increased Quick Replies" },
        { text: "Template Analytics" },
        { text: "WhatsApp Number Setup" },
        { text: "Basic Onboarding & Training" },
      ],
    },
    {
      id: "growth",
      name: "Growth",
      price: null,
      isFree: false,
      description: "Advanced tools for growing teams.",
      cta: "Start Now",
      popular: true,
      features: [
        { text: "All Basic features, plus:", bold: true },
        { text: "Scheduled Bulk Messages" },
        { text: "Advanced Campaign Management" },
        { text: "Campaign API" },
        { text: "Contact API" },
        { text: "REST API" },
        { text: "API Messaging" },
        { text: "240 API Calls/minute" },
        { text: "Add Contacts via API" },
        { text: "Contact Export" },
        { text: "Auto Agent Assignment" },
        { text: "Round-Robin Agent Assignment" },
        { text: "Smart Retargeting" },
        { text: "Customer Segmentation" },
        { text: "Advanced Chatbot" },
        { text: "Ask Customer Questions" },
        { text: "Save Customer Responses" },
        { text: "Multiple Actions on Buttons" },
        { text: "Chatbot Agent Assignment" },
        { text: "Marketing Opt-in/Opt-out" },
        { text: "Update Custom Fields" },
        { text: "Payment Integration" },
        { text: "Google Sheets Integration" },
        { text: "Advanced Analytics" },
        { text: "Contact Reports" },
        { text: "Campaign Reports" },
        { text: "Manual Retry" },
        { text: "Advanced CRM" },
        { text: "Template Setup Assistance" },
        { text: "Campaign Setup Assistance" },
        { text: "CRM Setup Assistance" },
        { text: "1-Hour Training" },
      ],
    },
    {
      id: "professional",
      name: "Professional",
      price: null,
      isFree: false,
      description: "For scaling operations with advanced automation.",
      cta: "Start Now",
      popular: false,
      features: [
        { text: "All Growth features, plus:", bold: true },
        { text: "Advanced Chatbot Builder" },
        { text: "Up to 10 Chatbot Nodes" },
        { text: "Recurring Campaigns" },
        { text: "Advanced Campaign Automation" },
        { text: "Smart Auto Retry" },
        { text: "Marketing Delivery Optimization" },
        { text: "Number Masking" },
        { text: "Webhooks" },
        { text: "600 API Calls/minute" },
        { text: "Up to 5 App Integrations" },
        { text: "Up to 10 Agents" },
        { text: "Advanced Workflow Automation" },
        { text: "Multi-Step Automation" },
        { text: "Advanced Agent Assignment" },
        { text: "Higher Usage Limits" },
        { text: "Extended Backup" },
        { text: "Advanced Analytics" },
        { text: "Advanced Reporting" },
        { text: "CRM Integration" },
        { text: "Payment Integration" },
        { text: "Google Sheets Integration" },
        { text: "Custom API Integration" },
        { text: "Contact & CRM Setup" },
        { text: "Facebook Business Verification Assistance" },
        { text: "Professional Onboarding" },
        { text: "Priority Support" },
      ],
    },
    {
      id: "corporate",
      name: "Corporate",
      price: null,
      isFree: false,
      isCustom: true,
      description: "Custom billing cycle",
      cta: "Contact Sales",
      popular: false,
      features: [
        { text: "All Professional features, plus:", bold: true },
        { text: "Custom Usage Limits" },
        { text: "Multiple WhatsApp Numbers" },
        { text: "Custom Number of Agents" },
        { text: "Enterprise Team Management" },
        { text: "Custom Roles & Permissions" },
        { text: "Department Management" },
        { text: "Advanced Access Control" },
        { text: "Enterprise API" },
        { text: "Custom API Limits" },
        { text: "Advanced Webhooks" },
        { text: "CRM Integration" },
        { text: "ERP Integration" },
        { text: "Custom Software Integration" },
        { text: "Custom Automation" },
        { text: "Custom Chatbot" },
        { text: "AI Automation" },
        { text: "Lead Routing" },
        { text: "Custom Business Rules" },
        { text: "Custom Triggers" },
        { text: "Custom Reports" },
        { text: "Custom Dashboards" },
        { text: "Advanced Business Analytics" },
        { text: "Dedicated Account Manager" },
        { text: "Priority Support" },
        { text: "Dedicated Onboarding" },
        { text: "Custom Training" },
        { text: "Migration Assistance" },
        { text: "Enterprise Implementation" },
        { text: "Custom Data Management" },
      ],
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
        <div className="text-center space-y-4">
          <span style={{ display: "inline-block", background: "#d1fae5", color: "#059669", fontSize: "11px", fontWeight: "800", letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 16px", borderRadius: "999px", marginBottom: "8px" }}>Plan &amp; Pricing</span>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Choose the Plan That Fits Your Growth
          </h1>
          {isExpired && (
            <div className="max-w-xl mx-auto mt-3 p-3.5 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-center justify-center gap-2.5 text-rose-900 shadow-sm text-left">
              <span className="text-lg shrink-0">⚠️</span>
              <p className="text-xs sm:text-sm font-bold leading-snug">
                Your {currentPlan === "free" ? "30-day Free trial" : `${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan`} has expired. Please renew or upgrade your plan below to continue using MessBee.
              </p>
            </div>
          )}
        </div>



        <div className="text-center mb-4">
          {/* ── Currency + Billing Toggle ── */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Currency */}
            {[{ key: "INR", label: "INR (₹)" }, { key: "USD", label: "USD ($)" }].map(c => (
              <button
                key={c.key}
                onClick={() => setCurrency(c.key)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  border: currency === c.key ? "none" : "1px solid #E2E8F0",
                  backgroundColor: currency === c.key ? "#10B981" : "#F8FAFC",
                  color: currency === c.key ? "#fff" : "#64748B",
                  transition: "all 0.2s ease",
                }}
              >{c.label}</button>
            ))}
            {/* Billing Cycle */}
            {[{ key: "monthly", label: "Monthly" }, { key: "quarterly", label: "Quarterly" }, { key: "yearly", label: "Yearly / Annual" }].map(b => (
              <button
                key={b.key}
                onClick={() => setBillingCycle(b.key)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  border: billingCycle === b.key ? "none" : "1px solid #E2E8F0",
                  backgroundColor: billingCycle === b.key ? "#10B981" : "#F8FAFC",
                  color: billingCycle === b.key ? "#fff" : "#64748B",
                  transition: "all 0.2s ease",
                }}
              >{b.label}</button>
            ))}
          </div>
        </div>

        {/* --- PRICING SECTION --- */}
        <section id="pricing">
          <div className="max-w-7xl mx-auto px-0 sm:px-2">

            {/* ── Plan Cards ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px", alignItems: "stretch" }}>

              {plans.map((plan, idx) => {
                const isPopular = plan.popular;
                const isCurrent = currentPlan === plan.id;
                const displayPrice = plan.isFree ? 0 : plan.isCustom ? null : getDisplayPrice(plan.id);
                const billingTotal = plan.isFree || plan.isCustom ? null : getBillingTotal(plan.id);

                return (
                  <div
                    key={plan.id}
                    style={{
                      background: "#fff",
                      border: isPopular ? "2px solid #10B981" : "1px solid #E2E8F0",
                      borderRadius: "16px",
                      padding: "24px 16px",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      position: "relative",
                      boxShadow: isPopular ? "0 8px 32px rgba(16,185,129,0.13)" : "0 1px 4px rgba(0,0,0,0.04)",
                      transition: "box-shadow 0.2s",
                    }}
                  >
                    {/* Most Popular badge */}
                    {isPopular && (
                      <div style={{
                        position: "absolute",
                        top: "-14px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#10B981",
                        color: "#fff",
                        fontSize: "10px",
                        fontWeight: "800",
                        letterSpacing: "0.08em",
                        padding: "4px 14px",
                        borderRadius: "999px",
                        whiteSpace: "nowrap",
                        textTransform: "uppercase",
                      }}>★ Most Popular</div>
                    )}

                    {/* Plan Name */}
                    <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#1E293B", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>{plan.name}</span>
                      <span style={{ color: "#94A3B8", fontSize: "13px", fontWeight: "400", cursor: "pointer" }} title={plan.name}>ⓘ</span>
                    </h3>

                    {/* Price */}
                    <div style={{ height: "42px", display: "flex", alignItems: "baseline", marginBottom: "4px" }}>
                      {plan.isFree ? (
                        <>
                          <span style={{ fontSize: "32px", fontWeight: "900", color: "#1E293B" }}>
                            {currency === "USD" ? "$0" : "₹0"}
                          </span>
                          <span style={{ fontSize: "13px", color: "#94A3B8", marginLeft: "4px" }}>/ 30 Days</span>
                        </>
                      ) : plan.isCustom ? (
                        <span style={{ fontSize: "28px", fontWeight: "900", color: "#1E293B" }}>Custom</span>
                      ) : (
                        <>
                          <span style={{ fontSize: "30px", fontWeight: "900", color: "#1E293B" }}>
                            {currency === "USD" ? `$${displayPrice}` : `₹${Number(displayPrice).toLocaleString("en-IN")}`}
                          </span>
                          <span style={{ fontSize: "12px", color: "#94A3B8", marginLeft: "2px" }}> / {cfg.label}</span>
                        </>
                      )}
                    </div>

                    {/* Billing note */}
                    <p style={{ fontSize: "11px", color: "#94A3B8", marginBottom: "14px", minHeight: "28px", display: "flex", alignItems: "center" }}>
                      {plan.isFree ? "1 month free trial" :
                       plan.isCustom ? "Custom billing cycle" :
                       billingCycle === "monthly" ? "Billed monthly" :
                       `${cfg.billingPrefix} (${currency === "USD" ? "$" : "₹"}${currency === "USD" ? displayPrice : Number(displayPrice).toLocaleString("en-IN")})`
                      }
                    </p>

                    {/* CTA Button */}
                    <button
                      onClick={() => !plan.isCustom && (!isExpired || !plan.isFree) && handlePlanSelect(plan)}
                      disabled={isExpired && plan.isFree && currentPlan === "free"}
                      style={{
                        width: "100%",
                        padding: "10px 0",
                        borderRadius: "10px",
                        fontWeight: "800",
                        fontSize: "13px",
                        cursor: (isExpired && plan.isFree && currentPlan === "free") ? "not-allowed" : "pointer",
                        marginBottom: "18px",
                        border: "none",
                        background: (isExpired && plan.isFree && currentPlan === "free")
                          ? "#94A3B8"
                          : (isCurrent && isExpired)
                          ? "#E11D48"
                          : isCurrent
                          ? "#1E293B"
                          : "#10B981",
                        color: "#fff",
                        transition: "background 0.2s, transform 0.1s",
                      }}
                      onMouseOver={e => {
                        if (!(isExpired && plan.isFree && currentPlan === "free")) {
                          e.currentTarget.style.background = (isCurrent && isExpired) ? "#BE123C" : isCurrent ? "#0F172A" : "#059669";
                        }
                      }}
                      onMouseOut={e => {
                        if (!(isExpired && plan.isFree && currentPlan === "free")) {
                          e.currentTarget.style.background = (isCurrent && isExpired) ? "#E11D48" : isCurrent ? "#1E293B" : "#10B981";
                        }
                      }}
                    >
                      {isCurrent
                        ? (isExpired ? `Renew ${plan.name} (Expired)` : "Current Plan")
                        : plan.cta}
                    </button>

                    {/* Features label */}
                    <p style={{ fontSize: "10px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
                      {plan.isFree ? "WHAT YOU GET" : "FEATURES"}
                    </p>

                    {/* Feature List & Toggle */}
                    {(() => {
                      const isExpanded = !!expandedPlans[plan.id];
                      const visibleFeatures = isExpanded ? plan.features : plan.features.slice(0, 8);
                      const hasMore = plan.features.length > 8;
                      const remainingCount = plan.features.length - 8;

                      return (
                        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
                          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                            {visibleFeatures.map((f, fi) => (
                              <li key={fi} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "6px", fontSize: "12px", color: f.bold ? "#1E293B" : "#475569", fontWeight: f.bold ? "700" : "400" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", minWidth: 0 }}>
                                  <svg style={{ width: "13px", height: "13px", flexShrink: 0, marginTop: "2px", color: "#10B981" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                                  </svg>
                                  <span style={{ lineHeight: "1.35" }}>{f.text}</span>
                                </div>
                                <span style={{ color: "#CBD5E1", fontSize: "12px", flexShrink: 0, cursor: "pointer", marginTop: "1px" }} title={f.text}>ⓘ</span>
                              </li>
                            ))}
                          </ul>

                          {hasMore && (
                            <div style={{ paddingTop: "14px", marginTop: "auto" }}>
                              <button
                                type="button"
                                onClick={() => toggleExpand(plan.id)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  padding: 0,
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  color: "#10B981",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  textAlign: "left",
                                }}
                              >
                                {isExpanded ? (
                                  <>
                                    <span style={{ fontSize: "10px" }}>▲</span>
                                    <span>Show Less</span>
                                  </>
                                ) : (
                                  <>
                                    <span style={{ fontSize: "10px" }}>▼</span>
                                    <span>+{remainingCount} More Features</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}

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
            <div className="grid grid-cols-6 bg-gray-50/50 p-4 border-b border-gray-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <div className="col-span-1">Feature</div>
              <div className="text-center">Free</div>
              <div className="text-center">Basic</div>
              <div className="text-center text-emerald-600">Growth</div>
              <div className="text-center">Professional</div>
              <div className="text-center">Corporate</div>
            </div>

            {[
              { name: "Shared Team Chat Inbox", free: true, basic: true, growth: true, pro: true, corp: true },
              { name: "Private Note in chat", free: true, basic: true, growth: true, pro: true, corp: true },
              { section: "Team Chat Inbox" },
              { name: "Multiple Agent chatting Inbox", free: true, basic: true, growth: true, pro: true, corp: true },
              { name: "Pin, Archive, Block, Mark unread", free: true, basic: true, growth: true, pro: true, corp: true },
              { name: "Open Close chats for support tracking", free: true, basic: true, growth: true, pro: true, corp: true },
              { name: "Advance filter of crm and Tags", free: false, basic: true, growth: true, pro: true, corp: true },
              { name: "Number Masking", free: false, basic: false, growth: false, pro: true, corp: true },
              { section: "Contacts & CRM" },
              { name: "Bulk Actions for chats & contacts", free: true, basic: true, growth: true, pro: true, corp: true },
              { name: "Labels", free: "5", basic: "20", growth: "50", pro: "100", corp: "Custom" },
              { name: "Custom Fields", free: "5", basic: "10", growth: "20", pro: "40", corp: "Custom" },
              { name: "Status", free: "5", basic: "10", growth: "20", pro: "20", corp: "Custom" },
              { name: "Quick Reply", free: "5", basic: "10", growth: "50", pro: "100", corp: "Unlimited" },
              { name: "Add contact via API", free: false, basic: false, growth: true, pro: true, corp: true },
              { name: "Contacts Export in csv", free: false, basic: false, growth: true, pro: true, corp: true },
              { name: "Manual Assigning Agents", free: true, basic: true, growth: true, pro: true, corp: true },
              { name: "Round robin assignment", free: false, basic: false, growth: true, pro: true, corp: true },
              { name: "Import CSV to add contacts", free: true, basic: true, growth: true, pro: true, corp: true },
              { name: "Agents", free: "1", basic: "5", growth: "5", pro: "10", corp: "Custom" },
              { name: "Quick Reply – Canned Response", free: false, basic: true, growth: true, pro: true, corp: true },
              { section: "Broadcast and Campaign" },
              { name: "Number of Campaign", free: "1", basic: "Unlimited", growth: "Unlimited", pro: "Unlimited", corp: "Unlimited" },
              { name: "Import csv to run campaign", free: true, basic: true, growth: true, pro: true, corp: true },
              { name: "Campaign Analytics", free: true, basic: true, growth: true, pro: true, corp: true },
              { name: "Schedule Campaign", free: false, basic: true, growth: true, pro: true, corp: true },
              { name: "Send Marketing, Utility, Auth template", free: true, basic: true, growth: true, pro: true, corp: true },
              { name: "Campaign price estimate", free: true, basic: true, growth: true, pro: true, corp: true },
              { name: "Duplicate Campaign", free: false, basic: true, growth: true, pro: true, corp: true },
              { name: "Export campaign result", free: false, basic: false, growth: true, pro: true, corp: true },
              { name: "Retarget Campaign", free: false, basic: false, growth: true, pro: true, corp: true },
              { name: "Recurring Campaign", free: false, basic: false, growth: false, pro: true, corp: true },
              { name: "Send campaign via api", free: false, basic: false, growth: true, pro: true, corp: true },
              { section: "Automation & Integration" },
              { name: "Chatbot Count", free: "1", basic: "3", growth: "5", pro: "5", corp: "Custom" },
              { name: "Chatbot Nodes", free: "3", basic: "20", growth: "50", pro: "100", corp: "Unlimited" },
              { name: "Drag & Drop Chatbot builder", free: true, basic: true, growth: true, pro: true, corp: true },
              { name: "Set welcome and away message", free: true, basic: true, growth: true, pro: true, corp: true },
              { name: "Fallback message automation", free: true, basic: true, growth: true, pro: true, corp: true },
              { name: "Ask questions and save response", free: false, basic: false, growth: true, pro: true, corp: true },
              { name: "Assign Agent", free: false, basic: false, growth: true, pro: true, corp: true },
              { name: "Marketing opt in/out", free: false, basic: false, growth: true, pro: true, corp: true },
              { name: "Rest API Calls", free: false, basic: false, growth: true, pro: true, corp: true },
              { name: "Apps Integration", free: "0", basic: "1", growth: "2", pro: "5", corp: "Custom" },
              { name: "Webhook", free: false, basic: false, growth: false, pro: true, corp: true },
              { name: "API calls/minute", free: "0", basic: "0", growth: "240", pro: "600", corp: "Custom" },
              { section: "More Features" },
              { name: "Template creation and management", free: true, basic: true, growth: true, pro: true, corp: true },
              { name: "Template Analytics", free: false, basic: true, growth: true, pro: true, corp: true },
              { name: "Message Analytics", free: true, basic: true, growth: true, pro: true, corp: true },
              { name: "Multiple WhatsApp Business API Numbers", free: false, basic: true, growth: true, pro: true, corp: true },
              { name: "Backup", free: "1 month", basic: "6 months", growth: "12 months", pro: "Subscription period", corp: "Custom" },
              { section: "Support" },
              { name: "Email", free: false, basic: true, growth: true, pro: true, corp: true },
              { name: "Help Doc & Video", free: true, basic: true, growth: true, pro: true, corp: true },
              { name: "WhatsApp", free: false, basic: false, growth: true, pro: true, corp: true },
              { name: "Dedicated Account Manager", free: false, basic: false, growth: false, pro: false, corp: true },
            ].map((row, idx) => {
              if (row.section) {
                return (
                  <div key={idx} className="grid grid-cols-6 bg-slate-50 px-4 py-2.5 border-b border-gray-100">
                    <div className="col-span-6 text-xs font-bold text-slate-600 uppercase tracking-wider">{row.section}</div>
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
                <div key={idx} className="grid grid-cols-6 px-4 py-3.5 border-b border-gray-50 items-center hover:bg-slate-50/30 transition-colors">
                  <div className="text-sm text-slate-600 pr-4">{row.name}</div>
                  {renderCell(row.free)}
                  {renderCell(row.basic)}
                  {renderCell(row.growth, true)}
                  {renderCell(row.pro)}
                  {renderCell(row.corp)}
                </div>
              );
            })}
          </div>
        </div>


        {/* --- WHATSAPP CONVERSATION CHARGES --- */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl bg-emerald-50 rounded-2xl overflow-hidden border border-emerald-100 shadow-sm">
            <div className="px-8 py-5 text-center">
              <h3 className="text-base font-bold text-slate-900">
                WhatsApp Conversation Charges{" "}
                <span className="text-slate-400 font-normal text-sm">(Prices in India)</span>
              </h3>
            </div>
            <div className="bg-white mx-4 mb-4 rounded-xl overflow-hidden border border-gray-100">
              <div className="grid grid-cols-6 border-b border-gray-100 px-5 py-3">
                <div className="text-sm font-semibold text-slate-700">Type</div>
                <div className="text-sm font-semibold text-slate-700 text-center">Free</div>
                <div className="text-sm font-semibold text-slate-700 text-center">Basic</div>
                <div className="text-sm font-semibold text-emerald-600 text-center">Growth</div>
                <div className="text-sm font-semibold text-slate-700 text-center">Professional</div>
                <div className="text-sm font-semibold text-slate-700 text-center">Corporate</div>
              </div>
              <div className="grid grid-cols-6 px-5 py-4 border-b border-gray-50 items-center">
                <div className="text-sm text-slate-600">Marketing</div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`text-sm text-slate-700 text-center ${i === 2 ? "bg-emerald-50/60 py-1 rounded" : ""}`}>₹0.95</div>
                ))}
              </div>
              <div className="grid grid-cols-6 px-5 py-4 border-b border-gray-50 items-center">
                <div className="text-sm text-slate-600">Utility &amp; Authentication</div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`text-sm text-slate-700 text-center ${i === 2 ? "bg-emerald-50/60 py-1 rounded" : ""}`}>₹0.13</div>
                ))}
              </div>
              <div className="grid grid-cols-6 px-5 py-4 items-center">
                <div className="text-sm text-slate-600">Service</div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`text-sm font-bold text-emerald-600 text-center ${i === 2 ? "bg-emerald-50/60 py-1 rounded" : ""}`}>FREE</div>
                ))}
              </div>
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