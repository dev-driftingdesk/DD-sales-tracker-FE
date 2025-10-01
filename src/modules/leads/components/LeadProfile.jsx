import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Phone, Mail, MapPin, Globe, Calendar, Clock, 
  MessageSquare, User, Building, Tag, Edit2, Save, X,
  FileText, PhoneCall, Mail as MailIcon, Users, Package,
  Plus, Search, Filter, Trash2, Star, AlertCircle, CheckCircle,
  UserPlus, Crown, Shield, Eye, ArrowRight, Monitor, FileCheck,
  DollarSign, FileSignature, CheckSquare, Bell, UserCheck,
  UserMinus, TrendingUp, Activity
} from 'lucide-react';
import useLeadStore from '../stores/leadStore';
import useUserStore from '../../../stores/userStore.jsx';
import useCRMStore from '../../crm-core/stores/crmStore';
import { 
  LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, LEAD_SOURCE_LABELS,
  LEAD_STATUSES, ACTIVITY_TYPES, ACTIVITY_TYPE_LABELS,
  ACTIVITY_TYPE_COLORS, ACTIVITY_TYPE_ICONS
} from '../constants/index';
import { 
  calculateLeadCommissions, 
  formatCommission, 
  getCommissionTier,
  calculateCommissionPercentage
} from '../../../utils/commissionUtils';
import { getPerformanceColor } from '../../../utils/timeMetricsUtils';

