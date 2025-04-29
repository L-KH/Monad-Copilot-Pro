// Mock data for the application
// This eliminates the need for a separate server and lets us run everything in one process

// Network data
export const networks = {
  success: true,
  networks: [
    {
      id: 'TESTNET',
      name: 'Monad Testnet',
      chainId: '10143',
      rpcUrl: 'https://testnet-rpc.monad.xyz',
      blockExplorerUrl: 'https://explorer.monad.xyz/testnet',
      currency: 'MON',
      status: 'active',
      blockHeight: 3405976,
      blockTime: 2.1,
      gasLimit: 30000000,
      validators: 25
    }
  ]
};

// Gas price data
export const gasPrice = {
  success: true,
  gasPrices: {
    slow: 18,
    standard: 23,
    fast: 29,
    rapid: 35
  },
  lastUpdated: new Date().toISOString(),
  networkLoad: 'moderate',
  blockUtilization: '62%'
};

// Address balance response
export const getAddressBalance = (address) => {
  // Generate random balance for demo purposes
  const randomBalance = (Math.random() * 10).toFixed(4);
  
  return {
    success: true,
    address: address,
    balance: randomBalance,
    network: 'TESTNET',
    tokens: [
      {
        symbol: 'USDT',
        name: 'Tether USD',
        balance: '25.0',
        decimals: 6,
        address: '0x55d398326f99059fF775485246999027B3197955'
      },
      {
        symbol: 'WETH',
        name: 'Wrapped Ether',
        balance: '0.5',
        decimals: 18,
        address: '0xc778417E063141139Fce010982780140Aa0cD5Ab'
      },
      {
        symbol: 'MCP',
        name: 'Monad Copilot Token',
        balance: '150',
        decimals: 18,
        address: '0x9A78649501bBAAf2B6673892eCB88bE8e243E4dd'
      }
    ]
  };
};

// Workflow templates
export const workflowTemplates = {
  success: true,
  templates: [
    {
      id: 'template-1',
      name: 'NFT Collection Deployment',
      description: 'Deploy a new NFT collection with minting and metadata',
      category: 'NFT',
      steps: [
        {
          id: 'step-1',
          name: 'Generate Contract',
          type: 'code_generation'
        },
        {
          id: 'step-2',
          name: 'Compile Contract',
          type: 'compilation'
        },
        {
          id: 'step-3',
          name: 'Deploy Contract',
          type: 'deployment'
        },
        {
          id: 'step-4',
          name: 'Verify Contract',
          type: 'verification'
        }
      ],
      variables: {
        tokenName: 'MonadNFT',
        tokenSymbol: 'MNFT',
        baseURI: 'https://api.example.com/metadata/'
      }
    },
    {
      id: 'template-2',
      name: 'Token Sale',
      description: 'Create and launch a token sale with vesting',
      category: 'Finance',
      steps: [
        {
          id: 'step-1',
          name: 'Deploy Token Contract',
          type: 'deployment'
        },
        {
          id: 'step-2',
          name: 'Deploy Vesting Contract',
          type: 'deployment'
        },
        {
          id: 'step-3',
          name: 'Configure Sale Parameters',
          type: 'configuration'
        },
        {
          id: 'step-4',
          name: 'Transfer Tokens to Vesting',
          type: 'transaction'
        },
        {
          id: 'step-5',
          name: 'Start Sale',
          type: 'transaction'
        }
      ],
      variables: {
        tokenAmount: '1000000',
        salePrice: '0.001',
        vestingPeriod: '180'
      }
    },
    {
      id: 'template-3',
      name: 'DAO Setup',
      description: 'Create a DAO with governance token and voting',
      category: 'Governance',
      steps: [
        {
          id: 'step-1',
          name: 'Deploy Governance Token',
          type: 'deployment'
        },
        {
          id: 'step-2',
          name: 'Deploy Governor Contract',
          type: 'deployment'
        },
        {
          id: 'step-3',
          name: 'Deploy Timelock',
          type: 'deployment'
        },
        {
          id: 'step-4',
          name: 'Configure DAO Parameters',
          type: 'configuration'
        }
      ],
      variables: {
        tokenName: 'MonadDAO',
        tokenSymbol: 'MDAO',
        votingPeriod: '50400',
        votingDelay: '1',
        quorumPercentage: '4'
      }
    }
  ]
};

