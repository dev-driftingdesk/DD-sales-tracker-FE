// Schema Validation Helper
const { Validator } = require('jsonschema');

class SchemaValidator {
  constructor() {
    this.validator = new Validator();
    this.schemas = this.defineSchemas();
    
    // Add all schemas to validator
    Object.entries(this.schemas).forEach(([name, schema]) => {
      this.validator.addSchema(schema, name);
    });
  }

  defineSchemas() {
    return {
      // Lead schemas
      lead: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          companyName: { type: 'string' },
          contactName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          location: { type: 'string' },
          source: { type: 'string', enum: ['website', 'facebook', 'email', 'referral', 'event', 'whatsapp', 'instagram'] },
          status: { type: 'string', enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'in_progress'] },
          language: { type: 'string' },
          productInterest: { type: 'string' },
          notes: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          assignedTo: { type: 'string' },
          dealValue: { type: 'number', minimum: 0 },
          closedValue: { type: ['number', 'null'] },
          closedDate: { type: ['string', 'null'] },
          createdAt: { type: 'string' },
          updatedAt: { type: 'string' },
          activities: { type: 'array', items: { $ref: '#/activity' } }
        },
        required: ['companyName', 'contactName', 'email', 'source', 'status'],
        additionalProperties: false
      },

      // Contact schemas
      contact: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          title: { type: 'string' },
          companyId: { type: 'string' },
          companyName: { type: 'string' },
          location: { type: 'string' },
          source: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          socialProfiles: {
            type: 'object',
            properties: {
              linkedin: { type: 'string' },
              twitter: { type: 'string' }
            }
          },
          createdAt: { type: 'string' },
          updatedAt: { type: 'string' }
        },
        required: ['firstName', 'lastName', 'email'],
        additionalProperties: false
      },

      // Company schemas
      company: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          industry: { type: 'string' },
          size: { type: 'string' },
          revenue: { type: 'number' },
          location: { type: 'string' },
          website: { type: 'string' },
          phone: { type: 'string' },
          description: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          createdAt: { type: 'string' },
          updatedAt: { type: 'string' }
        },
        required: ['name'],
        additionalProperties: false
      },

      // Deal schemas
      deal: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          value: { type: 'number', minimum: 0 },
          stage: { type: 'string', enum: ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] },
          probability: { type: 'number', minimum: 0, maximum: 100 },
          expectedCloseDate: { type: 'string' },
          actualCloseDate: { type: ['string', 'null'] },
          contactId: { type: 'string' },
          companyId: { type: 'string' },
          assignedTo: { type: 'string' },
          products: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                quantity: { type: 'number' },
                unitPrice: { type: 'number' }
              },
              required: ['name', 'quantity', 'unitPrice']
            }
          },
          tags: { type: 'array', items: { type: 'string' } },
          createdAt: { type: 'string' },
          updatedAt: { type: 'string' },
          activities: { type: 'array', items: { $ref: '#/activity' } }
        },
        required: ['title', 'value', 'stage'],
        additionalProperties: false
      },

      // Activity schemas
      activity: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: { type: 'string', enum: ['call', 'email', 'meeting', 'note', 'task', 'status_change', 'whatsapp', 'instagram'] },
          title: { type: 'string' },
          description: { type: 'string' },
          outcome: { type: 'string' },
          duration: { type: 'number' },
          userId: { type: 'string' },
          userName: { type: 'string' },
          isFromLead: { type: 'boolean' },
          isResponse: { type: 'boolean' },
          createdAt: { type: 'string' },
          timestamp: { type: 'string' },
          metadata: { type: 'object' }
        },
        required: ['type', 'description'],
        additionalProperties: true
      },

      // User schemas
      user: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          username: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'manager', 'sales_rep', 'viewer'] },
          department: { type: 'string' },
          phone: { type: 'string' },
          location: { type: 'string' },
          timezone: { type: 'string' },
          language: { type: 'string' },
          isActive: { type: 'boolean' },
          lastLoginAt: { type: ['string', 'null'] },
          createdAt: { type: 'string' },
          settings: { type: 'object' }
        },
        required: ['firstName', 'lastName', 'email', 'role'],
        additionalProperties: false
      },

      // Product schemas
      product: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          sku: { type: 'string' },
          price: { type: 'number', minimum: 0 },
          cost: { type: 'number', minimum: 0 },
          currency: { type: 'string' },
          unit: { type: 'string' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string' },
          updatedAt: { type: 'string' }
        },
        required: ['name', 'price', 'currency'],
        additionalProperties: false
      },

      // Analytics schemas
      analyticsMetrics: {
        type: 'object',
        properties: {
          totalLeads: { type: 'number' },
          conversionRate: { type: 'number' },
          avgResponseTime: { type: 'number' },
          totalRevenue: { type: 'number' },
          dealsPipeline: { type: 'number' },
          timeframe: { type: 'string' }
        },
        additionalProperties: true
      },

      // API response schemas
      apiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {},
          message: { type: 'string' },
          errors: { type: 'array', items: { type: 'string' } },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'number' },
              limit: { type: 'number' },
              total: { type: 'number' },
              pages: { type: 'number' }
            }
          }
        },
        required: ['success'],
        additionalProperties: false
      },

      // Error response schema
      errorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', enum: [false] },
          error: { type: 'string' },
          message: { type: 'string' },
          code: { type: 'string' },
          details: { type: 'object' }
        },
        required: ['success', 'error'],
        additionalProperties: false
      },

      // Auth schemas
      loginRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        },
        required: ['email', 'password'],
        additionalProperties: false
      },

      loginResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', enum: [true] },
          token: { type: 'string' },
          refreshToken: { type: 'string' },
          user: { $ref: '#/user' },
          expiresIn: { type: 'number' }
        },
        required: ['success', 'token', 'user'],
        additionalProperties: false
      },

      // Webhook payload schemas
      webhookPayload: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          timestamp: { type: 'string' },
          type: { type: 'string' },
          source: { type: 'string' },
          version: { type: 'string' },
          data: { type: 'object' }
        },
        required: ['id', 'timestamp', 'type', 'data'],
        additionalProperties: false
      }
    };
  }

  validate(data, schemaName) {
    const schema = this.schemas[schemaName];
    if (!schema) {
      throw new Error(`Schema '${schemaName}' not found`);
    }

    const result = this.validator.validate(data, schema);
    
    return {
      valid: result.errors.length === 0,
      errors: result.errors.map(error => ({
        property: error.property,
        message: error.message,
        value: error.instance
      }))
    };
  }

  validateApiResponse(response, expectedDataSchema = null) {
    // First validate the basic API response structure
    const responseValidation = this.validate(response.data, 'apiResponse');
    
    if (!responseValidation.valid) {
      return responseValidation;
    }

    // If a specific data schema is provided, validate the data property
    if (expectedDataSchema && response.data.data) {
      const dataValidation = this.validate(response.data.data, expectedDataSchema);
      if (!dataValidation.valid) {
        return {
          valid: false,
          errors: dataValidation.errors.map(error => ({
            ...error,
            property: `data.${error.property}`
          }))
        };
      }
    }

    return { valid: true, errors: [] };
  }

  validateErrorResponse(response) {
    return this.validate(response.data, 'errorResponse');
  }

  validateStatusCode(response, expectedStatus) {
    return {
      valid: response.status === expectedStatus,
      errors: response.status !== expectedStatus 
        ? [`Expected status ${expectedStatus}, got ${response.status}`]
        : []
    };
  }

  validateResponseTime(responseTime, maxTime = 200) {
    return {
      valid: responseTime <= maxTime,
      errors: responseTime > maxTime 
        ? [`Response time ${responseTime}ms exceeds maximum ${maxTime}ms`]
        : []
    };
  }

  validatePaginatedResponse(response, expectedSchema = null) {
    const validation = this.validateApiResponse(response);
    
    if (!validation.valid) {
      return validation;
    }

    const { data } = response.data;
    
    // Check if pagination exists
    if (!response.data.pagination) {
      return {
        valid: false,
        errors: ['Pagination information missing from paginated response']
      };
    }

    // Validate pagination structure
    const paginationValidation = this.validate(response.data.pagination, {
      type: 'object',
      properties: {
        page: { type: 'number', minimum: 1 },
        limit: { type: 'number', minimum: 1 },
        total: { type: 'number', minimum: 0 },
        pages: { type: 'number', minimum: 0 }
      },
      required: ['page', 'limit', 'total', 'pages']
    });

    if (!paginationValidation.valid) {
      return paginationValidation;
    }

    // Validate data is array
    if (!Array.isArray(data)) {
      return {
        valid: false,
        errors: ['Data should be array for paginated response']
      };
    }

    // If expected schema provided, validate each item
    if (expectedSchema) {
      for (let i = 0; i < data.length; i++) {
        const itemValidation = this.validate(data[i], expectedSchema);
        if (!itemValidation.valid) {
          return {
            valid: false,
            errors: itemValidation.errors.map(error => ({
              ...error,
              property: `data[${i}].${error.property}`
            }))
          };
        }
      }
    }

    return { valid: true, errors: [] };
  }

  // Custom validation helpers
  validateLead(data) {
    return this.validate(data, 'lead');
  }

  validateContact(data) {
    return this.validate(data, 'contact');
  }

  validateCompany(data) {
    return this.validate(data, 'company');
  }

  validateDeal(data) {
    return this.validate(data, 'deal');
  }

  validateUser(data) {
    return this.validate(data, 'user');
  }

  validateProduct(data) {
    return this.validate(data, 'product');
  }
}

module.exports = SchemaValidator;