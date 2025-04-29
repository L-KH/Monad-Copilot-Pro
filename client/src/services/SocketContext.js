import React, { createContext, useContext } from 'react';

// Create socket context
const SocketContext = createContext(null);

// Socket provider component
export const SocketProvider = ({ children, value }) => {
  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Hook to use socket context
export const useSocket = () => {
  const socket = useContext(SocketContext);
  
  if (!socket) {
    console.warn('useSocket must be used within a SocketProvider');
  }
  
  return socket;
};

// Custom hook to subscribe to workflow events
export const useWorkflowEvents = (workflowId, callbacks) => {
  const socket = useSocket();
  
  React.useEffect(() => {
    if (!socket || !workflowId) return;
    
    // Join workflow-specific room
    socket.emit('join-workflow', workflowId);
    
    // Register event listeners
    const eventTypes = [
      'workflow:started',
      'workflow:step_update',
      'workflow:variable_updated',
      'workflow:step_command_fixed',
      'workflow:completed',
      'workflow:failed',
      'workflow:paused',
      'workflow:resumed',
      'workflow:cancelled'
    ];
    
    eventTypes.forEach(eventType => {
      if (callbacks[eventType]) {
        socket.on(eventType, (data) => {
          if (data.workflowId === workflowId) {
            callbacks[eventType](data);
          }
        });
      }
    });
    
    // Cleanup function
    return () => {
      eventTypes.forEach(eventType => {
        if (callbacks[eventType]) {
          socket.off(eventType);
        }
      });
    };
  }, [socket, workflowId, callbacks]);
};
