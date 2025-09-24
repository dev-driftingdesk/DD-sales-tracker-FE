import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({ title, value, icon: Icon, color, trend, subtitle }) => {
  const getColorClasses = (color) => {
    const colors = {
      green: 'from-green-500 to-emerald-600',
      blue: 'from-blue-500 to-indigo-600',
      purple: 'from-purple-500 to-pink-600',
      orange: 'from-orange-500 to-red-600',
      red: 'from-red-500 to-rose-600',
      teal: 'from-teal-500 to-cyan-600'
    };
    return colors[color] || colors.blue;
  };
  
  const getIconBgClasses = (color) => {
    const colors = {
      green: 'bg-green-50',
      blue: 'bg-blue-50',
      purple: 'bg-purple-50',
      orange: 'bg-orange-50',
      red: 'bg-red-50',
      teal: 'bg-teal-50'
    };
    return colors[color] || colors.blue;
  };
  
  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-emerald-600 bg-emerald-50';
    if (trend < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };
  
  return (
    <div className="relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 overflow-hidden group">
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getColorClasses(color)} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${getIconBgClasses(color)} group-hover:scale-110 transition-transform duration-300`}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getColorClasses(color)} flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${getTrendColor(trend)}`}>
              {trend > 0 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : trend < 0 ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : null}
              <span className="text-sm font-semibold">
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;