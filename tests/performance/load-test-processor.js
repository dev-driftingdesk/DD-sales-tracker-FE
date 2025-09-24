// Artillery Load Test Processor Functions
const faker = require('faker');

// Set seed for consistent test data generation
faker.seed(12345);

module.exports = {
  // Generate dynamic test data for each virtual user
  generateTestData: function(context, events, done) {
    // Generate user data
    context.vars.email = faker.internet.email().toLowerCase();
    context.vars.companyName = faker.company.companyName();
    context.vars.contactName = faker.name.findName();
    context.vars.phone = faker.phone.phoneNumber();
    context.vars.dealValue = faker.random.number({ min: 1000, max: 100000 });
    context.vars.firstName = faker.name.firstName();
    context.vars.lastName = faker.name.lastName();
    
    // Generate business data
    context.vars.industry = faker.random.arrayElement([
      'Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail'
    ]);
    context.vars.companySize = faker.random.arrayElement([
      '1-10', '11-50', '51-200', '201-1000', '1000+'
    ]);
    context.vars.leadSource = faker.random.arrayElement([
      'website', 'facebook', 'email', 'referral', 'event'
    ]);
    context.vars.dealStage = faker.random.arrayElement([
      'prospecting', 'qualification', 'proposal', 'negotiation'
    ]);
    
    // Generate location data
    context.vars.city = faker.address.city();
    context.vars.country = faker.address.country();
    context.vars.location = `${context.vars.city}, ${context.vars.country}`;
    
    return done();
  },

  // Log successful responses for monitoring
  logSuccess: function(requestParams, response, context, events, done) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log(`✓ ${requestParams.method} ${requestParams.url} - ${response.statusCode}`);
    }
    return done();
  },

  // Log and handle errors
  logError: function(requestParams, response, context, events, done) {
    if (response.statusCode >= 400) {
      console.error(`✗ ${requestParams.method} ${requestParams.url} - ${response.statusCode}`);
      console.error(`Response: ${response.body}`);
      
      // Emit custom event for error tracking
      events.emit('customStat', 'errors', 1);
    }
    return done();
  },

  // Track response times by endpoint
  trackResponseTime: function(requestParams, response, context, events, done) {
    const endpoint = requestParams.url.replace(/\/\d+/g, '/:id'); // Normalize IDs
    events.emit('customStat', `response_time_${endpoint}`, response.timings.end);
    return done();
  },

  // Generate activity data
  generateActivity: function(context, events, done) {
    context.vars.activityType = faker.random.arrayElement([
      'call', 'email', 'meeting', 'note'
    ]);
    context.vars.activityTitle = faker.lorem.words(3);
    context.vars.activityDescription = faker.lorem.sentences(2);
    context.vars.activityOutcome = faker.random.arrayElement([
      'positive', 'neutral', 'negative'
    ]);
    context.vars.activityDuration = faker.random.number({ min: 5, max: 120 });
    
    return done();
  },

  // Generate product data for deals
  generateProducts: function(context, events, done) {
    const products = [];
    const productCount = faker.random.number({ min: 1, max: 3 });
    
    for (let i = 0; i < productCount; i++) {
      products.push({
        name: faker.commerce.productName(),
        quantity: faker.random.number({ min: 1, max: 10 }),
        unitPrice: faker.random.number({ min: 100, max: 2000 })
      });
    }
    
    context.vars.products = products;
    return done();
  },

  // Simulate user think time
  thinkTime: function(context, events, done) {
    const thinkTime = faker.random.number({ min: 1000, max: 3000 });
    setTimeout(done, thinkTime);
  },

  // Authentication token management
  setupAuth: function(context, events, done) {
    // Set up different user types for testing
    const userTypes = [
      { email: 'admin@test.com', password: 'AdminTest123!', role: 'admin' },
      { email: 'manager@test.com', password: 'ManagerTest123!', role: 'manager' },
      { email: 'sales-rep@test.com', password: 'SalesTest123!', role: 'sales_rep' },
      { email: 'viewer@test.com', password: 'ViewerTest123!', role: 'viewer' }
    ];
    
    const selectedUser = faker.random.arrayElement(userTypes);
    context.vars.userEmail = selectedUser.email;
    context.vars.userPassword = selectedUser.password;
    context.vars.userRole = selectedUser.role;
    
    return done();
  },

  // Generate realistic search queries
  generateSearchQuery: function(context, events, done) {
    const searchTypes = [
      () => faker.company.companyName().split(' ')[0], // Company name fragment
      () => faker.name.lastName(), // Contact last name
      () => faker.internet.email().split('@')[0], // Email prefix
      () => faker.address.city(), // Location
      () => faker.commerce.productName().split(' ')[0] // Product interest
    ];
    
    context.vars.searchQuery = faker.random.arrayElement(searchTypes)();
    return done();
  },

  // Generate date ranges for analytics
  generateDateRange: function(context, events, done) {
    const timeframes = ['7d', '30d', '90d', '6m', '1y'];
    context.vars.timeframe = faker.random.arrayElement(timeframes);
    
    // Generate specific date ranges
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - faker.random.number({ min: 7, max: 365 }));
    
    context.vars.startDate = startDate.toISOString().split('T')[0];
    context.vars.endDate = endDate.toISOString().split('T')[0];
    
    return done();
  },

  // Validate response data
  validateResponse: function(requestParams, response, context, events, done) {
    try {
      const data = JSON.parse(response.body);
      
      // Check for required API response structure
      if (response.statusCode >= 200 && response.statusCode < 300) {
        if (!data.success && response.statusCode !== 204) {
          console.error(`Invalid response structure: ${requestParams.url}`);
          events.emit('customStat', 'invalid_responses', 1);
        }
      }
      
      // Track pagination responses
      if (data.pagination) {
        events.emit('customStat', 'paginated_responses', 1);
      }
      
    } catch (error) {
      if (response.statusCode !== 204) { // 204 No Content is valid
        console.error(`Invalid JSON response: ${requestParams.url}`);
        events.emit('customStat', 'invalid_json', 1);
      }
    }
    
    return done();
  },

  // Track concurrent users and session management
  trackSession: function(context, events, done) {
    if (!context.vars._sessionStarted) {
      context.vars._sessionStarted = Date.now();
      events.emit('customStat', 'concurrent_sessions', 1);
    }
    return done();
  },

  // Cleanup session on completion
  endSession: function(context, events, done) {
    if (context.vars._sessionStarted) {
      const sessionDuration = Date.now() - context.vars._sessionStarted;
      events.emit('customStat', 'session_duration', sessionDuration);
      events.emit('customStat', 'sessions_ended', 1);
    }
    return done();
  },

  // Memory and resource monitoring
  checkMemoryUsage: function(context, events, done) {
    const used = process.memoryUsage();
    events.emit('customStat', 'memory_rss_mb', Math.round(used.rss / 1024 / 1024));
    events.emit('customStat', 'memory_heap_mb', Math.round(used.heapUsed / 1024 / 1024));
    return done();
  },

  // Custom metrics collection
  collectCustomMetrics: function(requestParams, response, context, events, done) {
    // Track API endpoint usage
    const endpoint = requestParams.url.replace(/\/[a-f0-9-]{36}/g, '/:id');
    events.emit('customStat', `endpoint_${endpoint.replace(/\//g, '_')}`, 1);
    
    // Track HTTP methods
    events.emit('customStat', `method_${requestParams.method}`, 1);
    
    // Track response sizes
    if (response.body) {
      const responseSize = Buffer.byteLength(response.body, 'utf8');
      events.emit('customStat', 'response_size_bytes', responseSize);
    }
    
    // Track successful business operations
    if (response.statusCode === 201) {
      events.emit('customStat', 'resources_created', 1);
    }
    if (response.statusCode === 200 && requestParams.method === 'PATCH') {
      events.emit('customStat', 'resources_updated', 1);
    }
    if (response.statusCode === 204 && requestParams.method === 'DELETE') {
      events.emit('customStat', 'resources_deleted', 1);
    }
    
    return done();
  },

  // Performance benchmark validation
  validatePerformance: function(requestParams, response, context, events, done) {
    const responseTime = response.timings.end;
    const endpoint = requestParams.url.replace(/\/[a-f0-9-]{36}/g, '/:id');
    
    // Define performance thresholds per endpoint type
    const thresholds = {
      '/api/auth': 300,
      '/api/leads': 200,
      '/api/contacts': 200,  
      '/api/companies': 200,
      '/api/deals': 200,
      '/api/analytics': 1000,
      '/api/search': 500
    };
    
    // Find matching threshold
    let threshold = 500; // default
    for (const [path, limit] of Object.entries(thresholds)) {
      if (endpoint.startsWith(path)) {
        threshold = limit;
        break;
      }
    }
    
    if (responseTime > threshold) {
      console.warn(`Slow response: ${endpoint} took ${responseTime}ms (threshold: ${threshold}ms)`);
      events.emit('customStat', 'slow_responses', 1);
    }
    
    return done();
  }
};