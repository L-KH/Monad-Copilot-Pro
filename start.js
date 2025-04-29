#!/usr/bin/env node

/**
 * Monad Copilot Pro Launcher
 * 
 * This script starts both the backend server and the frontend client
 * in development mode, making it easy to get started.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// ANSI color codes for prettier console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log(`${colors.yellow}No .env file found. Creating one from .env.example...${colors.reset}`);
  
  try {
    // Check if .env.example exists
    const envExamplePath = path.join(__dirname, '.env.example');
    if (fs.existsSync(envExamplePath)) {
      // Copy .env.example to .env
      fs.copyFileSync(envExamplePath, envPath);
      console.log(`${colors.green}Created .env file from .env.example${colors.reset}`);
      console.log(`${colors.yellow}Please edit the .env file to set your API keys and configuration.${colors.reset}`);
    } else {
      console.log(`${colors.red}No .env.example file found. Please create a .env file manually.${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error creating .env file:${colors.reset}`, error);
  }
}

// Print banner
console.log('\n');
console.log(`${colors.cyan}${colors.bright}=========================================${colors.reset}`);
console.log(`${colors.cyan}${colors.bright}          MONAD COPILOT PRO            ${colors.reset}`);
console.log(`${colors.cyan}${colors.bright}=========================================${colors.reset}`);
console.log(`${colors.blue}AI-powered smart contract development and${colors.reset}`);
console.log(`${colors.blue}transaction automation suite for Monad${colors.reset}`);
console.log('\n');

// Helper function to create prefixed output handlers
function createPrefixedOutputHandler(prefix, color) {
  return (data) => {
    const lines = data.toString().trim().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        console.log(`${color}[${prefix}]${colors.reset} ${line}`);
      }
    }
  };
}

// Start the backend server
console.log(`${colors.green}Starting backend server...${colors.reset}`);
const server = spawn('node', ['server.js'], { cwd: __dirname });

server.stdout.on('data', createPrefixedOutputHandler('Server', colors.green));
server.stderr.on('data', createPrefixedOutputHandler('Server Error', colors.red));

// Wait for server to start before starting client
setTimeout(() => {
  // Start the frontend client
  console.log(`${colors.blue}Starting frontend client...${colors.reset}`);
  const client = spawn('npm', ['start'], { cwd: path.join(__dirname, 'client'), shell: true });

  client.stdout.on('data', createPrefixedOutputHandler('Client', colors.blue));
  client.stderr.on('data', createPrefixedOutputHandler('Client Error', colors.red));

  console.log(`${colors.yellow}${colors.bright}Both server and client are starting...${colors.reset}`);
  console.log(`${colors.yellow}${colors.bright}The client will open in your default browser shortly.${colors.reset}`);
  console.log(`${colors.yellow}${colors.dim}Press Ctrl+C to stop both processes.${colors.reset}`);

  // Handle client process exit
  client.on('close', (code) => {
    console.log(`${colors.blue}Client process exited with code ${code}${colors.reset}`);
    // Kill server when client exits
    server.kill();
  });
}, 2000);

// Handle server process exit
server.on('close', (code) => {
  console.log(`${colors.green}Server process exited with code ${code}${colors.reset}`);
  process.exit();
});

// Handle process termination
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}Stopping all processes...${colors.reset}`);
  server.kill();
  process.exit();
});
