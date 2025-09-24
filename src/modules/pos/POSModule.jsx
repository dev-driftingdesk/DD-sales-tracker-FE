import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, CreditCard, BarChart3, Users, History, Plus, Search } from 'lucide-react';
import ProductCatalog from './components/products/ProductCatalog';
import TransactionHistory from './components/transactions/TransactionHistory';
import CheckoutSystem from './components/checkout/CheckoutSystem';
import InventoryManager from './components/inventory/InventoryManager';
import SalesReports from './components/reports/SalesReports';
import usePOSStore from './stores/posStore';

export default function POSModule() {
  const [activeTab, setActiveTab] = useState('checkout');
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  const { 
    getStatistics, 
    cart, 
    initializeDemoData,
    getLowStockProducts 
  } = usePOSStore();

  const stats = getStatistics();
  const lowStockCount = getLowStockProducts().length;

  // Initialize demo data
  useEffect(() => {
    initializeDemoData();
  }, []);

  const tabs = [
    { id: 'checkout', label: 'Checkout', icon: CreditCard, count: cart.items.length },
    { id: 'products', label: 'Products', icon: Package, count: stats.totalProducts },
    { id: 'inventory', label: 'Inventory', icon: BarChart3, badge: lowStockCount > 0 ? lowStockCount : null },
    { id: 'transactions', label: 'Transactions', icon: History, count: stats.totalTransactions },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'checkout':
        return <CheckoutSystem />;
      case 'products':
        return <ProductCatalog />;
      case 'inventory':
        return <InventoryManager />;
      case 'transactions':
        return <TransactionHistory />;
      case 'reports':
        return <SalesReports />;
      default:
        return <CheckoutSystem />;
    }
  };

  return (
    <div className="flex-1 p-6 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Point of Sale</h1>
              <p className="text-gray-600">Manage products, process transactions, and track sales</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Quick Actions
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions Dropdown */}
        {showQuickActions && (
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setActiveTab('products');
                    setShowQuickActions(false);
                  }}
                  className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Package className="w-5 h-5 text-blue-600" />
                  <span>Add Product</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('checkout');
                    setShowQuickActions(false);
                  }}
                  className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5 text-green-600" />
                  <span>New Sale</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('inventory');
                    setShowQuickActions(false);
                  }}
                  className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  <span>Check Inventory</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('reports');
                    setShowQuickActions(false);
                  }}
                  className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <span>View Reports</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Sales</p>
                <p className="text-2xl font-bold text-green-600">
                  ${stats.todaySales.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.todayTransactions} transactions
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Products</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalProducts}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.activeProducts} active
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Need restocking
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cart Items</p>
                <p className="text-2xl font-bold text-purple-600">{cart.items.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  ${cart.total.toFixed(2)} total
                </p>
              </div>
              <ShoppingCart className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-teal-600 text-teal-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                    {tab.count > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {tab.count}
                      </span>
                    )}
                    {tab.badge && (
                      <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}