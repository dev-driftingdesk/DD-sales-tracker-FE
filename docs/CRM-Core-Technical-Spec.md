# Technical Specification Document
# CRM Core Module - SalesTracker

## Document Information
- **Version**: 1.0
- **Last Updated**: January 2025
- **Technical Lead**: Engineering Team
- **Status**: Implemented

---

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Component Specifications](#component-specifications)
3. [State Management](#state-management)
4. [API Specifications](#api-specifications)
5. [Data Flow](#data-flow)
6. [Security Implementation](#security-implementation)
7. [Performance Optimization](#performance-optimization)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Guide](#deployment-guide)
10. [Maintenance & Monitoring](#maintenance-monitoring)

---

## 1. System Architecture

### 1.1 High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
├─────────────────────────────────────────────────────────────┤
│                    CRM Core Module                           │
├──────────────┬──────────────┬──────────────┬───────────────┤
│   Contacts   │   Companies  │    Deals     │  Activities   │
├──────────────┴──────────────┴──────────────┴───────────────┤
│                    Zustand Store Layer                       │
├─────────────────────────────────────────────────────────────┤
│                    Utils & Helpers                           │
├─────────────────────────────────────────────────────────────┤
│                 Browser Storage (LocalStorage)               │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Module Dependencies
```javascript
{
  "dependencies": {
    "react": "^19.1.0",
    "zustand": "^5.0.6",
    "lucide-react": "latest",
    "tailwindcss": "^3.4.17"
  },
  "peerDependencies": {
    "react-router-dom": "^7.6.3",
    "vite": "^7.0.2"
  }
}
```

### 1.3 File Structure
```
src/modules/crm-core/
├── CRMCoreModule.jsx           # Main module component
├── components/                 # UI Components
│   ├── contacts/
│   │   ├── ContactList.jsx    # Contact list view
│   │   ├── ContactDetail.jsx  # Contact detail modal
│   │   └── ContactForm.jsx    # Contact creation form
│   ├── companies/
│   │   ├── CompanyList.jsx    # Company list view
│   │   ├── CompanyDetail.jsx  # Company detail modal
│   │   └── CompanyForm.jsx    # Company creation form
│   ├── deals/
│   │   ├── DealPipeline.jsx   # Kanban pipeline view
│   │   ├── DealDetail.jsx     # Deal detail modal
│   │   └── DealForm.jsx       # Deal creation form
│   └── activities/
│       └── ActivityList.jsx    # Activity management
├── stores/
│   └── crmStore.js            # Zustand state management
└── utils/
    └── exportUtils.js         # CSV export utilities
```

---

## 2. Component Specifications

### 2.1 Main Module Component

#### CRMCoreModule.jsx
```javascript
// Component Structure
const CRMCoreModule = () => {
  // State Management
  const [activeTab, setActiveTab] = useState('contacts');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Store Integration
  const { 
    getStatistics,
    getFilteredContacts,
    getFilteredCompanies,
    getFilteredDeals,
    getFilteredActivities
  } = useCRMStore();
  
  // Render Logic
  return (
    <div className="flex-1 p-6 bg-gray-100">
      <Statistics />
      <TabNavigation />
      <ContentArea />
      <Modals />
    </div>
  );
};
```

### 2.2 Contact Components

#### ContactList.jsx
**Purpose**: Display filterable list of contacts
**State**: 
- `showContactForm`: Boolean for form visibility
- Local filter state

**Props**: None (uses Zustand store)

**Key Features**:
- Search functionality
- Tag filtering
- Contact cards with avatars
- Click to view details
- Add contact button

#### ContactDetail.jsx
**Purpose**: View/Edit contact information
**State**:
- `isEditing`: Boolean for edit mode
- `editForm`: Object with form data
- `showActivityForm`: Boolean for activity form

**Props**: 
- `onClose`: Function to close modal

**Key Features**:
- Inline editing
- Activity timeline
- Related information
- Delete functionality

#### ContactForm.jsx
**Purpose**: Create new contacts
**State**:
- `formData`: Object with all contact fields
- `newTag`: String for tag input

**Props**:
- `onClose`: Function to close modal

**Key Features**:
- Form validation
- Company autocomplete
- Tag management
- Required field indicators

### 2.3 Company Components

#### CompanyList.jsx
**Purpose**: Display filterable list of companies
**State**:
- `showCompanyForm`: Boolean
- `showCompanyDetail`: Boolean

**Key Features**:
- Industry filtering
- Revenue display
- Employee count
- Related metrics

#### CompanyDetail.jsx
**Purpose**: Comprehensive company view
**State**:
- `isEditing`: Boolean
- `editForm`: Object

**Key Features**:
- Company statistics cards
- Related contacts list
- Related deals list
- Edit/Delete operations

### 2.4 Deal Components

#### DealPipeline.jsx
**Purpose**: Kanban-style deal management
**State**:
- `showDealForm`: Boolean
- `showDealDetail`: Boolean

**Key Features**:
- Drag and drop functionality
- Stage-based organization
- Value calculations
- Probability indicators

#### DealDetail.jsx
**Purpose**: Deal information and editing
**State**:
- `isEditing`: Boolean
- `editForm`: Object
- `showActivityForm`: Boolean

**Key Features**:
- Deal metrics
- Stage management
- Activity tracking
- Contact association

### 2.5 Activity Components

#### ActivityList.jsx
**Purpose**: Unified activity management
**State**:
- `showActivityForm`: Boolean
- `activityForm`: Object

**Key Features**:
- Type-based filtering
- Status management
- Date filtering
- Quick completion

---

## 3. State Management

### 3.1 Zustand Store Structure

```javascript
const useCRMStore = create(
  persist(
    (set, get) => ({
      // State
      contacts: [],
      companies: [],
      deals: [],
      activities: [],
      selectedContact: null,
      selectedCompany: null,
      selectedDeal: null,
      
      // Filters
      contactFilters: {
        search: '',
        tags: [],
        companies: [],
        status: 'all'
      },
      
      // Actions
      addContact: (contact) => { /* ... */ },
      updateContact: (id, updates) => { /* ... */ },
      deleteContact: (id) => { /* ... */ },
      
      // Computed Properties
      getFilteredContacts: () => { /* ... */ },
      getStatistics: () => { /* ... */ }
    }),
    {
      name: 'crm-core-storage',
      partialize: (state) => ({
        contacts: state.contacts,
        companies: state.companies,
        deals: state.deals,
        activities: state.activities
      })
    }
  )
);
```

### 3.2 State Update Patterns

#### Optimistic Updates
```javascript
updateContact: (id, updates) => set((state) => ({
  contacts: state.contacts.map(contact =>
    contact.id === id 
      ? { ...contact, ...updates, updatedAt: new Date().toISOString() }
      : contact
  ),
  selectedContact: state.selectedContact?.id === id 
    ? { ...state.selectedContact, ...updates } 
    : state.selectedContact
}))
```

#### Filtering Logic
```javascript
getFilteredContacts: () => {
  const state = get();
  return state.contacts.filter(contact => {
    // Search filter
    if (state.contactFilters.search) {
      const searchLower = state.contactFilters.search.toLowerCase();
      if (!contact.name.toLowerCase().includes(searchLower) &&
          !contact.email?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    // Tag filter
    if (state.contactFilters.tags.length > 0) {
      if (!state.contactFilters.tags.some(tag => 
        contact.tags?.includes(tag))) {
        return false;
      }
    }
    return true;
  });
}
```

### 3.3 Performance Considerations

#### Memoization
- Computed properties are recalculated only when dependencies change
- Filter results are cached until filter criteria change

#### Batch Updates
```javascript
// Batch multiple state updates
set((state) => ({
  contacts: [...state.contacts, newContact],
  companies: state.companies.map(c => 
    c.id === companyId ? { ...c, contactCount: c.contactCount + 1 } : c
  )
}));
```

---

## 4. API Specifications

### 4.1 REST API Endpoints (Future Implementation)

#### Contacts
```
GET    /api/v1/contacts          # List contacts
POST   /api/v1/contacts          # Create contact
GET    /api/v1/contacts/:id      # Get contact
PUT    /api/v1/contacts/:id      # Update contact
DELETE /api/v1/contacts/:id      # Delete contact
GET    /api/v1/contacts/export   # Export contacts
```

#### Companies
```
GET    /api/v1/companies         # List companies
POST   /api/v1/companies         # Create company
GET    /api/v1/companies/:id     # Get company with relations
PUT    /api/v1/companies/:id     # Update company
DELETE /api/v1/companies/:id     # Delete company
```

#### Deals
```
GET    /api/v1/deals             # List deals
POST   /api/v1/deals             # Create deal
GET    /api/v1/deals/:id         # Get deal
PUT    /api/v1/deals/:id         # Update deal
DELETE /api/v1/deals/:id         # Delete deal
PUT    /api/v1/deals/:id/stage   # Move deal stage
```

#### Activities
```
GET    /api/v1/activities        # List activities
POST   /api/v1/activities        # Create activity
PUT    /api/v1/activities/:id    # Update activity
DELETE /api/v1/activities/:id    # Delete activity
POST   /api/v1/activities/:id/complete # Complete activity
```

### 4.2 Request/Response Formats

#### Create Contact Request
```json
POST /api/v1/contacts
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "title": "VP Sales",
  "companyId": "comp_123",
  "tags": ["VIP", "Decision Maker"],
  "status": "active"
}
```

#### Response Format
```json
{
  "success": true,
  "data": {
    "id": "cont_456",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-01-14T10:00:00Z",
    "updatedAt": "2025-01-14T10:00:00Z"
  }
}
```

### 4.3 Error Handling
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "field": "email"
  }
}
```

---

## 5. Data Flow

### 5.1 Create Contact Flow
```
User Input → ContactForm → Validation → Store Action → 
Local State Update → UI Update → (Future: API Call) → 
Success/Error Handling
```

### 5.2 Deal Pipeline Update Flow
```
Drag Start → Capture Deal ID → Drag Over → Drop → 
Update Deal Stage → Recalculate Pipeline → Update UI → 
(Future: Sync to Backend)
```

### 5.3 Export Data Flow
```
Export Button → Gather Filtered Data → Transform to CSV Format → 
Create Blob → Generate Download Link → Trigger Download → 
Cleanup Resources
```

---

## 6. Security Implementation

### 6.1 Data Validation

#### Input Sanitization
```javascript
const sanitizeInput = (input) => {
  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '');
};
```

#### Email Validation
```javascript
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
```

### 6.2 XSS Prevention
- All user inputs are escaped before rendering
- React's built-in XSS protection is utilized
- No `dangerouslySetInnerHTML` usage

### 6.3 Data Privacy
- Sensitive data is not logged
- Export functions respect data permissions
- No data is sent to external services

---

## 7. Performance Optimization

### 7.1 Rendering Optimization

#### Component Memoization
```javascript
const ContactCard = React.memo(({ contact, onClick }) => {
  return (
    <div onClick={() => onClick(contact)}>
      {/* Contact display */}
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.contact.id === nextProps.contact.id &&
         prevProps.contact.updatedAt === nextProps.contact.updatedAt;
});
```

#### Virtual Scrolling (Future Enhancement)
```javascript
// For lists with 1000+ items
import { FixedSizeList } from 'react-window';

const VirtualContactList = ({ contacts }) => (
  <FixedSizeList
    height={600}
    itemCount={contacts.length}
    itemSize={80}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        <ContactCard contact={contacts[index]} />
      </div>
    )}
  </FixedSizeList>
);
```

### 7.2 State Optimization

#### Selective Updates
```javascript
// Only update changed fields
updateContact: (id, updates) => set((state) => {
  const contactIndex = state.contacts.findIndex(c => c.id === id);
  if (contactIndex === -1) return state;
  
  const newContacts = [...state.contacts];
  newContacts[contactIndex] = {
    ...newContacts[contactIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  return { contacts: newContacts };
});
```

### 7.3 Bundle Optimization
- Lazy loading for modal components
- Code splitting by feature
- Tree shaking for unused code

---

## 8. Testing Strategy

### 8.1 Unit Testing

#### Component Testing Example
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import ContactForm from './ContactForm';

describe('ContactForm', () => {
  test('validates required fields', () => {
    render(<ContactForm onClose={jest.fn()} />);
    
    const submitButton = screen.getByText('Add Contact');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Name and email are required')).toBeInTheDocument();
  });
  
  test('creates contact with valid data', () => {
    const mockClose = jest.fn();
    render(<ContactForm onClose={mockClose} />);
    
    fireEvent.change(screen.getByPlaceholderText('John Doe'), {
      target: { value: 'Test User' }
    });
    fireEvent.change(screen.getByPlaceholderText('john@example.com'), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.click(screen.getByText('Add Contact'));
    
    expect(mockClose).toHaveBeenCalled();
  });
});
```

#### Store Testing
```javascript
import { renderHook, act } from '@testing-library/react-hooks';
import useCRMStore from './crmStore';

describe('CRM Store', () => {
  test('adds contact correctly', () => {
    const { result } = renderHook(() => useCRMStore());
    
    act(() => {
      result.current.addContact({
        name: 'Test Contact',
        email: 'test@example.com'
      });
    });
    
    expect(result.current.contacts).toHaveLength(1);
    expect(result.current.contacts[0].name).toBe('Test Contact');
  });
});
```

### 8.2 Integration Testing

#### Pipeline Drag and Drop Test
```javascript
describe('Deal Pipeline', () => {
  test('moves deal between stages', () => {
    render(<DealPipeline />);
    
    const deal = screen.getByText('Test Deal');
    const targetStage = screen.getByText('Negotiation');
    
    fireEvent.dragStart(deal);
    fireEvent.dragOver(targetStage);
    fireEvent.drop(targetStage);
    
    expect(within(targetStage.parentElement).getByText('Test Deal')).toBeInTheDocument();
  });
});
```

### 8.3 E2E Testing (Cypress)

```javascript
describe('CRM Core E2E', () => {
  it('creates contact and links to company', () => {
    cy.visit('/crm');
    
    // Create company
    cy.contains('Companies').click();
    cy.contains('Add Company').click();
    cy.get('input[placeholder="Acme Corporation"]').type('Test Corp');
    cy.contains('button', 'Add Company').click();
    
    // Create contact
    cy.contains('Contacts').click();
    cy.contains('Add Contact').click();
    cy.get('input[placeholder="John Doe"]').type('Test User');
    cy.get('input[placeholder="john@example.com"]').type('test@test.com');
    cy.get('input[list="companies"]').type('Test Corp');
    cy.contains('button', 'Add Contact').click();
    
    // Verify relationship
    cy.contains('Test User').click();
    cy.contains('Test Corp').should('be.visible');
  });
});
```

---

## 9. Deployment Guide

### 9.1 Build Configuration

#### Vite Configuration
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'crm-core': [
            './src/modules/crm-core/CRMCoreModule.jsx',
            './src/modules/crm-core/stores/crmStore.js'
          ]
        }
      }
    }
  }
};
```

### 9.2 Environment Variables
```bash
# .env.production
VITE_API_URL=https://api.salestracker.com
VITE_EXPORT_LIMIT=10000
VITE_ENABLE_ANALYTICS=true
```

### 9.3 Deployment Steps
1. Run tests: `npm test`
2. Build production: `npm run build`
3. Deploy to CDN/hosting
4. Verify deployment
5. Monitor performance

---

## 10. Maintenance & Monitoring

### 10.1 Performance Monitoring

#### Key Metrics
- Page load time
- Time to interactive
- Bundle size
- Memory usage
- API response times

#### Monitoring Code
```javascript
// Performance observer
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log(`${entry.name}: ${entry.duration}ms`);
    // Send to analytics
  });
});

observer.observe({ entryTypes: ['measure'] });

// Measure operations
performance.mark('export-start');
exportContactsToCSV(contacts);
performance.mark('export-end');
performance.measure('export-duration', 'export-start', 'export-end');
```

### 10.2 Error Tracking

```javascript
// Global error boundary
class CRMErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('CRM Error:', error, errorInfo);
    // Send to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong in CRM module</div>;
    }
    return this.props.children;
  }
}
```

### 10.3 Maintenance Tasks

#### Regular Tasks
- [ ] Weekly: Review error logs
- [ ] Monthly: Performance audit
- [ ] Quarterly: Dependency updates
- [ ] Yearly: Major version upgrades

#### Optimization Checklist
- [ ] Bundle size under 500KB
- [ ] Load time under 2s
- [ ] Memory usage stable
- [ ] No memory leaks
- [ ] Accessibility compliance

---

## Appendices

### A. Code Style Guide
- Use functional components
- Prefer hooks over class components
- Use Tailwind classes for styling
- Follow ESLint configuration
- Write self-documenting code

### B. Contribution Guidelines
1. Create feature branch
2. Write tests first
3. Implement feature
4. Run full test suite
5. Submit PR with description

### C. Troubleshooting Guide
Common issues and solutions:
- State not persisting: Check localStorage limits
- Drag and drop not working: Verify event handlers
- Export failing: Check data size limits

---

**Document maintained by**: Engineering Team
**Last review date**: January 2025