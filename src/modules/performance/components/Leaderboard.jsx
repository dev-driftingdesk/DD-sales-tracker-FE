import React from 'react';
import { Trophy, TrendingUp, TrendingDown, Minus, Medal, Award, Star } from 'lucide-react';

const Leaderboard = ({ data, currentUserId, showFullList = false }) => {
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="text-sm font-semibold text-gray-600">#{rank}</span>;
    }
  };
  
  const getRankChangeIcon = (change) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };
  
  const displayData = showFullList ? data : data.slice(0, 5);
  
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Team Leaderboard</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>Top Performers</span>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {displayData.map((user, index) => {
          const isCurrentUser = user.id === currentUserId;
          const isTopThree = user.rank <= 3;
          
          return (
            <div
              key={user.id}
              className={`px-6 py-4 transition-colors duration-200 ${
                isCurrentUser ? 'bg-teal-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="w-12 flex items-center justify-center">
                    {getRankIcon(user.rank)}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className={`w-10 h-10 rounded-full ${
                        isTopThree ? 'ring-2 ring-yellow-400' : ''
                      }`}
                    />
                    <div>
                      <p className={`font-medium ${
                        isCurrentUser ? 'text-teal-700' : 'text-gray-900'
                      }`}>
                        {user.name} {isCurrentUser && '(You)'}
                      </p>
                      <p className="text-xs text-gray-500">{user.teamName}</p>
                    </div>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-6">
                  {/* Rank Change */}
                  <div className="flex items-center gap-1">
                    {getRankChangeIcon(user.rankChange)}
                    {user.rankChange !== 0 && (
                      <span className={`text-xs font-medium ${
                        user.rankChange > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {Math.abs(user.rankChange)}
                      </span>
                    )}
                  </div>
                  
                  {/* KPIs */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Revenue</p>
                      <p className="text-sm font-semibold text-gray-900">
                        ${user.revenue.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Deals</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {user.dealsClosed}/{user.dealsTotal}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Conv. Rate</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {user.conversionRate.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Achievement Badges */}
              {isTopThree && (
                <div className="mt-3 ml-16 flex items-center gap-2">
                  {user.rank === 1 && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                      🏆 Top Performer
                    </span>
                  )}
                  {user.conversionRate > 50 && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      🎯 High Converter
                    </span>
                  )}
                  {user.revenue > 5000 && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      💰 Revenue Star
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {!showFullList && data.length > 5 && (
        <div className="px-6 py-3 bg-gray-50 text-center">
          <button className="text-sm font-medium text-teal-600 hover:text-teal-700">
            View Full Leaderboard ({data.length} total)
          </button>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;