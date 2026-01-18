"use client"; 
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error in " + this.props.app + " for " + this.props.type + ":", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong in {this.props.app} for {this.props.type}</h1>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
