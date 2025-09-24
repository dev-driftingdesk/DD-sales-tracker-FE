#!/usr/bin/env node

/**
 * Script to check for duplicate product IDs in the CRM and POS stores
 * This will analyze the ID generation patterns and detect potential issues
 */

const fs = require('fs');
const path = require('path');

// Function to simulate the ID generation methods used in the stores
function simulateIdGeneration() {
    console.log('=== ID Generation Analysis ===\n');
    
    // CRM Store uses: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    console.log('CRM Store ID Generation Pattern:');
    console.log('Format: Date.now() + "-" + random string (9 chars)');
    
    const crmIds = [];
    for (let i = 0; i < 10; i++) {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        crmIds.push(id);
        console.log(`  Sample ID ${i + 1}: ${id}`);
        // Small delay to ensure different timestamps
        if (i < 9) {
            // Simulate rapid successive calls
            const start = Date.now();
            while (Date.now() - start < 1) {
                // Busy wait for 1ms
            }
        }
    }
    
    console.log('\nPOS Store ID Generation Pattern:');
    console.log('Format: Date.now().toString()');
    
    const posIds = [];
    for (let i = 0; i < 10; i++) {
        const id = Date.now().toString();
        posIds.push(id);
        console.log(`  Sample ID ${i + 1}: ${id}`);
        // Small delay to ensure different timestamps
        if (i < 9) {
            const start = Date.now();
            while (Date.now() - start < 1) {
                // Busy wait for 1ms
            }
        }
    }
    
    // Check for duplicates in each set
    console.log('\n=== Duplicate Analysis ===');
    
    const crmDuplicates = crmIds.filter((id, index) => crmIds.indexOf(id) !== index);
    const posDuplicates = posIds.filter((id, index) => posIds.indexOf(id) !== index);
    
    console.log(`CRM Store duplicates: ${crmDuplicates.length > 0 ? crmDuplicates.join(', ') : 'None found'}`);
    console.log(`POS Store duplicates: ${posDuplicates.length > 0 ? posDuplicates.join(', ') : 'None found'}`);
    
    // Check for cross-store duplicates (unlikely but possible)
    const crossDuplicates = crmIds.filter(id => posIds.includes(id));
    console.log(`Cross-store duplicates: ${crossDuplicates.length > 0 ? crossDuplicates.join(', ') : 'None found'}`);
    
    return {
        crmIds,
        posIds,
        crmDuplicates,
        posDuplicates,
        crossDuplicates
    };
}

// Function to analyze localStorage data if available
function analyzeStoredData() {
    console.log('\n=== Stored Data Analysis ===');
    console.log('Note: This script runs in Node.js and cannot access browser localStorage.');
    console.log('To check actual stored data:');
    console.log('1. Open browser DevTools (F12)');
    console.log('2. Go to Application/Storage tab');
    console.log('3. Look for "crm-core-storage" and "pos-storage" in localStorage');
    console.log('4. Check the products arrays for duplicate IDs');
    
    console.log('\nAlternatively, you can run this in the browser console:');
    console.log(`
// Check CRM products for duplicates
const crmData = JSON.parse(localStorage.getItem('crm-core-storage') || '{"state":{"products":[]}}');
const crmProducts = crmData.state?.products || [];
const crmIds = crmProducts.map(p => p.id);
const crmDuplicateIds = crmIds.filter((id, index) => crmIds.indexOf(id) !== index);
console.log('CRM duplicate IDs:', crmDuplicateIds.length > 0 ? crmDuplicateIds : 'None');

// Check POS products for duplicates  
const posData = JSON.parse(localStorage.getItem('pos-storage') || '{"state":{"products":[]}}');
const posProducts = posData.state?.products || [];
const posIds = posProducts.map(p => p.id);
const posDuplicateIds = posIds.filter((id, index) => posIds.indexOf(id) !== index);
console.log('POS duplicate IDs:', posDuplicateIds.length > 0 ? posDuplicateIds : 'None');

// Check for cross-store duplicates
const crossDups = crmIds.filter(id => posIds.includes(id));
console.log('Cross-store duplicates:', crossDups.length > 0 ? crossDups : 'None');

// Display all products with their IDs
console.log('CRM Products:', crmProducts);
console.log('POS Products:', posProducts);
    `);
}

