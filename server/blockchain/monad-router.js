// server/blockchain/monad-router.js
const express = require('express');
const router = express.Router();
const {
  NETWORKS,
  createProvider,
  createWallet,
  getBalance,
  getTransaction,
  sendTransaction,
  callContractFunction,
  executeContractFunction,
  estimateGas,
  getGasPrice
} = require('./monad');

// Create provider instances for different networks
const providers = {
  TESTNET: createProvider('TESTNET'),
  DEVNET: createProvider('DEVNET')
};

/**
 * Get network info
 * GET /api/monad/networks
 */
router.get('/networks', (req, res) => {
  try {
    res.json({
      success: true,
      networks: Object.entries(NETWORKS).map(([key, network]) => ({
        id: key,
        ...network
      }))
    });
  } catch (error) {
    console.error('Network info error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get address balance
 * GET /api/monad/balance/:address
 */
router.get('/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { network = 'TESTNET' } = req.query;
    
    const provider = providers[network];
    if (!provider) {
      return res.status(400).json({
        success: false,
        error: `Unsupported network: ${network}`
      });
    }
    
    const balance = await getBalance(address, provider);
    
    res.json({
      success: true,
      address,
      balance,
      network
    });
  } catch (error) {
    console.error('Balance check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get transaction details
 * GET /api/monad/tx/:hash
 */
router.get('/tx/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const { network = 'TESTNET' } = req.query;
    
    const provider = providers[network];
    if (!provider) {
      return res.status(400).json({
        success: false,
        error: `Unsupported network: ${network}`
      });
    }
    
    const transaction = await getTransaction(hash, provider);
    
    res.json({
      success: true,
      transaction,
      network
    });
  } catch (error) {
    console.error('Transaction details error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Send transaction
 * POST /api/monad/send-transaction
 */
router.post('/send-transaction', async (req, res) => {
  try {
    const { 
      privateKey, 
      to, 
      value, 
      data = '0x', 
      gasLimit,
      network = 'TESTNET' 
    } = req.body;
    
    if (!privateKey || !to) {
      return res.status(400).json({
        success: false,
        error: 'Private key and recipient address are required'
      });
    }
    
    const provider = providers[network];
    if (!provider) {
      return res.status(400).json({
        success: false,
        error: `Unsupported network: ${network}`
      });
    }
    
    // Create wallet from private key
    const wallet = createWallet(privateKey, provider);
    
    // Prepare transaction parameters
    const txParams = {
      to,
      value: value ? ethers.parseEther(value) : 0,
      data
    };
    
    // Add gas limit if provided
    if (gasLimit) {
      txParams.gasLimit = gasLimit;
    }
    
    // Send transaction
    const result = await sendTransaction(txParams, wallet);
    
    res.json({
      success: true,
      transaction: result,
      network
    });
  } catch (error) {
    console.error('Send transaction error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Call contract function (read-only)
 * POST /api/monad/call-contract
 */
router.post('/call-contract', async (req, res) => {
  try {
    const { 
      address, 
      abi, 
      functionName, 
      args = [], 
      network = 'TESTNET' 
    } = req.body;
    
    if (!address || !abi || !functionName) {
      return res.status(400).json({
        success: false,
        error: 'Contract address, ABI, and function name are required'
      });
    }
    
    const provider = providers[network];
    if (!provider) {
      return res.status(400).json({
        success: false,
        error: `Unsupported network: ${network}`
      });
    }
    
    // Call contract function
    const result = await callContractFunction(address, abi, functionName, args, provider);
    
    res.json({
      success: true,
      result,
      network
    });
  } catch (error) {
    console.error('Contract call error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Execute contract function (write operation)
 * POST /api/monad/execute-contract
 */
router.post('/execute-contract', async (req, res) => {
  try {
    const { 
      privateKey,
      address, 
      abi, 
      functionName, 
      args = [], 
      options = {},
      network = 'TESTNET' 
    } = req.body;
    
    if (!privateKey || !address || !abi || !functionName) {
      return res.status(400).json({
        success: false,
        error: 'Private key, contract address, ABI, and function name are required'
      });
    }
    
    const provider = providers[network];
    if (!provider) {
      return res.status(400).json({
        success: false,
        error: `Unsupported network: ${network}`
      });
    }
    
    // Create wallet from private key
    const wallet = createWallet(privateKey, provider);
    
    // Execute contract function
    const result = await executeContractFunction(address, abi, functionName, args, options, wallet);
    
    res.json({
      success: true,
      transaction: result,
      network
    });
  } catch (error) {
    console.error('Contract execution error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Estimate gas
 * POST /api/monad/estimate-gas
 */
router.post('/estimate-gas', async (req, res) => {
  try {
    const { 
      from, 
      to, 
      value = '0', 
      data = '0x',
      network = 'TESTNET' 
    } = req.body;
    
    if (!to) {
      return res.status(400).json({
        success: false,
        error: 'Recipient address is required'
      });
    }
    
    const provider = providers[network];
    if (!provider) {
      return res.status(400).json({
        success: false,
        error: `Unsupported network: ${network}`
      });
    }
    
    // Prepare transaction parameters
    const txParams = {
      to,
      value: ethers.parseEther(value),
      data
    };
    
    // Add from address if provided
    if (from) {
      txParams.from = from;
    }
    
    // Estimate gas
    const gasEstimate = await estimateGas(txParams, provider);
    
    res.json({
      success: true,
      gasEstimate,
      network
    });
  } catch (error) {
    console.error('Gas estimation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get gas price
 * GET /api/monad/gas-price
 */
router.get('/gas-price', async (req, res) => {
  try {
    const { network = 'TESTNET' } = req.query;
    
    const provider = providers[network];
    if (!provider) {
      return res.status(400).json({
        success: false,
        error: `Unsupported network: ${network}`
      });
    }
    
    // Get gas price
    const gasPrices = await getGasPrice(provider);
    
    res.json({
      success: true,
      gasPrices,
      network
    });
  } catch (error) {
    console.error('Gas price error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = { monadRouter: router };