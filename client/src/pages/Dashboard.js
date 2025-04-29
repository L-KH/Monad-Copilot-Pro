import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowPathIcon,
  DocumentTextIcon,
  CpuChipIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

// Components
import Loader from '../components/Loader';

// API
import { getWorkflows, getNetworks, getGasPrice } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [workflowStats, setWorkflowStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    running: 0
  });
  const [recentWorkflows, setRecentWorkflows] = useState([]);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [gasPrice, setGasPrice] = useState(null);
  
  // Monad Testnet data for charts
  const workflowsOverTime = [
    { day: 'Mon', completed: 5, failed: 1 },
    { day: 'Tue', completed: 7, failed: 2 },
    { day: 'Wed', completed: 9, failed: 1 },
    { day: 'Thu', completed: 6, failed: 2 },
    { day: 'Fri', completed: 8, failed: 1 },
    { day: 'Sat', completed: 4, failed: 0 },
    { day: 'Sun', completed: 3, failed: 1 }
  ];
  
  const gasPriceHistory = [
    { time: '9 AM', gas: 23 },
    { time: '10 AM', gas: 21 },
    { time: '11 AM', gas: 25 },
    { time: '12 PM', gas: 27 },
    { time: '1 PM', gas: 24 },
    { time: '2 PM', gas: 20 },
    { time: '3 PM', gas: 22 }
  ];
  
  // Load dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get workflows
        const workflowsData = await getWorkflows();
        if (workflowsData.success) {
          const workflows = workflowsData.workflows || [];
          
          // Calculate stats
          const completed = workflows.filter(w => w.status === 'completed').length;
          const failed = workflows.filter(w => w.status === 'failed').length;
          const running = workflows.filter(w => w.status === 'running' || w.status === 'paused').length;
          
          setWorkflowStats({
            total: workflows.length,
            completed,
            failed,
            running
          });
          
          // Get recent workflows (up to 5)
          setRecentWorkflows(workflows.slice(0, 5));
        }
        
        // Get network info
        const networksData = await getNetworks();
        if (networksData.success) {
          setNetworkInfo(networksData.networks?.find(n => n.id === 'TESTNET') || null);
        }
        
        // Get gas price
        const gasPriceData = await getGasPrice();
        if (gasPriceData.success) {
          setGasPrice(gasPriceData.gasPrices);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Quick actions
  const quickActions = [
    {
      title: 'Create Workflow',
      description: 'Build a new automation workflow',
      icon: <ArrowPathIcon className="h-8 w-8 text-blue-500" />,
      onClick: () => navigate('/workflows')
    },
    {
      title: 'Generate Contract',
      description: 'Create a new smart contract',
      icon: <DocumentTextIcon className="h-8 w-8 text-green-500" />,
      onClick: () => navigate('/contracts')
    },
    {
      title: 'AI Assistant',
      description: 'Get help from Claude',
      icon: <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-500" />,
      onClick: () => navigate('/assistant')
    }
  ];
  
  if (loading) {
    return <Loader message="Loading dashboard..." />;
  }
  
  return (
    <div className="page-transition overflow-x-hidden">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to Monad Copilot Pro</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Your AI-powered blockchain automation platform
        </p>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {quickActions.map((action, index) => (
          <div 
            key={index}
            onClick={action.onClick}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {action.icon}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {action.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Workflows</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{workflowStats.total}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
          <p className="mt-2 text-3xl font-semibold text-green-600 dark:text-green-400">{workflowStats.completed}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Failed</p>
          <p className="mt-2 text-3xl font-semibold text-red-600 dark:text-red-400">{workflowStats.failed}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Running</p>
          <p className="mt-2 text-3xl font-semibold text-blue-600 dark:text-blue-400">{workflowStats.running}</p>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 w-full overflow-hidden">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Workflow Execution History</h3>
          <div className="h-64 w-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={workflowsOverTime}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#10B981" name="Completed" />
                <Bar dataKey="failed" fill="#EF4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Gas Price Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={gasPriceHistory}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="gas" stroke="#3B82F6" name="Gas (Gwei)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recent Workflows & Network Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Workflows</h3>
          
          {recentWorkflows.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No workflows found.</p>
          ) : (
            <div className="overflow-x-auto max-w-full responsive-table">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Steps</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentWorkflows.map((workflow) => (
                    <tr 
                      key={workflow.id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => navigate(`/workflows/${workflow.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{workflow.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          workflow.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 
                          workflow.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' :
                          workflow.status === 'running' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {workflow.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {workflow.completedSteps}/{workflow.stepCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(workflow.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Network Status</h3>
          
          <div className="flex items-center mb-4">
            <CpuChipIcon className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {networkInfo?.name || 'Monad Testnet'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Chain ID: {networkInfo?.chainId || 'N/A'}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Gas Price</p>
              <div className="mt-2 flex items-center">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {gasPrice?.standard || 'N/A'} <span className="text-sm text-gray-500 dark:text-gray-400">Gwei</span>
                </p>
              </div>
            </div>
            
            {gasPrice && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gas Recommendations</p>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Slow</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{gasPrice.slow} Gwei</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Standard</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{gasPrice.standard} Gwei</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Fast</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{gasPrice.fast} Gwei</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Rapid</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{gasPrice.rapid} Gwei</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
