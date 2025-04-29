# Monad Copilot Pro - Installation Guide

This guide will help you set up and use the Monad Copilot Pro tool, including both the CLI interface and VS Code extension.

## Prerequisites

- Python 3.10 or higher
- Node.js 16+ and npm (for VS Code extension)
- Access to Monad testnet RPC
- Claude API key

## CLI Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/monad-copilot-pro.git
cd monad-copilot-pro
```

### 2. Install Python Dependencies

```bash
pip install -r requirements.txt
```

Alternatively, you can install the package directly:

```bash
pip install .
```

### 3. Configure Environment Variables

Create a `.env` file in the project root with the following content:

```
CLAUDE_API_KEY=your_claude_api_key_here
MONAD_CLI_PATH=/path/to/monad-cli  # Adjust for your system
```

## Using the CLI

### Interactive Mode

```bash
python copilot.py
```

This will start the CLI in interactive mode, where you can either use a workflow template or enter a natural language prompt.

### Command Line Mode

```bash
python copilot.py "Create an NFT contract named MyArt and mint 5 to address 0x123"
```

This will process the prompt directly without entering interactive mode.

### Demo Script

To run the demo script that showcases a sample NFT deployment workflow:

```bash
python demo.py
```

## VS Code Extension Installation

### 1. Build the Extension

```bash
cd vscode-extension
npm install
npm run package
```

### 2. Install the Extension in VS Code

1. Open VS Code
2. Go to Extensions view (Ctrl+Shift+X)
3. Click on the "..." menu in the top-right of the Extensions view
4. Select "Install from VSIX..."
5. Navigate to the `vscode-extension/dist/monad-copilot-pro-0.1.0.vsix` file and select it

### 3. Using the Extension

1. Open a workspace containing your Monad project
2. Press Ctrl+Shift+P to open the command palette
3. Type "Monad Copilot" to see available commands:
   - "Monad Copilot: Run Command" - Execute a natural language command
   - "Monad Copilot: View Workflow Templates" - Browse available workflow templates

## Workflow Templates

Workflow templates are stored in the `workflows` directory as JSON files. Each template defines a series of steps to execute a complex operation.

To use a template via the CLI:

```bash
python copilot.py
# When prompted, select "y" to use a workflow template
# Enter the template name (e.g., "erc20-token")
```

## Troubleshooting

### Common Issues

1. **Claude API Key Issues**
   - Ensure your API key is correctly set in the `.env` file
   - Check that your API key has not expired or reached its rate limit

2. **Monad CLI Path**
   - Verify that the path to the Monad CLI is correct in your `.env` file
   - Ensure the Monad CLI is installed and working by running it directly

3. **VS Code Extension Not Working**
   - Make sure the Python CLI is properly installed and configured
   - Check the VS Code Developer Tools console (Help > Toggle Developer Tools) for errors

## Next Steps

- Explore the workflow templates in the `workflows` directory
- Create your own custom workflow templates
- Try the error recovery feature by intentionally using an invalid address format

## Support

If you encounter any issues, please open an issue on the GitHub repository.