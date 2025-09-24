// Unit Tests for Business Logic Functions
const TestDataFactory = require('../helpers/testDataFactory');

// Mock business logic functions (these would be imported from actual modules)
// For demo purposes, we'll define them here
const BusinessLogic = {
  calculateCommission: (dealValue, commissionRate = 0.05) => {
    if (dealValue < 0) throw new Error('Deal value cannot be negative');
    return dealValue * commissionRate;
  },

  calculateLeadScore: (lead) => {
    let score = 0;
    
    // Company size scoring
    const sizeScores = { '1-10': 10, '11-50': 20, '51-200': 30, '201-1000': 40, '1000+': 50 };
    score += sizeScores[lead.companySize] || 0;
    
    // Source scoring
    const sourceScores = { website: 30, referral: 40, event: 35, facebook: 20, email: 25 };
    score += sourceScores[lead.source] || 0;
    
    // Deal value scoring
    if (lead.dealValue > 100000) score += 30;
    else if (lead.dealValue > 50000) score += 20;
    else if (lead.dealValue > 20000) score += 10;
    
    // Activity scoring
    if (lead.activities && lead.activities.length > 0) {
      score += Math.min(lead.activities.length * 5, 25);
    }
    
    return Math.min(score, 100);
  },

  validateDealStage: (currentStage, newStage) => {
    const stageOrder = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
    const currentIndex = stageOrder.indexOf(currentStage);
    const newIndex = stageOrder.indexOf(newStage);
    
    if (currentIndex === -1 || newIndex === -1) {
      throw new Error('Invalid stage');
    }
    
    // Allow moving to any previous stage or next stage
    // Allow closing from any stage
    if (newStage === 'closed_won' || newStage === 'closed_lost') {
      return true;
    }
    
    // Allow moving forward or backward by one stage
    return Math.abs(newIndex - currentIndex) <= 1;
  },

  calculateSalesVelocity: (deals) => {
    const closedDeals = deals.filter(deal => 
      deal.stage === 'closed_won' && deal.actualCloseDate && deal.createdAt
    );
    
    if (closedDeals.length === 0) return 0;
    
    const totalSalesCycle = closedDeals.reduce((sum, deal) => {
      const created = new Date(deal.createdAt);
      const closed = new Date(deal.actualCloseDate);
      const cycleDays = Math.floor((closed - created) / (1000 * 60 * 60 * 24));
      return sum + cycleDays;
    }, 0);
    
    const avgSalesCycle = totalSalesCycle / closedDeals.length;
    const totalValue = closedDeals.reduce((sum, deal) => sum + deal.value, 0);
    const avgDealSize = totalValue / closedDeals.length;
    const winRate = closedDeals.length / deals.length;
    
    // Velocity = (Number of Opportunities × Average Deal Size × Win Rate) / Sales Cycle Length
    return (closedDeals.length * avgDealSize * winRate) / avgSalesCycle;
  },

  calculateChurnRisk: (customer) => {
    let riskScore = 0;
    
    // Days since last activity
    const lastActivityDays = customer.daysSinceLastActivity || 0;
    if (lastActivityDays > 90) riskScore += 30;
    else if (lastActivityDays > 60) riskScore += 20;
    else if (lastActivityDays > 30) riskScore += 10;
    
    // Support tickets
    if (customer.openSupportTickets > 3) riskScore += 25;
    else if (customer.openSupportTickets > 1) riskScore += 15;
    
    // Usage decline
    if (customer.usageDecline > 0.5) riskScore += 25;
    else if (customer.usageDecline > 0.3) riskScore += 15;
    
    // Payment issues
    if (customer.latePayments > 2) riskScore += 20;
    else if (customer.latePayments > 0) riskScore += 10;
    
    return Math.min(riskScore, 100);
  },

  formatCurrency: (amount, currency = 'USD') => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    });
    return formatter.format(amount);
  },

  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  calculateResponseTime: (activities) => {
    const responses = activities.filter(activity => 
      activity.isResponse && activity.metadata && activity.metadata.response_time
    );
    
    if (responses.length === 0) return null;
    
    const totalMinutes = responses.reduce((sum, activity) => {
      const responseTime = activity.metadata.response_time;
      let minutes = 0;
      
      if (responseTime.includes('minutes')) {
        minutes = parseInt(responseTime);
      } else if (responseTime.includes('hours')) {
        minutes = parseInt(responseTime) * 60;
      } else if (responseTime.includes('days')) {
        minutes = parseInt(responseTime) * 60 * 24;
      }
      
      return sum + minutes;
    }, 0);
    
    return totalMinutes / responses.length;
  }
};

