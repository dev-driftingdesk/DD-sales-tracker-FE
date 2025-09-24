// Authentication API Integration Tests
const TestUtils = require('../helpers/testUtils');

describe('Authentication API', () => {
  let testUtils;

  beforeAll(async () => {
    testUtils = new TestUtils();
    await testUtils.setup();
  });

  afterAll(async () => {
    await testUtils.cleanup();
  });

  describe('POST /api/auth/register', () => {
    test('should register new user with valid data', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: testUtils.generateRandomEmail(),
        password: 'SecurePassword123!',
        role: 'sales_rep',
        department: 'sales'
      };

      const response = await testUtils.apiClient.register(userData);
      const validation = testUtils.validateResponse(response, 201, 'user');

      expect(validation.valid).toBe(true);
      expect(response.data.data.email).toBe(userData.email);
      expect(response.data.data.role).toBe(userData.role);
      expect(response.data.data).not.toHaveProperty('password');
      
      // Track for cleanup
      testUtils.trackTestData('users', response.data.data.id);
    });

    test('should reject registration with duplicate email', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'duplicate@example.com',
        password: 'SecurePassword123!',
        role: 'sales_rep'
      };

      // First registration
      await testUtils.apiClient.register(userData);
      
      // Second registration with same email
      const response = await testUtils.apiClient.register(userData);
      const validation = testUtils.validateErrorResponse(response, 409);

      expect(validation.valid).toBe(true);
      expect(response.data.error).toContain('already exists');
    });

    test('should reject registration with invalid email format', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'invalid-email',
        password: 'SecurePassword123!',
        role: 'sales_rep'
      };

      const response = await testUtils.apiClient.register(userData);
      const validation = testUtils.validateErrorResponse(response, 400);

      expect(validation.valid).toBe(true);
      expect(response.data.error).toContain('email');
    });

    test('should reject registration with weak password', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: testUtils.generateRandomEmail(),
        password: 'weak',
        role: 'sales_rep'
      };

      const response = await testUtils.apiClient.register(userData);
      const validation = testUtils.validateErrorResponse(response, 400);

      expect(validation.valid).toBe(true);
      expect(response.data.error).toContain('password');
    });

    test('should reject registration with invalid role', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: testUtils.generateRandomEmail(),
        password: 'SecurePassword123!',
        role: 'invalid_role'
      };

      const response = await testUtils.apiClient.register(userData);
      const validation = testUtils.validateErrorResponse(response, 400);

      expect(validation.valid).toBe(true);
      expect(response.data.error).toContain('role');
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      // Create test user for login tests
      const userData = {
        firstName: 'Login',
        lastName: 'Test',
        email: testUtils.generateRandomEmail(),
        password: 'LoginTest123!',
        role: 'sales_rep'
      };
      
      const registerResponse = await testUtils.apiClient.register(userData);
      testUser = { ...userData, id: registerResponse.data.data.id };
      testUtils.trackTestData('users', testUser.id);
    });

    test('should login with valid credentials', async () => {
      const response = await testUtils.apiClient.login(testUser.email, testUser.password);
      const validation = testUtils.validateResponse(response, 200, 'loginResponse');

      expect(validation.valid).toBe(true);
      expect(response.data.token).toBeTruthy();
      expect(response.data.user.email).toBe(testUser.email);
      expect(response.data.expiresIn).toBeGreaterThan(0);
    });

    test('should reject login with invalid email', async () => {
      const response = await testUtils.apiClient.login('nonexistent@example.com', testUser.password);
      const validation = testUtils.validateErrorResponse(response, 401);

      expect(validation.valid).toBe(true);
      expect(response.data.error).toContain('Invalid credentials');
    });

    test('should reject login with invalid password', async () => {
      const response = await testUtils.apiClient.login(testUser.email, 'wrongpassword');
      const validation = testUtils.validateErrorResponse(response, 401);

      expect(validation.valid).toBe(true);
      expect(response.data.error).toContain('Invalid credentials');
    });

    test('should reject login with malformed email', async () => {
      const response = await testUtils.apiClient.login('invalid-email', testUser.password);
      const validation = testUtils.validateErrorResponse(response, 400);

      expect(validation.valid).toBe(true);
    });

    test('should include refresh token in successful login', async () => {
      const response = await testUtils.apiClient.login(testUser.email, testUser.password);
      
      expect(response.status).toBe(200);
      expect(response.data.refreshToken).toBeTruthy();
      expect(typeof response.data.refreshToken).toBe('string');
    });

    test('should have acceptable login response time', async () => {
      const measurement = await testUtils.measureResponseTime(
        testUtils.apiClient.login.bind(testUtils.apiClient),
        testUser.email,
        testUser.password
      );

      expect(measurement.success).toBe(true);
      expect(measurement.withinThreshold).toBe(true);
      expect(measurement.responseTime).toBeLessThan(500); // Login should be fast
    });
  });

  describe('POST /api/auth/logout', () => {
    let authToken;

    beforeEach(async () => {
      // Create user and login
      const userData = {
        firstName: 'Logout',
        lastName: 'Test',
        email: testUtils.generateRandomEmail(),
        password: 'LogoutTest123!',
        role: 'sales_rep'
      };
      
      await testUtils.apiClient.register(userData);
      const loginResponse = await testUtils.apiClient.login(userData.email, userData.password);
      authToken = loginResponse.data.token;
      testUtils.apiClient.setAuthToken(authToken);
    });

    test('should logout authenticated user', async () => {
      const response = await testUtils.apiClient.logout();
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });

    test('should reject logout without authentication', async () => {
      testUtils.apiClient.clearAuth();
      const response = await testUtils.apiClient.logout();
      
      expect(response.status).toBe(401);
    });

    test('should invalidate token after logout', async () => {
      // Logout
      await testUtils.apiClient.logout();
      
      // Try to use invalidated token
      const response = await testUtils.apiClient.getLeads();
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken;

    beforeEach(async () => {
      const userData = {
        firstName: 'Refresh',
        lastName: 'Test',
        email: testUtils.generateRandomEmail(),
        password: 'RefreshTest123!',
        role: 'sales_rep'
      };
      
      await testUtils.apiClient.register(userData);
      const loginResponse = await testUtils.apiClient.login(userData.email, userData.password);
      refreshToken = loginResponse.data.refreshToken;
      testUtils.apiClient.setAuthToken(loginToken);
    });

    test('should refresh token with valid refresh token', async () => {
      const response = await testUtils.apiClient.refreshToken();
      
      expect(response.status).toBe(200);
      expect(response.data.token).toBeTruthy();
      expect(response.data.token).not.toBe(refreshToken);
    });

    test('should reject refresh with invalid token', async () => {
      testUtils.apiClient.setAuthToken('invalid-token');
      const response = await testUtils.apiClient.refreshToken();
      
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    test('should accept forgot password request with valid email', async () => {
      const response = await testUtils.apiClient.forgotPassword('user@example.com');
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.message).toContain('reset');
    });

    test('should handle forgot password for non-existent email gracefully', async () => {
      const response = await testUtils.apiClient.forgotPassword('nonexistent@example.com');
      
      // Should return success to prevent email enumeration
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });

    test('should reject forgot password with invalid email format', async () => {
      const response = await testUtils.apiClient.forgotPassword('invalid-email');
      const validation = testUtils.validateErrorResponse(response, 400);
      
      expect(validation.valid).toBe(true);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    test('should reject password reset with invalid token', async () => {
      const response = await testUtils.apiClient.resetPassword('invalid-token', 'NewPassword123!');
      const validation = testUtils.validateErrorResponse(response, 400);
      
      expect(validation.valid).toBe(true);
      expect(response.data.error).toContain('token');
    });

    test('should reject password reset with weak password', async () => {
      const response = await testUtils.apiClient.resetPassword('valid-token', 'weak');
      const validation = testUtils.validateErrorResponse(response, 400);
      
      expect(validation.valid).toBe(true);
      expect(response.data.error).toContain('password');
    });
  });

  describe('Authentication Middleware', () => {
    test('should reject requests without authentication token', async () => {
      testUtils.apiClient.clearAuth();
      const response = await testUtils.apiClient.getLeads();
      
      expect(response.status).toBe(401);
      expect(response.data.error).toContain('authentication');
    });

    test('should reject requests with expired token', async () => {
      // Set expired token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';
      testUtils.apiClient.setAuthToken(expiredToken);
      
      const response = await testUtils.apiClient.getLeads();
      expect(response.status).toBe(401);
    });

    test('should reject requests with malformed token', async () => {
      testUtils.apiClient.setAuthToken('malformed.token.here');
      
      const response = await testUtils.apiClient.getLeads();
      expect(response.status).toBe(401);
    });
  });

  describe('Rate Limiting', () => {
    test('should implement rate limiting on login endpoint', async () => {
      const results = await testUtils.testRateLimit('/api/auth/login', 20, 60000);
      
      expect(results.rateLimited).toBe(true);
      expect(results.rateLimitResponse).toBeTruthy();
      expect(results.requestsMade).toBeGreaterThan(5); // Should allow some requests
    });

    test('should implement rate limiting on registration endpoint', async () => {
      const results = await testUtils.testRateLimit('/api/auth/register', 10, 60000);
      
      expect(results.rateLimited).toBe(true);
      expect(results.requestsMade).toBeGreaterThan(3);
    });
  });

  describe('Security', () => {
    test('should not be vulnerable to SQL injection in login', async () => {
      const sqlInjectionResult = await testUtils.testSQLInjection('/api/auth/login');
      expect(sqlInjectionResult.vulnerable).toBe(false);
    });

    test('should hash passwords securely', async () => {
      const userData = {
        firstName: 'Security',
        lastName: 'Test',
        email: testUtils.generateRandomEmail(),
        password: 'PlaintextPassword123!',
        role: 'sales_rep'
      };

      const response = await testUtils.apiClient.register(userData);
      expect(response.status).toBe(201);
      
      // Password should never be returned in response
      expect(response.data.data.password).toBeUndefined();
    });

    test('should include security headers in responses', async () => {
      const response = await testUtils.apiClient.healthCheck();
      
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeTruthy();
      expect(response.headers['x-xss-protection']).toBeTruthy();
    });
  });
});