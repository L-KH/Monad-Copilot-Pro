import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// Import mock socket instead of real socket.io
// import { io } from 'socket.io-client';
import { createMockSocket } from './services/mockSocket';

// Pages
import Dashboard from './pages/Dashboard';
import Workflows from './pages/Workflows';
import WorkflowDetails from './pages/WorkflowDetails';
import SmartContracts from './pages/SmartContracts';
import ContractDetails from './pages/ContractDetails';
import AiAssistant from './pages/AiAssistant';
import Settings from './pages/Settings';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Notifications from './components/Notifications';
import Loader from './components/Loader';

// Socket context
import { SocketProvider } from './services/SocketContext';

// API service
import { checkApiStatus } from './services/api';

import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Toggle sidebar function for mobile view
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Initialize socket connection and API check
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check API status
        const status = await checkApiStatus();
        setApiConnected(status.success);
        
        // Initialize socket connection using mock socket
        const socketInstance = createMockSocket();
        setSocket(socketInstance);
        
        // Listen for notifications
        socketInstance.on('notification', (notification) => {
          setNotifications(prev => [notification, ...prev.slice(0, 9)]);
        });
        
        // Listen for workflow events
        socketInstance.on('workflow:completed', (data) => {
          setNotifications(prev => [{
            type: 'success',
            message: `Workflow "${data.name}" completed successfully`,
            timestamp: new Date().toISOString()
          }, ...prev.slice(0, 9)]);
        });
        
        socketInstance.on('workflow:failed', (data) => {
          setNotifications(prev => [{
            type: 'error',
            message: `Workflow "${data.name}" failed: ${data.error || 'Unknown error'}`,
            timestamp: new Date().toISOString()
          }, ...prev.slice(0, 9)]);
        });
        
        // Simulate an initial notification
        setTimeout(() => {
          socketInstance.simulateEvent('notification', {
            type: 'success',
            message: 'Connected to Monad Testnet (Chain ID: 10143)',
            timestamp: new Date().toISOString()
          });
        }, 1000);
        
        setLoading(false);
        
        return () => {
          socketInstance.disconnect();
        };
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setApiConnected(false);
        setLoading(false);
      }
    };
    
    initializeApp();
  }, []);

  // Clear notification
  const clearNotification = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  // Render loading state
  if (loading) {
    return <Loader fullScreen message="Initializing Monad Copilot Pro..." />;
  }

  return (
    <SocketProvider value={socket}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden w-screen">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        
        <div className="flex flex-col flex-1 overflow-hidden ml-0 lg:ml-[280px] transition-all duration-300 ease-in-out w-full lg:w-[calc(100%-280px)] relative">
          <Header apiConnected={apiConnected} toggleSidebar={toggleSidebar} />
          
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 max-w-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/workflows" element={<Workflows />} />
              <Route path="/workflows/:id" element={<WorkflowDetails />} />
              <Route path="/contracts" element={<SmartContracts />} />
              <Route path="/contracts/:id" element={<ContractDetails />} />
              <Route path="/assistant" element={<AiAssistant />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          {/* Notifications moved outside main content area */}
          <Notifications 
            notifications={notifications} 
            onClear={clearNotification} 
          />
        </div>
      </div>
    </SocketProvider>
  );
}

export default App;
