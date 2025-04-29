// server/ai/claude.js
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || 'your-api-key',
});

// System prompts for different use cases
const SYSTEM_PROMPTS = {
  // Base prompt for Monad blockchain expertise
  BASE: `You are Claude, an AI assistant specialized in Monad blockchain development. 
You help developers build, deploy, and manage smart contracts and transactions on the Monad network.

Monad Key Information:
- High-performance EVM-compatible Layer 1 blockchain focused on scalability
- Uses parallel execution and asynchronous execution for high throughput
- Compatible with Solidity smart contracts
- Testnet available for development with faucets for test MON tokens
- Provides tools for monitoring and analyzing transactions

When analyzing code or transactions:
1. Identify potential security vulnerabilities
2. Suggest optimizations for gas efficiency
3. Recommend best practices for Monad development
4. Explain complex concepts in simple terms

Always format code blocks with proper syntax highlighting.`,

  // Prompt for code analysis and optimization
  CODE_ANALYSIS: `You are a Solidity expert specialized in optimizing smart contracts for the Monad blockchain.
Focus on:
1. Security vulnerabilities specific to Monad
2. Gas optimization opportunities
3. Parallel execution optimizations for Monad's architecture
4. Code quality and maintainability issues
5. Best practices for Monad development

Be specific about which lines of code have issues and provide actual code snippets for fixes.`,

  // Prompt for natural language to CLI command conversion
  CLI_GENERATOR: `You are an expert in Monad blockchain CLI commands.
Convert natural language instructions into precise Monad CLI commands.
Focus on accuracy and providing the exact syntax required.
Return ONLY the commands, not explanations.

Available Monad CLI commands include:
- monad compile <file>
- monad deploy --network <network> --contract <name> [options]
- monad verify --contract-address <address> --contract <name>
- monad call --contract <address> --function <signature> --args <json-array>
- monad send --to <address> --amount <value>
- monad tx --hash <hash>
- monad balance --address <address>
- monad gas --estimate

Return an array of commands in JSON format.`,

  // Prompt for error debugging
  ERROR_DEBUGGING: `You are a blockchain transaction debugging expert.
Analyze the following error from a Monad blockchain transaction and suggest solutions.
Focus on the most likely causes and provide specific fixes.
Be concise and practical in your suggestions.`
};

/**
 * Available Claude models
 */
const CLAUDE_MODELS = {
  HAIKU: 'claude-3-haiku-20240307',
  SONNET: 'claude-3-sonnet-20240229',
  OPUS: 'claude-3-opus-20240229'
};

/**
 * Call Claude with a specific prompt and system message
 * @param {string} userMessage - The user's message
 * @param {string} systemPrompt - System prompt to use
 * @param {string} model - Claude model to use
 * @param {number} maxTokens - Maximum tokens in response
 * @returns {Promise<string>} - Claude's response
 */
async function callClaude(userMessage, systemPrompt = SYSTEM_PROMPTS.BASE, model = CLAUDE_MODELS.HAIKU, maxTokens = 1000) {
  try {
    const response = await anthropic.messages.create({
      model: model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
    });

    return {
      content: response.content[0].text,
      model: model,
      usage: response.usage,
      id: response.id
    };
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw new Error(`Failed to get Claude response: ${error.message}`);
  }
}

/**
 * Generate a smart contract from a natural language description
 * @param {string} description - Description of the desired contract
 * @param {string} contractType - Type of contract (ERC20, ERC721, DEX, etc.)
 * @returns {Promise<Object>} - Generated contract code and metadata
 */
async function generateSmartContract(description, contractType = 'Custom') {
  const prompt = `
Generate a complete, production-ready Solidity smart contract for the Monad blockchain.

CONTRACT TYPE: ${contractType}
DESCRIPTION: ${description}

Requirements:
1. The contract should be optimized for Monad's parallel execution model
2. Include comprehensive NatSpec comments
3. Follow security best practices
4. Use modern Solidity (0.8.x)
5. Include proper error handling
6. Implement events for important state changes

Return ONLY the Solidity code without additional explanation.
`;

  try {
    // Use Sonnet for balanced performance and quality
    const response = await callClaude(
      prompt,
      SYSTEM_PROMPTS.BASE,
      CLAUDE_MODELS.SONNET,
      4000
    );
    
    // Extract code block if present
    const codeMatch = response.content.match(/```solidity\n([\s\S]*?)\n```/) || 
                     response.content.match(/```\n([\s\S]*?)\n```/);
    
    let code = '';
    if (codeMatch && codeMatch[1]) {
      code = codeMatch[1];
    } else {
      code = response.content;
    }
    
    return {
      code: code,
      contractType: contractType,
      description: description,
      model: response.model
    };
  } catch (error) {
    console.error('Contract generation error:', error);
    throw new Error(`Failed to generate smart contract: ${error.message}`);
  }
}

/**
 * Analyze a smart contract for security and optimization
 * @param {string} contractCode - The Solidity code to analyze
 * @returns {Promise<Object>} - Analysis results
 */
async function analyzeSmartContract(contractCode) {
  const prompt = `
Analyze this Solidity smart contract for security vulnerabilities, gas optimizations,
and compatibility with Monad's parallel execution model:

\`\`\`solidity
${contractCode}
\`\`\`

Provide analysis in the following JSON format:
{
  "securityIssues": [
    {
      "severity": "HIGH/MEDIUM/LOW",
      "issue": "Description of the issue",
      "location": "Line number or function name",
      "suggestion": "Suggested fix"
    }
  ],
  "gasOptimizations": [
    {
      "issue": "Description of the optimization",
      "location": "Line number or function name",
      "suggestion": "Suggested implementation",
      "estimatedSavings": "Approximate gas savings"
    }
  ],
  "monadOptimizations": [
    {
      "issue": "Description of how to better utilize Monad's parallel execution",
      "location": "Line number or function name",
      "suggestion": "Suggested implementation"
    }
  ],
  "codeQuality": [
    {
      "issue": "Description of code quality issue",
      "location": "Line number or function name",
      "suggestion": "Suggested improvement"
    }
  ],
  "overallRating": "Score out of 10"
}

Focus on being thorough and providing actionable fixes.
`;

  try {
    // Use Opus for deep code analysis
    const response = await callClaude(
      prompt,
      SYSTEM_PROMPTS.CODE_ANALYSIS,
      CLAUDE_MODELS.OPUS,
      4000
    );
    
    // Extract JSON from response
    let jsonResult;
    try {
      // Look for JSON in code blocks or directly in the response
      const jsonMatch = response.content.match(/```json\n([\s\S]*?)\n```/) || 
                       response.content.match(/```\n([\s\S]*?)\n```/) || 
                       response.content.match(/{[\s\S]*}/);
                       
      if (jsonMatch) {
        const jsonText = jsonMatch[1] || jsonMatch[0];
        jsonResult = JSON.parse(jsonText);
      } else {
        // Fallback: treat the entire response as a raw analysis
        jsonResult = {
          rawAnalysis: response.content,
          overallRating: "N/A"
        };
      }
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      jsonResult = {
        error: 'Failed to parse analysis results',
        rawResponse: response.content
      };
    }
    
    return {
      ...jsonResult,
      model: response.model,
      analysisId: response.id
    };
  } catch (error) {
    console.error('Contract analysis error:', error);
    throw new Error(`Failed to analyze smart contract: ${error.message}`);
  }
}

/**
 * Convert natural language to Monad CLI commands
 * @param {string} instructions - Natural language instructions
 * @returns {Promise<Array<string>>} - Array of CLI commands
 */
async function generateMonadCommands(instructions) {
  const prompt = `
Convert this natural language instruction into a sequence of Monad CLI commands:

INSTRUCTION: "${instructions}"

Return ONLY a JSON array of command strings, without explanation.
Example: ["monad compile Token.sol", "monad deploy --network testnet --contract Token"]
`;

  try {
    // Use Haiku for fast response
    const response = await callClaude(
      prompt,
      SYSTEM_PROMPTS.CLI_GENERATOR,
      CLAUDE_MODELS.HAIKU,
      1000
    );
    
    // Extract JSON array
    let commands = [];
    try {
      // Look for JSON array in the response
      const jsonMatch = response.content.match(/```json\n([\s\S]*?)\n```/) || 
                        response.content.match(/```\n([\s\S]*?)\n```/) || 
                        response.content.match(/\[([\s\S]*?)\]/);
                        
      if (jsonMatch) {
        const jsonText = jsonMatch[1] || jsonMatch[0];
        commands = JSON.parse(jsonText);
      } else {
        // Fallback: extract commands line by line
        commands = response.content
          .split('\n')
          .filter(line => line.trim().startsWith('monad '))
          .map(line => line.trim());
      }
    } catch (parseError) {
      console.error('Error parsing commands:', parseError);
      // If parsing fails, return the raw response
      commands = [response.content];
    }
    
    return {
      commands: commands,
      model: response.model,
      originalInstruction: instructions
    };
  } catch (error) {
    console.error('Command generation error:', error);
    throw new Error(`Failed to generate commands: ${error.message}`);
  }
}

/**
 * Debug and fix a failed transaction
 * @param {string} command - The command that failed
 * @param {string} error - The error message
 * @returns {Promise<Object>} - Debug results and suggested fix
 */
