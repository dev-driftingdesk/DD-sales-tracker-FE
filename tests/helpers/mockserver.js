// Mock Server Configuration and Startup
const { mockServer } = require('mockserver-node');

const startMockServer = async () => {
  try {
    const server = await mockServer.start_mockserver({
      serverPort: 1080,
      verbose: false,
      trace: false
    });
    
    console.log('Mock server started on port 1080');
    return server;
  } catch (error) {
    console.error('Failed to start mock server:', error);
    process.exit(1);
  }
};

// Auto-start if this file is run directly
if (require.main === module) {
  startMockServer().then(() => {
    console.log('Mock server is ready for testing');
  });
}

module.exports = { startMockServer };