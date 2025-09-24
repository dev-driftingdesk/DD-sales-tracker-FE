import React from 'react';
import { Phone, Mail, Building, Tag, User } from 'lucide-react';
import KanbanView from '../shared/KanbanView';
import useCRMStore from '../../stores/crmStore';

const STATUS_COLUMNS = [
  { id: 'lead', name: 'Lead', color: 'bg-blue-500' },
  { id: 'active', name: 'Active', color: 'bg-green-500' },
  { id: 'customer', name: 'Customer', color: 'bg-purple-500' },
  { id: 'inactive', name: 'Inactive', color: 'bg-gray-500' }
];

export default function ContactKanban({ contacts, onContactClick }) {
  const { updateContact } = useCRMStore();

  const handleContactMove = (contactId, newStatus) => {
    updateContact(contactId, { status: newStatus });
  };

  const renderContactCard = (contact) => (
    <>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
            <span className="text-teal-600 text-xs font-medium">
              {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 text-sm">{contact.name}</h4>
            <p className="text-xs text-gray-600">{contact.title}</p>
          </div>
        </div>
      </div>

      <div className="space-y-1 text-xs text-gray-500">
        {contact.company && (
          <div className="flex items-center gap-1">
            <Building className="w-3 h-3" />
            <span className="truncate">{contact.company}</span>
          </div>
        )}
        {contact.email && (
          <div className="flex items-center gap-1">
            <Mail className="w-3 h-3" />
            <span className="truncate">{contact.email}</span>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            <span>{contact.phone}</span>
          </div>
        )}
      </div>

      {contact.tags && contact.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {contact.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
            >
              {tag}
            </span>
          ))}
          {contact.tags.length > 2 && (
            <span className="text-xs text-gray-400">+{contact.tags.length - 2}</span>
          )}
        </div>
      )}
    </>
  );

  const getContactStatus = (contact) => {
    return contact.status || 'active';
  };

  const columnConfig = {
    lead: { showCount: true },
    active: { showCount: true },
    customer: { showCount: true },
    inactive: { showCount: true }
  };

  return (
    <KanbanView
      items={contacts}
      columns={STATUS_COLUMNS}
      onItemMove={handleContactMove}
      onItemClick={onContactClick}
      renderCard={renderContactCard}
      getItemColumn={getContactStatus}
      columnConfig={columnConfig}
    />
  );
}