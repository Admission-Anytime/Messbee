import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./loginform.scss";
import YellowButton from "../button/buttonReg/yellowButton";
import axios from "../../context/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Check if the user is already logged in
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/"); // Redirect to the homepage
    }
  }, []); // Run this effect only once on component mount

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("/login", formData);

      if (response && response.data && response.data.token) {
        // toast.success(response.data.message);
        toast.success("successfully logged in");

        // Save token to localStorage
        localStorage.setItem("token", response.data.token);

        // Redirect the user to the homepage
        navigate("/");
      } else {
        // Handle login error
        toast.error(response.data.message);

        setErrorMessage(
          "Oops! It seems like your email or password is incorrect. If you don't have an account, you can "
        );
      }
    } catch (error) {
      // Handle login error
      toast.error(error.message);
      setErrorMessage(
        "Oops! It seems like your email or password is incorrect. If you don't have an account, you can "
      );
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </label>
        <br />
        <YellowButton
          title="Login"
          padding={"15px"}
          borderRadius="8px"
          type="submit"
        />
      </form>
      {errorMessage && (
        <p className="error-message">
          {errorMessage}
          <span className="signup-link">
            <Link to="/signup">Sign up </Link>
          </span>
        </p>
      )}
      <ToastContainer />
    </div>
  );
};

export default LoginForm;
