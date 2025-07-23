import "./leftArea.scss";
import LoginLogo from "../../assets/loginlogo.svg";
import ArrowIcon from "../../assets/ArrowRightSquare.png";
import Laptop from "../../assets/laptoppng.png";
const LeftArea = () => {
  return (
    <div className="loginContainer">
      <div className="top">
        <img src={LoginLogo} alt="logo" />
      </div>
      <div className="mid">
        <h3>Your client, your communication, our platform</h3>
        <p>Send personalized campaigns on WhatsApp</p>
      </div>
      <div className="bottom">
        <div className="infoBox">
          <div className="icon">
            <img src={ArrowIcon} alt="icon" />
          </div>
          <div className="info">
            <h4>Activate Bulk messages on WhatsApp, </h4>
            <p>
              Connect with your customers through the channels they love in just
              a few clicks.
            </p>
          </div>
        </div>
        <div className="infoBox">
          <div className="icon">
            <img src={ArrowIcon} alt="icon" />
          </div>
          <div className="info">
            <h4>
              Explore MessBee APIs or use a user-friendly no-code interface.
            </h4>
            <p>
              Seamlessly integrate and manage communication channels your way.
            </p>
          </div>
        </div>
        <div className="infoBox">
          <div className="icon">
            <img src={ArrowIcon} alt="icon" />
          </div>
          <div className="info">
            <h4>Enjoy a free trial of MessBee products.</h4>
            <p>
              Boost customer engagement, optimize Message templates, and create
              chatbots at your own pace.
            </p>
          </div>
        </div>
      </div>
      <img className="laptop" src={Laptop} alt="laptop" />
    </div>
  );
};

export default LeftArea;
