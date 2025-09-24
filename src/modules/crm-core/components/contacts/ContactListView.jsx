import React from 'react';
import { Phone, Mail, Building, Tag } from 'lucide-react';
import ListView from '../shared/ListView';

export default function ContactListView({ 
  contacts, 
  onContactClick, 
  selectedItems, 
  onSelectionChange,
  enableSelection 
}) {
  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (contact) => (
        <div>
          <p className="font-medium text-gray-900">{contact.name}</p>
          <p className="text-sm text-gray-600">{contact.title}</p>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (contact) => contact.email && (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Mail className="w-3 h-3" />
          {contact.email}
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (contact) => contact.phone && (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Phone className="w-3 h-3" />
          {contact.phone}
        </div>
      )
    },
    {
      key: 'company',
      label: 'Company',
      render: (contact) => contact.company && (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Building className="w-3 h-3" />
          {contact.company}
        </div>
      )
    },
    {
      key: 'tags',
      label: 'Tags',
      sortable: false,
      render: (contact) => contact.tags && contact.tags.length > 0 && (
        <div className="flex items-center gap-1">
          {contact.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (contact) => (
        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
          contact.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {contact.status || 'Active'}
        </span>
      )
    }
  ];

  // Card-based rendering for mobile/compact view
  const renderContactCard = (contact) => (
    <div className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
            <span className="text-teal-600 font-medium">
              {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{contact.name}</h3>
            <p className="text-sm text-gray-600">{contact.title}</p>
            
            <div className="mt-2 space-y-1">
              {contact.email && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail className="w-3 h-3" />
                  {contact.email}
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone className="w-3 h-3" />
                  {contact.phone}
                </div>
              )}
              {contact.company && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Building className="w-3 h-3" />
                  {contact.company}
                </div>
              )}
            </div>

            {contact.tags && contact.tags.length > 0 && (
              <div className="mt-2 flex items-center gap-1">
                <Tag className="w-3 h-3 text-gray-400" />
                {contact.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
            contact.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {contact.status || 'Active'}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <ListView
      items={contacts}
      columns={columns}
      onItemClick={onContactClick}
      selectedItems={selectedItems}
      onSelectionChange={onSelectionChange}
      enableSelection={enableSelection}
      renderItem={window.innerWidth < 768 ? renderContactCard : null}
    />
  );
}