import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Check, Square } from 'lucide-react';

export default function ListView({ 
  items, 
  columns, 
  onItemClick, 
  selectedItems = [], 
  onSelectionChange,
  enableSelection = false,
  renderItem
}) {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (aValue === bValue) return 0;
    
    const comparison = aValue < bValue ? -1 : 1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(items.map(item => item.id));
    }
  };

  const handleSelectItem = (itemId) => {
    if (selectedItems.includes(itemId)) {
      onSelectionChange(selectedItems.filter(id => id !== itemId));
    } else {
      onSelectionChange([...selectedItems, itemId]);
    }
  };

  if (renderItem) {
    // Custom render mode (card-based)
    return (
      <div className="divide-y divide-gray-200">
        {sortedItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onItemClick(item)}
            className="hover:bg-gray-50 cursor-pointer transition-colors"
          >
            {enableSelection && (
              <div className="p-4 flex items-start">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectItem(item.id);
                  }}
                  className="mr-3 mt-1"
                >
                  {selectedItems.includes(item.id) ? (
                    <Check className="w-5 h-5 text-teal-600" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <div className="flex-1">
                  {renderItem(item)}
                </div>
              </div>
            )}
            {!enableSelection && renderItem(item)}
          </div>
        ))}
      </div>
    );
  }

  // Table mode
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {enableSelection && (
              <th className="px-6 py-3 text-left">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center"
                >
                  {selectedItems.length === items.length && items.length > 0 ? (
                    <Check className="w-5 h-5 text-teal-600" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => column.sortable !== false && handleSort(column.key)}
              >
                <div className="flex items-center gap-1">
                  {column.label}
                  {column.sortable !== false && sortColumn === column.key && (
                    sortDirection === 'asc' ? 
                      <ChevronUp className="w-4 h-4" /> : 
                      <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedItems.map((item) => (
            <tr
              key={item.id}
              onClick={() => onItemClick(item)}
              className="hover:bg-gray-50 cursor-pointer"
            >
              {enableSelection && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectItem(item.id);
                    }}
                  >
                    {selectedItems.includes(item.id) ? (
                      <Check className="w-5 h-5 text-teal-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </td>
              )}
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {sortedItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No items found
        </div>
      )}
    </div>
  );
}