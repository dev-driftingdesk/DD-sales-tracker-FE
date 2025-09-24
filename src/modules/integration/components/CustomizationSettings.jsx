import React, { useState, useEffect } from 'react';
import { 
  Palette, Upload, Save, RotateCcw, Eye, 
  Type, Droplet, Building, Check 
} from 'lucide-react';
import useIntegrationStore from '../stores/integrationStore';
import { THEME_OPTIONS } from '../constants/integrationTypes';

const CustomizationSettings = () => {
  const { themeSettings, updateThemeSettings } = useIntegrationStore();
  const [localSettings, setLocalSettings] = useState(themeSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  
  useEffect(() => {
    setHasChanges(JSON.stringify(localSettings) !== JSON.stringify(themeSettings));
  }, [localSettings, themeSettings]);
  
  const handleColorChange = (type, value) => {
    setLocalSettings(prev => ({ ...prev, [type]: value }));
  };
  
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSettings(prev => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSave = () => {
    updateThemeSettings(localSettings);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
    
    // Apply theme changes to root
    document.documentElement.style.setProperty('--primary-color', localSettings.primaryColor);
    document.documentElement.style.setProperty('--dark-color', localSettings.darkColor);
  };
  
  const handleReset = () => {
    const defaultSettings = {
      primaryColor: '#0D9488',
      darkColor: '#111827',
      logo: null,
      companyName: 'Sales Tracker',
      fontHeading: 'Inter',
      fontBody: 'Inter'
    };
    setLocalSettings(defaultSettings);
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Customization Settings</h2>
          <p className="text-sm text-gray-600 mt-1">
            Customize the appearance and branding of your CRM
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              previewMode 
                ? 'bg-teal-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Eye className="w-4 h-4" />
            {previewMode ? 'Previewing' : 'Preview'}
          </button>
          {hasChanges && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          )}
        </div>
      </div>
      
      {savedMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-800">Theme settings saved successfully!</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-6">
        {/* Branding Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-gray-400" />
            Branding
          </h3>
          
          <div className="space-y-4">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={localSettings.companyName}
                onChange={(e) => setLocalSettings({ ...localSettings, companyName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
              />
            </div>
            
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Logo
              </label>
              <div className="flex items-center gap-4">
                {localSettings.logo ? (
                  <img 
                    src={localSettings.logo} 
                    alt="Company Logo" 
                    className="w-20 h-20 object-contain bg-gray-50 rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg cursor-pointer transition-colors inline-block"
                  >
                    Upload Logo
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Colors Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Droplet className="w-5 h-5 text-gray-400" />
            Colors
          </h3>
          
          <div className="space-y-4">
            {/* Primary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {THEME_OPTIONS.colors.primary.map(color => (
                  <button
                    key={color.value}
                    onClick={() => handleColorChange('primaryColor', color.value)}
                    className={`relative h-10 rounded-lg transition-all ${
                      localSettings.primaryColor === color.value 
                        ? 'ring-2 ring-offset-2 ring-gray-900' 
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {localSettings.primaryColor === color.value && (
                      <Check className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </button>
                ))}
              </div>
              <input
                type="color"
                value={localSettings.primaryColor}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                className="mt-2 w-full h-10 rounded cursor-pointer"
              />
            </div>
            
            {/* Dark Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dark Theme Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {THEME_OPTIONS.colors.dark.map(color => (
                  <button
                    key={color.value}
                    onClick={() => handleColorChange('darkColor', color.value)}
                    className={`relative h-10 rounded-lg transition-all ${
                      localSettings.darkColor === color.value 
                        ? 'ring-2 ring-offset-2 ring-gray-900' 
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {localSettings.darkColor === color.value && (
                      <Check className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Typography Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Type className="w-5 h-5 text-gray-400" />
            Typography
          </h3>
          
          <div className="space-y-4">
            {/* Heading Font */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heading Font
              </label>
              <select
                value={localSettings.fontHeading}
                onChange={(e) => setLocalSettings({ ...localSettings, fontHeading: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
              >
                {THEME_OPTIONS.fonts.heading.map(font => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Body Font */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body Font
              </label>
              <select
                value={localSettings.fontBody}
                onChange={(e) => setLocalSettings({ ...localSettings, fontBody: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
              >
                {THEME_OPTIONS.fonts.body.map(font => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Preview Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4">Preview</h3>
          
          <div 
            className="p-4 rounded-lg border-2 border-dashed border-gray-200"
            style={{ 
              borderColor: localSettings.primaryColor,
              fontFamily: localSettings.fontBody 
            }}
          >
            {/* Preview Header */}
            <div 
              className="flex items-center gap-3 mb-4 p-3 rounded"
              style={{ backgroundColor: localSettings.darkColor }}
            >
              {localSettings.logo ? (
                <img src={localSettings.logo} alt="Logo" className="w-8 h-8 object-contain" />
              ) : (
                <div className="w-8 h-8 bg-white rounded" />
              )}
              <h4 
                className="text-white font-semibold"
                style={{ fontFamily: localSettings.fontHeading }}
              >
                {localSettings.companyName}
              </h4>
            </div>
            
            {/* Preview Content */}
            <div className="space-y-2">
              <button
                className="w-full py-2 px-4 text-white rounded transition-colors"
                style={{ backgroundColor: localSettings.primaryColor }}
              >
                Primary Button
              </button>
              <p className="text-sm text-gray-600">
                This is how your CRM will look with these settings.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reset Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default CustomizationSettings;