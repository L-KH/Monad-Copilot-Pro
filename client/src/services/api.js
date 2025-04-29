import axios from 'axios';
import mockApi from './mockApi';

// Use mock API instead of real axios for development
const api = mockApi;

// Set this to true to use real API, false to use mock data
const USE_REAL_API = false;

// Create axios instance with base URL (used when USE_REAL_API is true)
const realApi = axios.create({
  baseURL: '/api',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// API health check
export const checkApiStatus = async () => {
  try {
    if (USE_REAL_API) {
      const response = await axios.get('/health');
      return { success: true, ...response.data };
    } else {
      // Use mock data
      const response = await api.get('/health');
      return response.data;
    }
  } catch (error) {
    console.error('API status check failed:', error);
    return { success: false, error: error.message };
  }
};

// AI Assistant API

// Chat with Claude AI
export const chatWithClaude = async (message, systemPrompt, model) => {
  try {
    const response = await api.post('/ai/chat', { message, systemPrompt, model });
    return response.data;
  } catch (error) {
    console.error('Chat with Claude error:', error);
    throw error;
  }
};

// Generate smart contract
export const generateSmartContract = async (description, contractType) => {
  try {
    const response = await api.post('/ai/generate-contract', { description, contractType });
    return response.data;
  } catch (error) {
    console.error('Generate contract error:', error);
    throw error;
  }
};

// Analyze smart contract
export const analyzeSmartContract = async (code) => {
  try {
    const response = await api.post('/ai/analyze-contract', { code });
    return response.data;
  } catch (error) {
    console.error('Analyze contract error:', error);
    throw error;
  }
};

// Generate Monad CLI commands
export const generateMonadCommands = async (instructions) => {
  try {
    const response = await api.post('/ai/generate-commands', { instructions });
    return response.data;
  } catch (error) {
    console.error('Generate commands error:', error);
    throw error;
  }
};

// Debug transaction error
export const debugTransactionError = async (command, error) => {
  try {
    const response = await api.post('/ai/debug-transaction', { command, error });
    return response.data;
  } catch (error) {
    console.error('Debug transaction error:', error);
    throw error;
  }
};

// Generate DeFi project
export const generateDeFiProject = async (description, projectType) => {
  try {
    const response = await api.post('/ai/generate-defi-project', { description, projectType });
    return response.data;
  } catch (error) {
    console.error('Generate DeFi project error:', error);
    throw error;
  }
};

// Monad Blockchain API

// Get network info
export const getNetworks = async () => {
  try {
    const response = await api.get('/monad/networks');
    return response.data;
  } catch (error) {
    console.error('Get networks error:', error);
    throw error;
  }
};

// Get address balance
export const getBalance = async (address, network = 'TESTNET') => {
  try {
    const response = await api.get(`/monad/balance/${address}`, { params: { network } });
    return response.data;
  } catch (error) {
    console.error('Get balance error:', error);
    throw error;
  }
};

// Get transaction details
export const getTransaction = async (hash, network = 'TESTNET') => {
  try {
    const response = await api.get(`/monad/tx/${hash}`, { params: { network } });
    return response.data;
  } catch (error) {
    console.error('Get transaction error:', error);
    throw error;
  }
};

// Send transaction
export const sendTransaction = async (privateKey, to, value, data, gasLimit, network = 'TESTNET') => {
  try {
    const response = await api.post('/monad/send-transaction', {
      privateKey,
      to,
      value,
      data,
      gasLimit,
      network
    });
    return response.data;
  } catch (error) {
    console.error('Send transaction error:', error);
    throw error;
  }
};

// Call contract (read-only)
export const callContract = async (address, abi, functionName, args = [], network = 'TESTNET') => {
  try {
    const response = await api.post('/monad/call-contract', {
      address,
      abi,
      functionName,
      args,
      network
    });
    return response.data;
  } catch (error) {
    console.error('Call contract error:', error);
    throw error;
  }
};

// Execute contract function (write operation)
export const executeContract = async (privateKey, address, abi, functionName, args = [], options = {}, network = 'TESTNET') => {
  try {
    const response = await api.post('/monad/execute-contract', {
      privateKey,
      address,
      abi,
      functionName,
      args,
      options,
      network
    });
    return response.data;
  } catch (error) {
    console.error('Execute contract error:', error);
    throw error;
  }
};

// Estimate gas
export const estimateGas = async (from, to, value, data, network = 'TESTNET') => {
  try {
    const response = await api.post('/monad/estimate-gas', {
      from,
      to,
      value,
      data,
      network
    });
    return response.data;
  } catch (error) {
    console.error('Estimate gas error:', error);
    throw error;
  }
};

// Get gas price
export const getGasPrice = async (network = 'TESTNET') => {
  try {
    const response = await api.get('/monad/gas-price', { params: { network } });
    return response.data;
  } catch (error) {
    console.error('Get gas price error:', error);
    throw error;
  }
};

// Workflow API

// Get workflow templates
export const getWorkflowTemplates = async () => {
  try {
    const response = await api.get('/workflow/templates');
    return response.data;
  } catch (error) {
    console.error('Get workflow templates error:', error);
    throw error;
  }
};

// Create workflow from template
export const createWorkflowFromTemplate = async (templateId, variables, name, description, network) => {
  try {
    const response = await api.post('/workflow/create-from-template', {
      templateId,
      variables,
      name,
      description,
      network
    });
    return response.data;
  } catch (error) {
    console.error('Create workflow from template error:', error);
    throw error;
  }
};

// Create custom workflow
export const createCustomWorkflow = async (name, description, steps = [], variables = {}, network) => {
  try {
    const response = await api.post('/workflow/create', {
      name,
      description,
      steps,
      variables,
      network
    });
    return response.data;
  } catch (error) {
    console.error('Create custom workflow error:', error);
    throw error;
  }
};

// Get all workflows
export const getWorkflows = async () => {
  try {
    const response = await api.get('/workflow');
    return response.data;
  } catch (error) {
    console.error('Get workflows error:', error);
    throw error;
  }
};

// Get workflow by ID
export const getWorkflow = async (id) => {
  try {
    const response = await api.get(`/workflow/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get workflow error:', error);
    throw error;
  }
};

// Execute workflow
export const executeWorkflow = async (id, privateKey) => {
  try {
    const response = await api.post(`/workflow/${id}/execute`, { privateKey });
    return response.data;
  } catch (error) {
    console.error('Execute workflow error:', error);
    throw error;
  }
};

// Pause workflow
export const pauseWorkflow = async (id) => {
  try {
    const response = await api.post(`/workflow/${id}/pause`);
    return response.data;
  } catch (error) {
    console.error('Pause workflow error:', error);
    throw error;
  }
};

// Resume workflow
export const resumeWorkflow = async (id) => {
  try {
    const response = await api.post(`/workflow/${id}/resume`);
    return response.data;
  } catch (error) {
    console.error('Resume workflow error:', error);
    throw error;
  }
};

// Cancel workflow
export const cancelWorkflow = async (id) => {
  try {
    const response = await api.post(`/workflow/${id}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Cancel workflow error:', error);
    throw error;
  }
};

// Save workflow as template
export const saveWorkflowAsTemplate = async (id, templateName) => {
  try {
    const response = await api.post(`/workflow/${id}/save-template`, { templateName });
    return response.data;
  } catch (error) {
    console.error('Save workflow as template error:', error);
    throw error;
  }
};

// Add step to workflow
export const addWorkflowStep = async (id, step) => {
  try {
    const response = await api.post(`/workflow/${id}/add-step`, { step });
    return response.data;
  } catch (error) {
    console.error('Add workflow step error:', error);
    throw error;
  }
};

// Set workflow variable
export const setWorkflowVariable = async (id, name, value) => {
  try {
    const response = await api.post(`/workflow/${id}/set-variable`, { name, value });
    return response.data;
  } catch (error) {
    console.error('Set workflow variable error:', error);
    throw error;
  }
};

export default api;
