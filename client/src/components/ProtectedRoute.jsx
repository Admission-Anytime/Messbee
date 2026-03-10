import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { userContext } from '../context/Context';

/**
 * ProtectedRoute Component
 * Redirects to login if user is not authenticated
 * Optimized for fast initial render - no loading state blocking
 */
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useContext(userContext);
  const location = useLocation();

  // Redirect to login if not authenticated (fast, non-blocking)
  if (!isLoggedIn) {
    return <Navigate to="/landing" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
