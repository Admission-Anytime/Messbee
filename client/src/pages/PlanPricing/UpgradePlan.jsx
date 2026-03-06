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
} from "lucide-react";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ═══════════════════════════════════════════
   CHECKOUT / COMPLETE UPGRADE VIEW
   ═══════════════════════════════════════════ */
const CheckoutView = ({ plan, billingCycle, onBack }) => {
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState("visa-4242");

  // Price calculation
  const isYearly = billingCycle === "yearly";
  const basePrice = typeof plan.price === "number" ? plan.price : 499;
  const planAmount = isYearly ? basePrice * 10 : basePrice;
  const gstRate = 0.18;
  const gstAmount = planAmount * gstRate;
  const totalDue = planAmount + gstAmount;

  const paymentMethods = [
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
    {
      id: "upi",
      type: "UPI",
      label: "UPI (Unified Payments Interface)",
      sublabel: "Google Pay, PhonePe, and more",
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      id: "netbanking",
      type: "NET",
      label: "Net Banking",
      sublabel: "All major Indian banks supported",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      icon: <Building2 className="w-4 h-4" />,
    },
  ];

  const handlePay = () => {
    toast.success(`Payment of $${totalDue.toFixed(2)} initiated!`, {
      position: "top-right",
      autoClose: 2000,
    });
  };

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
                      {isYearly ? "Annual" : "Monthly"} Billing Cycle
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
                    <span className="text-sm font-semibold text-slate-700">
                      ${planAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">GST (18%)</span>
                    <span className="text-sm font-semibold text-slate-700">
                      ${gstAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-base font-bold text-slate-800">
                      Total Due
                    </span>
                    <span className="text-xl font-extrabold text-emerald-600">
                      ${totalDue.toFixed(2)}
                    </span>
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

            {/* ── RIGHT: Payment Method ── */}
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-1">
                Select Payment Method
              </h2>
              <p className="text-sm text-slate-400 mb-5">
                Choose from your saved cards or other options
              </p>

              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left ${selectedPayment === method.id
                      ? "border-emerald-400 bg-emerald-50/30 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg ${method.iconBg} flex items-center justify-center flex-shrink-0`}
                    >
                      {method.icon ? (
                        method.icon
                      ) : (
                        <span
                          className={`text-[10px] font-extrabold ${method.iconColor}`}
                        >
                          {method.type}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700">
                        {method.label}
                      </p>
                      <p className="text-xs text-slate-400">{method.sublabel}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedPayment === method.id
                        ? "border-emerald-500"
                        : "border-slate-300"
                        }`}
                    >
                      {selectedPayment === method.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* add new method */}
              <button
                onClick={() => navigate("/admin/plan/methods")}
                className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 text-sm font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all mt-3 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Add New Payment Method
              </button>

              {/* pay button */}
              <button
                onClick={handlePay}
                className="w-full mt-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base transition-all shadow-lg shadow-emerald-200 cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Pay & Upgrade Now - ${totalDue.toFixed(2)}
              </button>

              {/* secured by logos */}
              <div className="mt-5 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Secured & Processed By
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
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState(null); // null = plan selection, object = checkout

  // --- SLIDER STATE ---
  const [marketingCount, setMarketingCount] = useState(1000);
  const [utilityCount, setUtilityCount] = useState(1000);

  const marketingRate = 0.008;
  const utilityRate = 0.004;
  const estimatedTotal = marketingCount * marketingRate + utilityCount * utilityRate;

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
      name: "Basic",
      price: 29,
      description: "Perfect for small teams getting started.",
      features: [
        "1,000 Free Conversations",
        "2 Team Members",
        "Basic Automation",
        "Broadcast Scheduling",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Professional",
      price: 79,
      description: "Advanced tools for growing operations.",
      features: [
        "5,000 Free Conversations",
        "10 Team Members",
        "Advanced Flows & Chatbots",
        "CRM Integrations",
        "Priority Support",
      ],
      cta: "Upgrade to Pro",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Custom solutions for large scale.",
      features: [
        "Unlimited Conversations",
        "Unlimited Team Members",
        "Dedicated Account Manager",
        "Custom API Setup",
        "SLA & Contracts",
      ],
      cta: "Contact Sales",
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
        {/* --- HEADER & TOGGLE --- */}
        <div className="text-center space-y-6">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900">
            Scale your business with WhatsApp
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Choose the plan that grows with your business. From early-stage
            startups to global enterprises.
          </p>

          <div className="flex items-center justify-center gap-4 mt-6">
            <span
              className={`text-sm font-bold ${billingCycle === "monthly" ? "text-slate-900" : "text-slate-400"
                }`}
            >
              Monthly
            </span>
            <button
              onClick={() =>
                setBillingCycle((prev) =>
                  prev === "monthly" ? "yearly" : "monthly"
                )
              }
              className="w-14 h-7 bg-emerald-500 rounded-full p-1 transition-colors relative cursor-pointer"
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${billingCycle === "yearly"
                  ? "translate-x-7"
                  : "translate-x-0"
                  }`}
              ></div>
            </button>
            <span
              className={`text-sm font-bold ${billingCycle === "yearly" ? "text-slate-900" : "text-slate-400"
                }`}
            >
              Yearly{" "}
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full ml-1">
                SAVE 20%
              </span>
            </span>
          </div>
        </div>

        {/* --- PRICING CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2 md:px-10">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative bg-white rounded-3xl p-8 border flex flex-col transition-all hover:shadow-xl
              ${plan.popular
                  ? "border-emerald-500 shadow-emerald-100 ring-1 ring-emerald-500 scale-105 z-10"
                  : "border-gray-100 shadow-sm"
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                  Recommended
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-400 uppercase tracking-wide">
                  {plan.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {plan.description}
                </p>
              </div>

              <div className="mb-8">
                {plan.price === "Custom" ? (
                  <span className="text-4xl font-extrabold text-slate-900">
                    Custom
                  </span>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold text-slate-900">
                      $
                      {billingCycle === "monthly"
                        ? plan.price
                        : plan.price * 10}
                    </span>
                    <span className="text-slate-400 font-medium">
                      /{billingCycle === "monthly" ? "month" : "year"}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-8 flex-1">
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <CheckIcon className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">
                      {feat}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handlePlanSelect(plan)}
                className={`w-full py-3 rounded-xl font-bold transition-all cursor-pointer
                ${plan.popular
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200"
                    : "bg-white border-2 border-slate-100 text-slate-900 hover:border-slate-300"
                  }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

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
            <div className="grid grid-cols-4 bg-gray-50/50 p-4 border-b border-gray-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <div className="col-span-1">Feature</div>
              <div className="text-center">Basic</div>
              <div className="text-center text-emerald-600">Professional</div>
              <div className="text-center">Enterprise</div>
            </div>

            {[
              {
                name: "Shared Inbox",
                basic: true,
                pro: true,
                ent: true,
              },
              {
                name: "Message Broadcasting",
                basic: "Up to 500/day",
                pro: "Unlimited",
                ent: "Unlimited",
              },
              {
                name: "Chatbot Builder",
                basic: "Basic Only",
                pro: true,
                ent: true,
              },
              {
                name: "API Access",
                basic: false,
                pro: true,
                ent: true,
              },
              {
                name: "Webhooks",
                basic: false,
                pro: "Coming Soon",
                ent: true,
              },
              {
                name: "Response Time",
                basic: "48 Hours",
                pro: "8 Hours",
                ent: "1 Hour & Dedicated",
              },
            ].map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-4 p-4 border-b border-gray-50 items-center hover:bg-slate-50/30 transition-colors"
              >
                <div className="text-sm font-bold text-slate-700">
                  {row.name}
                </div>
                <div className="text-center text-sm text-slate-600">
                  {row.basic === true ? (
                    <CheckIcon className="w-5 h-5 text-emerald-500 mx-auto" />
                  ) : row.basic === false ? (
                    <MinusIcon className="w-5 h-5 text-gray-300 mx-auto" />
                  ) : (
                    row.basic
                  )}
                </div>
                <div className="text-center text-sm text-slate-600 font-medium bg-emerald-50/50 py-1 rounded">
                  {row.pro === true ? (
                    <CheckIcon className="w-5 h-5 text-emerald-500 mx-auto" />
                  ) : row.pro === false ? (
                    <MinusIcon className="w-5 h-5 text-gray-300 mx-auto" />
                  ) : (
                    row.pro
                  )}
                </div>
                <div className="text-center text-sm text-slate-600">
                  {row.ent === true ? (
                    <CheckIcon className="w-5 h-5 text-emerald-500 mx-auto" />
                  ) : row.ent === false ? (
                    <MinusIcon className="w-5 h-5 text-gray-300 mx-auto" />
                  ) : (
                    row.ent
                  )}
                </div>
              </div>
            ))}
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