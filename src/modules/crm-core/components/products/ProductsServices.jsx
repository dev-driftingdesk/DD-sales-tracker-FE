import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, Filter, Eye, Edit, Trash2, Tag, DollarSign, BarChart3 } from 'lucide-react';
import useCRMStore from '../../stores/crmStore';

export default function ProductsServices() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');  // New state for category tabs
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const { 
    products, 
    productCategories,
    addProduct, 
    updateProduct, 
    deleteProduct,
    getFilteredProducts,
    getProductStatistics 
  } = useCRMStore();
  
  const store = useCRMStore.getState;

  // Clear all products function
  const clearAllProducts = () => {
    if (window.confirm('This will delete all products. Are you sure?')) {
      products.forEach(product => deleteProduct(product.id));
    }
  };

  const resetAllData = () => {
    if (window.confirm('This will clear ALL data and reload fresh demo data. Are you sure?')) {
      // Clear localStorage
      localStorage.clear();
      // Reload the page
      window.location.reload();
    }
  };

  const loadAdditionalProducts = () => {
    // Additional Products that should be available
    const additionalProducts = [
      {
        name: 'Professional Web Hosting',
        sku: 'PWH-001',
        description: 'High-performance web hosting with SSD storage, 99.9% uptime guarantee, and 24/7 technical support. Perfect for business websites and e-commerce stores.',
        category: 'additional-products',
        price: 12.99,
        status: 'active',
        features: ['50GB SSD Storage', '99.9% Uptime', 'Free SSL Certificate', '24/7 Support', 'Daily Backups', 'CDN Integration']
      },
      {
        name: 'Premium Logo Design',
        sku: 'PLD-002',
        description: 'Professional logo design service with multiple concepts, unlimited revisions, and complete brand package including business cards and letterhead designs.',
        category: 'additional-products',
        price: 299.00,
        status: 'active',
        features: ['3 Logo Concepts', 'Unlimited Revisions', 'Vector Files', 'Business Card Design', 'Letterhead Design', '30-Day Support']
      },
      {
        name: 'Domain Registration & Management',
        sku: 'DRM-003',
        description: 'Complete domain registration and management service with DNS management, domain forwarding, and privacy protection included.',
        category: 'additional-products',
        price: 14.99,
        status: 'active',
        features: ['Domain Registration', 'DNS Management', 'Domain Forwarding', 'Privacy Protection', 'Email Forwarding', 'Auto-Renewal']
      },
      {
        name: 'Website Security Suite',
        sku: 'WSS-004',
        description: 'Comprehensive website security solution with malware scanning, firewall protection, SSL certificates, and daily security monitoring.',
        category: 'additional-products',
        price: 19.99,
        status: 'active',
        features: ['Malware Scanning', 'Firewall Protection', 'SSL Certificate', 'Daily Monitoring', 'Automatic Cleanup', 'Security Reports']
      },
      {
        name: 'Professional Email Service',
        sku: 'PES-005',
        description: 'Business-grade email hosting with custom domain, 25GB storage per mailbox, mobile sync, and advanced spam protection.',
        category: 'additional-products',
        price: 6.99,
        status: 'active',
        features: ['Custom Domain Email', '25GB Storage', 'Mobile Sync', 'Spam Protection', 'Calendar Integration', 'Webmail Access']
      },
      {
        name: 'Content Writing Service',
        sku: 'CWS-006',
        description: 'Professional content writing service for websites, blogs, and marketing materials. SEO-optimized content written by experienced copywriters.',
        category: 'additional-products',
        price: 89.00,
        status: 'active',
        features: ['SEO-Optimized Content', 'Professional Writers', 'Unlimited Revisions', 'Quick Turnaround', 'Content Strategy', 'Plagiarism-Free']
      },
      {
        name: 'Social Media Management',
        sku: 'SMM-007',
        description: 'Complete social media management service including content creation, posting schedule, engagement management, and monthly analytics reports.',
        category: 'additional-products',
        price: 299.00,
        status: 'active',
        features: ['Content Creation', 'Daily Posting', 'Engagement Management', 'Analytics Reports', 'Hashtag Research', 'Competitor Analysis']
      },
      {
        name: 'SEO Optimization Service',
        sku: 'SOS-008',
        description: 'Comprehensive SEO service including keyword research, on-page optimization, technical SEO, and monthly performance reports to boost search rankings.',
        category: 'additional-products',
        price: 399.00,
        status: 'active',
        features: ['Keyword Research', 'On-Page Optimization', 'Technical SEO', 'Link Building', 'Monthly Reports', 'Competitor Analysis']
      }
    ];

    // Check which additional products are missing and add them
    let addedCount = 0;
    additionalProducts.forEach(newProduct => {
      const existingProduct = products.find(p => p.sku === newProduct.sku);
      if (!existingProduct) {
        addProduct(newProduct);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      alert(`✅ Added ${addedCount} additional products!\n\nThe additional products dropdown should now be populated with:\n- Web Hosting\n- Logo Design\n- Domain Registration\n- Website Security\n- Professional Email\n- Content Writing\n- Social Media Management\n- SEO Optimization`);
    } else {
      alert('✅ All additional products are already loaded!\n\nCheck the Lead Details page - the Additional Product dropdown should be populated.');
    }
  };

  const stats = getProductStatistics();

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get products count by category
  const getCategoryCount = (categoryId) => {
    if (categoryId === 'all') return products.length;
    return products.filter(p => p.category === categoryId).length;
  };

  const handleAddProduct = (productData) => {
    addProduct(productData);
    setShowAddForm(false);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowDetail(true);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(productId);
    }
  };

  const loadDemoData = () => {
    // Clear existing products first
    products.forEach(product => deleteProduct(product.id));
    
    const demoProducts = [
      {
        name: 'SalesForce Pro',
        sku: 'SF-PRO-001',
        description: 'Complete CRM solution with advanced sales automation, lead management, and customer insights. Perfect for growing sales teams.',
        category: 'crm-sales',
        price: 29.00, // Starting price
        status: 'active',
        features: ['Lead Management', 'Sales Pipeline', 'Email Integration', 'Reporting Dashboard', 'Mobile App'],
        upsellingProducts: [], // Will be populated after other products are created
        subscriptionPlans: [
          {
            id: 'starter-monthly',
            name: 'Starter',
            price: 29,
            billingCycle: 'monthly',
            userLimit: 5,
            features: ['Basic CRM', 'Email Integration', 'Mobile App', '1GB Storage']
          },
          {
            id: 'starter-annual',
            name: 'Starter',
            price: 290,
            billingCycle: 'annual',
            userLimit: 5,
            monthlyEquivalent: 24.17,
            discount: '17% off',
            features: ['Basic CRM', 'Email Integration', 'Mobile App', '1GB Storage']
          },
          {
            id: 'professional-monthly',
            name: 'Professional',
            price: 79,
            billingCycle: 'monthly',
            userLimit: 25,
            features: ['Advanced CRM', 'Sales Automation', 'Custom Reports', '10GB Storage', 'API Access']
          },
          {
            id: 'professional-annual',
            name: 'Professional',
            price: 790,
            billingCycle: 'annual',
            userLimit: 25,
            monthlyEquivalent: 65.83,
            discount: '17% off',
            features: ['Advanced CRM', 'Sales Automation', 'Custom Reports', '10GB Storage', 'API Access']
          },
          {
            id: 'enterprise-monthly',
            name: 'Enterprise',
            price: 199,
            billingCycle: 'monthly',
            userLimit: 'unlimited',
            features: ['Full CRM Suite', 'Advanced Analytics', 'Custom Integrations', 'Unlimited Storage', 'Priority Support']
          },
          {
            id: 'enterprise-annual',
            name: 'Enterprise',
            price: 1990,
            billingCycle: 'annual',
            userLimit: 'unlimited',
            monthlyEquivalent: 165.83,
            discount: '17% off',
            features: ['Full CRM Suite', 'Advanced Analytics', 'Custom Integrations', 'Unlimited Storage', 'Priority Support']
          }
        ]
      },
      {
        name: 'MarketingHub 360',
        sku: 'MH-360-002',
        description: 'All-in-one marketing automation platform with email campaigns, social media management, and lead nurturing capabilities.',
        category: 'marketing',
        price: 49.00,
        status: 'active',
        features: ['Email Marketing', 'Social Media Management', 'Landing Pages', 'A/B Testing', 'Lead Scoring'],
        upsellingProducts: [],
        subscriptionPlans: [
          {
            id: 'basic-monthly',
            name: 'Basic',
            price: 49,
            billingCycle: 'monthly',
            userLimit: 3,
            features: ['Email Campaigns', 'Basic Templates', '1,000 Contacts', 'Basic Analytics']
          },
          {
            id: 'basic-annual',
            name: 'Basic',
            price: 490,
            billingCycle: 'annual',
            userLimit: 3,
            monthlyEquivalent: 40.83,
            discount: '17% off',
            features: ['Email Campaigns', 'Basic Templates', '1,000 Contacts', 'Basic Analytics']
          },
          {
            id: 'growth-monthly',
            name: 'Growth',
            price: 99,
            billingCycle: 'monthly',
            userLimit: 10,
            features: ['Advanced Automation', 'A/B Testing', '10,000 Contacts', 'Social Media Tools', 'Landing Pages']
          },
          {
            id: 'growth-annual',
            name: 'Growth',
            price: 990,
            billingCycle: 'annual',
            userLimit: 10,
            monthlyEquivalent: 82.50,
            discount: '17% off',
            features: ['Advanced Automation', 'A/B Testing', '10,000 Contacts', 'Social Media Tools', 'Landing Pages']
          },
          {
            id: 'scale-monthly',
            name: 'Scale',
            price: 299,
            billingCycle: 'monthly',
            userLimit: 'unlimited',
            features: ['Full Marketing Suite', 'Advanced Segmentation', 'Unlimited Contacts', 'Custom Integrations', 'Dedicated Support']
          },
          {
            id: 'scale-annual',
            name: 'Scale',
            price: 2990,
            billingCycle: 'annual',
            userLimit: 'unlimited',
            monthlyEquivalent: 249.17,
            discount: '17% off',
            features: ['Full Marketing Suite', 'Advanced Segmentation', 'Unlimited Contacts', 'Custom Integrations', 'Dedicated Support']
          }
        ]
      },
      {
        name: 'DataInsight Analytics',
        sku: 'DIA-003',
        description: 'Business intelligence platform with real-time dashboards, predictive analytics, and custom reporting for data-driven decisions.',
        category: 'analytics',
        price: 79.00,
        status: 'active',
        features: ['Real-time Dashboards', 'Predictive Analytics', 'Custom Reports', 'Data Visualization', 'API Integrations'],
        upsellingProducts: [],
        subscriptionPlans: [
          {
            id: 'essential-monthly',
            name: 'Essential',
            price: 79,
            billingCycle: 'monthly',
            userLimit: 5,
            features: ['Basic Dashboards', 'Standard Reports', '5 Data Sources', '100GB Data Storage']
          },
          {
            id: 'essential-annual',
            name: 'Essential',
            price: 790,
            billingCycle: 'annual',
            userLimit: 5,
            monthlyEquivalent: 65.83,
            discount: '17% off',
            features: ['Basic Dashboards', 'Standard Reports', '5 Data Sources', '100GB Data Storage']
          },
          {
            id: 'professional-monthly',
            name: 'Professional',
            price: 149,
            billingCycle: 'monthly',
            userLimit: 15,
            features: ['Advanced Analytics', 'Custom Dashboards', '20 Data Sources', '500GB Storage', 'Predictive Models']
          },
          {
            id: 'professional-annual',
            name: 'Professional',
            price: 1490,
            billingCycle: 'annual',
            userLimit: 15,
            monthlyEquivalent: 124.17,
            discount: '17% off',
            features: ['Advanced Analytics', 'Custom Dashboards', '20 Data Sources', '500GB Storage', 'Predictive Models']
          },
          {
            id: 'enterprise-monthly',
            name: 'Enterprise',
            price: 399,
            billingCycle: 'monthly',
            userLimit: 'unlimited',
            features: ['Full BI Suite', 'AI-Powered Insights', 'Unlimited Data Sources', 'Unlimited Storage', 'White-label Options']
          },
          {
            id: 'enterprise-annual',
            name: 'Enterprise',
            price: 3990,
            billingCycle: 'annual',
            userLimit: 'unlimited',
            monthlyEquivalent: 332.50,
            discount: '17% off',
            features: ['Full BI Suite', 'AI-Powered Insights', 'Unlimited Data Sources', 'Unlimited Storage', 'White-label Options']
          }
        ]
      },
      {
        name: 'TeamSync Collaboration',
        sku: 'TS-COL-004',
        description: 'Project management and team collaboration platform with task tracking, file sharing, and team communication tools.',
        category: 'productivity',
        price: 29.00,
        status: 'active',
        features: ['Project Management', 'Task Tracking', 'File Sharing', 'Team Chat', 'Time Tracking'],
        upsellingProducts: [],
        subscriptionPlans: [
          {
            id: 'team-monthly',
            name: 'Team',
            price: 29,
            billingCycle: 'monthly',
            userLimit: 10,
            features: ['Basic Project Management', 'Task Boards', 'File Storage (10GB)', 'Team Chat']
          },
          {
            id: 'team-annual',
            name: 'Team',
            price: 290,
            billingCycle: 'annual',
            userLimit: 10,
            monthlyEquivalent: 24.17,
            discount: '17% off',
            features: ['Basic Project Management', 'Task Boards', 'File Storage (10GB)', 'Team Chat']
          },
          {
            id: 'business-monthly',
            name: 'Business',
            price: 59,
            billingCycle: 'monthly',
            userLimit: 50,
            features: ['Advanced Project Tools', 'Time Tracking', 'Custom Fields', 'File Storage (100GB)', 'Reporting']
          },
          {
            id: 'business-annual',
            name: 'Business',
            price: 590,
            billingCycle: 'annual',
            userLimit: 50,
            monthlyEquivalent: 49.17,
            discount: '17% off',
            features: ['Advanced Project Tools', 'Time Tracking', 'Custom Fields', 'File Storage (100GB)', 'Reporting']
          }
        ]
      },
      {
        name: 'SecureCloud Suite',
        sku: 'SCS-005',
        description: 'Comprehensive cybersecurity platform with threat detection, data encryption, and compliance management for enterprises.',
        category: 'security',
        price: 99.00,
        status: 'active',
        features: ['Threat Detection', 'Data Encryption', 'Compliance Tools', 'Security Monitoring', '24/7 Support'],
        upsellingProducts: [],
        subscriptionPlans: [
          {
            id: 'standard-monthly',
            name: 'Standard',
            price: 99,
            billingCycle: 'monthly',
            userLimit: 25,
            features: ['Basic Security Monitoring', 'Standard Encryption', 'Compliance Reports', 'Email Support']
          },
          {
            id: 'standard-annual',
            name: 'Standard',
            price: 990,
            billingCycle: 'annual',
            userLimit: 25,
            monthlyEquivalent: 82.50,
            discount: '17% off',
            features: ['Basic Security Monitoring', 'Standard Encryption', 'Compliance Reports', 'Email Support']
          },
          {
            id: 'advanced-monthly',
            name: 'Advanced',
            price: 199,
            billingCycle: 'monthly',
            userLimit: 100,
            features: ['Advanced Threat Detection', 'Multi-layer Encryption', 'Real-time Monitoring', 'Incident Response']
          },
          {
            id: 'advanced-annual',
            name: 'Advanced',
            price: 1990,
            billingCycle: 'annual',
            userLimit: 100,
            monthlyEquivalent: 165.83,
            discount: '17% off',
            features: ['Advanced Threat Detection', 'Multi-layer Encryption', 'Real-time Monitoring', 'Incident Response']
          }
        ]
      },
      {
        name: 'Digital Transformation Advisory',
        sku: 'DTA-008',
        description: 'Strategic consulting services for digital transformation, technology roadmapping, and organizational change management.',
        category: 'consulting',
        price: 2500.00,
        status: 'active',
        features: ['Strategic Planning', 'Technology Assessment', 'Change Management', 'Training Programs', 'Ongoing Support'],
        upsellingProducts: [],
        subscriptionPlans: [
          {
            id: 'assessment',
            name: 'Assessment Package',
            price: 2500,
            billingCycle: 'one-time',
            userLimit: 'unlimited',
            features: ['Technology Audit', 'Strategic Roadmap', 'Implementation Plan', '30-day Support']
          },
          {
            id: 'implementation-monthly',
            name: 'Implementation Support',
            price: 7500,
            billingCycle: 'monthly',
            userLimit: 'unlimited',
            features: ['Project Management', 'Technical Implementation', 'Change Management', 'Training', 'Weekly Reviews']
          },
          {
            id: 'implementation-annual',
            name: 'Implementation Support',
            price: 75000,
            billingCycle: 'annual',
            userLimit: 'unlimited',
            monthlyEquivalent: 6250,
            discount: '17% off',
            features: ['Project Management', 'Technical Implementation', 'Change Management', 'Training', 'Weekly Reviews']
          }
        ]
      },
      // New set of products with different categories and relationships
      {
        name: 'CloudHost Pro',
        sku: 'CHP-001',
        description: 'Scalable cloud hosting solution with enterprise-grade infrastructure, automated backups, and 99.9% uptime guarantee.',
        category: 'integration',
        price: 49.00,
        status: 'active',
        features: ['SSD Storage', 'Auto Scaling', 'Daily Backups', 'CDN Integration', '24/7 Support'],
        upsellingProducts: [],
        subscriptionPlans: [
          {
            id: 'starter-monthly',
            name: 'Starter',
            price: 49,
            billingCycle: 'monthly',
            userLimit: 1,
            features: ['10GB SSD', '100GB Bandwidth', '1 Domain', 'Basic Support']
          },
          {
            id: 'business-monthly',
            name: 'Business',
            price: 99,
            billingCycle: 'monthly',
            userLimit: 5,
            features: ['50GB SSD', '500GB Bandwidth', '5 Domains', 'Priority Support', 'SSL Certificates']
          },
          {
            id: 'enterprise-monthly',
            name: 'Enterprise',
            price: 199,
            billingCycle: 'monthly',
            userLimit: 'unlimited',
            features: ['200GB SSD', 'Unlimited Bandwidth', 'Unlimited Domains', '24/7 Phone Support', 'Dedicated IP']
          }
        ]
      },
      {
        name: 'SSL Guardian',
        sku: 'SSL-002',
        description: 'Advanced SSL certificate management with wildcard support, automatic renewal, and comprehensive security monitoring.',
        category: 'security',
        price: 19.00,
        status: 'active',
        features: ['Wildcard SSL', 'Auto Renewal', 'Security Monitoring', 'Multiple Domains', 'Malware Scanning'],
        upsellingProducts: [],
        subscriptionPlans: [
          {
            id: 'basic-monthly',
            name: 'Basic SSL',
            price: 19,
            billingCycle: 'monthly',
            userLimit: 1,
            features: ['Single Domain SSL', 'Auto Renewal', 'Basic Support']
          },
          {
            id: 'wildcard-monthly',
            name: 'Wildcard SSL',
            price: 49,
            billingCycle: 'monthly',
            userLimit: 1,
            features: ['Wildcard SSL', 'Unlimited Subdomains', 'Auto Renewal', 'Priority Support']
          }
        ]
      },
      {
        name: 'BackupVault 360',
        sku: 'BV-003',
        description: 'Comprehensive backup solution with incremental backups, version control, and instant recovery capabilities.',
        category: 'security',
        price: 29.00,
        status: 'active',
        features: ['Incremental Backups', 'Version Control', 'Instant Recovery', 'Cross-Platform', 'Encryption'],
        upsellingProducts: [],
        subscriptionPlans: [
          {
            id: 'personal-monthly',
            name: 'Personal',
            price: 29,
            billingCycle: 'monthly',
            userLimit: 1,
            features: ['100GB Storage', 'Daily Backups', 'Basic Encryption', 'Email Support']
          },
          {
            id: 'business-monthly',
            name: 'Business',
            price: 79,
            billingCycle: 'monthly',
            userLimit: 10,
            features: ['1TB Storage', 'Hourly Backups', 'Advanced Encryption', 'Team Management', 'Priority Support']
          }
        ]
      },
      {
        name: 'MonitorMax',
        sku: 'MM-004',
        description: 'Real-time website and server monitoring with uptime tracking, performance analytics, and instant alerts.',
        category: 'analytics',
        price: 39.00,
        status: 'active',
        features: ['Uptime Monitoring', 'Performance Analytics', 'Instant Alerts', 'Global Locations', 'API Monitoring'],
        upsellingProducts: [],
        subscriptionPlans: [
          {
            id: 'startup-monthly',
            name: 'Startup',
            price: 39,
            billingCycle: 'monthly',
            userLimit: 3,
            features: ['5 Monitors', '1-min Checks', 'Email Alerts', 'Basic Reports']
          },
          {
            id: 'growth-monthly',
            name: 'Growth',
            price: 89,
            billingCycle: 'monthly',
            userLimit: 10,
            features: ['25 Monitors', '30-sec Checks', 'SMS Alerts', 'Advanced Reports', 'API Access']
          }
        ]
      },
      {
        name: 'DevOps Toolkit',
        sku: 'DOT-005',
        description: 'Complete DevOps automation suite with CI/CD pipelines, containerization, and deployment management.',
        category: 'productivity',
        price: 149.00,
        status: 'active',
        features: ['CI/CD Pipelines', 'Container Management', 'Auto Deployment', 'Code Quality Checks', 'Team Collaboration'],
        upsellingProducts: [],
        subscriptionPlans: [
          {
            id: 'team-monthly',
            name: 'Team',
            price: 149,
            billingCycle: 'monthly',
            userLimit: 10,
            features: ['10 Projects', 'Basic Pipelines', 'Docker Support', 'Email Support']
          },
          {
            id: 'enterprise-monthly',
            name: 'Enterprise',
            price: 299,
            billingCycle: 'monthly',
            userLimit: 'unlimited',
            features: ['Unlimited Projects', 'Advanced Pipelines', 'Kubernetes Support', 'Priority Support', 'Custom Integrations']
          }
        ]
      },
      {
        name: 'E-commerce Accelerator',
        sku: 'ECA-006',
        description: 'Complete e-commerce platform with payment processing, inventory management, and marketing automation.',
        category: 'crm-sales',
        price: 99.00,
        status: 'active',
        features: ['Payment Processing', 'Inventory Management', 'Order Tracking', 'Marketing Tools', 'Analytics Dashboard'],
        upsellingProducts: [],
        subscriptionPlans: [
          {
            id: 'starter-monthly',
            name: 'Starter',
            price: 99,
            billingCycle: 'monthly',
            userLimit: 1,
            features: ['100 Products', 'Basic Themes', 'Payment Gateway', 'Email Support']
          },
          {
            id: 'professional-monthly',
            name: 'Professional',
            price: 199,
            billingCycle: 'monthly',
            userLimit: 5,
            features: ['1000 Products', 'Premium Themes', 'Multi-Currency', 'Marketing Automation', 'Priority Support']
          }
        ]
      },
      {
        name: 'Mobile App Builder',
        sku: 'MAB-007',
        description: 'No-code mobile app development platform with drag-and-drop interface and cross-platform deployment.',
        category: 'productivity',
        price: 79.00,
        status: 'active',
        features: ['Drag & Drop Builder', 'Cross-Platform', 'App Store Deployment', 'Push Notifications', 'Analytics'],
        upsellingProducts: [],
        subscriptionPlans: [
          {
            id: 'basic-monthly',
            name: 'Basic',
            price: 79,
            billingCycle: 'monthly',
            userLimit: 1,
            features: ['2 Apps', 'Basic Templates', 'App Store Publishing', 'Email Support']
          },
          {
            id: 'pro-monthly',
            name: 'Pro',
            price: 149,
            billingCycle: 'monthly',
            userLimit: 3,
            features: ['10 Apps', 'Premium Templates', 'Custom Branding', 'Push Notifications', 'Priority Support']
          }
        ]
      },
      {
        name: 'API Gateway Pro',
        sku: 'AGP-008',
        description: 'Enterprise API management platform with rate limiting, authentication, and comprehensive analytics.',
        category: 'integration',
        price: 89.00,
        status: 'active',
        features: ['Rate Limiting', 'API Authentication', 'Request Analytics', 'Load Balancing', 'Developer Portal'],
        upsellingProducts: [],
        subscriptionPlans: [
          {
            id: 'developer-monthly',
            name: 'Developer',
            price: 89,
            billingCycle: 'monthly',
            userLimit: 3,
            features: ['10 APIs', '100K Requests/month', 'Basic Analytics', 'Email Support']
          },
          {
            id: 'business-monthly',
            name: 'Business',
            price: 189,
            billingCycle: 'monthly',
            userLimit: 10,
            features: ['50 APIs', '1M Requests/month', 'Advanced Analytics', 'Custom Domains', 'Priority Support']
          }
        ]
      },
      
      // Additional Products Category
      {
        name: 'Professional Web Hosting',
        sku: 'PWH-001',
        description: 'High-performance web hosting with SSD storage, 99.9% uptime guarantee, and 24/7 technical support. Perfect for business websites and e-commerce stores.',
        category: 'additional-products',
        price: 12.99,
        status: 'active',
        features: ['50GB SSD Storage', '99.9% Uptime', 'Free SSL Certificate', '24/7 Support', 'Daily Backups', 'CDN Integration'],
        subscriptionPlans: [
          {
            id: 'basic-monthly',
            name: 'Basic',
            price: 12.99,
            billingCycle: 'monthly',
            features: ['50GB SSD Storage', '1 Website', 'Free SSL', 'Basic Support']
          },
          {
            id: 'business-monthly',
            name: 'Business',
            price: 24.99,
            billingCycle: 'monthly',
            features: ['200GB SSD Storage', '10 Websites', 'Free SSL', 'Priority Support', 'Daily Backups']
          },
          {
            id: 'enterprise-monthly',
            name: 'Enterprise',
            price: 49.99,
            billingCycle: 'monthly',
            features: ['500GB SSD Storage', 'Unlimited Websites', 'Free SSL', '24/7 Phone Support', 'CDN', 'Advanced Security']
          }
        ]
      },
      {
        name: 'Premium Logo Design',
        sku: 'PLD-002',
        description: 'Professional logo design service with multiple concepts, unlimited revisions, and complete brand package including business cards and letterhead designs.',
        category: 'additional-products',
        price: 299.00,
        status: 'active',
        features: ['3 Logo Concepts', 'Unlimited Revisions', 'Vector Files', 'Business Card Design', 'Letterhead Design', '30-Day Support'],
        subscriptionPlans: [
          {
            id: 'basic-package',
            name: 'Basic Package',
            price: 299,
            billingCycle: 'one-time',
            features: ['3 Logo Concepts', '3 Revisions', 'PNG & JPG Files', 'Basic Support']
          },
          {
            id: 'premium-package',
            name: 'Premium Package',
            price: 499,
            billingCycle: 'one-time',
            features: ['5 Logo Concepts', 'Unlimited Revisions', 'All File Formats', 'Business Card Design', 'Letterhead Design', 'Priority Support']
          },
          {
            id: 'complete-brand',
            name: 'Complete Brand Package',
            price: 799,
            billingCycle: 'one-time',
            features: ['10 Logo Concepts', 'Unlimited Revisions', 'Complete Brand Guidelines', 'Business Stationery', 'Social Media Kit', 'Dedicated Designer']
          }
        ]
      },
      {
        name: 'Domain Registration & Management',
        sku: 'DRM-003',
        description: 'Complete domain registration and management service with DNS management, domain forwarding, and privacy protection included.',
        category: 'additional-products',
        price: 14.99,
        status: 'active',
        features: ['Domain Registration', 'DNS Management', 'Domain Forwarding', 'Privacy Protection', 'Email Forwarding', 'Auto-Renewal'],
        subscriptionPlans: [
          {
            id: 'standard-annual',
            name: 'Standard',
            price: 14.99,
            billingCycle: 'annual',
            features: ['1 Domain Registration', 'Basic DNS', 'Email Forwarding', 'Standard Support']
          },
          {
            id: 'premium-annual',
            name: 'Premium',
            price: 24.99,
            billingCycle: 'annual',
            features: ['1 Domain Registration', 'Advanced DNS', 'Privacy Protection', 'Domain Forwarding', 'Priority Support']
          }
        ]
      },
      {
        name: 'Website Security Suite',
        sku: 'WSS-004',
        description: 'Comprehensive website security solution with malware scanning, firewall protection, SSL certificates, and daily security monitoring.',
        category: 'additional-products',
        price: 19.99,
        status: 'active',
        features: ['Malware Scanning', 'Firewall Protection', 'SSL Certificate', 'Daily Monitoring', 'Automatic Cleanup', 'Security Reports'],
        subscriptionPlans: [
          {
            id: 'essential-monthly',
            name: 'Essential',
            price: 19.99,
            billingCycle: 'monthly',
            features: ['Basic Malware Scan', 'SSL Certificate', 'Weekly Reports', 'Email Support']
          },
          {
            id: 'advanced-monthly',
            name: 'Advanced',
            price: 39.99,
            billingCycle: 'monthly',
            features: ['Advanced Malware Protection', 'Firewall', 'Daily Monitoring', 'Automatic Cleanup', 'Priority Support']
          }
        ]
      },
      {
        name: 'Professional Email Service',
        sku: 'PES-005',
        description: 'Business-grade email hosting with custom domain, 25GB storage per mailbox, mobile sync, and advanced spam protection.',
        category: 'additional-products',
        price: 6.99,
        status: 'active',
        features: ['Custom Domain Email', '25GB Storage', 'Mobile Sync', 'Spam Protection', 'Calendar Integration', 'Webmail Access'],
        subscriptionPlans: [
          {
            id: 'starter-monthly',
            name: 'Starter',
            price: 6.99,
            billingCycle: 'monthly',
            features: ['5 Email Accounts', '25GB per Mailbox', 'Webmail Access', 'Basic Support']
          },
          {
            id: 'business-monthly',
            name: 'Business',
            price: 12.99,
            billingCycle: 'monthly',
            features: ['25 Email Accounts', '50GB per Mailbox', 'Mobile Sync', 'Calendar', 'Priority Support']
          }
        ]
      },
      {
        name: 'Content Writing Service',
        sku: 'CWS-006',
        description: 'Professional content writing service for websites, blogs, and marketing materials. SEO-optimized content written by experienced copywriters.',
        category: 'additional-products',
        price: 89.00,
        status: 'active',
        features: ['SEO-Optimized Content', 'Professional Writers', 'Unlimited Revisions', 'Quick Turnaround', 'Content Strategy', 'Plagiarism-Free'],
        subscriptionPlans: [
          {
            id: 'basic-package',
            name: 'Basic Package',
            price: 89,
            billingCycle: 'per-project',
            features: ['1,000 Words', '1 Revision', 'SEO Basic', '5-Day Delivery']
          },
          {
            id: 'premium-package',
            name: 'Premium Package',
            price: 199,
            billingCycle: 'per-project',
            features: ['2,500 Words', 'Unlimited Revisions', 'Advanced SEO', '3-Day Delivery', 'Content Strategy']
          },
          {
            id: 'monthly-retainer',
            name: 'Monthly Retainer',
            price: 499,
            billingCycle: 'monthly',
            features: ['10,000 Words/month', 'Unlimited Revisions', 'Content Calendar', 'Dedicated Writer', 'Priority Support']
          }
        ]
      },
      {
        name: 'Social Media Management',
        sku: 'SMM-007',
        description: 'Complete social media management service including content creation, posting schedule, engagement management, and monthly analytics reports.',
        category: 'additional-products',
        price: 299.00,
        status: 'active',
        features: ['Content Creation', 'Daily Posting', 'Engagement Management', 'Analytics Reports', 'Hashtag Research', 'Competitor Analysis'],
        subscriptionPlans: [
          {
            id: 'starter-monthly',
            name: 'Starter',
            price: 299,
            billingCycle: 'monthly',
            features: ['2 Social Platforms', '15 Posts/month', 'Basic Analytics', 'Email Support']
          },
          {
            id: 'growth-monthly',
            name: 'Growth',
            price: 599,
            billingCycle: 'monthly',
            features: ['4 Social Platforms', '30 Posts/month', 'Engagement Management', 'Detailed Analytics', 'Priority Support']
          },
          {
            id: 'enterprise-monthly',
            name: 'Enterprise',
            price: 999,
            billingCycle: 'monthly',
            features: ['6 Social Platforms', '60 Posts/month', 'Full Management', 'Custom Reports', 'Dedicated Manager']
          }
        ]
      },
      {
        name: 'SEO Optimization Service',
        sku: 'SOS-008',
        description: 'Comprehensive SEO service including keyword research, on-page optimization, technical SEO, and monthly performance reports to boost search rankings.',
        category: 'additional-products',
        price: 399.00,
        status: 'active',
        features: ['Keyword Research', 'On-Page Optimization', 'Technical SEO', 'Link Building', 'Monthly Reports', 'Competitor Analysis'],
        subscriptionPlans: [
          {
            id: 'local-monthly',
            name: 'Local SEO',
            price: 399,
            billingCycle: 'monthly',
            features: ['Local Keywords', 'Google My Business', 'Local Citations', 'Monthly Reports']
          },
          {
            id: 'national-monthly',
            name: 'National SEO',
            price: 799,
            billingCycle: 'monthly',
            features: ['National Keywords', 'Advanced On-Page', 'Link Building', 'Technical SEO', 'Bi-weekly Reports']
          },
          {
            id: 'enterprise-monthly',
            name: 'Enterprise SEO',
            price: 1499,
            billingCycle: 'monthly',
            features: ['Large-Scale SEO', 'Custom Strategy', 'Dedicated Team', 'Weekly Reports', 'Priority Support']
          }
        ]
      }
    ];

    // Add products with a small delay to ensure UI updates
    setTimeout(() => {
      // First, add all products without upselling relationships
      const addedProducts = [];
      console.log('Loading demo products:', demoProducts.length, 'products');
      demoProducts.forEach(product => {
        console.log('Adding product:', product.name, product.sku);
        const addedProduct = addProduct(product);
        addedProducts.push(addedProduct);
      });
      
      // Then create logical upselling relationships
      setTimeout(() => {
        const currentProducts = store().products;
        console.log('Total products after loading:', currentProducts.length);
        console.log('Product SKUs:', currentProducts.map(p => p.sku));
        
        // Original products
        const salesForce = currentProducts.find(p => p.sku === 'SF-PRO-001');
        const marketingHub = currentProducts.find(p => p.sku === 'MH-360-002');
        const dataInsight = currentProducts.find(p => p.sku === 'DIA-003');
        const teamSync = currentProducts.find(p => p.sku === 'TS-COL-004');
        const secureCloud = currentProducts.find(p => p.sku === 'SCS-005');
        const consulting = currentProducts.find(p => p.sku === 'DTA-008');
        
        // New products
        const cloudHost = currentProducts.find(p => p.sku === 'CHP-001');
        const sslGuardian = currentProducts.find(p => p.sku === 'SSL-002');
        const backupVault = currentProducts.find(p => p.sku === 'BV-003');
        const monitorMax = currentProducts.find(p => p.sku === 'MM-004');
        const devOpsToolkit = currentProducts.find(p => p.sku === 'DOT-005');
        const ecommerceAccelerator = currentProducts.find(p => p.sku === 'ECA-006');
        const mobileAppBuilder = currentProducts.find(p => p.sku === 'MAB-007');
        const apiGateway = currentProducts.find(p => p.sku === 'AGP-008');
        
        console.log('Found products:');
        console.log('CloudHost:', cloudHost?.name);
        console.log('E-commerce:', ecommerceAccelerator?.name);
        console.log('DevOps:', devOpsToolkit?.name);
        
        // Create strategic upselling relationships for original products
        if (salesForce && marketingHub && dataInsight) {
          // SalesForce Pro → Marketing, Analytics, E-commerce
          updateProduct(salesForce.id, {
            upsellingProducts: [marketingHub.id, dataInsight.id, ecommerceAccelerator?.id].filter(Boolean)
          });
          
          // MarketingHub → CRM, Analytics, Mobile App Builder
          updateProduct(marketingHub.id, {
            upsellingProducts: [salesForce.id, dataInsight.id, mobileAppBuilder?.id].filter(Boolean)
          });
          
          // DataInsight → CRM, Marketing, Monitoring
          updateProduct(dataInsight.id, {
            upsellingProducts: [salesForce.id, marketingHub.id, monitorMax?.id].filter(Boolean)
          });
        }
        
        // Create upselling relationships for new products
        if (cloudHost && sslGuardian && backupVault && monitorMax) {
          // CloudHost Pro → SSL, Backup, Monitoring (hosting essentials)
          console.log('Setting CloudHost upselling to:', [sslGuardian.name, backupVault.name, monitorMax.name]);
          updateProduct(cloudHost.id, {
            upsellingProducts: [sslGuardian.id, backupVault.id, monitorMax.id]
          });
          
          // SSL Guardian → CloudHost, Backup (security stack)
          updateProduct(sslGuardian.id, {
            upsellingProducts: [cloudHost.id, backupVault.id]
          });
          
          // BackupVault → CloudHost, SSL, Monitoring (protection suite)
          updateProduct(backupVault.id, {
            upsellingProducts: [cloudHost.id, sslGuardian.id, monitorMax.id]
          });
          
          // MonitorMax → CloudHost, DevOps Toolkit (monitoring & management)
          updateProduct(monitorMax.id, {
            upsellingProducts: [cloudHost.id, devOpsToolkit?.id].filter(Boolean)
          });
        }
        
        if (devOpsToolkit && apiGateway) {
          // DevOps Toolkit → API Gateway, CloudHost (development stack)
          updateProduct(devOpsToolkit.id, {
            upsellingProducts: [apiGateway.id, cloudHost?.id, monitorMax?.id].filter(Boolean)
          });
          
          // API Gateway → DevOps Toolkit, CloudHost (integration suite)
          updateProduct(apiGateway.id, {
            upsellingProducts: [devOpsToolkit.id, cloudHost?.id].filter(Boolean)
          });
        }
        
        if (ecommerceAccelerator && mobileAppBuilder) {
          // E-commerce Accelerator → Mobile App Builder, Marketing (sales suite)
          updateProduct(ecommerceAccelerator.id, {
            upsellingProducts: [mobileAppBuilder.id, marketingHub?.id].filter(Boolean)
          });
          
          // Mobile App Builder → E-commerce, DevOps (app development suite)
          updateProduct(mobileAppBuilder.id, {
            upsellingProducts: [ecommerceAccelerator.id, devOpsToolkit?.id].filter(Boolean)
          });
        }
        
        // Enhanced relationships for original products
        if (teamSync && secureCloud && consulting) {
          // TeamSync → DevOps, Mobile App Builder (collaboration suite)
          updateProduct(teamSync.id, {
            upsellingProducts: [devOpsToolkit?.id, mobileAppBuilder?.id].filter(Boolean)
          });
          
          // SecureCloud → SSL, Backup, API Gateway (security suite)
          updateProduct(secureCloud.id, {
            upsellingProducts: [sslGuardian?.id, backupVault?.id, apiGateway?.id].filter(Boolean)
          });
          
          // Consulting → Can suggest any product as implementation
          updateProduct(consulting.id, {
            upsellingProducts: [
              salesForce?.id, marketingHub?.id, cloudHost?.id, 
              devOpsToolkit?.id, ecommerceAccelerator?.id
            ].filter(Boolean)
          });
        }
        
        alert('🎉 Extended demo products with diverse upselling relationships loaded!\n\n✅ 14 products across all categories\n✅ Hosting Stack: CloudHost Pro → SSL Guardian, BackupVault, MonitorMax\n✅ Development Suite: DevOps Toolkit → API Gateway, CloudHost\n✅ E-commerce Bundle: E-commerce Accelerator → Mobile App Builder\n✅ Try CloudHost Pro or E-commerce Accelerator for new upselling suggestions!');
      }, 200);
    }, 100);
  };

  const ProductCard = ({ product }) => {
    const lowestPrice = product.subscriptionPlans ? 
      Math.min(...product.subscriptionPlans.map(plan => plan.price)) : product.price;
    const hasMultiplePlans = product.subscriptionPlans && product.subscriptionPlans.length > 1;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
            {product.sku && (
              <p className="text-sm text-gray-500 mb-1">SKU: {product.sku}</p>
            )}
            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
          </div>
          <div className="flex items-center gap-1 ml-4">
            <button
              onClick={() => handleViewProduct(product)}
              className="p-1 text-gray-400 hover:text-blue-600 rounded"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteProduct(product.id)}
              className="p-1 text-gray-400 hover:text-red-600 rounded"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-600">
                {hasMultiplePlans ? `From $${lowestPrice}` : `$${(product.price || 0).toFixed(2)}`}
                {product.subscriptionPlans && product.subscriptionPlans[0]?.billingCycle !== 'one-time' && (
                  <span className="text-xs text-gray-500 ml-1">/mo</span>
                )}
              </span>
            </div>
            {product.category && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {productCategories.find(cat => cat.id === product.category)?.name || product.category}
              </span>
            )}
          </div>
          <span className={`px-2 py-1 text-xs rounded-full ${
            product.status === 'active' 
              ? 'bg-green-100 text-green-700' 
              : product.status === 'discontinued'
              ? 'bg-red-100 text-red-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {product.status}
          </span>
        </div>

        {/* Subscription Plans Preview */}
        {product.subscriptionPlans && product.subscriptionPlans.length > 0 && (
          <div className="mb-3">
            {(() => {
              // Group plans by name to show unique plan types
              const uniquePlans = {};
              product.subscriptionPlans.forEach(plan => {
                if (!uniquePlans[plan.name]) {
                  const monthlyPlan = product.subscriptionPlans.find(p => p.name === plan.name && p.billingCycle === 'monthly');
                  const annualPlan = product.subscriptionPlans.find(p => p.name === plan.name && p.billingCycle === 'annual');
                  uniquePlans[plan.name] = { monthly: monthlyPlan, annual: annualPlan };
                }
              });
              
              const planCount = Object.keys(uniquePlans).length;
              
              return (
                <>
                  <p className="text-xs text-gray-500 mb-2">{planCount} Plan{planCount > 1 ? 's' : ''} Available (Monthly & Annual):</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(uniquePlans).slice(0, 3).map(([planName, plans], index) => {
                      const monthlyPrice = plans.monthly?.price;
                      const annualPrice = plans.annual?.monthlyEquivalent || (plans.annual?.price / 12);
                      
                      return (
                        <span key={index} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded border">
                          {planName} - ${monthlyPrice}/mo
                          {annualPrice && (
                            <span className="text-green-600 ml-1">
                              (${annualPrice.toFixed(0)}/mo annual)
                            </span>
                          )}
                        </span>
                      );
                    })}
                    {planCount > 3 && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded border">
                        +{planCount - 3} more
                      </span>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {product.features && product.features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.features.slice(0, 3).map((feature, index) => (
              <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                {feature}
              </span>
            ))}
            {product.features.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                +{product.features.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const AddProductForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      sku: '',
      description: '',
      category: activeCategory !== 'all' ? activeCategory : '',
      price: '',
      status: 'active',
      features: '',
      upsellingProducts: []
    });

    // Upselling product management
    const addUpsellingProduct = (productId) => {
      if (productId && !formData.upsellingProducts.includes(productId)) {
        setFormData(prev => ({
          ...prev,
          upsellingProducts: [...prev.upsellingProducts, productId]
        }));
      }
    };

    const removeUpsellingProduct = (productId) => {
      setFormData(prev => ({
        ...prev,
        upsellingProducts: prev.upsellingProducts.filter(id => id !== productId)
      }));
    };

    const getAvailableProducts = () => {
      return products.filter(product => 
        product.status === 'active' && 
        !formData.upsellingProducts.includes(product.id)
      );
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const productData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        features: formData.features.split(',').map(f => f.trim()).filter(f => f)
      };
      handleAddProduct(productData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Add New Product/Service</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {productCategories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma-separated)</label>
              <input
                type="text"
                value={formData.features}
                onChange={(e) => setFormData({...formData, features: e.target.value})}
                placeholder="Feature 1, Feature 2, Feature 3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upselling Products (Optional)
              </label>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    addUpsellingProduct(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Select products to suggest as upsells...</option>
                {getAvailableProducts().length === 0 ? (
                  <option disabled>No other products available</option>
                ) : (
                  getAvailableProducts().map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ${product.price ? product.price.toFixed(2) : 'N/A'}
                    </option>
                  ))
                )}
              </select>
              
              {/* Selected Upselling Products Display */}
              {formData.upsellingProducts.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Selected Upselling Products ({formData.upsellingProducts.length}):
                  </p>
                  <div className="space-y-2">
                    {products.filter(p => formData.upsellingProducts.includes(p.id)).map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-2 bg-orange-50 rounded border border-orange-200">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-orange-600" />
                          <div>
                            <p className="text-sm font-medium text-orange-900">{product.name}</p>
                            <p className="text-xs text-orange-600">
                              ${product.price ? product.price.toFixed(2) : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeUpsellingProduct(product.id)}
                          className="p-1 hover:bg-orange-100 rounded transition-colors"
                          title="Remove upselling product"
                        >
                          <span className="text-orange-600 hover:text-orange-800 text-sm">×</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="mt-2 text-xs text-gray-500">
                Select products that complement this one and could be offered as upsells
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Add Product
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ProductDetail = ({ product, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
            <div className="space-y-3">
              {product.sku && (
                <div>
                  <span className="text-sm text-gray-500">SKU:</span>
                  <p className="font-medium">{product.sku}</p>
                </div>
              )}
              <div>
                <span className="text-sm text-gray-500">Starting Price:</span>
                <p className="font-medium text-green-600">
                  ${product.subscriptionPlans ? 
                    Math.min(...product.subscriptionPlans.map(plan => plan.price)) : 
                    (product.price?.toFixed(2) || '0.00')
                  }
                  {product.subscriptionPlans && product.subscriptionPlans[0]?.billingCycle !== 'one-time' && '/mo'}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Category:</span>
                <p className="font-medium">
                  {productCategories.find(cat => cat.id === product.category)?.name || product.category || 'Uncategorized'}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Status:</span>
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  product.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : product.status === 'discontinued'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {product.status}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Description & Features</h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Description:</span>
                <p className="text-gray-700">{product.description || 'No description available'}</p>
              </div>
              {product.features && product.features.length > 0 && (
                <div>
                  <span className="text-sm text-gray-500">Key Features:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.features.map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <span className="text-sm text-gray-500">Created:</span>
                <p className="text-gray-700">
                  {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              {product.upsellingProducts && product.upsellingProducts.length > 0 && (
                <div>
                  <span className="text-sm text-gray-500">Upselling Products:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.upsellingProducts.map((upsellingId) => {
                      const upsellingProduct = products.find(p => p.id === upsellingId);
                      return upsellingProduct ? (
                        <span key={upsellingId} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                          {upsellingProduct.name} - ${upsellingProduct.price ? upsellingProduct.price.toFixed(2) : 'N/A'}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subscription Plans Section */}
        {product.subscriptionPlans && product.subscriptionPlans.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Subscription Plans</h4>
            
            {/* Group plans by name and show monthly/annual options */}
            {(() => {
              const groupedPlans = {};
              product.subscriptionPlans.forEach(plan => {
                if (!groupedPlans[plan.name]) {
                  groupedPlans[plan.name] = [];
                }
                groupedPlans[plan.name].push(plan);
              });

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(groupedPlans).map(([planName, plans], groupIndex) => {
                    const monthlyPlan = plans.find(p => p.billingCycle === 'monthly');
                    const annualPlan = plans.find(p => p.billingCycle === 'annual');
                    const displayPlan = monthlyPlan || plans[0];

                    return (
                      <div key={`${planName}-${groupIndex}`} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-gray-900">{planName}</h5>
                          {groupIndex === 1 && (
                            <span className="px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-700">
                              Popular
                            </span>
                          )}
                        </div>
                        
                        {/* Pricing Toggle */}
                        <div className="mb-4">
                          {monthlyPlan && annualPlan ? (
                            <div className="space-y-2">
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-gray-900">${monthlyPlan.price}</span>
                                <span className="text-gray-500 text-sm">/ month</span>
                              </div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-lg font-semibold text-green-600">${annualPlan.monthlyEquivalent?.toFixed(2) || (annualPlan.price / 12).toFixed(2)}</span>
                                <span className="text-gray-500 text-sm">/ month (annual)</span>
                                {annualPlan.discount && (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">
                                    {annualPlan.discount}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                Annual: ${annualPlan.price} billed yearly
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-gray-900">${displayPlan.price}</span>
                              <span className="text-gray-500 text-sm">
                                {displayPlan.billingCycle === 'one-time' ? 'one-time' : `/ ${displayPlan.billingCycle}`}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mb-3">
                          <span className="text-sm text-gray-500">Users: </span>
                          <span className="font-medium">
                            {displayPlan.userLimit === 'unlimited' ? 'Unlimited' : `Up to ${displayPlan.userLimit}`}
                          </span>
                        </div>
                        
                        <div>
                          <span className="text-sm text-gray-500 block mb-2">Features:</span>
                          <ul className="space-y-1">
                            {displayPlan.features.map((feature, featureIndex) => (
                              <li key={featureIndex} className="text-sm text-gray-700 flex items-start">
                                <span className="text-green-500 mr-2 mt-0.5">✓</span>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Products</p>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
            </div>
            <Package className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active Products</p>
              <p className="text-2xl font-bold">{stats.activeProducts}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Categories</p>
              <p className="text-2xl font-bold">{stats.totalCategories}</p>
            </div>
            <Tag className="w-8 h-8 text-orange-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Avg. Price</p>
              <p className="text-2xl font-bold">${stats.averagePrice.toFixed(0)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Header and Controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products & Services</h2>
          <p className="text-gray-600">Manage your product catalog and service offerings</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
          {products.length > 0 && (
            <button
              onClick={loadDemoData}
              className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors text-sm"
            >
              <Package className="w-4 h-4" />
              Reload with Annual Plans
            </button>
          )}
          <button
            onClick={loadAdditionalProducts}
            className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Load Additional Products
          </button>
          <button
            onClick={resetAllData}
            className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 transition-colors text-sm"
          >
            <Package className="w-4 h-4" />
            Reset All Data
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 whitespace-nowrap transition-colors ${
                activeCategory === 'all'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="w-5 h-5" />
              <span className="font-medium">All Products</span>
              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                {getCategoryCount('all')}
              </span>
            </button>
            {productCategories.map((category) => {
              const count = getCategoryCount(category.id);
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 border-b-2 whitespace-nowrap transition-colors ${
                    activeCategory === category.id
                      ? 'border-teal-600 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Tag className="w-5 h-5" />
                  <span className="font-medium">{category.name}</span>
                  {count > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
          {activeCategory !== 'all' && (
            <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 text-teal-700 rounded-lg">
              <Tag className="w-4 h-4" />
              <span className="text-sm font-medium">
                {productCategories.find(cat => cat.id === activeCategory)?.name}
              </span>
              <button
                onClick={() => setActiveCategory('all')}
                className="ml-2 text-teal-500 hover:text-teal-700"
                title="Clear category filter"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category Header */}
      {activeCategory !== 'all' && filteredProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Tag className="w-6 h-6 text-teal-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {productCategories.find(cat => cat.id === activeCategory)?.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {productCategories.find(cat => cat.id === activeCategory)?.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-teal-600">{filteredProducts.length}</p>
              <p className="text-sm text-gray-500">Products</p>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeCategory !== 'all' 
              ? `No products in ${productCategories.find(cat => cat.id === activeCategory)?.name || activeCategory}` 
              : 'No products found'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || activeCategory !== 'all' || filterStatus !== 'all' 
              ? 'Try adjusting your filters, search terms, or switch to a different category.' 
              : 'Get started by adding your first product or service.'}
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add First Product
            </button>
            <button
              onClick={loadDemoData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              {products.length === 0 ? 'Load Demo SaaS Products' : 'Reload with Annual Plans'}
            </button>
            <button
              onClick={loadAdditionalProducts}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Load Additional Products
            </button>
            <button
              onClick={resetAllData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 inline-flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              Reset All Data
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddForm && <AddProductForm />}
      {showDetail && selectedProduct && (
        <ProductDetail 
          product={selectedProduct} 
          onClose={() => {
            setShowDetail(false);
            setSelectedProduct(null);
          }} 
        />
      )}
    </div>
  );
}