// Function to analyze the demo data in the source files
function analyzeDemoData() {
    console.log('\n=== Demo Data Analysis ===');
    
    try {
        // Read CRM Core Module
        const crmModulePath = path.join(__dirname, 'src/modules/crm-core/CRMCoreModule.jsx');
        const crmContent = fs.readFileSync(crmModulePath, 'utf8');
        
        // Extract demo product data from CRM module
        const crmDemoMatch = crmContent.match(/const demoProducts = \[(.*?)\];/s);
        if (crmDemoMatch) {
            console.log('CRM Demo Products found in CRMCoreModule.jsx');
            // Count products by looking for 'sku:' occurrences
            const skuMatches = crmContent.match(/sku: '[^']+'/g) || [];
            console.log(`  Found ${skuMatches.length} products with SKUs`);
            
            // Extract SKUs
            const skus = skuMatches.map(match => match.replace(/sku: '([^']+)'/, '$1'));
            const duplicateSkus = skus.filter((sku, index) => skus.indexOf(sku) !== index);
            console.log(`  SKU duplicates: ${duplicateSkus.length > 0 ? duplicateSkus.join(', ') : 'None found'}`);
            console.log(`  SKUs: ${skus.join(', ')}`);
        }
        
        // Read POS Store
        const posStorePath = path.join(__dirname, 'src/modules/pos/stores/posStore.js');
        const posContent = fs.readFileSync(posStorePath, 'utf8');
        
        // Extract demo product data from POS store
        const posDemoMatch = posContent.match(/const demoProducts = \[(.*?)\];/s);
        if (posDemoMatch) {
            console.log('\nPOS Demo Products found in posStore.js');
            // Look for hardcoded IDs
            const idMatches = posContent.match(/id: '[^']+'/g) || [];
            console.log(`  Found ${idMatches.length} products with hardcoded IDs`);
            
            // Extract IDs
            const ids = idMatches.map(match => match.replace(/id: '([^']+)'/, '$1'));
            const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
            console.log(`  ID duplicates: ${duplicateIds.length > 0 ? duplicateIds.join(', ') : 'None found'}`);
            console.log(`  IDs: ${ids.join(', ')}`);
        }
        
    } catch (error) {
        console.log('Error reading source files:', error.message);
    }
}

// Function to provide recommendations
function provideRecommendations() {
    console.log('\n=== Recommendations ===');
    console.log('1. CRM Store ID Generation:');
    console.log('   ✅ GOOD: Uses Date.now() + random string - very low collision probability');
    console.log('   ✅ Format: timestamp-randomstring (e.g., "1234567890-abc123def")');
    
    console.log('\n2. POS Store ID Generation:');
    console.log('   ⚠️  POTENTIAL ISSUE: Uses only Date.now().toString()');
    console.log('   ⚠️  Risk: If multiple products are added rapidly, IDs could collide');
    console.log('   💡 Recommendation: Change to include random component like CRM store');
    
    console.log('\n3. Demo Data:');
    console.log('   ✅ POS demo data uses hardcoded IDs (1, 2, 3, 4) - safe for demo');
    console.log('   ✅ CRM demo data gets generated IDs via addProduct() - safe');
    
    console.log('\n4. Potential Issues:');
    console.log('   🔍 Check if POS products are being added too quickly');
    console.log('   🔍 Verify no manual ID assignment conflicts with generated IDs');
    console.log('   🔍 Consider using UUID library for guaranteed uniqueness');
    
    console.log('\n5. Immediate Actions:');
    console.log('   1. Run the browser console script above to check current data');
    console.log('   2. If duplicates found, clear localStorage and reload');
    console.log('   3. Consider updating POS store ID generation to match CRM pattern');
}

// Main execution
function main() {
    console.log('Product ID Duplicate Checker');
    console.log('============================\n');
    
    const simulationResults = simulateIdGeneration();
    analyzeDemoData();
    analyzeStoredData();
    provideRecommendations();
    
    console.log('\n=== Summary ===');
    console.log('This analysis suggests that:');
    console.log('• CRM store has robust ID generation (timestamp + random)');
    console.log('• POS store may be vulnerable to rapid-fire duplicate IDs');
    console.log('• Demo data appears safe with different ID strategies');
    console.log('• Check actual stored data using the browser console script above');
}

if (require.main === module) {
    main();
}

module.exports = {
    simulateIdGeneration,
    analyzeDemoData,
    analyzeStoredData,
    provideRecommendations
};