describe('Business Logic Unit Tests', () => {
  let testDataFactory;

  beforeAll(() => {
    testDataFactory = TestDataFactory;
  });

  describe('Commission Calculation', () => {
    test('should calculate commission correctly with default rate', () => {
      const commission = BusinessLogic.calculateCommission(100000);
      expect(commission).toBe(5000); // 5% of 100000
    });

    test('should calculate commission with custom rate', () => {
      const commission = BusinessLogic.calculateCommission(50000, 0.08);
      expect(commission).toBe(4000); // 8% of 50000
    });

    test('should handle zero deal value', () => {
      const commission = BusinessLogic.calculateCommission(0);
      expect(commission).toBe(0);
    });

    test('should throw error for negative deal value', () => {
      expect(() => {
        BusinessLogic.calculateCommission(-1000);
      }).toThrow('Deal value cannot be negative');
    });

    test('should handle very large deal values', () => {
      const commission = BusinessLogic.calculateCommission(10000000, 0.02);
      expect(commission).toBe(200000);
    });

    test('should handle decimal deal values', () => {
      const commission = BusinessLogic.calculateCommission(12345.67, 0.05);
      expect(commission).toBeCloseTo(617.28, 2);
    });
  });

  describe('Lead Scoring', () => {
    test('should calculate lead score based on all factors', () => {
      const lead = {
        companySize: '51-200',
        source: 'referral',
        dealValue: 75000,
        activities: [
          { type: 'call', description: 'Initial contact' },
          { type: 'email', description: 'Follow up' },
          { type: 'meeting', description: 'Demo' }
        ]
      };

      const score = BusinessLogic.calculateLeadScore(lead);
      
      // 30 (size) + 40 (referral) + 20 (deal value) + 15 (3 activities) = 105, capped at 100
      expect(score).toBe(100);
    });

    test('should score lead with minimum factors', () => {
      const lead = {
        companySize: '1-10',
        source: 'facebook',
        dealValue: 5000,
        activities: []
      };

      const score = BusinessLogic.calculateLeadScore(lead);
      
      // 10 (size) + 20 (facebook) + 0 (deal value) + 0 (activities) = 30
      expect(score).toBe(30);
    });

    test('should handle missing optional fields', () => {
      const lead = {
        source: 'website',
        dealValue: 30000
      };

      const score = BusinessLogic.calculateLeadScore(lead);
      
      // 0 (no size) + 30 (website) + 10 (deal value) + 0 (no activities) = 40
      expect(score).toBe(40);
    });

    test('should cap activities scoring at maximum', () => {
      const activities = Array.from({ length: 10 }, (_, i) => ({
        type: 'call',
        description: `Activity ${i + 1}`
      }));

      const lead = {
        companySize: '1000+',
        source: 'event',
        dealValue: 25000,
        activities: activities
      };

      const score = BusinessLogic.calculateLeadScore(lead);
      
      // 50 (size) + 35 (event) + 10 (deal value) + 25 (max activities) = 120, capped at 100
      expect(score).toBe(100);
    });

    test('should handle unknown source and company size', () => {
      const lead = {
        companySize: 'unknown',
        source: 'unknown',
        dealValue: 1000000, // High value should still score
        activities: []
      };

      const score = BusinessLogic.calculateLeadScore(lead);
      
      // 0 (unknown size) + 0 (unknown source) + 30 (high deal value) + 0 (no activities) = 30
      expect(score).toBe(30);
    });
  });

  describe('Deal Stage Validation', () => {
    test('should allow moving to next stage', () => {
      const isValid = BusinessLogic.validateDealStage('prospecting', 'qualification');
      expect(isValid).toBe(true);
    });

    test('should allow moving to previous stage', () => {
      const isValid = BusinessLogic.validateDealStage('proposal', 'qualification');
      expect(isValid).toBe(true);
    });

    test('should allow closing from any stage', () => {
      expect(BusinessLogic.validateDealStage('prospecting', 'closed_won')).toBe(true);
      expect(BusinessLogic.validateDealStage('negotiation', 'closed_lost')).toBe(true);
    });

    test('should reject skipping multiple stages', () => {
      expect(() => {
        BusinessLogic.validateDealStage('prospecting', 'negotiation');
      }).toThrow('Invalid stage');
    });

    test('should reject invalid current stage', () => {
      expect(() => {
        BusinessLogic.validateDealStage('invalid_stage', 'qualification');
      }).toThrow('Invalid stage');
    });

    test('should reject invalid new stage', () => {
      expect(() => {
        BusinessLogic.validateDealStage('prospecting', 'invalid_stage');
      }).toThrow('Invalid stage');
    });

    test('should allow staying in same stage', () => {
      const isValid = BusinessLogic.validateDealStage('qualification', 'qualification');
      expect(isValid).toBe(true);
    });
  });

  describe('Sales Velocity Calculation', () => {
    test('should calculate sales velocity correctly', () => {
      const deals = [
        {
          stage: 'closed_won',
          value: 100000,
          createdAt: '2024-01-01',
          actualCloseDate: '2024-01-31'
        },
        {
          stage: 'closed_won',
          value: 50000,
          createdAt: '2024-01-15',
          actualCloseDate: '2024-02-15'
        },
        {
          stage: 'prospecting',
          value: 75000,
          createdAt: '2024-02-01'
        }
      ];

      const velocity = BusinessLogic.calculateSalesVelocity(deals);
      
      expect(velocity).toBeGreaterThan(0);
      expect(typeof velocity).toBe('number');
    });

    test('should return zero for no closed deals', () => {
      const deals = [
        {
          stage: 'prospecting',
          value: 50000,
          createdAt: '2024-01-01'
        }
      ];

      const velocity = BusinessLogic.calculateSalesVelocity(deals);
      expect(velocity).toBe(0);
    });

    test('should handle empty deals array', () => {
      const velocity = BusinessLogic.calculateSalesVelocity([]);
      expect(velocity).toBe(0);
    });

    test('should handle deals without required dates', () => {
      const deals = [
        {
          stage: 'closed_won',
          value: 100000
          // Missing createdAt and actualCloseDate
        }
      ];

      const velocity = BusinessLogic.calculateSalesVelocity(deals);
      expect(velocity).toBe(0);
    });
  });

  describe('Churn Risk Calculation', () => {
    test('should calculate high churn risk', () => {
      const customer = {
        daysSinceLastActivity: 120,
        openSupportTickets: 5,
        usageDecline: 0.7,
        latePayments: 3
      };

      const risk = BusinessLogic.calculateChurnRisk(customer);
      expect(risk).toBe(100); // Should be capped at 100
    });

    test('should calculate low churn risk', () => {
      const customer = {
        daysSinceLastActivity: 15,
        openSupportTickets: 0,
        usageDecline: 0.1,
        latePayments: 0
      };

      const risk = BusinessLogic.calculateChurnRisk(customer);
      expect(risk).toBe(0);
    });

    test('should calculate medium churn risk', () => {
      const customer = {
        daysSinceLastActivity: 45,
        openSupportTickets: 2,
        usageDecline: 0.4,
        latePayments: 1
      };

      const risk = BusinessLogic.calculateChurnRisk(customer);
      expect(risk).toBe(55); // 10 + 15 + 15 + 10 = 50
    });

    test('should handle missing risk factors', () => {
      const customer = {};
      
      const risk = BusinessLogic.calculateChurnRisk(customer);
      expect(risk).toBe(0);
    });
  });

  describe('Currency Formatting', () => {
    test('should format USD currency correctly', () => {
      const formatted = BusinessLogic.formatCurrency(12345.67);
      expect(formatted).toBe('$12,345.67');
    });

    test('should format different currencies', () => {
      const eur = BusinessLogic.formatCurrency(12345.67, 'EUR');
      const gbp = BusinessLogic.formatCurrency(12345.67, 'GBP');
      
      expect(eur).toContain('12,345.67');
      expect(gbp).toContain('12,345.67');
    });

    test('should handle zero amount', () => {
      const formatted = BusinessLogic.formatCurrency(0);
      expect(formatted).toBe('$0.00');
    });

    test('should handle negative amounts', () => {
      const formatted = BusinessLogic.formatCurrency(-1000);
      expect(formatted).toBe('-$1,000.00');
    });

    test('should handle large amounts', () => {
      const formatted = BusinessLogic.formatCurrency(1234567890.12);
      expect(formatted).toBe('$1,234,567,890.12');
    });
  });

  describe('Email Validation', () => {
    test('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user_name@example.net',
        'user123@example-domain.com'
      ];

      validEmails.forEach(email => {
        expect(BusinessLogic.validateEmail(email)).toBe(true);
      });
    });

    test('should reject invalid email addresses', () => {
      const invalidEmails = [
        'plaintext',
        '@domain.com',
        'user@',
        'user@domain',
        'user name@domain.com',
        'user..double@domain.com',
        'user@domain..com'
      ];

      invalidEmails.forEach(email => {
        expect(BusinessLogic.validateEmail(email)).toBe(false);
      });
    });

    test('should handle edge cases', () => {
      expect(BusinessLogic.validateEmail('')).toBe(false);
      expect(BusinessLogic.validateEmail(null)).toBe(false);
      expect(BusinessLogic.validateEmail(undefined)).toBe(false);
    });
  });

  describe('Response Time Calculation', () => {
    test('should calculate average response time from activities', () => {
      const activities = [
        {
          isResponse: true,
          metadata: { response_time: '30 minutes' }
        },
        {
          isResponse: true,
          metadata: { response_time: '2 hours' }
        },
        {
          isResponse: false,
          metadata: { response_time: '1 hour' }
        }
      ];

      const avgResponseTime = BusinessLogic.calculateResponseTime(activities);
      expect(avgResponseTime).toBe(75); // (30 + 120) / 2 = 75 minutes
    });

    test('should handle different time units', () => {
      const activities = [
        {
          isResponse: true,
          metadata: { response_time: '45 minutes' }
        },
        {
          isResponse: true,
          metadata: { response_time: '1 hours' }
        },
        {
          isResponse: true,
          metadata: { response_time: '1 days' }
        }
      ];

      const avgResponseTime = BusinessLogic.calculateResponseTime(activities);
      expect(avgResponseTime).toBe(535); // (45 + 60 + 1440) / 3 = 515 minutes
    });

    test('should return null for no response activities', () => {
      const activities = [
        {
          isResponse: false,
          metadata: { response_time: '30 minutes' }
        }
      ];

      const avgResponseTime = BusinessLogic.calculateResponseTime(activities);
      expect(avgResponseTime).toBeNull();
    });

    test('should handle empty activities array', () => {
      const avgResponseTime = BusinessLogic.calculateResponseTime([]);
      expect(avgResponseTime).toBeNull();
    });

    test('should handle activities without metadata', () => {
      const activities = [
        {
          isResponse: true
          // Missing metadata
        }
      ];

      const avgResponseTime = BusinessLogic.calculateResponseTime(activities);
      expect(avgResponseTime).toBeNull();
    });
  });

  describe('Integration with Test Data Factory', () => {
    test('should work with generated lead data', () => {
      const lead = testDataFactory.createLead();
      
      // Test that business logic functions work with generated data
      expect(typeof lead.dealValue).toBe('number');
      expect(lead.dealValue).toBeGreaterThan(0);
      
      // Calculate commission should work
      const commission = BusinessLogic.calculateCommission(lead.dealValue);
      expect(commission).toBeGreaterThan(0);
      
      // Lead scoring should work
      const score = BusinessLogic.calculateLeadScore(lead);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('should work with generated deal data', () => {
      const deal = testDataFactory.createDeal();
      
      expect(deal.stage).toBeTruthy();
      expect(deal.value).toBeGreaterThan(0);
      
      // Stage validation should work
      const canMoveToNext = BusinessLogic.validateDealStage(deal.stage, 'closed_won');
      expect(canMoveToNext).toBe(true);
    });

    test('should work with generated user data', () => {
      const user = testDataFactory.createUser();
      
      expect(user.email).toBeTruthy();
      
      // Email validation should work
      const isValidEmail = BusinessLogic.validateEmail(user.email);
      expect(isValidEmail).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle null inputs gracefully', () => {
      expect(() => BusinessLogic.calculateLeadScore(null)).not.toThrow();
      expect(() => BusinessLogic.calculateChurnRisk(null)).not.toThrow();
      expect(() => BusinessLogic.calculateSalesVelocity(null)).not.toThrow();
    });

    test('should handle undefined inputs gracefully', () => {
      expect(() => BusinessLogic.calculateLeadScore(undefined)).not.toThrow();
      expect(BusinessLogic.calculateResponseTime(undefined)).toBeNull();
    });

    test('should handle very large numbers', () => {
      const largeNumber = Number.MAX_SAFE_INTEGER;
      const commission = BusinessLogic.calculateCommission(largeNumber, 0.01);
      expect(commission).toBeGreaterThan(0);
      expect(isFinite(commission)).toBe(true);
    });

    test('should handle very small numbers', () => {
      const smallNumber = 0.01;
      const commission = BusinessLogic.calculateCommission(smallNumber, 0.05);
      expect(commission).toBeCloseTo(0.0005, 6);
    });

    test('should handle boundary values', () => {
      // Test with minimum possible deal value
      expect(BusinessLogic.calculateCommission(0.01)).toBeCloseTo(0.0005, 6);
      
      // Test with maximum score values
      const maxScoreLead = {
        companySize: '1000+',
        source: 'referral',
        dealValue: 200000,
        activities: Array.from({ length: 20 }, () => ({ type: 'call' }))
      };
      
      const score = BusinessLogic.calculateLeadScore(maxScoreLead);
      expect(score).toBe(100);
    });
  });
});