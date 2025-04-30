import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  PlusIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
// import SyntaxHighlighter from 'react-syntax-highlighter';
// import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
// Using compatible imports
import SyntaxHighlighter from 'react-syntax-highlighter/dist/cjs/prism';
import { vs2015 } from '../utils/highlighterStyles';
import { toast } from 'react-toastify';

// Components
import Loader from '../components/Loader';

// Context and Services
import { useSocket, useWorkflowEvents } from '../services/SocketContext';
import { getWorkflow, executeWorkflow, pauseWorkflow, resumeWorkflow, cancelWorkflow, setWorkflowVariable, saveWorkflowAsTemplate } from '../services/api';

const WorkflowDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executeModalOpen, setExecuteModalOpen] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [variableModalOpen, setVariableModalOpen] = useState(false);
  const [variableName, setVariableName] = useState('');
  const [variableValue, setVariableValue] = useState('');
  const [saveTemplateModalOpen, setSaveTemplateModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  
  // Load workflow details
  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const result = await getWorkflow(id);
        if (result.success) {
          setWorkflow(result.workflow);
        } else {
          toast.error('Failed to load workflow details');
          navigate('/workflows');
        }
      } catch (error) {
        console.error('Failed to load workflow details:', error);
        toast.error('Failed to load workflow details');
        navigate('/workflows');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkflow();
  }, [id, navigate]);
  
  // Listen for workflow events
  useWorkflowEvents(id, {
    'workflow:started': (data) => {
      setWorkflow(prev => ({
        ...prev,
        status: 'running',
        startedAt: data.startedAt
      }));
      toast.info('Workflow execution started');
    },
    'workflow:step_update': (data) => {
      setWorkflow(prev => {
        if (!prev) return prev;
        
        // Update the step
        const updatedSteps = prev.steps.map(step => 
          step.id === data.stepId ? { ...step, ...data } : step
        );
        
        return {
          ...prev,
          steps: updatedSteps
        };
      });
    },
    'workflow:variable_updated': (data) => {
      setWorkflow(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          variables: {
            ...prev.variables,
            [data.name]: data.value
          }
        };
      });
      
      toast.info(`Variable "${data.name}" updated`);
    },
    'workflow:completed': (data) => {
      setWorkflow(prev => ({
        ...prev,
        status: 'completed',
        completedAt: data.completedAt
      }));
      
      toast.success('Workflow completed successfully');
    },
    'workflow:failed': (data) => {
      setWorkflow(prev => ({
        ...prev,
        status: 'failed',
        completedAt: data.completedAt
      }));
      
      toast.error(`Workflow failed: ${data.error || 'Unknown error'}`);
    },
    'workflow:paused': () => {
      setWorkflow(prev => ({
        ...prev,
        status: 'paused'
      }));
      
      toast.info('Workflow paused');
    },
    'workflow:resumed': () => {
      setWorkflow(prev => ({
        ...prev,
        status: 'running'
      }));
      
      toast.info('Workflow resumed');
    },
    'workflow:cancelled': (data) => {
      setWorkflow(prev => ({
        ...prev,
        status: 'cancelled',
        completedAt: data.completedAt
      }));
      
      toast.info('Workflow cancelled');
    }
  });
  
  // Execute workflow
  const handleExecuteWorkflow = async () => {
    try {
      setLoading(true);
      
      const result = await executeWorkflow(id, privateKey);
      
      if (result.success) {
        toast.success('Workflow execution started');
        setExecuteModalOpen(false);
        setPrivateKey('');
      } else {
        toast.error('Failed to execute workflow');
      }
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      toast.error('Failed to execute workflow');
    } finally {
      setLoading(false);
    }
  };
  
  // Pause workflow
  const handlePauseWorkflow = async () => {
    try {
      const result = await pauseWorkflow(id);
      
      if (!result.success) {
        toast.error('Failed to pause workflow');
      }
    } catch (error) {
      console.error('Failed to pause workflow:', error);
      toast.error('Failed to pause workflow');
    }
  };
  
  // Resume workflow
  const handleResumeWorkflow = async () => {
    try {
      const result = await resumeWorkflow(id);
      
      if (!result.success) {
        toast.error('Failed to resume workflow');
      }
    } catch (error) {
      console.error('Failed to resume workflow:', error);
      toast.error('Failed to resume workflow');
    }
  };
  
  // Cancel workflow
  const handleCancelWorkflow = async () => {
    try {
      const result = await cancelWorkflow(id);
      
      if (!result.success) {
        toast.error('Failed to cancel workflow');
      }
    } catch (error) {
      console.error('Failed to cancel workflow:', error);
      toast.error('Failed to cancel workflow');
    }
  };
  
  // Set workflow variable
  const handleSetVariable = async () => {
    if (!variableName || variableValue === undefined) {
      toast.error('Variable name and value are required');
      return;
    }
    
    try {
      setLoading(true);
      
      const result = await setWorkflowVariable(id, variableName, variableValue);
      
      if (result.success) {
        toast.success(`Variable "${variableName}" set successfully`);
        setVariableModalOpen(false);
        setVariableName('');
        setVariableValue('');
      } else {
        toast.error('Failed to set variable');
      }
    } catch (error) {
      console.error('Failed to set variable:', error);
      toast.error('Failed to set variable');
    } finally {
      setLoading(false);
    }
  };
  
  // Save workflow as template
  const handleSaveAsTemplate = async () => {
    if (!templateName) {
      toast.error('Template name is required');
      return;
    }
    
    try {
      setLoading(true);
      
      const result = await saveWorkflowAsTemplate(id, templateName);
      
      if (result.success) {
        toast.success('Workflow saved as template');
        setSaveTemplateModalOpen(false);
        setTemplateName('');
      } else {
        toast.error('Failed to save workflow as template');
      }
    } catch (error) {
      console.error('Failed to save workflow as template:', error);
      toast.error('Failed to save workflow as template');
    } finally {
      setLoading(false);
    }
  };
  
  // Format step status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            <ClockIcon className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
            <ArrowPathIcon className="h-3 w-3 mr-1 animate-spin" />
            Running
          </span>
        );
      case 'successful':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
            <CheckIcon className="h-3 w-3 mr-1" />
            Successful
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
            <XMarkIcon className="h-3 w-3 mr-1" />
            Failed
          </span>
        );
      case 'skipped':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
            <ArrowPathIcon className="h-3 w-3 mr-1" />
            Skipped
          </span>
        );
      case 'retrying':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
            <ArrowPathIcon className="h-3 w-3 mr-1 animate-spin" />
            Retrying
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            {status}
          </span>
        );
    }
  };
  
  if (loading && !workflow) {
    return <Loader message="Loading workflow details..." />;
  }
  
  if (!workflow) {
    return (
      <div className="text-center py-10">
        <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Workflow not found</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          The workflow you're looking for doesn't exist or you don't have access to it.
        </p>
        <div className="mt-6">
          <button
            onClick={() => navigate('/workflows')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Workflows
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
            onClick={() => navigate('/workflows')}
            className="mr-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              {workflow.name}
              <span className="ml-3">
                {workflow.status === 'completed' && <CheckIcon className="h-5 w-5 text-green-500" />}
                {workflow.status === 'failed' && <XMarkIcon className="h-5 w-5 text-red-500" />}
                {workflow.status === 'running' && <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />}
                {workflow.status === 'paused' && <PauseIcon className="h-5 w-5 text-yellow-500" />}
                {workflow.status === 'cancelled' && <XMarkIcon className="h-5 w-5 text-gray-500" />}
              </span>
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {workflow.description || 'No description'}
            </p>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          {/* Workflow Actions */}
          {(workflow.status === 'created' || workflow.status === 'failed' || workflow.status === 'cancelled') && (
            <button
              onClick={() => setExecuteModalOpen(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              <PlayIcon className="h-4 w-4 mr-2" />
              Execute
            </button>
          )}
          
          {workflow.status === 'running' && (
            <>
              <button
                onClick={handlePauseWorkflow}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none"
              >
                <PauseIcon className="h-4 w-4 mr-2" />
                Pause
              </button>
              
              <button
                onClick={handleCancelWorkflow}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </>
          )}
          
          {workflow.status === 'paused' && (
            <>
              <button
                onClick={handleResumeWorkflow}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
              >
                <PlayIcon className="h-4 w-4 mr-2" />
                Resume
              </button>
              
              <button
                onClick={handleCancelWorkflow}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </>
          )}
          
          {/* Other Actions */}
          <button
            onClick={() => setVariableModalOpen(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Set Variable
          </button>
          
          <button
            onClick={() => setSaveTemplateModalOpen(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Save as Template
          </button>
        </div>
      </div>
      
      {/* Workflow Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
          <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white capitalize">{workflow.status}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Network</p>
          <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">{workflow.network}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</p>
          <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
            {workflow.createdAt ? format(new Date(workflow.createdAt), 'MMM d, yyyy') : 'N/A'}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Steps</p>
          <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
            {workflow.steps?.length || 0} total
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
              ({workflow.steps?.filter(s => s.status === 'successful').length || 0} completed)
            </span>
          </p>
        </div>
      </div>
      
      {/* Workflow Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Steps Section */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Workflow Steps</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {workflow.steps?.length || 0} steps in this workflow
            </p>
          </div>
          
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {workflow.steps?.map((step, index) => (
              <li key={step.id} className="px-4 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                      {index + 1}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white">
                        {step.name}
                        <span className="ml-2">{getStatusBadge(step.status)}</span>
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {step.description || step.type || 'No description'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Step timestamps if available */}
                  {step.startedAt && (
                    <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                      <p>Started: {format(new Date(step.startedAt), 'MMM d, h:mm:ss a')}</p>
                      {step.completedAt && (
                        <p>Completed: {format(new Date(step.completedAt), 'MMM d, h:mm:ss a')}</p>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Command */}
                <div className="mt-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Command:</div>
                  <div className="bg-gray-100 dark:bg-gray-900 rounded-md p-2 overflow-x-auto">
                    <pre className="text-xs text-gray-800 dark:text-gray-200">{step.command}</pre>
                  </div>
                </div>
                
                {/* Output or Error */}
                {(step.output || step.error) && (
                  <div className="mt-2">
                    {step.output && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Output:</div>
                        <div className="bg-gray-100 dark:bg-gray-900 rounded-md p-2 overflow-x-auto">
                          <pre className="text-xs text-gray-800 dark:text-gray-200">
                            {typeof step.output === 'object' 
                              ? JSON.stringify(step.output, null, 2) 
                              : step.output}
                          </pre>
                        </div>
                      </div>
                    )}
                    
                    {step.error && (
                      <div className="mt-2">
                        <div className="text-xs text-red-500 mb-1">Error:</div>
                        <div className="bg-red-50 dark:bg-red-900/30 rounded-md p-2 overflow-x-auto">
                          <pre className="text-xs text-red-900 dark:text-red-200">
                            {typeof step.error === 'object' 
                              ? JSON.stringify(step.error, null, 2) 
                              : step.error}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* AI Fixed Notification */}
                {step.aiFixed && (
                  <div className="mt-2 flex items-center text-xs text-purple-600 dark:text-purple-400">
                    <BeakerIcon className="h-4 w-4 mr-1" />
                    Command was automatically fixed by Claude AI
                  </div>
                )}
                
                {/* Transaction Link */}
                {step.transaction?.txHash && (
                  <div className="mt-2">
                    <a 
                      href={`https://explorer.monad.xyz/tx/${step.transaction.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View transaction on explorer
                    </a>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Variables Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Workflow Variables</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {Object.keys(workflow.variables || {}).length} variables defined
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            {Object.keys(workflow.variables || {}).length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No variables defined.</p>
            ) : (
              <div className="overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 rounded-md">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {Object.entries(workflow.variables || {}).map(([key, value]) => (
                      <tr key={key}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {key}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {typeof value === 'object' 
                            ? JSON.stringify(value) 
                            : String(value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="mt-6">
              <button
                onClick={() => setVariableModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Variable
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Execute Workflow Modal */}
      {executeModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Execute Workflow
                </h3>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This workflow requires a wallet to execute transactions on the Monad blockchain.
                    Please provide your private key (never share your private key with others).
                  </p>
                  
                  <div className="mt-4">
                    <label htmlFor="private-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Private Key
                    </label>
                    <input
                      type="password"
                      id="private-key"
                      value={privateKey}
                      onChange={(e) => setPrivateKey(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      placeholder="0x..."
                    />
                    <p className="mt-2 text-xs text-red-500">
                      Warning: Never share your private key with anyone. This key is only used for local transaction signing.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setExecuteModalOpen(false)}
                  className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleExecuteWorkflow}
                  disabled={loading || !privateKey}
                  className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    loading || !privateKey
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none'
                  }`}
                >
                  {loading ? 'Executing...' : 'Execute Workflow'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Set Variable Modal */}
      {variableModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Set Workflow Variable
                </h3>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Set or update a variable for this workflow. Variables can be used in steps by referencing their name with double curly braces, e.g., {"{{variableName}}"}.
                  </p>
                  
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="variable-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Variable Name
                      </label>
                      <input
                        type="text"
                        id="variable-name"
                        value={variableName}
                        onChange={(e) => setVariableName(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        placeholder="myVariable"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="variable-value" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Variable Value
                      </label>
                      <input
                        type="text"
                        id="variable-value"
                        value={variableValue}
                        onChange={(e) => setVariableValue(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        placeholder="Value"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setVariableModalOpen(false)}
                  className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleSetVariable}
                  disabled={loading || !variableName || variableValue === undefined}
                  className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    loading || !variableName || variableValue === undefined
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none'
                  }`}
                >
                  {loading ? 'Setting...' : 'Set Variable'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Save as Template Modal */}
      {saveTemplateModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Save as Template
                </h3>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Save this workflow as a reusable template. The template will include all steps and variables.
                  </p>
                  
                  <div className="mt-4">
                    <label htmlFor="template-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Template Name
                    </label>
                    <input
                      type="text"
                      id="template-name"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      placeholder="my-template"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setSaveTemplateModalOpen(false)}
                  className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleSaveAsTemplate}
                  disabled={loading || !templateName}
                  className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    loading || !templateName
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none'
                  }`}
                >
                  {loading ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowDetails;
