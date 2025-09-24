# SalesTracker API Testing Framework

## Overview
Comprehensive API testing framework for SalesTracker CRM covering 73 REST API endpoints across 11 modules with automated testing, validation, and CI/CD integration.

## Framework Architecture

### Core Components
- **Test Utilities** (`helpers/testUtils.js`) - Central test orchestration
- **API Client** (`helpers/apiClient.js`) - HTTP testing interface
- **Schema Validator** (`helpers/schemaValidator.js`) - Response validation
- **Test Data Factory** (`helpers/testDataFactory.js`) - Test data generation
- **Mock Server** (`helpers/mockServer.js`) - External service mocking

### Test Suites
1. **Unit Tests** (`unit/businessLogic.test.js`) - Business logic validation
2. **Integration Tests** - API endpoint testing
   - Authentication (`integration/auth.test.js`)
   - Lead Management (`integration/leads.test.js`) 
   - CRM Core (`integration/crm-core.test.js`)
   - Analytics (`integration/analytics.test.js`)
3. **Security Tests** (`security/security.test.js`) - Security validation
4. **Performance Tests** (`performance/load-test.yml`) - Load testing
5. **E2E Tests** (`e2e/workflows.test.js`) - End-to-end workflows

## Quick Start

### Prerequisites
```bash
npm install
```

### Environment Setup
```bash
# Copy environment template
cp tests/config/test.env.example tests/config/test.env

# Configure test database and API endpoints
# Edit tests/config/test.env with your settings
```

### Running Tests

```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test:unit          # Unit tests
npm run test:integration   # API integration tests
npm run test:security      # Security tests  
npm run test:performance   # Performance tests
npm run test:e2e           # End-to-end tests

# Run with coverage
npm run test:coverage

# Validate framework
node tests/run-tests.js validate
```

## Test Configuration

### Jest Configuration (`jest.config.js`)
- Multiple test projects for different test types
- Coverage thresholds: 80% minimum
- Custom test environment setup
- Parallel test execution

### Performance Testing (`performance/load-test.yml`)
- Artillery configuration for load testing
- Concurrent user simulation (50-200 users)
- Response time validation (<500ms)
- Throughput testing (100+ RPS)

## API Coverage

### Authentication Module (8 endpoints)
- User registration/login/logout
- Token refresh and validation  
- Password reset workflows
- Profile management

### Lead Management Module (15 endpoints)
- CRUD operations for leads
- Lead filtering and search
- Activity tracking
- Status management
- Bulk operations

### Contact Management Module (12 endpoints)
- Contact CRUD operations
- Contact-lead relationships
- Communication history
- Contact segmentation

### Company Management Module (10 endpoints)
- Company profiles and hierarchies
- Company-contact relationships
- Industry classification
- Company analytics

### Deal Management Module (8 endpoints)
- Deal pipeline management
- Deal stages and progression
- Revenue tracking
- Win/loss analysis

### Task Management Module (6 endpoints)
- Task creation and assignment
- Due date management
- Task completion tracking
- Team collaboration

### Calendar Module (5 endpoints)
- Event scheduling
- Calendar synchronization
- Reminder management
- Meeting coordination

### Reporting Module (4 endpoints)
- Sales reports generation
- Performance analytics
- Custom report creation
- Data export functionality

### Integration Module (3 endpoints)
- Third-party integrations
- Webhook management
- API key administration

### Settings Module (2 endpoints)
- System configuration
- User preferences

## Test Data Management

### Data Factory (`helpers/testDataFactory.js`)
- **User Data**: Realistic user profiles with roles
- **Lead Data**: Complete lead records with activities
- **Company Data**: Business profiles with hierarchies
- **Deal Data**: Sales opportunities with stages
- **Contact Data**: Professional contact information

### Data Cleanup
- Automatic test data cleanup after each test
- Isolated test environments
- Data seeding for integration tests

## Security Testing

### Authentication Security
- JWT token validation
- Session management
- Password strength requirements
- Brute force protection

### Input Validation
- SQL injection prevention
- XSS protection
- CSRF validation
- Input sanitization

### Authorization Testing
- Role-based access control
- Resource-level permissions
- API endpoint security
- Data isolation validation

## Performance Testing

### Load Testing Scenarios
- **Baseline Load**: 10 concurrent users, 2 minutes
- **Normal Load**: 50 concurrent users, 5 minutes  
- **Peak Load**: 100 concurrent users, 10 minutes
- **Stress Test**: 200 concurrent users, 15 minutes

### Performance Metrics
- **Response Time**: <500ms for 95% of requests
- **Throughput**: 100+ requests per second
- **Error Rate**: <1% under normal load
- **Resource Usage**: Memory and CPU monitoring

## CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/api-tests.yml
name: API Testing
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run test:all
      - run: npm run test:performance
```

### Quality Gates
- **Test Coverage**: Minimum 80%
- **Performance**: All SLAs met
- **Security**: No critical vulnerabilities
- **Functionality**: All integration tests pass

## Mock Services

### External API Mocking (`helpers/mockServer.js`)
- Email service simulation
- SMS gateway mocking
- CRM integration endpoints
- Analytics service responses

### WebSocket Testing
- Real-time notification testing
- Connection management validation
- Message broadcasting verification

## Error Handling & Reporting

### Test Reporting
- Detailed test execution reports
- Performance metrics dashboard
- Security vulnerability reports
- Coverage analysis

### Failed Test Recovery
- Automatic retry mechanisms
- Detailed error logging
- Screenshot capture for E2E tests
- Performance degradation alerts

## Maintenance

### Regular Maintenance Tasks
- Update test data fixtures
- Review and update API schemas
- Performance baseline adjustments
- Security test enhancements

### Framework Updates
- Dependency updates
- New API endpoint coverage
- Enhanced test scenarios
- Performance optimization

## Usage Examples

### Creating a New Test
```javascript
const TestUtils = require('../helpers/testUtils');

describe('New Feature API', () => {
  let testUtils;

  beforeEach(async () => {
    testUtils = new TestUtils();
    await testUtils.setupTestEnvironment();
  });

  afterEach(async () => {
    await testUtils.cleanupTestEnvironment();
  });

  test('should handle new feature request', async () => {
    const testData = testUtils.dataFactory.createFeatureData();
    const response = await testUtils.apiClient.createFeature(testData);
    
    expect(response.status).toBe(201);
    const validation = testUtils.validateResponse(response, 201, 'featureSchema');
    expect(validation.valid).toBe(true);
  });
});
```

### Performance Test Configuration
```yaml
config:
  target: 'http://localhost:3000/api'
  phases:
    - duration: 300
      arrivalRate: 10
      name: "Warm up"
    - duration: 600  
      arrivalRate: 50
      name: "Load test"

scenarios:
  - name: "Feature workflow"
    weight: 60
    flow:
      - post:
          url: "/auth/login"
          json:
            email: "test@example.com"
            password: "testpass123"
      - get:
          url: "/features"
          expect:
            - statusCode: 200
```

## Framework Status

### ✅ Completed Components
- Complete test suite architecture
- All 73 API endpoints covered
- Security testing framework
- Performance testing configuration
- Mock services and data factories
- CI/CD integration templates
- Documentation and guides

### ⏳ Pending Backend Implementation
- Database connection configuration
- API endpoint implementation
- Authentication service setup
- Test environment deployment

### 🚀 Ready for Execution
The framework is fully configured and ready to execute once the backend APIs are implemented. All test files are in place with comprehensive coverage for the SalesTracker CRM system.