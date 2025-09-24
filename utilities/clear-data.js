// Clear SalesTracker localStorage data - Run this in browser console
console.log('Clearing SalesTracker localStorage data...');

// Clear all SalesTracker related localStorage items
const itemsToRemove = [
  'crm-core-storage',
  'pos-storage', 
  'auth-storage',
  'analytics-storage',
  'integration-storage',
  'leads-storage',
  'notifications-storage',
  'performance-storage',
  'routing-storage',
  'team-management-storage'
];

itemsToRemove.forEach(item => {
  if (localStorage.getItem(item)) {
    localStorage.removeItem(item);
    console.log(`Removed: ${item}`);
  }
});

console.log('LocalStorage cleared. Please refresh the page to see fresh demo data.');
console.log('After refresh, navigate to CRM Core > Products & Services to see the SaaS products.');
console.log('🎉 Use the "Load Demo SaaS Products" button to get products with both Monthly and Annual pricing!');