import React, { useState } from 'react';
import { X, Mail, Send, Copy, CheckCircle } from 'lucide-react';
import useTeamManagementStore from '../stores/teamManagementStore';
import { 
  USER_ROLES, 
  ROLE_LABELS, 
  REGIONS, 
  REGION_LABELS, 
  PRODUCT_CATEGORIES, 
  PRODUCT_LABELS 
} from '../constants';

const InviteUser = ({ onClose }) => {
  const { createInvitation, teams } = useTeamManagementStore();
  
  const [formData, setFormData] = useState({
    email: '',
    role: USER_ROLES.SALES_REP,
    teams: [],
    regions: [],
    products: [],
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitationSent, setInvitationSent] = useState(false);
  const [invitationLink, setInvitationLink] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const invitation = createInvitation(formData);
      
      // Generate invitation link (in real app, this would be a proper URL)
      const inviteLink = `${window.location.origin}/invite/${invitation.id}`;
      setInvitationLink(inviteLink);
      setInvitationSent(true);
      
    } catch (error) {
      console.error('Error sending invitation:', error);
      setErrors({ submit: 'Failed to send invitation. Please try again.' });
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

  const copyInvitationLink = () => {
    navigator.clipboard.writeText(invitationLink);
    // Could add a toast notification here
  };

  if (invitationSent) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Invitation Sent!
            </h2>
            
            <p className="text-gray-600 mb-6">
              An invitation has been sent to <strong>{formData.email}</strong>
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invitation Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={invitationLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={copyInvitationLink}
                  className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                  title="Copy link"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Invite User
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none ${
                  errors.role ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {errors.role && (
                <p className="text-red-600 text-sm mt-1">{errors.role}</p>
              )}
            </div>
          </div>

          {/* Team Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Team Assignment</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teams (Optional)
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {teams.map(team => (
                  <label key={team.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.teams.includes(team.id)}
                      onChange={() => handleArrayToggle('teams', team.id)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-600"
                    />
                    <span className="text-sm text-gray-700">{team.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Regional Access */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Regional Access *</h3>
            
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
            <h3 className="text-lg font-medium text-gray-900">Product Access *</h3>
            
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

          {/* Custom Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Message (Optional)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none resize-none"
              placeholder="Add a personal message to the invitation..."
            />
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
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteUser;