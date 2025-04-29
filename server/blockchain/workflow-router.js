// server/blockchain/workflow-router.js
const express = require('express');
const router = express.Router();
const {
  TransactionWorkflow,
  createWorkflowFromTemplate,
  getWorkflow,
  getAllWorkflows,
  getWorkflowSummaries,
  workflowEvents,
  STEP_STATUS,
  WORKFLOW_STATUS,
  STEP_TYPE
} = require('./workflow');
const fs = require('fs').promises;
const path = require('path');

// Setup Socket.io event forwarding
workflowEvents.on('workflow:created', (data) => {
  global.io.emit('workflow:created', data);
});

workflowEvents.on('workflow:started', (data) => {
  global.io.emit('workflow:started', data);
  
  // Also emit to workflow-specific room
  global.io.to(`workflow-${data.workflowId}`).emit('workflow:started', data);
});

workflowEvents.on('workflow:step_update', (data) => {
  global.io.to(`workflow-${data.workflowId}`).emit('workflow:step_update', data);
});

workflowEvents.on('workflow:variable_updated', (data) => {
  global.io.to(`workflow-${data.workflowId}`).emit('workflow:variable_updated', data);
});

workflowEvents.on('workflow:step_command_fixed', (data) => {
  global.io.to(`workflow-${data.workflowId}`).emit('workflow:step_command_fixed', data);
});

workflowEvents.on('workflow:completed', (data) => {
  global.io.emit('workflow:completed', data);
  global.io.to(`workflow-${data.workflowId}`).emit('workflow:completed', data);
});

workflowEvents.on('workflow:failed', (data) => {
  global.io.emit('workflow:failed', data);
  global.io.to(`workflow-${data.workflowId}`).emit('workflow:failed', data);
});

workflowEvents.on('workflow:paused', (data) => {
  global.io.to(`workflow-${data.workflowId}`).emit('workflow:paused', data);
});

workflowEvents.on('workflow:resumed', (data) => {
  global.io.to(`workflow-${data.workflowId}`).emit('workflow:resumed', data);
});

workflowEvents.on('workflow:cancelled', (data) => {
  global.io.emit('workflow:cancelled', data);
  global.io.to(`workflow-${data.workflowId}`).emit('workflow:cancelled', data);
});

/**
 * Get all workflow templates
 * GET /api/workflow/templates
 */
