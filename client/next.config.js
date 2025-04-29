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
    REACT_APP_MONAD_RPC_URL: process.env.REACT_APP_MONAD_RPC_URL,
    REACT_APP_ANTHROPIC_API_KEY: process.env.REACT_APP_ANTHROPIC_API_KEY,
  },
}

module.exports = nextConfig
