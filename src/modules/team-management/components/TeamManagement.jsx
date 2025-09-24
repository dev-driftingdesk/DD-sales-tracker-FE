import React, { useState, useMemo } from 'react';
import { 
  Users, Plus, Search, MoreHorizontal, Edit, Trash2, 
  MapPin, Package, Crown, Calendar, Filter, Grid3X3,
  List, Upload, Download, Shield, Activity, Target,
  UserPlus, Eye, ChevronRight, Zap, TrendingUp
} from 'lucide-react';
import useTeamManagementStore from '../stores/teamManagementStore';
import { 
  TEAM_TYPES, 
  TEAM_TYPE_LABELS, 
  REGION_LABELS, 
  PRODUCT_LABELS 
} from '../constants';
import TeamForm from './TeamForm';
import TeamDetailsModal from './TeamDetailsModal';

const TeamManagement = () => {
  const {
    teams,
    users,
    getUsersByTeam,
    updateTeam,
    deleteTeam
  } = useTeamManagementStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterType, setFilterType] = useState('');
  const [showTeamDetails, setShowTeamDetails] = useState(null);
  const [selectedTeams, setSelectedTeams] = useState([]);

  const filteredTeams = useMemo(() => {
    let result = teams;
    
    // Search filter
    if (searchQuery.trim()) {
      result = result.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Type filter
    if (filterType) {
      result = result.filter(team => team.type === filterType);
    }
    
    return result;
  }, [teams, searchQuery, filterType]);

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setShowTeamForm(true);
    setShowDropdown(null);
  };

  const handleDeleteTeam = (team) => {
    if (window.confirm(`Are you sure you want to delete team "${team.name}"?`)) {
      deleteTeam(team.id);
    }
    setShowDropdown(null);
  };

  const getTeamTypeGradient = (type) => {
    switch (type) {
      case TEAM_TYPES.REGIONAL:
        return 'from-blue-500 to-indigo-600';
      case TEAM_TYPES.PRODUCT:
        return 'from-green-500 to-emerald-600';
      case TEAM_TYPES.LANGUAGE:
        return 'from-purple-500 to-pink-600';
      case TEAM_TYPES.CUSTOM:
        return 'from-gray-500 to-gray-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getTeamTypeColor = (type) => {
    switch (type) {
      case TEAM_TYPES.REGIONAL:
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case TEAM_TYPES.PRODUCT:
        return 'bg-green-100 text-green-700 border-green-200';
      case TEAM_TYPES.LANGUAGE:
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case TEAM_TYPES.CUSTOM:
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTeamMetrics = (teamId) => {
    const members = getUsersByTeam(teamId);
    const totalLeads = Math.floor(Math.random() * 200) + 50;
    const wonDeals = Math.floor(Math.random() * 50) + 10;
    const revenue = Math.floor(Math.random() * 100000) + 20000;
    const conversionRate = (Math.random() * 30 + 10).toFixed(1);
    
    return {
      members: members.length,
      totalLeads,
      wonDeals,
      revenue,
      conversionRate
    };
  };

  const getManagerName = (managerId) => {
    const manager = users.find(user => user.id === managerId);
    return manager ? manager.name : 'No Manager';
  };

  const handleSelectTeam = (teamId) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTeams.length === filteredTeams.length) {
      setSelectedTeams([]);
    } else {
      setSelectedTeams(filteredTeams.map(team => team.id));
    }
  };

  const exportTeams = () => {
    const data = filteredTeams.map(team => ({
      name: team.name,
      type: TEAM_TYPE_LABELS[team.type],
      description: team.description || '',
      manager: getManagerName(team.manager),
      members: getUsersByTeam(team.id).length,
      regions: team.regions?.map(r => REGION_LABELS[r]).join(', ') || '',
      products: team.products?.map(p => PRODUCT_LABELS[p]).join(', ') || '',
      createdAt: new Date(team.createdAt).toLocaleDateString()
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teams_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const TeamCard = ({ team }) => {
    const teamMembers = getUsersByTeam(team.id);
    const manager = users.find(user => user.id === team.manager);
    const metrics = getTeamMetrics(team.id);
    const isSelected = selectedTeams.includes(team.id);
    
    return (
      <div className={`relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${
        isSelected ? 'ring-2 ring-teal-500 shadow-lg' : ''
      }`}>
        {/* Selection Checkbox */}
        <div className="absolute top-4 left-4 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleSelectTeam(team.id)}
            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
          />
        </div>

        {/* Actions Dropdown */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setShowDropdown(showDropdown === team.id ? null : team.id)}
            className="p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-xl transition-all shadow-sm"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-600" />
          </button>
          
          {showDropdown === team.id && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 z-20 overflow-hidden">
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowTeamDetails(team);
                    setShowDropdown(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                
                <button
                  onClick={() => handleEditTeam(team)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Team
                </button>
                
                <button
                  onClick={() => {
                    const members = getUsersByTeam(team.id);
                    console.log('Team members:', members);
                    setShowDropdown(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Manage Members
                </button>
                
                <div className="border-t border-gray-100 my-1" />
                
                <button
                  onClick={() => handleDeleteTeam(team)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Team
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Team Header with Gradient */}
        <div className={`bg-gradient-to-br ${getTeamTypeGradient(team.type)} p-6 text-white`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">{team.name}</h3>
              <p className="text-white/80 text-sm line-clamp-2">{team.description}</p>
            </div>
          </div>
          
          {/* Team Type Badge */}
          <div className="inline-flex items-center px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
            {TEAM_TYPE_LABELS[team.type]}
          </div>
        </div>

        {/* Team Info */}
        <div className="p-6 space-y-4">
          {/* Manager */}
          {manager && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Team Manager</p>
                <p className="font-medium text-gray-900">{manager.name}</p>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-blue-700 font-medium">Members</span>
              </div>
              <p className="text-xl font-bold text-blue-900">{metrics.members}</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-700 font-medium">Conversion</span>
              </div>
              <p className="text-xl font-bold text-green-900">{metrics.conversionRate}%</p>
            </div>
          </div>

          {/* Member Avatars */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Team Members</h4>
            {teamMembers.length > 0 ? (
              <div className="flex items-center -space-x-3">
                {teamMembers.slice(0, 5).map((member, index) => (
                  <div
                    key={member.id}
                    className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-full border-3 border-white flex items-center justify-center relative z-[${5-index}]"
                    title={member.name}
                  >
                    <span className="text-white text-xs font-medium">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                ))}
                {teamMembers.length > 5 && (
                  <div className="w-10 h-10 bg-gray-100 rounded-full border-3 border-white flex items-center justify-center">
                    <span className="text-gray-600 text-xs font-medium">+{teamMembers.length - 5}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No members yet</p>
            )}
          </div>

          {/* Access Info */}
          <div className="space-y-2">
            {/* Regions */}
            {team.regions && team.regions.length > 0 && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="flex flex-wrap gap-1">
                    {team.regions.slice(0, 3).map(region => (
                      <span key={region} className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        {REGION_LABELS[region]}
                      </span>
                    ))}
                    {team.regions.length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                        +{team.regions.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Products */}
            {team.products && team.products.length > 0 && (
              <div className="flex items-start gap-2">
                <Package className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="flex flex-wrap gap-1">
                    {team.products.slice(0, 3).map(product => (
                      <span key={product} className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        {PRODUCT_LABELS[product]}
                      </span>
                    ))}
                    {team.products.length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                        +{team.products.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Performance Bar */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Team Performance</span>
              <span className="text-xs font-bold text-teal-600">{metrics.wonDeals} deals won</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full transition-all duration-700"
                style={{ width: `${Math.min((metrics.wonDeals / metrics.totalLeads) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Team Management
              </h1>
              <p className="text-gray-600 mt-1">Organize users into teams and manage team settings</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Import/Export */}
              <button 
                className="p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
                title="Import Teams"
              >
                <Upload className="w-5 h-5 text-gray-700" />
              </button>
              <button 
                onClick={exportTeams}
                className="p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
                title="Export Teams"
              >
                <Download className="w-5 h-5 text-gray-700" />
              </button>
              
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-white rounded-xl shadow-sm p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-teal-100 text-teal-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' 
                      ? 'bg-teal-100 text-teal-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              
              {/* Create Team Button */}
              <button
                onClick={() => {
                  setEditingTeam(null);
                  setShowTeamForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-medium"
              >
                <Plus className="w-4 h-4" />
                Create Team
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search teams by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all"
            >
              <option value="">All Types</option>
              {Object.entries(TEAM_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            {/* Clear Filters */}
            {(searchQuery || filterType) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('');
                }}
                className="px-4 py-3 text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Bulk Actions Bar */}
          {selectedTeams.length > 0 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedTeams.length === filteredTeams.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {selectedTeams.length} team(s) selected
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    console.log('Bulk actions for teams:', selectedTeams);
                  }}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium shadow-sm"
                >
                  Bulk Actions
                </button>
                <button
                  onClick={() => setSelectedTeams([])}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-all text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Teams Grid/List View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="w-12 px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTeams.length === filteredTeams.length && filteredTeams.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900">Team</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900">Type</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900">Manager</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900">Members</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900">Performance</th>
                    <th className="text-right px-6 py-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTeams.map((team) => {
                    const teamMembers = getUsersByTeam(team.id);
                    const manager = users.find(user => user.id === team.manager);
                    const metrics = getTeamMetrics(team.id);
                    const isSelected = selectedTeams.includes(team.id);
                    
                    return (
                      <tr key={team.id} className={`hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-teal-50' : ''
                      }`}>
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectTeam(team.id)}
                            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{team.name}</div>
                            <div className="text-sm text-gray-600">{team.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r ${getTeamTypeGradient(team.type)} text-white shadow-sm`}>
                            {TEAM_TYPE_LABELS[team.type]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {manager ? (
                              <>
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg flex items-center justify-center">
                                  <span className="text-white text-xs font-medium">
                                    {manager.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <span className="text-sm text-gray-900">{manager.name}</span>
                              </>
                            ) : (
                              <span className="text-sm text-gray-500">No manager</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {teamMembers.slice(0, 3).map((member) => (
                                <div
                                  key={member.id}
                                  className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-full border-2 border-white flex items-center justify-center"
                                  title={member.name}
                                >
                                  <span className="text-white text-xs font-medium">
                                    {member.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-600">Conversion</span>
                                <span className="text-xs font-semibold text-gray-900">{metrics.conversionRate}%</span>
                              </div>
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full"
                                  style={{ width: `${metrics.conversionRate}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setShowTeamDetails(team)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleEditTeam(team)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteTeam(team)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredTeams.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No teams found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterType
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first team'
              }
            </p>
            {!searchQuery && !filterType && (
              <button
                onClick={() => setShowTeamForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-medium"
              >
                Create Your First Team
              </button>
            )}
          </div>
        )}

        {/* Enhanced Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{teams.length}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Teams</h3>
            <p className="text-xs text-gray-500 mt-1">All active teams</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {teams.filter(t => t.type === TEAM_TYPES.REGIONAL).length}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Regional Teams</h3>
            <p className="text-xs text-gray-500 mt-1">Location-based</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {teams.filter(t => t.type === TEAM_TYPES.PRODUCT).length}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Product Teams</h3>
            <p className="text-xs text-gray-500 mt-1">Product-focused</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {teams.reduce((sum, team) => sum + getUsersByTeam(team.id).length, 0)}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Members</h3>
            <p className="text-xs text-gray-500 mt-1">Across all teams</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {teams.reduce((sum, team) => {
                  const metrics = getTeamMetrics(team.id);
                  return sum + parseFloat(metrics.conversionRate);
                }, 0) / teams.length || 0}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Avg Conversion</h3>
            <p className="text-xs text-gray-500 mt-1">Team average</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showTeamForm && (
        <TeamForm
          team={editingTeam}
          onClose={() => {
            setShowTeamForm(false);
            setEditingTeam(null);
          }}
        />
      )}

      {showTeamDetails && (
        <TeamDetailsModal
          team={showTeamDetails}
          onClose={() => setShowTeamDetails(null)}
          onEdit={() => {
            handleEditTeam(showTeamDetails);
            setShowTeamDetails(null);
          }}
        />
      )}
    </div>
  );
};

export default TeamManagement;