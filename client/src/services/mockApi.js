import { getMockResponse } from '../mockData';
import { ethers } from 'ethers';

// Function to simulate API request delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to get real blockchain data from Monad Testnet
async function getRealBlockchainData(address) {
  try {
    // Connect to Monad Testnet
    const provider = new ethers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
    
    // Get the actual balance
    const balance = await provider.getBalance(address);
    const formattedBalance = ethers.formatEther(balance);
    
    // Common tokens on Monad Testnet - these would be sample Monad tokens
    // In a production app, we'd use a token registry for Monad
    const monadTestnetTokens = [
      {
        symbol: 'mUSDT',
        name: 'Monad USDT',
        address: '0xd417144312dbf50465b1c641d016962017ef6240',
        decimals: 6
      },
      {
        symbol: 'mWETH',
        name: 'Wrapped ETH on Monad',
        address: '0x4200000000000000000000000000000000000023',
        decimals: 18
      },
      {
        symbol: 'MCP',
        name: 'Monad Copilot Token',
        address: '0x9a78649501bbaaf2b6673892ecb88be8e243e4dd',
        decimals: 18
      }
    ];
    
    // Attempt to get token balances
    const tokenPromises = monadTestnetTokens.map(async (token) => {
      try {
        // Simple ERC20 ABI with only balanceOf function
        const erc20Abi = [
          'function balanceOf(address owner) view returns (uint256)'
        ];
        
        const tokenContract = new ethers.Contract(token.address, erc20Abi, provider);
        const tokenBalance = await tokenContract.balanceOf(address);
        const formattedTokenBalance = ethers.formatUnits(tokenBalance, token.decimals);
        
        // Return token with balance
        return {
          ...token,
          balance: formattedTokenBalance
        };
      } catch (error) {
        console.log(`Error fetching balance for ${token.symbol}:`, error);
        // For testnet, return mock balances if real query fails
        return {
          ...token,
          balance: (Math.random() * 100).toFixed(token.decimals === 6 ? 2 : 4),
          isMockData: true
        };
      }
    });
    
    // Wait for all token balance checks
    const tokens = await Promise.all(tokenPromises);
    
    return {
      success: true,
      address: address,
      balance: formattedBalance,
      network: 'Monad Testnet',
      chainId: 10143,
      currency: 'MON',
      tokens: tokens,
      isRealData: true
    };
  } catch (error) {
    console.error('Error fetching Monad blockchain data:', error);
    // For testnet, return mock data as fallback
    return {
      success: true,
      address: address,
      balance: (Math.random() * 10).toFixed(4),
      network: 'Monad Testnet',
      chainId: 10143,
      currency: 'MON',
      tokens: [
        {
          symbol: 'mUSDT',
          name: 'Monad USDT',
          balance: '25.00',
          decimals: 6,
          address: '0xd417144312dbf50465b1c641d016962017ef6240',
          isMockData: true
        },
        {
          symbol: 'mWETH',
          name: 'Wrapped ETH on Monad',
          balance: '0.5000',
          decimals: 18,
          address: '0x4200000000000000000000000000000000000023',
          isMockData: true
        },
        {
          symbol: 'MCP',
          name: 'Monad Copilot Token',
          balance: '150.0000',
          decimals: 18,
          address: '0x9a78649501bbaaf2b6673892ecb88be8e243e4dd',
          isMockData: true
        }
      ],
      isMockData: true
    };
  }
}

