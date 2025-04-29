/**
 * Constants used throughout the application
 */

// Claude API Models
export const CLAUDE_MODELS = {
  HAIKU: 'claude-3-haiku-20240307',
  SONNET: 'claude-3-sonnet-20240229',
  OPUS: 'claude-3-opus-20240229'
};

// Workflow step status
export const STEP_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCESSFUL: 'successful',
  FAILED: 'failed',
  SKIPPED: 'skipped',
  RETRYING: 'retrying'
};

// Workflow status
export const WORKFLOW_STATUS = {
  CREATED: 'created',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  PAUSED: 'paused',
  CANCELLED: 'cancelled'
};

// Step types
export const STEP_TYPE = {
  DEPLOY_CONTRACT: 'deploy_contract',
  CALL_CONTRACT: 'call_contract',
  TRANSFER: 'transfer',
  APPROVE: 'approve',
  VERIFY_CONTRACT: 'verify_contract',
  COMPILE: 'compile',
  CUSTOM: 'custom'
};

// Monad networks
export const MONAD_NETWORKS = {
  TESTNET: {
    id: 'TESTNET',
    name: 'Monad Testnet',
    chainId: 1029,
    rpcUrl: 'https://rpc-testnet.monad.xyz',
    explorerUrl: 'https://explorer-testnet.monad.xyz',
    nativeCurrency: {
      name: 'Monad',
      symbol: 'MON',
      decimals: 18
    }
  },
  DEVNET: {
    id: 'DEVNET',
    name: 'Monad Devnet',
    chainId: 1028,
    rpcUrl: 'https://rpc-devnet.monad.xyz',
    explorerUrl: 'https://explorer-devnet.monad.xyz',
    nativeCurrency: {
      name: 'Monad',
      symbol: 'MON',
      decimals: 18
    }
  }
};

// Contract types
export const CONTRACT_TYPES = {
  ERC20: 'ERC20 Token',
  ERC721: 'NFT Collection',
  ERC1155: 'Multi-Token Standard',
  DEX: 'Decentralized Exchange',
  STAKING: 'Staking Contract',
  DAO: 'Governance DAO',
  MULTISIG: 'Multi-Signature Wallet',
  CUSTOM: 'Custom Contract'
};

// Example prompts for AI assistant
export const EXAMPLE_PROMPTS = [
  {
    id: 'generate-contract',
    title: 'Generate a DEX contract',
    prompt: 'Write me a smart contract for a decentralized exchange with liquidity pools, swapping functionality, and a 0.3% fee.'
  },
  {
    id: 'analyze-contract',
    title: 'Analyze contract security',
    prompt: 'Can you analyze this smart contract for security vulnerabilities and gas optimization?...'
  },
  {
    id: 'convert-instructions',
    title: 'Generate CLI commands',
    prompt: 'Convert this instruction to Monad CLI commands: Deploy an ERC20 token named "MonadTest" with symbol "MTT", and verify the contract on the explorer.'
  },
  {
    id: 'explain-concept',
    title: 'Explain parallel execution',
    prompt: 'Explain how Monad\'s parallel execution works and how it improves blockchain performance.'
  }
];

export default {
  CLAUDE_MODELS,
  STEP_STATUS,
  WORKFLOW_STATUS,
  STEP_TYPE,
  MONAD_NETWORKS,
  CONTRACT_TYPES,
  EXAMPLE_PROMPTS
};
