// server/blockchain/monad.js
const { ethers } = require('ethers');
require('dotenv').config();

/**
 * Monad network configuration
 */
const NETWORKS = {
  TESTNET: {
    name: 'Monad Testnet',
    chainId: 1029, // Example chain ID
    rpcUrl: process.env.MONAD_TESTNET_RPC_URL || 'https://rpc-testnet.monad.xyz',
    explorerUrl: process.env.MONAD_TESTNET_EXPLORER_URL || 'https://explorer-testnet.monad.xyz',
    nativeCurrency: {
      name: 'Monad',
      symbol: 'MON',
      decimals: 18
    }
  },
  DEVNET: {
    name: 'Monad Devnet',
    chainId: 1028, // Example chain ID
    rpcUrl: process.env.MONAD_DEVNET_RPC_URL || 'https://rpc-devnet.monad.xyz',
    explorerUrl: process.env.MONAD_DEVNET_EXPLORER_URL || 'https://explorer-devnet.monad.xyz',
    nativeCurrency: {
      name: 'Monad',
      symbol: 'MON',
      decimals: 18
    }
  },
  // Add mainnet when available
};

// Default to testnet if not specified
const DEFAULT_NETWORK = NETWORKS.TESTNET;

/**
 * Create an ethers provider for the specified Monad network
 * @param {string} network - Network name (TESTNET, DEVNET)
 * @returns {ethers.JsonRpcProvider} - Ethers provider
 */
function createProvider(network = 'TESTNET') {
  const networkConfig = NETWORKS[network] || DEFAULT_NETWORK;
  
  try {
    return new ethers.JsonRpcProvider(networkConfig.rpcUrl);
  } catch (error) {
    console.error(`Failed to create provider for ${network}:`, error);
    throw new Error(`Failed to connect to Monad ${network}: ${error.message}`);
  }
}

/**
 * Create a wallet instance from a private key
 * @param {string} privateKey - Private key (without 0x prefix)
 * @param {ethers.Provider} provider - Ethers provider
 * @returns {ethers.Wallet} - Ethers wallet
 */
function createWallet(privateKey, provider) {
  try {
    // Add 0x prefix if not present
    if (!privateKey.startsWith('0x')) {
      privateKey = `0x${privateKey}`;
    }
    
    return new ethers.Wallet(privateKey, provider);
  } catch (error) {
    console.error('Failed to create wallet:', error);
    throw new Error(`Failed to create wallet: ${error.message}`);
  }
}

/**
 * Get balance of an address
 * @param {string} address - Ethereum address
 * @param {ethers.Provider} provider - Ethers provider
 * @returns {Promise<string>} - Balance in ETH
 */
async function getBalance(address, provider) {
  try {
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Failed to get balance:', error);
    throw new Error(`Failed to get balance for ${address}: ${error.message}`);
  }
}

/**
 * Deploy a compiled contract
 * @param {object} contractJson - Compiled contract JSON
 * @param {array} constructorArgs - Constructor arguments
 * @param {ethers.Wallet} signer - Signer wallet
 * @returns {Promise<ethers.Contract>} - Deployed contract
 */
async function deployContract(contractJson, constructorArgs, signer) {
  try {
    // Create contract factory
    const factory = new ethers.ContractFactory(
      contractJson.abi,
      contractJson.bytecode,
      signer
    );
    
    // Deploy contract
    const contract = await factory.deploy(...constructorArgs);
    
    // Wait for deployment transaction to be mined
    await contract.deployTransaction.wait();
    
    return {
      contract,
      address: contract.address,
      deploymentHash: contract.deployTransaction.hash
    };
  } catch (error) {
    console.error('Contract deployment error:', error);
    throw new Error(`Failed to deploy contract: ${error.message}`);
  }
}

/**
 * Get transaction details
 * @param {string} txHash - Transaction hash
 * @param {ethers.Provider} provider - Ethers provider
 * @returns {Promise<object>} - Transaction details
 */
async function getTransaction(txHash, provider) {
  try {
    // Get transaction
    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      throw new Error(`Transaction ${txHash} not found`);
    }
    
    // Get transaction receipt
    const receipt = await provider.getTransactionReceipt(txHash);
    
    return {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: ethers.formatEther(tx.value),
      gasPrice: ethers.formatUnits(tx.gasPrice, 'gwei'),
      gasLimit: tx.gasLimit.toString(),
      nonce: tx.nonce,
      data: tx.data,
      chainId: tx.chainId,
      confirmations: tx.confirmations,
      status: receipt ? (receipt.status ? 'Success' : 'Failed') : 'Pending',
      blockNumber: receipt ? receipt.blockNumber : null,
      blockHash: receipt ? receipt.blockHash : null,
      gasUsed: receipt ? receipt.gasUsed.toString() : null,
      logs: receipt ? receipt.logs : []
    };
  } catch (error) {
    console.error('Get transaction error:', error);
    throw new Error(`Failed to get transaction ${txHash}: ${error.message}`);
  }
}

/**
 * Send a transaction
 * @param {object} txParams - Transaction parameters
 * @param {ethers.Wallet} signer - Signer wallet
 * @returns {Promise<object>} - Transaction response
 */
async function sendTransaction(txParams, signer) {
  try {
    // Send transaction
    const tx = await signer.sendTransaction(txParams);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    return {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: ethers.formatEther(tx.value || 0),
      gasPrice: ethers.formatUnits(tx.gasPrice, 'gwei'),
      gasLimit: tx.gasLimit.toString(),
      status: receipt.status ? 'Success' : 'Failed',
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('Send transaction error:', error);
    throw new Error(`Failed to send transaction: ${error.message}`);
  }
}

/**
 * Call a contract function (read-only)
 * @param {string} contractAddress - Contract address
 * @param {array} abi - Contract ABI
 * @param {string} functionName - Function name
 * @param {array} args - Function arguments
 * @param {ethers.Provider} provider - Ethers provider
 * @returns {Promise<any>} - Function result
 */
async function callContractFunction(contractAddress, abi, functionName, args, provider) {
  try {
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, abi, provider);
    
    // Call function
    const result = await contract[functionName](...args);
    
    return {
      success: true,
      result
    };
  } catch (error) {
    console.error('Contract call error:', error);
    throw new Error(`Failed to call ${functionName}: ${error.message}`);
  }
}

/**
 * Execute a contract function (write operation)
 * @param {string} contractAddress - Contract address
 * @param {array} abi - Contract ABI
 * @param {string} functionName - Function name
 * @param {array} args - Function arguments
 * @param {object} options - Transaction options
 * @param {ethers.Wallet} signer - Signer wallet
 * @returns {Promise<object>} - Transaction response
 */
async function executeContractFunction(contractAddress, abi, functionName, args, options, signer) {
  try {
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, abi, signer);
    
    // Prepare transaction options
    const txOptions = {
      ...options,
      gasLimit: options.gasLimit || await contract.estimateGas[functionName](...args)
    };
    
    // Execute function
    const tx = await contract[functionName](...args, txOptions);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    return {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      status: receipt.status ? 'Success' : 'Failed',
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      events: receipt.events ? receipt.events.map(e => ({
        name: e.event,
        args: e.args
      })) : []
    };
  } catch (error) {
    console.error('Contract execution error:', error);
    throw new Error(`Failed to execute ${functionName}: ${error.message}`);
  }
}

/**
 * Estimate gas for a transaction
 * @param {object} txParams - Transaction parameters
 * @param {ethers.Provider} provider - Ethers provider
 * @returns {Promise<string>} - Estimated gas
 */
async function estimateGas(txParams, provider) {
  try {
    const gasEstimate = await provider.estimateGas(txParams);
    return gasEstimate.toString();
  } catch (error) {
    console.error('Gas estimation error:', error);
    throw new Error(`Failed to estimate gas: ${error.message}`);
  }
}

/**
 * Get gas price
 * @param {ethers.Provider} provider - Ethers provider
 * @returns {Promise<object>} - Gas price in different speeds
 */
async function getGasPrice(provider) {
  try {
    const gasPrice = await provider.getGasPrice();
    
    // Convert to gwei and calculate different speed options
    const standard = Number(ethers.formatUnits(gasPrice, 'gwei'));
    
    return {
      slow: (standard * 0.8).toFixed(2),
      standard: standard.toFixed(2),
      fast: (standard * 1.2).toFixed(2),
      rapid: (standard * 1.5).toFixed(2)
    };
  } catch (error) {
    console.error('Gas price error:', error);
    throw new Error(`Failed to get gas price: ${error.message}`);
  }
}

module.exports = {
  NETWORKS,
  DEFAULT_NETWORK,
  createProvider,
  createWallet,
  getBalance,
  deployContract,
  getTransaction,
  sendTransaction,
  callContractFunction,
  executeContractFunction,
  estimateGas,
  getGasPrice
};