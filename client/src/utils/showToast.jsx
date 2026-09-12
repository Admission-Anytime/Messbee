import { toast } from "react-toastify";

const orangeToastStyle = {
  background: '#FFF7ED', // light orange tint
  color: '#9A3412', // rich deep orange text
  border: '1px solid #FDBA74', // warm orange border
  boxShadow: '0 10px 25px -5px rgba(249, 115, 22, 0.15), 0 8px 10px -6px rgba(249, 115, 22, 0.1)',
  borderRadius: '12px',
  fontWeight: '600',
  fontSize: '14px',
  fontFamily: 'Outfit, Inter, sans-serif'
};

const orangeErrorStyle = {
  background: '#FFF1F2',
  color: '#9F1239',
  border: '1px solid #FECDD3',
  boxShadow: '0 10px 25px -5px rgba(244, 63, 94, 0.15)',
  borderRadius: '12px',
  fontWeight: '600',
  fontSize: '14px',
  fontFamily: 'Outfit, Inter, sans-serif'
};

export const showToast = {
  success: (title, message) => {
    toast.success(message ? `${title}: ${message}` : title, {
      style: orangeToastStyle,
      progressStyle: { background: '#F97316' },
      icon: '🟠'
    });
  },
  error: (title, message) => {
    toast.error(message ? `${title}: ${message}` : title, {
      style: orangeErrorStyle,
      progressStyle: { background: '#F43F5E' }
    });
  },
  info: (title, message) => {
    toast.info(message ? `${title}: ${message}` : title, {
      style: orangeToastStyle,
      progressStyle: { background: '#FB923C' },
      icon: '⚡'
    });
  },
  warning: (title, message) => {
    toast.warning(message ? `${title}: ${message}` : title, {
      style: orangeToastStyle,
      progressStyle: { background: '#F59E0B' },
      icon: '⚠️'
    });
  }
};