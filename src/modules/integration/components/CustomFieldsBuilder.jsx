import React, { useState } from 'react';
import { 
  Plus, Type, Hash, Calendar, ToggleLeft, List, 
  Trash2, Edit2, Save, X, GripVertical, Check
} from 'lucide-react';
import useIntegrationStore from '../stores/integrationStore';

const FIELD_TYPES = {
  TEXT: { value: 'text', label: 'Text', icon: Type },
  NUMBER: { value: 'number', label: 'Number', icon: Hash },
  DATE: { value: 'date', label: 'Date', icon: Calendar },
  BOOLEAN: { value: 'boolean', label: 'Yes/No', icon: ToggleLeft },
  SELECT: { value: 'select', label: 'Dropdown', icon: List }
};

const CustomFieldsBuilder = () => {
  const { customFields, addCustomField, updateCustomField, deleteCustomField } = useIntegrationStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingField, setEditingField] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    type: 'text',
    required: false,
    defaultValue: '',
    options: [],
    description: ''
  });
  
  const [optionInput, setOptionInput] = useState('');
  
  const resetForm = () => {
    setFormData({
      name: '',
      label: '',
      type: 'text',
      required: false,
      defaultValue: '',
      options: [],
      description: ''
    });
    setOptionInput('');
    setEditingField(null);
  };
  
  const handleAddOption = () => {
    if (optionInput.trim() && !formData.options.includes(optionInput.trim())) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, optionInput.trim()]
      }));
      setOptionInput('');
    }
  };
  
  const handleRemoveOption = (option) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter(o => o !== option)
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.name && formData.label) {
      // Generate field name from label if not provided
      const fieldName = formData.name || formData.label.toLowerCase().replace(/\s+/g, '_');
      
      if (editingField) {
        updateCustomField(editingField.id, { ...formData, name: fieldName });
      } else {
        addCustomField({ ...formData, name: fieldName });
      }
      
      resetForm();
      setShowAddForm(false);
    }
  };
  
  const handleEdit = (field) => {
    setFormData({
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required || false,
      defaultValue: field.defaultValue || '',
      options: field.options || [],
      description: field.description || ''
    });
    setEditingField(field);
    setShowAddForm(true);
  };
  
  const getFieldIcon = (type) => {
    const fieldType = Object.values(FIELD_TYPES).find(ft => ft.value === type);
    return fieldType ? fieldType.icon : Type;
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Custom Fields</h2>
          <p className="text-sm text-gray-600 mt-1">
            Add custom fields to capture additional lead information
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Custom Field
        </button>
      </div>
      
      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="font-medium text-gray-900 mb-4">
            {editingField ? 'Edit Custom Field' : 'Create Custom Field'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              {/* Field Label */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Label *
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                  placeholder="e.g., Company Size"
                />
              </div>
              
              {/* Field Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                >
                  {Object.values(FIELD_TYPES).map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Field Name (Internal) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Name (Internal)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                  placeholder="Auto-generated from label"
                />
              </div>
              
              {/* Default Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Value
                </label>
                {formData.type === 'boolean' ? (
                  <select
                    value={formData.defaultValue}
                    onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                  >
                    <option value="">No default</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : (
                  <input
                    type={formData.type === 'number' ? 'number' : 'text'}
                    value={formData.defaultValue}
                    onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                    placeholder="Optional default value"
                  />
                )}
              </div>
              
              {/* Description */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none resize-none"
                  placeholder="Help text for this field"
                />
              </div>
              
              {/* Options for Select */}
              {formData.type === 'select' && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Options *
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                      placeholder="Add option"
                    />
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {formData.options.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.options.map((option, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm flex items-center gap-1"
                        >
                          {option}
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(option)}
                            className="hover:text-teal-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Required Checkbox */}
              <div className="col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.required}
                    onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-600"
                  />
                  <span className="text-sm text-gray-700">Make this field required</span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowAddForm(false);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.label || (formData.type === 'select' && formData.options.length === 0)}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingField ? 'Update Field' : 'Create Field'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Fields List */}
      {customFields.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Type className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No custom fields yet</h3>
          <p className="text-gray-600 mb-6">Add custom fields to capture more lead information</p>
        </div>
      ) : (
        <div className="space-y-4">
          {customFields.map(field => {
            const Icon = getFieldIcon(field.type);
            return (
              <div key={field.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{field.label}</h4>
                        {field.required && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Name: <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">{field.name}</code>
                        {field.description && ` • ${field.description}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(field)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => deleteCustomField(field.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Usage Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-1">How to use custom fields</h4>
        <p className="text-sm text-blue-800">
          Custom fields will appear in the lead capture form and lead profile. 
          You can also access them via the API using the field name.
        </p>
      </div>
    </div>
  );
};

export default CustomFieldsBuilder;