import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import useAnalyticsStore from '../stores/analyticsStore';
import { DATE_RANGES, DATE_RANGE_LABELS } from '../constants';

const DateRangeSelector = () => {
  const { selectedDateRange, customDateRange, setDateRange, setCustomDateRange } = useAnalyticsStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState(customDateRange.start || '');
  const [customEnd, setCustomEnd] = useState(customDateRange.end || '');
  
  const handleRangeSelect = (range) => {
    if (range === DATE_RANGES.CUSTOM) {
      setShowCustom(true);
    } else {
      setDateRange(range);
      setShowDropdown(false);
      setShowCustom(false);
    }
  };
  
  const handleCustomApply = () => {
    if (customStart && customEnd) {
      setCustomDateRange(customStart, customEnd);
      setShowDropdown(false);
      setShowCustom(false);
    }
  };
  
  const formatCustomRange = () => {
    if (customDateRange.start && customDateRange.end) {
      const start = new Date(customDateRange.start).toLocaleDateString();
      const end = new Date(customDateRange.end).toLocaleDateString();
      return `${start} - ${end}`;
    }
    return 'Custom Range';
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 font-medium"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
          <Calendar className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm text-gray-700">
          {selectedDateRange === DATE_RANGES.CUSTOM 
            ? formatCustomRange() 
            : DATE_RANGE_LABELS[selectedDateRange]
          }
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 top-full mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-10 overflow-hidden">
          <div className="p-3">
            {Object.entries(DATE_RANGE_LABELS).map(([value, label]) => (
              <button
                key={value}
                onClick={() => handleRangeSelect(value)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedDateRange === value 
                    ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          
          {showCustom && (
            <div className="border-t border-gray-100 p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Custom Date Range</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowCustom(false);
                      setShowDropdown(false);
                    }}
                    className="flex-1 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCustomApply}
                    disabled={!customStart || !customEnd}
                    className="flex-1 px-3 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;