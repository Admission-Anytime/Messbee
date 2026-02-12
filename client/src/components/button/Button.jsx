import React, { useState } from "react";
import ButtonIcon from "../../assets/svgicon/rupess.svg";

const Button = ({ title }) => {
  const [ripple, setRipple] = useState({});

  const handleClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
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
      setRipple({ active: false });
    }, 600);
  };

  return (
    <div className="flex justify-center items-center">
      <button
        onClick={handleClick}
        className="relative flex items-center gap-2 rounded-full bg-[#02af9b] text-white font-semibold px-4 py-2 text-sm overflow-hidden cursor-pointer hover:bg-[#029d8c] transition-all duration-200"
      >
        <img src={ButtonIcon} alt="" className="w-4 h-4" />
        {title}

        {ripple.active && (
          <span
            className="absolute rounded-full bg-white/70 animate-ripple"
            style={ripple.style}
          />
        )}
      </button>
    </div>
  );
};

export default Button;
