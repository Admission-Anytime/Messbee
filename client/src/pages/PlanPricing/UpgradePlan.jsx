import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { CheckIcon, MinusIcon } from "@heroicons/react/24/solid";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

// ✅ 1. Import Toastify and CSS
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UpgradePlan = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState("monthly"); // 'monthly' | 'yearly'
  
  // --- SLIDER STATE ---
  const [marketingCount, setMarketingCount] = useState(1000);
  const [utilityCount, setUtilityCount] = useState(1000);

  const marketingRate = 0.008; 
  const utilityRate = 0.004;   
  const estimatedTotal = (marketingCount * marketingRate) + (utilityCount * utilityRate);

  // --- BUTTON HANDLER ---
  const handlePlanSelect = (planName) => {
    if (planName === "Enterprise") {
       window.location.href = "mailto:sales@messbee.com?subject=Enterprise Plan Inquiry";
    } else {
       // ✅ 2. Use Toast instead of Alert
       toast.success(`Selected ${planName} plan! Redirecting...`, {
         position: "top-right",
         autoClose: 2000,
         hideProgressBar: false,
         closeOnClick: true,
         pauseOnHover: true,
         draggable: true,
       });

       // Small delay so user sees the toast before moving
       setTimeout(() => {
          navigate("/admin/plan/methods"); 
       }, 1000);
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
        "Broadcast Scheduling"
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
        "Priority Support"
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
        "SLA & Contracts"
      ],
      cta: "Contact Sales",
      popular: false,
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8 font-['Urbanist'] pb-20 relative">
      
      {/* ✅ 3. Add the Toast Container here */}
      <ToastContainer />

      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* --- HEADER & TOGGLE --- */}
        <div className="text-center space-y-6">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900">
            Scale your business with WhatsApp
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Choose the plan that grows with your business. From early-stage startups to global enterprises.
          </p>

          <div className="flex items-center justify-center gap-4 mt-6">
            <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
            <button 
              onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
              className="w-14 h-7 bg-emerald-500 rounded-full p-1 transition-colors relative"
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'}`}></div>
            </button>
            <span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-400'}`}>
              Yearly <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full ml-1">SAVE 20%</span>
            </span>
          </div>
        </div>

        {/* --- PRICING CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2 md:px-10">
          {plans.map((plan, idx) => (
            <div key={idx} className={`relative bg-white rounded-3xl p-8 border flex flex-col transition-all hover:shadow-xl
              ${plan.popular 
                ? 'border-emerald-500 shadow-emerald-100 ring-1 ring-emerald-500 scale-105 z-10' 
                : 'border-gray-100 shadow-sm'}`
            }>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                  Recommended
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-400 uppercase tracking-wide">{plan.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
              </div>

              <div className="mb-8">
                {plan.price === "Custom" ? (
                   <span className="text-4xl font-extrabold text-slate-900">Custom</span>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold text-slate-900">${billingCycle === 'monthly' ? plan.price : plan.price * 10}</span>
                    <span className="text-slate-400 font-medium">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-8 flex-1">
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <CheckIcon className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">{feat}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handlePlanSelect(plan.name)}
                className={`w-full py-3 rounded-xl font-bold transition-all
                ${plan.popular 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200' 
                  : 'bg-white border-2 border-slate-100 text-slate-900 hover:border-slate-300'}`
              }>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* --- COST ESTIMATOR SLIDER --- */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center">
           <div className="flex-1 w-full space-y-8">
              <div>
                 <h3 className="text-xl font-bold text-slate-900 mb-2">Estimate your Monthly Spend</h3>
                 <p className="text-sm text-slate-500">Move the sliders to calculate your expected monthly messaging costs based on Meta's pricing.</p>
              </div>

              {/* Slider 1 */}
              <div>
                 <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Marketing Messages</label>
                    <span className="text-sm font-bold text-emerald-600">{marketingCount.toLocaleString()}</span>
                 </div>
                 <input 
                   type="range" min="0" max="100000" step="100" 
                   value={marketingCount} 
                   onChange={(e) => setMarketingCount(Number(e.target.value))}
                   className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                 />
              </div>

              {/* Slider 2 */}
              <div>
                 <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Utility Messages</label>
                    <span className="text-sm font-bold text-emerald-600">{utilityCount.toLocaleString()}</span>
                 </div>
                 <input 
                   type="range" min="0" max="50000" step="100" 
                   value={utilityCount} 
                   onChange={(e) => setUtilityCount(Number(e.target.value))}
                   className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                 />
              </div>
           </div>

           <div className="w-full md:w-auto bg-slate-50 rounded-2xl p-8 min-w-[300px] text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Total</span>
              <div className="text-4xl font-extrabold text-slate-900 my-2">${estimatedTotal.toFixed(2)}</div>
              <p className="text-xs text-slate-400">/month plus platform fee</p>
              <div className="mt-4 text-xs bg-white border border-gray-200 rounded-lg p-2 text-slate-500">
                 Includes 1,000 monthly free service conversations per account.
              </div>
           </div>
        </div>

        {/* --- COMPARISON TABLE --- */}
        <div>
           <h3 className="text-2xl font-bold text-slate-900 text-center mb-10">Detailed Feature Comparison</h3>
           <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="grid grid-cols-4 bg-gray-50/50 p-4 border-b border-gray-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                 <div className="col-span-1">Feature</div>
                 <div className="text-center">Basic</div>
                 <div className="text-center text-emerald-600">Professional</div>
                 <div className="text-center">Enterprise</div>
              </div>
              
              {[
                 { name: "Shared Inbox", basic: true, pro: true, ent: true },
                 { name: "Message Broadcasting", basic: "Up to 500/day", pro: "Unlimited", ent: "Unlimited" },
                 { name: "Chatbot Builder", basic: "Basic Only", pro: true, ent: true },
                 { name: "API Access", basic: false, pro: true, ent: true },
                 { name: "Webhooks", basic: false, pro: "Coming Soon", ent: true },
                 { name: "Response Time", basic: "48 Hours", pro: "8 Hours", ent: "1 Hour & Dedicated" },
              ].map((row, idx) => (
                 <div key={idx} className="grid grid-cols-4 p-4 border-b border-gray-50 items-center hover:bg-slate-50/30 transition-colors">
                    <div className="text-sm font-bold text-slate-700">{row.name}</div>
                    <div className="text-center text-sm text-slate-600">
                       {row.basic === true ? <CheckIcon className="w-5 h-5 text-emerald-500 mx-auto"/> : row.basic === false ? <MinusIcon className="w-5 h-5 text-gray-300 mx-auto"/> : row.basic}
                    </div>
                    <div className="text-center text-sm text-slate-600 font-medium bg-emerald-50/50 py-1 rounded">
                       {row.pro === true ? <CheckIcon className="w-5 h-5 text-emerald-500 mx-auto"/> : row.pro === false ? <MinusIcon className="w-5 h-5 text-gray-300 mx-auto"/> : row.pro}
                    </div>
                    <div className="text-center text-sm text-slate-600">
                       {row.ent === true ? <CheckIcon className="w-5 h-5 text-emerald-500 mx-auto"/> : row.ent === false ? <MinusIcon className="w-5 h-5 text-gray-300 mx-auto"/> : row.ent}
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* --- FAQ & SECURITY --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10 border-t border-gray-200">
           <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900">Frequently Asked Questions</h3>
              <div className="space-y-4">
                 <div>
                    <h4 className="text-sm font-bold text-slate-800">Can I change plans later?</h4>
                    <p className="text-sm text-slate-500 mt-1">Yes, you can upgrade or downgrade your plan at any time.</p>
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-slate-800">Are Meta fees included?</h4>
                    <p className="text-sm text-slate-500 mt-1">No, Meta charges for business-initiated and user-initiated conversations separately.</p>
                 </div>
              </div>
           </div>

           <div className="bg-slate-50 rounded-2xl p-8 flex flex-col justify-center items-center text-center">
               <ShieldCheckIcon className="w-12 h-12 text-slate-300 mb-4" />
               <h3 className="font-bold text-slate-900 mb-2">Secure Payment Guaranteed</h3>
               <p className="text-sm text-slate-500 max-w-xs">We use industry-standard encryption. No credit card required for trial.</p>
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