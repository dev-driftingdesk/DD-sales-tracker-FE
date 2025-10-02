/**
 * Authentication Session Persistence QA Tests
 * 
 * Tests for the critical authentication session persistence bug fixes:
 * - Enhanced authentication store with proper loading states
 * - Improved App.jsx initialization sequence  
 * - Better session persistence across page refreshes
 * - Fixed race conditions in authentication verification
 */

const puppeteer = require('puppeteer');
const path = require('path');

describe('Authentication Session Persistence QA', () => {
  let browser;
  let page;
  let context;
  
  const APP_URL = 'http://localhost:5173';
  
  // Test credentials
  const TEST_CREDENTIALS = {
    admin: { email: 'admin@salestracker.com', password: 'admin123', name: 'John Admin' },
    manager: { email: 'manager@salestracker.com', password: 'manager123', name: 'Sarah Manager' },
    sales: { email: 'sales@salestracker.com', password: 'sales123', name: 'Mike Rep' }
  };

  beforeAll(async () => {
    browser = await puppeteer.launch({ 
      headless: false, // Set to true for CI/CD
      devtools: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1280, height: 720 }
    });
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    context = await browser.createIncognitoBrowserContext();
    page = await context.newPage();
    
    // Setup console logging for debugging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('PAGE ERROR:', msg.text());
      }
    });
    
    // Setup request/response monitoring
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`HTTP ${response.status()}: ${response.url()}`);
      }
    });
  });

  afterEach(async () => {
    if (context) {
      await context.close();
    }
  });

  describe('1. Critical Authentication Flow Validation', () => {
    test('should login successfully and access dashboard', async () => {
      await page.goto(APP_URL);
      
      // Wait for login form to load
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      // Perform login
      await page.type('input[type="email"]', TEST_CREDENTIALS.admin.email);
      await page.type('input[type="password"]', TEST_CREDENTIALS.admin.password);
      
      // Click login button
      const loginButton = await page.waitForSelector('button[type="submit"]');
      await loginButton.click();
      
      // Wait for dashboard to load (should see sidebar navigation)
      await page.waitForSelector('.bg-gray-900', { timeout: 10000 });
      
      // Verify we're on the dashboard
      const dashboardElement = await page.$('.bg-gray-900');
      expect(dashboardElement).toBeTruthy();
      
      // Verify user name is displayed
      const userNameElement = await page.waitForSelector('text/John', { timeout: 5000 });
      expect(userNameElement).toBeTruthy();
    });

    test('CRITICAL: should remain authenticated after page refresh', async () => {
      await page.goto(APP_URL);
      
      // Login first
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.type('input[type="email"]', TEST_CREDENTIALS.admin.email);
      await page.type('input[type="password"]', TEST_CREDENTIALS.admin.password);
      
      const loginButton = await page.waitForSelector('button[type="submit"]');
      await loginButton.click();
      
      // Wait for dashboard
      await page.waitForSelector('.bg-gray-900', { timeout: 10000 });
      
      // CRITICAL TEST: Refresh the page
      await page.reload({ waitUntil: 'networkidle0' });
      
      // Should NOT see login form after refresh
      const loginForm = await page.$('input[type="email"]');
      expect(loginForm).toBeNull();
      
      // Should still see dashboard
      const dashboardElement = await page.waitForSelector('.bg-gray-900', { timeout: 10000 });
      expect(dashboardElement).toBeTruthy();
      
      // Should still see user info
      const userElement = await page.$('text/John');
      expect(userElement).toBeTruthy();
    });

    test('should persist authentication in new browser tab', async () => {
      await page.goto(APP_URL);
      
      // Login
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.type('input[type="email"]', TEST_CREDENTIALS.manager.email);
      await page.type('input[type="password"]', TEST_CREDENTIALS.manager.password);
      
      const loginButton = await page.waitForSelector('button[type="submit"]');
      await loginButton.click();
      
      // Wait for dashboard
      await page.waitForSelector('.bg-gray-900', { timeout: 10000 });
      
      // Open new tab in same context
      const newPage = await context.newPage();
      await newPage.goto(APP_URL);
      
      // Should automatically be logged in (no login form)
      const loginForm = await newPage.$('input[type="email"]');
      expect(loginForm).toBeNull();
      
      // Should see dashboard immediately
      const dashboardElement = await newPage.waitForSelector('.bg-gray-900', { timeout: 10000 });
      expect(dashboardElement).toBeTruthy();
      
      await newPage.close();
    });

    test('should clear session on logout and redirect to login', async () => {
      await page.goto(APP_URL);
      
      // Login
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.type('input[type="email"]', TEST_CREDENTIALS.sales.email);
      await page.type('input[type="password"]', TEST_CREDENTIALS.sales.password);
      
      const loginButton = await page.waitForSelector('button[type="submit"]');
      await loginButton.click();
      
      // Wait for dashboard
      await page.waitForSelector('.bg-gray-900', { timeout: 10000 });
      
      // Click logout button
      const logoutButton = await page.waitForSelector('button[title="Logout"]');
      await logoutButton.click();
      
      // Should redirect to login page
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      // Verify login form is visible
      const loginForm = await page.$('input[type="email"]');
      expect(loginForm).toBeTruthy();
      
      // Verify no dashboard elements
      const dashboardElement = await page.$('.bg-gray-900');
      expect(dashboardElement).toBeNull();
    });
  });

  describe('2. Edge Case Testing', () => {
    test('should handle rapid page refreshes during login process', async () => {
      await page.goto(APP_URL);
      
      // Start login process
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.type('input[type="email"]', TEST_CREDENTIALS.admin.email);
      await page.type('input[type="password"]', TEST_CREDENTIALS.admin.password);
      
      const loginButton = await page.waitForSelector('button[type="submit"]');
      
      // Click login and immediately refresh multiple times
      await loginButton.click();
      
      // Rapid refresh sequence
      setTimeout(() => page.reload(), 100);
      setTimeout(() => page.reload(), 200);
      setTimeout(() => page.reload(), 300);
      
      // Wait for final state to settle
      await page.waitForTimeout(2000);
      
      // Should either be logged in or show login form (no crashed state)
      const hasLoginForm = await page.$('input[type="email"]') !== null;
      const hasDashboard = await page.$('.bg-gray-900') !== null;
      
      // Should be in one of the two valid states (not crashed)
      expect(hasLoginForm || hasDashboard).toBe(true);
    });

    test('should handle invalid token scenarios gracefully', async () => {
      await page.goto(APP_URL);
      
      // Inject invalid token into localStorage
      await page.evaluateOnNewDocument(() => {
        localStorage.setItem('auth-storage', JSON.stringify({
          state: {
            user: { id: '1', name: 'Test User', email: 'test@example.com' },
            isAuthenticated: true
          }
        }));
      });
      
      await page.reload();
      
      // Should detect invalid session and show login form
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      const loginForm = await page.$('input[type="email"]');
      expect(loginForm).toBeTruthy();
    });

    test('should handle network interruption during authentication', async () => {
      await page.goto(APP_URL);
      
      // Simulate offline condition
      await page.setOfflineMode(true);
      
      // Try to login while offline
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.type('input[type="email"]', TEST_CREDENTIALS.admin.email);
      await page.type('input[type="password"]', TEST_CREDENTIALS.admin.password);
      
      const loginButton = await page.waitForSelector('button[type="submit"]');
      await loginButton.click();
      
      // Should handle offline gracefully (show error or loading state)
      await page.waitForTimeout(3000);
      
      // Re-enable network
      await page.setOfflineMode(false);
      
      // Should recover gracefully
      const isStillOnLoginPage = await page.$('input[type="email"]') !== null;
      expect(isStillOnLoginPage).toBe(true);
    });
  });

  describe('3. User Experience Validation', () => {
    test('should show loading states during authentication initialization', async () => {
      await page.goto(APP_URL);
      
      // Check for loading indicator during initial load
      const loadingIndicator = await page.waitForSelector('.animate-spin', { timeout: 2000 });
      expect(loadingIndicator).toBeTruthy();
      
      // Loading should disappear and show either login or dashboard
      await page.waitForFunction(
        () => !document.querySelector('.animate-spin') || 
              document.querySelector('input[type="email"]') || 
              document.querySelector('.bg-gray-900'),
        { timeout: 10000 }
      );
      
      const finalState = await page.evaluate(() => ({
        hasSpinner: !!document.querySelector('.animate-spin'),
        hasLogin: !!document.querySelector('input[type="email"]'),
        hasDashboard: !!document.querySelector('.bg-gray-900')
      }));
      
      expect(finalState.hasSpinner).toBe(false);
      expect(finalState.hasLogin || finalState.hasDashboard).toBe(true);
    });

    test('should NOT flicker between login and dashboard states', async () => {
      await page.goto(APP_URL);
      
      // Monitor for flickering by tracking state changes
      const stateChanges = [];
      
      await page.evaluateOnNewDocument(() => {
        window.stateChanges = [];
        const observer = new MutationObserver(() => {
          const hasLogin = !!document.querySelector('input[type="email"]');
          const hasDashboard = !!document.querySelector('.bg-gray-900');
          window.stateChanges.push({ hasLogin, hasDashboard, timestamp: Date.now() });
        });
        observer.observe(document.body, { childList: true, subtree: true });
      });
      
      // Wait for app to stabilize
      await page.waitForFunction(
        () => document.querySelector('input[type="email"]') || document.querySelector('.bg-gray-900'),
        { timeout: 10000 }
      );
      
      // Get state changes
      const changes = await page.evaluate(() => window.stateChanges || []);
      
      // Should not have excessive state switching (flickering)
      const stateFlips = changes.filter((change, index) => {
        if (index === 0) return false;
        const prev = changes[index - 1];
        return (change.hasLogin !== prev.hasLogin) || (change.hasDashboard !== prev.hasDashboard);
      });
      
      expect(stateFlips.length).toBeLessThan(3); // Allow minimal state changes during initialization
    });

    test('should display proper error messages for failed authentication', async () => {
      await page.goto(APP_URL);
      
      // Try invalid credentials
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.type('input[type="email"]', 'invalid@example.com');
      await page.type('input[type="password"]', 'wrongpassword');
      
      const loginButton = await page.waitForSelector('button[type="submit"]');
      await loginButton.click();
      
      // Should show error message
      const errorMessage = await page.waitForSelector('.text-red-500, .text-red-600, [role="alert"]', { timeout: 5000 });
      expect(errorMessage).toBeTruthy();
      
      // Should remain on login page
      const loginForm = await page.$('input[type="email"]');
      expect(loginForm).toBeTruthy();
    });
  });

  describe('4. Session Management Testing', () => {
    test('should persist authentication state in localStorage', async () => {
      await page.goto(APP_URL);
      
      // Login
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.type('input[type="email"]', TEST_CREDENTIALS.admin.email);
      await page.type('input[type="password"]', TEST_CREDENTIALS.admin.password);
      
      const loginButton = await page.waitForSelector('button[type="submit"]');
      await loginButton.click();
      
      // Wait for dashboard
      await page.waitForSelector('.bg-gray-900', { timeout: 10000 });
      
      // Check localStorage for auth data
      const authData = await page.evaluate(() => {
        return localStorage.getItem('auth-storage');
      });
      
      expect(authData).toBeTruthy();
      
      const parsedAuthData = JSON.parse(authData);
      expect(parsedAuthData.state.isAuthenticated).toBe(true);
      expect(parsedAuthData.state.user).toBeTruthy();
      expect(parsedAuthData.state.user.email).toBe(TEST_CREDENTIALS.admin.email);
    });

    test('should maintain authentication consistency across app', async () => {
      await page.goto(APP_URL);
      
      // Login
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.type('input[type="email"]', TEST_CREDENTIALS.manager.email);
      await page.type('input[type="password"]', TEST_CREDENTIALS.manager.password);
      
      const loginButton = await page.waitForSelector('button[type="submit"]');
      await loginButton.click();
      
      // Wait for dashboard
      await page.waitForSelector('.bg-gray-900', { timeout: 10000 });
      
      // Navigate through different modules to ensure auth state consistency
      const modules = [
        'button:has-text("CRM Core")',
        'button:has-text("Email Management")',
        'button:has-text("Leads")',
        'button:has-text("Performance")'
      ];
      
      for (const moduleSelector of modules) {
        const moduleButton = await page.$(moduleSelector);
        if (moduleButton) {
          await moduleButton.click();
          await page.waitForTimeout(500); // Let module load
          
          // Should still be authenticated (user info visible)
          const userElement = await page.$('text/Sarah');
          expect(userElement).toBeTruthy();
        }
      }
    });

    test('should properly cleanup on logout', async () => {
      await page.goto(APP_URL);
      
      // Login
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.type('input[type="email"]', TEST_CREDENTIALS.sales.email);
      await page.type('input[type="password"]', TEST_CREDENTIALS.sales.password);
      
      const loginButton = await page.waitForSelector('button[type="submit"]');
      await loginButton.click();
      
      // Wait for dashboard
      await page.waitForSelector('.bg-gray-900', { timeout: 10000 });
      
      // Logout
      const logoutButton = await page.waitForSelector('button[title="Logout"]');
      await logoutButton.click();
      
      // Wait for redirect to login
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      // Check that auth data is cleared from localStorage
      const authData = await page.evaluate(() => {
        const data = localStorage.getItem('auth-storage');
        return data ? JSON.parse(data) : null;
      });
      
      if (authData) {
        expect(authData.state.isAuthenticated).toBe(false);
        expect(authData.state.user).toBeNull();
      }
    });
  });

  describe('5. Performance Assessment', () => {
    test('should have acceptable authentication initialization time', async () => {
      const startTime = Date.now();
      
      await page.goto(APP_URL);
      
      // Wait for either login form or dashboard to appear
      await page.waitForFunction(
        () => document.querySelector('input[type="email"]') || document.querySelector('.bg-gray-900'),
        { timeout: 10000 }
      );
      
      const endTime = Date.now();
      const initializationTime = endTime - startTime;
      
      // Should initialize within reasonable time (5 seconds)
      expect(initializationTime).toBeLessThan(5000);
      console.log(`Authentication initialization time: ${initializationTime}ms`);
    });

    test('should have fast login response time', async () => {
      await page.goto(APP_URL);
      
      // Login process timing
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.type('input[type="email"]', TEST_CREDENTIALS.admin.email);
      await page.type('input[type="password"]', TEST_CREDENTIALS.admin.password);
      
      const loginButton = await page.waitForSelector('button[type="submit"]');
      
      const loginStartTime = Date.now();
      await loginButton.click();
      
      // Wait for successful login (dashboard appears)
      await page.waitForSelector('.bg-gray-900', { timeout: 10000 });
      const loginEndTime = Date.now();
      
      const loginTime = loginEndTime - loginStartTime;
      
      // Login should complete within 3 seconds
      expect(loginTime).toBeLessThan(3000);
      console.log(`Login response time: ${loginTime}ms`);
    });
  });

  describe('6. Race Condition Prevention', () => {
    test('should handle concurrent initialization calls', async () => {
      await page.goto(APP_URL);
      
      // Trigger multiple initializations simultaneously
      await page.evaluate(() => {
        // Simulate multiple rapid calls that could cause race conditions
        if (window.useAuthStore) {
          const { initializeAuth } = window.useAuthStore.getState();
          Promise.all([
            initializeAuth(),
            initializeAuth(),
            initializeAuth()
          ]);
        }
      });
      
      // Should settle into stable state
      await page.waitForFunction(
        () => document.querySelector('input[type="email"]') || document.querySelector('.bg-gray-900'),
        { timeout: 10000 }
      );
      
      // Check for stable state (no errors, proper UI)
      const finalState = await page.evaluate(() => ({
        hasLogin: !!document.querySelector('input[type="email"]'),
        hasDashboard: !!document.querySelector('.bg-gray-900'),
        hasErrors: !!document.querySelector('[role="alert"]')
      }));
      
      expect(finalState.hasLogin || finalState.hasDashboard).toBe(true);
      expect(finalState.hasErrors).toBe(false);
    });
  });
});