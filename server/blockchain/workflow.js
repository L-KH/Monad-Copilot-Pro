// server/blockchain/workflow.js
const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');
const { v4: uuidv4 } = require('uuid');
const { createProvider, createWallet } = require('./monad');
const { debugTransactionError } = require('../ai/claude');

// Create an event emitter for workflow updates
const workflowEvents = new EventEmitter();

// In-memory workflow store
const workflows = {};

/**
 * Workflow step status enum
 */
const STEP_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCESSFUL: 'successful',
  FAILED: 'failed',
  SKIPPED: 'skipped',
  RETRYING: 'retrying'
};

/**
 * Workflow status enum
 */
const WORKFLOW_STATUS = {
  CREATED: 'created',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  PAUSED: 'paused',
  CANCELLED: 'cancelled'
};

/**
 * Step type enum
 */
const STEP_TYPE = {
  DEPLOY_CONTRACT: 'deploy_contract',
  CALL_CONTRACT: 'call_contract',
  TRANSFER: 'transfer',
  APPROVE: 'approve',
  VERIFY_CONTRACT: 'verify_contract',
  COMPILE: 'compile',
  CUSTOM: 'custom'
};

/**
 * Transaction Workflow class
 */
class TransactionWorkflow {
  /**
   * Create a new workflow
   * @param {string} name - Workflow name
   * @param {string} description - Workflow description
   * @param {object} options - Workflow options
   */
  constructor(name, description = '', options = {}) {
    this.id = options.id || uuidv4();
    this.name = name;
    this.description = description;
    this.steps = [];
    this.variables = {};
    this.status = WORKFLOW_STATUS.CREATED;
    this.network = options.network || 'TESTNET';
    this.provider = options.provider || createProvider(this.network);
    this.wallet = null;
    this.createdAt = new Date().toISOString();
    this.startedAt = null;
    this.completedAt = null;
    this.currentStepIndex = null;
    this.maxRetries = options.maxRetries || 3;
    this.autoResolveErrors = options.autoResolveErrors !== false;
    
    // Store in workflows object
    workflows[this.id] = this;
    
    // Emit creation event
    workflowEvents.emit('workflow:created', this.getSummary());
  }
  
  /**
   * Set a wallet for the workflow
   * @param {string} privateKey - Private key (without 0x prefix)
   */
  setWallet(privateKey) {
    try {
      this.wallet = createWallet(privateKey, this.provider);
      return true;
    } catch (error) {
      console.error('Failed to set wallet:', error);
      return false;
    }
  }
  
  /**
   * Add a step to the workflow
   * @param {object} step - Step configuration
   * @returns {number} - Step index
   */
  addStep(step) {
    const newStep = {
      id: step.id || uuidv4(),
      name: step.name || `Step ${this.steps.length + 1}`,
      type: step.type || STEP_TYPE.CUSTOM,
      command: step.command || '',
      description: step.description || '',
      status: STEP_STATUS.PENDING,
      dependencies: step.dependencies || [],
      retryCount: 0,
      output: null,
      error: null,
      transaction: null,
      startedAt: null,
      completedAt: null,
      ...step
    };
    
    this.steps.push(newStep);
    
    // Emit step added event
    workflowEvents.emit('workflow:step_added', {
      workflowId: this.id,
      step: newStep
    });
    
    return this.steps.length - 1;
  }
  
  /**
   * Set a variable
   * @param {string} name - Variable name
   * @param {any} value - Variable value
   */
  setVariable(name, value) {
    this.variables[name] = value;
    
    // Emit variable update event
    workflowEvents.emit('workflow:variable_updated', {
      workflowId: this.id,
      name,
      value
    });
    
    return true;
  }
  
  /**
   * Get a variable value
   * @param {string} name - Variable name
   * @returns {any} - Variable value
   */
  getVariable(name) {
    return this.variables[name];
  }
  
