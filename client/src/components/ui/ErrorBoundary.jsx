import PropTypes from "prop-types";
import React from "react";
import ErrorState from "./ErrorState";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
   
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {

    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
     
      return <ErrorState error={this.state.error} />;
    }

    return this.props.children;
  }
}
ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;