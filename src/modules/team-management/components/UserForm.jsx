import React, { useState, useEffect } from 'react';
import { 
  X, Save, User, Mail, Phone, MapPin, Package, 
  Shield, Users, Check, AlertCircle, Eye, EyeOff,
  Briefcase, Crown, UserCheck
} from 'lucide-react';
import useTeamManagementStore from '../stores/teamManagementStore';
import useRoleBasedAccess from '../../../hooks/useRoleBasedAccess';
import { 
  USER_ROLES, 
  ROLE_LABELS, 
  REGIONS, 
  REGION_LABELS, 
  PRODUCT_CATEGORIES, 
  PRODUCT_LABELS 
} from '../constants';

const UserForm = ({ user, onClose }) => {
  const { createUser, updateUser, users, teams, assignManager } = useTeamManagementStore();
  const { canAccess, hasPermission, userRole, getValidationRules } = useRoleBasedAccess();
  
  const [formData, setFormData] = useState({
    // Enhanced fields
    firstName: '',
    lastName: '',
    username: '',
    phoneNumber: '',
    
    // Legacy fields for backward compatibility
    name: '',
    email: '',
    phone: '',
    role: USER_ROLES.SALES_REP,
    manager: '',
    managerId: '',
    teams: [],
    regions: [],
    products: [],
    commissionPercentage: 0,
    
    // Enhanced invitation message
    invitationMessage: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        // Enhanced fields
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
        username: user.username || user.email?.split('@')[0] || '',
        phoneNumber: user.phoneNumber || user.phone || '',
        
        // Legacy fields for backward compatibility
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || '',
        phone: user.phone || user.phoneNumber || '',
        role: user.role || USER_ROLES.SALES_REP,
        manager: user.manager || '',
        managerId: user.managerId || user.manager || '',
        teams: user.teams || [],
        regions: user.regions || [],
        products: user.products || [],
        commissionPercentage: user.commissionPercentage || 0,
        
        // Enhanced invitation message (only for new users)
        invitationMessage: ''
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    const validationRules = getValidationRules('user_form');

    // Enhanced field validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Legacy name field for backward compatibility
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    if (!fullName) {
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

    // Phone number validation
    const phoneNumber = formData.phoneNumber || formData.phone;
    if (phoneNumber && !/^\+?\d{10,15}$/.test(phoneNumber.replace(/[-\s()]/g, ''))) {
      newErrors.phoneNumber = 'Invalid phone number format';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    // Role-based validation
    if (validationRules.canAssignRole && formData.role) {
      // Check if user can assign this role based on their own role
      const roleHierarchy = {
        [USER_ROLES.ADMIN]: 3,
        [USER_ROLES.MANAGER]: 2,
        [USER_ROLES.SALES_REP]: 1
      };
      
      const userLevel = roleHierarchy[userRole] || 0;
      const assigningLevel = roleHierarchy[formData.role] || 0;
      
      if (assigningLevel > userLevel) {
        newErrors.role = `You cannot assign a role higher than your own (${userRole})`;
      }
    }

    // Manager assignment validation
    if (formData.managerId && !validationRules.canAssignManager) {
      newErrors.managerId = 'You do not have permission to assign managers';
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
      // Prepare enhanced user data
      const enhancedUserData = {
        // Enhanced fields
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        phoneNumber: formData.phoneNumber,
        
        // Legacy fields for backward compatibility
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phoneNumber || formData.phone,
        role: formData.role,
        managerId: formData.managerId || formData.manager,
        teams: formData.teams,
        regions: formData.regions,
        products: formData.products,
        commissionPercentage: formData.commissionPercentage,
        
        // Enhanced invitation message for new users
        invitationMessage: formData.invitationMessage || 
          `Welcome to our team! You've been invited to join as a ${ROLE_LABELS[formData.role]}.`
      };

      if (user) {
        // Update existing user
        await updateUser(user.id, enhancedUserData);
        
        // If manager is being assigned and user has permission
        if (enhancedUserData.managerId && enhancedUserData.managerId !== user.managerId && canAccess('assign_manager_dropdown')) {
          await assignManager(user.id, enhancedUserData.managerId);
        }
        
        onClose();
      } else {
        // For new users, an invitation is sent instead of direct creation
        console.log('🔐 Enhanced UserForm - Creating user with enhanced data:', enhancedUserData);
        
        const result = await createUser(enhancedUserData);
        
        if (result.type === 'invitation_sent') {
          // Show success message about invitation
          alert(`✅ ${result.message}`);
          onClose();
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      
      // Check if we're still authenticated after the error
      const tokenStillPresent = !!(localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token'));
      console.log('🔍 [UserForm] After error - Auth token still present:', tokenStillPresent);
      
      // Add a small delay and check again
      setTimeout(() => {
        const tokenAfterDelay = !!(localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token'));
        console.log('🔍 [UserForm] After 100ms delay - Auth token still present:', tokenAfterDelay);
        if (!tokenAfterDelay) {
          console.log('⚠️ [UserForm] Token was removed after the error - logout happened asynchronously!');
        }
      }, 100);
      
      let errorMessage = 'Failed to save user. Please try again.';
      
      // Enhanced error handling
      if (error.message.includes('Access denied')) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (error.message.includes('Admin role')) {
        errorMessage = 'Only administrators can perform this action.';
      } else if (error.message.includes('Manager role')) {
        errorMessage = 'Only managers and administrators can perform this action.';
      }
      
      setErrors({ submit: errorMessage });
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
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  {user ? 'Edit User' : 'Invite New User'}
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-lg font-normal">
                    Enhanced API
                  </span>
                </h2>
                <p className="text-white/80 text-sm">
                  {user 
                    ? 'Update user information with role-based permissions' 
                    : 'Send an invitation with enhanced user fields and team assignments'
                  }
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                Basic Information
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-medium">
                  Enhanced Fields
                </span>
              </h3>
              
              {/* Role-based access indicator */}
              <div className="text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {userRole} Access
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => {
                    handleChange('firstName', e.target.value);
                    // Update legacy name field
                    handleChange('name', `${e.target.value} ${formData.lastName}`.trim());
                  }}
                  className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all ${
                    errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => {
                    handleChange('lastName', e.target.value);
                    // Update legacy name field
                    handleChange('name', `${formData.firstName} ${e.target.value}`.trim());
                  }}
                  className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all ${
                    errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all ${
                      errors.username ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Enter username"
                  />
                  <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {errors.username && (
                  <p className="text-red-600 text-sm mt-1">{errors.username}</p>
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
                    value={formData.phoneNumber}
                    onChange={(e) => {
                      handleChange('phoneNumber', e.target.value);
                      // Update legacy phone field
                      handleChange('phone', e.target.value);
                    }}
                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all ${
                      errors.phoneNumber ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="+1-555-0123"
                  />
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {errors.phoneNumber && (
                  <p className="text-red-600 text-sm mt-1">{errors.phoneNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  Role *
                  {!canAccess('manage_users_section') && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                      Restricted
                    </span>
                  )}
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

            {/* Manager Selection - Role-based visibility */}
            {formData.role !== USER_ROLES.ADMIN && canAccess('assign_manager_dropdown') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  Manager
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                    Authorized
                  </span>
                </label>
                <div className="relative">
                  <select
                    value={formData.managerId || formData.manager}
                    onChange={(e) => {
                      handleChange('managerId', e.target.value);
                      handleChange('manager', e.target.value); // Legacy compatibility
                    }}
                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all appearance-none ${
                      errors.managerId ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select a manager</option>
                    {potentialManagers.map(manager => (
                      <option key={manager.id} value={manager.id}>
                        {manager.name} ({ROLE_LABELS[manager.role]})
                      </option>
                    ))}
                  </select>
                  <Crown className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                {errors.managerId && (
                  <p className="text-red-600 text-sm mt-1">{errors.managerId}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Select a manager to supervise this user's activities and performance
                </p>
              </div>
            )}

            {/* Manager Assignment Not Available - Show when user doesn't have permission */}
            {formData.role !== USER_ROLES.ADMIN && !canAccess('assign_manager_dropdown') && (
              <div className="col-span-2">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">Manager Assignment</span>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                      Permission Required
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    You need {USER_ROLES.MANAGER} or {USER_ROLES.ADMIN} privileges to assign managers
                  </p>
                </div>
              </div>
            )}

            {/* Invitation Message - Only for new users */}
            {!user && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invitation Message
                </label>
                <div className="relative">
                  <textarea
                    value={formData.invitationMessage}
                    onChange={(e) => handleChange('invitationMessage', e.target.value)}
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all resize-none"
                    placeholder="Welcome to our team! You've been invited to join as a team member..."
                  />
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  This message will be included in the invitation email sent to the new user
                </p>
              </div>
            )}
          </div>

          {/* Team Assignment - Enhanced with multi-team support */}
          {canAccess('add_team_member_button') && (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                Team Assignment
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-lg font-medium">
                  Multi-Team Support
                </span>
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teams & Roles
                </label>
                <p className="text-gray-500 text-xs mb-4">
                  Select teams and assign specific roles for this user in each team
                </p>
                
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {teams.map(team => {
                    // Check if team is selected (support both simple array and enhanced format)
                    const isSelected = formData.teams.some(t => 
                      typeof t === 'string' ? t === team.id : t.teamId === team.id
                    );
                    
                    // Get current role for this team
                    const currentTeamRole = formData.teams.find(t => 
                      typeof t === 'object' && t.teamId === team.id
                    )?.role || 'SalesRep';
                    
                    return (
                      <div 
                        key={team.id} 
                        className={`p-4 rounded-lg border transition-all ${
                          isSelected 
                            ? 'bg-purple-50 border-purple-300 ring-1 ring-purple-300' 
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              const currentTeams = formData.teams;
                              if (isSelected) {
                                // Remove team (support both formats)
                                const newTeams = currentTeams.filter(t => 
                                  typeof t === 'string' ? t !== team.id : t.teamId !== team.id
                                );
                                handleChange('teams', newTeams);
                              } else {
                                // Add team with enhanced format
                                const newTeam = {
                                  teamId: team.id,
                                  teamName: team.name,
                                  role: 'SalesRep' // Default role
                                };
                                handleChange('teams', [...currentTeams, newTeam]);
                              }
                            }}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-600 mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium text-gray-900">{team.name}</span>
                                <span className="text-xs text-gray-500 block">
                                  {team.members?.length || 0} members
                                </span>
                              </div>
                              
                              {/* Role selector for selected teams */}
                              {isSelected && (
                                <div className="ml-4">
                                  <select
                                    value={currentTeamRole}
                                    onChange={(e) => {
                                      const newRole = e.target.value;
                                      const updatedTeams = formData.teams.map(t => {
                                        if (typeof t === 'object' && t.teamId === team.id) {
                                          return { ...t, role: newRole };
                                        } else if (typeof t === 'string' && t === team.id) {
                                          // Convert simple format to enhanced format
                                          return {
                                            teamId: team.id,
                                            teamName: team.name,
                                            role: newRole
                                          };
                                        }
                                        return t;
                                      });
                                      handleChange('teams', updatedTeams);
                                    }}
                                    className="text-xs px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-none bg-white"
                                  >
                                    <option value="SalesRep">Sales Rep</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Admin">Admin</option>
                                  </select>
                                </div>
                              )}
                            </div>
                            
                            {/* Team description or additional info */}
                            {team.description && (
                              <p className="text-xs text-gray-400 mt-1">
                                {team.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {formData.teams.length > 0 && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-purple-700 font-medium mb-1">
                      Selected Teams ({formData.teams.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.teams.map((team, index) => {
                        const teamName = typeof team === 'object' ? team.teamName : 
                          teams.find(t => t.id === team)?.name || 'Unknown Team';
                        const teamRole = typeof team === 'object' ? team.role : 'SalesRep';
                        
                        return (
                          <span key={index} className="text-xs bg-white px-2 py-1 rounded-lg border border-purple-200">
                            {teamName} ({teamRole})
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Team Assignment Not Available - Show when user doesn't have permission */}
          {!canAccess('add_team_member_button') && (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                    Team Assignment
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-lg font-medium">
                      Permission Required
                    </span>
                  </h3>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">Team Management Access Required</span>
                </div>
                <p className="text-xs text-gray-500">
                  You need {USER_ROLES.MANAGER} or {USER_ROLES.ADMIN} privileges to assign users to teams. 
                  Contact your administrator to request team assignment permissions.
                </p>
              </div>
            </div>
          )}

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
                  {user ? 'Update User' : 'Send Invitation'}
                  <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded ml-2">
                    Enhanced
                  </span>
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