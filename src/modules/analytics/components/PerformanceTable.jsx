import React, { useState } from 'react';
import { Award, TrendingUp, TrendingDown, Users, DollarSign, Target } from 'lucide-react';

const PerformanceTable = ({ data }) => {
  const [sortBy, setSortBy] = useState('revenue'); // 'revenue', 'conversionRate', 'totalLeads'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Sales Rep Performance</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">No performance data available</p>
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

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    let valueA = a[sortBy];
    let valueB = b[sortBy];
    
    if (sortOrder === 'asc') {
      return valueA - valueB;
    } else {
      return valueB - valueA;
    }
  });

  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? 
      <TrendingUp className="w-4 h-4" /> : 
      <TrendingDown className="w-4 h-4" />;
  };

  const getPerformanceRank = (rep, metric) => {
    const sorted = [...data].sort((a, b) => b[metric] - a[metric]);
    return sorted.findIndex(r => r.id === rep.id) + 1;
  };

  const getPerformanceBadge = (rank, total) => {
    const percentage = (rank / total) * 100;
    
    if (percentage <= 20) {
      return { label: 'Top Performer', color: 'bg-green-100 text-green-700 border-green-200' };
    } else if (percentage <= 50) {
      return { label: 'High Performer', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    } else if (percentage <= 80) {
      return { label: 'Average', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    } else {
      return { label: 'Needs Improvement', color: 'bg-red-100 text-red-700 border-red-200' };
    }
  };

  const topRevenue = Math.max(...data.map(rep => rep.revenue));
  const topConversion = Math.max(...data.map(rep => rep.conversionRate));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Award className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Sales Rep Performance</h3>
        </div>
        <div className="text-sm text-gray-600">
          {data.length} active reps
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(data.reduce((sum, rep) => sum + rep.revenue, 0))}
          </div>
          <div className="text-sm text-gray-600">Total Team Revenue</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {data.reduce((sum, rep) => sum + rep.totalLeads, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Leads</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {data.reduce((sum, rep) => sum + rep.wonLeads, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Won</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {(data.reduce((sum, rep) => sum + rep.conversionRate, 0) / data.length).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Avg Conversion</div>
        </div>
      </div>

      {/* Performance Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                Rep
              </th>
              <th 
                className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('totalLeads')}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Leads
                  {getSortIcon('totalLeads')}
                </div>
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                Won/Lost
              </th>
              <th 
                className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('conversionRate')}
              >
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Conversion
                  {getSortIcon('conversionRate')}
                </div>
              </th>
              <th 
                className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('revenue')}
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Revenue
                  {getSortIcon('revenue')}
                </div>
              </th>
              <th 
                className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('averageDealSize')}
              >
                <div className="flex items-center gap-2">
                  Avg Deal
                  {getSortIcon('averageDealSize')}
                </div>
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                Performance
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((rep, index) => {
              const revenueRank = getPerformanceRank(rep, 'revenue');
              const badge = getPerformanceBadge(revenueRank, data.length);
              const isTopRevenue = rep.revenue === topRevenue && rep.revenue > 0;
              const isTopConversion = rep.conversionRate === topConversion && rep.conversionRate > 0;
              
              return (
                <tr key={rep.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  index < 3 ? 'bg-gradient-to-r from-teal-50 to-transparent' : ''
                }`}>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-teal-600 font-medium text-sm">
                          {rep.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{rep.name}</div>
                        <div className="text-sm text-gray-600">Rank #{index + 1}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="text-lg font-semibold text-gray-900">{rep.totalLeads}</div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-medium">{rep.wonLeads}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-red-600 font-medium">{rep.lostLeads}</span>
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${
                        rep.conversionRate >= 20 ? 'text-green-600' :
                        rep.conversionRate >= 10 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {rep.conversionRate.toFixed(1)}%
                      </span>
                      {isTopConversion && (
                        <Award className="w-4 h-4 text-yellow-500" title="Highest Conversion Rate" />
                      )}
                    </div>
                    {/* Conversion Rate Bar */}
                    <div className="w-20 h-1.5 bg-gray-200 rounded-full mt-1">
                      <div 
                        className="h-full bg-gradient-to-r from-teal-500 to-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(rep.conversionRate, 100)}%` }}
                      />
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-gray-900">
                        {formatCurrency(rep.revenue)}
                      </span>
                      {isTopRevenue && (
                        <Award className="w-4 h-4 text-yellow-500" title="Top Revenue Generator" />
                      )}
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <span className="font-medium text-gray-900">
                      {formatCurrency(rep.averageDealSize)}
                    </span>
                  </td>
                  
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
                      {badge.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Performance Insights */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Performance Insights</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Top Performer</span>
            </div>
            {data.length > 0 && (
              <div>
                <div className="font-medium text-green-900">
                  {sortedData[0].name}
                </div>
                <div className="text-sm text-green-700">
                  {formatCurrency(sortedData[0].revenue)} revenue
                </div>
              </div>
            )}
          </div>
          
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Best Conversion</span>
            </div>
            {data.length > 0 && (
              <div>
                <div className="font-medium text-blue-900">
                  {[...data].sort((a, b) => b.conversionRate - a.conversionRate)[0].name}
                </div>
                <div className="text-sm text-blue-700">
                  {[...data].sort((a, b) => b.conversionRate - a.conversionRate)[0].conversionRate.toFixed(1)}% conversion
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTable;