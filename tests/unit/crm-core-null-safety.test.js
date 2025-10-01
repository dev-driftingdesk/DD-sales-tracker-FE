import { render, screen } from '@testing-library/react';
import ContactKanban from '../../src/modules/crm-core/components/contacts/ContactKanban';
import KanbanView from '../../src/modules/crm-core/components/shared/KanbanView';

// Mock the CRM store
jest.mock('../../src/modules/crm-core/stores/crmStore', () => ({
  __esModule: true,
  default: () => ({
    updateContact: jest.fn(),
  })
}));

describe('CRM Core Null Safety Fixes', () => {
  describe('ContactKanban', () => {
    it('should handle null contacts gracefully', () => {
      const mockContacts = [
        { id: '1', name: 'John Doe', status: 'active' },
        null,
        { id: '2', name: 'Jane Smith', status: 'lead' },
        undefined,
        { id: '', name: 'Invalid' }, // Invalid ID
        { name: 'No ID' }, // Missing ID
      ];

      const mockOnClick = jest.fn();

      // Should not crash when rendering with null values
      expect(() => {
        render(
          <ContactKanban 
            contacts={mockContacts} 
            onContactClick={mockOnClick} 
          />
        );
      }).not.toThrow();
    });

    it('should filter out invalid contacts', () => {
      const mockContacts = [
        { id: '1', name: 'John Doe', status: 'active' },
        null,
        { id: '2', name: 'Jane Smith', status: 'lead' },
      ];

      const mockOnClick = jest.fn();

      render(
        <ContactKanban 
          contacts={mockContacts} 
          onContactClick={mockOnClick} 
        />
      );

      // Should render valid contacts only
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should handle contacts with missing status', () => {
      const mockContacts = [
        { id: '1', name: 'John Doe' }, // No status
        { id: '2', name: 'Jane Smith', status: null }, // Null status
      ];

      const mockOnClick = jest.fn();

      // Should not crash and should default to 'active' status
      expect(() => {
        render(
          <ContactKanban 
            contacts={mockContacts} 
            onContactClick={mockOnClick} 
          />
        );
      }).not.toThrow();
    });
  });

  describe('KanbanView', () => {
    const mockColumns = [
      { id: 'active', name: 'Active', color: 'bg-green-500' },
      { id: 'lead', name: 'Lead', color: 'bg-blue-500' },
    ];

    const mockGetItemColumn = (item) => {
      if (!item || typeof item !== 'object') return 'active';
      return item.status || 'active';
    };

    const mockRenderCard = (item) => <div>{item?.name || 'Invalid'}</div>;

    it('should handle null items gracefully', () => {
      const mockItems = [
        { id: '1', name: 'John Doe', status: 'active' },
        null,
        { id: '2', name: 'Jane Smith', status: 'lead' },
        undefined,
      ];

      // Should not crash when rendering with null values
      expect(() => {
        render(
          <KanbanView
            items={mockItems}
            columns={mockColumns}
            getItemColumn={mockGetItemColumn}
            renderCard={mockRenderCard}
            onItemMove={jest.fn()}
            onItemClick={jest.fn()}
          />
        );
      }).not.toThrow();
    });

    it('should filter out invalid items', () => {
      const mockItems = [
        { id: '1', name: 'John Doe', status: 'active' },
        null,
        { id: '2', name: 'Jane Smith', status: 'lead' },
        { name: 'No ID' }, // Invalid - no ID
      ];

      render(
        <KanbanView
          items={mockItems}
          columns={mockColumns}
          getItemColumn={mockGetItemColumn}
          renderCard={mockRenderCard}
          onItemMove={jest.fn()}
          onItemClick={jest.fn()}
        />
      );

      // Should render valid items only
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should handle empty or null items array', () => {
      // Test with null items
      expect(() => {
        render(
          <KanbanView
            items={null}
            columns={mockColumns}
            getItemColumn={mockGetItemColumn}
            renderCard={mockRenderCard}
            onItemMove={jest.fn()}
            onItemClick={jest.fn()}
          />
        );
      }).not.toThrow();

      // Test with undefined items
      expect(() => {
        render(
          <KanbanView
            items={undefined}
            columns={mockColumns}
            getItemColumn={mockGetItemColumn}
            renderCard={mockRenderCard}
            onItemMove={jest.fn()}
            onItemClick={jest.fn()}
          />
        );
      }).not.toThrow();
    });
  });
});