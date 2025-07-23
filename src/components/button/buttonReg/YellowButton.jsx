import { useState, useRef } from "react";
import "./YellowButton.scss";
import PropTypes from "prop-types";

const YellowButton = ({
  title,
  padding,
  borderRadius = "5px",
  onDrawerOpen,
  simpleBorder = "0px",
  darkYellow = "#f0b429",
  onClick, // Default empty function
}) => {
  const [ripple, setRipple] = useState({});
  const buttonRef = useRef(null);

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

    onDrawerOpen && onDrawerOpen();
    onClick && onClick();
  };

  return (
    <div className="yellow-button-container">
      <button
        ref={buttonRef}
        className="yellow-ripple-button"
        style={{
          padding: padding,
          borderRadius: borderRadius,
          backgroundColor: darkYellow,
          border: simpleBorder,
        }}
        onClick={handleClick}
      >
        {title}
        {ripple.active && (
          <div className="yellow-ripple" style={ripple.style}></div>
        )}
      </button>
    </div>
  );
};

YellowButton.propTypes = {
  title: PropTypes.string.isRequired,
  padding: PropTypes.string,
  borderRadius: PropTypes.string,
  darkYellow: PropTypes.string,
  onDrawerOpen: PropTypes.func,
  onClick: PropTypes.func,
  onClickOutside: PropTypes.func,
};

export default YellowButton;
