/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
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
    return config;
  },
  // Ensure proper environment variable handling
  publicRuntimeConfig: {
    MONAD_RPC_URL: process.env.NEXT_PUBLIC_MONAD_RPC_URL,
  },
}

module.exports = nextConfig
