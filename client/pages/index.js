import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// This acts as a fallback router for Next.js
// The actual routing is handled by React Router in src/App.js
export default function Home() {
  const router = useRouter();

  // In case of client-side navigation
  React.useEffect(() => {
    // Any logic needed for initial page load
  }, []);

  return (
    <>
      <Head>
        <title>Monad Copilot Pro</title>
        <meta name="description" content="Build, deploy, and monitor smart contracts on Monad" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* React application will be mounted here by _app.js */}
      {/* This component should rarely be seen directly */}
      <div id="next-root">
        {/* This is just a fallback loading indicator in case there are issues with the React app */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          backgroundColor: '#111827'
        }}>
          <div style={{ textAlign: 'center', color: '#ffffff' }}>
            <h1>Monad Copilot Pro</h1>
            <p>Loading the application...</p>
          </div>
        </div>
      </div>
    </>
  );
}
