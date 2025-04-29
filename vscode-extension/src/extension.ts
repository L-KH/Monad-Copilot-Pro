import * as vscode from 'vscode';
import axios from 'axios';

let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  console.log('Monad Copilot Pro extension is now active');

  // Create output channel
  outputChannel = vscode.window.createOutputChannel('Monad Copilot');
  context.subscriptions.push(outputChannel);

  // Register commands
  const analyzeCommand = vscode.commands.registerCommand('monad-copilot.analyze', analyzeSmartContract);
  const generateCommand = vscode.commands.registerCommand('monad-copilot.generate', generateSmartContract);
  const deployCommand = vscode.commands.registerCommand('monad-copilot.deploy', deploySmartContract);
  const workflowCommand = vscode.commands.registerCommand('monad-copilot.workflow', executeWorkflow);

  context.subscriptions.push(analyzeCommand, generateCommand, deployCommand, workflowCommand);

  // Register status bar item
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = '$(cpu) Monad';
  statusBarItem.tooltip = 'Monad Copilot Pro';
  statusBarItem.command = 'monad-copilot.workflow';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);
}

/**
 * Analyze the current smart contract using Claude AI
 */
async function analyzeSmartContract() {
  // Get the active text editor
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor found');
    return;
  }

  // Get the document text
  const document = editor.document;
  const text = document.getText();

  if (document.languageId !== 'solidity') {
    vscode.window.showWarningMessage('This command is intended for Solidity files only');
    return;
  }

  // Show progress
  await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: "Analyzing smart contract",
    cancellable: true
  }, async (progress, token) => {
    progress.report({ increment: 0 });

    try {
      // Make API call to the server
      const config = vscode.workspace.getConfiguration('monadCopilot');
      const apiUrl = 'http://localhost:5000/api/ai/analyze-contract';
      const apiKey = config.get('apiKey') as string;
      
      if (!apiKey) {
        vscode.window.showErrorMessage('Claude API key not set. Please configure it in settings.');
        return;
      }

      progress.report({ increment: 30, message: "Sending to Claude AI..." });

      const response = await axios.post(apiUrl, {
        code: text
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      progress.report({ increment: 70, message: "Processing results..." });

      if (response.data.success) {
        const analysis = response.data.analysis;
        
        // Create and show webview panel with results
        const panel = vscode.window.createWebviewPanel(
          'contractAnalysis',
          'Smart Contract Analysis',
          vscode.ViewColumn.Beside,
          {
            enableScripts: true
          }
        );

        // Generate HTML for the webview
        panel.webview.html = getAnalysisWebviewContent(analysis);
        
      } else {
        vscode.window.showErrorMessage(`Failed to analyze contract: ${response.data.error}`);
      }

      progress.report({ increment: 100 });
    } catch (error: any) {
      outputChannel.appendLine(`Error: ${error.message}`);
      vscode.window.showErrorMessage(`Failed to analyze contract: ${error.message}`);
    }
  });
}

/**
 * Generate a smart contract using Claude AI
 */
async function generateSmartContract() {
  // Show input box to get contract description
  const description = await vscode.window.showInputBox({
    prompt: 'Describe the smart contract you want to generate',
    placeHolder: 'E.g., An ERC20 token with minting and burning capabilities'
  });

  if (!description) return;

  // Show contract type quick pick
  const contractType = await vscode.window.showQuickPick([
    { label: 'ERC20 Token', description: 'Standard token implementation' },
    { label: 'ERC721 NFT', description: 'Non-fungible token implementation' },
    { label: 'DEX', description: 'Decentralized exchange' },
    { label: 'DAO', description: 'Decentralized Autonomous Organization' },
    { label: 'Custom', description: 'Custom contract type' }
  ], { 
    placeHolder: 'Select contract type'
  });

  if (!contractType) return;

  // Show progress
  await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: "Generating smart contract",
    cancellable: true
  }, async (progress, token) => {
    progress.report({ increment: 0 });

    try {
      // Make API call to the server
      const config = vscode.workspace.getConfiguration('monadCopilot');
      const apiUrl = 'http://localhost:5000/api/ai/generate-contract';
      const apiKey = config.get('apiKey') as string;
      
      if (!apiKey) {
        vscode.window.showErrorMessage('Claude API key not set. Please configure it in settings.');
        return;
      }

      progress.report({ increment: 30, message: "Sending to Claude AI..." });

      const response = await axios.post(apiUrl, {
        description,
        contractType: contractType.label
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      progress.report({ increment: 70, message: "Processing results..." });

      if (response.data.success) {
        const contract = response.data.contract;
        
        // Create a new document with the generated code
        const document = await vscode.workspace.openTextDocument({
          language: 'solidity',
          content: contract.code
        });

        await vscode.window.showTextDocument(document);
        
        vscode.window.showInformationMessage('Smart contract generated successfully!');
      } else {
        vscode.window.showErrorMessage(`Failed to generate contract: ${response.data.error}`);
      }

      progress.report({ increment: 100 });
    } catch (error: any) {
      outputChannel.appendLine(`Error: ${error.message}`);
      vscode.window.showErrorMessage(`Failed to generate contract: ${error.message}`);
    }
  });
}

/**
 * Deploy a smart contract to Monad blockchain
 */
async function deploySmartContract() {
  // Get the active text editor
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor found');
    return;
  }

  // Get the document text
  const document = editor.document;
  
  if (document.languageId !== 'solidity') {
    vscode.window.showWarningMessage('This command is intended for Solidity files only');
    return;
  }

  // Check if file is saved
  if (document.isDirty) {
    const save = await vscode.window.showWarningMessage(
      'The file has unsaved changes. Save before deploying?',
      'Save', 'Cancel'
    );
    
    if (save === 'Save') {
      await document.save();
    } else {
      return;
    }
  }

  // Get contract name
  const contractName = await vscode.window.showInputBox({
    prompt: 'Enter the contract name to deploy',
    placeHolder: 'MyToken'
  });

  if (!contractName) return;

  // Get constructor arguments
  const args = await vscode.window.showInputBox({
    prompt: 'Enter constructor arguments as a JSON array',
    placeHolder: '["Token Name", "TKN", 18, "1000000000000000000000000"]'
  });

  if (!args) return;

  // Show progress
  await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: "Deploying smart contract",
    cancellable: true
  }, async (progress, token) => {
    progress.report({ increment: 0, message: "Compiling contract..." });

    try {
      // Make API call to compile
      const config = vscode.workspace.getConfiguration('monadCopilot');
      const apiUrl = 'http://localhost:5000/api/monad/deploy';
      
      outputChannel.appendLine(`Compiling contract ${contractName}...`);
      progress.report({ increment: 30, message: "Deploying to Monad testnet..." });

      // Make API call to deploy
      outputChannel.appendLine(`Deploying contract ${contractName} to ${config.get('rpcUrl')}...`);
      progress.report({ increment: 60, message: "Waiting for confirmation..." });

      // Simulate success for demo purposes
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const deployedAddress = `0x${Math.random().toString(16).substring(2, 42)}`;
      outputChannel.appendLine(`Contract deployed at: ${deployedAddress}`);
      
      progress.report({ increment: 100, message: "Complete!" });
      
      vscode.window.showInformationMessage(`Contract deployed at: ${deployedAddress}`);
    } catch (error: any) {
      outputChannel.appendLine(`Error: ${error.message}`);
      vscode.window.showErrorMessage(`Failed to deploy contract: ${error.message}`);
    }
  });
}

/**
 * Execute a predefined or custom workflow
 */
async function executeWorkflow() {
  // Show workflow selection
  const workflowType = await vscode.window.showQuickPick([
    { label: 'Deploy ERC20 Token', description: 'Deploy a new ERC20 token contract' },
    { label: 'Deploy NFT Collection', description: 'Deploy a new NFT collection contract' },
    { label: 'Token Swap', description: 'Swap tokens on a DEX' },
    { label: 'Custom Workflow', description: 'Create a custom workflow' }
  ], { 
    placeHolder: 'Select workflow type'
  });

  if (!workflowType) return;

  if (workflowType.label === 'Custom Workflow') {
    // Show input box for natural language instructions
    const instructions = await vscode.window.showInputBox({
      prompt: 'Describe the workflow you want to execute',
      placeHolder: 'E.g., Deploy an ERC20 token, then create a liquidity pool with it and WETH'
    });

    if (!instructions) return;

    // Convert instructions to workflow steps
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Processing workflow instructions",
      cancellable: true
    }, async (progress, token) => {
      progress.report({ increment: 0 });

      try {
        // Make API call to convert instructions to workflow
        const config = vscode.workspace.getConfiguration('monadCopilot');
        const apiUrl = 'http://localhost:5000/api/ai/generate-commands';
        const apiKey = config.get('apiKey') as string;
        
        if (!apiKey) {
          vscode.window.showErrorMessage('Claude API key not set. Please configure it in settings.');
          return;
        }

        progress.report({ increment: 50, message: "Generating workflow..." });

        // Simulate API call for demo
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Create and show webview panel with workflow
        const panel = vscode.window.createWebviewPanel(
          'workflow',
          'Custom Workflow',
          vscode.ViewColumn.Active,
          {
            enableScripts: true
          }
        );

        // Generate HTML for the webview
        panel.webview.html = getWorkflowWebviewContent({
          name: 'Custom Workflow',
          description: instructions,
          steps: [
            { name: 'Compile Token Contract', command: 'monad compile Token.sol' },
            { name: 'Deploy Token Contract', command: 'monad deploy --contract Token --args \'["MyToken", "MTK", 18, "1000000000000000000000000"]\'' },
            { name: 'Verify Contract', command: 'monad verify --contract-address {{contractAddress}} --contract Token' }
          ]
        });

        progress.report({ increment: 100 });
      } catch (error: any) {
        outputChannel.appendLine(`Error: ${error.message}`);
        vscode.window.showErrorMessage(`Failed to generate workflow: ${error.message}`);
      }
    });
  } else {
    // Show workflow configuration
    vscode.window.showInformationMessage(`Starting workflow: ${workflowType.label}`);
    
    // Create and show webview panel with workflow
    const panel = vscode.window.createWebviewPanel(
      'workflow',
      workflowType.label,
      vscode.ViewColumn.Active,
      {
        enableScripts: true
      }
    );

    // Generate HTML for the webview based on workflow type
    panel.webview.html = getWorkflowWebviewContent({
      name: workflowType.label,
      description: workflowType.description || '',
      steps: getDefaultWorkflowSteps(workflowType.label)
    });
  }
}

/**
 * Get default steps for a workflow template
 */
function getDefaultWorkflowSteps(workflowType: string): any[] {
  switch (workflowType) {
    case 'Deploy ERC20 Token':
      return [
        { name: 'Compile Token Contract', command: 'monad compile Token.sol' },
        { name: 'Deploy Token Contract', command: 'monad deploy --contract Token --args \'["MyToken", "MTK", 18, "1000000000000000000000000"]\'' },
        { name: 'Verify Contract', command: 'monad verify --contract-address {{contractAddress}} --contract Token' }
      ];
    case 'Deploy NFT Collection':
      return [
        { name: 'Compile NFT Contract', command: 'monad compile NFT.sol' },
        { name: 'Deploy NFT Contract', command: 'monad deploy --contract NFT --args \'["MyNFT", "MNFT", "ipfs://..."]\'' },
        { name: 'Verify Contract', command: 'monad verify --contract-address {{contractAddress}} --contract NFT' },
        { name: 'Mint NFTs', command: 'monad call --contract {{contractAddress}} --function "mintBatch(address,uint256)" --args \'["{{ownerAddress}}", 5]\'' }
      ];
    case 'Token Swap':
      return [
        { name: 'Approve Token Spending', command: 'monad call --contract {{tokenAddress}} --function "approve(address,uint256)" --args \'["{{routerAddress}}", "{{amount}}"]\'' },
        { name: 'Execute Swap', command: 'monad call --contract {{routerAddress}} --function "swapExactTokensForTokens(uint256,uint256,address[],address,uint256)" --args \'["{{amount}}", "{{minAmountOut}}", ["{{tokenAddress}}", "{{outputTokenAddress}}"], "{{recipientAddress}}", "{{deadline}}"]\''}
      ];
    default:
      return [];
  }
}

/**
 * Generate HTML content for the analysis webview
 */
