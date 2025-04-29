import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

// Icons
import {
  HomeIcon,
  CodeBracketIcon,
  CpuChipIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Import the API service
import { getNetworks } from '../services/api';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  // Using the isOpen prop from parent instead of local state
  const sidebarOpen = isOpen;
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Monitor window resize
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWindowWidth(newWidth);
      
      // If we're transitioning from mobile to desktop and sidebar is open, close it
      if (newWidth >= 1024 && windowWidth < 1024 && sidebarOpen) {
        toggleSidebar();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen, toggleSidebar, windowWidth]);
  const [networkStatus, setNetworkStatus] = useState({ name: 'Monad Testnet', connected: true });
  
  // Fetch network status on component mount
  useEffect(() => {
    const fetchNetworkStatus = async () => {
      try {
        // Use the API service instead of fetch
        const networksData = await getNetworks();
        if (networksData.success && networksData.networks && networksData.networks.length > 0) {
          setNetworkStatus({
            name: networksData.networks[0].name,
            connected: true
          });
        }
      } catch (error) {
        console.error('Failed to fetch network status:', error);
        setNetworkStatus({
          name: 'Monad Testnet',
          connected: false
        });
      }
    };

    fetchNetworkStatus();
  }, []);
  
  // Navigation items
  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: <HomeIcon className="h-5 w-5" />
    },
    {
      name: 'Workflows',
      path: '/workflows',
      icon: <ArrowPathIcon className="h-5 w-5" />
    },
    {
      name: 'Smart Contracts',
      path: '/contracts',
      icon: <DocumentTextIcon className="h-5 w-5" />
    },
    {
      name: 'AI Assistant',
      path: '/assistant',
      icon: <ChatBubbleLeftRightIcon className="h-5 w-5" />
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: <Cog6ToothIcon className="h-5 w-5" />
    }
  ];
  
  // Mobile toggle button
  const mobileToggle = (
    <button
      type="button"
      className="fixed top-4 left-4 z-50 lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-50 dark:hover:bg-gray-800 focus:outline-none shadow-sm bg-white dark:bg-gray-800"
      onClick={toggleSidebar}
    >
      <span className="sr-only">{sidebarOpen ? 'Close sidebar' : 'Open sidebar'}</span>
      {sidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
    </button>
  );
  
  return (
    <>
      {/* Mobile toggle */}
      {mobileToggle}
      
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden" 
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar component */}
      <aside 
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ease-in-out lg:translate-x-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto w-64 sm:w-72 lg:w-[280px] sidebar-responsive`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-4 py-5">
            <div className="flex items-center space-x-2 overflow-hidden">
              <CpuChipIcon className="h-7 w-7 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white truncate overflow-ellipsis">
                Monad Copilot
              </span>
            </div>
            {/* Close button (mobile only) */}
            <button 
              type="button"
              className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex-shrink-0"
              onClick={toggleSidebar}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => 
                  `${isActive 
                    ? 'bg-gray-100 text-blue-600 dark:bg-gray-700 dark:text-blue-400' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-wrap`
                }
                onClick={() => {
                  if (windowWidth < 1024) {
                    toggleSidebar();
                  }
                }}
              >
                <div className="mr-3 flex-shrink-0">{item.icon}</div>
                <span className="overflow-ellipsis overflow-hidden text-wrap break-words">{item.name}</span>
              </NavLink>
            ))}
          </nav>
          
          {/* Network status */}
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <CodeBracketIcon className="h-6 w-6 text-green-500 dark:text-green-400" />
              </div>
              <div className="ml-3 flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-medium text-gray-900 dark:text-white overflow-ellipsis overflow-hidden text-wrap break-words">
                  Connected to {networkStatus.name}
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <span className={`inline-block h-2 w-2 rounded-full mr-1 ${networkStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {networkStatus.connected ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
