import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Package, Calendar, Download } from 'lucide-react';
import usePOSStore from '../../stores/posStore';

export default function SalesReports() {
  const [dateRange, setDateRange] = useState('today');
  const [reportType, setReportType] = useState('overview');

  const { transactions, products, getStatistics } = usePOSStore();
  const stats = getStatistics();

  // Filter transactions by date range
  const getFilteredTransactions = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.createdAt);
      
      switch (dateRange) {
        case 'today':
          return transactionDate >= today;
        case 'yesterday':
          return transactionDate >= yesterday && transactionDate < today;
        case 'week':
          return transactionDate >= weekAgo;
        case 'month':
          return transactionDate >= monthAgo;
        default:
          return true;
      }
    }).filter(t => t.status === 'completed');
  };

  const filteredTransactions = getFilteredTransactions();
  
  // Calculate metrics
  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalTransactions = filteredTransactions.length;
  const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  
  // Top selling products
  const productSales = {};
  filteredTransactions.forEach(transaction => {
    transaction.items.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          name: item.name,
          quantitySold: 0,
          revenue: 0
        };
      }
      productSales[item.productId].quantitySold += item.quantity;
      productSales[item.productId].revenue += item.subtotal;
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Daily sales data (for charts)
  const dailySales = {};
  filteredTransactions.forEach(transaction => {
    const date = new Date(transaction.createdAt).toDateString();
    if (!dailySales[date]) {
      dailySales[date] = { revenue: 0, transactions: 0 };
    }
    dailySales[date].revenue += transaction.total;
    dailySales[date].transactions += 1;
  });

  const dailySalesArray = Object.entries(dailySales)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Payment method breakdown
  const paymentMethods = {};
  filteredTransactions.forEach(transaction => {
    if (!paymentMethods[transaction.paymentMethod]) {
      paymentMethods[transaction.paymentMethod] = { count: 0, revenue: 0 };
    }
    paymentMethods[transaction.paymentMethod].count += 1;
    paymentMethods[transaction.paymentMethod].revenue += transaction.total;
  });

  const renderOverviewReport = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-blue-600">{totalTransactions}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Transaction</p>
              <p className="text-2xl font-bold text-purple-600">${averageTransaction.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Items Sold</p>
              <p className="text-2xl font-bold text-orange-600">
                {filteredTransactions.reduce((sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)}
              </p>
            </div>
            <Package className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Daily Sales Chart */}
      {dailySalesArray.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Sales</h3>
          <div className="space-y-3">
            {dailySalesArray.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-gray-900">{new Date(day.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">{day.transactions} transactions</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">${day.revenue.toFixed(2)}</p>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (day.revenue / Math.max(...dailySalesArray.map(d => d.revenue))) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Products */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
        <div className="space-y-3">
          {topProducts.map((product, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-700 font-semibold text-sm">{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.quantitySold} units sold</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">${product.revenue.toFixed(2)}</p>
                <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-teal-500 h-2 rounded-full" 
                    style={{ width: `${(product.revenue / Math.max(...topProducts.map(p => p.revenue))) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(paymentMethods).map(([method, data]) => (
            <div key={method} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900 capitalize">{method}</p>
                <p className="text-sm text-gray-600">{data.count} transactions</p>
              </div>
              <p className="text-lg font-semibold text-green-600">${data.revenue.toFixed(2)}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(data.revenue / totalRevenue) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProductReport = () => (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Sold</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map(product => {
              const sales = productSales[product.id] || { quantitySold: 0, revenue: 0 };
              const profit = sales.revenue - (sales.quantitySold * product.cost);
              
              return (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sku}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">{product.stock}</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">{sales.quantitySold}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-green-600">
                    ${sales.revenue.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-green-600">
                    ${profit.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Reports</h2>
          <p className="text-gray-600 mt-1">Analyze your sales performance and trends</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="overview">Sales Overview</option>
              <option value="products">Product Performance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {reportType === 'overview' ? renderOverviewReport() : renderProductReport()}

      {/* No Data State */}
      {totalTransactions === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No sales data</h3>
          <p className="text-gray-500">
            Sales data will appear here after you complete some transactions
          </p>
        </div>
      )}
    </div>
  );
}