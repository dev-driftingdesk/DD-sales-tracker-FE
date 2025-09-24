import React, { useState } from 'react';
import {
  X, Users, Shield, Power, PowerOff, Trash2,
  Mail, Download, Upload, Edit, Check, AlertCircle
} from 'lucide-react';
import useTeamManagementStore from '../stores/teamManagementStore';
import { USER_ROLES, USER_STATUS, ROLE_LABELS, STATUS_LABELS } from '../constants';

const BulkActions = ({ selectedUsers, onClose }) => {
  const {
    users,
    teams,
    bulkUpdateUsers,
    bulkDeactivateUsers,
    bulkDeleteUsers,
    bulkAssignRole,
    bulkAssignTeams
  } = useTeamManagementStore();

  const [activeTab, setActiveTab] = useState('status'); // 'status', 'role', 'teams', 'export', 'delete'
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedUserObjects = users.filter(user => selectedUsers.includes(user.id));

  const handleBulkStatusChange = async (status) => {
    setIsProcessing(true);
    try {
      if (status === USER_STATUS.INACTIVE) {
        await bulkDeactivateUsers(selectedUsers);
      } else {
        await bulkUpdateUsers(selectedUsers, { status });
      }
      onClose();
    } catch (error) {
      console.error('Bulk status update failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkRoleAssign = async () => {
    if (!selectedRole) return;
    
    setIsProcessing(true);
    try {
      await bulkAssignRole(selectedUsers, selectedRole);
      onClose();
    } catch (error) {
      console.error('Bulk role assignment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkTeamAssign = async () => {
    if (selectedTeams.length === 0) return;
    
    setIsProcessing(true);
    try {
      await bulkAssignTeams(selectedUsers, selectedTeams);
      onClose();
    } catch (error) {
      console.error('Bulk team assignment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    try {
      await bulkDeleteUsers(selectedUsers);
      onClose();
    } catch (error) {
      console.error('Bulk delete failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const exportUsers = () => {
    const data = selectedUserObjects.map(user => ({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: ROLE_LABELS[user.role],
      status: STATUS_LABELS[user.status],
      teams: user.teams.map(teamId => {
        const team = teams.find(t => t.id === teamId);
        return team ? team.name : 'Unknown';
      }).join(', '),
      lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never',
      createdAt: new Date(user.createdAt).toLocaleDateString()
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'status', label: 'Status', icon: Power },
    { id: 'role', label: 'Role', icon: Shield },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'export', label: 'Export', icon: Download },
    { id: 'delete', label: 'Delete', icon: Trash2 }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bulk Actions</h2>
              <p className="text-sm text-gray-600 mt-1">
                Apply actions to {selectedUsers.length} selected user{selectedUsers.length > 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 border-b border-gray-200 -mb-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-all duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? 'text-teal-600 border-teal-600'
                      : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Tab */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <p className="text-gray-600">Change the status for all selected users:</p>
              
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setConfirmAction({ type: 'status', value: USER_STATUS.ACTIVE })}
                  className="p-4 bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-all"
                >
                  <Power className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <span className="block text-sm font-medium text-green-900">Activate</span>
                  <span className="block text-xs text-green-700 mt-1">Set as active</span>
                </button>
                
                <button
                  onClick={() => setConfirmAction({ type: 'status', value: USER_STATUS.INACTIVE })}
                  className="p-4 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-all"
                >
                  <PowerOff className="w-6 h-6 text-red-600 mx-auto mb-2" />
                  <span className="block text-sm font-medium text-red-900">Deactivate</span>
                  <span className="block text-xs text-red-700 mt-1">Set as inactive</span>
                </button>
                
                <button
                  onClick={() => setConfirmAction({ type: 'status', value: USER_STATUS.PENDING })}
                  className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-xl border border-yellow-200 transition-all"
                >
                  <AlertCircle className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                  <span className="block text-sm font-medium text-yellow-900">Pending</span>
                  <span className="block text-xs text-yellow-700 mt-1">Set as pending</span>
                </button>
              </div>

              {/* Current Status Summary */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Status Distribution</h4>
                <div className="flex items-center gap-6">
                  {Object.entries(USER_STATUS).map(([key, value]) => {
                    const count = selectedUserObjects.filter(u => u.status === value).length;
                    if (count === 0) return null;
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{STATUS_LABELS[value]}:</span>
                        <span className="font-medium text-gray-900">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Role Tab */}
          {activeTab === 'role' && (
            <div className="space-y-4">
              <p className="text-gray-600">Assign a new role to all selected users:</p>
              
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(USER_ROLES).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedRole(value)}
                    className={`p-4 rounded-xl border transition-all ${
                      selectedRole === value
                        ? 'bg-teal-50 border-teal-300 ring-2 ring-teal-600'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Shield className={`w-6 h-6 mx-auto mb-2 ${
                      selectedRole === value ? 'text-teal-600' : 'text-gray-600'
                    }`} />
                    <span className={`block text-sm font-medium ${
                      selectedRole === value ? 'text-teal-900' : 'text-gray-900'
                    }`}>
                      {ROLE_LABELS[value]}
                    </span>
                  </button>
                ))}
              </div>

              {selectedRole && (
                <button
                  onClick={() => setConfirmAction({ type: 'role', value: selectedRole })}
                  className="w-full px-4 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all font-medium"
                >
                  Assign {ROLE_LABELS[selectedRole]} Role
                </button>
              )}
            </div>
          )}

          {/* Teams Tab */}
          {activeTab === 'teams' && (
            <div className="space-y-4">
              <p className="text-gray-600">Assign teams to all selected users:</p>
              
              <div className="max-h-64 overflow-y-auto space-y-2">
                {teams.map(team => {
                  const isSelected = selectedTeams.includes(team.id);
                  return (
                    <label
                      key={team.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-teal-50 border-teal-300'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTeams([...selectedTeams, team.id]);
                          } else {
                            setSelectedTeams(selectedTeams.filter(id => id !== team.id));
                          }
                        }}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{team.name}</span>
                        <p className="text-sm text-gray-600">{team.description}</p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {team.members?.length || 0} members
                      </span>
                    </label>
                  );
                })}
              </div>

              {selectedTeams.length > 0 && (
                <button
                  onClick={() => setConfirmAction({ type: 'teams', value: selectedTeams })}
                  className="w-full px-4 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all font-medium"
                >
                  Assign to {selectedTeams.length} Team{selectedTeams.length > 1 ? 's' : ''}
                </button>
              )}
            </div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <p className="text-gray-600">Export selected users' data:</p>
              
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <Download className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h4 className="font-medium text-gray-900 mb-2">Export to CSV</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Download user data including name, email, role, status, and team assignments
                </p>
                <button
                  onClick={exportUsers}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all font-medium"
                >
                  Export {selectedUsers.length} Users
                </button>
              </div>
            </div>
          )}

          {/* Delete Tab */}
          {activeTab === 'delete' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Permanent Deletion Warning</h4>
                    <p className="text-sm text-red-700 mt-1">
                      This action cannot be undone. All selected users and their data will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Users to be deleted:</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {selectedUserObjects.map(user => (
                    <div key={user.id} className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-900">{user.name}</span>
                      <span className="text-gray-600">({user.email})</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setConfirmAction({ type: 'delete' })}
                className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all font-medium"
              >
                Delete {selectedUsers.length} User{selectedUsers.length > 1 ? 's' : ''}
              </button>
            </div>
          )}
        </div>

        {/* Confirmation Dialog */}
        {confirmAction && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-2xl">
            <div className="bg-white rounded-xl p-6 m-6 shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Action</h3>
              
              <p className="text-gray-600 mb-6">
                {confirmAction.type === 'status' && `Change status to ${STATUS_LABELS[confirmAction.value]} for ${selectedUsers.length} users?`}
                {confirmAction.type === 'role' && `Assign ${ROLE_LABELS[confirmAction.value]} role to ${selectedUsers.length} users?`}
                {confirmAction.type === 'teams' && `Assign ${confirmAction.value.length} teams to ${selectedUsers.length} users?`}
                {confirmAction.type === 'delete' && `Permanently delete ${selectedUsers.length} users?`}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (confirmAction.type === 'status') {
                      await handleBulkStatusChange(confirmAction.value);
                    } else if (confirmAction.type === 'role') {
                      await handleBulkRoleAssign();
                    } else if (confirmAction.type === 'teams') {
                      await handleBulkTeamAssign();
                    } else if (confirmAction.type === 'delete') {
                      await handleBulkDelete();
                    }
                    setConfirmAction(null);
                  }}
                  className={`flex-1 px-4 py-2 text-white rounded-xl transition-all font-medium flex items-center justify-center gap-2 ${
                    confirmAction.type === 'delete'
                      ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:shadow-lg'
                      : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:shadow-lg'
                  }`}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Confirm
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkActions;