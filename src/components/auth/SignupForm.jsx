import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./signupform.scss";
import YellowButton from "../button/buttonReg/yellowButton";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import axios from "../../context/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignupForm = () => {
  const [number, setNumber] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  useEffect(() => {
    // Check if the user is already logged in
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/"); // Redirect to the homepage
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Check if password and confirm password match
      if (formData.password !== formData.confirm_password) {
        setErrorMessage("Passwords do not match.");
        return;
      }

      const phone = number.replace(/^\D+91/g, "");
      const updatedFormData = { ...formData, phone };

      const response = await axios.post("/register", updatedFormData);

      if (response && response.data) {
        if (response.data.token) {
          // Handle successful signup response
          toast.success(response.data.message, {
            position: "top-center",
          });
          localStorage.setItem("token", response.data.token);
          navigate("/");
        } else {
          // Handle signup error
          toast.error(response.data.message);
          setErrorMessage("Oops! Something went wrong while signing up.");
        }
      }
    } catch (error) {
      // Handle signup error
      toast.error("Sign Up error:");
      setErrorMessage("Oops! Something went wrong while signing up.");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </label>
        <br />
        <label>
          Phone:
          <PhoneInput
            className="phoneinput"
            defaultCountry="in"
            value={number}
            forceDialCode="true"
            onChange={setNumber}
            inputProps={{
              required: true,
            }}
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            name="email"
            placeholder="Email"
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
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </label>
        <br />
        <label>
          Confirm Password:
          <input
            type="password"
            name="confirm_password"
            placeholder="Confirm Password"
            value={formData.confirm_password}
            onChange={handleInputChange}
            required
          />
        </label>
        <br />
        <YellowButton
          title="Sign Up"
          padding={"15px"}
          borderRadius="8px"
          type="submit"
        />
        {errorMessage && (
          <p className="error-message">
            {errorMessage} <Link to="/login">Login</Link>
          </p>
        )}
      </form>
      <ToastContainer />
    </>
  );
};

export default SignupForm;
