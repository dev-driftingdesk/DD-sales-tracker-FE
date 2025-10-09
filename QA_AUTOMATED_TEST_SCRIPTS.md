# QA Automated Test Scripts for Enhanced Team Management

This document provides automated test scripts for comprehensive validation of the enhanced team management integration.

## Test Script 1: Enhanced API Endpoint Validation

```javascript
// tests/integration/enhanced-team-management-api.test.js

import { enhancedTeamManagementApi } from '../../src/services/team-management/enhancedTeamManagementApiService';
import { setMockAuthToken, clearMockAuthToken } from '../helpers/authMocks';

describe('Enhanced Team Management API Integration', () => {
  beforeEach(() => {
    // Set up test authentication tokens for different roles
  });

  afterEach(() => {
    clearMockAuthToken();
  });

  describe('Enhanced User Management APIs', () => {
    test('POST /api/v2/enhanced-users/invite - Admin can invite users', async () => {
      setMockAuthToken('admin');
      
      const invitationData = {
        email: 'newuser@test.com',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        phoneNumber: '+1-555-0123',
        role: 'SalesRep',
        invitationMessage: 'Welcome to the team!'
      };

      const result = await enhancedTeamManagementApi.inviteUser(invitationData);
      
      expect(result).toBeDefined();
      expect(result.email).toBe(invitationData.email);
      expect(result.status).toBe('Pending');
    });

    test('POST /api/v2/enhanced-users/invite - Manager cannot invite Admin', async () => {
      setMockAuthToken('manager');
      
      const invitationData = {
        email: 'admin@test.com',
        role: 'Admin'
      };

      await expect(
        enhancedTeamManagementApi.inviteUser(invitationData)
      ).rejects.toThrow('Access denied');
    });

    test('GET /api/v2/enhanced-users - Tenant isolation', async () => {
      setMockAuthToken('admin', { tenantId: 'tenant1' });
      
      const users = await enhancedTeamManagementApi.getUsers();
      
      // Verify all returned users belong to the same tenant
      users.forEach(user => {
        expect(user.adminId).toBe('tenant1');
      });
    });

    test('PUT /api/v2/enhanced-users/{userId}/manager - Admin can assign managers', async () => {
      setMockAuthToken('admin');
      
      const result = await enhancedTeamManagementApi.assignManager(1, 2);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('Enhanced Team Management APIs', () => {
    test('POST /api/v2/enhanced-teams - Admin can create teams with leaders', async () => {
      setMockAuthToken('admin');
      
      const teamData = {
        name: 'Test Team',
        description: 'Test team description',
        teamLeaderId: 2
      };

      const result = await enhancedTeamManagementApi.createTeam(teamData);
      
      expect(result).toBeDefined();
      expect(result.name).toBe(teamData.name);
      expect(result.teamLeaderId).toBe(teamData.teamLeaderId);
    });

    test('POST /api/v2/enhanced-teams/{teamId}/assign-leader - Admin only', async () => {
      setMockAuthToken('manager');
      
      await expect(
        enhancedTeamManagementApi.assignTeamLeader(1, 2)
      ).rejects.toThrow('Access denied');
    });

    test('POST /api/v2/enhanced-teams/{teamId}/members - Multi-role assignment', async () => {
      setMockAuthToken('admin');
      
      const memberData = {
        userId: 3,
        role: 'Manager'
      };

      const result = await enhancedTeamManagementApi.addTeamMember(1, memberData);
      
      expect(result).toBeDefined();
      expect(result.userId).toBe(memberData.userId);
      expect(result.role).toBe(memberData.role);
    });

    test('GET /api/v2/enhanced-teams/{teamId}/users - Manager access', async () => {
      setMockAuthToken('manager');
      
      const result = await enhancedTeamManagementApi.getTeamUsers(1);
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Enhanced Invitation System', () => {
    test('POST /api/v2/invitations/send - Role-based invitation', async () => {
      setMockAuthToken('manager');
      
      const invitationData = {
        email: 'invite@test.com',
        teamId: 1,
        role: 'SalesRep',
        invitationMessage: 'Join our team!'
      };

      const result = await enhancedTeamManagementApi.sendInvitation(invitationData);
      
      expect(result).toBeDefined();
      expect(result.email).toBe(invitationData.email);
    });

    test('POST /api/v2/invitations/{id}/accept - Public endpoint', async () => {
      // No auth token needed for public endpoint
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        password: 'SecurePass123!',
        phoneNumber: '+1-555-0123'
      };

      const result = await enhancedTeamManagementApi.acceptInvitation('invite-123', userData);
      
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
    });

    test('POST /api/v2/invitations/{id}/resend - Manager access', async () => {
      setMockAuthToken('manager');
      
      const result = await enhancedTeamManagementApi.resendInvitation('invite-123', 'Reminder message');
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });
});
```

