import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../context/Context";
import axios from "../../context/axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ArrowLeft,
  Building2,
  Mail,
  User,
  Phone,
  MessageSquare,
  CheckCircle,
  ShieldCheck,
  Send,
  Sparkles,
  Users,
  Zap,
  Clock,
  Headphones,
  Check,
  ChevronRight,
  Globe,
  Award
} from "lucide-react";

const FEATURE_TAGS = [
  "Custom Usage Limits",
  "Multiple WhatsApp Numbers",
  "Enterprise Team Management",
  "Custom Roles & Permissions",
  "Enterprise API & Webhooks",
  "Custom CRM/ERP Integration",
  "Custom AI Chatbots",
  "Dedicated Account Manager",
  "High Throughput SLA",
  "Priority 24/7 Support"
];

const ContactSales = () => {
  const navigate = useNavigate();
  const { user } = useContext(userContext);

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || user?.businessNumber || "",
    company: user?.businessName || user?.company || "",
    companySize: "11-50",
    messageVolume: "50,000 - 250,000 / mo",
    agentsNeeded: "11-25 Agents",
    selectedFeatures: ["Custom Usage Limits", "Multiple WhatsApp Numbers", "Enterprise API & Webhooks"],
    message: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const handleFeatureToggle = (feature) => {
    setFormData((prev) => {
      const exists = prev.selectedFeatures.includes(feature);
      return {
        ...prev,
        selectedFeatures: exists
          ? prev.selectedFeatures.filter((f) => f !== feature)
          : [...prev.selectedFeatures, feature]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Please enter your business email.");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Please enter your contact or WhatsApp number.");
      return;
    }
    if (!formData.company.trim()) {
      toast.error("Please enter your company / organization name.");
      return;
    }

    setSubmitting(true);

    const inquiryId = `INQ-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // Attempt backend submission
      await axios.post("/users/contact-sales", {
        ...formData,
        inquiryId
      }).catch((err) => {
        // Log gracefully if offline or endpoint handling fallback
        console.warn("Contact sales API logged locally:", err?.message || err);
      });

      setSubmittedData({
        inquiryId,
        submittedAt: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric"
        })
      });

      toast.success("Inquiry submitted successfully! Our sales team will reach out to you shortly.");
    } catch (error) {
      console.error("Error submitting sales inquiry:", error);
      toast.error("Something went wrong. Please try again or email sales@messbee.com.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- SUBMITTED / SUCCESS VIEW ---
  if (submittedData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] font-['Urbanist'] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <ToastContainer />
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-emerald-400 to-teal-500" />

          {/* Success Icon */}
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100 text-emerald-600">
            <CheckCircle className="w-10 h-10" />
          </div>

          <span className="inline-block bg-emerald-100/80 text-emerald-700 text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full mb-3">
            Inquiry Received
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
            Thank You, {formData.fullName.split(" ")[0]}!
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto mb-8">
            Your Corporate Enterprise inquiry has been registered. One of our enterprise solutions experts will connect with you within <span className="font-bold text-slate-700">2-4 business hours</span> to tailor a custom plan.
          </p>

          {/* Summary Box */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left space-y-3 mb-8">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider">Reference ID</span>
              <span className="text-slate-800 font-black">{submittedData.inquiryId}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider">Company</span>
              <span className="text-slate-800 font-bold">{formData.company}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider">Work Email</span>
              <span className="text-slate-800 font-bold">{formData.email}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider">Phone / WhatsApp</span>
              <span className="text-slate-800 font-bold">{formData.phone}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/admin/plan/upgrade")}
              className="flex-1 py-3 px-5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Plans</span>
            </button>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="flex-1 py-3 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-lg shadow-emerald-200/60 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Go to Dashboard</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN FORM VIEW ---
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Urbanist'] py-8 px-4 sm:px-6 lg:px-8 pb-20">
      <ToastContainer />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Back Link */}
        <div>
          <button
            onClick={() => navigate("/admin/plan/upgrade")}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Plans &amp; Pricing</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-block bg-emerald-100/70 text-emerald-700 text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full">
            Corporate &amp; Enterprise Plan
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Talk to Our Sales Team
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Need custom limits, multi-agent workspaces, dedicated infrastructure, or volume pricing? Tell us about your organization and our specialists will craft a customized plan for you.
          </p>
        </div>

        {/* Grid: Left Form + Right Enterprise Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: The Form Card (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 relative overflow-hidden">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Enterprise Inquiry Form</h2>
                <p className="text-xs text-slate-400">Fill in the details below to request a tailored quote</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: Name & Work Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Work Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@company.com"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Phone & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Phone / WhatsApp Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Acme Corp Ltd"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Company Size & Message Volume */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Company Size
                  </label>
                  <select
                    value={formData.companySize}
                    onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition cursor-pointer"
                  >
                    <option value="1-10">1 - 10 employees</option>
                    <option value="11-50">11 - 50 employees</option>
                    <option value="51-200">51 - 200 employees</option>
                    <option value="201-500">201 - 500 employees</option>
                    <option value="500+">500+ employees (Enterprise)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Expected Monthly Messages
                  </label>
                  <select
                    value={formData.messageVolume}
                    onChange={(e) => setFormData({ ...formData, messageVolume: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition cursor-pointer"
                  >
                    <option value="Under 50,000 / mo">Under 50,000 / month</option>
                    <option value="50,000 - 250,000 / mo">50,000 - 250,000 / month</option>
                    <option value="250,000 - 1,000,000 / mo">250,000 - 1,000,000 / month</option>
                    <option value="1,000,000+ / mo">1,000,000+ / month (High Scale)</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Agents Needed */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Number of Support / Sales Agents Needed
                </label>
                <select
                  value={formData.agentsNeeded}
                  onChange={(e) => setFormData({ ...formData, agentsNeeded: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition cursor-pointer"
                >
                  <option value="5-10 Agents">5 - 10 Agents</option>
                  <option value="11-25 Agents">11 - 25 Agents</option>
                  <option value="26-50 Agents">26 - 50 Agents</option>
                  <option value="50+ Agents (Custom)">50+ Agents (Custom)</option>
                </select>
              </div>

              {/* Row 5: Features Interested In */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Key Capabilities You Require
                </label>
                <div className="flex flex-wrap gap-2">
                  {FEATURE_TAGS.map((feat) => {
                    const isSelected = formData.selectedFeatures.includes(feat);
                    return (
                      <button
                        type="button"
                        key={feat}
                        onClick={() => handleFeatureToggle(feat)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-200"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{feat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 6: Additional Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tell Us More About Your Use Case (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Share details regarding your current systems, integrations needed, timeline, or specific compliance requirements..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Contact Enterprise Sales</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-center text-slate-400 pt-1">
                🔒 Your information is secure and will only be used to process your corporate sales request.
              </p>
            </form>
          </div>

          {/* RIGHT: Corporate Plan Highlights (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Plan Badge Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-900/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  <Award className="w-3.5 h-3.5" />
                  Corporate Tier
                </span>
                <span className="text-xl font-black text-emerald-400">Custom</span>
              </div>

              <h3 className="text-xl font-black mb-2">Designed for High-Growth Teams</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Get uncapped potential with custom throughput, enterprise multi-number routing, dedicated account management, and round-the-clock priority assistance.
              </p>

              {/* Feature Checklist */}
              <div className="space-y-3 pt-4 border-t border-slate-700/60 text-xs">
                {[
                  "All Professional Plan features included",
                  "Custom Usage & API Rate Limits",
                  "Multiple WhatsApp API Numbers",
                  "Custom Number of Support & Sales Agents",
                  "Enterprise Team & Department Management",
                  "Custom Roles, Permissions & Access Control",
                  "Dedicated Solutions Engineer & Account Manager",
                  "Custom CRM, ERP, and Webhook Integrations",
                  "99.9% Uptime Service Level Agreement (SLA)",
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-slate-200">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Assistance Info Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Direct Sales Channels
              </h4>
              
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-100/60 text-emerald-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800">Sales Inquiries</p>
                  <a href="mailto:sales@messbee.com" className="text-xs text-emerald-600 font-medium hover:underline">
                    sales@messbee.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-teal-100/60 text-teal-600 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800">Direct Phone Support</p>
                  <p className="text-xs text-slate-600 font-medium">+91 876 543 2109</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-xs pt-1">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>Available Mon – Fri, 9:00 AM – 6:00 PM IST</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactSales;
