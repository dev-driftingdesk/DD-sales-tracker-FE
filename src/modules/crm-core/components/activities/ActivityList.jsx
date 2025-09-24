import React, { useState } from 'react';
import { Phone, Mail, Calendar, CheckCircle, Circle, Clock, User, FileText, Plus } from 'lucide-react';
import useCRMStore from '../../stores/crmStore';
import ViewSelector, { VIEW_TYPES } from '../shared/ViewSelector';
import ListView from '../shared/ListView';
import ActivityKanban from './ActivityKanban';
import ActivityTimeline from './ActivityTimeline';

export default function ActivityList() {
  const { 
    getFilteredActivities, 
    activityFilters, 
    setActivityFilters,
    completeActivity,
    addActivity,
    activityTypes,
    viewPreferences,
    setViewPreference
  } = useCRMStore();

  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityForm, setActivityForm] = useState({
    type: 'Task',
    subject: '',
    description: '',
    dueDate: '',
    assigneeId: ''
  });

  const activities = getFilteredActivities();
  const currentView = viewPreferences.activities || VIEW_TYPES.LIST;

  const getActivityIcon = (type) => {
    switch (type) {
      case 'Call':
        return <Phone className="w-4 h-4" />;
      case 'Email':
        return <Mail className="w-4 h-4" />;
      case 'Meeting':
        return <Calendar className="w-4 h-4" />;
      case 'Task':
        return <CheckCircle className="w-4 h-4" />;
      case 'Note':
        return <FileText className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'Call':
        return 'text-blue-600 bg-blue-100';
      case 'Email':
        return 'text-purple-600 bg-purple-100';
      case 'Meeting':
        return 'text-green-600 bg-green-100';
      case 'Task':
        return 'text-orange-600 bg-orange-100';
      case 'Note':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleAddActivity = () => {
    addActivity(activityForm);
    setShowActivityForm(false);
    setActivityForm({
      type: 'Task',
      subject: '',
      description: '',
      dueDate: '',
      assigneeId: ''
    });
  };

  const dateFilterOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'overdue', label: 'Overdue' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Activities & Tasks</h2>
          <div className="flex items-center gap-2">
            <ViewSelector
              currentView={currentView}
              onViewChange={(view) => setViewPreference('activities', view)}
              showCanvas={true}
            />
            <button 
              onClick={() => setShowActivityForm(true)}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Activity
            </button>
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={activityFilters.type}
            onChange={(e) => setActivityFilters({ type: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Types</option>
            {activityTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={activityFilters.status}
            onChange={(e) => setActivityFilters({ status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={activityFilters.dateRange}
            onChange={(e) => setActivityFilters({ dateRange: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            {dateFilterOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {showActivityForm && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={activityForm.type}
                  onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  {activityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="datetime-local"
                  value={activityForm.dueDate}
                  onChange={(e) => setActivityForm({ ...activityForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={activityForm.subject}
                onChange={(e) => setActivityForm({ ...activityForm, subject: e.target.value })}
                placeholder="Enter activity subject..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={activityForm.description}
                onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                placeholder="Enter activity description..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddActivity}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Create Activity
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

      {/* Render view based on selection */}
      {currentView === VIEW_TYPES.LIST && (
        <div className="divide-y divide-gray-200">
          {activities.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{activity.subject}</h4>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <span className={`inline-block w-2 h-2 rounded-full ${
                            activity.type === 'Call' ? 'bg-blue-500' :
                            activity.type === 'Email' ? 'bg-purple-500' :
                            activity.type === 'Meeting' ? 'bg-green-500' :
                            activity.type === 'Task' ? 'bg-orange-500' :
                            'bg-gray-500'
                          }`} />
                          {activity.type}
                        </span>
                        
                        {activity.dueDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(activity.dueDate).toLocaleString()}
                          </span>
                        )}
                        
                        {activity.assignee && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {activity.assignee}
                          </span>
                        )}
                      </div>

                      {activity.entityType && activity.entityId && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">
                            Related to: {activity.entityType} #{activity.entityId}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {activity.completed ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Completed
                        </span>
                      ) : (
                        <button
                          onClick={() => completeActivity(activity.id)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {activities.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-500">No activities found</p>
            </div>
          )}
        </div>
      )}

      {currentView === VIEW_TYPES.KANBAN && (
        <ActivityKanban
          activities={activities}
          onActivityClick={() => {}}
        />
      )}

      {currentView === VIEW_TYPES.CANVAS && (
        <ActivityTimeline
          activities={activities}
          onActivityClick={() => {}}
        />
      )}
    </div>
  );
}