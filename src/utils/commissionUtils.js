/**
 * Commission calculation utilities for SalesTracker
 */

/**
 * Calculate commission amount for a single user
 * @param {number} dealValue - The deal value in currency
 * @param {number} commissionPercentage - Commission percentage (e.g., 5.5 for 5.5%)
 * @returns {number} Commission amount
 */
export const calculateCommission = (dealValue, commissionPercentage) => {
  if (!dealValue || !commissionPercentage || dealValue <= 0 || commissionPercentage <= 0) {
    return 0;
  }
  return (dealValue * commissionPercentage) / 100;
};

/**
 * Calculate commission for primary assigned user
 * @param {Object} lead - Lead object with dealValue and assignedTo
 * @param {Array} users - Array of all users
 * @returns {Object} Commission details for assigned user
 */
export const calculatePrimaryCommission = (lead, users) => {
  if (!lead.assignedTo || !lead.dealValue) {
    return null;
  }

  const assignedUser = users.find(user => user.id === lead.assignedTo);
  if (!assignedUser || assignedUser.role !== 'sales_rep' || !assignedUser.commissionPercentage) {
    return null;
  }

  const commissionAmount = calculateCommission(lead.dealValue, assignedUser.commissionPercentage);
  
  return {
    userId: assignedUser.id,
    userName: assignedUser.name,
    role: 'primary',
    commissionPercentage: assignedUser.commissionPercentage,
    commissionAmount,
    dealValue: lead.dealValue
  };
};

/**
 * Calculate commission for team members (collaborative leads)
 * @param {Object} lead - Lead object with teamMembers and dealValue
 * @param {Array} users - Array of all users
 * @param {Object} options - Commission split options
 * @returns {Array} Array of commission details for team members
 */
export const calculateTeamCommissions = (lead, users, options = {}) => {
  if (!lead.teamMembers || lead.teamMembers.length === 0 || !lead.dealValue) {
    return [];
  }

  const {
    splitType = 'equal', // 'equal', 'weighted', 'role-based'
    primaryWeight = 0.6, // Primary gets 60% by default
    collaboratorWeight = 0.3, // Collaborators get 30% by default
    consultantWeight = 0.1 // Consultants get 10% by default
  } = options;

  const teamCommissions = [];
  const totalCommissionPool = lead.dealValue * 0.05; // Default 5% pool for team commissions

  if (splitType === 'equal') {
    // Equal split among all team members
    const equalShare = totalCommissionPool / lead.teamMembers.length;
    
    lead.teamMembers.forEach(member => {
      const user = users.find(u => u.id === member.userId);
      if (user && user.role === 'sales_rep') {
        teamCommissions.push({
          userId: user.id,
          userName: user.name,
          role: member.role,
          commissionPercentage: (equalShare / lead.dealValue) * 100,
          commissionAmount: equalShare,
          dealValue: lead.dealValue
        });
      }
    });
  } else if (splitType === 'role-based') {
    // Role-based split with different weights
    const weights = {
      'primary': primaryWeight,
      'collaborator': collaboratorWeight,
      'consultant': consultantWeight
    };

    lead.teamMembers.forEach(member => {
      const user = users.find(u => u.id === member.userId);
      if (user && user.role === 'sales_rep') {
        const weight = weights[member.role] || collaboratorWeight;
        const commissionAmount = totalCommissionPool * weight;
        
        teamCommissions.push({
          userId: user.id,
          userName: user.name,
          role: member.role,
          commissionPercentage: (commissionAmount / lead.dealValue) * 100,
          commissionAmount,
          dealValue: lead.dealValue
        });
      }
    });
  } else if (splitType === 'weighted') {
    // Use individual user commission percentages as weights
    let totalWeight = 0;
    const memberWeights = [];

    // Calculate total weight
    lead.teamMembers.forEach(member => {
      const user = users.find(u => u.id === member.userId);
      if (user && user.role === 'sales_rep' && user.commissionPercentage) {
        const weight = user.commissionPercentage;
        totalWeight += weight;
        memberWeights.push({ member, user, weight });
      }
    });

    // Distribute commission based on weights
    memberWeights.forEach(({ member, user, weight }) => {
      const commissionShare = (weight / totalWeight) * totalCommissionPool;
      
      teamCommissions.push({
        userId: user.id,
        userName: user.name,
        role: member.role,
        commissionPercentage: (commissionShare / lead.dealValue) * 100,
        commissionAmount: commissionShare,
        dealValue: lead.dealValue
      });
    });
  }

  return teamCommissions;
};

