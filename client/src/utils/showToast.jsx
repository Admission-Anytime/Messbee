import { toast as originalToast } from "react-toastify";
import CustomToast from "../components/ui/CustomToast";

/**
 * showToast – renders a custom toast card matching the Figma design.
 *
 * Usage:
 *   showToast.success("Payment Method Verified", "Your Visa card ending in 4242 has been added.");
 *   showToast.error("Error Occurred", "Something went wrong.");
 *   showToast.info("Heads Up", "Your session will expire soon.");
 *   showToast.warning("Warning", "Storage almost full.");
 */

const createToast = (type) => (title, message) => {
  originalToast(
    ({ closeToast }) => (
      <CustomToast
        title={title}
        message={message}
        type={type}
        closeToast={closeToast}
      />
    ),
    {
      type,
      icon: false,
      closeButton: false,
      className: "custom-toast-card",
      bodyClassName: "custom-toast-body",
    }
  );
};

export const showToast = {
  success: createToast("success"),
  error: createToast("error"),
  info: createToast("info"),
  warning: createToast("warning"),
};

/**
 * Patched `toast` drop-in replacement.
 *
 * When existing code calls `toast.success("some message")` or `toast.error("msg")`,
 * this wrapper renders the same rich CustomToast card so every toast in the app
 * looks identical – no code changes needed in individual pages.
 *
 * Import this instead of the original:
 *   import { toast } from "../utils/showToast";
 *
 * Or – if most files import from "react-toastify" directly – we patch globally
 * inside the App-level initialisation.
 */
const wrapMethod = (type) => (messageOrJSX, options = {}) => {
  // If it's already JSX (a function/component), pass through as-is
  if (typeof messageOrJSX === "function" || typeof messageOrJSX === "object") {
    return originalToast[type](messageOrJSX, options);
  }

  // Plain string → render the Figma-style card
  return originalToast(
    ({ closeToast }) => (
      <CustomToast
        title={messageOrJSX}
        message={null}
        type={type}
        closeToast={closeToast}
      />
    ),
    {
      ...options,
      type,
      icon: false,
      closeButton: false,
      className: "custom-toast-card",
      bodyClassName: "custom-toast-body",
    }
  );
};

// Build a patched `toast` that mirrors the original API surface
export const toast = Object.assign(
  // Default call: toast("message")
  (messageOrJSX, options) => wrapMethod("default")(messageOrJSX, options),
  {
    success: wrapMethod("success"),
    error: wrapMethod("error"),
    info: wrapMethod("info"),
    warning: wrapMethod("warning"),
    // Pass-through for methods we don't need to customise
    loading: originalToast.loading,
    promise: originalToast.promise,
    dismiss: originalToast.dismiss,
    update: originalToast.update,
    done: originalToast.done,
    onChange: originalToast.onChange,
    isActive: originalToast.isActive,
    clearWaitingQueue: originalToast.clearWaitingQueue,
  }
);