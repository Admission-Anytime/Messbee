import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { userContext } from '../context/Context';

/**
 * PublicRoute Component
 * Redirects to dashboard if user is already authenticated
 * Used for login, signup, etc.
 * Optimized for fast initial render - no loading state blocking
 */
const PublicRoute = ({ children }) => {
  const { isLoggedIn } = useContext(userContext);

  // Redirect to dashboard if already logged in (fast, non-blocking)
  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // User is not authenticated, show public page
  return children;
};

export default PublicRoute;
