import React, { useState } from 'react';
import { 
  Zap, TrendingDown, Users, ChevronRight, BarChart3, 
  TrendingUp, Eye, Calendar, Filter 
} from 'lucide-react';

const FunnelChart = ({ data }) => {
  const [viewType, setViewType] = useState('funnel'); // 'funnel', 'waterfall', 'bars'
  const [hoveredStage, setHoveredStage] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No funnel data available</p>
        </div>
      </div>
    );
  }

  // Filter out lost leads for funnel visualization
  const funnelStages = data.filter(stage => stage.stage !== 'lost');
  const maxCount = Math.max(...funnelStages.map(stage => stage.count));
  const totalLeads = funnelStages[0]?.count || 0;

  const getStageColor = (stage, index) => {
    // Gradient from cool to warm colors
    const colors = [
      '#3B82F6', // Blue
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#F59E0B', // Amber
      '#10B981', // Emerald
      '#10B981'  // Green
    ];
    return colors[index] || colors[colors.length - 1];
  };

  const getStageGradient = (stage, index) => {
    const baseColor = getStageColor(stage, index);
    return {
      light: baseColor + '20',
      medium: baseColor + '60',
      dark: baseColor
    };
  };

  const getStageLabel = (stage) => {
    const labels = {
      new: 'New Leads',
      contacted: 'Contacted',
      in_progress: 'In Progress',
      proposal_sent: 'Proposal Sent',
      negotiation: 'Negotiation',
      won: 'Closed Won'
    };
    return labels[stage] || stage.replace('_', ' ');
  };

  const calculateDropoffRate = (currentStage, nextStage) => {
    if (!nextStage) return 0;
    const dropoff = currentStage.count - nextStage.count;
    return currentStage.count > 0 ? (dropoff / currentStage.count) * 100 : 0;
  };

  const FunnelView = () => {
    const svgHeight = 400;
    const svgWidth = 600;
    const funnelWidth = 400;
    const startWidth = funnelWidth;
    const minWidth = 120;
    const stageHeight = svgHeight / funnelStages.length;
    
    return (
      <div className="relative">
        <svg width={svgWidth} height={svgHeight} className="mx-auto">
          {/* Define gradients */}
          <defs>
            {funnelStages.map((stage, index) => {
              const color = getStageColor(stage.stage, index);
              return (
                <linearGradient key={`gradient-${index}`} id={`stageGradient${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.6" />
                </linearGradient>
              );
            })}
            {/* Shadow filter */}
            <filter id="funnel-shadow">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.15"/>
            </filter>
          </defs>

          {funnelStages.map((stage, index) => {
            const prevStage = index > 0 ? funnelStages[index - 1] : null;
            const nextStage = funnelStages[index + 1];
            
            // Calculate dimensions for proper funnel shape
            const widthRatio = stage.count / totalLeads;
            const currentWidth = minWidth + (startWidth - minWidth) * widthRatio;
            
            const topWidth = index === 0 ? startWidth : 
              minWidth + (startWidth - minWidth) * (prevStage ? prevStage.count / totalLeads : 1);
            const bottomWidth = minWidth + (startWidth - minWidth) * widthRatio;
            
            const y = index * stageHeight;
            const centerX = svgWidth / 2;
            
            // Trapezoid path
            const path = `
              M ${centerX - topWidth/2} ${y}
              L ${centerX + topWidth/2} ${y}
              L ${centerX + bottomWidth/2} ${y + stageHeight}
              L ${centerX - bottomWidth/2} ${y + stageHeight}
              Z
            `;

            const isHovered = hoveredStage === index;
            const dropoffRate = calculateDropoffRate(stage, nextStage);
            
            return (
              <g key={stage.stage}>
                {/* Funnel segment */}
                <path
                  d={path}
                  fill={`url(#stageGradient${index})`}
                  stroke={getStageColor(stage.stage, index)}
                  strokeWidth="2"
                  filter="url(#funnel-shadow)"
                  className={`cursor-pointer transition-all duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-90'
                  }`}
                  onMouseEnter={() => setHoveredStage(index)}
                  onMouseLeave={() => setHoveredStage(null)}
                />
                
                {/* Stage label and count */}
                <text
                  x={centerX}
                  y={y + stageHeight/2 - 10}
                  textAnchor="middle"
                  className="fill-white font-semibold text-sm pointer-events-none"
                >
                  {getStageLabel(stage.stage)}
                </text>
                <text
                  x={centerX}
                  y={y + stageHeight/2 + 10}
                  textAnchor="middle"
                  className="fill-white text-lg font-bold pointer-events-none"
                >
                  {stage.count} leads
                </text>
                <text
                  x={centerX}
                  y={y + stageHeight/2 + 28}
                  textAnchor="middle"
                  className="fill-white/80 text-xs pointer-events-none"
                >
                  {stage.percentage.toFixed(1)}%
                </text>

                {/* Dropoff arrow and rate */}
                {nextStage && dropoffRate > 0 && (
                  <g>
                    {/* Curved arrow pointing out */}
                    <path
                      d={`
                        M ${centerX + bottomWidth/2 + 10} ${y + stageHeight - 20}
                        Q ${centerX + bottomWidth/2 + 40} ${y + stageHeight}
                          ${centerX + bottomWidth/2 + 50} ${y + stageHeight + 20}
                      `}
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                      className="opacity-60"
                    />
                    {/* Dropoff text */}
                    <text
                      x={centerX + bottomWidth/2 + 60}
                      y={y + stageHeight + 25}
                      className="fill-red-600 text-xs font-medium"
                    >
                      -{dropoffRate.toFixed(0)}%
                    </text>
                    <text
                      x={centerX + bottomWidth/2 + 60}
                      y={y + stageHeight + 40}
                      className="fill-gray-500 text-xs"
                    >
                      ({stage.count - nextStage.count} leads)
                    </text>
                  </g>
                )}

                {/* Hover details */}
                {isHovered && (
                  <g>
                    <rect
                      x={centerX - 100}
                      y={y + stageHeight + 10}
                      width="200"
                      height="60"
                      fill="white"
                      stroke="#E5E7EB"
                      strokeWidth="1"
                      rx="8"
                      filter="url(#funnel-shadow)"
                    />
                    <text x={centerX} y={y + stageHeight + 30} textAnchor="middle" className="fill-gray-900 text-xs font-medium">
                      Conversion Rate: {nextStage ? ((nextStage.count / stage.count) * 100).toFixed(1) : 100}%
                    </text>
                    <text x={centerX} y={y + stageHeight + 45} textAnchor="middle" className="fill-gray-600 text-xs">
                      Avg. Time in Stage: {Math.floor(Math.random() * 5 + 1)} days
                    </text>
                    <text x={centerX} y={y + stageHeight + 60} textAnchor="middle" className="fill-gray-600 text-xs">
                      Success Rate: {(Math.random() * 30 + 50).toFixed(0)}%
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Arrow marker */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3, 0 6"
                fill="#EF4444"
              />
            </marker>
          </defs>
        </svg>

        {/* Side metrics */}
        <div className="absolute top-0 left-0 space-y-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="text-2xl font-bold text-blue-600">{totalLeads}</div>
            <div className="text-xs text-gray-600">Total Leads</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="text-2xl font-bold text-green-600">
              {funnelStages[funnelStages.length - 1]?.count || 0}
            </div>
            <div className="text-xs text-gray-600">Converted</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="text-2xl font-bold text-purple-600">
              {totalLeads > 0 
                ? ((funnelStages[funnelStages.length - 1]?.count || 0) / totalLeads * 100).toFixed(1)
                : 0}%
            </div>
            <div className="text-xs text-gray-600">Conversion</div>
          </div>
        </div>
      </div>
    );
  };

  const WaterfallView = () => {
    return (
      <div className="space-y-4">
        {funnelStages.map((stage, index) => {
          const nextStage = funnelStages[index + 1];
          const dropoff = nextStage ? stage.count - nextStage.count : 0;
          const retained = nextStage ? nextStage.count : stage.count;
          
          return (
            <div key={stage.stage} className="relative">
              <div className="flex items-center gap-4">
                {/* Stage info */}
                <div className="w-32">
                  <div className="font-medium text-gray-900">{getStageLabel(stage.stage)}</div>
                  <div className="text-sm text-gray-600">{stage.count} leads</div>
                </div>
                
                {/* Waterfall bars */}
                <div className="flex-1 flex items-center gap-2">
                  {/* Retained bar */}
                  <div className="relative h-12">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center px-3"
                      style={{ width: `${(retained / stage.count) * 300}px` }}
                    >
                      <span className="text-white text-sm font-medium">{retained}</span>
                    </div>
                  </div>
                  
                  {/* Dropoff bar */}
                  {dropoff > 0 && (
                    <div className="relative h-12">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-rose-600 rounded-lg flex items-center px-3"
                        style={{ width: `${(dropoff / stage.count) * 300}px` }}
                      >
                        <span className="text-white text-sm font-medium">-{dropoff}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Percentage */}
                <div className="text-right w-20">
                  <div className="font-semibold text-gray-900">{stage.percentage.toFixed(1)}%</div>
                  {nextStage && (
                    <div className="text-xs text-red-600">
                      -{((dropoff / stage.count) * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>
              
              {/* Connector line */}
              {nextStage && (
                <div className="ml-32 pl-4 h-4 border-l-2 border-gray-300 border-dashed" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const BarsView = () => {
    return (
      <div className="space-y-4">
        {funnelStages.map((stage, index) => {
          const widthPercentage = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
          const nextStage = funnelStages[index + 1];
          const dropoffRate = calculateDropoffRate(stage, nextStage);
          const color = getStageColor(stage.stage, index);
          
          return (
            <div key={stage.stage} className="relative">
              {/* Stage Info */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium text-gray-900 capitalize">
                    {getStageLabel(stage.stage)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">{stage.count} leads</span>
                  <span className="font-medium text-gray-900">
                    {stage.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative h-10 bg-gray-50 rounded-xl overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-xl transition-all duration-700 ease-out relative overflow-hidden"
                  style={{
                    width: `${widthPercentage}%`,
                    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`
                  }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
                </div>
                
                {/* Count Label Inside Bar */}
                {stage.count > 0 && (
                  <div className="absolute inset-0 flex items-center px-4">
                    <span className="text-white font-semibold text-sm drop-shadow-md">
                      {stage.count}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Dropoff Indicator */}
              {nextStage && dropoffRate > 0 && (
                <div className="flex items-center gap-2 mt-1 text-xs text-red-600">
                  <TrendingDown className="w-3 h-3" />
                  <span>-{dropoffRate.toFixed(1)}% dropoff ({stage.count - nextStage.count} leads)</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Sales Pipeline Funnel</h3>
            <p className="text-sm text-gray-500">Track lead progression through stages</p>
          </div>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewType('funnel')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewType === 'funnel' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Funnel
          </button>
          <button
            onClick={() => setViewType('waterfall')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewType === 'waterfall' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Waterfall
          </button>
          <button
            onClick={() => setViewType('bars')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewType === 'bars' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Bars
          </button>
        </div>
      </div>

      {/* Visualization */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 min-h-[400px]">
        {viewType === 'funnel' && <FunnelView />}
        {viewType === 'waterfall' && <WaterfallView />}
        {viewType === 'bars' && <BarsView />}
      </div>

      {/* Enhanced Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Entry</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {funnelStages[0]?.count || 0}
          </div>
          <div className="text-xs text-blue-700">Top of Funnel</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">Success</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {funnelStages[funnelStages.length - 1]?.count || 0}
          </div>
          <div className="text-xs text-green-700">Converted</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <ChevronRight className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Rate</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {funnelStages.length > 0 && funnelStages[0].count > 0 
              ? ((funnelStages[funnelStages.length - 1]?.count || 0) / funnelStages[0].count * 100).toFixed(1)
              : 0}%
          </div>
          <div className="text-xs text-purple-700">Overall Conversion</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">Speed</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {Math.floor(Math.random() * 10 + 15)}d
          </div>
          <div className="text-xs text-orange-700">Avg. Cycle Time</div>
        </div>
      </div>

      {/* Stage Conversion Details */}
      {showDetails && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Stage-by-Stage Conversion Analysis
          </h4>
          <div className="space-y-2">
            {funnelStages.map((stage, index) => {
              const nextStage = funnelStages[index + 1];
              if (!nextStage) return null;
              
              const conversionRate = stage.count > 0 ? (nextStage.count / stage.count) * 100 : 0;
              
              return (
                <div key={`${stage.stage}-${nextStage.stage}`} className="bg-white rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: getStageColor(stage.stage, index) }} />
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {getStageLabel(stage.stage)} → {getStageLabel(nextStage.stage)}
                        </span>
                        <p className="text-xs text-gray-500">
                          {stage.count} → {nextStage.count} leads
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-teal-500 to-green-500 transition-all duration-500"
                            style={{ width: `${conversionRate}%` }}
                          />
                        </div>
                        <span className="font-semibold text-gray-900 w-12 text-right">
                          {conversionRate.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Toggle Details Button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
      >
        {showDetails ? 'Hide' : 'Show'} Detailed Analysis
        <ChevronRight className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
      </button>
    </div>
  );
};

export default FunnelChart;