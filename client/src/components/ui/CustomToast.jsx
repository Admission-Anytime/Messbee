import React from "react";
import { CheckIcon, XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";

const CustomToast = ({ title, message, type, closeToast }) => {
  const isSuccess = type === "success";

  return (
    <div className="w-full bg-white rounded-xl shadow-lg border border-gray-100 p-4 flex items-start gap-4 pointer-events-auto ring-1 ring-black/5 font-['Urbanist'] relative">
      
      {/* --- ICON SECTION --- */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isSuccess ? 'bg-emerald-100' : 'bg-red-100'}`}>
        {isSuccess ? (
          <CheckIcon className="w-6 h-6 text-emerald-600" />
        ) : (
          <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
        )}
      </div>

      {/* --- TEXT CONTENT --- */}
      <div className="flex-1 pt-0.5">
        <h4 className="text-sm font-bold text-gray-900">
          {title || (isSuccess ? "Success" : "Error Occurred")}
        </h4>
        <p className="mt-1 text-sm text-gray-500 leading-relaxed">
          {message}
        </p>
      </div>

      {/* --- CLOSE BUTTON --- */}
      <button 
        onClick={closeToast} 
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-50"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>

    </div>
  );
};

export default CustomToast;