import React, { useState } from 'react';
import { X, Search, User, Plus } from 'lucide-react';
import useCRMStore from '../../../crm-core/stores/crmStore';

export default function CustomerSelector({ onClose, onSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const { getFilteredContacts } = useCRMStore();
  
  // Get all contacts and filter them locally
  const allContacts = getFilteredContacts();
  const filteredContacts = allContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleWalkInCustomer = () => {
    onSelect({ id: 'walk-in', name: 'Walk-in Customer' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Select Customer</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search customers by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>

        {/* Customer List */}
        <div className="max-h-96 overflow-y-auto">
          {/* Walk-in Customer Option */}
          <div className="p-4 border-b border-gray-100">
            <button
              onClick={handleWalkInCustomer}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Walk-in Customer</h3>
                <p className="text-sm text-gray-600">Customer not in system</p>
              </div>
            </button>
          </div>

          {/* Existing Customers */}
          {filteredContacts.length > 0 ? (
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Existing Customers</h4>
              <div className="space-y-2">
                {filteredContacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => onSelect(contact)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <span className="text-teal-700 font-medium text-sm">
                        {contact.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{contact.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {contact.email && (
                          <span className="truncate">{contact.email}</span>
                        )}
                        {contact.company && (
                          <>
                            {contact.email && <span>•</span>}
                            <span className="truncate">{contact.company}</span>
                          </>
                        )}
                      </div>
                      {contact.phone && (
                        <p className="text-sm text-gray-500">{contact.phone}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {contact.tags && contact.tags.length > 0 && (
                        <div className="flex gap-1">
                          {contact.tags.slice(0, 2).map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {contact.tags.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{contact.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : searchTerm ? (
            <div className="p-8 text-center">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No customers found</h3>
              <p className="text-gray-500 mb-4">
                No customers match "{searchTerm}"
              </p>
              <button
                onClick={handleWalkInCustomer}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
              >
                Continue as Walk-in Customer
              </button>
            </div>
          ) : (
            <div className="p-8 text-center">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No customers in system</h3>
              <p className="text-gray-500 mb-4">
                Add customers in the CRM module to see them here
              </p>
              <button
                onClick={handleWalkInCustomer}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
              >
                Continue as Walk-in Customer
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Can't find the customer? Add them in the CRM module first.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}