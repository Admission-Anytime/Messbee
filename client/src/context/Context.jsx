import { createContext, useState, useEffect, useRef, useCallback } from "react";
import { getCurrentUser, clearAuthData, logout } from "../services/authService";
import axios from "./axios";
import io from "socket.io-client";
import UpgradePromptModal from "../components/Modol/UpgradePromptModal";
import { hasPlanFeature, getRequiredPlan } from "../utils/planLimits";

export const userContext = createContext();

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL).replace(/\/api\/?$/, '')
    : '');

const Context = (props) => {
  const [user, setUser] = useState(() => {
    const cachedUser = localStorage.getItem("user");
    if (cachedUser) {
      try { return JSON.parse(cachedUser); } catch (e) { return null; }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("user"));
  const [authChecked, setAuthChecked] = useState(false);
  const [rolePermissions, setRolePermissions] = useState(null);
  const socketRef = useRef(null);

  // Load user data on mount - Non-blocking approach
  useEffect(() => {
    const loadUser = async () => {
      // Check localStorage first for immediate UI update
      const cachedUser = localStorage.getItem("user");
      if (cachedUser) {
        try {
          const userData = JSON.parse(cachedUser);
          setUser(userData);
          setIsLoggedIn(true);
        } catch (error) {
          console.error("Invalid cached user data");
          localStorage.removeItem("user");
        }
      }
      
      // Then verify with server in background (non-blocking)
      try {
        const response = await getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
          setIsLoggedIn(true);
          localStorage.setItem("user", JSON.stringify(response.data));
          
          // Fetch permissions
          try {
            const res = await axios.get("/settings/role_permissions");
            if (res.data && res.data.value) {
              setRolePermissions(res.data.value);
            }
          } catch(err) {
             console.log("No custom permissions found.");
          }
        } else {
          // Invalid auth - clear everything
          clearAuthData();
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        // Only clear auth data on definitive auth failures (401 or 403 pending approval)
        const isAuthFailure = error?.response?.status === 401 ||
          (error?.response?.status === 403 && error?.response?.data?.pendingApproval);

        if (isAuthFailure) {
          if (error?.response?.status === 403 && error?.response?.data?.pendingApproval) {
            console.log("Account pending admin approval — logging out");
          } else {
            console.log("No active session");
          }
          clearAuthData();
          setUser(null);
          setIsLoggedIn(false);
        } else {
          console.warn("Session verification encountered non-auth error:", error?.message);
        }
      } finally {
        setAuthChecked(true);
      }
    };

    loadUser();
  }, []);

  // Socket: listen for real-time permissions & wallet broadcasts
  useEffect(() => {
    const socket = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on("permissions_updated", (data) => {
      if (data?.value) {
        setRolePermissions(data.value);
      }
    });

    // Listen for tenant room join & wallet update broadcasts
    const tenantId = user?._id || user?.tenantId;
    if (tenantId) {
      socket.emit('join_tenant', `tenant_${tenantId}`);
    }

    socket.on("wallet_updated", (data) => {
      if (data && data.credits !== undefined) {
        setUser(prev => {
          if (!prev) return prev;
          const updatedUsage = { ...(prev.messageUsage || {}) };
          if (data.category) {
            const catKey = data.category.toLowerCase();
            if (updatedUsage[catKey]) {
              updatedUsage[catKey] = {
                ...updatedUsage[catKey],
                sentCount: (updatedUsage[catKey].sentCount || 0) + 1,
                costDeducted: (updatedUsage[catKey].costDeducted || 0) + (data.deducted || 0)
              };
            }
            updatedUsage.totalMessages = (updatedUsage.totalMessages || 0) + 1;
            updatedUsage.totalSpent = (updatedUsage.totalSpent || 0) + (data.deducted || 0);
          }
          const updated = {
            ...prev,
            credits: data.credits,
            messageUsage: updatedUsage
          };
          localStorage.setItem("user", JSON.stringify(updated));
          return updated;
        });
      }
    });

    // 🔔 Low Balance Alert — show banner when wallet drops below ₹200
    socket.on('low_balance_alert', (data) => {
      // Use native browser notification if permission granted, else console warn
      const msg = data?.message || `⚠️ Low WCC Balance! ₹${data?.credits?.toFixed(2)} remaining. Please recharge.`;
      // Show a persistent alert toast — you can wire this to your toast library
      if (typeof window !== 'undefined') {
        // Dispatch custom event so any component can listen and show a toast
        window.dispatchEvent(new CustomEvent('wcc_low_balance', { detail: data }));
        console.warn('[Messbee Wallet]', msg);
      }
    });

    return () => { socket.disconnect(); };
  }, [user?._id, user?.tenantId]);

  // Update user data
  const updateUser = useCallback((userData) => {
    setUser(prev => {
      // Avoid triggering re-renders if no actual change
      if (!userData) return prev;
      let hasChange = false;
      for (const key of Object.keys(userData)) {
        if (prev?.[key] !== userData[key]) {
          hasChange = true;
          break;
        }
      }
      if (!hasChange) return prev;

      const merged = { ...prev, ...userData };
      // Ensure tenantWhatsAppConnected is preserved if not explicitly present in update response
      if (prev?.tenantWhatsAppConnected !== undefined && merged.tenantWhatsAppConnected === undefined) {
        merged.tenantWhatsAppConnected = prev.tenantWhatsAppConnected;
      }
      localStorage.setItem("user", JSON.stringify(merged));
      return merged;
    });
  }, []);

  // Re-fetch latest user data from server (call after actions like plan upgrade)
  const refreshUser = useCallback(async () => {
    try {
      const response = await getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  }, []);

  // Login user - Save user data to localStorage (tokens are in HTTP-only cookies)
  const loginUser = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Logout user - Call backend to clear HTTP-only cookies
  const logoutUser = async () => {
    try {
      // Call backend to clear HTTP-only cookies
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with logout even if API call fails
    } finally {
      // Clear local state and localStorage
      setUser(null);
      setIsLoggedIn(false);
      clearAuthData();
    }
  };

  // Global Upgrade Prompt Modal State
  const [upgradeModal, setUpgradeModal] = useState({
    isOpen: false,
    featureName: "",
    requiredPlan: "Growth",
    description: "",
    benefits: []
  });

  const promptUpgrade = ({ feature, featureName, requiredPlan, description, benefits } = {}) => {
    let reqPlan = requiredPlan;
    if (feature && !reqPlan) {
      reqPlan = getRequiredPlan(feature)?.name || "Growth";
    }
    setUpgradeModal({
      isOpen: true,
      featureName: featureName || (feature ? feature.replace(/([A-Z])/g, ' $1').trim() : "This Feature"),
      requiredPlan: reqPlan || "Growth",
      description: description || "",
      benefits: benefits || []
    });
  };

  const closeUpgradeModal = () => {
    setUpgradeModal(prev => ({ ...prev, isOpen: false }));
  };

  /**
   * Helper to check plan access. If allowed, returns true.
   * If not allowed, opens the UpgradePromptModal automatically and returns false.
   */
  const checkPlanAccess = (feature, featureDisplayName) => {
    const currentPlan = (user?.subscriptionPlan || "free").toLowerCase();
    if (hasPlanFeature(currentPlan, feature)) {
      return true;
    }
    promptUpgrade({
      feature,
      featureName: featureDisplayName,
    });
    return false;
  };

  const contextValue = {
    user,
    setUser,
    updateUser,
    refreshUser,
    loading,
    authChecked,
    isLoggedIn,
    loginUser,
    logoutUser,
    rolePermissions,
    setRolePermissions,
    promptUpgrade,
    checkPlanAccess
  };

  const currentPlanCapitalized = (user?.subscriptionPlan || "Free").charAt(0).toUpperCase() + (user?.subscriptionPlan || "Free").slice(1);

  return (
    <userContext.Provider value={contextValue}>
      {props.children}
      <UpgradePromptModal
        isOpen={upgradeModal.isOpen}
        onClose={closeUpgradeModal}
        featureName={upgradeModal.featureName}
        currentPlan={currentPlanCapitalized}
        requiredPlan={upgradeModal.requiredPlan}
        description={upgradeModal.description}
        benefits={upgradeModal.benefits}
      />
    </userContext.Provider>
  );
};

export default Context;
