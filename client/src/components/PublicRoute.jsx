import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { userContext } from '../context/Context';
import Loading from './Loading';

/**
 * PublicRoute Component
 * Redirects to dashboard if user is already authenticated
 * Used for login, signup, etc.
 * Optimized for fast initial render - no loading state blocking
 */
const PublicRoute = ({ children }) => {
  const { isLoggedIn, authChecked } = useContext(userContext);

  // Wait for initial auth check if not immediately logged in
  if (!isLoggedIn && !authChecked) {
    return <Loading />;
  }

  // Redirect to dashboard if already logged in
  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // User is not authenticated, show public page
  return children;
};

export default PublicRoute;
