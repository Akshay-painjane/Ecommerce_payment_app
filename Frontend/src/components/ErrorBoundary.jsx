import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App render error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="page-section">
          <div className="empty-state">
            <h1>Something went wrong</h1>
            <p>Please refresh the page or sign in again.</p>
            <a href="/home">Go to Home</a>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