const LeadProfile = ({ lead, onBack }) => {
  const { 
    leads, updateLead, addActivity, addQuickActivity, addNote, updateNote, deleteNote, getLeadNotes,
    addTeamMember, removeTeamMember, updateTeamMemberRole, getLeadTeamMembers,
    getLeadTTFC, getLeadResponseTime, getLeadTimeMetrics
  } = useLeadStore();
  const { getUserById, currentUser, users, getUsersByRole } = useUserStore();
  const { products } = useCRMStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState(lead);
  const [activityNote, setActivityNote] = useState('');
  const [activityType, setActivityType] = useState(ACTIVITY_TYPES.NOTE);
  const [activityFilters, setActivityFilters] = useState({
    type: 'all',
    dateRange: 'all',
    search: ''
  });
  const [showActivityFilters, setShowActivityFilters] = useState(false);
  
  // Advanced Notes state
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteForm, setNoteForm] = useState({
    content: '',
    category: 'general',
    priority: 'medium',
    tags: '',
    isPrivate: false
  });
  const [notesFilter, setNotesFilter] = useState({
    category: 'all',
    priority: 'all',
    search: ''
  });
  const [editingNote, setEditingNote] = useState(null);
  
  // Team collaboration state
  const [showAddTeamMember, setShowAddTeamMember] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState('');
  const [teamMemberRole, setTeamMemberRole] = useState('collaborator');
  
  // Get the current lead data from the store
  const currentLead = leads.find(l => l.id === lead.id) || lead;
  const assignedUser = getUserById(currentLead.assignedTo);
  const associatedProduct = products.find(product => product.id === currentLead.productId);
  const additionalProduct = products.find(product => product.id === currentLead.additionalProductId);
  
  // Calculate commission information
  const commissionData = calculateLeadCommissions(currentLead, users, {
    splitType: 'role-based',
    primaryWeight: 0.6,
    collaboratorWeight: 0.3,
    consultantWeight: 0.1
  });
  
  // Calculate time metrics
  const timeMetrics = getLeadTimeMetrics(currentLead.id);
  
  // Update editedLead when currentLead changes
  useEffect(() => {
    setEditedLead(currentLead);
  }, [currentLead.id]);



  const handleSave = () => {
    // Check if product associations changed
    const productChanged = currentLead.productId !== editedLead.productId;
    const additionalProductChanged = currentLead.additionalProductId !== editedLead.additionalProductId;
    
    updateLead(currentLead.id, editedLead);
    
    // Add activity if product was changed
    if (productChanged) {
      let activityDescription;
      if (!currentLead.productId && editedLead.productId) {
        // Product was added
        const newProduct = products.find(p => p.id === editedLead.productId);
        activityDescription = `Product associated: ${newProduct?.name || 'Unknown Product'}`;
      } else if (currentLead.productId && !editedLead.productId) {
        // Product was removed
        const oldProduct = products.find(p => p.id === currentLead.productId);
        activityDescription = `Product removed: ${oldProduct?.name || 'Unknown Product'}`;
      } else if (currentLead.productId && editedLead.productId) {
        // Product was changed
        const oldProduct = products.find(p => p.id === currentLead.productId);
        const newProduct = products.find(p => p.id === editedLead.productId);
        activityDescription = `Product changed from ${oldProduct?.name || 'Unknown'} to ${newProduct?.name || 'Unknown'}`;
      }
      
      if (activityDescription) {
        addActivity(currentLead.id, {
          type: ACTIVITY_TYPES.NOTE,
          description: activityDescription,
          user: currentUser?.name || 'Current User'
        });
      }
    }
    
    // Add activity if additional product was changed
    if (additionalProductChanged) {
      let additionalActivityDescription;
      if (!currentLead.additionalProductId && editedLead.additionalProductId) {
        // Additional product was added
        const newAdditionalProduct = products.find(p => p.id === editedLead.additionalProductId);
        additionalActivityDescription = `Additional product associated: ${newAdditionalProduct?.name || 'Unknown Product'}`;
      } else if (currentLead.additionalProductId && !editedLead.additionalProductId) {
        // Additional product was removed
        const oldAdditionalProduct = products.find(p => p.id === currentLead.additionalProductId);
        additionalActivityDescription = `Additional product removed: ${oldAdditionalProduct?.name || 'Unknown Product'}`;
      } else if (currentLead.additionalProductId && editedLead.additionalProductId) {
        // Additional product was changed
        const oldAdditionalProduct = products.find(p => p.id === currentLead.additionalProductId);
        const newAdditionalProduct = products.find(p => p.id === editedLead.additionalProductId);
        additionalActivityDescription = `Additional product changed from ${oldAdditionalProduct?.name || 'Unknown'} to ${newAdditionalProduct?.name || 'Unknown'}`;
      }
      
      if (additionalActivityDescription) {
        addActivity(currentLead.id, {
          type: ACTIVITY_TYPES.NOTE,
          description: additionalActivityDescription,
          user: currentUser?.name || 'Current User'
        });
      }
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedLead(currentLead);
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus) => {
    updateLead(currentLead.id, { status: newStatus });
    addActivity(currentLead.id, {
      type: ACTIVITY_TYPES.STATUS_CHANGE,
      description: `Status changed from ${LEAD_STATUS_LABELS[currentLead.status]} to ${LEAD_STATUS_LABELS[newStatus]}`,
      user: currentUser?.name || 'Current User'
    });
  };

  const handleAddActivity = () => {
    if (!activityNote.trim()) return;
    
    addActivity(currentLead.id, {
      type: activityType,
      description: activityNote,
      user: currentUser?.name || 'Current User',
      metadata: getActivityMetadata(activityType)
    });
    
    setActivityNote('');
    setActivityType(ACTIVITY_TYPES.NOTE);
  };

  // Enhanced activity functions
  const getFilteredActivities = () => {
    if (!currentLead.activities) return [];
    
    let activities = [...currentLead.activities];
    
    // Apply type filter
    if (activityFilters.type !== 'all') {
      activities = activities.filter(activity => activity.type === activityFilters.type);
    }
    
    // Apply date range filter
    if (activityFilters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (activityFilters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      activities = activities.filter(activity => 
        new Date(activity.timestamp) >= filterDate
      );
    }
    
    // Apply search filter
    if (activityFilters.search.trim()) {
      const searchTerm = activityFilters.search.toLowerCase();
      activities = activities.filter(activity =>
        activity.description.toLowerCase().includes(searchTerm) ||
        ACTIVITY_TYPE_LABELS[activity.type]?.toLowerCase().includes(searchTerm) ||
        activity.user.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort by timestamp (newest first)
    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const isActivityRecent = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffHours = (now - activityTime) / (1000 * 60 * 60);
    return diffHours <= 24;
  };

  const getEnhancedActivityIcon = (type, isHighlighted = false) => {
    const iconName = ACTIVITY_TYPE_ICONS[type] || 'FileText';
    const iconColor = isHighlighted ? 'text-white' : 'text-gray-600';
    const iconSize = 'w-5 h-5';
    
    const iconComponents = {
      Phone: <Phone className={`${iconSize} ${iconColor}`} />,
      Mail: <Mail className={`${iconSize} ${iconColor}`} />,
      Calendar: <Calendar className={`${iconSize} ${iconColor}`} />,
      FileText: <FileText className={`${iconSize} ${iconColor}`} />,
      ArrowRight: <ArrowRight className={`${iconSize} ${iconColor}`} />,
      Clock: <Clock className={`${iconSize} ${iconColor}`} />,
      Monitor: <Monitor className={`${iconSize} ${iconColor}`} />,
      FileCheck: <FileCheck className={`${iconSize} ${iconColor}`} />,
      DollarSign: <DollarSign className={`${iconSize} ${iconColor}`} />,
      FileSignature: <FileSignature className={`${iconSize} ${iconColor}`} />,
      CheckSquare: <CheckSquare className={`${iconSize} ${iconColor}`} />,
      Bell: <Bell className={`${iconSize} ${iconColor}`} />,
      UserPlus: <UserPlus className={`${iconSize} ${iconColor}`} />,
      UserCheck: <UserCheck className={`${iconSize} ${iconColor}`} />,
      Package: <Package className={`${iconSize} ${iconColor}`} />,
      Users: <Users className={`${iconSize} ${iconColor}`} />,
      UserMinus: <UserMinus className={`${iconSize} ${iconColor}`} />
    };
    
    return iconComponents[iconName] || iconComponents.FileText;
  };

  const getActivityTemplates = (type) => {
    const templates = {
      [ACTIVITY_TYPES.CALL]: [
        'Initial discovery call completed',
        'Follow-up call scheduled',
        'Product demo conducted over phone'
      ],
      [ACTIVITY_TYPES.EMAIL]: [
        'Sent product information and pricing',
        'Follow-up email with next steps',
        'Contract details shared via email'
      ],
      [ACTIVITY_TYPES.MEETING]: [
        'In-person meeting at client office',
        'Virtual product demonstration',
        'Contract negotiation meeting'
      ],
      [ACTIVITY_TYPES.DEMO]: [
        'Product demo completed successfully',
        'Technical demonstration scheduled',
        'Live product walkthrough conducted'
      ],
      [ACTIVITY_TYPES.PROPOSAL]: [
        'Formal proposal submitted',
        'Custom proposal prepared and sent',
        'Proposal presentation scheduled'
      ]
    };
    
    return templates[type] || ['Activity completed', 'Follow-up required', 'Next steps defined'];
  };

  const getActivityPlaceholder = (type) => {
    const placeholders = {
      [ACTIVITY_TYPES.CALL]: 'Describe the phone call details...',
      [ACTIVITY_TYPES.EMAIL]: 'Summarize the email exchange...',
      [ACTIVITY_TYPES.MEETING]: 'Document the meeting outcomes...',
      [ACTIVITY_TYPES.DEMO]: 'Record the demonstration results...',
      [ACTIVITY_TYPES.PROPOSAL]: 'Note the proposal details...',
      [ACTIVITY_TYPES.FOLLOW_UP]: 'Plan the follow-up actions...',
      [ACTIVITY_TYPES.NOTE]: 'Add your notes or observations...'
    };
    
    return placeholders[type] || 'Describe the activity...';
  };

  const getActivityMetadata = (type) => {
    // This could be expanded to capture more specific metadata based on activity type
    return {
      source: 'manual_entry',
      timestamp: new Date().toISOString()
    };
  };

  // Advanced Notes functions
  const handleAddNote = () => {
    if (!noteForm.content.trim()) return;
    
    const noteData = {
      content: noteForm.content,
      category: noteForm.category,
      priority: noteForm.priority,
      tags: noteForm.tags ? noteForm.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      isPrivate: noteForm.isPrivate,
      author: currentUser?.name || 'Current User'
    };
    
    addNote(currentLead.id, noteData);
    
    // Reset form
    setNoteForm({
      content: '',
      category: 'general',
      priority: 'medium',
      tags: '',
      isPrivate: false
    });
    setShowAddNote(false);
  };

  const handleUpdateNote = (noteId) => {
    if (!editingNote) return;
    
    updateNote(currentLead.id, noteId, {
      content: editingNote.content,
      category: editingNote.category,
      priority: editingNote.priority,
      tags: editingNote.tags
    });
    
    setEditingNote(null);
  };

  const handleDeleteNote = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote(currentLead.id, noteId);
    }
  };

  const getFilteredNotes = () => {
    return getLeadNotes(currentLead.id, notesFilter);
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getNoteCategories = () => [
    { id: 'general', name: 'General', color: 'bg-gray-100 text-gray-700' },
    { id: 'sales', name: 'Sales', color: 'bg-green-100 text-green-700' },
    { id: 'technical', name: 'Technical', color: 'bg-blue-100 text-blue-700' },
    { id: 'follow-up', name: 'Follow-up', color: 'bg-orange-100 text-orange-700' },
    { id: 'meeting', name: 'Meeting', color: 'bg-purple-100 text-purple-700' },
    { id: 'support', name: 'Support', color: 'bg-red-100 text-red-700' }
  ];

  // Team collaboration functions
  const handleAddTeamMember = () => {
    if (!selectedTeamMember) return;
    
    addTeamMember(currentLead.id, selectedTeamMember, teamMemberRole);
    
    // Add activity log
    const user = getUserById(selectedTeamMember);
    addActivity(currentLead.id, {
      type: ACTIVITY_TYPES.NOTE,
      description: `${user?.name || 'Unknown User'} added as ${teamMemberRole} to the team`,
      user: currentUser?.name || 'Current User'
    });
    
    // Reset form
    setSelectedTeamMember('');
    setTeamMemberRole('collaborator');
    setShowAddTeamMember(false);
  };

  const handleRemoveTeamMember = (userId) => {
    const user = getUserById(userId);
    if (window.confirm(`Remove ${user?.name || 'this user'} from the team?`)) {
      removeTeamMember(currentLead.id, userId);
      
      // Add activity log
      addActivity(currentLead.id, {
        type: ACTIVITY_TYPES.NOTE,
        description: `${user?.name || 'Team member'} removed from the team`,
        user: currentUser?.name || 'Current User'
      });
    }
  };

  const handleUpdateTeamMemberRole = (userId, newRole) => {
    updateTeamMemberRole(currentLead.id, userId, newRole);
    
    // Add activity log
    const user = getUserById(userId);
    addActivity(currentLead.id, {
      type: ACTIVITY_TYPES.NOTE,
      description: `${user?.name || 'Team member'} role updated to ${newRole}`,
      user: currentUser?.name || 'Current User'
    });
  };

  const getTeamMembers = () => {
    return getLeadTeamMembers(currentLead.id);
  };

  const getAvailableTeamMembers = () => {
    const currentTeamMembers = getTeamMembers().map(member => member.userId);
    return users.filter(user => 
      user.role === 'sales_rep' && 
      user.isActive && 
      !currentTeamMembers.includes(user.id) &&
      user.id !== currentLead.assignedTo // Don't include primary assignee
    );
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'primary':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'collaborator':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'consultant':
        return <Eye className="w-4 h-4 text-purple-500" />;
      default:
        return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityIcon = (type) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case ACTIVITY_TYPES.CALL:
        return <PhoneCall className={iconClass} />;
      case ACTIVITY_TYPES.EMAIL:
        return <MailIcon className={iconClass} />;
      case ACTIVITY_TYPES.MEETING:
        return <Users className={iconClass} />;
      case ACTIVITY_TYPES.NOTE:
        return <FileText className={iconClass} />;
      case ACTIVITY_TYPES.STATUS_CHANGE:
        return <Tag className={iconClass} />;
      default:
        return <MessageSquare className={iconClass} />;
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">Lead Details</h2>
          </div>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Status:</span>
          {!isEditing ? (
            <span className={`${LEAD_STATUS_COLORS[currentLead.status]} px-3 py-1 rounded-full text-xs font-medium`}>
              {LEAD_STATUS_LABELS[currentLead.status]}
            </span>
          ) : (
            <select
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
              value={editedLead.status}
              onChange={(e) => setEditedLead({ ...editedLead, status: e.target.value })}
            >
              {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Lead Information */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Company</label>
              {!isEditing ? (
                <p className="text-sm font-medium text-gray-900 flex items-center gap-2 mt-1">
                  <Building className="w-4 h-4 text-gray-400" />
                  {currentLead.companyName}
                </p>
              ) : (
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                  value={editedLead.companyName}
                  onChange={(e) => setEditedLead({ ...editedLead, companyName: e.target.value })}
                />
              )}
            </div>
            
            <div>
              <label className="text-sm text-gray-600">Contact Name</label>
              {!isEditing ? (
                <p className="text-sm font-medium text-gray-900 flex items-center gap-2 mt-1">
                  <User className="w-4 h-4 text-gray-400" />
                  {currentLead.contactName}
                </p>
              ) : (
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                  value={editedLead.contactName}
                  onChange={(e) => setEditedLead({ ...editedLead, contactName: e.target.value })}
                />
              )}
            </div>
            
            <div>
              <label className="text-sm text-gray-600">Email</label>
              {!isEditing ? (
                <p className="text-sm font-medium text-gray-900 flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {currentLead.email}
                </p>
              ) : (
                <input
                  type="email"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                  value={editedLead.email}
                  onChange={(e) => setEditedLead({ ...editedLead, email: e.target.value })}
                />
              )}
            </div>
            
            <div>
              <label className="text-sm text-gray-600">Phone</label>
              {!isEditing ? (
                <p className="text-sm font-medium text-gray-900 flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {currentLead.phone}
                </p>
              ) : (
                <input
                  type="tel"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                  value={editedLead.phone}
                  onChange={(e) => setEditedLead({ ...editedLead, phone: e.target.value })}
                />
              )}
            </div>
            
            <div>
              <label className="text-sm text-gray-600">Location</label>
              {!isEditing ? (
                <p className="text-sm font-medium text-gray-900 flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {currentLead.location || 'Not specified'}
                </p>
              ) : (
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                  value={editedLead.location || ''}
                  onChange={(e) => setEditedLead({ ...editedLead, location: e.target.value })}
                />
              )}
            </div>
            
            <div>
              <label className="text-sm text-gray-600">Source</label>
              <p className="text-sm font-medium text-gray-900 flex items-center gap-2 mt-1">
                <Globe className="w-4 h-4 text-gray-400" />
                {LEAD_SOURCE_LABELS[currentLead.source]}
              </p>
            </div>
            
            <div>
              <label className="text-sm text-gray-600">Assigned To</label>
              <p className="text-sm font-medium text-gray-900 flex items-center gap-2 mt-1">
                <User className="w-4 h-4 text-gray-400" />
                {assignedUser?.name || 'Unassigned'}
              </p>
            </div>
            
          </div>
          
          {/* Single Product Association Section */}
          <div className="mt-6">
            <label className="text-sm text-gray-600 flex items-center gap-2 mb-2">
              <Package className="w-4 h-4" />
              Associated Product
            </label>
            
            {!isEditing ? (
              associatedProduct ? (
                <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Package className="w-6 h-6 text-teal-600" />
                      <div>
                        <p className="text-base font-semibold text-teal-900">{associatedProduct.name}</p>
                        <p className="text-sm text-teal-600 capitalize">{associatedProduct.category?.replace('-', ' & ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-semibold text-teal-900">
                        ${associatedProduct.price ? associatedProduct.price.toFixed(2) : 'N/A'}
                      </p>
                      <p className="text-sm text-teal-600">Starting price</p>
                    </div>
                  </div>
                  {associatedProduct.description && (
                    <p className="text-sm text-gray-600 mt-3 pl-9">{associatedProduct.description}</p>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No product associated with this lead</p>
                  <p className="text-xs text-gray-400 mt-1">Click Edit to associate a product</p>
                </div>
              )
            ) : (
              <div className="space-y-2">
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                  value={editedLead.productId || ''}
                  onChange={(e) => setEditedLead({ ...editedLead, productId: e.target.value })}
                >
                  <option value="">No product selected</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ${product.price ? product.price.toFixed(2) : 'N/A'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  Select a product to associate with this lead for better pipeline tracking
                </p>
              </div>
            )}
          </div>
          
          {/* Additional Product Association Section */}
          <div className="mt-6">
            <label className="text-sm text-gray-600 flex items-center gap-2 mb-2">
              <Package className="w-4 h-4" />
              Additional Product (Optional)
            </label>
            
            {!isEditing ? (
              additionalProduct ? (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Package className="w-6 h-6 text-orange-600" />
                      <div>
                        <p className="text-base font-semibold text-orange-900">{additionalProduct.name}</p>
                        <p className="text-sm text-orange-600 capitalize">{additionalProduct.category?.replace('-', ' & ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-semibold text-orange-900">
                        ${additionalProduct.price ? additionalProduct.price.toFixed(2) : 'N/A'}
                      </p>
                      <p className="text-sm text-orange-600">Starting price</p>
                    </div>
                  </div>
                  {additionalProduct.description && (
                    <p className="text-sm text-gray-600 mt-3 pl-9">{additionalProduct.description}</p>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No additional product selected</p>
                  <p className="text-xs text-gray-400 mt-1">Click Edit to add an additional product</p>
                </div>
              )
            ) : (
              <div className="space-y-2">
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                  value={editedLead.additionalProductId || ''}
                  onChange={(e) => setEditedLead({ ...editedLead, additionalProductId: e.target.value })}
                >
                  <option value="">No additional product selected</option>
                  {products.filter(product => product.category === 'additional-products').map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ${product.price ? product.price.toFixed(2) : 'N/A'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  Select an additional product like hosting, design services, or marketing tools
                </p>
              </div>
            )}
          </div>
          
          
          {(currentLead.tags && currentLead.tags.length > 0) && (
            <div className="mt-4">
              <label className="text-sm text-gray-600">Tags</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {currentLead.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {(currentLead.dealValue || currentLead.closedValue) && (
            <div className="mt-4">
              <label className="text-sm text-gray-600">Deal Value</label>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm font-medium text-gray-900">
                  Estimated: ${currentLead.dealValue?.toLocaleString() || 0}
                </p>
                {currentLead.closedValue && (
                  <p className="text-sm font-medium text-green-600">
                    Closed: ${currentLead.closedValue.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* Commission Breakdown */}
          {currentLead.dealValue && commissionData.totalCommissionAmount > 0 && (
            <div className="mt-6">
              <label className="text-sm text-gray-600 mb-3 block">Commission Breakdown</label>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">Total Commission</p>
                    <p className="text-xl font-bold text-green-700">
                      {formatCommission(commissionData.totalCommissionAmount)}
                    </p>
                    <p className="text-xs text-green-600">
                      {calculateCommissionPercentage(commissionData.totalCommissionAmount, currentLead.dealValue)} of deal
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">Remaining Value</p>
                    <p className="text-xl font-bold text-gray-700">
                      {formatCommission(commissionData.remainingDealValue)}
                    </p>
                    <p className="text-xs text-gray-600">
                      After commissions
                    </p>
                  </div>
                </div>
                
                {/* Commission Details */}
                {commissionData.allCommissions.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Commission Distribution
                    </h4>
                    {commissionData.allCommissions.map((commission, index) => {
                      const tier = getCommissionTier(commission.commissionAmount);
                      return (
                        <div key={`commission-${commission.userId}-${index}`} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 bg-gradient-to-r ${tier.color} rounded-full flex items-center justify-center`}>
                              <DollarSign className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{commission.userName}</p>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 bg-gray-100 ${tier.textColor} text-xs rounded-full font-medium capitalize`}>
                                  {commission.role}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {commission.commissionPercentage.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-700">
                              {formatCommission(commission.commissionAmount)}
                            </p>
                            <span className={`px-2 py-0.5 bg-gradient-to-r ${tier.color} text-white text-xs rounded-full font-medium`}>
                              {tier.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Time Metrics Section */}
          <div className="mt-6">
            <label className="text-sm text-gray-600 mb-3 block flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Response Time Metrics
            </label>
            
            {timeMetrics.hasMetrics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Time to First Contact (TTFC) */}
                {timeMetrics.ttfc && timeMetrics.ttfc.totalMinutes !== null && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Time to First Contact</h4>
                          <p className="text-xs text-gray-600">How quickly we reached out</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getPerformanceColor(timeMetrics.ttfc.category)}`}>
                        {timeMetrics.ttfc.status}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-700">{timeMetrics.ttfc.formattedTime}</span>
                        <div className="text-right">
                          <p className="text-xs text-gray-600">Lead created</p>
                          <p className="text-xs text-gray-500">
                            {new Date(currentLead.createdAt).toLocaleDateString()} at {new Date(currentLead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      
                      {/* Performance indicator */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            timeMetrics.ttfc.category === 'excellent' ? 'bg-green-500' :
                            timeMetrics.ttfc.category === 'good' ? 'bg-blue-500' :
                            timeMetrics.ttfc.category === 'fair' ? 'bg-yellow-500' :
                            timeMetrics.ttfc.category === 'poor' ? 'bg-orange-500' :
                            'bg-red-500'
                          }`}
                          style={{ 
                            width: timeMetrics.ttfc.category === 'excellent' ? '100%' :
                                   timeMetrics.ttfc.category === 'good' ? '80%' :
                                   timeMetrics.ttfc.category === 'fair' ? '60%' :
                                   timeMetrics.ttfc.category === 'poor' ? '40%' : '20%'
                          }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Target: &lt; 2 hours</span>
                        <div className="flex items-center gap-1">
                          {timeMetrics.ttfc.category === 'excellent' && <span className="text-green-600">🎯 Excellent</span>}
                          {timeMetrics.ttfc.category === 'good' && <span className="text-blue-600">👍 Good</span>}
                          {timeMetrics.ttfc.category === 'fair' && <span className="text-yellow-600">⚠️ Fair</span>}
                          {timeMetrics.ttfc.category === 'poor' && <span className="text-orange-600">⏰ Needs Improvement</span>}
                          {timeMetrics.ttfc.category === 'very-poor' && <span className="text-red-600">🚨 Poor</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Average Response Time */}
                {timeMetrics.responseTime && timeMetrics.responseTime.avgResponseMinutes !== null && (
                  <div className="bg-gradient-to-r from-teal-50 to-green-50 border border-teal-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                          <ArrowRight className="w-4 h-4 text-teal-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Avg Response Time</h4>
                          <p className="text-xs text-gray-600">How quickly we respond</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getPerformanceColor(timeMetrics.responseTime.category)}`}>
                        {timeMetrics.responseTime.status}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-teal-700">{timeMetrics.responseTime.formattedAvgTime}</span>
                        <div className="text-right">
                          <p className="text-xs text-gray-600">{timeMetrics.responseTime.totalResponses || 0} responses</p>
                          <p className="text-xs text-gray-500">tracked</p>
                        </div>
                      </div>
                      
                      {/* Performance indicator */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            timeMetrics.responseTime.category === 'excellent' ? 'bg-green-500' :
                            timeMetrics.responseTime.category === 'good' ? 'bg-blue-500' :
                            timeMetrics.responseTime.category === 'fair' ? 'bg-yellow-500' :
                            timeMetrics.responseTime.category === 'poor' ? 'bg-orange-500' :
                            'bg-red-500'
                          }`}
                          style={{ 
                            width: timeMetrics.responseTime.category === 'excellent' ? '100%' :
                                   timeMetrics.responseTime.category === 'good' ? '80%' :
                                   timeMetrics.responseTime.category === 'fair' ? '60%' :
                                   timeMetrics.responseTime.category === 'poor' ? '40%' : '20%'
                          }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Target: &lt; 2 hours</span>
                        <div className="flex items-center gap-1">
                          {timeMetrics.responseTime.category === 'excellent' && <span className="text-green-600">🎯 Excellent</span>}
                          {timeMetrics.responseTime.category === 'good' && <span className="text-blue-600">👍 Good</span>}
                          {timeMetrics.responseTime.category === 'fair' && <span className="text-yellow-600">⚠️ Fair</span>}
                          {timeMetrics.responseTime.category === 'poor' && <span className="text-orange-600">⏰ Needs Improvement</span>}
                          {timeMetrics.responseTime.category === 'very-poor' && <span className="text-red-600">🚨 Poor</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-1">No response time data available</p>
                <p className="text-xs text-gray-400">Metrics will appear once you start logging communications</p>
              </div>
            )}
          </div>
          
        </div>

        {/* Team Collaboration Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Team Collaboration</h3>
            <button
              onClick={() => setShowAddTeamMember(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Add Team Member
            </button>
          </div>

          {/* Primary Assignee */}
          {assignedUser && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Primary Sales Rep</h4>
              <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <img 
                  src={assignedUser.avatar} 
                  alt={assignedUser.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <p className="font-medium text-gray-900">{assignedUser.name}</p>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                      Primary
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{assignedUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">📍 {assignedUser.location}</span>
                    <span className="text-xs text-gray-500">👥 {assignedUser.team}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Team Member Form */}
          {showAddTeamMember && (
            <div className="mb-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                    value={selectedTeamMember}
                    onChange={(e) => setSelectedTeamMember(e.target.value)}
                  >
                    <option value="">Select a sales rep...</option>
                    {getAvailableTeamMembers().map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.location}) - {user.expertise.join(', ')}
                      </option>
                    ))}
                  </select>
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                    value={teamMemberRole}
                    onChange={(e) => setTeamMemberRole(e.target.value)}
                  >
                    <option value="collaborator">Collaborator</option>
                    <option value="consultant">Consultant</option>
                    <option value="primary">Co-Primary</option>
                  </select>
                </div>
                <div className="text-xs text-gray-600">
                  <p><strong>Collaborator:</strong> Full access to lead, can make changes and add notes</p>
                  <p><strong>Consultant:</strong> Can view and add notes, but cannot modify lead details</p>
                  <p><strong>Co-Primary:</strong> Shares primary responsibility with full access</p>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddTeamMember(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 text-sm font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddTeamMember}
                    disabled={!selectedTeamMember}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Team Member
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Team Members List */}
          <div className="space-y-3">
            {getTeamMembers().length > 0 ? (
              <>
                <h4 className="text-sm font-medium text-gray-700">Team Members ({getTeamMembers().length})</h4>
                {getTeamMembers().map((member) => {
                  const user = getUserById(member.userId);
                  if (!user) return null;
                  
                  return (
                    <div key={member.userId} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(member.role)}
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <select
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                            value={member.role}
                            onChange={(e) => handleUpdateTeamMemberRole(member.userId, e.target.value)}
                          >
                            <option value="collaborator">Collaborator</option>
                            <option value="consultant">Consultant</option>
                            <option value="primary">Co-Primary</option>
                          </select>
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">📍 {user.location}</span>
                          <span className="text-xs text-gray-500">🎯 {user.expertise.slice(0, 2).join(', ')}</span>
                          <span className="text-xs text-gray-400">Added {new Date(member.addedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveTeamMember(member.userId)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove team member"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No additional team members</p>
                <p className="text-xs text-gray-400 mt-1">Add sales reps to collaborate on this lead</p>
              </div>
            )}
          </div>
        </div>

        {/* Advanced Notes Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Notes & Documentation</h3>
            <button
              onClick={() => setShowAddNote(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Note
            </button>
          </div>

          {/* Notes Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes..."
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
                value={notesFilter.search}
                onChange={(e) => setNotesFilter({ ...notesFilter, search: e.target.value })}
              />
            </div>
            <select
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
              value={notesFilter.category}
              onChange={(e) => setNotesFilter({ ...notesFilter, category: e.target.value })}
            >
              <option value="all">All Categories</option>
              {getNoteCategories().map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <select
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
              value={notesFilter.priority}
              onChange={(e) => setNotesFilter({ ...notesFilter, priority: e.target.value })}
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Add Note Form */}
          {showAddNote && (
            <div className="mb-6 p-4 border border-indigo-200 rounded-lg bg-indigo-50">
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
                    value={noteForm.category}
                    onChange={(e) => setNoteForm({ ...noteForm, category: e.target.value })}
                  >
                    {getNoteCategories().map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
                    value={noteForm.priority}
                    onChange={(e) => setNoteForm({ ...noteForm, priority: e.target.value })}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Tags (comma separated)"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
                    value={noteForm.tags}
                    onChange={(e) => setNoteForm({ ...noteForm, tags: e.target.value })}
                  />
                </div>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
                  rows="4"
                  placeholder="Write your note here..."
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={noteForm.isPrivate}
                      onChange={(e) => setNoteForm({ ...noteForm, isPrivate: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    Private note (only visible to me)
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddNote(false)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 text-sm font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddNote}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes List */}
          <div className="space-y-4">
            {getFilteredNotes().length > 0 ? (
              getFilteredNotes().map((note) => (
                <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(note.priority)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        getNoteCategories().find(cat => cat.id === note.category)?.color || 'bg-gray-100 text-gray-700'
                      }`}>
                        {getNoteCategories().find(cat => cat.id === note.category)?.name || note.category}
                      </span>
                      {note.isPrivate && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                          Private
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingNote(note)}
                        className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {editingNote?.id === note.id ? (
                    <div className="space-y-3">
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
                        rows="3"
                        value={editingNote.content}
                        onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateNote(note.id)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingNote(null)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 text-sm rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-800 text-sm mb-2">{note.content}</p>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {note.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>By {note.author}</span>
                        <span>{new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {note.updatedAt !== note.createdAt && (
                        <div className="text-xs text-gray-400 mt-1">
                          Last updated: {new Date(note.updatedAt).toLocaleDateString()} at {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No notes found</p>
                <p className="text-xs text-gray-400 mt-1">Add your first note to start documenting this lead</p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Primary Actions */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Communication</h4>
              <div className="flex gap-2">
                <button 
                  onClick={() => addQuickActivity(currentLead.id, 'call_attempted', currentUser?.name || 'Current User')}
                  className="flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Call
                </button>
                <button 
                  onClick={() => addQuickActivity(currentLead.id, 'email_sent', currentUser?.name || 'Current User')}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
              </div>
            </div>
            
            {/* Sales Actions */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Sales Activities</h4>
              <div className="flex gap-2">
                <button 
                  onClick={() => addQuickActivity(currentLead.id, 'demo_scheduled', currentUser?.name || 'Current User')}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Monitor className="w-4 h-4" />
                  Demo
                </button>
                <button 
                  onClick={() => addQuickActivity(currentLead.id, 'proposal_needed', currentUser?.name || 'Current User')}
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <FileCheck className="w-4 h-4" />
                  Proposal
                </button>
              </div>
            </div>
          </div>
          
          {/* Quick Templates */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Templates</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'follow_up_1week', label: 'Schedule Follow-up', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
                { key: 'call_attempted', label: 'Call Attempted', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
                { key: 'email_sent', label: 'Email Sent', color: 'bg-green-100 text-green-700 hover:bg-green-200' }
              ].map((template) => (
                <button
                  key={template.key}
                  onClick={() => addQuickActivity(currentLead.id, template.key, currentUser?.name || 'Current User')}
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${template.color}`}
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>

          {/* Alternative Direct Action Buttons */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Direct Actions</h4>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  addActivity(currentLead.id, {
                    type: ACTIVITY_TYPES.CALL,
                    description: 'Phone call made to client',
                    user: currentUser?.name || 'Current User'
                  });
                }}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Phone className="w-4 h-4" />
                Log Call
              </button>
              <button 
                onClick={() => {
                  addActivity(currentLead.id, {
                    type: ACTIVITY_TYPES.EMAIL,
                    description: 'Email sent to client',
                    user: currentUser?.name || 'Current User'
                  });
                }}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Mail className="w-4 h-4" />
                Log Email
              </button>
              <button 
                onClick={() => {
                  addActivity(currentLead.id, {
                    type: ACTIVITY_TYPES.MEETING,
                    description: 'Meeting scheduled with client',
                    user: currentUser?.name || 'Current User'
                  });
                }}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Schedule Meeting
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Activity Timeline */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
              {currentLead.activities && currentLead.activities.length > 0 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                  {getFilteredActivities().length} activities
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowActivityFilters(!showActivityFilters)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  showActivityFilters 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Activity Filters */}
          {showActivityFilters && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Activity Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                    value={activityFilters.type}
                    onChange={(e) => setActivityFilters(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="all">All Types</option>
                    {Object.entries(ACTIVITY_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date Range</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                    value={activityFilters.dateRange}
                    onChange={(e) => setActivityFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Search activities..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                    value={activityFilters.search}
                    onChange={(e) => setActivityFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Add Activity Section */}
          <div className="mb-6 p-4 bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Log New Activity
            </h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                >
                  {Object.entries(ACTIVITY_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  {getActivityTemplates(activityType).map((template, index) => (
                    <button
                      key={index}
                      onClick={() => setActivityNote(template)}
                      className="px-3 py-2 bg-white border border-gray-300 text-xs text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title={`Use template: ${template}`}
                    >
                      Template {index + 1}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder={getActivityPlaceholder(activityType)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                  value={activityNote}
                  onChange={(e) => setActivityNote(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddActivity()}
                />
                <button
                  onClick={handleAddActivity}
                  disabled={!activityNote.trim()}
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Log Activity
                </button>
              </div>
            </div>
          </div>
          
          {/* Enhanced Timeline */}
          <div className="relative">
            {getFilteredActivities().length > 0 ? (
              <div className="space-y-6">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-200 via-blue-200 to-gray-200"></div>
                
                {getFilteredActivities().map((activity, index) => {
                  const { date, time } = formatDateTime(activity.timestamp);
                  const isFirst = index === 0;
                  const isRecent = isActivityRecent(activity.timestamp);
                  
                  return (
                    <div key={activity.id} className="relative flex gap-4">
                      {/* Timeline Node */}
                      <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-3 ${
                        isFirst 
                          ? 'bg-gradient-to-br from-teal-500 to-blue-500 border-white shadow-lg' 
                          : isRecent
                          ? 'bg-gradient-to-br from-blue-400 to-indigo-400 border-white shadow-md'
                          : 'bg-white border-gray-300 shadow-sm'
                      }`}>
                        {getEnhancedActivityIcon(activity.type, isFirst || isRecent)}
                      </div>
                      
                      {/* Activity Card */}
                      <div className={`flex-1 bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 ${
                        isFirst ? 'border-teal-200 bg-gradient-to-r from-teal-50 to-blue-50' :
                        isRecent ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                              ACTIVITY_TYPE_COLORS[activity.type] || 'bg-gray-100 text-gray-700 border-gray-200'
                            }`}>
                              {ACTIVITY_TYPE_LABELS[activity.type]}
                            </div>
                            {isFirst && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Latest
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{date} at {time}</span>
                            {isRecent && <span className="text-green-600 font-medium">• Recent</span>}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-800 mb-2 leading-relaxed">{activity.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="w-3 h-3 text-gray-500" />
                            </div>
                            <span className="text-xs text-gray-600 font-medium">{activity.user}</span>
                          </div>
                          {activity.metadata && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {activity.metadata.duration && (
                                <span>⏱ {activity.metadata.duration}</span>
                              )}
                              {activity.metadata.outcome && (
                                <span className={`px-2 py-1 rounded-full ${
                                  activity.metadata.outcome === 'positive' ? 'bg-green-100 text-green-700' :
                                  activity.metadata.outcome === 'negative' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {activity.metadata.outcome}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Lead Creation Marker */}
                <div className="relative flex gap-4 opacity-60">
                  <div className="relative z-10 flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center border-3 border-white shadow-sm">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                        Lead Created
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Lead was created and entered into the system</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatDateTime(currentLead.createdAt).date} at {formatDateTime(currentLead.createdAt).time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mb-2">No activities recorded yet</p>
                <p className="text-xs text-gray-400">Start by logging your first interaction with this lead</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadProfile;