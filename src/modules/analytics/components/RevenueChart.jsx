import React, { useState } from 'react';
import { DollarSign, TrendingUp, Calendar, BarChart3 } from 'lucide-react';

const RevenueChart = ({ data, detailed = false }) => {
  const [viewPeriod, setViewPeriod] = useState('monthly'); // 'monthly', 'quarterly'

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Revenue Analysis</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">No revenue data available</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatMonth = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const maxRevenue = Math.max(...data.map(item => item.revenue));
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalDeals = data.reduce((sum, item) => sum + item.deals, 0);
  const averageMonthlyRevenue = data.length > 0 ? totalRevenue / data.length : 0;

  // Calculate growth trend
  const calculateGrowth = () => {
    if (data.length < 2) return 0;
    const currentMonth = data[data.length - 1].revenue;
    const previousMonth = data[data.length - 2].revenue;
    return previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0;
  };

  const growthRate = calculateGrowth();

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${detailed ? 'col-span-2' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Revenue Analysis</h3>
        </div>
        
        {detailed && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewPeriod('monthly')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                viewPeriod === 'monthly'
                  ? 'bg-teal-100 text-teal-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewPeriod('quarterly')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                viewPeriod === 'quarterly'
                  ? 'bg-teal-100 text-teal-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Quarterly
            </button>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {detailed && (
        <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalDeals}</div>
            <div className="text-sm text-gray-600">Total Deals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(averageMonthlyRevenue)}
            </div>
            <div className="text-sm text-gray-600">Avg Monthly</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${
              growthRate >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-5 h-5" />
              {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">MoM Growth</div>
          </div>
        </div>
      )}

      {/* Revenue Chart */}
      <div className="space-y-4">
        <div className="flex items-end justify-between" style={{ height: detailed ? '300px' : '200px' }}>
          {data.map((item, index) => {
            const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
            const isCurrentMonth = index === data.length - 1;
            
            return (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                {/* Bar */}
                <div 
                  className="w-full max-w-16 bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-lg transition-all duration-500 hover:from-teal-700 hover:to-teal-500 cursor-pointer relative group"
                  style={{ height: `${height}%` }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                      <div className="font-medium">{formatCurrency(item.revenue)}</div>
                      <div className="text-gray-300">{item.deals} deals</div>
                    </div>
                  </div>
                  
                  {/* Current month indicator */}
                  {isCurrentMonth && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                
                {/* Value */}
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(item.revenue)}
                  </div>
                  <div className="text-xs text-gray-600">
                    {item.deals} deals
                  </div>
                </div>
                
                {/* Month Label */}
                <div className="text-xs text-gray-600 text-center">
                  {formatMonth(item.month)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trend Line (for detailed view) */}
      {detailed && data.length > 1 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Revenue Trend Analysis</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {data.filter((_, i) => i < data.length - 1 && data[i + 1] && data[i + 1].revenue > data[i].revenue).length}
              </div>
              <div className="text-sm text-gray-600">Growth Months</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {Math.max(...data.map(d => d.revenue)) === data[data.length - 1].revenue ? 'Current' : 'Previous'}
              </div>
              <div className="text-sm text-gray-600">Best Month</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                {formatCurrency(totalRevenue / 12)} {/* Projected annual */}
              </div>
              <div className="text-sm text-gray-600">Annual Projection</div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Breakdown (for detailed view) */}
      {detailed && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Monthly Breakdown</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {data.slice().reverse().map((item, index) => {
              const isLatest = index === 0;
              const growth = index < data.length - 1 ? 
                ((item.revenue - data[data.length - index - 2].revenue) / data[data.length - index - 2].revenue) * 100 : 0;
              
              return (
                <div key={item.month} className={`flex items-center justify-between p-2 rounded-lg ${
                  isLatest ? 'bg-teal-50 border border-teal-200' : 'hover:bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {formatMonth(item.month)}
                    </span>
                    {isLatest && (
                      <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">
                        Latest
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">{item.deals} deals</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(item.revenue)}
                    </span>
                    {index > 0 && (
                      <span className={`text-sm flex items-center gap-1 ${
                        growth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendingUp className="w-3 h-3" />
                        {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;