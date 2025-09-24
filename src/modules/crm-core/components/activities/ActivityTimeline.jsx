import React, { useMemo } from 'react';
import { Phone, Mail, Calendar, CheckCircle, FileText, Clock, User, Activity } from 'lucide-react';
import CanvasView from '../shared/CanvasView';

export default function ActivityTimeline({ activities, onActivityClick }) {
  // Create timeline visualization
  const { nodes, edges } = useMemo(() => {
    const nodes = [];
    const edges = [];
    
    // Sort activities by date
    const sortedActivities = [...activities].sort((a, b) => {
      const dateA = new Date(a.dueDate || a.createdAt);
      const dateB = new Date(b.dueDate || b.createdAt);
      return dateA - dateB;
    });

    // Group activities by date
    const activitiesByDate = {};
    sortedActivities.forEach(activity => {
      const date = new Date(activity.dueDate || activity.createdAt).toDateString();
      if (!activitiesByDate[date]) {
        activitiesByDate[date] = [];
      }
      activitiesByDate[date].push(activity);
    });

    // Create date nodes and activity nodes
    let dateNodeY = 100;
    let previousDateNodeId = null;
    
    Object.entries(activitiesByDate).forEach(([date, dateActivities], dateIndex) => {
      // Create date node
      const dateNodeId = `date-${dateIndex}`;
      const dateNode = {
        id: dateNodeId,
        label: date,
        type: 'date',
        data: { date },
        color: '#6B7280',
        size: 40,
        x: 100,
        y: dateNodeY
      };
      nodes.push(dateNode);

      // Connect to previous date
      if (previousDateNodeId) {
        edges.push({
          source: previousDateNodeId,
          target: dateNodeId,
          type: 'solid'
        });
      }
      previousDateNodeId = dateNodeId;

      // Create activity nodes for this date
      dateActivities.forEach((activity, activityIndex) => {
        const activityNode = {
          id: `activity-${activity.id}`,
          label: activity.subject || activity.type,
          type: 'activity',
          data: activity,
          color: getActivityColor(activity.type),
          size: 30,
          x: 300 + (activityIndex % 3) * 150,
          y: dateNodeY + Math.floor(activityIndex / 3) * 60
        };
        nodes.push(activityNode);

        // Connect activity to date
        edges.push({
          source: dateNodeId,
          target: activityNode.id,
          type: 'dashed'
        });
      });

      dateNodeY += Math.ceil(dateActivities.length / 3) * 60 + 100;
    });

    return { nodes, edges };
  }, [activities]);

  const getActivityColor = (type) => {
    const colors = {
      'Call': '#3B82F6',
      'Email': '#8B5CF6',
      'Meeting': '#10B981',
      'Task': '#F97316',
      'Note': '#6B7280'
    };
    return colors[type] || '#6B7280';
  };

  const getActivityIcon = (type) => {
    const icons = {
      'Call': Phone,
      'Email': Mail,
      'Meeting': Calendar,
      'Task': CheckCircle,
      'Note': FileText
    };
    return icons[type] || Activity;
  };

  const handleNodeClick = (node) => {
    if (node.type === 'activity') {
      onActivityClick(node.data);
    }
  };

  const renderNode = (node) => {
    if (node.type === 'date') {
      return (
        <div className="p-2 bg-gray-100 rounded-lg shadow-sm border border-gray-300">
          <p className="text-xs font-bold text-gray-700">{node.label}</p>
        </div>
      );
    }

    // Activity node
    const Icon = getActivityIcon(node.data.type);
    const isCompleted = node.data.completed;
    const isOverdue = node.data.dueDate && new Date(node.data.dueDate) < new Date() && !isCompleted;
    
    return (
      <div 
        className={`
          p-2 bg-white rounded-lg shadow-md border-2 cursor-pointer
          hover:shadow-lg transition-shadow
          ${isCompleted ? 'border-green-500' : isOverdue ? 'border-red-500' : 'border-gray-300'}
        `}
        style={{ minWidth: '140px' }}
      >
        <div className="flex items-start gap-2">
          <div className={`
            p-1 rounded
            ${isCompleted ? 'bg-green-100 text-green-600' : 
              isOverdue ? 'bg-red-100 text-red-600' : 
              'bg-gray-100 text-gray-600'}
          `}>
            <Icon className="w-3 h-3" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">
              {node.label}
            </p>
            <p className="text-xs text-gray-500">{node.data.type}</p>
            {node.data.assignee && (
              <p className="text-xs text-gray-400 mt-1">{node.data.assignee}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700">Activity Timeline</h3>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border-2 border-green-500 rounded"></div>
            Completed
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border-2 border-red-500 rounded"></div>
            Overdue
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-300 rounded"></div>
            Date Markers
          </div>
        </div>
      </div>
      
      <CanvasView
        nodes={nodes}
        edges={edges}
        onNodeClick={handleNodeClick}
        renderNode={renderNode}
        height="500px"
      />
    </div>
  );
}