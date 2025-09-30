import React, { useState, useEffect } from 'react';
import { 
  Lock, ArrowLeft, Loader2, AlertCircle, CheckCircle, 
  Eye, EyeOff, Shield, Key, Check, X
} from 'lucide-react';
import authService from '../../../services/auth/authService';
import { validatePasswordStrength } from '../utils/urlUtils';
import Logo from '../../../components/Logo';

const ResetPassword = ({ token, email, onToggleView, onSuccess }) => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordValidation, setPasswordValidation] = useState(null);

  // Validate password strength on password change
  useEffect(() => {
    if (formData.newPassword) {
      const validation = validatePasswordStrength(formData.newPassword);
      setPasswordValidation(validation);
    } else {
      setPasswordValidation(null);
    }
  }, [formData.newPassword]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation errors
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (error) setError('');
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.newPassword) {
      errors.newPassword = 'New password is required';
    } else {
      const validation = validatePasswordStrength(formData.newPassword);
      if (!validation.isValid) {
        errors.newPassword = validation.messages[0];
      }
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await authService.confirmPasswordReset(
        email, 
        formData.newPassword, 
        token
      );
      
      if (result.success) {
        setIsSuccess(true);
        // Auto redirect to login after 3 seconds
        setTimeout(() => {
          onToggleView('login');
        }, 3000);
      } else {
        setError(result.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message || 'An error occurred while resetting your password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h1>
            <p className="text-gray-600 mb-6">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>

            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-800 text-sm">
                  Redirecting to sign in page in a few seconds...
                </p>
              </div>
            </div>

            {/* Manual Login Button */}
            <button
              onClick={() => onToggleView('login')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all font-medium"
            >
              <Lock className="w-5 h-5" />
              Sign In Now
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

          {/* Reset Password Form */}
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
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Create New Password</h2>
              <p className="text-gray-600 text-sm">
                Please enter a new password for your account: <span className="font-medium">{email}</span>
              </p>
            </div>

            {/* New Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className={`w-full pl-12 pr-12 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all ${
                    validationErrors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Enter your new password"
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.newPassword && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.newPassword}</p>
              )}
              
              {/* Password Strength Indicator */}
              {passwordValidation && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                  <div className="space-y-1">
                    {[
                      { key: 'minLength', label: 'At least 8 characters' },
                      { key: 'hasUppercase', label: 'One uppercase letter' },
                      { key: 'hasLowercase', label: 'One lowercase letter' },
                      { key: 'hasNumber', label: 'One number' },
                      { key: 'hasSpecialChar', label: 'One special character' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-2">
                        {passwordValidation.requirements[key] ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`text-xs ${
                          passwordValidation.requirements[key] ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full pl-12 pr-12 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all ${
                    validationErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Confirm your new password"
                />
                <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !passwordValidation?.isValid}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:shadow-lg transform hover:scale-[1.02] disabled:from-gray-400 disabled:to-gray-500 disabled:transform-none disabled:shadow-none transition-all font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Reset Password
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right Side - Feature Showcase */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 items-center justify-center p-8">
        <div className="text-center text-white max-w-md">
          <div className="mb-8">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Secure Password Reset</h2>
            <p className="text-white/80 text-lg leading-relaxed">
              Create a strong password to keep your account secure. Your new password will be encrypted and stored safely.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Strong Security</h3>
                <p className="text-white/70 text-sm">Password requirements ensure security</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Encrypted Storage</h3>
                <p className="text-white/70 text-sm">Your password is safely encrypted</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Instant Access</h3>
                <p className="text-white/70 text-sm">Sign in immediately after reset</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;