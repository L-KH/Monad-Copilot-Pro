/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Changed from 'export' to prevent routes-manifest issue
  output: 'standalone',
  distDir: 'build',
  // Ensure the React app works without server-side rendering
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Fix for using process.env in the client
  env: {
    REACT_APP_MONAD_RPC_URL: process.env.REACT_APP_MONAD_RPC_URL || process.env.NEXT_PUBLIC_MONAD_RPC_URL,
    REACT_APP_ANTHROPIC_API_KEY: process.env.REACT_APP_ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
  },
  // Ensure compatibility with Vercel deployment
  webpack: (config) => {
    // Add support for CSS files
    const oneOfRule = config.module.rules.find((rule) => rule.oneOf);
    
    if (oneOfRule) {
      const moduleCssRule = oneOfRule.oneOf.find((rule) => 
        rule.test && rule.test.toString().includes('module\\.(css|scss|sass)')  
      );
      
      if (moduleCssRule) {
        moduleCssRule.test = /\.module\.(css|scss|sass)$/;
      }

      // Ensure CSS is loaded properly
      oneOfRule.oneOf.push({
        test: /\.(css|scss|sass)$/,
        use: ['style-loader', 'css-loader']
      });
    }
    
    // Add fallbacks for react-syntax-highlighter
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-syntax-highlighter/dist/esm/styles/hljs/a11y-dark': 
        require.resolve('react-syntax-highlighter/dist/cjs/styles/hljs/a11y-dark'),
      'react-syntax-highlighter/dist/esm/': 
        require.resolve('react-syntax-highlighter').replace('/index.js', '/') 
    };
    
    return config;
  },
  // Ensure proper environment variable handling
  publicRuntimeConfig: {
    MONAD_RPC_URL: process.env.NEXT_PUBLIC_MONAD_RPC_URL,
  },
}

module.exports = nextConfig
