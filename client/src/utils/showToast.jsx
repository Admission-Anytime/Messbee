import React from "react";
import { toast } from "react-toastify";

const ToastLayout = ({ title, message, type }) => {
  const renderIcon = () => {
    switch (type) {
      case "success":
        return (
          // ✅ Light Mint Circle + Mint Checkmark
          <div className="w-[42px] h-[42px] rounded-full bg-[#d1fae5] flex items-center justify-center shrink-0">
            <svg className="w-[22px] h-[22px] text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case "error":
        return (
          // Light Red Circle + Red Cross
          <div className="w-[42px] h-[42px] rounded-full bg-[#fee2e2] flex items-center justify-center shrink-0">
            <svg className="w-[22px] h-[22px] text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case "warning":
        return (
          // Light Amber Circle + Amber Exclamation
          <div className="w-[42px] h-[42px] rounded-full bg-[#fef3c7] flex items-center justify-center shrink-0">
            <svg className="w-[22px] h-[22px] text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case "info":
      default:
        return (
          // Light Blue Circle + Blue Info
          <div className="w-[42px] h-[42px] rounded-full bg-[#dbeafe] flex items-center justify-center shrink-0">
            <svg className="w-[22px] h-[22px] text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    // Gap-4 gives it that spacious, premium feel
    <div className={`flex w-full ${message ? 'items-start' : 'items-center'} gap-4`}>
      {renderIcon()}
      
      {/* pt-[2px] perfectly aligns the title with the center of the icon */}
      <div className={`flex flex-col justify-center ${message ? 'pt-[3px]' : ''}`}>
        <span className="text-slate-800 font-bold text-[15px] leading-tight">
          {title}
        </span>
        
        {message && (
          <span className="text-[14px] font-medium text-slate-500 leading-[1.5] mt-1 pr-4">
            {message}
          </span>
        )}
      </div>
    </div>
  );
};

// Global Toast Functions
export const showToast = {
  success: (title, message) => toast(<ToastLayout title={title} message={message} type="success" />, { icon: false }),
  error: (title, message) => toast(<ToastLayout title={title} message={message} type="error" />, { icon: false }),
  info: (title, message) => toast(<ToastLayout title={title} message={message} type="info" />, { icon: false }),
  warning: (title, message) => toast(<ToastLayout title={title} message={message} type="warning" />, { icon: false })
};