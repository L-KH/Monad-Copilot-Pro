import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Icons
import { 
  Bars3Icon, 
  BellIcon, 
  MoonIcon, 
  SunIcon, 
  XMarkIcon,
  WalletIcon
} from '@heroicons/react/24/outline';

const Header = ({ apiConnected, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Update document class and save to localStorage
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };
  
  // Apply dark mode on initial render
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  // Get current page title
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/workflows')) return path.includes('/workflows/') ? 'Workflow Details' : 'Workflows';
    if (path.startsWith('/contracts')) return path.includes('/contracts/') ? 'Contract Details' : 'Smart Contracts';
    if (path === '/assistant') return 'AI Assistant';
    if (path === '/settings') return 'Settings';
    
    return 'Monad Copilot Pro';
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm z-10 w-full sticky top-0">
      <div className="flex items-center justify-between h-16 px-4 md:px-6 overflow-hidden">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md lg:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none"
            aria-label="Toggle sidebar"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="ml-4 lg:ml-0 overflow-hidden">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-full">
              {getPageTitle()}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* API Connection Status */}
          <div className="hidden md:flex items-center">
            <div className={`h-2 w-2 rounded-full mr-2 ${apiConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {apiConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          {/* Wallet Button */}
          <button
            onClick={() => setWalletModalOpen(true)}
            className="p-1 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            aria-label="Connect Wallet"
          >
            <WalletIcon className="h-6 w-6" />
          </button>
          
          {/* Notifications */}
          <button
            className="p-1 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            aria-label="View notifications"
          >
            <BellIcon className="h-6 w-6" />
          </button>
          
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-1 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {/* Wallet Modal */}
      {walletModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={() => setWalletModalOpen(false)}
                  className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Connect Wallet
                  </h3>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Connect your wallet to interact with the Monad blockchain.
                    </p>
                    
                    <div className="mt-4 space-y-4">
                      {/* Placeholder for wallet connection options */}
                      <button
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                      >
                        Connect with MetaMask
                      </button>
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                            Or
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="private-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Private Key (Never share your private key!)
                        </label>
                        <div className="mt-1">
                          <input
                            type="password"
                            id="private-key"
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="0x..."
                          />
                        </div>
                      </div>
                      
                      <button
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                      >
                        Connect with Private Key
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
