import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

/**
 * SafeImage component that manages its own error state.
 * Prevents redundant API calls/flickering when parent components re-render
 * by strictly controlling the src attribute during error states.
 */
const SafeImage = ({ src, alt, className, fallbackSrc, ...props }) => {
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Sync with prop changes
  useEffect(() => {
    setIsError(false);
    setCurrentSrc(src);
  }, [src]);

  const handleError = () => {
    if (!isError) {
      setIsError(true);
      setCurrentSrc(fallbackSrc || "https://via.placeholder.com/150?text=No+Image");
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};

SafeImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
  fallbackSrc: PropTypes.string,
};

SafeImage.defaultProps = {
  src: "",
  alt: "",
  className: "",
  fallbackSrc: "https://via.placeholder.com/150?text=No+Image",
};

export default SafeImage;
