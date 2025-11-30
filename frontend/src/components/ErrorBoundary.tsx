'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorFallback from './ErrorFallback';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * Zachytí JavaScript errory kdekoliv v child component tree
 * Loguje errory a zobrazí fallback UI místo crash celé aplikace
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state tak že další render ukáže fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error do console (v production by šlo do Sentry/LogRocket)
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Volitelný custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // V production bys mohl poslat error do monitoring služby:
    // logErrorToService(error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Pokud byl poskytnut custom fallback, použij ho
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Jinak použij default ErrorFallback komponentu
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;