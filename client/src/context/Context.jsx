import { createContext, useState, useEffect, useRef } from "react";
import { getCurrentUser, clearAuthData, logout } from "../services/authService";
import axios from "./axios";
import io from "socket.io-client";

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
        // API call failed (401/network error) - user not authenticated
        console.log("No active session");
        clearAuthData();
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setAuthChecked(true);
      }
    };

    loadUser();
  }, []);

  // Socket: listen for real-time permissions_updated broadcast
  useEffect(() => {
    const socket = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on("permissions_updated", (data) => {
      if (data?.value) {
        setRolePermissions(data.value);
      }
    });

    return () => { socket.disconnect(); };
  }, []);

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Re-fetch latest user data from server (call after actions like plan upgrade)
  const refreshUser = async () => {
    try {
      const response = await getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

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
    setRolePermissions
  };

  return (
    <userContext.Provider value={contextValue}>
      {props.children}
    </userContext.Provider>
  );
};

export default Context;
