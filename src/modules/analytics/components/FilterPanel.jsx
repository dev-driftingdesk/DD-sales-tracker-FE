import React, { useState, useEffect } from 'react';
import { X, Check, ChevronDown } from 'lucide-react';
import useAnalyticsStore from '../stores/analyticsStore';
import useUserStore from '../../../stores/userStore';
import useTeamStore from '../../../stores/teamStore';
import useLeadStore from '../../leads/stores/leadStore';

const FilterPanel = ({ onClose }) => {
  const {
    selectedTeams,
    selectedUsers,
    selectedSources,
    selectedRegions,
    setFilters
  } = useAnalyticsStore();

  const { users } = useUserStore();
  const { teams } = useTeamStore();
  const { leads } = useLeadStore();

  // Local state for filter inputs
  const [localTeams, setLocalTeams] = useState(selectedTeams);
  const [localUsers, setLocalUsers] = useState(selectedUsers);
  const [localSources, setLocalSources] = useState(selectedSources);
  const [localRegions, setLocalRegions] = useState(selectedRegions);

  // Get unique sources and regions from leads
  const uniqueSources = [...new Set(leads.map(lead => lead.source).filter(Boolean))];
  const uniqueRegions = [...new Set(leads.map(lead => lead.region).filter(Boolean))];

  const handleApplyFilters = () => {
    setFilters({
      teams: localTeams,
      users: localUsers,
      sources: localSources,
      regions: localRegions
    });
    onClose();
  };

  const handleClearFilters = () => {
    setLocalTeams([]);
    setLocalUsers([]);
    setLocalSources([]);
    setLocalRegions([]);
  };

  const toggleItem = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter(id => id !== item));
    } else {
      setList([...list, item]);
    }
  };

  const FilterSection = ({ title, items, selectedItems, onToggle, keyField = 'id', labelField = 'name' }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium text-gray-900">{title}</span>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="border-t border-gray-200 p-4 max-h-48 overflow-y-auto">
            <div className="space-y-2">
              {items.map(item => {
                const key = typeof item === 'string' ? item : item[keyField];
                const label = typeof item === 'string' ? item : item[labelField];
                const isSelected = selectedItems.includes(key);
                
                return (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggle(key)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-600"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                    {isSelected && <Check className="w-4 h-4 text-teal-600 ml-auto" />}
                  </label>
                );
              })}
            </div>
            
            {items.length === 0 && (
              <p className="text-sm text-gray-500 italic">No {title.toLowerCase()} available</p>
            )}
          </div>
        )}
      </div>
    );
  };

  const activeFiltersCount = localTeams.length + localUsers.length + localSources.length + localRegions.length;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <Check className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Active Filters</h3>
            <p className="text-sm text-gray-600">
              {activeFiltersCount > 0 ? `${activeFiltersCount} filter(s) applied` : 'No filters applied'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2.5 hover:bg-gray-50 rounded-xl transition-all duration-200"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Teams Filter */}
        <FilterSection
          title="Teams"
          items={teams}
          selectedItems={localTeams}
          onToggle={(teamId) => toggleItem(localTeams, setLocalTeams, teamId)}
        />

        {/* Users Filter */}
        <FilterSection
          title="Sales Reps"
          items={users}
          selectedItems={localUsers}
          onToggle={(userId) => toggleItem(localUsers, setLocalUsers, userId)}
        />

        {/* Sources Filter */}
        <FilterSection
          title="Lead Sources"
          items={uniqueSources}
          selectedItems={localSources}
          onToggle={(source) => toggleItem(localSources, setLocalSources, source)}
        />

        {/* Regions Filter */}
        {uniqueRegions.length > 0 && (
          <FilterSection
            title="Regions"
            items={uniqueRegions}
            selectedItems={localRegions}
            onToggle={(region) => toggleItem(localRegions, setLocalRegions, region)}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={handleClearFilters}
          className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Clear All
        </button>
        <button
          onClick={handleApplyFilters}
          className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;