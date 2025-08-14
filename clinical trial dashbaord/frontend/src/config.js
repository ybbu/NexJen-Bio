// Configuration for the application
const config = {
  // API base URL - change this based on your environment
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  
  // Network visualization settings
  network: {
    maxNodes: 800,
    maxEdges: 1200,
    defaultMinWeight: 2.0,
    defaultTimeframe: '12m'
  },
  
  // D3 visualization settings
  d3: {
    nodeRadius: {
      min: 8,
      max: 20,
      hoverMultiplier: 1.5
    },
    linkDistance: 100,
    chargeStrength: -300,
    collisionRadius: 30
  }
};

export default config;
