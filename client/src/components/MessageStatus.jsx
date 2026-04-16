// Message Status Indicator Component for WhatsApp-style status
import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

/**
 * MessageStatus - Display WhatsApp-style message status
 * @param {string} status - sent | delivered | read | failed | pending
 * @param {string} sender - me | them
 */
const MessageStatus = ({ status, sender }) => {
  // Only show status for outgoing messages (sender === "me")
  if (sender !== "me") return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'sent':
        return (
          <CheckIcon className="w-4 h-4 text-gray-400" strokeWidth={2} />
        );
      case 'delivered':
        return (
          <div className="relative w-4 h-4">
            <CheckIcon className="w-4 h-4 text-gray-400 absolute" strokeWidth={2} style={{ left: '-2px' }} />
            <CheckIcon className="w-4 h-4 text-gray-400 absolute" strokeWidth={2} style={{ left: '2px' }} />
          </div>
        );
      case 'read':
        return (
          <div className="relative w-4 h-4">
            <CheckIcon className="w-4 h-4 text-blue-500 absolute" strokeWidth={2} style={{ left: '-2px' }} />
            <CheckIcon className="w-4 h-4 text-blue-500 absolute" strokeWidth={2} style={{ left: '2px' }} />
          </div>
        );
      case 'failed':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'pending':
        return (
          <svg className="w-4 h-4 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <span className="inline-flex items-center ml-1" title={status}>
      {getStatusIcon()}
    </span>
  );
};

export default MessageStatus;

/**
 * Usage in Conversion.jsx:
 * 
 * import MessageStatus from './MessageStatus';
 * 
 * In your message rendering:
 * <div className="flex items-end gap-1">
 *   <span>{message.text}</span>
 *   <MessageStatus status={message.status} sender={message.sender} />
 * </div>
 */
