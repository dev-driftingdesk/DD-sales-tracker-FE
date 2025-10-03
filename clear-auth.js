#!/usr/bin/env node

/**
 * Clear Authentication Data Script
 * 
 * This script clears all authentication data from localStorage and sessionStorage
 * Use this to reset the application to a clean, non-authenticated state
 * 
 * Usage:
 *   node clear-auth.js
 * 
 * Or make it executable:
 *   chmod +x clear-auth.js
 *   ./clear-auth.js
 */

console.log('🔄 Authentication Data Clear Script');
console.log('=====================================');

// Since this is a Node.js script running outside the browser, 
// we can't directly access localStorage/sessionStorage
// Instead, we'll provide instructions for manual clearing

console.log('\n📋 Manual Steps to Clear Authentication Data:');
console.log('\n1. Open your browser Developer Tools (F12)');
console.log('2. Go to the Console tab');
console.log('3. Paste and run the following commands:');

console.log('\n🧹 Clear localStorage:');
console.log('───────────────────────');
console.log(`
// Clear all auth-related localStorage entries
const authKeys = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.includes('auth') || key.includes('token') || key.includes('user'))) {
    authKeys.push(key);
  }
}

authKeys.forEach(key => {
  console.log('Removing:', key);
  localStorage.removeItem(key);
});

console.log('localStorage cleared!');
`);

console.log('\n🧹 Clear sessionStorage:');
console.log('─────────────────────────');
console.log(`
// Clear all auth-related sessionStorage entries
const sessionAuthKeys = [];
for (let i = 0; i < sessionStorage.length; i++) {
  const key = sessionStorage.key(i);
  if (key && (key.includes('auth') || key.includes('token') || key.includes('user'))) {
    sessionAuthKeys.push(key);
  }
}

sessionAuthKeys.forEach(key => {
  console.log('Removing:', key);
  sessionStorage.removeItem(key);
});

console.log('sessionStorage cleared!');
`);

console.log('\n🔄 Reload the page:');
console.log('──────────────────────');
console.log('window.location.reload();');

console.log('\n✅ Alternative: Use the Dev Tools in the App');
console.log('═════════════════════════════════════════════');
console.log('If you have the development server running:');
console.log('1. Look for the "Dev Tools: Authentication" panel in the bottom-right corner');
console.log('2. Click "Check Stored Auth Data" to see what\'s stored');
console.log('3. Click "Force Logout & Reload" to clear everything and reload');

console.log('\n🚀 After clearing:');
console.log('──────────────────');
console.log('• The application should show the login screen');
console.log('• No automatic login as Jacob Williams should occur');
console.log('• Users must manually authenticate');

console.log('\n💡 Quick Browser Commands:');
console.log('──────────────────────────');
console.log('F12 → Console tab → Paste commands above → Enter → Reload page');

console.log('\n📝 Verification:');
console.log('───────────────');
console.log('After clearing and reloading:');
console.log('• Check that localStorage.getItem("auth-storage") returns null');
console.log('• Check that localStorage.getItem("user-storage") returns null');
console.log('• Confirm the login screen is displayed');
console.log('• Confirm no automatic authentication occurs');

console.log('\n✨ Complete! Authentication data should now be cleared.');