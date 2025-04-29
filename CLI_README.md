# Monad Copilot Pro CLI

A powerful CLI tool that translates natural language into complex, multi-step Monad blockchain workflows with built-in error recovery and real-time feedback.

## Features

- **AI-Powered Command Generation**: Convert natural language to Monad CLI commands using Claude AI
- **Error Recovery**: Automatically detect and fix transaction errors
- **Real-time Transaction Monitoring**: Track transaction status via WebSocket
- **Workflow Templates**: Use pre-built templates for common operations
- **VS Code Integration**: Execute commands directly from your editor

## Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/monad-copilot-pro.git
cd monad-copilot-pro

# Install Python dependencies
pip install -r requirements.txt

# Setup environment variables
echo "CLAUDE_API_KEY=your_api_key" > .env
echo "MONAD_CLI_PATH=/path/to/monad-cli" >> .env
```

## Usage

### CLI Tool

```bash
# Run the CLI tool
python copilot.py

# Run the demo script
python demo.py
```

### VS Code Extension

1. Open the `vscode-extension` folder in VS Code
2. Run `npm install` to install dependencies
3. Press F5 to start debugging the extension
4. In the Extension Development Host window, press Ctrl+Shift+P and run "Monad Copilot: Run Command"

## Workflow Templates

The CLI supports workflow templates stored in the `workflows` directory. These templates define multi-step operations that can be executed with a single command.

Example template usage:

```bash
$ python copilot.py
Monad Copilot Pro CLI
====================

Use a workflow template? (y/n): y
Enter template name (e.g., erc20-token): erc20-token
Loaded template: ERC20 Token Deployment
```

## Natural Language Examples

You can use natural language to describe complex blockchain operations:

```
Monad Copilot > Create an NFT contract named MyArt and mint 5 to address 0x123
```

The CLI will convert this to the appropriate Monad commands and execute them in sequence.

## Error Recovery

If a command fails, the CLI will automatically use Claude AI to suggest fixes and retry the operation:

```
Error: Invalid address format
Suggested fix: Use a valid Ethereum address format with 0x prefix and 40 hexadecimal characters
```

## Development

To contribute to the project:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT