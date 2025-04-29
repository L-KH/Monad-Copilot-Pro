import React from 'react';
import { format } from 'date-fns';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Notifications = ({ notifications = [], onClear }) => {
  if (notifications.length === 0) return null;
  
  // Get icon based on notification type
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
    }
  };
  
  // Format timestamp
  const formatTime = (timestamp) => {
    try {
      return format(new Date(timestamp), 'h:mm a');
    } catch (error) {
      return '';
    }
  };
  
  // Limit to maximum 3 notifications to show at once
  const visibleNotifications = notifications.slice(0, 3);
  
  return (
    <div className="fixed top-16 right-4 z-50 space-y-2 max-w-sm w-full">
      {visibleNotifications.map((notification, index) => (
        <div 
          key={index}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex items-start transform transition-all duration-300 ease-in-out animate-slideIn"
        >
          <div className="flex-shrink-0">
            {getIcon(notification.type)}
          </div>
          
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {notification.message}
            </p>
            {notification.timestamp && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formatTime(notification.timestamp)}
              </p>
            )}
          </div>
          
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={() => onClear(index)}
                className="inline-flex rounded-md p-1.5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {notifications.length > 3 && (
        <div className="text-center py-1 px-2 bg-gray-200 dark:bg-gray-700 rounded-md text-xs text-gray-600 dark:text-gray-400">
          {notifications.length - 3} more notifications
        </div>
      )}
    </div>
  );
};

export default Notifications;
