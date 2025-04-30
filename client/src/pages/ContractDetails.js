import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  DocumentDuplicateIcon,
  ArrowTopRightOnSquareIcon,
  ShieldCheckIcon,
  DocumentArrowUpIcon,
  CodeBracketIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/cjs/prism';
import { vs2015 } from '../utils/highlighterStyles';
import { toast } from 'react-toastify';
import { Tab } from '@headlessui/react';

// Components
import Loader from '../components/Loader';

// API
import { analyzeSmartContract } from '../services/api';

const ContractDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [transactions, setTransactions] = useState([]);
  
  // Sample contract for demo purposes
  const sampleContract = {
    id: id,
    name: `Contract ${id}`,
    description: 'ERC20 token for Monad ecosystem',
    type: 'ERC20',
    status: 'deployed',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    createdAt: '2025-04-25T14:30:00.000Z',
    network: 'TESTNET',
    abi: [
      {
        "inputs": [
          {"internalType": "string", "name": "name_", "type": "string"},
          {"internalType": "string", "name": "symbol_", "type": "string"},
          {"internalType": "uint8", "name": "decimals_", "type": "uint8"},
          {"internalType": "uint256", "name": "initialSupply_", "type": "uint256"}
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MonadToken is ERC20, Ownable {
    uint8 private _decimals;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply_
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        _decimals = decimals_;
        _mint(msg.sender, initialSupply_ * 10**decimals_);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    function burnFrom(address account, uint256 amount) public {
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
    }
}`
  };
  
  // Sample transactions
  const sampleTransactions = [
    {
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      method: 'transfer',
      from: '0xabcdef1234567890abcdef1234567890abcdef12',
      to: '0x7890abcdef1234567890abcdef1234567890abcd',
      value: '0',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      status: 'success',
      blockNumber: 123456
    },
    {
      hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      method: 'mint',
      from: '0x1234567890abcdef1234567890abcdef12345678',
      to: '0xabcdef1234567890abcdef1234567890abcdef12',
      value: '0',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      status: 'success',
      blockNumber: 123450
    },
    {
      hash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
      method: 'approve',
      from: '0xabcdef1234567890abcdef1234567890abcdef12',
      to: '0x7890abcdef1234567890abcdef1234567890abcd',
      value: '0',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
      status: 'success',
      blockNumber: 123445
    }
  ];
  
  // Load contract details
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setContract(sampleContract);
      setTransactions(sampleTransactions);
      setLoading(false);
    }, 1000);
  }, [id]);
  
  // Analyze contract
  const handleAnalyzeContract = async () => {
    if (!contract || !contract.code) {
      toast.error('No contract code available for analysis');
      return;
    }
    
    try {
      setAnalyzing(true);
      
      const result = await analyzeSmartContract(contract.code);
      
      if (result.success) {
        setAnalysis(result.analysis);
        toast.success('Contract analyzed successfully');
      } else {
        toast.error('Failed to analyze contract');
      }
    } catch (error) {
      console.error('Failed to analyze contract:', error);
      toast.error('Failed to analyze contract');
    } finally {
      setAnalyzing(false);
    }
  };
  
  // Copy contract address
  const copyAddress = () => {
    if (!contract || !contract.address) return;
    
    navigator.clipboard.writeText(contract.address);
    toast.success('Contract address copied to clipboard');
  };
  
  // Copy contract code
  const copyCode = () => {
    if (!contract || !contract.code) return;
    
    navigator.clipboard.writeText(contract.code);
    toast.success('Contract code copied to clipboard');
  };
  
  if (loading) {
    return <Loader message="Loading contract details..." />;
  }
  
  if (!contract) {
    return (
      <div className="text-center py-10">
        <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Contract not found</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          The contract you're looking for doesn't exist or you don't have access to it.
        </p>
        <div className="mt-6">
          <button
            onClick={() => navigate('/contracts')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Contracts
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="page-transition">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/contracts')}
            className="mr-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {contract.name}
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({contract.type})
              </span>
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {contract.description}
            </p>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <button
            onClick={handleAnalyzeContract}
            disabled={analyzing}
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            {analyzing ? (
              <>
                <CodeBracketIcon className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <ShieldCheckIcon className="h-4 w-4 mr-2" />
                Analyze
              </>
            )}
          </button>
          
          <button
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
          >
            <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
            Verify
          </button>
          
          <a 
            href={`https://explorer-testnet.monad.xyz/address/${contract.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
            View on Explorer
          </a>
        </div>
      </div>
      
      {/* Contract Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
          <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white capitalize">{contract.status}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Network</p>
          <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">{contract.network}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
            <button
              onClick={copyAddress}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              title="Copy address"
            >
              <DocumentDuplicateIcon className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-2 text-sm font-mono text-gray-900 dark:text-white truncate">
            {contract.address}
          </p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Tab.Group>
          <Tab.List className="flex border-b border-gray-200 dark:border-gray-700">
            <Tab
              className={({ selected }) =>
                `py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 ${
                  selected ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'hover:text-gray-700 dark:hover:text-gray-300'
                }`
              }
            >
              Code
            </Tab>
            <Tab
              className={({ selected }) =>
                `py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 ${
                  selected ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'hover:text-gray-700 dark:hover:text-gray-300'
                }`
              }
            >
              ABI
            </Tab>
            <Tab
              className={({ selected }) =>
                `py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 ${
                  selected ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'hover:text-gray-700 dark:hover:text-gray-300'
                }`
              }
            >
              Transactions
            </Tab>
            <Tab
              className={({ selected }) =>
                `py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 ${
                  selected ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'hover:text-gray-700 dark:hover:text-gray-300'
                }`
              }
            >
              Analysis
            </Tab>
            <Tab
              className={({ selected }) =>
                `py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 ${
                  selected ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'hover:text-gray-700 dark:hover:text-gray-300'
                }`
              }
            >
              Interact
            </Tab>
          </Tab.List>
          
          <Tab.Panels>
            {/* Code Tab */}
            <Tab.Panel className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Contract Code</h3>
                <button
                  onClick={copyCode}
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                >
                  Copy Code
                </button>
              </div>
              
              <div className="bg-gray-800 rounded-md overflow-hidden max-h-[600px] overflow-y-auto">
                <SyntaxHighlighter
                  language="solidity"
                  style={vs2015}
                  customStyle={{ margin: 0, padding: '1rem' }}
                >
                  {contract.code}
                </SyntaxHighlighter>
              </div>
            </Tab.Panel>
            
            {/* ABI Tab */}
            <Tab.Panel className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">ABI</h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(contract.abi, null, 2));
                    toast.success('ABI copied to clipboard');
                  }}
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                >
                  Copy ABI
                </button>
              </div>
              
              <div className="bg-gray-800 rounded-md overflow-hidden max-h-[600px] overflow-y-auto">
                <SyntaxHighlighter
                  language="json"
                  style={vs2015}
                  customStyle={{ margin: 0, padding: '1rem' }}
                >
                  {JSON.stringify(contract.abi, null, 2)}
                </SyntaxHighlighter>
              </div>
            </Tab.Panel>
            
            {/* Transactions Tab */}
            <Tab.Panel className="p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Transactions</h3>
              
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <InformationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No transactions found for this contract.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hash</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Method</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">From</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">To</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {transactions.map((tx) => (
                        <tr 
                          key={tx.hash}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                            <a 
                              href={`https://explorer-testnet.monad.xyz/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {tx.hash.substring(0, 10)}...{tx.hash.substring(tx.hash.length - 8)}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{tx.method}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-mono">
                              {tx.from.substring(0, 8)}...{tx.from.substring(tx.from.length - 6)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-mono">
                              {tx.to.substring(0, 8)}...{tx.to.substring(tx.to.length - 6)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              tx.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 
                              'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(tx.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Tab.Panel>
            
            {/* Analysis Tab */}
            <Tab.Panel className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Contract Analysis</h3>
                
                {!analysis && (
                  <button
                    onClick={handleAnalyzeContract}
                    disabled={analyzing}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                  >
                    {analyzing ? (
                      <>
                        <CodeBracketIcon className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <ShieldCheckIcon className="h-4 w-4 mr-2" />
                        Analyze Contract
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {analyzing ? (
                <div className="text-center py-8">
                  <Loader message="Analyzing contract..." />
                </div>
              ) : !analysis ? (
                <div className="text-center py-8">
                  <InformationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No analysis available. Click the button above to analyze this contract.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Overall Rating */}
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
                    <div className="flex items-center">
                      <span className="text-lg font-medium text-gray-900 dark:text-white">Overall Rating:</span>
                      <span className="ml-2 text-lg font-bold text-blue-600 dark:text-blue-400">
                        {analysis.overallRating}/10
                      </span>
                    </div>
                  </div>
                  
                  {/* Security Issues */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Security Issues</h4>
                    
                    {analysis.securityIssues?.length > 0 ? (
                      <div className="space-y-2">
                        {analysis.securityIssues.map((issue, index) => (
                          <div 
                            key={index}
                            className={`p-3 rounded-md ${
                              issue.severity === 'HIGH' ? 'bg-red-50 dark:bg-red-900/30' :
                              issue.severity === 'MEDIUM' ? 'bg-yellow-50 dark:bg-yellow-900/30' :
                              'bg-blue-50 dark:bg-blue-900/30'
                            }`}
                          >
                            <div className="flex items-start">
                              <div className={`flex-shrink-0 ${
                                issue.severity === 'HIGH' ? 'text-red-500' :
                                issue.severity === 'MEDIUM' ? 'text-yellow-500' :
                                'text-blue-500'
                              }`}>
                                <XCircleIcon className="h-5 w-5" />
                              </div>
                              <div className="ml-3">
                                <h6 className={`text-sm font-medium ${
                                  issue.severity === 'HIGH' ? 'text-red-800 dark:text-red-200' :
                                  issue.severity === 'MEDIUM' ? 'text-yellow-800 dark:text-yellow-200' :
                                  'text-blue-800 dark:text-blue-200'
                                }`}>
                                  {issue.issue} ({issue.severity})
                                </h6>
                                <div className="mt-1 text-xs text-gray-700 dark:text-gray-300">
                                  <p><strong>Location:</strong> {issue.location}</p>
                                  <p><strong>Suggestion:</strong> {issue.suggestion}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-green-500 dark:text-green-400">No security issues found.</p>
                    )}
                  </div>
                  
                  {/* Gas Optimizations */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Gas Optimizations</h4>
                    
                    {analysis.gasOptimizations?.length > 0 ? (
                      <div className="space-y-2">
                        {analysis.gasOptimizations.map((issue, index) => (
                          <div 
                            key={index}
                            className="p-3 rounded-md bg-green-50 dark:bg-green-900/30"
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 text-green-500">
                                <CheckCircleIcon className="h-5 w-5" />
                              </div>
                              <div className="ml-3">
                                <h6 className="text-sm font-medium text-green-800 dark:text-green-200">
                                  {issue.issue}
                                </h6>
                                <div className="mt-1 text-xs text-gray-700 dark:text-gray-300">
                                  <p><strong>Location:</strong> {issue.location}</p>
                                  <p><strong>Suggestion:</strong> {issue.suggestion}</p>
                                  <p><strong>Estimated Savings:</strong> {issue.estimatedSavings}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No gas optimizations found.</p>
                    )}
                  </div>
                  
                  {/* Monad Optimizations */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Monad-Specific Optimizations</h4>
                    
                    {analysis.monadOptimizations?.length > 0 ? (
                      <div className="space-y-2">
                        {analysis.monadOptimizations.map((issue, index) => (
                          <div 
                            key={index}
                            className="p-3 rounded-md bg-purple-50 dark:bg-purple-900/30"
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 text-purple-500">
                                <CodeBracketIcon className="h-5 w-5" />
                              </div>
                              <div className="ml-3">
                                <h6 className="text-sm font-medium text-purple-800 dark:text-purple-200">
                                  {issue.issue}
                                </h6>
                                <div className="mt-1 text-xs text-gray-700 dark:text-gray-300">
                                  <p><strong>Location:</strong> {issue.location}</p>
                                  <p><strong>Suggestion:</strong> {issue.suggestion}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No Monad-specific optimizations found.</p>
                    )}
                  </div>
                </div>
              )}
            </Tab.Panel>
            
            {/* Interact Tab */}
            <Tab.Panel className="p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Interact with Contract</h3>
              
              <div className="space-y-6">
                {/* Read Functions */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Read Functions</h4>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md space-y-4">
                    {/* balanceOf function */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">balanceOf</h5>
                      
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <label htmlFor="balance-of-account" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            account (address)
                          </label>
                          <input
                            type="text"
                            id="balance-of-account"
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white sm:text-sm"
                            placeholder="0x..."
                          />
                        </div>
                        
                        <div className="flex items-end">
                          <button
                            className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                          >
                            <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                            Query
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* totalSupply function */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">totalSupply</h5>
                      
                      <div className="flex items-center justify-end">
                        <button
                          className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                        >
                          <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                          Query
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Write Functions */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Write Functions</h4>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Connect your wallet to interact with write functions.
                    </p>
                    
                    <button
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                    >
                      Connect Wallet
                    </button>
                  </div>
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default ContractDetails;