## Test Script 2: Role-Based Access Control Validation

```javascript
// tests/unit/role-based-access.test.js

import { render, screen } from '@testing-library/react';
import { useRoleBasedAccess } from '../../src/hooks/useRoleBasedAccess';
import UserForm from '../../src/modules/team-management/components/UserForm';
import { setMockUser } from '../helpers/authMocks';

describe('Role-Based Access Control', () => {
  describe('useRoleBasedAccess Hook', () => {
    test('Admin has all permissions', () => {
      setMockUser({ role: 'Admin' });
      
      const { result } = renderHook(() => useRoleBasedAccess());
      
      expect(result.current.canAccess('invite_user_button')).toBe(true);
      expect(result.current.canAccess('assign_manager_dropdown')).toBe(true);
      expect(result.current.canAccess('create_team_button')).toBe(true);
      expect(result.current.canAccess('team_leader_assignment')).toBe(true);
    });

    test('Manager has limited permissions', () => {
      setMockUser({ role: 'Manager' });
      
      const { result } = renderHook(() => useRoleBasedAccess());
      
      expect(result.current.canAccess('invite_user_button')).toBe(false);
      expect(result.current.canAccess('assign_manager_dropdown')).toBe(false);
      expect(result.current.canAccess('add_team_member_button')).toBe(true);
      expect(result.current.canAccess('send_invitation_button')).toBe(true);
    });

    test('SalesRep has minimal permissions', () => {
      setMockUser({ role: 'SalesRep' });
      
      const { result } = renderHook(() => useRoleBasedAccess());
      
      expect(result.current.canAccess('invite_user_button')).toBe(false);
      expect(result.current.canAccess('assign_manager_dropdown')).toBe(false);
      expect(result.current.canAccess('create_team_button')).toBe(false);
      expect(result.current.canAccess('add_team_member_button')).toBe(false);
    });

    test('Data filtering by role', () => {
      setMockUser({ role: 'Manager', id: 2, teams: [1, 2] });
      
      const { result } = renderHook(() => useRoleBasedAccess());
      
      const allUsers = [
        { id: 1, managerId: null, teams: [1] },
        { id: 2, managerId: null, teams: [1, 2] },
        { id: 3, managerId: 2, teams: [1] },
        { id: 4, managerId: 5, teams: [3] }
      ];
      
      const filteredUsers = result.current.getFilteredData('users', allUsers);
      
      // Manager should see own data and subordinates
      expect(filteredUsers).toHaveLength(2);
      expect(filteredUsers.some(u => u.id === 2)).toBe(true); // Self
      expect(filteredUsers.some(u => u.id === 3)).toBe(true); // Subordinate
    });
  });

  describe('UserForm Role-Based UI', () => {
    test('Admin sees all form sections', () => {
      setMockUser({ role: 'Admin' });
      
      render(<UserForm user={null} onClose={() => {}} />);
      
      expect(screen.getByText('Manager')).toBeInTheDocument();
      expect(screen.getByText('Team Assignment')).toBeInTheDocument();
      expect(screen.getByText('Send Invitation')).toBeInTheDocument();
    });

    test('Manager sees limited form sections', () => {
      setMockUser({ role: 'Manager' });
      
      render(<UserForm user={null} onClose={() => {}} />);
      
      expect(screen.queryByText('Manager Assignment')).not.toBeInTheDocument();
      expect(screen.getByText('Team Assignment')).toBeInTheDocument();
    });

    test('SalesRep sees read-only form', () => {
      setMockUser({ role: 'SalesRep' });
      
      render(<UserForm user={null} onClose={() => {}} />);
      
      expect(screen.queryByText('Send Invitation')).not.toBeInTheDocument();
      expect(screen.getByText('Permission Required')).toBeInTheDocument();
    });
  });
});
```

## Test Script 3: Multi-Team Membership Validation

```javascript
// tests/integration/multi-team-membership.test.js

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserForm from '../../src/modules/team-management/components/UserForm';
import useTeamManagementStore from '../../src/modules/team-management/stores/teamManagementStore';
import { setMockUser } from '../helpers/authMocks';

describe('Multi-Team Membership', () => {
  const mockTeams = [
    { id: 1, name: 'Sales Team', description: 'Sales team' },
    { id: 2, name: 'Marketing Team', description: 'Marketing team' },
    { id: 3, name: 'Support Team', description: 'Support team' }
  ];

  beforeEach(() => {
    setMockUser({ role: 'Admin' });
    useTeamManagementStore.setState({ teams: mockTeams });
  });

  test('User can be assigned to multiple teams', async () => {
    render(<UserForm user={null} onClose={() => {}} />);
    
    // Select multiple teams
    const salesTeamCheckbox = screen.getByLabelText(/Sales Team/);
    const marketingTeamCheckbox = screen.getByLabelText(/Marketing Team/);
    
    fireEvent.click(salesTeamCheckbox);
    fireEvent.click(marketingTeamCheckbox);
    
    await waitFor(() => {
      expect(salesTeamCheckbox).toBeChecked();
      expect(marketingTeamCheckbox).toBeChecked();
    });
    
    // Verify team summary shows both teams
    expect(screen.getByText('Selected Teams (2):')).toBeInTheDocument();
  });

  test('Different roles can be assigned per team', async () => {
    render(<UserForm user={null} onClose={() => {}} />);
    
    // Select teams and assign different roles
    const salesTeamCheckbox = screen.getByLabelText(/Sales Team/);
    fireEvent.click(salesTeamCheckbox);
    
    await waitFor(() => {
      const roleSelect = screen.getByDisplayValue('Sales Rep');
      fireEvent.change(roleSelect, { target: { value: 'Manager' } });
    });
    
    const marketingTeamCheckbox = screen.getByLabelText(/Marketing Team/);
    fireEvent.click(marketingTeamCheckbox);
    
    // Verify different roles are displayed
    await waitFor(() => {
      expect(screen.getByText('Sales Team (Manager)')).toBeInTheDocument();
      expect(screen.getByText('Marketing Team (Sales Rep)')).toBeInTheDocument();
    });
  });

  test('Team assignment data structure validation', async () => {
    const mockCreateUser = jest.fn();
    useTeamManagementStore.setState({ createUser: mockCreateUser });
    
    render(<UserForm user={null} onClose={() => {}} />);
    
    // Fill required fields
    fireEvent.change(screen.getByLabelText(/First Name/), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Username/), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'john@test.com' } });
    
    // Select teams with roles
    const salesTeamCheckbox = screen.getByLabelText(/Sales Team/);
    fireEvent.click(salesTeamCheckbox);
    
    await waitFor(() => {
      const roleSelect = screen.getByDisplayValue('Sales Rep');
      fireEvent.change(roleSelect, { target: { value: 'Manager' } });
    });
    
    // Submit form
    fireEvent.click(screen.getByText('Send Invitation'));
    
    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          teams: expect.arrayContaining([
            expect.objectContaining({
              teamId: 1,
              teamName: 'Sales Team',
              role: 'Manager'
            })
          ])
        })
      );
    });
  });

  test('Team membership consistency validation', () => {
    const userData = {
      id: 1,
      teams: [
        { teamId: 1, teamName: 'Sales Team', role: 'Manager' },
        { teamId: 2, teamName: 'Marketing Team', role: 'SalesRep' }
      ]
    };
    
    render(<UserForm user={userData} onClose={() => {}} />);
    
    // Verify both teams are shown as selected
    expect(screen.getByText('Sales Team (Manager)')).toBeInTheDocument();
    expect(screen.getByText('Marketing Team (SalesRep)')).toBeInTheDocument();
    
    // Verify summary shows correct count
    expect(screen.getByText('Selected Teams (2):')).toBeInTheDocument();
  });
});
```

