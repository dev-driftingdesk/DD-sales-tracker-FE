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
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      onAuthSuccess?.(user);
    }
  }, [isAuthenticated, user, onAuthSuccess]);

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
    onAuthSuccess?.(user);
  };

  const handleRegisterSuccess = (user) => {
    onAuthSuccess?.(user);
  };

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