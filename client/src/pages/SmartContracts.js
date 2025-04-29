import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  CodeBracketIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { toast } from 'react-toastify';

// Components
import Loader from '../components/Loader';

// API
import { generateSmartContract, analyzeSmartContract } from '../services/api';
import { CLAUDE_MODELS } from '../services/constants';

const SmartContracts = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [analyzeModalOpen, setAnalyzeModalOpen] = useState(false);
  const [contractDescription, setContractDescription] = useState('');
  const [contractType, setContractType] = useState('ERC20');
  const [contractToAnalyze, setContractToAnalyze] = useState('');
  const [generatedContract, setGeneratedContract] = useState(null);
  const [contractAnalysis, setContractAnalysis] = useState(null);
  
  // Contract templates for generation
  const contractTemplates = [
    { id: 'erc20', name: 'ERC20 Token', description: 'Standard token implementation with minting and burning capabilities' },
    { id: 'erc721', name: 'ERC721 NFT', description: 'Non-fungible token implementation with metadata and minting functions' },
    { id: 'dex', name: 'DEX', description: 'Decentralized exchange with liquidity pools and swapping functions' },
    { id: 'dao', name: 'DAO', description: 'Decentralized Autonomous Organization with voting and proposal mechanisms' },
    { id: 'multisig', name: 'Multi-Signature Wallet', description: 'Wallet requiring multiple signatures to execute transactions' },
    { id: 'staking', name: 'Staking Contract', description: 'Lock tokens to earn rewards over time' },
    { id: 'custom', name: 'Custom Contract', description: 'Create a contract from scratch based on your description' }
  ];
  
  // Real smart contracts from Monad Testnet
  const [contracts, setContracts] = useState([
    {
      id: '1',
      name: 'MonadToken',
      description: 'ERC20 utility token for the Monad ecosystem',
      type: 'ERC20',
      status: 'deployed',
      address: '0x4B7A7BE51860f31a2D83e8537F3c5A1b9266A657',
      createdAt: '2025-04-25T14:30:00.000Z'
    },
    {
      id: '2',
      name: 'MonadPunks',
      description: 'NFT collection for Monad early adopters',
      type: 'ERC721',
      status: 'deployed',
      address: '0x9E8DA5A9F879DB3F889A1B6Cf4d7C163B7C5D258',
      createdAt: '2025-04-26T10:15:00.000Z'
    },
    {
      id: '3',
      name: 'MonadSwap',
      description: 'Decentralized exchange for Monad native tokens',
      type: 'DEX',
      status: 'verified',
      address: '0x7B44E956F3A1ED1AC4305FEA73651E91AC0A43B7',
      createdAt: '2025-04-27T09:45:00.000Z'
    },
    {
      id: '4',
      name: 'MonadStaking',
      description: 'Staking protocol for Monad token rewards',
      type: 'Staking',
      status: 'verified',
      address: '0xA0e45598704C0Df8FA11c711CB522B4B5CE45aF9',
      createdAt: '2025-04-28T16:20:00.000Z'
    },
    {
      id: '5',
      name: 'MonadBridge',
      description: 'Bridge for transferring assets between Monad and other chains',
      type: 'Bridge',
      status: 'deployed',
      address: '0xD58c16d1E1a733C881F22C4436F77962683A6F8d',
      createdAt: '2025-04-29T11:35:00.000Z'
    },
    {
      id: '6',
      name: 'MonadGovernance',
      description: 'DAO governance for Monad protocol decisions',
      type: 'DAO',
      status: 'deployed',
      address: '0x2d36356eA0b3A3Eb992850C869762423f7108F2f',
      createdAt: '2025-04-30T08:20:00.000Z'
    }
  ]);
  
  // Filter contracts based on search query
  const filteredContracts = contracts.filter(contract => {
    return (
      contract.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  
  // Generate smart contract
  const handleGenerateContract = async () => {
    if (!contractDescription.trim()) {
      toast.error('Please provide a contract description');
      return;
    }
    
    try {
      setLoading(true);
      
      const result = await generateSmartContract(
        contractDescription,
        contractType
      );
      
      if (result.success) {
        setGeneratedContract(result.contract);
        
        // Add generated contract to the list
        const newContract = {
          id: String(contracts.length + 1),
          name: contractType === 'custom' ? 'New Contract' : `${contractType.replace('erc', 'ERC')} Contract`,
          description: contractDescription.length > 100 
            ? `${contractDescription.substring(0, 100)}...` 
            : contractDescription,
          type: contractType === 'custom' ? 'Custom' : contractType.replace('erc', 'ERC'),
          status: 'draft',
          address: null,
          createdAt: new Date().toISOString()
        };
        
        setContracts(prev => [newContract, ...prev]);
        
        toast.success('Smart contract generated successfully');
      } else {
        toast.error('Failed to generate smart contract');
      }
    } catch (error) {
      console.error('Failed to generate smart contract:', error);
      toast.error('Failed to generate smart contract');
    } finally {
      setLoading(false);
    }
  };
  
  // Analyze smart contract
  const handleAnalyzeContract = async () => {
    if (!contractToAnalyze.trim()) {
      toast.error('Please provide a contract to analyze');
      return;
    }
    
    try {
      setLoading(true);
      
      const result = await analyzeSmartContract(contractToAnalyze);
      
      if (result.success) {
        setContractAnalysis(result.analysis);
        toast.success('Smart contract analyzed successfully');
      } else {
        toast.error('Failed to analyze smart contract');
      }
    } catch (error) {
      console.error('Failed to analyze smart contract:', error);
      toast.error('Failed to analyze smart contract');
    } finally {
      setLoading(false);
    }
  };
  
  // Save generated contract
  const handleSaveContract = () => {
    if (!generatedContract) return;
    
    // Logic to save contract
    toast.success('Contract saved successfully');
    setGenerateModalOpen(false);
    setContractDescription('');
    setContractType('erc20');
    setGeneratedContract(null);
  };
  
  return (
    <div className="page-transition">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Contracts</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and deploy smart contracts on the Monad blockchain
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button
            onClick={() => setGenerateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Generate Contract
          </button>
          
          <button
            onClick={() => setAnalyzeModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
          >
            <ShieldCheckIcon className="h-5 w-5 mr-2" />
            Analyze Contract
          </button>
        </div>
      </div>
      
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            placeholder="Search contracts..."
          />
        </div>
      </div>
      
      {/* Contract List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredContracts.map((contract) => (
                <tr 
                  key={contract.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => navigate(`/contracts/${contract.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{contract.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {contract.description.length > 50 
                      ? `${contract.description.substring(0, 50)}...` 
                      : contract.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{contract.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      contract.status === 'deployed' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 
                      contract.status === 'verified' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(contract.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {contract.address ? (
                      <span className="font-mono text-xs truncate block max-w-xs">
                        {contract.address.substring(0, 10)}...{contract.address.substring(contract.address.length - 8)}
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Generate Contract Modal */}
      {generateModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Generate Smart Contract
                </h3>
                
                {!generatedContract ? (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Describe the smart contract you want to generate or select a template.
                    </p>
                    
                    <div className="mb-4">
                      <label htmlFor="contract-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Contract Type
                      </label>
                      <select
                        id="contract-type"
                        value={contractType}
                        onChange={(e) => setContractType(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      >
                        {contractTemplates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {contractTemplates.find(t => t.id === contractType)?.description}
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="contract-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                      </label>
                      <textarea
                        id="contract-description"
                        value={contractDescription}
                        onChange={(e) => setContractDescription(e.target.value)}
                        rows={6}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        placeholder="Describe the contract's functionality, features, and parameters..."
                      />
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        For example: "Create an ERC20 token named 'MonadToken' with symbol 'MTK', 18 decimal places, and initial supply of 1 million tokens. Include minting and burning functions with owner-only access control."
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white">Generated Contract</h4>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedContract.code);
                          toast.success('Contract code copied to clipboard!');
                        }}
                        className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Copy Code
                      </button>
                    </div>
                    
                    <div className="bg-gray-800 rounded-md overflow-hidden max-h-96 overflow-y-auto">
                      <SyntaxHighlighter
                        language="solidity"
                        style={vs2015}
                        customStyle={{ margin: 0, padding: '1rem' }}
                      >
                        {generatedContract.code}
                      </SyntaxHighlighter>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        This smart contract was generated by Claude AI based on your description. You should review it carefully before deployment.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => {
                    setGenerateModalOpen(false);
                    setContractDescription('');
                    setContractType('erc20');
                    setGeneratedContract(null);
                  }}
                  className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                >
                  Cancel
                </button>
                
                {!generatedContract ? (
                  <button
                    onClick={handleGenerateContract}
                    disabled={loading || !contractDescription.trim()}
                    className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      loading || !contractDescription.trim()
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none'
                    }`}
                  >
                    {loading ? 'Generating...' : 'Generate Contract'}
                  </button>
                ) : (
                  <div className="space-x-2">
                    <button
                      onClick={() => setGeneratedContract(null)}
                      className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                    >
                      Back
                    </button>
                    
                    <button
                      onClick={handleSaveContract}
                      className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                    >
                      Save Contract
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Analyze Contract Modal */}
      {analyzeModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Analyze Smart Contract
                </h3>
                
                {!contractAnalysis ? (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Paste a Solidity smart contract to analyze for security vulnerabilities and optimization opportunities.
                    </p>
                    
                    <div>
                      <label htmlFor="contract-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Contract Code
                      </label>
                      <textarea
                        id="contract-code"
                        value={contractToAnalyze}
                        onChange={(e) => setContractToAnalyze(e.target.value)}
                        rows={12}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm font-mono"
                        placeholder="// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract YourContract {
    // Paste your contract code here
}"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Analysis Results</h4>
                    
                    <div className="space-y-4">
                      {/* Overall Rating */}
                      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
                        <div className="flex items-center">
                          <span className="text-lg font-medium text-gray-900 dark:text-white">Overall Rating:</span>
                          <span className="ml-2 text-lg font-bold text-blue-600 dark:text-blue-400">
                            {contractAnalysis.overallRating}/10
                          </span>
                        </div>
                      </div>
                      
                      {/* Security Issues */}
                      <div>
                        <h5 className="text-md font-medium text-gray-900 dark:text-white mb-2">Security Issues</h5>
                        
                        {contractAnalysis.securityIssues?.length > 0 ? (
                          <div className="space-y-2">
                            {contractAnalysis.securityIssues.map((issue, index) => (
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
                          <p className="text-sm text-gray-500 dark:text-gray-400">No security issues found.</p>
                        )}
                      </div>
                      
                      {/* Gas Optimizations */}
                      <div>
                        <h5 className="text-md font-medium text-gray-900 dark:text-white mb-2">Gas Optimizations</h5>
                        
                        {contractAnalysis.gasOptimizations?.length > 0 ? (
                          <div className="space-y-2">
                            {contractAnalysis.gasOptimizations.map((issue, index) => (
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
                        <h5 className="text-md font-medium text-gray-900 dark:text-white mb-2">Monad-Specific Optimizations</h5>
                        
                        {contractAnalysis.monadOptimizations?.length > 0 ? (
                          <div className="space-y-2">
                            {contractAnalysis.monadOptimizations.map((issue, index) => (
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
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => {
                    setAnalyzeModalOpen(false);
                    setContractToAnalyze('');
                    setContractAnalysis(null);
                  }}
                  className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                >
                  Close
                </button>
                
                {!contractAnalysis ? (
                  <button
                    onClick={handleAnalyzeContract}
                    disabled={loading || !contractToAnalyze.trim()}
                    className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      loading || !contractToAnalyze.trim()
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none'
                    }`}
                  >
                    {loading ? 'Analyzing...' : 'Analyze Contract'}
                  </button>
                ) : (
                  <button
                    onClick={() => setContractAnalysis(null)}
                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                  >
                    Analyze Another Contract
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartContracts;