// Workflow data
export const workflows = {
  success: true,
  workflows: [
    {
      id: 'workflow-1',
      name: 'MonadPunks NFT Deployment',
      description: 'Deploy an NFT collection for Monad early adopters',
      status: 'completed',
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
      completedSteps: 4,
      stepCount: 4,
      network: 'TESTNET',
      contractAddress: '0x9E8DA5A9F879DB3F889A1B6Cf4d7C163B7C5D258'
    },
    {
      id: 'workflow-2',
      name: 'MonadSwap DEX Launch',
      description: 'Deploy and configure MonadSwap DEX with initial liquidity',
      status: 'running',
      createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      completedSteps: 2,
      stepCount: 5,
      network: 'TESTNET',
      contractAddress: '0x7B44E956F3A1ED1AC4305FEA73651E91AC0A43B7'
    },
    {
      id: 'workflow-3',
      name: 'Monad Treasury Multisig',
      description: 'Create and configure a multisig wallet for Monad treasury management',
      status: 'failed',
      createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      completedSteps: 1,
      stepCount: 3,
      network: 'TESTNET',
      errorMessage: 'Contract deployment failed: insufficient gas'
    },
    {
      id: 'workflow-4',
      name: 'MonadLend Integration',
      description: 'Connect to Monad DeFi lending protocols and configure pools',
      status: 'completed',
      createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
      completedSteps: 3,
      stepCount: 3,
      network: 'TESTNET',
      contractAddress: '0xD58c16d1E1a733C881F22C4436F77962683A6F8d'
    },
    {
      id: 'workflow-5',
      name: 'Monad DAO Governance',
      description: 'Set up a DAO with voting mechanisms for protocol governance',
      status: 'paused',
      createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
      completedSteps: 2,
      stepCount: 4,
      network: 'TESTNET',
      pauseReason: 'Waiting for community feedback on governance parameters'
    }
  ]
};

// Workflow details
export const workflowDetails = {
  'workflow-1': {
    success: true,
    workflow: {
      id: 'workflow-1',
      name: 'MonadPunks NFT Deployment',
      description: 'Deploy an NFT collection for Monad early adopters with minting functionality and metadata support',
      status: 'completed',
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
      steps: [
        {
          id: 'step-1-1',
          name: 'Generate NFT Contract',
          status: 'completed',
          startedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
          completedAt: new Date(Date.now() - 3600000 * 24 * 2 + 300000).toISOString(),
          gasUsed: '1,245,673',
          output: 'Contract generated with ERC-721 standard'
        },
        {
          id: 'step-1-2',
          name: 'Compile Contract',
          status: 'completed',
          startedAt: new Date(Date.now() - 3600000 * 24 * 2 + 300000).toISOString(),
          completedAt: new Date(Date.now() - 3600000 * 24 * 2 + 600000).toISOString(),
          gasUsed: '0',
          output: 'Compilation successful - no errors or warnings'
        },
        {
          id: 'step-1-3',
          name: 'Deploy to Monad Testnet',
          status: 'completed',
          startedAt: new Date(Date.now() - 3600000 * 24 * 2 + 600000).toISOString(),
          completedAt: new Date(Date.now() - 3600000 * 24 * 2 + 900000).toISOString(),
          gasUsed: '3,561,245',
          output: 'Contract deployed to 0x9E8DA5A9F879DB3F889A1B6Cf4d7C163B7C5D258',
          txHash: '0x6a7b7d8e9f0c1d2e3b4a5c6d7e8f9a0b1c2d3e4f56789012345abcdef123456'
        },
        {
          id: 'step-1-4',
          name: 'Verify Contract on Explorer',
          status: 'completed',
          startedAt: new Date(Date.now() - 3600000 * 24 * 2 + 900000).toISOString(),
          completedAt: new Date(Date.now() - 3600000 * 24 * 2 + 1200000).toISOString(),
          gasUsed: '0',
          output: 'Contract verified successfully on Monad Testnet Explorer'
        }
      ],
      variables: {
        contractAddress: '0x9E8DA5A9F879DB3F889A1B6Cf4d7C163B7C5D258',
        tokenName: 'MonadPunks',
        tokenSymbol: 'MPUNKS',
        baseURI: 'https://api.monadpunks.io/metadata/',
        maxSupply: '10000',
        mintPrice: '0.05 MON',
        royaltyFee: '5%'
      },
      network: 'TESTNET',
      chainId: 10143,
      txCount: 4,
      gasUsed: '4,806,918'
    }
  },
  'workflow-2': {
    success: true,
    workflow: {
      id: 'workflow-2',
      name: 'MonadSwap DEX Launch',
      description: 'Deploy and configure MonadSwap DEX with initial liquidity pools',
      status: 'running',
      createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      steps: [
        {
          id: 'step-2-1',
          name: 'Deploy Factory Contract',
          status: 'completed',
          startedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
          completedAt: new Date(Date.now() - 3600000 * 24 * 1 + 450000).toISOString(),
          gasUsed: '4,112,567',
          output: 'Factory contract deployed to 0x7B44E956F3A1ED1AC4305FEA73651E91AC0A43B7',
          txHash: '0x8d9c7b6a5e4f3d2c1b0a9e8f7d6c5b4a3f2e1d0c9b8a7654321fedcba9876543'
        },
        {
          id: 'step-2-2',
          name: 'Deploy Router Contract',
          status: 'completed',
          startedAt: new Date(Date.now() - 3600000 * 24 * 1 + 450000).toISOString(),
          completedAt: new Date(Date.now() - 3600000 * 24 * 1 + 900000).toISOString(),
          gasUsed: '3,845,912',
          output: 'Router contract deployed to 0xF45598704C0Df8FA11c711CB522B4B5CE45aF9A0',
          txHash: '0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f67890abcdef123456'
        },
        {
          id: 'step-2-3',
          name: 'Create MON/USDT Pair',
          status: 'running',
          startedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
          completedAt: null,
          gasUsed: '1,254,623',
          output: 'Creating liquidity pair...',
          txHash: '0xpending...'
        },
        {
          id: 'step-2-4',
          name: 'Add Initial Liquidity',
          status: 'pending',
          startedAt: null,
          completedAt: null,
          gasUsed: '0',
          output: '',
          txHash: ''
        },
        {
          id: 'step-2-5',
          name: 'Enable Trading',
          status: 'pending',
          startedAt: null,
          completedAt: null,
          gasUsed: '0',
          output: '',
          txHash: ''
        }
      ],
      variables: {
        factoryAddress: '0x7B44E956F3A1ED1AC4305FEA73651E91AC0A43B7',
        routerAddress: '0xF45598704C0Df8FA11c711CB522B4B5CE45aF9A0',
        fee: '0.3%',
        initialLiquidity: '10000 MON, 5000 USDT',
        owner: '0x4B7A7BE51860f31a2D83e8537F3c5A1b9266A657'
      },
      network: 'TESTNET',
      chainId: 10143,
      txCount: 2,
      gasUsed: '9,213,102'
    }
  }
};

