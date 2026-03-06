import { createContext, useState, useEffect } from "react";
import { getCurrentUser, clearAuthData, logout } from "../services/authService";

export const userContext = createContext();

const Context = (props) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // Changed to false for faster initial render
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

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

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
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
    loading,
    authChecked,
    isLoggedIn,
    loginUser,
    logoutUser,
  };

  return (
    <userContext.Provider value={contextValue}>
      {props.children}
    </userContext.Provider>
  );
};

export default Context;
