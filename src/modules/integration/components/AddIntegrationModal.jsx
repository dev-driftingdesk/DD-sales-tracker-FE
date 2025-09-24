import React, { useState } from 'react';
import { X, ArrowRight, Check, Info } from 'lucide-react';
import useIntegrationStore from '../stores/integrationStore';
import { INTEGRATION_TYPES, INTEGRATION_CONFIGS } from '../constants/integrationTypes';

const AddIntegrationModal = ({ onClose }) => {
  const { addIntegration } = useIntegrationStore();
  const [step, setStep] = useState(1); // 1: Select type, 2: Configure
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  
  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setStep(2);
    
    // Initialize form data for the selected integration
    const config = INTEGRATION_CONFIGS[type];
    const initialData = {};
    config.fields.forEach(field => {
      initialData[field.key] = '';
    });
    setFormData(initialData);
  };
  
  const handleFieldChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };
  
  const validateForm = () => {
    const config = INTEGRATION_CONFIGS[selectedType];
    const newErrors = {};
    
    config.fields.forEach(field => {
      if (field.required && !formData[field.key]) {
        newErrors[field.key] = `${field.label} is required`;
      }
      
      // Type-specific validation
      if (field.type === 'email' && formData[field.key]) {
        if (!/\S+@\S+\.\S+/.test(formData[field.key])) {
          newErrors[field.key] = 'Invalid email address';
        }
      }
      
      if (field.type === 'url' && formData[field.key]) {
        try {
          new URL(formData[field.key]);
        } catch {
          newErrors[field.key] = 'Invalid URL';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const integration = {
        type: selectedType,
        config: formData,
        name: INTEGRATION_CONFIGS[selectedType].name
      };
      
      addIntegration(integration);
      onClose();
    }
  };
  
  const renderField = (field) => {
    const commonProps = {
      id: field.key,
      name: field.key,
      value: formData[field.key] || '',
      onChange: (e) => handleFieldChange(field.key, e.target.value),
      className: `w-full px-4 py-3 border rounded-lg text-sm outline-none transition-all duration-200 ${
        errors[field.key]
          ? 'border-red-500 focus:ring-2 focus:ring-red-500'
          : 'border-gray-300 focus:ring-2 focus:ring-teal-600 focus:border-teal-600'
      }`,
      placeholder: `Enter ${field.label.toLowerCase()}`
    };
    
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
            className={`${commonProps.className} resize-none`}
          />
        );
      
      case 'password':
        return (
          <input
            {...commonProps}
            type="password"
            autoComplete="new-password"
          />
        );
      
      default:
        return (
          <input
            {...commonProps}
            type={field.type || 'text'}
          />
        );
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {step === 1 ? 'Add Integration' : `Configure ${INTEGRATION_CONFIGS[selectedType]?.name}`}
              </h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-6 py-6">
            {step === 1 ? (
              <div>
                <p className="text-sm text-gray-600 mb-6">
                  Choose an integration to connect and start importing leads automatically
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(INTEGRATION_CONFIGS).map(([type, config]) => (
                    <button
                      key={type}
                      onClick={() => handleTypeSelect(type)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-teal-600 hover:shadow-md transition-all text-left group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 ${config.color} rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0`}>
                          {config.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 group-hover:text-teal-600 transition-colors">
                            {config.name}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {config.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {config.features.slice(0, 2).map((feature, index) => (
                              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 ${INTEGRATION_CONFIGS[selectedType].color} rounded-lg flex items-center justify-center text-white text-xl`}>
                      {INTEGRATION_CONFIGS[selectedType].icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{INTEGRATION_CONFIGS[selectedType].name}</h4>
                      <p className="text-sm text-gray-600">{INTEGRATION_CONFIGS[selectedType].description}</p>
                    </div>
                  </div>
                  
                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Before you continue:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Make sure you have admin access to your {INTEGRATION_CONFIGS[selectedType].name} account</li>
                          <li>Keep your API credentials handy</li>
                          <li>Test the integration after setup</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {/* Form Fields */}
                  <div className="space-y-4">
                    {INTEGRATION_CONFIGS[selectedType].fields.map(field => (
                      <div key={field.key}>
                        <label htmlFor={field.key} className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {renderField(field)}
                        {errors[field.key] && (
                          <p className="mt-1 text-xs text-red-500">{errors[field.key]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 font-medium rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Connect Integration
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddIntegrationModal;