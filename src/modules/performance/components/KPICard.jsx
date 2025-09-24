import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const KPICard = ({ 
  title, 
  value, 
  target, 
  icon: Icon, 
  format = 'number', 
  trend = null,
  color = 'teal'
}) => {
  const formatValue = (val) => {
    if (format === 'currency') {
      return `$${val.toLocaleString()}`;
    } else if (format === 'percentage') {
      return `${val.toFixed(1)}%`;
    }
    return val.toLocaleString();
  };
  
  const progress = target > 0 ? (value / target) * 100 : 0;
  const isExceeding = progress > 100;
  
  const getTrendIcon = () => {
    if (trend === null) return null;
    if (trend > 0) return <TrendingUp className="w-4 h-4" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };
  
  const getTrendColor = () => {
    if (trend === null) return '';
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };
  
  const getColorClasses = () => {
    const colors = {
      teal: {
        bg: 'bg-teal-100',
        icon: 'text-teal-600',
        progress: 'bg-teal-600'
      },
      blue: {
        bg: 'bg-blue-100',
        icon: 'text-blue-600',
        progress: 'bg-blue-600'
      },
      purple: {
        bg: 'bg-purple-100',
        icon: 'text-purple-600',
        progress: 'bg-purple-600'
      },
      green: {
        bg: 'bg-green-100',
        icon: 'text-green-600',
        progress: 'bg-green-600'
      }
    };
    return colors[color] || colors.teal;
  };
  
  const colorClasses = getColorClasses();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses.bg}`}>
          <Icon className={`w-6 h-6 ${colorClasses.icon}`} />
        </div>
        {trend !== null && (
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-medium">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
      </div>
      
      {target > 0 && (
        <div>
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>Target: {formatValue(target)}</span>
            <span className={isExceeding ? 'text-green-600 font-medium' : ''}>
              {progress.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${colorClasses.progress} ${
                isExceeding ? 'bg-green-500' : ''
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          {isExceeding && (
            <p className="text-xs text-green-600 font-medium mt-1">
              Exceeding target by {(progress - 100).toFixed(0)}%!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default KPICard;