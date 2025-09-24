// Test Data Factory - Generate realistic test data
const faker = require('faker');

// Set seed for consistent test data
faker.seed(parseInt(process.env.FAKER_SEED) || 12345);

class TestDataFactory {
  static createLead(overrides = {}) {
    return {
      id: faker.datatype.uuid(),
      companyName: faker.company.companyName(),
      contactName: faker.name.findName(),
      email: faker.internet.email(),
      phone: faker.phone.phoneNumber(),
      location: `${faker.address.city()}, ${faker.address.country()}`,
      source: faker.random.arrayElement(['website', 'facebook', 'email', 'referral', 'event']),
      status: faker.random.arrayElement(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']),
      language: faker.random.arrayElement(['english', 'arabic', 'spanish']),
      productInterest: faker.commerce.productName(),
      notes: faker.lorem.sentences(2),
      tags: faker.random.arrayElements(['high-priority', 'wholesale', 'retail', 'international'], faker.datatype.number({ min: 1, max: 3 })),
      assignedTo: `user-${faker.datatype.number({ min: 1, max: 5 })}`,
      dealValue: faker.datatype.number({ min: 1000, max: 100000 }),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      activities: this.createActivities(faker.datatype.number({ min: 1, max: 5 })),
      ...overrides
    };
  }

  static createContact(overrides = {}) {
    return {
      id: faker.datatype.uuid(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.phoneNumber(),
      title: faker.name.jobTitle(),
      companyId: faker.datatype.uuid(),
      companyName: faker.company.companyName(),
      location: `${faker.address.city()}, ${faker.address.country()}`,
      source: faker.random.arrayElement(['website', 'referral', 'event', 'cold_outreach']),
      tags: faker.random.arrayElements(['decision-maker', 'influencer', 'user'], faker.datatype.number({ min: 1, max: 2 })),
      socialProfiles: {
        linkedin: faker.internet.url(),
        twitter: `@${faker.internet.userName()}`
      },
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      ...overrides
    };
  }

  static createCompany(overrides = {}) {
    return {
      id: faker.datatype.uuid(),
      name: faker.company.companyName(),
      industry: faker.random.arrayElement(['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail']),
      size: faker.random.arrayElement(['1-10', '11-50', '51-200', '201-1000', '1000+']),
      revenue: faker.datatype.number({ min: 100000, max: 10000000 }),
      location: `${faker.address.city()}, ${faker.address.country()}`,
      website: faker.internet.url(),
      phone: faker.phone.phoneNumber(),
      description: faker.company.catchPhrase(),
      tags: faker.random.arrayElements(['enterprise', 'startup', 'mid-market'], faker.datatype.number({ min: 1, max: 2 })),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      ...overrides
    };
  }

  static createDeal(overrides = {}) {
    return {
      id: faker.datatype.uuid(),
      title: `${faker.commerce.productName()} Deal`,
      description: faker.lorem.sentences(2),
      value: faker.datatype.number({ min: 5000, max: 500000 }),
      stage: faker.random.arrayElement(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
      probability: faker.datatype.number({ min: 10, max: 100 }),
      expectedCloseDate: faker.date.future().toISOString(),
      actualCloseDate: null,
      contactId: faker.datatype.uuid(),
      companyId: faker.datatype.uuid(),
      assignedTo: `user-${faker.datatype.number({ min: 1, max: 5 })}`,
      products: [
        {
          id: faker.datatype.uuid(),
          name: faker.commerce.productName(),
          quantity: faker.datatype.number({ min: 1, max: 100 }),
          unitPrice: faker.datatype.number({ min: 50, max: 1000 })
        }
      ],
      tags: faker.random.arrayElements(['hot', 'warm', 'cold'], 1),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      activities: this.createActivities(faker.datatype.number({ min: 2, max: 8 })),
      ...overrides
    };
  }

  static createActivity(overrides = {}) {
    return {
      id: faker.datatype.uuid(),
      type: faker.random.arrayElement(['call', 'email', 'meeting', 'note', 'task']),
      title: faker.lorem.words(3),
      description: faker.lorem.sentences(1),
      outcome: faker.random.arrayElement(['positive', 'neutral', 'negative', 'no_answer']),
      duration: faker.datatype.number({ min: 5, max: 120 }), // minutes
      userId: `user-${faker.datatype.number({ min: 1, max: 5 })}`,
      userName: faker.name.findName(),
      createdAt: faker.date.recent().toISOString(),
      metadata: {
        source: 'manual',
        platform: faker.random.arrayElement(['phone', 'email', 'zoom', 'teams', 'in_person'])
      },
      ...overrides
    };
  }

  static createActivities(count) {
    return Array.from({ length: count }, () => this.createActivity());
  }

  static createUser(overrides = {}) {
    return {
      id: faker.datatype.uuid(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      username: faker.internet.userName(),
      role: faker.random.arrayElement(['admin', 'manager', 'sales_rep', 'viewer']),
      department: faker.random.arrayElement(['sales', 'marketing', 'support', 'management']),
      phone: faker.phone.phoneNumber(),
      location: `${faker.address.city()}, ${faker.address.country()}`,
      timezone: faker.random.arrayElement(['UTC', 'EST', 'PST', 'GMT+1', 'GMT+3']),
      language: faker.random.arrayElement(['en', 'es', 'ar', 'fr']),
      isActive: true,
      lastLoginAt: faker.date.recent().toISOString(),
      createdAt: faker.date.past().toISOString(),
      settings: {
        notifications: {
          email: true,
          browser: true,
          mobile: faker.datatype.boolean()
        },
        dashboard: {
          theme: faker.random.arrayElement(['light', 'dark']),
          layout: faker.random.arrayElement(['compact', 'comfortable'])
        }
      },
      ...overrides
    };
  }

  static createProduct(overrides = {}) {
    return {
      id: faker.datatype.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      category: faker.commerce.department(),
      sku: faker.random.alphaNumeric(8).toUpperCase(),
      price: parseFloat(faker.commerce.price()),
      cost: parseFloat(faker.commerce.price(10, 50)),
      currency: 'USD',
      unit: faker.random.arrayElement(['piece', 'kg', 'liter', 'box', 'pack']),
      isActive: true,
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      ...overrides
    };
  }

  static createWebhookPayload(type, overrides = {}) {
    const basePayload = {
      id: faker.datatype.uuid(),
      timestamp: new Date().toISOString(),
      type,
      source: 'test',
      version: '1.0'
    };

    const typeSpecificData = {
      lead_created: { lead: this.createLead() },
      lead_updated: { lead: this.createLead(), changes: ['status', 'notes'] },
      deal_created: { deal: this.createDeal() },
      deal_updated: { deal: this.createDeal(), changes: ['stage', 'value'] },
      contact_created: { contact: this.createContact() },
      email_received: {
        from: faker.internet.email(),
        to: faker.internet.email(),
        subject: faker.lorem.words(5),
        body: faker.lorem.paragraphs(2),
        messageId: faker.datatype.uuid()
      }
    };

    return {
      ...basePayload,
      data: typeSpecificData[type] || {},
      ...overrides
    };
  }

  // Generate bulk test data
  static generateBulkData(type, count) {
    const generators = {
      leads: () => this.createLead(),
      contacts: () => this.createContact(),
      companies: () => this.createCompany(),
      deals: () => this.createDeal(),
      users: () => this.createUser(),
      products: () => this.createProduct()
    };

    const generator = generators[type];
    if (!generator) {
      throw new Error(`Unknown data type: ${type}`);
    }

    return Array.from({ length: count }, generator);
  }

  // Create test data sets for specific scenarios
  static createSalesTeamData() {
    const manager = this.createUser({ role: 'manager', department: 'sales' });
    const salesReps = Array.from({ length: 3 }, () => 
      this.createUser({ role: 'sales_rep', department: 'sales' }));
    
    const leads = Array.from({ length: 50 }, () => 
      this.createLead({ assignedTo: faker.random.arrayElement(salesReps).id }));
    
    const deals = Array.from({ length: 20 }, () => 
      this.createDeal({ assignedTo: faker.random.arrayElement(salesReps).id }));

    return {
      users: [manager, ...salesReps],
      leads,
      deals,
      companies: Array.from({ length: 30 }, () => this.createCompany()),
      contacts: Array.from({ length: 75 }, () => this.createContact())
    };
  }

  static createPerformanceTestData() {
    return {
      leads: this.generateBulkData('leads', 1000),
      contacts: this.generateBulkData('contacts', 2000),
      companies: this.generateBulkData('companies', 500),
      deals: this.generateBulkData('deals', 300),
      users: this.generateBulkData('users', 50)
    };
  }
}

module.exports = TestDataFactory;