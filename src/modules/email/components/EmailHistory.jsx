import React, { useState } from 'react';
import { Mail, MailOpen, Reply, ExternalLink, Filter, Calendar, User, Building, Eye, X } from 'lucide-react';
import useEmailStore from '../stores/emailStore';
import useLeadStore from '../../leads/stores/leadStore';
import ExternalEmailIndicator from './ExternalEmailIndicator';

const EmailHistory = ({ emails, onLeadSelect, searchTerm, onSearchChange }) => {
  const { trackEmailOpen, getEmailsByLead } = useEmailStore();
  const { leads } = useLeadStore();
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const getLeadInfo = (leadId) => {
    return leads.find(lead => lead.id === leadId);
  };

  const getStatusIcon = (email) => {
    if (email.tracking?.replied) {
      return <Reply className="w-4 h-4 text-green-600" title="Replied" />;
    } else if (email.tracking?.opened) {
      return <MailOpen className="w-4 h-4 text-blue-600" title="Opened" />;
    } else if (email.status === 'sent') {
      return <Mail className="w-4 h-4 text-gray-400" title="Sent" />;
    }
    return <Mail className="w-4 h-4 text-gray-400" />;
  };

  const getStatusText = (email) => {
    if (email.tracking?.replied) return 'Replied';
    if (email.tracking?.opened) return 'Opened';
    if (email.status === 'sent') return 'Sent';
    return 'Draft';
  };

  const getStatusColor = (email) => {
    if (email.tracking?.replied) return 'text-green-600 bg-green-50';
    if (email.tracking?.opened) return 'text-blue-600 bg-blue-50';
    if (email.status === 'sent') return 'text-gray-600 bg-gray-50';
    return 'text-amber-600 bg-amber-50';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
  };

  const filteredEmails = emails.filter(email => {
    if (statusFilter !== 'all') {
      if (statusFilter === 'replied' && !email.tracking?.replied) return false;
      if (statusFilter === 'opened' && (!email.tracking?.opened || email.tracking?.replied)) return false;
      if (statusFilter === 'sent' && (email.tracking?.opened || email.tracking?.replied)) return false;
    }

    if (dateFilter !== 'all') {
      const emailDate = new Date(email.createdAt);
      const now = new Date();
      const diffDays = Math.ceil((now - emailDate) / (1000 * 60 * 60 * 24));
      
      if (dateFilter === 'today' && diffDays > 1) return false;
      if (dateFilter === 'week' && diffDays > 7) return false;
      if (dateFilter === 'month' && diffDays > 30) return false;
    }

    return true;
  });

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
    
    // Mark as opened if not already opened
    if (!email.tracking?.opened && email.tracking?.trackingId) {
      trackEmailOpen(email.tracking.trackingId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Email History</h2>
        <p className="text-sm text-gray-600">View and track all your sent emails</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search emails by subject, recipient, or content..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="sent">Sent Only</option>
              <option value="opened">Opened</option>
              <option value="replied">Replied</option>
            </select>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Email List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {filteredEmails.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredEmails.map((email) => {
              const leadInfo = email.leadId ? getLeadInfo(email.leadId) : null;
              
              return (
                <div
                  key={email.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleEmailClick(email)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(email)}
                        <h3 className="font-semibold text-gray-900 truncate">
                          {email.subject}
                        </h3>
                        <ExternalEmailIndicator email={email} size="small" />
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(email)}`}>
                          {getStatusText(email)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>To: {email.recipientName || email.toEmail}</span>
                        </div>
                        
                        {leadInfo && (
                          <div className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            <span>{leadInfo.companyName}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(email.createdAt)}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {email.body}
                      </p>
                      
                      {/* Email Tracking Info */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {email.templateUsed && (
                          <span>Template: {email.templateUsed}</span>
                        )}
                        
                        {email.tracking?.opened && (
                          <span>Opened: {formatDate(email.tracking.openedAt)}</span>
                        )}
                        
                        {email.tracking?.replied && (
                          <span>Replied: {formatDate(email.tracking.repliedAt)}</span>
                        )}
                        
                        {email.tracking?.clickedLinks?.length > 0 && (
                          <span>Links clicked: {email.tracking.clickedLinks.length}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex flex-col items-end gap-2">
                      <span className="text-xs text-gray-500">
                        {new Date(email.createdAt).toLocaleTimeString()}
                      </span>
                      
                      {leadInfo && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onLeadSelect(leadInfo);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Lead
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No emails found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Start by composing and sending your first email'}
            </p>
          </div>
        )}
      </div>

      {/* Email Detail Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-2xl max-h-[80vh] overflow-y-auto m-4 w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedEmail)}
                  <h3 className="text-lg font-semibold">{selectedEmail.subject}</h3>
                </div>
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Email Headers */}
              <div className="mt-4 space-y-2 text-sm">
                <div><strong>From:</strong> {selectedEmail.senderName} &lt;{selectedEmail.fromEmail}&gt;</div>
                <div><strong>To:</strong> {selectedEmail.recipientName} &lt;{selectedEmail.toEmail}&gt;</div>
                {selectedEmail.ccEmails && (
                  <div><strong>CC:</strong> {selectedEmail.ccEmails}</div>
                )}
                <div><strong>Date:</strong> {new Date(selectedEmail.createdAt).toLocaleString()}</div>
                <div><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded ${getStatusColor(selectedEmail)}`}>
                    {getStatusText(selectedEmail)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Email Content */}
            <div className="p-6">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-900">
                  {selectedEmail.body}
                </div>
              </div>
              
              {/* Tracking Information */}
              {selectedEmail.tracking && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Email Tracking</h4>
                  <div className="space-y-2 text-sm">
                    {selectedEmail.tracking.opened && (
                      <div className="flex items-center gap-2">
                        <MailOpen className="w-4 h-4 text-blue-600" />
                        <span>Opened on {new Date(selectedEmail.tracking.openedAt).toLocaleString()}</span>
                      </div>
                    )}
                    
                    {selectedEmail.tracking.replied && (
                      <div className="flex items-center gap-2">
                        <Reply className="w-4 h-4 text-green-600" />
                        <span>Replied on {new Date(selectedEmail.tracking.repliedAt).toLocaleString()}</span>
                      </div>
                    )}
                    
                    {selectedEmail.tracking.clickedLinks && selectedEmail.tracking.clickedLinks.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <ExternalLink className="w-4 h-4 text-purple-600" />
                          <span>Links Clicked:</span>
                        </div>
                        <ul className="ml-6 space-y-1">
                          {selectedEmail.tracking.clickedLinks.map((link, index) => (
                            <li key={index} className="text-xs text-gray-600">
                              {link.url} - {new Date(link.clickedAt).toLocaleString()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {!selectedEmail.tracking.opened && !selectedEmail.tracking.replied && (
                      <div className="text-gray-600">No tracking activity yet</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-end gap-3">
                {selectedEmail.leadId && (
                  <button
                    onClick={() => {
                      const lead = getLeadInfo(selectedEmail.leadId);
                      if (lead) onLeadSelect(lead);
                      setSelectedEmail(null);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    View Lead
                  </button>
                )}
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailHistory;