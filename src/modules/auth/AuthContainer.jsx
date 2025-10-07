import React, { useState, useEffect } from 'react';
import useAuthStore from './stores/authStore';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import { getResetPasswordParams, clearUrlParams } from './utils/urlUtils';

const AuthContainer = ({ onAuthSuccess }) => {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'forgot', 'reset-password'
  const [resetPasswordData, setResetPasswordData] = useState(null);
  const { isAuthenticated, user, isInitializing } = useAuthStore();

  useEffect(() => {
    // Only trigger auth success after initialization is complete
    if (isAuthenticated && user && !isInitializing) {
      console.log('[AuthContainer] Authentication state change detected, triggering onAuthSuccess');
      onAuthSuccess?.(user);
    }
  }, [isAuthenticated, user, isInitializing, onAuthSuccess]);

  // Check for reset password URL parameters on mount
  useEffect(() => {
    const resetParams = getResetPasswordParams();
    if (resetParams) {
      setResetPasswordData(resetParams);
      setCurrentView('reset-password');
      // Clear URL parameters to prevent browser navigation issues
      clearUrlParams();
    }
  }, []);

  const handleToggleView = (view) => {
    setCurrentView(view);
  };

  const handleLoginSuccess = (user) => {
    console.log('[AuthContainer] handleLoginSuccess called with user:', user?.email);
    console.log('[AuthContainer] Current auth state:', { isAuthenticated, user: user?.email, isInitializing });
    
    // Call the success handler immediately
    onAuthSuccess?.(user);
    
    // CRITICAL FIX: Force multiple callback attempts with state checks
    const retryCallbacks = [100, 200, 400, 600];
    retryCallbacks.forEach(delay => {
      setTimeout(() => {
        const currentState = useAuthStore.getState();
        console.log(`[AuthContainer] Auth state check after ${delay}ms:`, { 
          isAuthenticated: currentState.isAuthenticated, 
          user: currentState.user?.email,
          storeUser: user?.email
        });
        
        // Force callback if state is authenticated but callback might have failed
        if (currentState.isAuthenticated && currentState.user) {
          console.log(`[AuthContainer] Forcing onAuthSuccess callback at ${delay}ms`);
          onAuthSuccess?.(currentState.user);
        }
      }, delay);
    });
  };

  const handleRegisterSuccess = (user) => {
    onAuthSuccess?.(user);
  };

  // Don't render auth forms while still initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {currentView === 'login' && (
        <Login
          onToggleView={handleToggleView}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      
      {currentView === 'register' && (
        <Register
          onToggleView={handleToggleView}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}
      
      {currentView === 'forgot' && (
        <ForgotPassword
          onToggleView={handleToggleView}
        />
      )}
      
      {currentView === 'reset-password' && resetPasswordData && (
        <ResetPassword
          token={resetPasswordData.token}
          email={resetPasswordData.email}
          onToggleView={handleToggleView}
          onSuccess={onAuthSuccess}
        />
      )}
    </div>
  );
};

export default AuthContainer;