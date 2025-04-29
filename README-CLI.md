# Monad Copilot Pro

## 🚀 Overview

Monad Copilot Pro is an AI-powered smart contract deployment and transaction automation suite for the Monad blockchain. It translates natural language into complex, multi-step Monad workflows with built-in error recovery and real-time feedback.

## ✨ Key Features

- **AI-Powered Command Generation**: Convert natural language to Monad CLI commands using Claude AI
- **Transaction Orchestration**: Execute multi-step transactions with dependency handling
- **Error Recovery**: Automatically detect and fix transaction errors with Claude AI
- **Real-time Monitoring**: Track transaction status via WebSocket
- **Workflow Templates**: Pre-built workflows for common operations (token deployment, NFT minting, swaps)
- **VS Code Integration**: Execute commands directly from your editor

## 🔧 Technology Stack

- **Backend**: Python 3.10+, asyncio, aiohttp
- **AI**: Claude API integration (Haiku model for speed)
- **Blockchain**: Monad SDK, monad-cli
- **IDE Plugin**: TypeScript (VS Code Extension Kit)

## 📋 Requirements

- Python 3.10 or higher
- Node.js 16+ and npm (for VS Code extension)
- Access to Monad testnet RPC
- Claude API key

## 🛠️ Installation

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

For detailed installation instructions, see [INSTALL.md](INSTALL.md).

## 📝 Usage

### CLI Tool

```bash
# Run the CLI tool in interactive mode
python copilot.py

# Run with a direct prompt
python copilot.py "Create an NFT contract named MyArt and mint 5 to address 0x123"

# Run the demo script
python demo.py
```

### VS Code Extension

1. Build and install the extension (see [INSTALL.md](INSTALL.md))
2. Press Ctrl+Shift+P and run "Monad Copilot: Run Command"
3. Enter your natural language prompt

## 📚 Workflow Templates

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

## 🔍 Natural Language Examples

You can use natural language to describe complex blockchain operations:

```
Monad Copilot > Create an NFT contract named MyArt and mint 5 to address 0x123
```

The CLI will convert this to the appropriate Monad commands and execute them in sequence.

## 🛠️ Error Recovery

If a command fails, the CLI will automatically use Claude AI to suggest fixes and retry the operation:

```
Error: Invalid address format
Suggested fix: Use a valid Ethereum address format with 0x prefix and 40 hexadecimal characters
```

## 🗺️ Roadmap

- **Phase 1**: Core AI integration and transaction orchestration
- **Phase 2**: Enhanced contract security analysis
- **Phase 3**: Visual workflow builder
- **Phase 4**: Cross-chain operations support

## 🤝 Contributing

To contribute to the project:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📄 License

MIT