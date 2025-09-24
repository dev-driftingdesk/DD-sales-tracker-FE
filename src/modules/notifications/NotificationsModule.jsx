import React, { useEffect } from 'react';
import NotificationCenter from './components/NotificationCenter';

const NotificationsModule = () => {
  useEffect(() => {
    console.log('NotificationsModule mounted');
  }, []);

  return (
    <div className="h-full">
      <NotificationCenter />
    </div>
  );
};

export default NotificationsModule;