import YellowButton from "../../components/button/buttonReg/yellowButton";
import "./upgradeplans.scss";
import { Switch } from "antd";
import Check from "../../assets/checkicon.svg";
import { useState } from "react";
const UpgradePlans = () => {
  const [isMonthly, setIsMonthly] = useState(false);

  const onChange = (checked) => {
    setIsMonthly(checked);
  };
  function percentCalculation(a, b) {
    var c = (parseFloat(a) / 100) * parseFloat(b);
    return parseFloat(c);
  }

  const getPrice = (price) => {
    const yearly = price * 12;
    const totalYear = Math.round(yearly - percentCalculation(yearly, 10));
    return isMonthly ? Number(totalYear) : Number(price);
  };
  const handleClick = () => {
    console.log("handleClick");
  };
  return (
    <div>
      <div id="main-body">
        <div className="heading">
          <h2>
            Powerful Feature for{" "}
            <span
              style={{
                background: "-webkit-linear-gradient(180deg, #FFC600, #D04B00)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              powerful Business
            </span>
          </h2>
          <div className="subheading">
            <p>Choose a plan that&rsquo;s right for you</p>
          </div>
        </div>
        <div className="togglebox">
          <p>Pay Monthly</p>
          <Switch defaultChecked={false} onChange={onChange} />
          <p>
            Pay Yearly
            {isMonthly ? (
              <span
                style={{
                  color: "#047857",
                }}
              >
                {" "}
                10% off
              </span>
            ) : null}
          </p>
        </div>
        <div className="plans-body">
          {footerCard.map(({ heading, body, price, footerData }, index) => {
            return (
              <div key={index} className="plans-container">
                <div className="plans-heading">
                  <p>{heading}</p>
                </div>
                <div className="plans-body">{body}</div>
                <div className="plans-price">
                  ₹{getPrice(price).toLocaleString()}
                  <span>{isMonthly ? "/year" : "/month"}</span>
                </div>
                <div className="plans-button">
                  <YellowButton
                    title="Get Start Now"
                    padding="10px 20px"
                    onClick={handleClick}
                  />
                </div>
                <div className="plans-fottor">
                  {footerData.map(({ text }, index) => {
                    return (
                      <div key={index} className="footer-icon">
                        <img src={Check} alt="icon" />
                        <p>{text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UpgradePlans;
const footerCard = [
  {
    heading: "Basic",
    body: "Per month billed quarterly Get ₹1000 worth of WhatsApp Conversation Credit with the plan",
    price: "999",
    footerData: [
      {
        text: "Includes 5 Agents",
      },
      {
        text: "1,000 free service conversation per month 5 Agents",
      },
      {
        text: "Unlimited Chat bot Session(5 bots)",
      },
      {
        text: "Unlimited contacts",
      },
      {
        text: "Conversation, Campaign Analytics is included",
      },
    ],
  },
  {
    heading: "Professional",
    body: "Per month billed quarterly Get ₹3000 worth of WhatsApp Conversation Credit with the plan",
    price: "2299",
    footerData: [
      {
        text: "Includes 7 Agents",
      },
      {
        text: "1,000 free service conversation per month 5 Agents",
      },
      {
        text: "Unlimited Chat bot Session (10 bots)",
      },
      {
        text: "Unlimited contacts",
      },
      {
        text: "*include all features of Basic plans",
      },
    ],
  },
  {
    heading: "Professional Plus",
    body: "Per month billed quarterly Get ₹6000 worth of WhatsApp Conversation Credit with the plan",
    price: "4499",
    footerData: [
      {
        text: "Includes 10 Agents",
      },
      {
        text: "1,000 free service conversation per month 5 Agents",
      },
      {
        text: "Unlimited Chat bot Session (20 bots)",
      },
      {
        text: "Unlimited contacts",
      },
      {
        text: "*include all features of Professional Plans",
      },
    ],
  },
  {
    heading: "Enterprise",
    body: "Best for enterprises, high scale and custom requirements",
    price: "11999",
    footerData: [
      {
        text: "Includes 25 Agents",
      },
      {
        text: "1,000 free service conversation per month",
      },
      {
        text: "Unlimited Chat bot Session (50 bots)",
      },
      {
        text: "Unlimited contacts",
      },
      {
        text: "*include all features of Professional Plus Plans",
      },
    ],
  },
];
