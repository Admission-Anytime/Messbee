import { toast } from "react-toastify";
import CustomToast from "../components/ui/CustomToast";

// Configuration for the toast behavior
const toastConfig = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: true,
  closeOnClick: false, // We handle close in the component
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  closeButton: false, // Disable default close button
  icon: false,        // Disable default icon
  style: { background: "transparent", boxShadow: "none" } // Remove default box styling
};

export const showToast = {
  success: (title, message) => {
    toast.success(<CustomToast type="success" title={title} message={message} />, toastConfig);
  },
  error: (title, message) => {
    toast.error(<CustomToast type="error" title={title} message={message} />, toastConfig);
  }
};