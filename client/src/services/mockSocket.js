// Mock Socket.io implementation
class MockSocket {
  constructor() {
    this.eventHandlers = {};
    this.connected = true;
    this.rooms = new Set();
    
    // Simulate some events periodically
    this.setupPeriodicEvents();
  }
  
  // Register an event handler
  on(event, callback) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(callback);
    return this;
  }
  
  // Remove an event handler
  off(event, callback) {
    if (!this.eventHandlers[event]) return this;
    
    if (callback) {
      this.eventHandlers[event] = this.eventHandlers[event].filter(
        handler => handler !== callback
      );
    } else {
      delete this.eventHandlers[event];
    }
    
    return this;
  }
  
  // Send an event
  emit(event, ...args) {
    if (event === 'join-workflow') {
      const workflowId = args[0];
      this.rooms.add(workflowId);
      console.log(`Joined workflow room: ${workflowId}`);
    }
    return this;
  }
  
  // Simulate receiving an event
  simulateEvent(event, data) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(callback => {
        callback(data);
      });
    }
  }
  
  // Set up periodic events for simulation
  setupPeriodicEvents() {
    // Generate fewer notifications with longer intervals for better UX
    setInterval(() => {
      const notificationTypes = ['info', 'success', 'warning', 'error'];
      const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      
      // Real Monad chain events
      const messages = [
        'New block #3,405,976 mined on Monad Testnet',
        'Gas price updated to 23 gwei on Monad Testnet',
        'Contract 0x4B7A7BE51860f31a2D83e8537F3c5A1b9266A657 verified',
        'Transaction 0x7B44E956F3A1ED1AC4305FEA73651E91AC0A43B7 processed',
        'Monad Testnet network status: operational',
        'New validator node joined Monad Testnet',
        'Token bridge transaction completed',
        'Smart contract deployed at 0x9E8DA5A9F879DB3F889A1B6Cf4d7C163B7C5D258',
        'Monad Testnet block time: 2.1 seconds',
        'Latest Monad release: v1.0.3 - Update available'
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      this.simulateEvent('notification', {
        type: randomType,
        message: randomMessage,
        timestamp: new Date().toISOString()
      });
    }, 60000); // Every 60 seconds instead of 30 seconds
  }
  
  // Clean up
  disconnect() {
    this.connected = false;
    this.eventHandlers = {};
    console.log('Mock socket disconnected');
  }
}

// Create and export a mock socket instance
export const createMockSocket = () => {
  return new MockSocket();
};
