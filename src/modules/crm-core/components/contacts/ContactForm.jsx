import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import useCRMStore from '../../stores/crmStore';

export default function ContactForm({ onClose }) {
  const { addContact, companies, contactOperationLoading, contactOperationError } = useCRMStore();
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    company: '',
    companyId: '',
    address: '',
    tags: [],
    status: 'active',
    notes: ''
  });
  const [newTag, setNewTag] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous field errors
    setFieldErrors({});
    
    if (!formData.name || !formData.email) {
      alert('Name and email are required');
      return;
    }
    
    try {
      await addContact(formData);
      onClose();
    } catch (error) {
      // Enhanced error logging for debugging validation issues
      console.error('Failed to create contact:', {
        error: error,
        errorType: error.type,
        errorStatus: error.status,
        errorData: error.data,
        fieldErrors: error.data?.fieldErrors
      });
      
      // Extract field-specific errors if available
      if (error.data && error.data.fieldErrors) {
        // Map backend field names to frontend field names
        const mappedFieldErrors = {};
        Object.keys(error.data.fieldErrors).forEach(field => {
          // Handle phone field mapping (backend might use PhoneNumber, frontend uses phone)
          const frontendFieldName = field.toLowerCase() === 'phonenumber' ? 'phoneNumber' : field;
          mappedFieldErrors[frontendFieldName] = error.data.fieldErrors[field];
        });
        setFieldErrors(mappedFieldErrors);
      }
      
      // Show specific alert for authentication errors
      if (error.type === 'AUTHENTICATION_ERROR' || error.status === 401) {
        alert('Authentication required: Please log in to create contacts.');
      }
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleCompanyChange = (e) => {
    const companyName = e.target.value;
    const selectedCompany = companies.find(c => c.name === companyName);
    if (selectedCompany) {
      setFormData({
        ...formData,
        companyId: selectedCompany.id,
        company: selectedCompany.name
      });
    } else {
      setFormData({
        ...formData,
        companyId: '',
        company: companyName
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Add New Contact</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {contactOperationError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-red-800 font-medium mb-2">Error Creating Contact</h4>
              <p className="text-red-600 text-sm">{contactOperationError}</p>
              {Object.keys(fieldErrors).length > 0 && (
                <div className="mt-3">
                  <p className="text-red-700 text-xs font-medium mb-1">Field-specific errors:</p>
                  <ul className="text-red-600 text-xs space-y-1">
                    {Object.entries(fieldErrors).map(([field, errors]) => (
                      <li key={field}>
                        <strong>{field}:</strong> {Array.isArray(errors) ? errors.join(', ') : errors}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  (fieldErrors.name || fieldErrors.Name) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="John Doe"
                required
              />
              {(fieldErrors.name || fieldErrors.Name) && (
                <div className="mt-1 text-sm text-red-600">
                  {(fieldErrors.name || fieldErrors.Name)?.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  (fieldErrors.email || fieldErrors.Email) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="john@example.com"
                required
              />
              {(fieldErrors.email || fieldErrors.Email) && (
                <div className="mt-1 text-sm text-red-600">
                  {(fieldErrors.email || fieldErrors.Email)?.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  (fieldErrors.title || fieldErrors.Title) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Sales Manager"
              />
              {(fieldErrors.title || fieldErrors.Title) && (
                <div className="mt-1 text-sm text-red-600">
                  {(fieldErrors.title || fieldErrors.Title)?.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  (fieldErrors.phoneNumber || fieldErrors.phone || fieldErrors.Phone || fieldErrors.PhoneNumber) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="+1 (555) 123-4567"
              />
              {(fieldErrors.phoneNumber || fieldErrors.phone || fieldErrors.Phone || fieldErrors.PhoneNumber) && (
                <div className="mt-1 text-sm text-red-600">
                  {(fieldErrors.phoneNumber || fieldErrors.phone || fieldErrors.Phone || fieldErrors.PhoneNumber)?.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <input
                list="companies"
                value={formData.company}
                onChange={handleCompanyChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  (fieldErrors.company || fieldErrors.Company) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Select or type company name"
              />
              <datalist id="companies">
                {companies.map(company => (
                  <option key={company.id} value={company.name} />
                ))}
              </datalist>
              {(fieldErrors.company || fieldErrors.Company) && (
                <div className="mt-1 text-sm text-red-600">
                  {(fieldErrors.company || fieldErrors.Company)?.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="lead">Lead</option>
                <option value="customer">Customer</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="123 Main St, City, State 12345"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="p-0.5 hover:bg-gray-200 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Any additional notes..."
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={contactOperationLoading}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {contactOperationLoading ? 'Adding...' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}