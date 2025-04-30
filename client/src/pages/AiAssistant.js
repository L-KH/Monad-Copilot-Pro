import React, { useState, useRef, useEffect } from 'react';
import { 
  PaperAirplaneIcon, 
  ArrowPathIcon,
  XCircleIcon, 
  LightBulbIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  ArrowPathRoundedSquareIcon
} from '@heroicons/react/24/outline';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/cjs/prism';
import { vs2015 } from '../utils/highlighterStyles';
import { toast } from 'react-toastify';

// API
import { chatWithClaude, generateSmartContract, analyzeSmartContract, generateMonadCommands } from '../services/api';
import { CLAUDE_MODELS } from '../services/constants';

const AiAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showExamples, setShowExamples] = useState(true);
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Send a message to Claude
  const sendMessage = async (messageText = input, customSystemPrompt = null) => {
    if (!messageText.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      // Call Claude API
      const response = await chatWithClaude(messageText, customSystemPrompt, CLAUDE_MODELS.SONNET);
      
      // Add assistant message to chat
      const assistantMessage = {
        role: 'assistant',
        content: response.response.content,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message to Claude:', error);
      toast.error('Failed to get a response from Claude. Please try again.');
      
      // Add error message
      const errorMessage = {
        role: 'system',
        content: 'Sorry, I had trouble processing your request. Please try again.',
        error: true,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setShowExamples(false);
    }
  };
  
  // Generate a smart contract
  const generateContract = async () => {
    const prompt = `Please write me a smart contract for a decentralized exchange with the following features:
1. Liquidity pool for token pairs
2. Swap functionality with 0.3% fee
3. Price oracle integration
4. Flash loan prevention
5. Emergency pause capability`;
    
    await sendMessage(prompt);
  };
  
  // Analyze a smart contract
  const analyzeContract = async () => {
    const prompt = `Can you analyze this smart contract for security vulnerabilities and gas optimization?

\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 private storedData;
    
    function set(uint256 x) public {
        storedData = x;
    }
    
    function get() public view returns (uint256) {
        return storedData;
    }
}
\`\`\``;
    
    await sendMessage(prompt);
  };
  
  // Generate Monad CLI commands
  const generateCommands = async () => {
    const prompt = `Convert this instruction to Monad CLI commands:
Deploy an ERC20 token named "MonadTest" with symbol "MTT" and 18 decimals, mint 1000 tokens to my address, and verify the contract on the explorer.`;
    
    await sendMessage(prompt);
  };
  
  // Clear chat
  const clearChat = () => {
    setMessages([]);
    setShowExamples(true);
  };
  
  // Format message content (handle code blocks, etc.)
  const formatContent = (content) => {
    if (!content) return null;
    
    // Split content on code blocks
    const parts = content.split(/(```[a-z]*\n[\s\S]*?\n```)/g);
    
    return parts.map((part, index) => {
      // Check if this part is a code block
      const codeMatch = part.match(/```([a-z]*)\n([\s\S]*?)\n```/);
      
      if (codeMatch) {
        const language = codeMatch[1] || 'javascript';
        const code = codeMatch[2];
        
        return (
          <div key={index} className="my-4 rounded-md overflow-hidden">
            <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
              <span className="text-xs text-gray-300">{language}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(code);
                  toast.success('Code copied to clipboard!');
                }}
                className="text-xs text-gray-300 hover:text-white"
              >
                Copy
              </button>
            </div>
            <SyntaxHighlighter
              language={language}
              style={vs2015}
              customStyle={{ margin: 0, padding: '1rem' }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        );
      }
      
      // For non-code parts, handle links and regular text
      return (
        <div key={index} className="prose dark:prose-invert max-w-none">
          {part.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < part.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
      );
    });
  };
  
  return (
    <div className="page-transition h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          AI Assistant
        </h2>
        
        <div className="flex space-x-2">
          <button
            onClick={clearChat}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <XCircleIcon className="h-4 w-4 mr-1" />
            Clear Chat
          </button>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-500 rounded-full p-2">
                <CodeBracketIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg max-w-3xl">
                <p className="text-sm text-gray-900 dark:text-white">
                  👋 Hi! I'm your AI assistant for Monad blockchain development. I can help you with:
                </p>
                <ul className="mt-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside space-y-1">
                  <li>Generating and analyzing smart contracts</li>
                  <li>Converting natural language to Monad CLI commands</li>
                  <li>Explaining blockchain concepts and Monad features</li>
                  <li>Debugging transaction errors and providing recommendations</li>
                  <li>Designing complex DeFi protocols and workflows</li>
                </ul>
              </div>
            </div>
          )}
          
          {/* Message History */}
          {messages.map((message, index) => (
            <div key={index} className="flex items-start">
              {message.role === 'user' ? (
                <>
                  <div className="flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-full p-2">
                    <svg className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-3 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg max-w-3xl">
                    <p className="text-sm text-gray-900 dark:text-white">{message.content}</p>
                  </div>
                </>
              ) : message.role === 'assistant' ? (
                <>
                  <div className="flex-shrink-0 bg-blue-500 rounded-full p-2">
                    <CodeBracketIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-3 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg max-w-3xl">
                    {formatContent(message.content)}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-shrink-0 bg-red-500 rounded-full p-2">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-3 bg-red-50 dark:bg-red-900/30 p-4 rounded-lg max-w-3xl">
                    <p className="text-sm text-red-900 dark:text-red-200">{message.content}</p>
                  </div>
                </>
              )}
            </div>
          ))}
          
          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-500 rounded-full p-2">
                <CodeBracketIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />
                  <p className="text-sm text-gray-900 dark:text-white">Thinking...</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Example Prompts */}
          {showExamples && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-auto">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                <LightBulbIcon className="h-5 w-5 inline-block mr-1 text-yellow-500" />
                Try asking me:
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={generateContract}
                  className="text-left p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <DocumentTextIcon className="h-5 w-5 text-green-500 mb-1" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Generate a DEX contract</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Get a complete DEX smart contract with liquidity pools</p>
                </button>
                
                <button
                  onClick={analyzeContract}
                  className="text-left p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <CodeBracketIcon className="h-5 w-5 text-blue-500 mb-1" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Analyze contract security</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Check a contract for vulnerabilities and optimizations</p>
                </button>
                
                <button
                  onClick={generateCommands}
                  className="text-left p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <ArrowPathRoundedSquareIcon className="h-5 w-5 text-purple-500 mb-1" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Generate CLI commands</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Convert natural language to Monad CLI instructions</p>
                </button>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Form */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about Monad blockchain..."
              className="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={loading}
            />
            
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading || !input.trim()
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none'
              }`}
            >
              {loading ? (
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
              ) : (
                <PaperAirplaneIcon className="h-5 w-5" />
              )}
            </button>
          </form>
          
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Powered by Claude AI. Your messages are processed by Anthropic to provide relevant responses.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
