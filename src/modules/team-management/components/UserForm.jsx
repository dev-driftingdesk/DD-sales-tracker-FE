import React, { useState, useEffect } from 'react';
import { 
  X, Save, User, Mail, Phone, MapPin, Package, 
  Shield, Users, Check, AlertCircle, Eye, EyeOff,
  Briefcase, Crown
} from 'lucide-react';
import useTeamManagementStore from '../stores/teamManagementStore';
import { 
  USER_ROLES, 
  ROLE_LABELS, 
  REGIONS, 
  REGION_LABELS, 
  PRODUCT_CATEGORIES, 
  PRODUCT_LABELS 
} from '../constants';

const UserForm = ({ user, onClose }) => {
  const { createUser, updateUser, users, teams } = useTeamManagementStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: USER_ROLES.SALES_REP,
    manager: '',
    teams: [],
    regions: [],
    products: [],
    commissionPercentage: 0
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || USER_ROLES.SALES_REP,
        manager: user.manager || '',
        teams: user.teams || [],
        regions: user.regions || [],
        products: user.products || [],
        commissionPercentage: user.commissionPercentage || 0
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    } else {
      // Check for duplicate email
      const existingUser = users.find(u => 
        u.email === formData.email && u.id !== user?.id
      );
      if (existingUser) {
        newErrors.email = 'Email already exists';
      }
    }

    if (formData.phone && !/^\+?\d{10,15}$/.test(formData.phone.replace(/[-\s()]/g, ''))) {
      newErrors.phone = 'Invalid phone number format';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (formData.regions.length === 0) {
      newErrors.regions = 'At least one region is required';
    }

    if (formData.products.length === 0) {
      newErrors.products = 'At least one product category is required';
    }

    // Validate commission percentage for sales reps
    if (formData.role === USER_ROLES.SALES_REP) {
      const commission = parseFloat(formData.commissionPercentage);
      if (isNaN(commission)) {
        newErrors.commissionPercentage = 'Commission percentage must be a valid number';
      } else if (commission < 0) {
        newErrors.commissionPercentage = 'Commission percentage cannot be negative';
      } else if (commission > 100) {
        newErrors.commissionPercentage = 'Commission percentage cannot exceed 100%';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (user) {
        updateUser(user.id, formData);
      } else {
        createUser(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      setErrors({ submit: 'Failed to save user. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleArrayToggle = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const potentialManagers = users.filter(u => 
    [USER_ROLES.ADMIN, USER_ROLES.MANAGER].includes(u.role) && 
    u.id !== user?.id
  );

  const getRoleIcon = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return Shield;
      case USER_ROLES.MANAGER:
        return Crown;
      case USER_ROLES.SALES_REP:
        return Briefcase;
      default:
        return User;
    }
  };

  const RoleIcon = getRoleIcon(formData.role);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {user ? 'Edit User' : 'Add New User'}
                </h2>
                <p className="text-white/80 text-sm">
                  {user ? 'Update user information and permissions' : 'Create a new team member'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Basic Information */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              Basic Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Enter email address"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all ${
                      errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="+1-555-0123"
                  />
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <div className="relative">
                  <select
                    value={formData.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all appearance-none ${
                      errors.role ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <RoleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                {errors.role && (
                  <p className="text-red-600 text-sm mt-1">{errors.role}</p>
                )}
              </div>

              {/* Commission Percentage */}
              {formData.role === USER_ROLES.SALES_REP && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commission Percentage *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.commissionPercentage}
                      onChange={(e) => handleChange('commissionPercentage', e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all ${
                        errors.commissionPercentage ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="e.g., 5.5"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 flex items-center justify-center">
                      <span className="text-sm font-medium">%</span>
                    </div>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                      %
                    </div>
                  </div>
                  {errors.commissionPercentage && (
                    <p className="text-red-600 text-sm mt-1">{errors.commissionPercentage}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Enter the commission percentage this sales rep will earn on closed deals (0-100%)
                  </p>
                </div>
              )}
            </div>

            {/* Manager Selection */}
            {formData.role !== USER_ROLES.ADMIN && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manager
                </label>
                <select
                  value={formData.manager}
                  onChange={(e) => handleChange('manager', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                >
                  <option value="">Select a manager</option>
                  {potentialManagers.map(manager => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name} ({ROLE_LABELS[manager.role]})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Team Assignment */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              Team Assignment
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teams
              </label>
              <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-2">
                {teams.map(team => {
                  const isSelected = formData.teams.includes(team.id);
                  return (
                    <label 
                      key={team.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-teal-50 border-teal-300 ring-1 ring-teal-300' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleArrayToggle('teams', team.id)}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-600"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{team.name}</span>
                        <span className="text-xs text-gray-500 block">
                          {team.members?.length || 0} members
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Regional Access */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              Regional Access
              <span className="text-red-500">*</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(REGION_LABELS).map(([value, label]) => {
                const isSelected = formData.regions.includes(value);
                return (
                  <label 
                    key={value} 
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleArrayToggle('regions', value)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-600"
                    />
                    <span className="font-medium text-gray-900">{label}</span>
                  </label>
                );
              })}
            </div>
            {errors.regions && (
              <p className="text-red-600 text-sm">{errors.regions}</p>
            )}
          </div>

          {/* Product Access */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              Product Access
              <span className="text-red-500">*</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(PRODUCT_LABELS).map(([value, label]) => {
                const isSelected = formData.products.includes(value);
                return (
                  <label 
                    key={value} 
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-green-50 border-green-300 ring-1 ring-green-300' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleArrayToggle('products', value)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-600"
                    />
                    <span className="font-medium text-gray-900">{label}</span>
                  </label>
                );
              })}
            </div>
            {errors.products && (
              <p className="text-red-600 text-sm">{errors.products}</p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transform hover:scale-[1.02] disabled:from-gray-400 disabled:to-gray-500 disabled:transform-none disabled:shadow-none transition-all font-medium"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {user ? 'Update User' : 'Create User'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;