async function debugTransactionError(command, error) {
  const prompt = `
Debug this failed Monad blockchain transaction:

COMMAND: ${command}
ERROR: ${error}

Provide:
1. The most likely cause of the error
2. A corrected command that would fix the issue
3. An explanation of what went wrong

Return your response in JSON format:
{
  "cause": "Brief explanation of the error cause",
  "fixedCommand": "The corrected command",
  "explanation": "Detailed explanation of the issue and solution"
}
`;

  try {
    // Use Haiku for fast response
    const response = await callClaude(
      prompt,
      SYSTEM_PROMPTS.ERROR_DEBUGGING,
      CLAUDE_MODELS.HAIKU,
      1500
    );
    
    // Extract JSON from response
    let debugResult;
    try {
      // Look for JSON in the response
      const jsonMatch = response.content.match(/```json\n([\s\S]*?)\n```/) || 
                       response.content.match(/```\n([\s\S]*?)\n```/) || 
                       response.content.match(/{[\s\S]*}/);
                       
      if (jsonMatch) {
        const jsonText = jsonMatch[1] || jsonMatch[0];
        debugResult = JSON.parse(jsonText);
      } else {
        // Fallback: extract the fixed command directly
        const commandMatch = response.content.match(/`(monad .*?)`/) || 
                            response.content.match(/```\n(monad .*?)\n```/) ||
                            response.content.match(/^(monad .*?)$/m);
        
        debugResult = {
          cause: "Error parsing structured response",
          fixedCommand: commandMatch ? commandMatch[1] : "Unable to extract command",
          explanation: response.content,
          rawResponse: response.content
        };
      }
    } catch (parseError) {
      console.error('Error parsing debug response:', parseError);
      debugResult = {
        cause: "Error parsing response",
        fixedCommand: command, // Return original as fallback
        explanation: response.content,
        error: parseError.message
      };
    }
    
    return {
      ...debugResult,
      originalCommand: command,
      originalError: error,
      model: response.model
    };
  } catch (error) {
    console.error('Debug error:', error);
    throw new Error(`Failed to debug transaction: ${error.message}`);
  }
}

/**
 * Generate a complete DeFi project with multiple contracts
 * @param {string} description - Project description
 * @param {string} projectType - Type of DeFi project
 * @returns {Promise<Object>} - Generated project code and structure
 */
async function generateDeFiProject(description, projectType) {
  const prompt = `
Design a complete DeFi project for the Monad blockchain based on this description:

PROJECT TYPE: ${projectType}
DESCRIPTION: ${description}

Provide:
1. Project architecture overview
2. Smart contracts for all components
3. Deployment sequence
4. Integration instructions

Return your response in the following format:
1. First, provide a brief architecture overview
2. Then, for each smart contract, include the complete Solidity code in a code block
3. Finally, provide deployment instructions as a sequence of Monad CLI commands

Make sure all contracts are optimized for Monad's parallel execution capabilities.
`;

  try {
    // Use Opus for complex project generation
    const response = await callClaude(
      prompt,
      SYSTEM_PROMPTS.BASE,
      CLAUDE_MODELS.OPUS,
      8000
    );
    
    // Extract architecture, contracts, and deployment instructions
    const architectureMatch = response.content.match(/## Architecture([\s\S]*?)##/i) || 
                             response.content.match(/Architecture Overview:([\s\S]*?)##/i) ||
                             response.content.match(/Architecture:([\s\S]*?)##/i);
                             
    const architecture = architectureMatch ? architectureMatch[1].trim() : '';
    
    // Extract all Solidity code blocks
    const contractMatches = [...response.content.matchAll(/```solidity\n([\s\S]*?)\n```/g)];
    const contracts = contractMatches.map((match, index) => {
      // Try to extract contract name from the code or use a placeholder
      const nameMatch = match[1].match(/contract\s+(\w+)/);
      const contractName = nameMatch ? nameMatch[1] : `Contract${index + 1}`;
      
      return {
        name: contractName,
        code: match[1]
      };
    });
    
    // Extract deployment instructions
    const deploymentMatch = response.content.match(/## Deployment([\s\S]*?)$/i) || 
                           response.content.match(/Deployment Instructions:([\s\S]*?)$/i) ||
                           response.content.match(/Deployment:([\s\S]*?)$/i);
                           
    const deploymentInstructions = deploymentMatch ? deploymentMatch[1].trim() : '';
    
    // Extract command lines from deployment instructions
    const commands = deploymentInstructions
      .split('\n')
      .filter(line => line.trim().startsWith('monad '))
      .map(line => line.trim());
    
    return {
      projectType,
      description,
      architecture,
      contracts,
      deploymentInstructions,
      commands,
      model: response.model
    };
  } catch (error) {
    console.error('Project generation error:', error);
    throw new Error(`Failed to generate DeFi project: ${error.message}`);
  }
}

module.exports = {
  callClaude,
  generateSmartContract,
  analyzeSmartContract,
  generateMonadCommands,
  debugTransactionError,
  generateDeFiProject,
  SYSTEM_PROMPTS,
  CLAUDE_MODELS
};