import React, { useState, useEffect } from 'react';
import { X, Plus, Upload, FileText, Package } from 'lucide-react';
import useLeadStore from '../stores/leadStore';
import { LEAD_SOURCES, LEAD_SOURCE_LABELS, LEAD_STATUSES } from '../constants/index';
import useRoutingStore from '../../routing/stores/routingStore';
import useCRMStore from '../../crm-core/stores/crmStore';
import useUserStore from '../../../stores/userStore';

const LeadCaptureForm = ({ onClose }) => {
  const { addLead } = useLeadStore();
  const { products } = useCRMStore();
  const { users, getUsersByRole } = useUserStore();
  
  
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    location: '',
    source: LEAD_SOURCES.MANUAL,
    productInterest: '',
    productId: '', // Single product association
    additionalProductId: '', // Additional product association
    language: 'english',
    dealValue: '',
    notes: '',
    tags: [],
    teamMembers: [] // Array of team member objects {userId, role}
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Team member management functions
  const handleAddTeamMember = (userId, role = 'collaborator') => {
    if (!userId || formData.teamMembers.some(member => member.userId === userId)) return;
    
    setFormData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, { userId, role }]
    }));
  };

  const handleRemoveTeamMember = (userId) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(member => member.userId !== userId)
    }));
  };

  const handleUpdateTeamMemberRole = (userId, newRole) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map(member =>
        member.userId === userId ? { ...member, role: newRole } : member
      )
    }));
  };

  const getAvailableTeamMembers = () => {
    const currentTeamMembers = formData.teamMembers.map(member => member.userId);
    return users.filter(user => 
      user.role === 'sales_rep' && 
      user.isActive && 
      !currentTeamMembers.includes(user.id)
    );
  };


  const validate = () => {
    const newErrors = {};
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.contactName.trim()) newErrors.contactName = 'Contact name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const newLead = {
        ...formData,
        id: Date.now().toString(),
        dealValue: formData.dealValue ? parseFloat(formData.dealValue) : 0,
        status: LEAD_STATUSES.NEW,
        assignedTo: null,
        activities: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add lead to store
      const addedLead = addLead(newLead);
      
      // Process lead for routing
      setTimeout(() => {
        const processedLead = useRoutingStore.getState().processLeadForRouting(addedLead || newLead);
        console.log('New lead processed for routing:', processedLead);
      }, 100);
      
      onClose();
    }
  };

  const handleBulkImport = () => {
    // Placeholder for bulk import functionality
    alert('Bulk import feature coming soon!');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add New Lead</h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Content */}
            <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Source Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lead Source
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => (
                    <label
                      key={value}
                      className={`
                        flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer transition-all
                        ${formData.source === value 
                          ? 'border-teal-600 bg-teal-50 text-teal-600' 
                          : 'border-gray-300 hover:border-gray-400'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="source"
                        value={value}
                        checked={formData.source === value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bulk Import Option */}
              {formData.source === LEAD_SOURCES.EVENT && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Import from Spreadsheet</p>
                        <p className="text-xs text-gray-600">Upload CSV or Excel file with multiple leads</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleBulkImport}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Upload File
                    </button>
                  </div>
                </div>
              )}

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className={`
                      w-full px-4 py-3 border rounded-lg text-sm outline-none transition-all duration-200
                      ${errors.companyName 
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-2 focus:ring-teal-600 focus:border-teal-600'
                      }
                    `}
                    placeholder="Enter company name"
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-xs text-red-500">{errors.companyName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    className={`
                      w-full px-4 py-3 border rounded-lg text-sm outline-none transition-all duration-200
                      ${errors.contactName 
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-2 focus:ring-teal-600 focus:border-teal-600'
                      }
                    `}
                    placeholder="Enter contact name"
                  />
                  {errors.contactName && (
                    <p className="mt-1 text-xs text-red-500">{errors.contactName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`
                      w-full px-4 py-3 border rounded-lg text-sm outline-none transition-all duration-200
                      ${errors.email 
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-2 focus:ring-teal-600 focus:border-teal-600'
                      }
                    `}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`
                      w-full px-4 py-3 border rounded-lg text-sm outline-none transition-all duration-200
                      ${errors.phone 
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-2 focus:ring-teal-600 focus:border-teal-600'
                      }
                    `}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all duration-200"
                    placeholder="City, Country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language Preference
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all duration-200"
                  >
                    <option value="english">English</option>
                    <option value="arabic">Arabic</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="chinese">Chinese</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Interest
                  </label>
                  <input
                    type="text"
                    name="productInterest"
                    value={formData.productInterest}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all duration-200"
                    placeholder="e.g., Premium Tea Collection"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Deal Value
                  </label>
                  <input
                    type="number"
                    name="dealValue"
                    value={formData.dealValue}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all duration-200"
                    placeholder="e.g., 50000"
                  />
                </div>
              </div>

              {/* Single Product Selection */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Associated Product (Optional)
                  </div>
                </label>
                
                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all duration-200"
                >
                  <option value="">No product selected</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ${product.price ? product.price.toFixed(2) : 'N/A'}
                    </option>
                  ))}
                </select>
                
                <p className="mt-2 text-xs text-gray-500">
                  Select a product to associate with this lead for pipeline tracking
                </p>
              </div>

              {/* Additional Product Selection */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Additional Product (Optional)
                  </div>
                </label>
                
                <select
                  name="additionalProductId"
                  value={formData.additionalProductId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all duration-200"
                >
                  <option value="">No additional product selected</option>
                  {products.filter(product => product.category === 'additional-products').map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ${product.price ? product.price.toFixed(2) : 'N/A'}
                    </option>
                  ))}
                </select>
                
                <p className="mt-2 text-xs text-gray-500">
                  Select additional services like web hosting, logo design, or marketing tools
                </p>
              </div>

              {/* Team Collaboration */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Collaboration (Optional)
                </label>
                
                {/* Add Team Member */}
                <div className="flex gap-2 mb-3">
                  <select
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all duration-200"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddTeamMember(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">Add a sales rep to collaborate...</option>
                    {getAvailableTeamMembers().map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.location}) - {user.expertise.slice(0, 2).join(', ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Current Team Members */}
                {formData.teamMembers.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600 font-medium">Selected Team Members:</p>
                    {formData.teamMembers.map((member) => {
                      const user = users.find(u => u.id === member.userId);
                      if (!user) return null;
                      
                      return (
                        <div key={member.userId} className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <img 
                            src={user.avatar} 
                            alt={user.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-600">{user.location} • {user.expertise.slice(0, 2).join(', ')}</p>
                          </div>
                          <select
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                            value={member.role}
                            onChange={(e) => handleUpdateTeamMemberRole(member.userId, e.target.value)}
                          >
                            <option value="collaborator">Collaborator</option>
                            <option value="consultant">Consultant</option>
                            <option value="primary">Co-Primary</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRemoveTeamMember(member.userId)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <p className="mt-2 text-xs text-gray-500">
                  Add other sales reps to collaborate on this lead. They'll be able to view, edit, and add notes based on their role.
                </p>
              </div>

              {/* Tags */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all duration-200"
                    placeholder="Add tags (e.g., high-priority, wholesale)"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-teal-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all duration-200"
                  placeholder="Additional information about the lead..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 text-gray-700 hover:bg-gray-100 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
              >
                Add Lead
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeadCaptureForm;