# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SalesTracker CRM** is a comprehensive Customer Relationship Management platform built with React 19.1.0 frontend and planned .NET 9.0.304 backend. The frontend is complete and operational with mock data, while the backend implementation is planned/in development.

**Current State:** Frontend-complete with mock data stores, comprehensive testing framework ready, backend API specifications documented.

## Architecture

### Frontend Architecture
- **React 19.1.0** with concurrent features
- **Zustand 5.0.6** for state management (stores in `src/stores/`)
- **Module-based architecture** with 11 main modules in `src/modules/`
- **Component-driven design** with reusable components in `src/components/`
- **Utility functions** for metrics and business logic in `src/utils/`

### Key Modules
- **Performance Module**: Dashboard with multiple metric dashboards (Commission, Deal Activity, Pipeline, etc.)
- **CRM Core**: Leads, contacts, companies, deals management
- **Email Management**: Native email system with templates and tracking
- **Lead Routing**: Intelligent lead assignment and routing
- **Analytics**: Real-time performance metrics and reporting
- **Team Management**: User roles and team collaboration
- **Authentication**: User auth with role-based access
- **Notifications**: Real-time notification system

### State Management Pattern
Each module has its own Zustand store in `[module]/stores/` following the pattern:
```javascript
const useModuleStore = create((set, get) => ({
  // state properties
  // actions that update state
}));
```

## Development Commands

### Frontend Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit           # Unit tests
npm run test:api            # Integration tests  
npm run test:e2e            # End-to-end tests
npm run test:security       # Security tests
npm run test:performance    # Load testing with Artillery
npm run test:all            # All test suites sequentially

# Run tests with mock server
npm run test:with-mocks

# Mock server management
npm run mockserver:start
npm run mockserver:stop
```

### Test Framework
Comprehensive testing framework with 80% coverage requirements:
- **Jest configuration** with multiple test projects
- **Test utilities** in `tests/helpers/`
- **Mock server** for external services
- **Performance testing** with Artillery
- **Security testing** for vulnerability assessment

## Key Directories

```
src/
├── modules/           # Main application modules
│   ├── [module]/
│   │   ├── stores/    # Zustand state stores
│   │   ├── components/# Module-specific components  
│   │   └── utils/     # Module utilities
├── components/        # Shared/reusable components
├── utils/            # Global utility functions
├── stores/           # Global stores (user, team)
└── services/         # External service integrations

tests/                # Comprehensive testing framework
├── unit/            # Unit tests
├── integration/     # API integration tests
├── e2e/             # End-to-end tests
├── security/        # Security tests
├── performance/     # Load tests with Artillery
└── helpers/         # Test utilities and mock server

backend-docs/         # Backend API specifications
project-docs/         # Project guidelines and documentation
database/            # Database schemas and migrations
```

## Key Files

- **App.jsx**: Main application component with routing and module management
- **main.jsx**: React entry point
- **package.json**: Dependencies and scripts
- **jest.config.js**: Test configuration with coverage thresholds
- **vite.config.js**: Build configuration
- **tailwind.config.js**: CSS framework configuration

## Development Patterns

### Adding New Features
1. Identify the appropriate module in `src/modules/`
2. Update the module's Zustand store if state changes needed
3. Create/modify components within the module
4. Add utility functions to `src/utils/` if needed globally
5. Update App.jsx navigation if new routes required
6. Write tests in appropriate test directory

### State Management
- Use Zustand for all state management
- Each module has its own store
- Global state (user, team) in `src/stores/`
- Follow existing store patterns for consistency

### Component Development  
- Use functional components with hooks
- Follow existing styling patterns with Tailwind CSS
- Use Lucide React for icons
- Maintain responsive design principles

### Testing Requirements
- All new features must include tests
- Maintain 80% code coverage minimum
- Use existing test utilities and patterns
- Include security tests for sensitive operations

## API Integration Notes

The frontend is built to integrate with a planned .NET 9.0.304 Web API backend:
- **73 REST endpoints** specified across 11 modules
- **JWT authentication** with refresh tokens
- **SignalR** for real-time features (notifications, live updates)
- **PostgreSQL** database with Entity Framework Core
- Complete API specifications in `backend-docs/API_REQUIREMENTS_SPECIFICATION.md`

## Performance Considerations

- Uses React 19.1.0 concurrent features
- Optimized with Vite for fast builds and HMR
- Zustand for efficient state management
- Component lazy loading where appropriate
- Responsive design optimized for all screen sizes

## Current Status

✅ **Complete**: Frontend application with full functionality
✅ **Complete**: Comprehensive testing framework  
✅ **Complete**: API specifications and documentation
🚧 **Planned**: .NET 9.0.304 Web API backend implementation
🚧 **Planned**: Database implementation with PostgreSQL
🚧 **Planned**: Real-time features with SignalR