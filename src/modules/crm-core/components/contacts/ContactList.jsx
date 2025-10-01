import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Plus, AlertCircle } from 'lucide-react';
import useCRMStore from '../../stores/crmStore';
import ContactForm from './ContactForm';
import ViewSelector, { VIEW_TYPES } from '../shared/ViewSelector';
import ContactListView from './ContactListView';
import ContactKanban from './ContactKanban';
import ContactCanvas from './ContactCanvas';

export default function ContactList() {
  const { 
    getFilteredContacts, 
    setSelectedContact, 
    contactFilters, 
    setContactFilters,
    selectedContact,
    viewPreferences,
    setViewPreference,
    contactsLoading,
    contactsError,
    searchContacts
  } = useCRMStore();
  
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const contacts = getFilteredContacts();
  const currentView = viewPreferences.contacts || VIEW_TYPES.LIST;

  // Debounced search handler
  const handleSearch = useCallback(
    async (searchTerm) => {
      if (searchTerm.trim()) {
        try {
          await searchContacts(searchTerm, contactFilters);
        } catch (error) {
          console.error('Search failed:', error);
        }
      }
    },
    [searchContacts, contactFilters]
  );

  // Debounce search input
  useEffect(() => {
    const searchTerm = contactFilters.search;
    if (searchTerm) {
      const timeoutId = setTimeout(() => {
        handleSearch(searchTerm);
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [contactFilters.search, handleSearch]);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Contacts</h2>
          <div className="flex items-center gap-2">
            <ViewSelector
              currentView={currentView}
              onViewChange={(view) => setViewPreference('contacts', view)}
            />
            <button 
              onClick={() => setShowContactForm(true)}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Contact
            </button>
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={contactFilters.search}
              onChange={(e) => setContactFilters({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Error display */}
      {contactsError && (
        <div className="mx-4 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-600 text-sm">{contactsError}</p>
        </div>
      )}

      {/* Loading state */}
      {contactsLoading && (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="mt-2 text-gray-600">Loading contacts...</p>
        </div>
      )}

      {/* Render view based on selection */}
      {!contactsLoading && (
        <>
        {currentView === VIEW_TYPES.LIST && (
        <ContactListView
          contacts={contacts}
          onContactClick={setSelectedContact}
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          enableSelection={false}
        />
      )}

      {currentView === VIEW_TYPES.KANBAN && (
        <ContactKanban
          contacts={contacts}
          onContactClick={setSelectedContact}
        />
      )}

      {currentView === VIEW_TYPES.CANVAS && (
        <ContactCanvas
          contacts={contacts}
          onContactClick={setSelectedContact}
        />
      )}

        {contacts.length === 0 && currentView === VIEW_TYPES.LIST && (
          <div className="p-8 text-center">
            <p className="text-gray-500">No contacts found</p>
          </div>
        )}
        </>
      )}
      
      {showContactForm && (
        <ContactForm onClose={() => setShowContactForm(false)} />
      )}
    </div>
  );
}