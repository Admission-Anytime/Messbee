import axios from "../context/axios";

// ==================== SIGNUP FLOW ====================

/**
 * Request OTP for signup
 */
export const requestSignupOTP = async (name, email, password) => {
  const { data } = await axios.post("/auth/signup/request-otp", {
    name,
    email,
    password,
  });
  return data;
};

/**
 * Verify signup OTP
 */
export const verifySignupOTP = async (email, otp) => {
  const { data } = await axios.post("/auth/signup/verify-otp", {
    email,
    otp,
  });
  return data;
};

// ==================== LOGIN FLOW ====================

/**
 * Request OTP for login
 */
export const requestLoginOTP = async (email) => {
  const { data } = await axios.post("/auth/login/request-otp", {
    email,
  });
  return data;
};

/**
 * Verify login OTP
 */
export const verifyLoginOTP = async (email, otp) => {
  const { data } = await axios.post("/auth/login/verify-otp", {
    email,
    otp,
  });
  return data;
};

/**
 * Login with email and password
 */
export const loginWithPassword = async (email, password) => {
  const { data } = await axios.post("/auth/login", {
    email,
    password,
  });
  return data;
};

// ==================== TOKEN MANAGEMENT ====================

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken) => {
  const { data } = await axios.post("/auth/refresh-token", {
    refreshToken,
  });
  return data;
};

/**
 * Logout user - Clears HTTP-only cookies on backend
 */
export const logout = async () => {
  try {
    const { data } = await axios.post("/auth/logout");
    return data;
  } catch (error) {
    // Even if API call fails, we should clear local data
    console.error("Logout API error:", error);
    throw error;
  }
};

// ==================== PASSWORD RESET ====================

/**
 * Request password reset OTP
 */
export const forgotPassword = async (email) => {
  const { data } = await axios.post("/auth/forgot-password", {
    email,
  });
  return data;
};

/**
 * Reset password with OTP
 */
export const resetPassword = async (email, otp, newPassword) => {
  const { data } = await axios.post("/auth/reset-password", {
    email,
    otp,
    newPassword,
  });
  return data;
};

/**
 * Update password (when logged in)
 */
export const updatePassword = async (currentPassword, newPassword) => {
  const { data } = await axios.put("/auth/update-password", {
    currentPassword,
    newPassword,
  });
  return data;
};

// ==================== USER INFO ====================

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  const { data } = await axios.get("/auth/me");
  return data;
};

/**
 * Resend OTP
 */
export const resendOTP = async (email, purpose = "login") => {
  const { data } = await axios.post("/auth/resend-otp", {
    email,
    purpose,
  });
  return data;
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Save user data to localStorage (tokens are in HTTP-only cookies)
 */
export const saveAuthData = (authData) => {
  // Only save user data - tokens are handled by HTTP-only cookies
  if (authData.user) {
    localStorage.setItem("user", JSON.stringify(authData.user));
  }
};

/**
 * Get stored user data
 */
export const getStoredUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Check if user is authenticated
 * Since tokens are in HTTP-only cookies, we check if user data exists
 */
export const isAuthenticated = () => {
  const user = getStoredUser();
  return !!user;
};

/**
 * Clear authentication data
 */
export const clearAuthData = () => {
  // Only clear user data - cookies are cleared by backend on logout
  localStorage.removeItem("user");
};
