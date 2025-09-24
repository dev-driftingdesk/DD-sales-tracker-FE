import React, { useState, useEffect } from 'react';
import { 
  Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle, 
  Lock, RefreshCw, Briefcase, Shield, Clock
} from 'lucide-react';
import useAuthStore from '../stores/authStore';
import Logo from '../../../components/Logo';

const ForgotPassword = ({ onToggleView }) => {
  const { resetPassword, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    clearError();
  }, []);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const validateEmail = (email) => {
    if (!email) {
      return 'Email is required';
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return 'Invalid email format';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    if (emailError) {
      setValidationError(emailError);
      return;
    }
    
    const result = await resetPassword(email);
    
    if (result.success) {
      setIsEmailSent(true);
      setCountdown(60); // 60 second cooldown
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    const result = await resetPassword(email);
    if (result.success) {
      setCountdown(60);
    }
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    if (validationError) {
      setValidationError('');
    }
    if (error) clearError();
  };

  const demoEmails = [
    'admin@salestracker.com',
    'manager@salestracker.com',
    'sales@salestracker.com'
  ];

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Success State */}
          <div className="text-center">
            {/* Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to{' '}
              <span className="font-medium text-gray-900">{email}</span>
            </p>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-medium text-blue-900 mb-2">Next steps:</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Check your email inbox and spam folder</li>
                <li>• Click the reset link in the email</li>
                <li>• Follow the instructions to create a new password</li>
                <li>• The link will expire in 24 hours</li>
              </ul>
            </div>

            {/* Resend Button */}
            <button
              onClick={handleResend}
              disabled={countdown > 0 || isLoading}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all mb-4 ${
                countdown > 0 || isLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:shadow-lg transform hover:scale-[1.02]'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : countdown > 0 ? (
                <>
                  <Clock className="w-4 h-4" />
                  Resend in {countdown}s
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Resend Email
                </>
              )}
            </button>

            {/* Back to Login */}
            <button
              onClick={() => onToggleView('login')}
              className="flex items-center justify-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Logo size="auth" showText={false} />
            </div>
            <Logo size="auth" showText={true} className="justify-center" />
            <p className="text-gray-600 mt-2">Reset your password</p>
          </div>

          {/* Back Button */}
          <button
            onClick={() => onToggleView('login')}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </button>

          {/* Forgot Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Forgot your password?</h2>
              <p className="text-gray-600 text-sm">
                No worries! Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all ${
                    validationError ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Enter your email address"
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              {validationError && (
                <p className="text-red-600 text-sm mt-1">{validationError}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:shadow-lg transform hover:scale-[1.02] disabled:from-gray-400 disabled:to-gray-500 disabled:transform-none disabled:shadow-none transition-all font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending reset link...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Send Reset Link
                </>
              )}
            </button>

            {/* Register Link */}
            <div className="text-center">
              <span className="text-gray-600 text-sm">Don't have an account? </span>
              <button
                type="button"
                onClick={() => onToggleView('register')}
                className="text-teal-600 hover:text-teal-700 font-medium text-sm"
              >
                Sign up
              </button>
            </div>
          </form>

          {/* Demo Emails */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">Demo Emails</h3>
            <div className="space-y-2">
              {demoEmails.map((demoEmail, index) => (
                <button
                  key={index}
                  onClick={() => setEmail(demoEmail)}
                  className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{demoEmail}</p>
                      <p className="text-gray-600 text-xs">Click to use this email</p>
                    </div>
                    <Mail className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Feature Showcase */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 items-center justify-center p-8">
        <div className="text-center text-white max-w-md">
          <div className="mb-8">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Secure Account Recovery</h2>
            <p className="text-white/80 text-lg leading-relaxed">
              We take security seriously. Our password reset process ensures your account remains protected while giving you quick access.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Secure Process</h3>
                <p className="text-white/70 text-sm">Encrypted reset links for safety</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Quick Recovery</h3>
                <p className="text-white/70 text-sm">Reset link sent instantly</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">24/7 Support</h3>
                <p className="text-white/70 text-sm">Help when you need it</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;