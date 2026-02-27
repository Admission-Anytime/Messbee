import { useContext, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { userContext } from '../context/Context';
import Loading from './Loading';

/**
 * ProtectedRoute Component
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useContext(userContext);
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return <Loading />;
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
