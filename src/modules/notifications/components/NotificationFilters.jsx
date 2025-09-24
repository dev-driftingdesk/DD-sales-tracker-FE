import React from 'react';
import { X, Filter, Calendar, Tag, Flag, Eye } from 'lucide-react';
import useNotificationStore from '../stores/notificationStore';
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_CATEGORY_LABELS,
  NOTIFICATION_PRIORITY_LABELS
} from '../constants';

const NotificationFilters = ({ onClose }) => {
  const { filters, setFilters, clearFilters } = useNotificationStore();

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' }
  ];

  const readStatusOptions = [
    { value: null, label: 'All' },
    { value: false, label: 'Unread Only' },
    { value: true, label: 'Read Only' }
  ];

  const handleFilterChange = (filterType, value) => {
    setFilters({ [filterType]: value });
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== null && v !== '' && v !== 'all').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filter Notifications
        </h3>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Clear all ({activeFiltersCount})
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
          >
            <option value="">All Categories</option>
            {Object.entries(NOTIFICATION_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Flag className="w-4 h-4" />
            Priority
          </label>
          <select
            value={filters.priority || ''}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
          >
            <option value="">All Priorities</option>
            {Object.entries(NOTIFICATION_PRIORITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Read Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Status
          </label>
          <select
            value={filters.read === null ? 'null' : filters.read.toString()}
            onChange={(e) => {
              const value = e.target.value === 'null' ? null : e.target.value === 'true';
              handleFilterChange('read', value);
            }}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
          >
            {readStatusOptions.map(option => (
              <option key={option.label} value={option.value === null ? 'null' : option.value.toString()}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date Range
          </label>
          <select
            value={filters.dateRange || 'all'}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
          {filters.category && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
              Category: {NOTIFICATION_CATEGORY_LABELS[filters.category]}
              <button
                onClick={() => handleFilterChange('category', '')}
                className="ml-1 hover:text-teal-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.priority && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
              Priority: {NOTIFICATION_PRIORITY_LABELS[filters.priority]}
              <button
                onClick={() => handleFilterChange('priority', '')}
                className="ml-1 hover:text-orange-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.read !== null && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              Status: {filters.read ? 'Read' : 'Unread'}
              <button
                onClick={() => handleFilterChange('read', null)}
                className="ml-1 hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.dateRange && filters.dateRange !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              Date: {dateRangeOptions.find(opt => opt.value === filters.dateRange)?.label}
              <button
                onClick={() => handleFilterChange('dateRange', 'all')}
                className="ml-1 hover:text-purple-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationFilters;