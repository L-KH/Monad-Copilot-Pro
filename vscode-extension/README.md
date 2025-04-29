# Monad Copilot Pro VS Code Extension

![Monad Copilot Pro](https://via.placeholder.com/800x200?text=Monad+Copilot+Pro)

## Overview

Monad Copilot Pro is a VS Code extension that brings AI-powered smart contract development and blockchain transaction capabilities directly into your editor. This extension integrates with Claude AI to provide intelligent assistance for Monad blockchain development.

## Features

- **🧠 Smart Contract Analysis**: Analyze your Solidity contracts for security vulnerabilities and gas optimizations
- **🔧 Code Generation**: Generate smart contracts from natural language descriptions
- **🚀 One-Click Deployment**: Deploy contracts to Monad testnet with just a few clicks
- **⚙️ Workflow Orchestration**: Execute multi-step blockchain workflows directly from VS Code
- **🔄 Auto-Fix**: Automatically fix common contract issues and failed transactions

## Requirements

- VS Code 1.80.0 or higher
- Node.js 16+ and npm
- Claude API key
- Access to Monad testnet

## Extension Settings

This extension contributes the following settings:

* `monadCopilot.apiKey`: Claude API key for AI features
* `monadCopilot.rpcUrl`: Monad RPC URL (defaults to testnet)
* `monadCopilot.autoAnalyze`: Automatically analyze smart contracts on save
* `monadCopilot.model`: Select which Claude model to use for operations

## How to Use

### Analyzing Smart Contracts

1. Open a Solidity (.sol) file
2. Right-click in the editor or press `Ctrl+Shift+P` and select "Monad: Analyze Smart Contract"
3. View the results in the analysis panel

### Generating Smart Contracts

1. Press `Ctrl+Shift+P` and select "Monad: Generate Smart Contract"
2. Enter a description of the contract you want to create
3. Choose the contract type
4. The generated contract will open in a new editor tab

### Deploying Smart Contracts

1. Open a Solidity (.sol) file
2. Right-click in the editor or press `Ctrl+Shift+P` and select "Monad: Deploy Smart Contract"
3. Enter the contract name and constructor arguments
4. Follow the deployment progress in the output panel

### Executing Workflows

1. Press `Ctrl+Shift+P` and select "Monad: Execute Workflow"
2. Choose a workflow template or create a custom workflow
3. Configure the workflow parameters
4. Follow the workflow execution in the webview panel

## Examples

### Contract Analysis

Analyze a smart contract for security vulnerabilities, gas optimizations, and Monad-specific improvements.

![Contract Analysis](https://via.placeholder.com/800x400?text=Contract+Analysis+Screenshot)

### Workflow Execution

Execute complex multi-step workflows like token deployment or liquidity pool creation.

![Workflow Execution](https://via.placeholder.com/800x400?text=Workflow+Execution+Screenshot)

## Troubleshooting

- **API Key Issues**: Ensure your Claude API key is correctly set in the extension settings
- **Connection Problems**: Verify that you can connect to the Monad testnet RPC URL
- **Missing Dependencies**: Make sure you have installed all required dependencies

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This extension is licensed under the [MIT License](LICENSE).