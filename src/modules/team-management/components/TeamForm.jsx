import React, { useState, useEffect } from 'react';
import { X, Save, Users, MapPin, Package, Crown } from 'lucide-react';
import useTeamManagementStore from '../stores/teamManagementStore';
import { 
  TEAM_TYPES, 
  TEAM_TYPE_LABELS, 
  REGIONS, 
  REGION_LABELS, 
  PRODUCT_CATEGORIES, 
  PRODUCT_LABELS,
  USER_ROLES
} from '../constants';

const TeamForm = ({ team, onClose }) => {
  const { createTeam, updateTeam, users, getUsersByTeam } = useTeamManagementStore();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: TEAM_TYPES.CUSTOM,
    manager: '',
    members: [],
    regions: [],
    products: []
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || '',
        description: team.description || '',
        type: team.type || TEAM_TYPES.CUSTOM,
        manager: team.manager || '',
        members: team.members || [],
        regions: team.regions || [],
        products: team.products || []
      });
    }
  }, [team]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Team type is required';
    }

    if (formData.regions.length === 0) {
      newErrors.regions = 'At least one region is required';
    }

    if (formData.products.length === 0) {
      newErrors.products = 'At least one product category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (team) {
        updateTeam(team.id, formData);
      } else {
        createTeam(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving team:', error);
      setErrors({ submit: 'Failed to save team. Please try again.' });
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

  const handleMemberToggle = (userId) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId]
    }));
  };

  const potentialManagers = users.filter(user => 
    [USER_ROLES.ADMIN, USER_ROLES.MANAGER].includes(user.role)
  );

  const availableUsers = users.filter(user => 
    user.role === USER_ROLES.SALES_REP || 
    [USER_ROLES.ADMIN, USER_ROLES.MANAGER].includes(user.role)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {team ? 'Edit Team' : 'Create New Team'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Basic Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter team name"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none ${
                    errors.type ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  {Object.entries(TEAM_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {errors.type && (
                  <p className="text-red-600 text-sm mt-1">{errors.type}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none resize-none"
                placeholder="Enter team description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Team Manager
              </label>
              <select
                value={formData.manager}
                onChange={(e) => handleChange('manager', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
              >
                <option value="">Select a manager</option>
                {potentialManagers.map(manager => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name} ({manager.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Team Members */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
            
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
              <div className="p-4 space-y-2">
                {availableUsers.map(user => (
                  <label key={user.id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={formData.members.includes(user.id)}
                      onChange={() => handleMemberToggle(user.id)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-600"
                    />
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                      <span className="text-teal-600 font-medium text-sm">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.email} • {user.role}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            <p className="text-sm text-gray-600">
              {formData.members.length} member(s) selected
            </p>
          </div>

          {/* Regional Access */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Regional Access *
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(REGION_LABELS).map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.regions.includes(value)}
                    onChange={() => handleArrayToggle('regions', value)}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-600"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
            {errors.regions && (
              <p className="text-red-600 text-sm">{errors.regions}</p>
            )}
          </div>

          {/* Product Access */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Product Access *
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PRODUCT_LABELS).map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.products.includes(value)}
                    onChange={() => handleArrayToggle('products', value)}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-600"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
            {errors.products && (
              <p className="text-red-600 text-sm">{errors.products}</p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : (team ? 'Update Team' : 'Create Team')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamForm;