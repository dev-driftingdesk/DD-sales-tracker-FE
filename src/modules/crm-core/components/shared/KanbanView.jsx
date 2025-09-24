import React, { useState, useMemo } from 'react';
import { MoreVertical, Plus } from 'lucide-react';

export default function KanbanView({
  items,
  columns,
  onItemMove,
  onItemClick,
  renderCard,
  onAddItem,
  showAddButton = true,
  getItemColumn,
  columnConfig = {}
}) {
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Group items by column
  const itemsByColumn = useMemo(() => {
    const grouped = {};
    columns.forEach(column => {
      grouped[column.id] = [];
    });
    
    items.forEach(item => {
      const columnId = getItemColumn(item);
      if (grouped[columnId]) {
        grouped[columnId].push(item);
      }
    });
    
    return grouped;
  }, [items, columns, getItemColumn]);

  // Calculate column stats
  const getColumnStats = (columnId) => {
    const columnItems = itemsByColumn[columnId] || [];
    const config = columnConfig[columnId] || {};
    
    if (config.showCount !== false) {
      return {
        count: columnItems.length,
        value: config.valueField ? 
          columnItems.reduce((sum, item) => sum + (item[config.valueField] || 0), 0) : 
          null
      };
    }
    return null;
  };

  const handleDragStart = (e, item) => {
    // Store the item ID in state
    setDraggedItemId(String(item.id));
    
    // Set drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(item.id));
    
    // Add visual feedback
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    setDraggedItemId(null);
    setDragOverColumn(null);
    // Reset visual feedback
    if (e.target) {
      e.target.style.opacity = '';
    }
  };

  const handleDragOver = (e) => {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
  };

  const handleDragEnter = (e, columnId) => {
    e.preventDefault();
    if (draggedItemId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    // Only clear if we're leaving the column container
    if (e.currentTarget === e.target) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    
    const itemId = e.dataTransfer.getData('text/plain');
    
    if (itemId && onItemMove) {
      const draggedItem = items.find(item => String(item.id) === String(itemId));
      if (draggedItem) {
        const currentColumn = getItemColumn(draggedItem);
        if (currentColumn !== columnId) {
          onItemMove(itemId, columnId);
        }
      }
    }
    
    setDraggedItemId(null);
    setDragOverColumn(null);
    
    return false;
  };

  return (
    <div className="h-full bg-gray-50 p-4">
      <div className="flex gap-4 h-full overflow-x-auto">
        {columns.map((column) => {
          const stats = getColumnStats(column.id);
          const columnItems = itemsByColumn[column.id] || [];
          
          return (
            <div
              key={column.id}
              className="flex-shrink-0 w-80"
            >
              <div className={`bg-white rounded-lg shadow-sm h-full flex flex-col ${
                dragOverColumn === column.id ? 'ring-2 ring-teal-500' : ''
              }`}>
                {/* Column Header */}
                <div className={`p-4 border-b border-gray-200 ${
                  column.color ? `${column.color} bg-opacity-10` : 'bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{column.name}</h3>
                      {stats && (
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-gray-500">
                            {stats.count} {stats.count === 1 ? 'item' : 'items'}
                          </span>
                          {stats.value !== null && columnConfig[column.id]?.formatValue && (
                            <span className="text-sm font-medium text-gray-700">
                              {columnConfig[column.id].formatValue(stats.value)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {showAddButton && onAddItem && (
                        <button
                          onClick={() => onAddItem(column.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Column Content */}
                <div 
                  className="flex-1 p-2 overflow-y-auto"
                  onDrop={(e) => handleDrop(e, column.id)}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, column.id)}
                  onDragLeave={(e) => handleDragLeave(e)}
                >
                  <div className="space-y-2">
                    {columnItems.map((item) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onDragEnd={(e) => handleDragEnd(e)}
                        onClick={() => onItemClick && onItemClick(item)}
                        className={`bg-white border border-gray-200 rounded-lg p-3 cursor-move hover:shadow-md transition-all ${
                          String(draggedItemId) === String(item.id) ? 'opacity-50' : ''
                        }`}
                      >
                        {renderCard(item)}
                      </div>
                    ))}
                  </div>
                  
                  {columnItems.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No items
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}