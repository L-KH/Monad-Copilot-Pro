import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  PauseIcon,
  PlayIcon,
  FolderIcon,
  ArrowsRightLeftIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

// Components
import Loader from '../components/Loader';

// API
import { getWorkflows, getWorkflowTemplates, createWorkflowFromTemplate, executeWorkflow, pauseWorkflow, resumeWorkflow, cancelWorkflow } from '../services/api';

const Workflows = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [variableValues, setVariableValues] = useState({});
  const [filter, setFilter] = useState('all');
  
  // Load workflows and templates
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get workflows
        const workflowsData = await getWorkflows();
        if (workflowsData.success) {
          setWorkflows(workflowsData.workflows || []);
        }
        
        // Get templates
        const templatesData = await getWorkflowTemplates();
        if (templatesData.success) {
          setTemplates(templatesData.templates || []);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to load workflows data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter workflows based on search query and filter
  const filteredWorkflows = workflows.filter((workflow) => {
    // First apply search filter
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Then apply status filter
    if (filter === 'all') return matchesSearch;
    return matchesSearch && workflow.status === filter;
  });
  
  // Handle template selection
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setWorkflowName(template.name);
    setWorkflowDescription(template.description || '');
    
    // Initialize variable values
    const initialValues = {};
    if (template.variables) {
      Object.entries(template.variables).forEach(([key, value]) => {
        initialValues[key] = value;
      });
    }
    setVariableValues(initialValues);
  };
  
  // Handle variable change
  const handleVariableChange = (name, value) => {
    setVariableValues(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Create workflow from template
  const handleCreateWorkflow = async () => {
    try {
      setLoading(true);
      
      const result = await createWorkflowFromTemplate(
        selectedTemplate.id,
        variableValues,
        workflowName,
        workflowDescription
      );
      
      if (result.success) {
        // Refresh workflows
        const workflowsData = await getWorkflows();
        if (workflowsData.success) {
          setWorkflows(workflowsData.workflows || []);
        }
        
        // Close modal and reset form
        setCreateModalOpen(false);
        setSelectedTemplate(null);
        setWorkflowName('');
        setWorkflowDescription('');
        setVariableValues({});
        
        // Navigate to workflow details
        navigate(`/workflows/${result.workflow.id}`);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to create workflow:', error);
      setLoading(false);
    }
  };
  
  // Execute workflow
  const handleExecuteWorkflow = async (id, e) => {
    e.stopPropagation(); // Prevent navigating to workflow details
    
    try {
      const result = await executeWorkflow(id);
      
      if (result.success) {
        // Update workflow in list
        setWorkflows(prev => 
          prev.map(w => w.id === id ? { ...w, status: 'running' } : w)
        );
      }
    } catch (error) {
      console.error(`Failed to execute workflow ${id}:`, error);
    }
  };
  
  // Pause workflow
  const handlePauseWorkflow = async (id, e) => {
    e.stopPropagation(); // Prevent navigating to workflow details
    
    try {
      const result = await pauseWorkflow(id);
      
      if (result.success) {
        // Update workflow in list
        setWorkflows(prev => 
          prev.map(w => w.id === id ? { ...w, status: 'paused' } : w)
        );
      }
    } catch (error) {
      console.error(`Failed to pause workflow ${id}:`, error);
    }
  };
  
  // Resume workflow
  const handleResumeWorkflow = async (id, e) => {
    e.stopPropagation(); // Prevent navigating to workflow details
    
    try {
      const result = await resumeWorkflow(id);
      
      if (result.success) {
        // Update workflow in list
        setWorkflows(prev => 
          prev.map(w => w.id === id ? { ...w, status: 'running' } : w)
        );
      }
    } catch (error) {
      console.error(`Failed to resume workflow ${id}:`, error);
    }
  };
  
  // Cancel workflow
  const handleCancelWorkflow = async (id, e) => {
    e.stopPropagation(); // Prevent navigating to workflow details
    
    try {
      const result = await cancelWorkflow(id);
      
      if (result.success) {
        // Update workflow in list
        setWorkflows(prev => 
          prev.map(w => w.id === id ? { ...w, status: 'cancelled' } : w)
        );
      }
    } catch (error) {
      console.error(`Failed to cancel workflow ${id}:`, error);
    }
  };
  
  if (loading && workflows.length === 0) {
    return <Loader message="Loading workflows..." />;
  }
  
  return (
    <div className="page-transition">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Workflows</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and execute your automation workflows
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Workflow
          </button>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row md:items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            placeholder="Search workflows..."
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100'
                : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          
          <button
            onClick={() => setFilter('running')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              filter === 'running'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100'
                : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            Running
          </button>
          
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              filter === 'completed'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100'
                : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            Completed
          </button>
          
          <button
            onClick={() => setFilter('failed')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              filter === 'failed'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100'
                : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            Failed
          </button>
        </div>
      </div>
      
      {/* Workflows List */}
      {filteredWorkflows.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm text-center border border-gray-200 dark:border-gray-700">
          <FolderIcon className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No workflows found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchQuery ? 'Try a different search term' : 'Create your first workflow to get started'}
          </p>
          <div className="mt-6">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Workflow
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredWorkflows.map((workflow) => (
                  <tr 
                    key={workflow.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => navigate(`/workflows/${workflow.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{workflow.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {workflow.description?.length > 50 
                        ? `${workflow.description.substring(0, 50)}...` 
                        : workflow.description || 'No description'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        workflow.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 
                        workflow.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' :
                        workflow.status === 'running' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                        workflow.status === 'paused' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {workflow.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            workflow.status === 'failed' ? 'bg-red-500' :
                            workflow.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${workflow.completedSteps / Math.max(workflow.stepCount, 1) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs mt-1">
                        {workflow.completedSteps}/{workflow.stepCount} steps
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {workflow.createdAt ? format(new Date(workflow.createdAt), 'MMM d, yyyy') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {workflow.status === 'created' || workflow.status === 'failed' || workflow.status === 'cancelled' ? (
                          <button
                            onClick={(e) => handleExecuteWorkflow(workflow.id, e)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200"
                          >
                            <ArrowPathIcon className="h-5 w-5" />
                          </button>
                        ) : null}
                        
                        {workflow.status === 'running' ? (
                          <button
                            onClick={(e) => handlePauseWorkflow(workflow.id, e)}
                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-200"
                          >
                            <PauseIcon className="h-5 w-5" />
                          </button>
                        ) : null}
                        
                        {workflow.status === 'paused' ? (
                          <button
                            onClick={(e) => handleResumeWorkflow(workflow.id, e)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200"
                          >
                            <PlayIcon className="h-5 w-5" />
                          </button>
                        ) : null}
                        
                        {workflow.status === 'running' || workflow.status === 'paused' ? (
                          <button
                            onClick={(e) => handleCancelWorkflow(workflow.id, e)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Create Workflow Modal */}
      {createModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Create Workflow
                </h3>
                
                <div className="mt-4">
                  {!selectedTemplate ? (
                    <>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Select a workflow template to get started:
                      </p>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {templates.map((template) => (
                          <div
                            key={template.id}
                            onClick={() => handleTemplateSelect(template)}
                            className="relative rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {template.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {template.description || 'No description'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="workflow-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Workflow Name
                          </label>
                          <input
                            type="text"
                            id="workflow-name"
                            value={workflowName}
                            onChange={(e) => setWorkflowName(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="workflow-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description (Optional)
                          </label>
                          <textarea
                            id="workflow-description"
                            value={workflowDescription}
                            onChange={(e) => setWorkflowDescription(e.target.value)}
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                          />
                        </div>
                        
                        {selectedTemplate.variables && Object.keys(selectedTemplate.variables).length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Template Variables
                            </h4>
                            
                            <div className="space-y-2">
                              {Object.entries(selectedTemplate.variables).map(([name, defaultValue]) => (
                                <div key={name}>
                                  <label htmlFor={`var-${name}`} className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {name}
                                  </label>
                                  <input
                                    type="text"
                                    id={`var-${name}`}
                                    value={variableValues[name] || ''}
                                    onChange={(e) => handleVariableChange(name, e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-xs"
                                    placeholder={defaultValue}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => {
                    if (selectedTemplate) {
                      setSelectedTemplate(null);
                    } else {
                      setCreateModalOpen(false);
                    }
                  }}
                  className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                >
                  {selectedTemplate ? 'Back' : 'Cancel'}
                </button>
                
                {selectedTemplate && (
                  <button
                    onClick={handleCreateWorkflow}
                    disabled={!workflowName}
                    className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      workflowName
                        ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none'
                        : 'bg-blue-400 cursor-not-allowed'
                    }`}
                  >
                    Create Workflow
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

export default Workflows;