// Contract templates
export const contractTemplates = [
  {
    id: 'erc721',
    name: 'ERC-721 NFT',
    description: 'Standard NFT contract with minting and metadata',
    category: 'NFT'
  },
  {
    id: 'erc20',
    name: 'ERC-20 Token',
    description: 'Standard fungible token with optional features',
    category: 'Token'
  },
  {
    id: 'multisig',
    name: 'Multisig Wallet',
    description: 'Multi-signature wallet for secure asset management',
    category: 'Wallet'
  },
  {
    id: 'vesting',
    name: 'Token Vesting',
    description: 'Token vesting contract with configurable schedules',
    category: 'Finance'
  }
];

// Contract data
export const contracts = {
  success: true,
  contracts: [
    {
      id: 'contract-1',
      name: 'MonadPunks NFT',
      description: 'Collectible NFT series on Monad',
      address: '0x1234567890123456789012345678901234567890',
      type: 'ERC-721',
      createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
      deployedAt: new Date(Date.now() - 3600000 * 24 * 9).toISOString(),
      network: 'TESTNET',
      verified: true
    },
    {
      id: 'contract-2',
      name: 'MonadCoin',
      description: 'Governance token for Monad DAO',
      address: '0x2345678901234567890123456789012345678901',
      type: 'ERC-20',
      createdAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
      deployedAt: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
      network: 'TESTNET',
      verified: true
    }
  ]
};

// Health check response
export const healthCheck = {
  success: true,
  status: 'healthy',
  version: '1.0.0'
};

// Mock AI response
export const aiChatResponse = {
  success: true,
  response: {
    content: "I'm Claude, your AI assistant for Monad blockchain development. How can I help you with Monad today? Monad is a high-performance L1 blockchain designed for parallel transaction execution, with Ethereum compatibility and significantly higher throughput."
  },
  model: "claude-3-sonnet-20240229"
};

// Mock response functions
export const getMockResponse = (endpoint, params = {}) => {
  // Handle URLs with query parameters
  // Strip any query parameters for matching
  const baseEndpoint = endpoint.split('?')[0];
  
  switch (baseEndpoint) {
    case '/monad/networks':
      return networks;
    case '/monad/gas-price':
      return gasPrice;
    case '/workflow':
      return workflows;
    case '/workflow/templates':
      return workflowTemplates;
    case '/health':
      return healthCheck;
    case '/ai/chat':
      return aiChatResponse;
    default:
      // Handle balance endpoint
      if (baseEndpoint.startsWith('/monad/balance/')) {
        const address = baseEndpoint.split('/monad/balance/')[1];
        return getAddressBalance(address);
      }
      // Handle workflow details endpoint
      if (baseEndpoint.startsWith('/workflow/') && baseEndpoint.split('/').length === 3) {
        const id = baseEndpoint.split('/')[2];
        return workflowDetails[id] || { success: false, error: 'Workflow not found' };
      }
      return { success: false, error: 'Endpoint not found' };
  }
};