router.get('/templates', async (req, res) => {
  try {
    // Get templates from workflows directory
    const templatesDir = path.join(__dirname, '..', '..', 'workflows');
    
    let templates = [];
    
    try {
      const files = await fs.readdir(templatesDir);
      
      // Read each template file
      for (const file of files) {
        if (file.endsWith('.json')) {
          const templatePath = path.join(templatesDir, file);
          const templateData = await fs.readFile(templatePath, 'utf8');
          const template = JSON.parse(templateData);
          
          templates.push({
            id: file.replace('.json', ''),
            name: template.name,
            description: template.description,
            variables: template.variables || {}
          });
        }
      }
    } catch (error) {
      console.error('Error reading templates directory:', error);
      // Ignore and continue with built-in templates
    }
    
    // Add built-in templates
    const builtInTemplates = [
      {
        id: 'erc20',
        name: 'Deploy ERC20 Token',
        description: 'Deploy a new ERC20 token contract',
        variables: {
          tokenName: 'My Token',
          tokenSymbol: 'MTK',
          tokenDecimals: 18,
          initialSupply: '1000000'
        }
      },
      {
        id: 'nft',
        name: 'Deploy NFT Collection',
        description: 'Deploy a new NFT collection contract',
        variables: {
          collectionName: 'My NFTs',
          collectionSymbol: 'MNFT',
          baseURI: 'ipfs://Qm...',
          mintCount: 5,
          recipient: '0x0000000000000000000000000000000000000000'
        }
      },
      {
        id: 'swap',
        name: 'Token Swap',
        description: 'Swap tokens on a DEX',
        variables: {
          tokenAddress: '0x0000000000000000000000000000000000000000',
          routerAddress: '0x0000000000000000000000000000000000000000',
          outputTokenAddress: '0x0000000000000000000000000000000000000000',
          amount: '1.0',
          slippage: '0.5'
        }
      }
    ];
    
    // Add built-in templates if not already in the list
    for (const builtIn of builtInTemplates) {
      if (!templates.find(t => t.id === builtIn.id)) {
        templates.push(builtIn);
      }
    }
    
    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Create a workflow from a template
 * POST /api/workflow/create-from-template
 */
router.post('/create-from-template', async (req, res) => {
  try {
    const { templateId, variables, name, description, network } = req.body;
    
    if (!templateId) {
      return res.status(400).json({
        success: false,
        error: 'Template ID is required'
      });
    }
    
    // Create workflow from template
    const workflow = await createWorkflowFromTemplate(
      templateId,
      variables || {},
      {
        name: name || undefined,
        description: description || undefined,
        network: network || 'TESTNET'
      }
    );
    
    res.json({
      success: true,
      workflow: workflow.getSummary()
    });
  } catch (error) {
    console.error('Create workflow error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Create a custom workflow
 * POST /api/workflow/create
 */
router.post('/create', (req, res) => {
  try {
    const { name, description, steps = [], variables = {}, network } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Workflow name is required'
      });
    }
    
    // Create new workflow
    const workflow = new TransactionWorkflow(
      name,
      description || '',
      { network: network || 'TESTNET' }
    );
    
    // Set variables
    Object.entries(variables).forEach(([key, value]) => {
      workflow.setVariable(key, value);
    });
    
    // Add steps
    steps.forEach(step => {
      workflow.addStep(step);
    });
    
    res.json({
      success: true,
      workflow: workflow.getSummary()
    });
  } catch (error) {
    console.error('Create workflow error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get all workflows
 * GET /api/workflow
 */
router.get('/', (req, res) => {
  try {
    const workflows = getWorkflowSummaries();
    
    res.json({
      success: true,
      workflows
    });
  } catch (error) {
    console.error('Get workflows error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get workflow by ID
 * GET /api/workflow/:id
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const workflow = getWorkflow(id);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: `Workflow not found: ${id}`
      });
    }
    
    res.json({
      success: true,
      workflow: workflow.getDetails()
    });
  } catch (error) {
    console.error('Get workflow error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Execute a workflow
 * POST /api/workflow/:id/execute
 */
router.post('/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const { privateKey } = req.body;
    
    const workflow = getWorkflow(id);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: `Workflow not found: ${id}`
      });
    }
    
    // Set wallet if private key provided
    if (privateKey) {
      workflow.setWallet(privateKey);
    }
    
    // Execute workflow in background
    workflow.execute().catch(error => {
      console.error(`Workflow ${id} execution error:`, error);
    });
    
    res.json({
      success: true,
      message: `Workflow ${id} execution started`,
      workflow: workflow.getSummary()
    });
  } catch (error) {
    console.error('Execute workflow error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Pause a workflow
 * POST /api/workflow/:id/pause
 */
router.post('/:id/pause', (req, res) => {
  try {
    const { id } = req.params;
    const workflow = getWorkflow(id);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: `Workflow not found: ${id}`
      });
    }
    
    const result = workflow.pause();
    
    res.json({
      success: result,
      message: result ? `Workflow ${id} paused` : `Workflow ${id} cannot be paused in its current state`,
      workflow: workflow.getSummary()
    });
  } catch (error) {
    console.error('Pause workflow error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Resume a workflow
 * POST /api/workflow/:id/resume
 */
router.post('/:id/resume', (req, res) => {
  try {
    const { id } = req.params;
    const workflow = getWorkflow(id);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: `Workflow not found: ${id}`
      });
    }
    
    // Resume workflow in background
    workflow.resume().catch(error => {
      console.error(`Workflow ${id} resume error:`, error);
    });
    
    res.json({
      success: true,
      message: `Workflow ${id} resuming`,
      workflow: workflow.getSummary()
    });
  } catch (error) {
    console.error('Resume workflow error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Cancel a workflow
 * POST /api/workflow/:id/cancel
 */
router.post('/:id/cancel', (req, res) => {
  try {
    const { id } = req.params;
    const workflow = getWorkflow(id);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: `Workflow not found: ${id}`
      });
    }
    
    const result = workflow.cancel();
    
    res.json({
      success: result,
      message: result ? `Workflow ${id} cancelled` : `Workflow ${id} cannot be cancelled in its current state`,
      workflow: workflow.getSummary()
    });
  } catch (error) {
    console.error('Cancel workflow error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Save a workflow template
 * POST /api/workflow/:id/save-template
 */
router.post('/:id/save-template', async (req, res) => {
  try {
    const { id } = req.params;
    const { templateName } = req.body;
    
    if (!templateName) {
      return res.status(400).json({
        success: false,
        error: 'Template name is required'
      });
    }
    
    const workflow = getWorkflow(id);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: `Workflow not found: ${id}`
      });
    }
    
    // Create templates directory if it doesn't exist
    const templatesDir = path.join(__dirname, '..', '..', 'workflows');
    try {
      await fs.mkdir(templatesDir, { recursive: true });
    } catch (error) {
      console.error('Create templates directory error:', error);
    }
    
    // Save template
    const templatePath = path.join(templatesDir, `${templateName}.json`);
    
    // Prepare template data
    const templateData = {
      name: workflow.name,
      description: workflow.description,
      variables: workflow.variables,
      steps: workflow.steps.map(step => ({
        id: step.id,
        name: step.name,
        type: step.type,
        command: step.command,
        description: step.description,
        dependencies: step.dependencies,
        extractVariables: step.extractVariables
      }))
    };
    
    // Save to file
    await fs.writeFile(templatePath, JSON.stringify(templateData, null, 2));
    
    res.json({
      success: true,
      message: `Workflow ${id} saved as template ${templateName}`,
      templatePath
    });
  } catch (error) {
    console.error('Save template error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Add a step to a workflow
 * POST /api/workflow/:id/add-step
 */
router.post('/:id/add-step', (req, res) => {
  try {
    const { id } = req.params;
    const { step } = req.body;
    
    if (!step) {
      return res.status(400).json({
        success: false,
        error: 'Step configuration is required'
      });
    }
    
    const workflow = getWorkflow(id);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: `Workflow not found: ${id}`
      });
    }
    
    // Add step
    const stepIndex = workflow.addStep(step);
    
    res.json({
      success: true,
      stepIndex,
      step: workflow.steps[stepIndex],
      workflow: workflow.getSummary()
    });
  } catch (error) {
    console.error('Add step error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Set workflow variable
 * POST /api/workflow/:id/set-variable
 */
router.post('/:id/set-variable', (req, res) => {
  try {
    const { id } = req.params;
    const { name, value } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Variable name is required'
      });
    }
    
    const workflow = getWorkflow(id);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: `Workflow not found: ${id}`
      });
    }
    
    // Set variable
    workflow.setVariable(name, value);
    
    res.json({
      success: true,
      variables: workflow.variables,
      workflow: workflow.getSummary()
    });
  } catch (error) {
    console.error('Set variable error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = { workflowRouter: router };