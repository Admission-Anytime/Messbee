import React, { useState } from "react";
import "./button.scss";
import ButtonIcon from "../../assets/svgicon/rupess.svg";

const Button = ({ title }) => {
  const [ripple, setRipple] = useState({});

  const handleClick = (event) => {
    const rect = event.target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    setRipple({
      style: {
        top: `${y}px`,
        left: `${x}px`,
        width: `${size}px`,
        height: `${size}px`,
      },
      active: true,
    });

    setTimeout(() => {
      setRipple({ ...ripple, active: false });
    }, 600); // Adjust the duration of the ripple effect
  };
  return (
    <div className="button-container">
      <button className="ripple-button" onClick={handleClick}>
        <img src={ButtonIcon} alt="" />
        {title}
        {ripple.active && <div className="ripple" style={ripple.style}></div>}
      </button>
    </div>
  );
};

export default Button;