  /**
   * Process template strings with variables
   * @param {string} template - Template string with {{variable}} placeholders
   * @returns {string} - Processed string
   */
  processTemplate(template) {
    if (typeof template !== 'string') {
      return template;
    }
    
    return template.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
      const value = this.getVariable(varName.trim());
      return value !== undefined ? value : match;
    });
  }
  
  /**
   * Check if all dependencies are satisfied for a step
   * @param {object} step - Step to check
   * @returns {boolean} - True if dependencies are satisfied
   */
  areDependenciesSatisfied(step) {
    return step.dependencies.every(depId => {
      const depStep = this.steps.find(s => s.id === depId);
      return depStep && depStep.status === STEP_STATUS.SUCCESSFUL;
    });
  }
  
  /**
   * Execute a workflow step
   * @param {object} step - Step to execute
   * @returns {Promise<object>} - Step result
   */
  async executeStep(step) {
    // Check if dependencies are satisfied
    if (!this.areDependenciesSatisfied(step)) {
      step.status = STEP_STATUS.SKIPPED;
      step.error = 'Dependencies not satisfied';
      
      workflowEvents.emit('workflow:step_update', {
        workflowId: this.id,
        stepId: step.id,
        status: step.status,
        error: step.error
      });
      
      return {
        success: false,
        error: 'Dependencies not satisfied'
      };
    }
    
    // Mark step as running
    step.status = STEP_STATUS.RUNNING;
    step.startedAt = new Date().toISOString();
    
    workflowEvents.emit('workflow:step_update', {
      workflowId: this.id,
      stepId: step.id,
      status: step.status
    });
    
    try {
      // Process command template
      const processedCommand = this.processTemplate(step.command);
      
      // Execute based on step type
      let result;
      
      switch (step.type) {
        case STEP_TYPE.DEPLOY_CONTRACT:
          result = await this.executeDeployContract(step, processedCommand);
          break;
        
        case STEP_TYPE.CALL_CONTRACT:
          result = await this.executeCallContract(step, processedCommand);
          break;
        
        case STEP_TYPE.TRANSFER:
          result = await this.executeTransfer(step, processedCommand);
          break;
        
        case STEP_TYPE.APPROVE:
          result = await this.executeApprove(step, processedCommand);
          break;
        
        case STEP_TYPE.VERIFY_CONTRACT:
          result = await this.executeVerifyContract(step, processedCommand);
          break;
        
        case STEP_TYPE.COMPILE:
          result = await this.executeCompile(step, processedCommand);
          break;
        
        case STEP_TYPE.CUSTOM:
        default:
          result = await this.executeCustomCommand(step, processedCommand);
          break;
      }
      
      // Update step status and result
      step.status = STEP_STATUS.SUCCESSFUL;
      step.output = result;
      step.completedAt = new Date().toISOString();
      
      // Extract variables if configured
      if (step.extractVariables && typeof step.extractVariables === 'object') {
        Object.entries(step.extractVariables).forEach(([varName, path]) => {
          // Handle both string paths and extractor functions
          if (typeof path === 'string') {
            // Navigate the result object using the path
            const value = path.split('.').reduce((obj, key) => {
              return obj && obj[key] !== undefined ? obj[key] : undefined;
            }, result);
            
            if (value !== undefined) {
              this.setVariable(varName, value);
            }
          } else if (typeof path === 'function') {
            // Use the extractor function
            const value = path(result);
            if (value !== undefined) {
              this.setVariable(varName, value);
            }
          }
        });
      }
      
      workflowEvents.emit('workflow:step_update', {
        workflowId: this.id,
        stepId: step.id,
        status: step.status,
        output: step.output
      });
      
      return {
        success: true,
        result
      };
    } catch (error) {
      // Handle step failure
      step.status = STEP_STATUS.FAILED;
      step.error = {
        message: error.message,
        stack: error.stack
      };
      
      workflowEvents.emit('workflow:step_update', {
        workflowId: this.id,
        stepId: step.id,
        status: step.status,
        error: step.error
      });
      
      // Attempt to retry if not at max retries
      if (step.retryCount < this.maxRetries) {
        return this.retryStep(step);
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Retry a failed step
   * @param {object} step - Failed step
   * @returns {Promise<object>} - Retry result
   */
  async retryStep(step) {
    step.retryCount++;
    step.status = STEP_STATUS.RETRYING;
    
    workflowEvents.emit('workflow:step_update', {
      workflowId: this.id,
      stepId: step.id,
      status: step.status,
      retryCount: step.retryCount
    });
    
    // If auto-resolve is enabled, try to fix the command with AI
    if (this.autoResolveErrors && step.error) {
      try {
        const fixedCommand = await debugTransactionError(
          step.command,
          step.error.message
        );
        
        // Update step with fixed command
        const originalCommand = step.command;
        step.command = fixedCommand.fixedCommand || fixedCommand;
        step.aiFixed = true;
        
        workflowEvents.emit('workflow:step_command_fixed', {
          workflowId: this.id,
          stepId: step.id,
          originalCommand,
          fixedCommand: step.command
        });
      } catch (aiError) {
        console.error('AI fix error:', aiError);
        // Continue with original command
      }
    }
    
    // Add a small delay before retrying
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Execute the step again
    return this.executeStep(step);
  }
  
  /**
   * Execute the workflow
   * @returns {Promise<object>} - Workflow result
   */
  async execute() {
    // Check if wallet is set for operations that need it
    const needsWallet = this.steps.some(step => 
      [STEP_TYPE.DEPLOY_CONTRACT, STEP_TYPE.CALL_CONTRACT, STEP_TYPE.TRANSFER, STEP_TYPE.APPROVE].includes(step.type)
    );
    
    if (needsWallet && !this.wallet) {
      throw new Error('Wallet is required for this workflow but not set');
    }
    
    // Set workflow status to running
    this.status = WORKFLOW_STATUS.RUNNING;
    this.startedAt = new Date().toISOString();
    this.currentStepIndex = 0;
    
    workflowEvents.emit('workflow:started', {
      workflowId: this.id,
      startedAt: this.startedAt
    });
    
    try {
      // Execute steps in sequence, respecting dependencies
      for (let i = 0; i < this.steps.length; i++) {
        this.currentStepIndex = i;
        const step = this.steps[i];
        
        // Skip already executed steps
        if ([STEP_STATUS.SUCCESSFUL, STEP_STATUS.SKIPPED].includes(step.status)) {
          continue;
        }
        
        // Execute the step
        const result = await this.executeStep(step);
        
        // If step failed and dependencies are set, mark workflow as failed
        if (!result.success && this.steps.some(s => s.dependencies.includes(step.id))) {
          this.status = WORKFLOW_STATUS.FAILED;
          this.completedAt = new Date().toISOString();
          
          workflowEvents.emit('workflow:failed', {
            workflowId: this.id,
            error: `Step "${step.name}" failed and has dependents`,
            completedAt: this.completedAt
          });
          
          return {
            success: false,
            error: `Workflow failed at step "${step.name}"`,
            workflow: this.getSummary()
          };
        }
      }
      
      // Check if all steps were successful or skipped
      const allDone = this.steps.every(step => 
        [STEP_STATUS.SUCCESSFUL, STEP_STATUS.SKIPPED].includes(step.status)
      );
      
      if (allDone) {
        this.status = WORKFLOW_STATUS.COMPLETED;
      } else {
        this.status = WORKFLOW_STATUS.FAILED;
      }
      
      this.completedAt = new Date().toISOString();
      
      const eventName = this.status === WORKFLOW_STATUS.COMPLETED ? 'workflow:completed' : 'workflow:failed';
      workflowEvents.emit(eventName, {
        workflowId: this.id,
        completedAt: this.completedAt
      });
      
      return {
        success: this.status === WORKFLOW_STATUS.COMPLETED,
        workflow: this.getSummary()
      };
    } catch (error) {
      // Mark workflow as failed
      this.status = WORKFLOW_STATUS.FAILED;
      this.completedAt = new Date().toISOString();
      
      workflowEvents.emit('workflow:failed', {
        workflowId: this.id,
        error: error.message,
        completedAt: this.completedAt
      });
      
      return {
        success: false,
        error: error.message,
        workflow: this.getSummary()
      };
    }
  }
  
  /**
   * Pause the workflow
   * @returns {boolean} - Success
   */
  pause() {
    if (this.status === WORKFLOW_STATUS.RUNNING) {
      this.status = WORKFLOW_STATUS.PAUSED;
      
      workflowEvents.emit('workflow:paused', {
        workflowId: this.id
      });
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Resume the workflow
   * @returns {Promise<object>} - Workflow result
   */
  async resume() {
    if (this.status === WORKFLOW_STATUS.PAUSED) {
      this.status = WORKFLOW_STATUS.RUNNING;
      
      workflowEvents.emit('workflow:resumed', {
        workflowId: this.id
      });
      
      return this.execute();
    }
    
    return {
      success: false,
      error: 'Workflow is not paused'
    };
  }
  
  /**
   * Cancel the workflow
   * @returns {boolean} - Success
   */
  cancel() {
    if ([WORKFLOW_STATUS.RUNNING, WORKFLOW_STATUS.PAUSED].includes(this.status)) {
      this.status = WORKFLOW_STATUS.CANCELLED;
      this.completedAt = new Date().toISOString();
      
      workflowEvents.emit('workflow:cancelled', {
        workflowId: this.id,
        completedAt: this.completedAt
      });
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Get workflow summary
   * @returns {object} - Workflow summary
   */
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      status: this.status,
      network: this.network,
      stepCount: this.steps.length,
      completedSteps: this.steps.filter(s => s.status === STEP_STATUS.SUCCESSFUL).length,
      failedSteps: this.steps.filter(s => s.status === STEP_STATUS.FAILED).length,
      pendingSteps: this.steps.filter(s => s.status === STEP_STATUS.PENDING).length,
      currentStep: this.currentStepIndex !== null ? this.steps[this.currentStepIndex]?.name : null,
      createdAt: this.createdAt,
      startedAt: this.startedAt,
      completedAt: this.completedAt
    };
  }
  
  /**
   * Get workflow details
   * @returns {object} - Workflow details
   */
  getDetails() {
    return {
      ...this.getSummary(),
      steps: this.steps.map(step => ({
        id: step.id,
        name: step.name,
        type: step.type,
        description: step.description,
        status: step.status,
        command: step.command,
        dependencies: step.dependencies,
        retryCount: step.retryCount,
        output: step.output,
        error: step.error,
        transaction: step.transaction,
        startedAt: step.startedAt,
        completedAt: step.completedAt
      })),
      variables: { ...this.variables }
    };
  }
  
  /**
   * Save workflow to a file
   * @param {string} filepath - File path
   * @returns {Promise<boolean>} - Success
   */
  async save(filepath) {
    try {
      // Prepare data for saving
      const data = {
        id: this.id,
        name: this.name,
        description: this.description,
        status: this.status,
        network: this.network,
        steps: this.steps,
        variables: this.variables,
        createdAt: this.createdAt,
        startedAt: this.startedAt,
        completedAt: this.completedAt,
        maxRetries: this.maxRetries,
        autoResolveErrors: this.autoResolveErrors
      };
      
      // Save to file
      await fs.writeFile(filepath, JSON.stringify(data, null, 2));
      
      return true;
    } catch (error) {
      console.error('Workflow save error:', error);
      return false;
    }
  }
  
  /**
   * Execute deploy contract step
   * @param {object} step - Step configuration
   * @param {string} command - Processed command
   * @returns {Promise<object>} - Step result
   */
  async executeDeployContract(step, command) {
    // This would implement actual contract deployment logic
    // For demo purposes, we'll simulate deployment
    
    // Wait to simulate deployment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock deployment result
    const txHash = `0x${Date.now().toString(16)}${Math.random().toString(16).substring(2, 10)}`;
    const contractAddress = `0x${Math.random().toString(16).substring(2, 42)}`;
    
    return {
      txHash,
      contractAddress,
      gasUsed: Math.floor(Math.random() * 1000000) + 500000
    };
  }
  
  /**
   * Execute call contract step
   * @param {object} step - Step configuration
   * @param {string} command - Processed command
   * @returns {Promise<object>} - Step result
   */
  async executeCallContract(step, command) {
    // This would implement actual contract call logic
    // For demo purposes, we'll simulate a call
    
    // Wait to simulate transaction
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock transaction result
    const txHash = `0x${Date.now().toString(16)}${Math.random().toString(16).substring(2, 10)}`;
    
    return {
      txHash,
      gasUsed: Math.floor(Math.random() * 500000) + 50000,
      events: [
        {
          name: 'Transfer',
          args: {
            from: '0x0000000000000000000000000000000000000000',
            to: `0x${Math.random().toString(16).substring(2, 42)}`,
            value: '1000000000000000000'
          }
        }
      ]
    };
  }
  
  /**
   * Execute transfer step
   * @param {object} step - Step configuration
   * @param {string} command - Processed command
   * @returns {Promise<object>} - Step result
   */
  async executeTransfer(step, command) {
    // This would implement actual transfer logic
    // For demo purposes, we'll simulate a transfer
    
    // Wait to simulate transaction
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock transaction result
    const txHash = `0x${Date.now().toString(16)}${Math.random().toString(16).substring(2, 10)}`;
    
    return {
      txHash,
      gasUsed: Math.floor(Math.random() * 30000) + 21000
    };
  }
  
  /**
   * Execute approve step
   * @param {object} step - Step configuration
   * @param {string} command - Processed command
   * @returns {Promise<object>} - Step result
   */
  async executeApprove(step, command) {
    // This would implement actual token approval logic
    // For demo purposes, we'll simulate an approval
    
    // Wait to simulate transaction
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Mock transaction result
    const txHash = `0x${Date.now().toString(16)}${Math.random().toString(16).substring(2, 10)}`;
    
    return {
      txHash,
      gasUsed: Math.floor(Math.random() * 60000) + 40000
    };
  }
  
  /**
   * Execute verify contract step
   * @param {object} step - Step configuration
   * @param {string} command - Processed command
   * @returns {Promise<object>} - Step result
   */
  async executeVerifyContract(step, command) {
    // This would implement actual contract verification logic
    // For demo purposes, we'll simulate verification
    
    // Wait to simulate verification
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return {
      verified: true,
      url: `https://explorer.monad.xyz/address/${this.getVariable('contractAddress')}`
    };
  }
  
  /**
   * Execute compile step
   * @param {object} step - Step configuration
   * @param {string} command - Processed command
   * @returns {Promise<object>} - Step result
   */
  async executeCompile(step, command) {
    // This would implement actual contract compilation logic
    // For demo purposes, we'll simulate compilation
    
    // Wait to simulate compilation
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    return {
      success: true,
      artifacts: {
        contractName: 'CompiledContract',
        abi: [{ type: 'constructor', inputs: [] }],
        bytecode: '0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea264697066735822122...'
      }
    };
  }
  
  /**
   * Execute custom command step
   * @param {object} step - Step configuration
   * @param {string} command - Processed command
   * @returns {Promise<object>} - Step result
   */
  async executeCustomCommand(step, command) {
    // This would execute a custom command
    // For demo purposes, we'll simulate execution
    
    // Wait to simulate execution
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      output: `Executed command: ${command}`
    };
  }
}

/**
 * Create a workflow from a template
 * @param {string} templateName - Template name
 * @param {object} variables - Initial variables
 * @param {object} options - Workflow options
 * @returns {TransactionWorkflow} - Created workflow
 */
async function createWorkflowFromTemplate(templateName, variables = {}, options = {}) {
  try {
    // Check if template exists in workflows directory
    const templatePath = path.join(__dirname, '..', '..', 'workflows', `${templateName}.json`);
    
    let templateData;
    try {
      const templateFile = await fs.readFile(templatePath, 'utf8');
      templateData = JSON.parse(templateFile);
    } catch (error) {
      // Template file not found, use built-in templates
      templateData = getBuiltInTemplate(templateName);
      
      if (!templateData) {
        throw new Error(`Template not found: ${templateName}`);
      }
    }
    
    // Create workflow
    const workflow = new TransactionWorkflow(
      templateData.name,
      templateData.description,
      { ...options, id: uuidv4() }
    );
    
    // Set initial variables
    Object.entries({
      ...templateData.variables,
      ...variables
    }).forEach(([key, value]) => {
      workflow.setVariable(key, value);
    });
    
    // Add steps
    templateData.steps.forEach(step => {
      workflow.addStep(step);
    });
    
    return workflow;
  } catch (error) {
    console.error('Create workflow from template error:', error);
    throw error;
  }
}

/**
 * Get a built-in template
 * @param {string} templateName - Template name
 * @returns {object|null} - Template data
 */
function getBuiltInTemplate(templateName) {
  // Define built-in templates
  const templates = {
    // ERC20 Token Template
    erc20: {
      name: 'Deploy ERC20 Token',
      description: 'Deploy a new ERC20 token contract',
      variables: {
        tokenName: 'My Token',
        tokenSymbol: 'MTK',
        tokenDecimals: 18,
        initialSupply: '1000000'
      },
      steps: [
        {
          id: 'compile',
          name: 'Compile Token Contract',
          type: STEP_TYPE.COMPILE,
          command: 'monad compile Token.sol',
          extractVariables: {
            contractAbi: 'artifacts.abi',
            contractBytecode: 'artifacts.bytecode'
          }
        },
        {
          id: 'deploy',
          name: 'Deploy Token Contract',
          type: STEP_TYPE.DEPLOY_CONTRACT,
          command: 'monad deploy --contract Token --args \'["{{tokenName}}", "{{tokenSymbol}}", {{tokenDecimals}}, "{{initialSupply}}"]\'',
          dependencies: ['compile'],
          extractVariables: {
            contractAddress: 'contractAddress',
            deployTxHash: 'txHash'
          }
        },
        {
          id: 'verify',
          name: 'Verify Contract',
          type: STEP_TYPE.VERIFY_CONTRACT,
          command: 'monad verify --contract-address {{contractAddress}} --contract Token',
          dependencies: ['deploy']
        }
      ]
    },
    
    // NFT Collection Template
    nft: {
      name: 'Deploy NFT Collection',
      description: 'Deploy a new NFT collection contract',
      variables: {
        collectionName: 'My NFTs',
        collectionSymbol: 'MNFT',
        baseURI: 'ipfs://Qm...',
        mintCount: 5,
        recipient: '0x0000000000000000000000000000000000000000'
      },
      steps: [
        {
          id: 'compile',
          name: 'Compile NFT Contract',
          type: STEP_TYPE.COMPILE,
          command: 'monad compile NFT.sol',
          extractVariables: {
            contractAbi: 'artifacts.abi',
            contractBytecode: 'artifacts.bytecode'
          }
        },
        {
          id: 'deploy',
          name: 'Deploy NFT Contract',
          type: STEP_TYPE.DEPLOY_CONTRACT,
          command: 'monad deploy --contract NFT --args \'["{{collectionName}}", "{{collectionSymbol}}", "{{baseURI}}"]\'',
          dependencies: ['compile'],
          extractVariables: {
            contractAddress: 'contractAddress',
            deployTxHash: 'txHash'
          }
        },
        {
          id: 'verify',
          name: 'Verify Contract',
          type: STEP_TYPE.VERIFY_CONTRACT,
          command: 'monad verify --contract-address {{contractAddress}} --contract NFT',
          dependencies: ['deploy']
        },
        {
          id: 'mint',
          name: 'Mint NFTs',
          type: STEP_TYPE.CALL_CONTRACT,
          command: 'monad call --contract {{contractAddress}} --function "mintBatch(address,uint256)" --args \'["{{recipient}}", {{mintCount}}]\'',
          dependencies: ['verify']
        }
      ]
    },
    
    // Token Swap Template
    swap: {
      name: 'Token Swap',
      description: 'Swap tokens on a DEX',
      variables: {
        tokenAddress: '0x0000000000000000000000000000000000000000',
        routerAddress: '0x0000000000000000000000000000000000000000',
        outputTokenAddress: '0x0000000000000000000000000000000000000000',
        amount: '1.0',
        slippage: '0.5'
      },
      steps: [
        {
          id: 'approve',
          name: 'Approve Token Spending',
          type: STEP_TYPE.APPROVE,
          command: 'monad call --contract {{tokenAddress}} --function "approve(address,uint256)" --args \'["{{routerAddress}}", "{{amount}}"]\'',
          extractVariables: {
            approveTxHash: 'txHash'
          }
        },
        {
          id: 'swap',
          name: 'Execute Token Swap',
          type: STEP_TYPE.CALL_CONTRACT,
          command: 'monad call --contract {{routerAddress}} --function "swapExactTokensForTokens(uint256,uint256,address[],address,uint256)" --args \'["{{amount}}", "{{minOut}}", ["{{tokenAddress}}", "{{outputTokenAddress}}"], "{{recipient}}", "{{deadline}}"]\'',
          dependencies: ['approve'],
          extractVariables: {
            swapTxHash: 'txHash'
          }
        }
      ]
    }
  };
  
  return templates[templateName] || null;
}

/**
 * Get a workflow by ID
 * @param {string} id - Workflow ID
 * @returns {TransactionWorkflow|null} - Workflow or null if not found
 */
function getWorkflow(id) {
  return workflows[id] || null;
}

/**
 * Get all workflows
 * @returns {object} - Object with workflow IDs as keys and workflows as values
 */
function getAllWorkflows() {
  return workflows;
}

/**
 * Get workflow summaries
 * @returns {Array<object>} - Array of workflow summaries
 */
function getWorkflowSummaries() {
  return Object.values(workflows).map(workflow => workflow.getSummary());
}

module.exports = {
  TransactionWorkflow,
  createWorkflowFromTemplate,
  getWorkflow,
  getAllWorkflows,
  getWorkflowSummaries,
  workflowEvents,
  STEP_STATUS,
  WORKFLOW_STATUS,
  STEP_TYPE
};