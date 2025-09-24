import React, { useState, useEffect } from 'react';
import useAuthStore from './stores/authStore';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';

const AuthContainer = ({ onAuthSuccess }) => {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'forgot'
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      onAuthSuccess?.(user);
    }
  }, [isAuthenticated, user, onAuthSuccess]);

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
    </div>
  );
};

export default AuthContainer;