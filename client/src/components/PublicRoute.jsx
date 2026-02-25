import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { userContext } from '../context/Context';

/**
 * PublicRoute Component
 * Redirects to dashboard if user is already authenticated
 * Used for login, signup, etc.
 */
const PublicRoute = ({ children }) => {
  const { isLoggedIn, loading } = useContext(userContext);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ba2525]"></div>
      </div>
    );
  }

  // Redirect to dashboard if already logged in
  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // User is not authenticated, show public page
  return children;
};

export default PublicRoute;
