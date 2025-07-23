// pages/Auth/Login.js
import LoginForm from "../../components/auth/LoginForm"; // Adjust the path based on your project structure
import "./login.scss";
import FirstHeader from "../../components/header/FirstHeader";
import LeftArea from "./LeftArea";
import { Link } from "react-router-dom";
import Google from "../../assets/googlelogo.svg";

const Login = () => {
  return (
    <>
      <FirstHeader />
      <div className="authContainer">
        <div className="leftArea">
          <LeftArea />
        </div>
        <div
          className="rightArea"
          style={{
            width: "50%",
            height: "100%",
            padding: "1.5rem 7rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div className="link" style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "40px" }}>Login</h2>
            <p style={{ fontSize: "12px" }}>
              don&#39;t have and Account{" "}
              <span>
                <Link to="/signup">Sign up </Link>
              </span>
            </p>
          </div>
          <div>
            <LoginForm />
          </div>
          <div className="horizontal-line-container">
            <div className="line"></div>
            <div className="text">OR</div>
          </div>
          <div className="google">
            <div className="logo">
              <img src={Google} alt="logo" />
            </div>
            <p>Continue with Google</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
