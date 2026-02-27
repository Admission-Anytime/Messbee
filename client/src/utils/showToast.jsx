import { toast } from "react-toastify";

// Simple default toaster using react-toastify defaults
export const showToast = {
  success: (title, message) => {
    toast.success(message ? `${title}: ${message}` : title);
  },
  error: (title, message) => {
    toast.error(message ? `${title}: ${message}` : title);
  },
  info: (title, message) => {
    toast.info(message ? `${title}: ${message}` : title);
  },
  warning: (title, message) => {
    toast.warning(message ? `${title}: ${message}` : title);
  }
};