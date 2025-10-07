import React, { useState, useMemo } from 'react';
import { 
  Users, Plus, Search, Filter, MoreHorizontal, 
  Edit, Trash2, Power, PowerOff, Mail, Phone,
  Shield, Clock, Activity, ChevronDown, UserPlus,
  Download, Upload, Check, X, Eye, EyeOff
} from 'lucide-react';
import useTeamManagementStore from '../stores/teamManagementStore';
import { USER_ROLES, USER_STATUS, ROLE_LABELS, STATUS_LABELS } from '../constants';
import UserForm from './UserForm';
import InviteUser from './InviteUser';
import UserDetailsModal from './UserDetailsModal';
import BulkActions from './BulkActions';

const UserManagement = () => {
  const {
    users,
    teams,
    searchUsers,
    filterUsers,
    updateUser,
    deleteUser,
    deactivateUser,
    reactivateUser,
    setSelectedUser,
    bulkUpdateUsers,
    bulkDeactivateUsers
  } = useTeamManagementStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    team: ''
  });
  const [showUserForm, setShowUserForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserDetails, setShowUserDetails] = useState(null);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const filteredUsers = useMemo(() => {
    let result = users;
    
    if (searchQuery.trim()) {
      result = searchUsers(searchQuery);
    }
    
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value)
    );
    
    if (Object.keys(activeFilters).length > 0) {
      result = filterUsers(activeFilters);
    }
    
    return result;
  }, [users, searchQuery, filters, searchUsers, filterUsers]);

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowUserForm(true);
    setShowDropdown(null);
  };

  const handleDeleteUser = (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      deleteUser(user.id);
    }
    setShowDropdown(null);
  };

  const handleToggleStatus = (user) => {
    if (user.status === USER_STATUS.ACTIVE) {
      deactivateUser(user.id);
    } else {
      reactivateUser(user.id);
    }
    setShowDropdown(null);
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return 'from-red-500 to-pink-600';
      case USER_ROLES.MANAGER:
        return 'from-blue-500 to-indigo-600';
      case USER_ROLES.SALES_REP:
        return 'from-green-500 to-emerald-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusIndicator = (status) => {
    switch (status) {
      case USER_STATUS.ACTIVE:
        return { color: 'bg-green-500', pulse: true };
      case USER_STATUS.INACTIVE:
        return { color: 'bg-red-500', pulse: false };
      case USER_STATUS.PENDING:
        return { color: 'bg-yellow-500', pulse: true };
      default:
        return { color: 'bg-gray-500', pulse: false };
    }
  };

  const getUserTeams = (user) => {
    return teams.filter(team => user.teams.includes(team.id));
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const UserCard = ({ user }) => {
    const userTeams = getUserTeams(user);
    const statusIndicator = getStatusIndicator(user.status);
    const isSelected = selectedUsers.includes(user.id);
    
    return (
      <div className={`relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 ${
        isSelected ? 'ring-2 ring-teal-500 shadow-lg' : ''
      }`}>
        {/* Selection Checkbox */}
        <div className="absolute top-4 left-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleSelectUser(user.id)}
            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
          />
        </div>

        {/* Actions Dropdown */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setShowDropdown(showDropdown === user.id ? null : user.id)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-600" />
          </button>
          
          {showDropdown === user.id && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 z-20 overflow-hidden">
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserDetails(user);
                    setShowDropdown(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                
                <button
                  onClick={() => handleEditUser(user)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit User
                </button>
                
                <button
                  onClick={() => handleToggleStatus(user)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {user.status === USER_STATUS.ACTIVE ? (
                    <>
                      <PowerOff className="w-4 h-4" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Power className="w-4 h-4" />
                      Activate
                    </>
                  )}
                </button>
                
                <div className="border-t border-gray-100 my-1" />
                
                <button
                  onClick={() => handleDeleteUser(user)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete User
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar and Status */}
        <div className="flex flex-col items-center mb-6 mt-4">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">
                {user.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${statusIndicator.color} rounded-full border-4 border-white ${
              statusIndicator.pulse ? 'animate-pulse' : ''
            }`} />
          </div>
          
          <h3 className="mt-4 text-lg font-semibold text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-600">{user.email}</p>
          
          {/* Role Badge */}
          <div className={`mt-3 px-4 py-1.5 rounded-full bg-gradient-to-r ${getRoleBadgeColor(user.role)} text-white text-xs font-semibold shadow-md`}>
            {ROLE_LABELS[user.role]}
          </div>
          
          {/* Commission Badge for Sales Reps */}
          {user.role === USER_ROLES.SALES_REP && user.commissionPercentage !== undefined && (
            <div className="mt-2 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs font-medium rounded-full border border-green-200">
              {user.commissionPercentage}% Commission
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          {user.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{user.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Last active: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</span>
          </div>
        </div>

        {/* Teams */}
        <div className="border-t border-gray-100 pt-4">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Teams</h4>
          <div className="flex flex-wrap gap-2">
            {userTeams.length > 0 ? (
              userTeams.map(team => (
                <span key={team.id} className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs rounded-full font-medium">
                  {team.name}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-500 italic">No teams assigned</span>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{Math.floor(Math.random() * 50) + 10}</div>
            <div className="text-xs text-gray-600">Leads</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{Math.floor(Math.random() * 20) + 5}</div>
            <div className="text-xs text-gray-600">Won</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{(Math.random() * 30 + 10).toFixed(0)}%</div>
            <div className="text-xs text-gray-600">Rate</div>
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
                User Management
              </h1>
              <p className="text-gray-600 mt-1">Manage your team members and their permissions</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Import/Export */}
              <button className="p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
                <Upload className="w-5 h-5 text-gray-700" />
              </button>
              <button className="p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'table' 
                      ? 'bg-teal-100 text-teal-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              
              {/* Action Buttons */}
              <button
                onClick={() => setShowInviteForm(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-medium"
              >
                <Mail className="w-4 h-4" />
                Invite User
              </button>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setShowUserForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-medium"
              >
                <UserPlus className="w-4 h-4" />
                Add User
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
                placeholder="Search users by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all"
              >
                <option value="">All Roles</option>
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all"
              >
                <option value="">All Status</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              <select
                value={filters.team}
                onChange={(e) => setFilters({ ...filters, team: e.target.value })}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all"
              >
                <option value="">All Teams</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => setFilters({ role: '', status: '', team: '' })}
                  className="px-4 py-3 text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all font-medium"
                >
                  Clear ({activeFiltersCount})
                </button>
              )}
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedUsers.length > 0 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {selectedUsers.length} user(s) selected
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBulkActions(true)}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium shadow-sm"
                >
                  Bulk Actions
                </button>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-all text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Users Grid/Table View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} />
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
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900">User</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900">Role</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900">Status</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900">Commission</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900">Teams</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900">Last Active</th>
                    <th className="text-right px-6 py-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => {
                    const userTeams = getUserTeams(user);
                    const statusIndicator = getStatusIndicator(user.status);
                    const isSelected = selectedUsers.includes(user.id);
                    
                    return (
                      <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-teal-50' : ''
                      }`}>
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectUser(user.id)}
                            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-medium">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${statusIndicator.color} rounded-full border-2 border-white`} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-600 flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {user.email}
                                </span>
                                {user.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {user.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r ${getRoleBadgeColor(user.role)} text-white shadow-sm`}>
                            {ROLE_LABELS[user.role]}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 ${statusIndicator.color} rounded-full ${
                              statusIndicator.pulse ? 'animate-pulse' : ''
                            }`} />
                            <span className="text-sm font-medium text-gray-700">
                              {STATUS_LABELS[user.status]}
                            </span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          {user.role === 'sales_rep' && user.commissionPercentage !== undefined ? (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-medium text-green-700">
                                  {user.commissionPercentage}%
                                </span>
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">N/A</span>
                          )}
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {userTeams.length > 0 ? (
                              userTeams.slice(0, 2).map(team => (
                                <span key={team.id} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                  {team.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500 text-sm">No teams</span>
                            )}
                            {userTeams.length > 2 && (
                              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                                +{userTeams.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {user.lastLogin 
                              ? new Date(user.lastLogin).toLocaleDateString()
                              : 'Never'
                            }
                          </span>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setShowUserDetails(user)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title={user.status === USER_STATUS.ACTIVE ? 'Deactivate' : 'Activate'}
                            >
                              {user.status === USER_STATUS.ACTIVE ? (
                                <PowerOff className="w-4 h-4 text-gray-600" />
                              ) : (
                                <Power className="w-4 h-4 text-gray-600" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
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
        {filteredUsers.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {users.length === 0 ? 'No users available' : 'No users found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {users.length === 0 
                ? 'Users will appear here once they are loaded from the API.'
                : searchQuery || activeFiltersCount > 0 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first user'
              }
            </p>
            {users.length > 0 && !searchQuery && activeFiltersCount === 0 && (
              <button
                onClick={() => setShowUserForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-medium"
              >
                Add First User
              </button>
            )}
          </div>
        )}

        {/* Enhanced Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{filteredUsers.length}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
            <p className="text-xs text-gray-500 mt-1">All registered users</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {filteredUsers.filter(u => u.status === USER_STATUS.ACTIVE).length}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Active Users</h3>
            <p className="text-xs text-gray-500 mt-1">Currently active</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {filteredUsers.filter(u => u.role === USER_ROLES.ADMIN).length}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Admins</h3>
            <p className="text-xs text-gray-500 mt-1">System administrators</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {filteredUsers.filter(u => u.role === USER_ROLES.SALES_REP).length}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Sales Reps</h3>
            <p className="text-xs text-gray-500 mt-1">Field representatives</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showUserForm && (
        <UserForm
          user={editingUser}
          onClose={() => {
            setShowUserForm(false);
            setEditingUser(null);
          }}
        />
      )}

      {showInviteForm && (
        <InviteUser
          onClose={() => setShowInviteForm(false)}
        />
      )}

      {showUserDetails && (
        <UserDetailsModal
          user={showUserDetails}
          onClose={() => setShowUserDetails(null)}
          onEdit={() => {
            handleEditUser(showUserDetails);
            setShowUserDetails(null);
          }}
        />
      )}

      {showBulkActions && (
        <BulkActions
          selectedUsers={selectedUsers}
          onClose={() => {
            setShowBulkActions(false);
            setSelectedUsers([]);
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;