## Test Script 4: Security Validation Automation

```javascript
// tests/security/security-validation.test.js

import { enhancedTeamManagementApi } from '../../src/services/team-management/enhancedTeamManagementApiService';
import { setMockAuthToken, clearMockAuthToken } from '../helpers/authMocks';

describe('Security Validation', () => {
  afterEach(() => {
    clearMockAuthToken();
  });

  describe('JWT Token Validation', () => {
    test('Invalid token is rejected', async () => {
      setMockAuthToken('invalid');
      
      await expect(
        enhancedTeamManagementApi.getUsers()
      ).rejects.toThrow('Unauthorized');
    });

    test('Expired token is handled', async () => {
      setMockAuthToken('expired');
      
      await expect(
        enhancedTeamManagementApi.getUsers()
      ).rejects.toThrow('Token expired');
    });

    test('Role claims are validated', async () => {
      setMockAuthToken('salesrep');
      
      await expect(
        enhancedTeamManagementApi.inviteUser({ email: 'test@test.com' })
      ).rejects.toThrow('Access denied');
    });
  });

  describe('Tenant Isolation', () => {
    test('Cross-tenant data access is prevented', async () => {
      setMockAuthToken('admin', { tenantId: 'tenant1' });
      
      // Attempt to access data from different tenant
      await expect(
        enhancedTeamManagementApi.getUsers({ tenantId: 'tenant2' })
      ).rejects.toThrow('Access denied');
    });

    test('Tenant filtering is enforced', async () => {
      setMockAuthToken('admin', { tenantId: 'tenant1' });
      
      const users = await enhancedTeamManagementApi.getUsers();
      
      // All returned data should belong to the user's tenant
      users.forEach(user => {
        expect(user.tenantId).toBe('tenant1');
      });
    });
  });

  describe('Permission Boundary Testing', () => {
    test('Manager cannot perform admin operations', async () => {
      setMockAuthToken('manager');
      
      await expect(
        enhancedTeamManagementApi.assignManager(1, 2)
      ).rejects.toThrow('Admin role required');
    });

    test('SalesRep cannot perform management operations', async () => {
      setMockAuthToken('salesrep');
      
      await expect(
        enhancedTeamManagementApi.addTeamMember(1, { userId: 2 })
      ).rejects.toThrow('Manager or Admin role required');
    });

    test('Role hierarchy is enforced', async () => {
      setMockAuthToken('manager');
      
      await expect(
        enhancedTeamManagementApi.inviteUser({ role: 'Admin' })
      ).rejects.toThrow('Cannot assign higher role');
    });
  });

  describe('Input Validation Security', () => {
    test('XSS prevention in text fields', async () => {
      setMockAuthToken('admin');
      
      const maliciousInput = '<script>alert("xss")</script>';
      
      await expect(
        enhancedTeamManagementApi.inviteUser({
          firstName: maliciousInput,
          email: 'test@test.com'
        })
      ).rejects.toThrow('Invalid input detected');
    });

    test('SQL injection prevention', async () => {
      setMockAuthToken('admin');
      
      const sqlInjection = "'; DROP TABLE users; --";
      
      await expect(
        enhancedTeamManagementApi.getUsers({ search: sqlInjection })
      ).rejects.toThrow('Invalid search parameter');
    });
  });
});
```

