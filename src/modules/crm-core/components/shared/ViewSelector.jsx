import React from 'react';
import { List, Columns3, Network } from 'lucide-react';

const VIEW_TYPES = {
  LIST: 'list',
  KANBAN: 'kanban',
  CANVAS: 'canvas'
};

export default function ViewSelector({ currentView, onViewChange, showCanvas = true }) {
  const views = [
    { type: VIEW_TYPES.LIST, icon: List, label: 'List View' },
    { type: VIEW_TYPES.KANBAN, icon: Columns3, label: 'Kanban View' },
    ...(showCanvas ? [{ type: VIEW_TYPES.CANVAS, icon: Network, label: 'Canvas View' }] : [])
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      {views.map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          onClick={() => onViewChange(type)}
          className={`p-2 rounded-md transition-all ${
            currentView === type
              ? 'bg-white text-teal-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
          title={label}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}

export { VIEW_TYPES };