// server/ai/claude-router.js
const express = require('express');
const router = express.Router();
const {
  callClaude,
  generateSmartContract,
  analyzeSmartContract,
  generateMonadCommands,
  debugTransactionError,
  generateDeFiProject,
  CLAUDE_MODELS
} = require('./claude');

/**
 * Handle general Claude AI chat
 * POST /api/ai/chat
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, systemPrompt, model = CLAUDE_MODELS.HAIKU, maxTokens = 1000 } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }
    
    const response = await callClaude(message, systemPrompt, model, maxTokens);
    
    res.json({
      success: true,
      response
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Generate a smart contract from description
 * POST /api/ai/generate-contract
 */
router.post('/generate-contract', async (req, res) => {
  try {
    const { description, contractType = 'Custom' } = req.body;
    
    if (!description) {
      return res.status(400).json({
        success: false,
        error: 'Contract description is required'
      });
    }
    
    const result = await generateSmartContract(description, contractType);
    
    res.json({
      success: true,
      contract: result
    });
  } catch (error) {
    console.error('Contract generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Analyze a smart contract for security and optimization
 * POST /api/ai/analyze-contract
 */
router.post('/analyze-contract', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Contract code is required'
      });
    }
    
    const analysis = await analyzeSmartContract(code);
    
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Contract analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Generate Monad CLI commands from natural language
 * POST /api/ai/generate-commands
 */
router.post('/generate-commands', async (req, res) => {
  try {
    const { instructions } = req.body;
    
    if (!instructions) {
      return res.status(400).json({
        success: false,
        error: 'Instructions are required'
      });
    }
    
    const result = await generateMonadCommands(instructions);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Command generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Debug a failed transaction
 * POST /api/ai/debug-transaction
 */
router.post('/debug-transaction', async (req, res) => {
  try {
    const { command, error } = req.body;
    
    if (!command || !error) {
      return res.status(400).json({
        success: false,
        error: 'Command and error message are required'
      });
    }
    
    const result = await debugTransactionError(command, error);
    
    res.json({
      success: true,
      debug: result
    });
  } catch (error) {
    console.error('Transaction debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Generate a complete DeFi project
 * POST /api/ai/generate-defi-project
 */
router.post('/generate-defi-project', async (req, res) => {
  try {
    const { description, projectType } = req.body;
    
    if (!description || !projectType) {
      return res.status(400).json({
        success: false,
        error: 'Project description and type are required'
      });
    }
    
    const project = await generateDeFiProject(description, projectType);
    
    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('DeFi project generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = { claudeRouter: router };