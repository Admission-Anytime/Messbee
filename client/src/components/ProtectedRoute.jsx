import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { userContext } from '../context/Context';
import Loading from './Loading';

/**
 * ProtectedRoute Component
 * Redirects to login if user is not authenticated
 * Optimized for fast initial render - no loading state blocking
 */
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, authChecked } = useContext(userContext);
  const location = useLocation();

  // Wait for initial auth check if not immediately logged in
  if (!isLoggedIn && !authChecked) {
    return <Loading />;
  }

  // Redirect to login if not authenticated after check
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
