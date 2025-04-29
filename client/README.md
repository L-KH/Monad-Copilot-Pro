# Monad Copilot Pro - Client

This is the frontend application for Monad Copilot Pro, an AI-powered smart contract deployment and transaction automation suite for Monad blockchain.

## Running the Application

The application can now be run in standalone mode without requiring a separate server. It uses mock data to simulate API responses.

### Development Mode

To run the application in development mode:

```bash
npm start
```

This will start the React development server at http://localhost:3000.

### Production Build

To create a production build:

```bash
npm run build
```

This will create a production build in the `build` directory.

### Vercel Deployment

This application is configured for deployment on Vercel. You can deploy it by:

1. Connecting your GitHub repository to Vercel
2. Select the project and deploy

Or using the Vercel CLI:

```bash
vercel
```

## Features

- AI-powered smart contract generation and deployment
- Workflow automation for Monad blockchain operations
- Dashboard with network statistics and transaction monitoring
- Responsive design for desktop and mobile devices

## Technical Details

- Built with React and Tailwind CSS
- Responsive UI with mobile-first approach
- Mock data layer for development without a backend
- Configured for easy deployment to Vercel

## Configuration

Environment variables can be set in `.env.local` (not committed to git):

- `REACT_APP_USE_MOCK_DATA`: Set to "true" to use mock data instead of real API calls
- `REACT_APP_MONAD_RPC_URL`: The RPC URL for the Monad network
