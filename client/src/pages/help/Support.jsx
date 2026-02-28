import React, { useState } from "react";
import {
  TicketIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  PaperClipIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  CodeBracketIcon,
  CreditCardIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { showToast } from "../../utils/showToast";

const Support = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    priority: "medium",
    description: "",
  });
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Support categories with icons
  const supportCategories = [
    { value: "technical", label: "Technical Issue", icon: CodeBracketIcon, color: "blue" },
    { value: "billing", label: "Billing & Payment", icon: CreditCardIcon, color: "green" },
    { value: "account", label: "Account Help", icon: ShieldCheckIcon, color: "purple" },
    { value: "feature", label: "Feature Request", icon: QuestionMarkCircleIcon, color: "orange" },
    { value: "general", label: "General Inquiry", icon: ChatBubbleLeftRightIcon, color: "slate" },
    { value: "bug", label: "Bug Report", icon: DocumentTextIcon, color: "red" },
  ];

  // Priority levels
  const priorityLevels = [
    { value: "low", label: "Low", color: "bg-slate-500" },
    { value: "medium", label: "Medium", color: "bg-yellow-500" },
    { value: "high", label: "High", color: "bg-orange-500" },
    { value: "urgent", label: "Urgent", color: "bg-red-500" },
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      // Limit file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        showToast.error("File size exceeds 5MB limit");
        return false;
      }
      return true;
    });

    if (attachments.length + validFiles.length > 3) {
      showToast.error("Maximum 3 files allowed");
      return;
    }

    setAttachments([...attachments, ...validFiles]);
  };

  // Remove attachment
  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create FormData for file upload
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key]);
      });
      attachments.forEach((file) => {
        submitData.append("attachments", file);
      });

      // TODO: Replace with actual API call
      // await submitSupportTicket(submitData);

      showToast.success("Support ticket submitted successfully!");

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "",
        priority: "medium",
        description: "",
      });
      setAttachments([]);
      setErrors({});
    } catch (error) {
      showToast.error("Failed to submit ticket. Please try again.");
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#10B981] to-[#059669] rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
            <TicketIcon className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Contact Support</h1>
            <p className="text-white/90 text-lg">
              Need help? Our support team is here to assist you 24/7. Submit a
              ticket and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Support Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Support Topics */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-[#10B981]" />
              Select Support Category
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {supportCategories.map((category) => {
                const Icon = category.icon;
                const isSelected = formData.category === category.value;
                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, category: category.value })
                    }
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? "border-[#10B981] bg-emerald-50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 mb-2 ${
                        isSelected ? "text-[#10B981]" : "text-slate-500"
                      }`}
                    />
                    <p
                      className={`font-semibold text-sm ${
                        isSelected ? "text-[#10B981]" : "text-slate-700"
                      }`}
                    >
                      {category.label}
                    </p>
                  </button>
                );
              })}
            </div>
            {errors.category && (
              <p className="text-red-500 text-sm mt-2">{errors.category}</p>
            )}
          </div>

          {/* Support Form Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5 text-[#10B981]" />
              Ticket Details
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name and Email Row */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
                      errors.name
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-200 focus:border-[#10B981]"
                    }`}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
                      errors.email
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-200 focus:border-[#10B981]"
                    }`}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
                    errors.subject
                      ? "border-red-500 focus:border-red-500"
                      : "border-slate-200 focus:border-[#10B981]"
                  }`}
                  placeholder="Brief description of your issue"
                />
                {errors.subject && (
                  <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Priority Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {priorityLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, priority: level.value })
                      }
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        formData.priority === level.value
                          ? `${level.color} text-white shadow-md`
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="6"
                  className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors resize-none ${
                    errors.description
                      ? "border-red-500 focus:border-red-500"
                      : "border-slate-200 focus:border-[#10B981]"
                  }`}
                  placeholder="Please describe your issue in detail... (minimum 20 characters)"
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description && (
                    <p className="text-red-500 text-xs">{errors.description}</p>
                  )}
                  <p className="text-xs text-slate-500 ml-auto">
                    {formData.description.length} characters
                  </p>
                </div>
              </div>

              {/* File Attachments */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Attachments (Optional)
                </label>
                <div className="space-y-3">
                  <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-[#10B981] transition-colors bg-slate-50 hover:bg-emerald-50">
                    <PaperClipIcon className="w-5 h-5 text-slate-500 mr-2" />
                    <span className="text-sm text-slate-600">
                      Click to upload files (Max 3 files, 5MB each)
                    </span>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    />
                  </label>

                  {/* Attached Files List */}
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <PaperClipIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                            <span className="text-sm text-slate-700 truncate">
                              {file.name}
                            </span>
                            <span className="text-xs text-slate-500 flex-shrink-0">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="ml-2 p-1 hover:bg-red-100 rounded-full transition-colors flex-shrink-0"
                          >
                            <XMarkIcon className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#10B981] text-white px-6 py-3.5 rounded-lg font-bold hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    Submit Support Ticket
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Contact Info & Help */}
        <div className="space-y-6">
          {/* Contact Information Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Contact Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-emerald-50 p-2 rounded-lg">
                  <EnvelopeIcon className="w-5 h-5 text-[#10B981]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Email</p>
                  <a
                    href="mailto:support@messbee.com"
                    className="text-sm text-[#10B981] hover:underline"
                  >
                    support@messbee.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-emerald-50 p-2 rounded-lg">
                  <PhoneIcon className="w-5 h-5 text-[#10B981]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Phone</p>
                  <a
                    href="tel:+918765432109"
                    className="text-sm text-[#10B981] hover:underline"
                  >
                    +91 876 543 2109
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-emerald-50 p-2 rounded-lg">
                  <ClockIcon className="w-5 h-5 text-[#10B981]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Business Hours
                  </p>
                  <p className="text-sm text-slate-600">
                    Mon-Fri: 9:00 AM - 6:00 PM IST
                  </p>
                  <p className="text-sm text-slate-600">24/7 Email Support</p>
                </div>
              </div>
            </div>
          </div>

          {/* Expected Response Time */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Response Time
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Low Priority</span>
                <span className="text-sm font-semibold text-slate-800">
                  48 hours
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Medium Priority</span>
                <span className="text-sm font-semibold text-slate-800">
                  24 hours
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">High Priority</span>
                <span className="text-sm font-semibold text-slate-800">
                  8 hours
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Urgent</span>
                <span className="text-sm font-semibold text-[#10B981]">
                  2 hours
                </span>
              </div>
            </div>
          </div>

          {/* Help Tips Card */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
              <QuestionMarkCircleIcon className="w-5 h-5" />
              Quick Tips
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Include screenshots or error messages if applicable</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Provide detailed steps to reproduce the issue</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Check our FAQ section first for quick answers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Use urgent priority only for critical issues</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;