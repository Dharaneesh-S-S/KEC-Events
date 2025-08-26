import React, { useState, useEffect } from 'react';

const NotificationBell = () => {
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  useEffect(() => {
    // Simulate fetching notifications
    const fetchNotifications = () => {
      // In a real app, you would fetch this from an API
      const count = Math.floor(Math.random() * 10); // Random count for demonstration
      setUnreadNotificationsCount(count);
    };

    fetchNotifications();

    // Simulate new notifications arriving periodically
    const interval = setInterval(() => {
      setUnreadNotificationsCount(prevCount => prevCount + 1);
    }, 30000); // Add a new notification every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleBellClick = () => {
    // In a real app, this would open a notification dropdown/modal
    alert(`You have ${unreadNotificationsCount} new notifications!`);
    setUnreadNotificationsCount(0); // Mark all as read after clicking
  };

  return (
    <button
      onClick={handleBellClick}
      className="relative p-2 text-gray-600 hover:text-blue-600 focus:outline-none"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {unreadNotificationsCount > 0 && (
        <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
          {unreadNotificationsCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
