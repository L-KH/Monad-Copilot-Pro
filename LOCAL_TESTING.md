# Local Testing Instructions for Monad Copilot Pro

## Testing Vercel Deployment Locally

Follow these steps to test your Vercel deployment locally before pushing to GitHub:

### Prerequisites

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

### Testing Your Deployment

#### Method 1: Using Vercel Dev

1. Navigate to the project root:
   ```bash
   cd C:\Users\user\Documents\mcp2
   ```

2. Run Vercel dev:
   ```bash
   vercel dev
   ```

   This will start a local development server that simulates the Vercel environment.

#### Method 2: Testing the Next.js App Directly

1. Navigate to the client directory:
   ```bash
   cd C:\Users\user\Documents\mcp2\client
   ```

2. Run the dev server:
   ```bash
   npm run dev
   ```

### Testing the Build Process

To test if your project will build successfully on Vercel:

1. Navigate to the client directory:
   ```bash
   cd C:\Users\user\Documents\mcp2\client
   ```

2. Run the comprehensive local deployment test:
   ```bash
   npm run local-deploy
   ```

This will first install dependencies and then run the build process, similar to what happens on Vercel. If this completes without errors, your project should deploy successfully on Vercel.

### Common Issues and Solutions

1. **CSS Import Errors**: Make sure global CSS is only imported in `_app.js` in Next.js.

2. **Missing Routes Manifest**: This can happen if your Next.js config is set to `output: 'export'`. Use `output: 'standalone'` instead.

3. **Module Resolution Errors**: If you encounter module not found errors with react-syntax-highlighter, use the compatibility layer provided in `src/utils/highlighterStyles.js`. Always import from `/dist/cjs/` instead of `/dist/esm/`.

4. **Environment Variables**: Make sure your environment variables are properly set in both development and production. Use `.env.local` for local development and set these variables in the Vercel dashboard for production.

5. **React Syntax Highlighter Issues**: If you see errors related to 'a11y-dark' or other style files, modify your imports to use the CJS version like this:
   ```javascript
   // Don't use this:
   import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
   
   // Use this instead:
   import { vs2015 } from '../utils/highlighterStyles';
   ```
