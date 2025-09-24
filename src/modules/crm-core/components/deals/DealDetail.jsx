import React, { useState } from 'react';
import { X, DollarSign, Calendar, User, Building2, Phone, Mail, Edit, Trash2, TrendingUp, Clock } from 'lucide-react';
import useCRMStore from '../../stores/crmStore';

export default function DealDetail({ onClose }) {
  const { selectedDeal, updateDeal, deleteDeal, dealStages, contacts, addActivity } = useCRMStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(selectedDeal || {});
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityForm, setActivityForm] = useState({
    type: 'Note',
    subject: '',
    description: ''
  });

  if (!selectedDeal) return null;

  const contact = selectedDeal.contactId ? contacts.find(c => c.id === selectedDeal.contactId) : null;

  const handleSave = () => {
    updateDeal(selectedDeal.id, {
      ...editForm,
      value: parseFloat(editForm.value),
      probability: parseInt(editForm.probability)
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      deleteDeal(selectedDeal.id);
      onClose();
    }
  };

  const handleAddActivity = () => {
    addActivity({
      ...activityForm,
      dealId: selectedDeal.id,
      entityType: 'deal',
      entityId: selectedDeal.id
    });
    setShowActivityForm(false);
    setActivityForm({ type: 'Note', subject: '', description: '' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStageColor = (stageId) => {
    const stage = dealStages.find(s => s.id === stageId);
    return stage?.color || 'bg-gray-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{selectedDeal.name}</h2>
              <p className="text-gray-600">{selectedDeal.company}</p>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm(selectedDeal);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6">
            {/* Deal Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Deal Value</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedDeal.value)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Stage</p>
                    <span className={`inline-flex px-3 py-1 text-sm rounded-full ${getStageColor(selectedDeal.stage)} bg-opacity-20 mt-1`}>
                      {dealStages.find(s => s.id === selectedDeal.stage)?.name || selectedDeal.stage}
                    </span>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Probability</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedDeal.probability}%</p>
                  </div>
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 transform -rotate-90">
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-gray-200"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 20}`}
                        strokeDashoffset={`${2 * Math.PI * 20 * (1 - selectedDeal.probability / 100)}`}
                        className="text-teal-600"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Deal Information</h3>
                <div className="space-y-4">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deal Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Value (USD)</label>
                        <input
                          type="number"
                          value={editForm.value}
                          onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                        <select
                          value={editForm.stage}
                          onChange={(e) => setEditForm({ ...editForm, stage: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        >
                          {dealStages.map(stage => (
                            <option key={stage.id} value={stage.id}>{stage.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Probability (%)</label>
                        <input
                          type="number"
                          value={editForm.probability}
                          onChange={(e) => setEditForm({ ...editForm, probability: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          min="0"
                          max="100"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close Date</label>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900">
                            {selectedDeal.closeDate 
                              ? new Date(selectedDeal.closeDate).toLocaleDateString() 
                              : 'Not set'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900">{selectedDeal.assignee || 'Unassigned'}</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900">{new Date(selectedDeal.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                {contact ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-900">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.title}</p>
                    {contact.email && (
                      <div className="flex items-center gap-2 mt-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a href={`mailto:${contact.email}`} className="text-sm text-teal-600 hover:underline">
                          {contact.email}
                        </a>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a href={`tel:${contact.phone}`} className="text-sm text-teal-600 hover:underline">
                          {contact.phone}
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No primary contact assigned</p>
                )}

                {(selectedDeal.description || selectedDeal.notes) && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                    {selectedDeal.description && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <p className="text-gray-900">{selectedDeal.description}</p>
                      </div>
                    )}
                    {selectedDeal.notes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <p className="text-gray-900">{selectedDeal.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Activities Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Activities</h3>
                <button
                  onClick={() => setShowActivityForm(true)}
                  className="px-3 py-1 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700"
                >
                  Add Activity
                </button>
              </div>

              {showActivityForm && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={activityForm.type}
                        onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option>Note</option>
                        <option>Call</option>
                        <option>Email</option>
                        <option>Meeting</option>
                        <option>Task</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                      <input
                        type="text"
                        value={activityForm.subject}
                        onChange={(e) => setActivityForm({ ...activityForm, subject: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={activityForm.description}
                        onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddActivity}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowActivityForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Deal Created</p>
                      <p className="text-sm text-gray-600 mt-1">Initial deal entry</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(selectedDeal.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}