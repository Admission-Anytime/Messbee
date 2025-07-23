import SignupForm from "../../components/auth/SignupForm";
import FirstHeader from "../../components/header/FirstHeader";
import LeftArea from "./LeftArea";
import { Link } from "react-router-dom";
import "./registration.scss";
import Google from "../../assets/googlelogo.svg";

const Registration = () => {
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
          }}
        >
          <div className="link" style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "40px" }}>Registration</h2>
            <p style={{ fontSize: "12px" }}>
              have and Account{" "}
              <span>
                <Link to="/login">Log in </Link>
              </span>
            </p>
          </div>
          <div>
            <SignupForm />
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

export default Registration;