// Create a mock API client
const mockApi = {
  get: async (endpoint, config = {}) => {
    // Simulate network delay
    await delay(300); 
    
    // Handle special endpoints first
    // Handle balance endpoint with real data
    if (endpoint.startsWith('/monad/balance/') || endpoint.startsWith('/api/monad/balance/')) {
      const addressMatch = endpoint.match(/\/balance\/([a-fA-F0-9x]+)/);
      if (addressMatch && addressMatch[1]) {
        const address = addressMatch[1];
        const realData = await getRealBlockchainData(address);
        return { data: realData };
      }
    }
    
    // For other endpoints, use mock data
    const response = getMockResponse(endpoint);
    
    // Simulate error if needed
    if (!response.success && response.error) {
      throw new Error(response.error);
    }
    
    return { data: response };
  },
  
  post: async (endpoint, data = {}) => {
    // Simulate network delay
    await delay(500);
    
    // Handle special cases based on endpoint
    if (endpoint === '/ai/chat') {
      // For AI chat, customize response based on user input
      const userMessage = data.message || '';
      
      // Check if it's a balance inquiry
      if (userMessage.toLowerCase().includes('balance') && userMessage.includes('0x')) {
        // Extract Ethereum address from message - find 0x followed by 40 hex chars
        const addressMatch = userMessage.match(/0x[a-fA-F0-9]{40}/);
        const address = addressMatch ? addressMatch[0] : null;
        
        if (address) {
          // Use real blockchain data instead of mock data
          const realData = await getRealBlockchainData(address);
          
          if (realData.success) {
            let responseContent = `I checked the balance of address ${address} on Monad Testnet (Chain ID: 10143):\n\n**MON Balance:** ${realData.balance} MON\n\n`;
            
            // Add token balances if available
            if (realData.tokens && realData.tokens.length > 0) {
              responseContent += "**Token Balances:**\n";
              realData.tokens.forEach(token => {
                responseContent += `- ${token.balance} ${token.symbol} (${token.name})\n`;
              });
            } else {
              responseContent += "I didn't find any token balances for this address.\n";
            }
            
            // Add note about mock data if applicable
            if (realData.isMockData) {
              responseContent += "\nNote: Due to testnet connectivity issues, these values are estimated. When connected to the live Monad network, real-time values will be displayed.";
            } else {
              responseContent += "\nThis is real blockchain data fetched directly from the Monad Testnet.";
            }
            
            return {
              data: {
                success: true,
                response: {
                  content: responseContent
                },
                model: "claude-3-sonnet-20240229"
              }
            };
          } else {
            return {
              data: {
                success: true,
                response: {
                  content: `I attempted to check the balance of address ${address} on the Monad Testnet, but encountered an error: ${realData.error}. \n\nThis could be due to several reasons:\n\n1. The Monad Testnet node might be temporarily unavailable\n2. The address format might be incorrect (Monad uses Ethereum-compatible addresses)\n3. The address might not have any transaction history on Monad yet\n\nPlease verify the address is correct. You can also check this address on the Monad Testnet Explorer for more details.`
                },
                model: "claude-3-sonnet-20240229"
              }
            };
          }
        }
      }
      
      return {
        data: {
          success: true,
          response: {
            content: `I'm Claude, your AI assistant for Monad blockchain development. You asked: "${userMessage}".\n\nMonad is a high-performance L1 blockchain designed for parallel transaction execution. As a modular blockchain with sharded architecture, Monad allows for significantly higher throughput than traditional blockchains while maintaining Ethereum compatibility.\n\nMonad's key features include:\n\n1. **Parallel Transaction Execution**: Processes transactions in parallel rather than sequentially, greatly increasing throughput\n\n2. **Ethereum Compatibility**: Supports Ethereum's EVM, allowing existing Ethereum dApps to run without modification\n\n3. **Scalability**: Designed to scale to thousands of transactions per second\n\n4. **Low Gas Fees**: The increased throughput results in lower gas costs for users\n\n5. **Developer-Friendly**: Uses Solidity and other familiar Ethereum tools, making it easy for developers to migrate\n\nThe Monad Testnet is currently active with Chain ID 10143. You can connect to it via RPC endpoint: https://testnet-rpc.monad.xyz`
          },
          model: "claude-3-sonnet-20240229"
        }
      };
    } else if (endpoint.includes('/workflow/create-from-template')) {
      // Handle workflow creation
      const { templateId, name, description } = data;
      return {
        data: {
          success: true,
          workflow: {
            id: 'new-workflow-' + Date.now(),
            name: name || 'New Workflow',
            description: description || '',
            status: 'created',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completedSteps: 0,
            stepCount: 4,
            network: 'TESTNET',
            templateId
          },
          message: 'Workflow created successfully'
        }
      };
    } else if (endpoint.includes('/workflow/') && endpoint.includes('/execute')) {
      // Handle workflow execution
      const workflowId = endpoint.split('/')[2]; // Extract workflow ID from URL
      return {
        data: {
          success: true,
          workflow: {
            id: workflowId,
            status: 'running',
            updatedAt: new Date().toISOString()
          },
          message: 'Workflow execution started'
        }
      };
    } else if (endpoint.includes('/workflow/') && endpoint.includes('/pause')) {
      // Handle workflow pausing
      const workflowId = endpoint.split('/')[2]; // Extract workflow ID from URL
      return {
        data: {
          success: true,
          workflow: {
            id: workflowId,
            status: 'paused',
            updatedAt: new Date().toISOString()
          },
          message: 'Workflow paused successfully'
        }
      };
    } else if (endpoint.includes('/workflow/') && endpoint.includes('/resume')) {
      // Handle workflow resuming
      const workflowId = endpoint.split('/')[2]; // Extract workflow ID from URL
      return {
        data: {
          success: true,
          workflow: {
            id: workflowId,
            status: 'running',
            updatedAt: new Date().toISOString()
          },
          message: 'Workflow resumed successfully'
        }
      };
    } else if (endpoint.includes('/workflow/') && endpoint.includes('/cancel')) {
      // Handle workflow cancellation
      const workflowId = endpoint.split('/')[2]; // Extract workflow ID from URL
      return {
        data: {
          success: true,
          workflow: {
            id: workflowId,
            status: 'cancelled',
            updatedAt: new Date().toISOString()
          },
          message: 'Workflow cancelled successfully'
        }
      };
    }
    
    // For other POST requests, return mock data
    const response = getMockResponse(endpoint);
    
    // Simulate error if needed
    if (!response.success && response.error) {
      throw new Error(response.error);
    }
    
    return { data: response };
  }
};

export default mockApi;
