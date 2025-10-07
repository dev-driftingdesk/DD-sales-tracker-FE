// Console Test for Login - Paste into browser console at http://localhost:5174

// Clear everything first
console.clear();
localStorage.clear();
sessionStorage.clear();

console.log('🧪 AUTHENTICATION TEST CONSOLE');
console.log('===============================');

// Function to test direct authentication
function testDirectAuth() {
    console.log('🔐 Testing direct authentication...');
    
    // Get demo user credentials
    const testUser = {
        id: 'demo-1',
        name: 'Demo User',
        email: 'demo@salestracker.com',
        role: 'sales_rep',
        company: 'SalesTracker CRM'
    };
    
    // Create mock token
    const mockToken = `mock_token_${testUser.id}_${Date.now()}`;
    const expiresIn = 3600; // 1 hour
    const now = Date.now();
    
    // Store tokens
    localStorage.setItem('auth_token', mockToken);
    localStorage.setItem('refresh_token', `mock_refresh_${testUser.id}_${now}`);
    localStorage.setItem('auth_token_timestamp', now.toString());
    localStorage.setItem('auth_token_expires_at', (now + expiresIn * 1000).toString());
    
    // Create Zustand auth state
    const authState = {
        state: {
            user: testUser,
            isAuthenticated: true,
            isLoading: false,
            isInitializing: false,
            error: null,
            rememberMe: false,
            backendStatus: null,
            authMode: 'mock',
            statusMessage: 'Connected in demo mode'
        },
        version: 0
    };
    
    localStorage.setItem('auth-storage', JSON.stringify(authState));
    
    console.log('✅ Authentication state set');
    console.log('🔄 Reloading page to test navigation...');
    
    // Reload to trigger navigation
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// Function to clear auth and test login form
function clearAndTest() {
    localStorage.clear();
    sessionStorage.clear();
    console.log('🧹 Cleared authentication');
    window.location.reload();
}

// Auto-detect current state
function checkCurrentState() {
    const hasToken = !!localStorage.getItem('auth_token');
    const authStorage = localStorage.getItem('auth-storage');
    
    console.log('📊 Current Authentication State:');
    console.log('  Token exists:', hasToken);
    
    if (authStorage) {
        try {
            const parsed = JSON.parse(authStorage);
            console.log('  Zustand isAuthenticated:', parsed.state?.isAuthenticated);
            console.log('  User:', parsed.state?.user?.email || 'None');
            console.log('  Auth Mode:', parsed.state?.authMode || 'None');
        } catch (e) {
            console.log('  Zustand state: Parse error');
        }
    } else {
        console.log('  Zustand state: None');
    }
    
    // Check if we're on login page
    const isLoginPage = !!document.querySelector('input[type="email"]');
    console.log('  On login page:', isLoginPage);
    
    if (hasToken && !isLoginPage) {
        console.log('✅ Authentication working - you should see the dashboard');
    } else if (hasToken && isLoginPage) {
        console.log('⚠️ Have token but still on login page - navigation issue');
    } else if (!hasToken && isLoginPage) {
        console.log('💡 No authentication - ready to test login');
    }
}

// Expose functions globally
window.testDirectAuth = testDirectAuth;
window.clearAndTest = clearAndTest;
window.checkCurrentState = checkCurrentState;

console.log('🛠️ Available functions:');
console.log('  testDirectAuth() - Set auth state and test navigation');
console.log('  clearAndTest() - Clear auth and reload');
console.log('  checkCurrentState() - Show current auth status');

// Auto-run state check
checkCurrentState();