import React, { useState } from 'react';
import { PieChart, BarChart3, Target, TrendingUp } from 'lucide-react';

const ConversionChart = ({ data }) => {
  const [viewType, setViewType] = useState('bar'); // 'bar' or 'pie'

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Source Conversion Analysis</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">No conversion data available</p>
        </div>
      </div>
    );
  }

  const maxTotal = Math.max(...data.map(source => source.total));
  const totalLeads = data.reduce((sum, source) => sum + source.total, 0);
  const totalRevenue = data.reduce((sum, source) => sum + source.revenue, 0);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getSourceColor = (index) => {
    const colors = [
      '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];
    return colors[index % colors.length];
  };

  const BarView = () => (
    <div className="space-y-4">
      {data.map((source, index) => {
        const widthPercentage = maxTotal > 0 ? (source.total / maxTotal) * 100 : 0;
        const color = getSourceColor(index);
        
        return (
          <div key={source.source} className="relative">
            {/* Source Info */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="font-medium text-gray-900 capitalize">
                  {source.source}
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span className="text-gray-600">{source.total} leads</span>
                <span className="text-green-600 font-medium">
                  {source.conversionRate.toFixed(1)}%
                </span>
                <span className="text-gray-900 font-medium">
                  {formatCurrency(source.revenue)}
                </span>
              </div>
            </div>
            
            {/* Progress Bars */}
            <div className="space-y-1">
              {/* Total leads bar */}
              <div className="relative h-6 bg-gray-100 rounded overflow-hidden">
                <div
                  className="h-full rounded transition-all duration-500"
                  style={{
                    width: `${widthPercentage}%`,
                    backgroundColor: color,
                    opacity: 0.3
                  }}
                />
                <div className="absolute inset-0 flex items-center px-2">
                  <span className="text-xs text-gray-700">{source.total} total</span>
                </div>
              </div>
              
              {/* Won leads bar */}
              <div className="relative h-4 bg-gray-100 rounded overflow-hidden">
                <div
                  className="h-full rounded transition-all duration-500"
                  style={{
                    width: `${(source.won / maxTotal) * 100}%`,
                    backgroundColor: color,
                    opacity: 0.8
                  }}
                />
                <div className="absolute inset-0 flex items-center px-2">
                  <span className="text-xs text-white font-medium">{source.won} won</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const PieView = () => {
    const radius = 80;
    const centerX = 100;
    const centerY = 100;
    
    let cumulativePercentage = 0;
    
    const createArcPath = (startAngle, endAngle, radius) => {
      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;
      
      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);
      
      const largeArc = endAngle - startAngle > 180 ? 1 : 0;
      
      return [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');
    };

    return (
      <div className="flex items-center gap-8">
        {/* Pie Chart */}
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            {data.map((source, index) => {
              const percentage = (source.total / totalLeads) * 100;
              const startAngle = cumulativePercentage * 3.6;
              const endAngle = (cumulativePercentage + percentage) * 3.6;
              const color = getSourceColor(index);
              
              cumulativePercentage += percentage;
              
              return (
                <path
                  key={source.source}
                  d={createArcPath(startAngle, endAngle, radius)}
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                  opacity="0.8"
                />
              );
            })}
          </svg>
          
          {/* Center Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{totalLeads}</div>
              <div className="text-sm text-gray-600">Total Leads</div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex-1 space-y-2">
          {data.map((source, index) => {
            const percentage = (source.total / totalLeads) * 100;
            const color = getSourceColor(index);
            
            return (
              <div key={source.source} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-gray-700 capitalize">{source.source}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {percentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600">
                    {source.total} leads
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Source Conversion Analysis</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewType('bar')}
            className={`p-2 rounded-lg transition-colors ${
              viewType === 'bar' 
                ? 'bg-teal-100 text-teal-600' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Bar Chart"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewType('pie')}
            className={`p-2 rounded-lg transition-colors ${
              viewType === 'pie' 
                ? 'bg-teal-100 text-teal-600' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Pie Chart"
          >
            <PieChart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{totalLeads}</div>
          <div className="text-sm text-gray-600">Total Leads</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {data.reduce((sum, s) => sum + s.won, 0)}
          </div>
          <div className="text-sm text-gray-600">Converted</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-teal-600">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-sm text-gray-600">Revenue</div>
        </div>
      </div>

      {/* Chart Content */}
      {viewType === 'bar' ? <BarView /> : <PieView />}

      {/* Top Performers */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Top Performing Sources</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-600 mb-1">Highest Conversion Rate</div>
            {data.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 capitalize">
                  {data.sort((a, b) => b.conversionRate - a.conversionRate)[0].source}
                </span>
                <span className="text-green-600 font-medium">
                  {data.sort((a, b) => b.conversionRate - a.conversionRate)[0].conversionRate.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Highest Revenue</div>
            {data.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 capitalize">
                  {data.sort((a, b) => b.revenue - a.revenue)[0].source}
                </span>
                <span className="text-teal-600 font-medium">
                  {formatCurrency(data.sort((a, b) => b.revenue - a.revenue)[0].revenue)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionChart;