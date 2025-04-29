import React, { useState, useEffect } from 'react';
import { 
  Cog6ToothIcon,
  KeyIcon,
  GlobeAltIcon,
  CpuChipIcon,
  MoonIcon,
  SunIcon,
  CodeBracketIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { Switch } from '@headlessui/react';
import { toast } from 'react-toastify';

// Constants
import { MONAD_NETWORKS, CLAUDE_MODELS } from '../services/constants';

const Settings = () => {
  // Settings state
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [defaultNetwork, setDefaultNetwork] = useState('TESTNET');
  const [privateKey, setPrivateKey] = useState('');
  const [privateKeyStored, setPrivateKeyStored] = useState(!!localStorage.getItem('walletPrivateKey'));
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    claude: localStorage.getItem('claudeApiKey') || ''
  });
  const [defaultModel, setDefaultModel] = useState(localStorage.getItem('defaultClaudeModel') || CLAUDE_MODELS.HAIKU);
  const [autoAnalyzeContracts, setAutoAnalyzeContracts] = useState(localStorage.getItem('autoAnalyzeContracts') === 'true');
  const [autoRetryTransactions, setAutoRetryTransactions] = useState(localStorage.getItem('autoRetryTransactions') === 'true');
  
  // Update settings that need to take effect immediately
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };
  
  // Save API keys
  const saveApiKeys = () => {
    localStorage.setItem('claudeApiKey', apiKeys.claude);
    toast.success('API key saved successfully');
  };
  
  // Handle API key changes
  const handleApiKeyChange = (name, value) => {
    setApiKeys(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Save wallet private key
  const savePrivateKey = () => {
    if (!privateKey) {
      toast.error('Please enter a private key');
      return;
    }
    
    localStorage.setItem('walletPrivateKey', privateKey);
    setPrivateKeyStored(true);
    setShowPrivateKey(false);
    toast.success('Private key saved successfully');
  };
  
  // Remove wallet private key
  const removePrivateKey = () => {
    localStorage.removeItem('walletPrivateKey');
    setPrivateKey('');
    setPrivateKeyStored(false);
    toast.success('Private key removed successfully');
  };
  
  // Save network settings
  const saveNetworkSettings = () => {
    localStorage.setItem('defaultNetwork', defaultNetwork);
    toast.success('Network settings saved successfully');
  };
  
  // Save model settings
  const saveModelSettings = () => {
    localStorage.setItem('defaultClaudeModel', defaultModel);
    localStorage.setItem('autoAnalyzeContracts', autoAnalyzeContracts.toString());
    localStorage.setItem('autoRetryTransactions', autoRetryTransactions.toString());
    toast.success('AI settings saved successfully');
  };
  
  // Clear all settings
  const clearAllSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      localStorage.removeItem('darkMode');
      localStorage.removeItem('defaultNetwork');
      localStorage.removeItem('walletPrivateKey');
      localStorage.removeItem('claudeApiKey');
      localStorage.removeItem('defaultClaudeModel');
      localStorage.removeItem('autoAnalyzeContracts');
      localStorage.removeItem('autoRetryTransactions');
      
      // Reset state
      setDarkMode(false);
      setDefaultNetwork('TESTNET');
      setPrivateKey('');
      setPrivateKeyStored(false);
      setApiKeys({ claude: '' });
      setDefaultModel(CLAUDE_MODELS.HAIKU);
      setAutoAnalyzeContracts(false);
      setAutoRetryTransactions(false);
      
      // Remove dark mode class
      document.documentElement.classList.remove('dark');
      
      toast.success('All settings reset to defaults');
    }
  };
  
  return (
    <div className="page-transition">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Configure your Monad Copilot Pro application settings
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Display Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Cog6ToothIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Display Settings</h3>
            </div>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              {/* Dark Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-base font-medium text-gray-900 dark:text-white">
                    Dark Mode
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enable dark mode for a more comfortable viewing experience in low-light environments.
                  </p>
                </div>
                <Switch
                  checked={darkMode}
                  onChange={toggleDarkMode}
                  className={`${
                    darkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  } relative inline-flex h-6 w-11 items-center rounded-full`}
                >
                  <span className="sr-only">Enable dark mode</span>
                  <span
                    className={`${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
              </div>
              
              {/* Theme icon */}
              <div className="flex justify-center">
                {darkMode ? (
                  <MoonIcon className="h-12 w-12 text-blue-500" />
                ) : (
                  <SunIcon className="h-12 w-12 text-yellow-500" />
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Network Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Network Settings</h3>
            </div>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              {/* Default Network */}
              <div>
                <label htmlFor="default-network" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Default Network
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Select the default Monad network to connect to.
                </p>
                <select
                  id="default-network"
                  value={defaultNetwork}
                  onChange={(e) => setDefaultNetwork(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  {Object.entries(MONAD_NETWORKS).map(([key, network]) => (
                    <option key={key} value={key}>
                      {network.name} (Chain ID: {network.chainId})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Network details */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Network Details</h4>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">RPC URL</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{MONAD_NETWORKS[defaultNetwork].rpcUrl}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Chain ID</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{MONAD_NETWORKS[defaultNetwork].chainId}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Explorer URL</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{MONAD_NETWORKS[defaultNetwork].explorerUrl}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Currency</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{MONAD_NETWORKS[defaultNetwork].nativeCurrency.symbol}</dd>
                  </div>
                </dl>
              </div>
              
              {/* Save button */}
              <div className="flex justify-end">
                <button
                  onClick={saveNetworkSettings}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                  <CheckIcon className="h-5 w-5 mr-2" />
                  Save Network Settings
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wallet Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <KeyIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Wallet Settings</h3>
            </div>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              {privateKeyStored ? (
                <div>
                  <div className="flex items-center mb-2">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Private key stored securely in local storage
                    </p>
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Your private key is stored in your browser's local storage. This is convenient but less secure than using a wallet extension.
                  </p>
                  
                  <button
                    onClick={removePrivateKey}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                  >
                    Remove Private Key
                  </button>
                </div>
              ) : (
                <div>
                  <label htmlFor="private-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Private Key
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Enter your Monad wallet private key for automatic transaction signing. This will be stored in your browser's local storage.
                  </p>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type={showPrivateKey ? "text" : "password"}
                      id="private-key"
                      value={privateKey}
                      onChange={(e) => setPrivateKey(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white pr-10 py-2 pl-3 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      placeholder="0x..."
                    />
                  </div>
                  
                  <div className="mt-2 flex items-center">
                    <input
                      id="show-private-key"
                      name="show-private-key"
                      type="checkbox"
                      checked={showPrivateKey}
                      onChange={() => setShowPrivateKey(!showPrivateKey)}
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="show-private-key" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                      Show private key
                    </label>
                  </div>
                  
                  <div className="mt-4">
                    <button
                      onClick={savePrivateKey}
                      disabled={!privateKey}
                      className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        privateKey
                          ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none'
                          : 'bg-blue-400 cursor-not-allowed'
                      }`}
                    >
                      <CheckIcon className="h-5 w-5 mr-2" />
                      Save Private Key
                    </button>
                  </div>
                  
                  <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-md">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      <strong>Warning:</strong> Storing your private key in the browser is convenient but less secure. Never enter your main wallet's private key; use a dedicated testing wallet with limited funds.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* AI Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <CpuChipIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI Settings</h3>
            </div>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              {/* API Key */}
              <div>
                <label htmlFor="claude-api-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Claude API Key
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Enter your Claude API key to enable AI features.
                </p>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="password"
                    id="claude-api-key"
                    value={apiKeys.claude}
                    onChange={(e) => handleApiKeyChange('claude', e.target.value)}
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="sk-ant-..."
                  />
                </div>
              </div>
              
              {/* Default model */}
              <div>
                <label htmlFor="default-model" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Default Claude Model
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Select the default Claude model to use for AI operations.
                </p>
                <select
                  id="default-model"
                  value={defaultModel}
                  onChange={(e) => setDefaultModel(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  <option value={CLAUDE_MODELS.HAIKU}>Claude 3 Haiku (Fastest)</option>
                  <option value={CLAUDE_MODELS.SONNET}>Claude 3 Sonnet (Balanced)</option>
                  <option value={CLAUDE_MODELS.OPUS}>Claude 3 Opus (Most Powerful)</option>
                </select>
              </div>
              
              {/* Auto-analyze contracts */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Auto-Analyze Contracts
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Automatically analyze smart contracts for security issues when viewed.
                  </p>
                </div>
                <Switch
                  checked={autoAnalyzeContracts}
                  onChange={setAutoAnalyzeContracts}
                  className={`${
                    autoAnalyzeContracts ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  } relative inline-flex h-6 w-11 items-center rounded-full`}
                >
                  <span className="sr-only">Auto-analyze contracts</span>
                  <span
                    className={`${
                      autoAnalyzeContracts ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
              </div>
              
              {/* Auto-retry transactions */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    AI-Assisted Transaction Retry
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Automatically analyze and fix failed transactions using Claude AI.
                  </p>
                </div>
                <Switch
                  checked={autoRetryTransactions}
                  onChange={setAutoRetryTransactions}
                  className={`${
                    autoRetryTransactions ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  } relative inline-flex h-6 w-11 items-center rounded-full`}
                >
                  <span className="sr-only">Auto-retry transactions</span>
                  <span
                    className={`${
                      autoRetryTransactions ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
              </div>
              
              {/* Save button */}
              <div className="flex justify-between">
                <button
                  onClick={saveApiKeys}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                >
                  <CheckIcon className="h-5 w-5 mr-2" />
                  Save API Key
                </button>
                
                <button
                  onClick={saveModelSettings}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                  <CheckIcon className="h-5 w-5 mr-2" />
                  Save AI Settings
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* About */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <CodeBracketIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">About</h3>
            </div>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <CpuChipIcon className="h-16 w-16 text-blue-500" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white ml-2">
                  Monad Copilot Pro
                </h2>
              </div>
              
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Version 1.0.0
              </p>
              
              <p className="text-center text-sm text-gray-700 dark:text-gray-300">
                Monad Copilot Pro is an AI-powered smart contract development and transaction automation suite for the Monad blockchain.
              </p>
              
              <div className="flex justify-center pt-4">
                <a
                  href="https://github.com/your-username/monad-copilot-pro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                >
                  GitHub Repository
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Reset */}
        <div className="flex justify-end">
          <button
            onClick={clearAllSettings}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
          >
            Reset All Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
