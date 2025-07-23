import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({ Component, ...rest }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Redirect to the login page if token is not present
      navigate("/login");
    }
  }); // Removed navigate from the dependency array

  return (
    <>
      <Component {...rest} />
    </>
  );
};

export default ProtectedRoute;
