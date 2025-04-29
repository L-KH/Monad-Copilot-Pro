import React from 'react';

const Loader = ({ fullScreen = false, message = 'Loading...', size = 'medium' }) => {
  // Size classes
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };
  
  // Component to render
  const loaderComponent = (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? 'h-screen w-screen' : ''}`}>
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 ${sizeClasses[size]}`}></div>
      {message && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{message}</p>
      )}
    </div>
  );
  
  // If fullScreen, render with overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90">
        {loaderComponent}
      </div>
    );
  }
  
  // Otherwise, render inline
  return loaderComponent;
};

export default Loader;
