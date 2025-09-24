import React from 'react';
import RoutingDashboard from './components/RoutingDashboard';
import SmartNotifications from './components/SmartNotifications';

const RoutingModule = () => {
  return (
    <div className="bg-gray-50">
      <RoutingDashboard />
      <SmartNotifications />
    </div>
  );
};

export default RoutingModule;