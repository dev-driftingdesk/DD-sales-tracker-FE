import React from 'react';
import { Phone, Mail, Calendar, CheckCircle, FileText, Clock, User } from 'lucide-react';
import KanbanView from '../shared/KanbanView';
import useCRMStore from '../../stores/crmStore';

const ACTIVITY_TYPE_COLUMNS = [
  { id: 'Task', name: 'Tasks', color: 'bg-orange-500', icon: CheckCircle },
  { id: 'Call', name: 'Calls', color: 'bg-blue-500', icon: Phone },
  { id: 'Email', name: 'Emails', color: 'bg-purple-500', icon: Mail },
  { id: 'Meeting', name: 'Meetings', color: 'bg-green-500', icon: Calendar },
  { id: 'Note', name: 'Notes', color: 'bg-gray-500', icon: FileText }
];

export default function ActivityKanban({ activities, onActivityClick }) {
  const { updateActivity, completeActivity } = useCRMStore();

  const handleActivityMove = (activityId, newType) => {
    updateActivity(activityId, { type: newType });
  };

  const getActivityIcon = (type) => {
    const column = ACTIVITY_TYPE_COLUMNS.find(col => col.id === type);
    return column ? column.icon : FileText;
  };

  const renderActivityCard = (activity) => {
    const Icon = getActivityIcon(activity.type);
    const isOverdue = activity.dueDate && new Date(activity.dueDate) < new Date() && !activity.completed;
    
    return (
      <>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-2">
            <div className={`p-1.5 rounded ${
              activity.completed ? 'bg-green-100 text-green-600' : 
              isOverdue ? 'bg-red-100 text-red-600' : 
              'bg-gray-100 text-gray-600'
            }`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm">{activity.subject || 'Untitled'}</h4>
              {activity.description && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{activity.description}</p>
              )}
            </div>
          </div>
          {!activity.completed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                completeActivity(activity.id);
              }}
              className="p-1 text-gray-400 hover:text-green-600"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="space-y-1 text-xs text-gray-500">
          {activity.dueDate && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                {new Date(activity.dueDate).toLocaleString()}
              </span>
            </div>
          )}
          {activity.assignee && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{activity.assignee}</span>
            </div>
          )}
          {activity.entityType && (
            <div className="text-xs text-gray-400">
              Related to: {activity.entityType} #{activity.entityId}
            </div>
          )}
        </div>

        {activity.completed && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-green-600">
              Completed {activity.completedAt ? new Date(activity.completedAt).toLocaleDateString() : 'recently'}
            </span>
          </div>
        )}
      </>
    );
  };

  const getActivityType = (activity) => {
    return activity.type;
  };

  const columnConfig = ACTIVITY_TYPE_COLUMNS.reduce((acc, col) => {
    acc[col.id] = { showCount: true };
    return acc;
  }, {});

  return (
    <KanbanView
      items={activities}
      columns={ACTIVITY_TYPE_COLUMNS}
      onItemMove={handleActivityMove}
      onItemClick={onActivityClick}
      renderCard={renderActivityCard}
      getItemColumn={getActivityType}
      columnConfig={columnConfig}
      showAddButton={false}
    />
  );
}