## Test Script 5: Performance & Load Testing

```javascript
// tests/performance/performance.test.js

import { enhancedTeamManagementApi } from '../../src/services/team-management/enhancedTeamManagementApiService';
import { setMockAuthToken } from '../helpers/authMocks';

describe('Performance Testing', () => {
  beforeAll(() => {
    setMockAuthToken('admin');
  });

  describe('API Response Times', () => {
    test('User list API responds within 200ms', async () => {
      const startTime = Date.now();
      
      await enhancedTeamManagementApi.getUsers();
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(200);
    });

    test('Team creation API responds within 300ms', async () => {
      const startTime = Date.now();
      
      await enhancedTeamManagementApi.createTeam({
        name: 'Performance Test Team',
        description: 'Test team for performance validation'
      });
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(300);
    });

    test('Invitation API responds within 250ms', async () => {
      const startTime = Date.now();
      
      await enhancedTeamManagementApi.inviteUser({
        email: 'perf@test.com',
        firstName: 'Performance',
        lastName: 'Test'
      });
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(250);
    });
  });

  describe('Large Dataset Handling', () => {
    test('Pagination works efficiently with 1000+ users', async () => {
      const filters = { page: 1, pageSize: 50 };
      
      const startTime = Date.now();
      const result = await enhancedTeamManagementApi.getUsers(filters);
      const responseTime = Date.now() - startTime;
      
      expect(result.data).toBeDefined();
      expect(result.data.length).toBeLessThanOrEqual(50);
      expect(responseTime).toBeLessThan(500);
    });

    test('Search performs efficiently', async () => {
      const searchTerm = 'test';
      
      const startTime = Date.now();
      const result = await enhancedTeamManagementApi.getUsers({ search: searchTerm });
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(300);
      expect(result.data).toBeDefined();
    });
  });

  describe('Concurrent Request Handling', () => {
    test('Multiple simultaneous requests', async () => {
      const promises = Array(10).fill().map(() => 
        enhancedTeamManagementApi.getUsers()
      );
      
      const startTime = Date.now();
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      expect(results).toHaveLength(10);
      expect(totalTime).toBeLessThan(1000); // 10 requests in under 1 second
    });
  });
});
```

## Test Execution Commands

```bash
# Run all enhanced team management tests
npm run test:enhanced-team-management

# Run security tests only
npm run test:security

# Run performance tests only
npm run test:performance

# Run with coverage report
npm run test:enhanced-team-management -- --coverage

# Run specific test suite
npm run test -- tests/integration/enhanced-team-management-api.test.js

# Run tests in watch mode during development
npm run test:watch -- tests/integration/enhanced-team-management-api.test.js
```

## Continuous Integration Integration

```yaml
# .github/workflows/enhanced-team-management-qa.yml
name: Enhanced Team Management QA

on:
  push:
    paths:
      - 'src/modules/team-management/**'
      - 'src/services/team-management/**'
      - 'tests/**/*team-management*'

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run Enhanced Team Management Tests
        run: npm run test:enhanced-team-management
        
      - name: Run Security Tests
        run: npm run test:security
        
      - name: Run Performance Tests
        run: npm run test:performance
        
      - name: Generate Coverage Report
        run: npm run test:coverage
        
      - name: Upload Coverage to Codecov
        uses: codecov/codecov-action@v3
```

These automated test scripts provide comprehensive validation of all enhanced team management features and should be integrated into the CI/CD pipeline for continuous quality assurance.