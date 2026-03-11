import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { userContext } from '../context/Context';
import Loading from './Loading';

/**
 * ProtectedRoute Component
 * Waits for auth check to complete before redirecting.
 * This prevents wrongly bouncing logged-in users to /landing on page refresh.
 */
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, authChecked } = useContext(userContext);
  const location = useLocation();

  // Wait for auth check to finish before making any redirect decision
  if (!authChecked) {
    return <Loading />;
  }

  // Auth check done - redirect to landing if not authenticated
  if (!isLoggedIn) {
    return <Navigate to="/landing" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
