import React, { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * ErrorBoundary - Catches JavaScript errors anywhere in child component tree
 * Prevents the entire app from crashing when an error occurs
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // You can also log the error to an error reporting service here
    // e.g., Sentry, LogRocket, etc.
  }

  handleReset = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI when error occurs
      return (
        <div className="w-full h-full bg-gradient-to-br from-red-900/20 to-zinc-900 flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-zinc-800/90 border border-red-500/30 rounded-xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/20 rounded-full">
                <AlertTriangle className="text-red-400" size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Oops! Something went wrong</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  {this.props.componentName || 'This component'} encountered an error
                </p>
              </div>
            </div>

            {/* Error Details (in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-4 p-4 bg-black/30 rounded-lg border border-red-500/20">
                <p className="text-xs font-mono text-red-400 mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="text-xs text-zinc-500">
                    <summary className="cursor-pointer hover:text-zinc-300 transition-colors">
                      Stack trace
                    </summary>
                    <pre className="mt-2 overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* User-friendly message */}
            <p className="text-zinc-300 mb-6">
              Don't worry! You can try refreshing the component or the entire page. 
              If the problem persists, please report this issue.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors"
              >
                Reload Page
              </button>
            </div>

            {/* Help Link */}
            <div className="mt-4 text-center">
              <a
                href="https://github.com/davidgrcias/davidgrcias.github.io/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-500 hover:text-blue-400 transition-colors underline"
              >
                Report this issue on GitHub
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
