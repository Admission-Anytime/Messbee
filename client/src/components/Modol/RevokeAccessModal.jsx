import React, { useState, useEffect } from "react";

export default function RevokeAccessModal({member, open, onClose, onRevoke, toast}) {
  const [deleteScheduled, setDeleteScheduled] = useState(false);

  // Reset checkbox when modal opens
  useEffect(() => {
    if (open) setDeleteScheduled(false);
  }, [open]);

  if (!open || !member) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        style={{animation:"popIn 0.2s ease"}}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className="text-lg font-bold text-gray-900">Revoke Access</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          {/* Warning block */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 mb-1.5">
                Are you sure you want to revoke access for{" "}
                <span className="text-gray-900">{member.name}</span>?
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                This user will be immediately logged out and will no longer have access to the MessBee workspace. This action can be undone by re-inviting them.
              </p>
            </div>
          </div>

          {/* Optional: delete scheduled campaigns */}
          <button
            onClick={() => setDeleteScheduled(v => !v)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition mb-6 text-left ${
              deleteScheduled
                ? "border-red-300 bg-red-50"
                : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300"
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              deleteScheduled ? "border-red-500 bg-red-500" : "border-gray-300 bg-white"
            }`}>
              {deleteScheduled && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">Delete all scheduled campaigns by this user</span>
          </button>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onRevoke(member.id, deleteScheduled);
                onClose();
                toast(`${member.name}'s access has been revoked`);
              }}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
              </svg>
              Revoke Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
