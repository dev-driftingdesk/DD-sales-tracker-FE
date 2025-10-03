import React from 'react';
import { AlertTriangle, RefreshCw, LogOut, Wifi, WifiOff } from 'lucide-react';

/**
 * AuthErrorBoundary - React Error Boundary for Authentication Failures
 * Provides graceful error handling and recovery options for authentication-related errors
 */
class AuthErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
      retryCount: 0,
      isOffline: !navigator.onLine
    };
    
    // Bind methods
    this.handleRetry = this.handleRetry.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleOnlineStatusChange = this.handleOnlineStatusChange.bind(this);
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error: error
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('[AuthErrorBoundary] Authentication error caught:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Report to error monitoring service if available
    if (window.reportError) {
      window.reportError('AuthErrorBoundary', error, errorInfo);
    }
  }

  componentDidMount() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnlineStatusChange);
    window.addEventListener('offline', this.handleOnlineStatusChange);
  }

  componentWillUnmount() {
    // Clean up event listeners
    window.removeEventListener('online', this.handleOnlineStatusChange);
    window.removeEventListener('offline', this.handleOnlineStatusChange);
  }

  handleOnlineStatusChange() {
    this.setState({ isOffline: !navigator.onLine });
  }

  handleRetry() {
    this.setState({ 
      isRetrying: true,
      retryCount: this.state.retryCount + 1
    });

    // Clear error state and attempt to retry
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRetrying: false
      });
      
      // Trigger a re-render by calling the retry callback if provided
      if (this.props.onRetry) {
        this.props.onRetry();
      }
    }, 1000);
  }

  handleLogout() {
    // Clear authentication state and redirect to login
    if (this.props.onLogout) {
      this.props.onLogout();
    } else {
      // Fallback: reload the page to clear any corrupted state
      window.location.reload();
    }
  }

  getErrorType(error) {
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorName = error?.name?.toLowerCase() || '';
    
    // Network-related errors
    if (errorMessage.includes('network') || 
        errorMessage.includes('fetch') || 
        errorMessage.includes('timeout') ||
        errorName.includes('networkerror') ||
        this.state.isOffline) {
      return 'network';
    }
    
    // Authentication-related errors
    if (errorMessage.includes('auth') || 
        errorMessage.includes('token') || 
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('forbidden')) {
      return 'authentication';
    }
    
    // Configuration or initialization errors
    if (errorMessage.includes('config') || 
        errorMessage.includes('init') ||
        errorMessage.includes('setup')) {
      return 'configuration';
    }
    
    return 'unknown';
  }

  getErrorMessage(errorType, error) {
    switch (errorType) {
      case 'network':
        return this.state.isOffline 
          ? 'You appear to be offline. Please check your internet connection.'
          : 'Network connection issue. Unable to reach authentication servers.';
      
      case 'authentication':
        return 'Authentication failed. Your session may have expired or there was a login issue.';
      
      case 'configuration':
        return 'Configuration error. The authentication system needs to be properly set up.';
      
      default:
        return error?.message || 'An unexpected authentication error occurred.';
    }
  }

  getRecoveryOptions(errorType) {
    const options = [];
    
    if (errorType === 'network') {
      options.push({
        label: this.state.isOffline ? 'Check Connection' : 'Retry Connection',
        action: this.handleRetry,
        icon: this.state.isOffline ? Wifi : RefreshCw,
        primary: true
      });
    } else {
      options.push({
        label: 'Try Again',
        action: this.handleRetry,
        icon: RefreshCw,
        primary: true
      });
    }
    
    // Always provide logout option as fallback
    options.push({
      label: 'Sign Out & Restart',
      action: this.handleLogout,
      icon: LogOut,
      primary: false
    });
    
    return options;
  }

  render() {
    if (this.state.hasError) {
      const errorType = this.getErrorType(this.state.error);
      const errorMessage = this.getErrorMessage(errorType, this.state.error);
      const recoveryOptions = this.getRecoveryOptions(errorType);
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
                {this.state.isOffline ? (
                  <WifiOff className="h-8 w-8 text-red-600" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                )}
              </div>
              
              {/* Error Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Authentication Error
              </h2>
              
              {/* Error Message */}
              <p className="text-gray-600 mb-6">
                {errorMessage}
              </p>
              
              {/* Connection Status */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {this.state.isOffline ? (
                  <>
                    <WifiOff className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">Offline</span>
                  </>
                ) : (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Online</span>
                  </>
                )}
              </div>
              
              {/* Retry Information */}
              {this.state.retryCount > 0 && (
                <p className="text-sm text-gray-500 mb-6">
                  Attempt #{this.state.retryCount + 1}
                </p>
              )}
              
              {/* Recovery Options */}
              <div className="space-y-3">
                {recoveryOptions.map((option, index) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={index}
                      onClick={option.action}
                      disabled={this.state.isRetrying}
                      className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                        option.primary
                          ? 'bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:opacity-50'
                      }`}
                    >
                      {this.state.isRetrying && option.primary ? (
                        <RefreshCw className="h-5 w-5 animate-spin" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                      <span>
                        {this.state.isRetrying && option.primary ? 'Retrying...' : option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              
              {/* Debug Information (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-8 text-left">
                  <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                    Debug Information
                  </summary>
                  <div className="mt-2 p-4 bg-gray-100 rounded-lg text-xs font-mono text-gray-700 overflow-auto max-h-40">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.toString()}
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

export default AuthErrorBoundary;