/**
 * Calculate total commission for a lead (primary + team)
 * @param {Object} lead - Lead object
 * @param {Array} users - Array of all users
 * @param {Object} options - Commission calculation options
 * @returns {Object} Complete commission breakdown
 */
export const calculateLeadCommissions = (lead, users, options = {}) => {
  const primaryCommission = calculatePrimaryCommission(lead, users);
  const teamCommissions = calculateTeamCommissions(lead, users, options);
  
  const allCommissions = [];
  if (primaryCommission) allCommissions.push(primaryCommission);
  allCommissions.push(...teamCommissions);
  
  const totalCommissionAmount = allCommissions.reduce((sum, comm) => sum + comm.commissionAmount, 0);
  const totalCommissionPercentage = lead.dealValue > 0 ? (totalCommissionAmount / lead.dealValue) * 100 : 0;
  
  return {
    primaryCommission,
    teamCommissions,
    allCommissions,
    totalCommissionAmount,
    totalCommissionPercentage,
    dealValue: lead.dealValue,
    remainingDealValue: lead.dealValue - totalCommissionAmount
  };
};

/**
 * Format commission amount for display
 * @param {number} amount - Commission amount
 * @param {string} currency - Currency symbol (default: '$')
 * @returns {string} Formatted commission string
 */
export const formatCommission = (amount, currency = '$') => {
  if (!amount || amount <= 0) return `${currency}0.00`;
  return `${currency}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Calculate commission percentage display
 * @param {number} commissionAmount - Commission amount
 * @param {number} dealValue - Total deal value
 * @returns {string} Percentage string
 */
export const calculateCommissionPercentage = (commissionAmount, dealValue) => {
  if (!commissionAmount || !dealValue || dealValue <= 0) return '0.00%';
  const percentage = (commissionAmount / dealValue) * 100;
  return `${percentage.toFixed(2)}%`;
};

/**
 * Get commission tier based on amount
 * @param {number} commissionAmount - Commission amount
 * @returns {Object} Tier information with color and label
 */
export const getCommissionTier = (commissionAmount) => {
  if (commissionAmount >= 10000) {
    return { tier: 'platinum', color: 'from-purple-500 to-pink-500', label: 'Platinum', textColor: 'text-purple-700' };
  } else if (commissionAmount >= 5000) {
    return { tier: 'gold', color: 'from-yellow-400 to-orange-500', label: 'Gold', textColor: 'text-yellow-700' };
  } else if (commissionAmount >= 2000) {
    return { tier: 'silver', color: 'from-gray-400 to-gray-600', label: 'Silver', textColor: 'text-gray-700' };
  } else if (commissionAmount >= 500) {
    return { tier: 'bronze', color: 'from-orange-400 to-red-500', label: 'Bronze', textColor: 'text-orange-700' };
  } else {
    return { tier: 'standard', color: 'from-blue-400 to-cyan-500', label: 'Standard', textColor: 'text-blue-700' };
  }
};

/**
 * Calculate monthly/quarterly commission projections
 * @param {Array} leads - Array of leads for a user
 * @param {Object} user - User object with commission percentage
 * @param {string} period - 'monthly' or 'quarterly'
 * @returns {Object} Commission projections
 */
export const calculateCommissionProjections = (leads, user, period = 'monthly') => {
  const multiplier = period === 'quarterly' ? 3 : 1;
  const activeleads = leads.filter(lead => 
    lead.assignedTo === user.id && 
    ['new', 'contacted', 'in_progress'].includes(lead.status)
  );
  
  const wonLeads = leads.filter(lead => 
    lead.assignedTo === user.id && 
    lead.status === 'won'
  );
  
  const pipelineValue = activeleads.reduce((sum, lead) => sum + (lead.dealValue || 0), 0);
  const closedValue = wonLeads.reduce((sum, lead) => sum + (lead.closedValue || lead.dealValue || 0), 0);
  
  const projectedCommission = calculateCommission(pipelineValue, user.commissionPercentage || 0) * multiplier;
  const earnedCommission = calculateCommission(closedValue, user.commissionPercentage || 0);
  
  return {
    period,
    pipelineValue,
    closedValue,
    projectedCommission,
    earnedCommission,
    totalPotential: projectedCommission + earnedCommission,
    leadsCount: {
      active: activeleads.length,
      won: wonLeads.length,
      total: activeleads.length + wonLeads.length
    }
  };
};