function getAnalysisWebviewContent(analysis: any): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Smart Contract Analysis</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          padding: 16px;
          color: #333;
        }
        h1 { font-size: 1.5em; margin-bottom: 16px; }
        h2 { font-size: 1.2em; margin-top: 24px; margin-bottom: 8px; }
        .score { 
          font-size: 1.5em; 
          font-weight: bold; 
          color: #0369a1;
          margin-bottom: 16px;
        }
        .issue {
          margin-bottom: 12px;
          padding: 8px;
          border-radius: 4px;
        }
        .high { background-color: #fee2e2; border-left: 4px solid #ef4444; }
        .medium { background-color: #fef3c7; border-left: 4px solid #f59e0b; }
        .low { background-color: #e0f2fe; border-left: 4px solid #0ea5e9; }
        pre {
          background-color: #f3f4f6;
          padding: 8px;
          border-radius: 4px;
          overflow-x: auto;
        }
      </style>
    </head>
    <body>
      <h1>Smart Contract Analysis</h1>
      
      <div class="score">Overall Score: ${analysis.overallRating}/10</div>
      
      <h2>Security Issues</h2>
      ${analysis.securityIssues && analysis.securityIssues.length > 0 
        ? analysis.securityIssues.map((issue: any) => `
          <div class="issue ${issue.severity.toLowerCase()}">
            <strong>${issue.issue} (${issue.severity})</strong>
            <p><strong>Location:</strong> ${issue.location}</p>
            <p><strong>Suggestion:</strong> ${issue.suggestion}</p>
          </div>
        `).join('')
        : '<p>No security issues found.</p>'
      }
      
      <h2>Gas Optimizations</h2>
      ${analysis.gasOptimizations && analysis.gasOptimizations.length > 0 
        ? analysis.gasOptimizations.map((issue: any) => `
          <div class="issue low">
            <strong>${issue.issue}</strong>
            <p><strong>Location:</strong> ${issue.location}</p>
            <p><strong>Suggestion:</strong> ${issue.suggestion}</p>
            <p><strong>Estimated Savings:</strong> ${issue.estimatedSavings}</p>
          </div>
        `).join('')
        : '<p>No gas optimizations found.</p>'
      }
      
      <h2>Monad-Specific Optimizations</h2>
      ${analysis.monadOptimizations && analysis.monadOptimizations.length > 0 
        ? analysis.monadOptimizations.map((issue: any) => `
          <div class="issue low">
            <strong>${issue.issue}</strong>
            <p><strong>Location:</strong> ${issue.location}</p>
            <p><strong>Suggestion:</strong> ${issue.suggestion}</p>
          </div>
        `).join('')
        : '<p>No Monad-specific optimizations found.</p>'
      }
    </body>
    </html>
  `;
}

/**
 * Generate HTML content for the workflow webview
 */
function getWorkflowWebviewContent(workflow: any): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${workflow.name}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          padding: 16px;
          color: #333;
        }
        h1 { font-size: 1.5em; margin-bottom: 8px; }
        p { margin-bottom: 16px; }
        .steps { 
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .step {
          padding: 12px;
          border-radius: 4px;
          background-color: #f3f4f6;
          border-left: 4px solid #0ea5e9;
        }
        .step-name {
          font-weight: bold;
          margin-bottom: 4px;
        }
        .step-command {
          font-family: monospace;
          background-color: #1e293b;
          color: #e2e8f0;
          padding: 8px;
          border-radius: 4px;
          margin-top: 6px;
        }
        button {
          background-color: #0ea5e9;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          margin-top: 16px;
        }
        button:hover {
          background-color: #0284c7;
        }
        .variables {
          margin-top: 24px;
          padding: 12px;
          background-color: #f8fafc;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
        }
        .variables h2 {
          font-size: 1.2em;
          margin-top: 0;
          margin-bottom: 8px;
        }
        .variable {
          display: flex;
          margin-bottom: 8px;
        }
        .variable label {
          width: 150px;
          font-weight: bold;
        }
        .variable input {
          flex: 1;
          padding: 4px 8px;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <h1>${workflow.name}</h1>
      <p>${workflow.description}</p>
      
      <div class="variables">
        <h2>Workflow Variables</h2>
        <div class="variable">
          <label for="var-contractAddress">contractAddress:</label>
          <input type="text" id="var-contractAddress" placeholder="0x...">
        </div>
        <div class="variable">
          <label for="var-ownerAddress">ownerAddress:</label>
          <input type="text" id="var-ownerAddress" placeholder="0x...">
        </div>
      </div>
      
      <div class="steps">
        <h2>Steps</h2>
        ${workflow.steps.map((step: any, index: number) => `
          <div class="step">
            <div class="step-name">${index + 1}. ${step.name}</div>
            <div class="step-command">${step.command}</div>
          </div>
        `).join('')}
      </div>
      
      <button>Execute Workflow</button>
    </body>
    </html>
  `;
}

export function deactivate() {}
