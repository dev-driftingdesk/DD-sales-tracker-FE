// Login Test Script - Copy and paste into browser console on http://localhost:5174

console.log('🚀 Starting Login Flow Test');

// Clear any existing authentication
localStorage.clear();
sessionStorage.clear();

// Test function to simulate login
async function testLoginFlow() {
    console.log('🔑 Testing login flow...');
    
    // Fill in the login form programmatically
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const loginButton = document.querySelector('button[type="submit"]');
    
    if (!emailInput || !passwordInput || !loginButton) {
        console.error('❌ Login form elements not found');
        return;
    }
    
    console.log('📝 Filling form with demo credentials');
    emailInput.value = 'demo@salestracker.com';
    passwordInput.value = 'demo';
    
    // Trigger input events to update React state
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    console.log('🖱️ Clicking login button');
    loginButton.click();
    
    // Watch for state changes
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds
    
    const checkAuth = () => {
        attempts++;
        console.log(`🔍 Checking auth status (attempt ${attempts}/${maxAttempts})`);
        
        // Check localStorage for tokens
        const hasToken = !!localStorage.getItem('auth_token');
        const authStorage = localStorage.getItem('auth-storage');
        
        console.log('Token exists:', hasToken);
        
        if (authStorage) {
            try {
                const parsed = JSON.parse(authStorage);
                const isAuthenticated = parsed.state?.isAuthenticated;
                const user = parsed.state?.user;
                
                console.log('Zustand state:', {
                    isAuthenticated,
                    user: user?.email || 'No user',
                    authMode: parsed.state?.authMode
                });
                
                if (isAuthenticated && user) {
                    console.log('✅ Login successful! Should navigate to dashboard');
                    
                    // Check if we're still on login page
                    const isOnLoginPage = document.querySelector('form') && 
                                         document.querySelector('input[type="email"]');
                    
                    if (isOnLoginPage) {
                        console.warn('⚠️ Still on login page - navigation did not occur');
                        
                        // Force a page reload to trigger navigation
                        console.log('🔄 Forcing page reload to trigger navigation');
                        setTimeout(() => window.location.reload(), 1000);
                    } else {
                        console.log('✅ Successfully navigated away from login page');
                    }
                    return;
                }
            } catch (e) {
                console.error('Error parsing auth storage:', e);
            }
        }
        
        if (attempts < maxAttempts) {
            setTimeout(checkAuth, 100);
        } else {
            console.error('❌ Login flow timed out');
            console.log('Final localStorage state:');
            console.log('Token:', !!localStorage.getItem('auth_token'));
            console.log('Auth storage:', localStorage.getItem('auth-storage'));
        }
    };
    
    // Start checking after a brief delay
    setTimeout(checkAuth, 500);
}

// Auto-run if we're on the login page
if (document.querySelector('input[type="email"]')) {
    console.log('📍 Detected login page, starting test in 2 seconds...');
    setTimeout(testLoginFlow, 2000);
} else {
    console.log('📍 Not on login page. Navigate to http://localhost:5174 and run testLoginFlow()');
}

// Make function available globally
window.testLoginFlow = testLoginFlow;

console.log('🎯 Login test script loaded. Functions available:');
console.log('  - testLoginFlow() - Run the complete test');