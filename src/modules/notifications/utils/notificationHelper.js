import useNotificationStore from '../stores/notificationStore';
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_CATEGORIES
} from '../constants';

class NotificationHelper {
  // Lead-related notifications
  static notifyLeadAssigned(leadData) {
    const { addNotification, logActivity } = useNotificationStore.getState();
    
    addNotification({
      type: NOTIFICATION_TYPES.LEAD_ASSIGNED,
      category: NOTIFICATION_CATEGORIES.LEADS,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      title: 'New Lead Assigned',
      message: `You have been assigned a new lead: ${leadData.name} from ${leadData.company}`,
      data: {
        leadId: leadData.id,
        leadName: leadData.name,
        company: leadData.company
      },
      actions: [
        { type: 'open_details', label: 'View Lead' },
        { type: 'mark_as_read', label: 'Mark as Read' }
      ]
    });

    logActivity({
      type: 'lead_assigned',
      userId: leadData.assignedTo,
      userName: leadData.assignedToName || 'System',
      description: `Assigned lead ${leadData.name} from ${leadData.company}`,
      data: leadData
    });
  }

  static notifyLeadStatusChanged(leadData, oldStatus, newStatus) {
    const { addNotification, logActivity } = useNotificationStore.getState();
    
    addNotification({
      type: NOTIFICATION_TYPES.LEAD_STATUS_CHANGED,
      category: NOTIFICATION_CATEGORIES.LEADS,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      title: 'Lead Status Updated',
      message: `${leadData.name}'s status changed from ${oldStatus} to ${newStatus}`,
      data: {
        leadId: leadData.id,
        leadName: leadData.name,
        oldStatus,
        newStatus
      }
    });

    logActivity({
      type: 'lead_status_changed',
      userId: leadData.updatedBy || 'system',
      userName: leadData.updatedByName || 'System',
      description: `Changed status of lead ${leadData.name} from ${oldStatus} to ${newStatus}`,
      data: leadData
    });
  }

  // Deal-related notifications
  static notifyDealWon(dealData) {
    const { addNotification, logActivity } = useNotificationStore.getState();
    
    addNotification({
      type: NOTIFICATION_TYPES.DEAL_WON,
      category: NOTIFICATION_CATEGORIES.DEALS,
      priority: NOTIFICATION_PRIORITIES.URGENT,
      title: 'Deal Won! 🎉',
      message: `Congratulations! You closed the deal with ${dealData.company} for $${dealData.amount.toLocaleString()}`,
      data: dealData,
      actions: [
        { type: 'open_details', label: 'View Deal' }
      ]
    });

    logActivity({
      type: 'deal_won',
      userId: dealData.ownerId,
      userName: dealData.ownerName || 'System',
      description: `Won deal with ${dealData.company} worth $${dealData.amount.toLocaleString()}`,
      data: dealData
    });
  }

  static notifyDealLost(dealData) {
    const { addNotification, logActivity } = useNotificationStore.getState();
    
    addNotification({
      type: NOTIFICATION_TYPES.DEAL_LOST,
      category: NOTIFICATION_CATEGORIES.DEALS,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      title: 'Deal Lost',
      message: `Deal with ${dealData.company} was marked as lost. Reason: ${dealData.lostReason || 'Not specified'}`,
      data: dealData
    });

    logActivity({
      type: 'deal_lost',
      userId: dealData.ownerId,
      userName: dealData.ownerName || 'System',
      description: `Lost deal with ${dealData.company}`,
      data: dealData
    });
  }

  // Task-related notifications
  static notifyTaskAssigned(taskData) {
    const { addNotification, logActivity } = useNotificationStore.getState();
    
    addNotification({
      type: NOTIFICATION_TYPES.TASK_ASSIGNED,
      category: NOTIFICATION_CATEGORIES.TASKS,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      title: 'New Task Assigned',
      message: `You have been assigned a new task: ${taskData.title}`,
      data: taskData,
      actions: [
        { type: 'open_details', label: 'View Task' }
      ]
    });

    logActivity({
      type: 'task_assigned',
      userId: taskData.assignedTo,
      userName: taskData.assignedToName || 'System',
      description: `Assigned task: ${taskData.title}`,
      data: taskData
    });
  }

  static notifyTaskOverdue(taskData) {
    const { addNotification } = useNotificationStore.getState();
    
    addNotification({
      type: NOTIFICATION_TYPES.TASK_OVERDUE,
      category: NOTIFICATION_CATEGORIES.TASKS,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      title: 'Task Overdue',
      message: `${taskData.title} is overdue by ${taskData.overdueDays} days`,
      data: taskData,
      actions: [
        { type: 'open_details', label: 'View Task' },
        { type: 'snooze', label: 'Snooze' }
      ]
    });
  }

  static notifyTaskCompleted(taskData) {
    const { addNotification, logActivity } = useNotificationStore.getState();
    
    addNotification({
      type: NOTIFICATION_TYPES.TASK_COMPLETED,
      category: NOTIFICATION_CATEGORIES.TASKS,
      priority: NOTIFICATION_PRIORITIES.LOW,
      title: 'Task Completed',
      message: `${taskData.title} has been marked as completed`,
      data: taskData
    });

    logActivity({
      type: 'task_completed',
      userId: taskData.completedBy,
      userName: taskData.completedByName || 'System',
      description: `Completed task: ${taskData.title}`,
      data: taskData
    });
  }

  // Meeting-related notifications
  static notifyMeetingScheduled(meetingData) {
    const { addNotification, logActivity } = useNotificationStore.getState();
    
    addNotification({
      type: NOTIFICATION_TYPES.MEETING_SCHEDULED,
      category: NOTIFICATION_CATEGORIES.MEETINGS,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      title: 'Meeting Scheduled',
      message: `${meetingData.title} scheduled for ${new Date(meetingData.startTime).toLocaleString()}`,
      data: meetingData,
      actions: [
        { type: 'open_details', label: 'View Meeting' }
      ]
    });

    logActivity({
      type: 'meeting_created',
      userId: meetingData.createdBy,
      userName: meetingData.createdByName || 'System',
      description: `Scheduled meeting: ${meetingData.title}`,
      data: meetingData
    });
  }

  static notifyMeetingReminder(meetingData) {
    const { addNotification } = useNotificationStore.getState();
    
    addNotification({
      type: NOTIFICATION_TYPES.MEETING_REMINDER,
      category: NOTIFICATION_CATEGORIES.MEETINGS,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      title: `Meeting in ${meetingData.minutesUntil} minutes`,
      message: `${meetingData.title} starts at ${new Date(meetingData.startTime).toLocaleTimeString()}`,
      data: meetingData,
      actions: [
        { type: 'open_details', label: 'View Meeting' },
        { type: 'mark_as_read', label: 'Dismiss' }
      ]
    });
  }

  // Performance-related notifications
  static notifyTargetAchieved(performanceData) {
    const { addNotification, logActivity } = useNotificationStore.getState();
    
    addNotification({
      type: NOTIFICATION_TYPES.TARGET_ACHIEVED,
      category: NOTIFICATION_CATEGORIES.PERFORMANCE,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      title: 'Target Achieved! 🏆',
      message: `You have achieved ${performanceData.percentage}% of your ${performanceData.period} target`,
      data: performanceData,
      actions: [
        { type: 'open_details', label: 'View Performance' }
      ]
    });

    logActivity({
      type: 'target_achieved',
      userId: performanceData.userId,
      userName: performanceData.userName || 'System',
      description: `Achieved ${performanceData.percentage}% of ${performanceData.period} target`,
      data: performanceData
    });
  }

  static notifyPerformanceMilestone(milestoneData) {
    const { addNotification } = useNotificationStore.getState();
    
    addNotification({
      type: NOTIFICATION_TYPES.PERFORMANCE_MILESTONE,
      category: NOTIFICATION_CATEGORIES.PERFORMANCE,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      title: 'Milestone Reached! 🎯',
      message: milestoneData.message,
      data: milestoneData
    });
  }

  // Team-related notifications
  static notifyTeamAnnouncement(announcementData) {
    const { addNotification } = useNotificationStore.getState();
    
    addNotification({
      type: NOTIFICATION_TYPES.TEAM_ANNOUNCEMENT,
      category: NOTIFICATION_CATEGORIES.TEAM,
      priority: announcementData.priority || NOTIFICATION_PRIORITIES.MEDIUM,
      title: announcementData.title,
      message: announcementData.message,
      data: announcementData
    });
  }

  static notifyUserMention(mentionData) {
    const { addNotification } = useNotificationStore.getState();
    
    addNotification({
      type: NOTIFICATION_TYPES.USER_MENTION,
      category: NOTIFICATION_CATEGORIES.TEAM,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      title: 'You were mentioned',
      message: `${mentionData.mentionedBy} mentioned you in ${mentionData.context}`,
      data: mentionData,
      actions: [
        { type: 'open_details', label: 'View' }
      ]
    });
  }

  // System-related notifications
  static notifySystemUpdate(updateData) {
    const { addNotification } = useNotificationStore.getState();
    
    addNotification({
      type: NOTIFICATION_TYPES.SYSTEM_UPDATE,
      category: NOTIFICATION_CATEGORIES.SYSTEM,
      priority: NOTIFICATION_PRIORITIES.LOW,
      title: 'System Update',
      message: updateData.message,
      data: updateData
    });
  }

  static notifyIntegrationAlert(integrationData) {
    const { addNotification, logActivity } = useNotificationStore.getState();
    
    addNotification({
      type: NOTIFICATION_TYPES.INTEGRATION_ALERT,
      category: NOTIFICATION_CATEGORIES.SYSTEM,
      priority: integrationData.priority || NOTIFICATION_PRIORITIES.MEDIUM,
      title: `${integrationData.integration} Alert`,
      message: integrationData.message,
      data: integrationData
    });

    if (integrationData.connected !== undefined) {
      logActivity({
        type: integrationData.connected ? 'integration_connected' : 'integration_disconnected',
        userId: integrationData.userId || 'system',
        userName: integrationData.userName || 'System',
        description: `${integrationData.connected ? 'Connected' : 'Disconnected'} ${integrationData.integration}`,
        data: integrationData
      });
    }
  }

  // Approval-related notifications
  static notifyApprovalRequired(approvalData) {
    const { addNotification } = useNotificationStore.getState();
    
    addNotification({
      type: NOTIFICATION_TYPES.APPROVAL_REQUIRED,
      category: NOTIFICATION_CATEGORIES.APPROVALS,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      title: 'Approval Required',
      message: `${approvalData.requestedBy} is requesting approval for ${approvalData.item}`,
      data: approvalData,
      actions: [
        { type: 'approve', label: 'Approve' },
        { type: 'reject', label: 'Reject' },
        { type: 'open_details', label: 'View Details' }
      ]
    });
  }

  static notifyApprovalGranted(approvalData) {
    const { addNotification } = useNotificationStore.getState();
    
    addNotification({
      type: NOTIFICATION_TYPES.APPROVAL_GRANTED,
      category: NOTIFICATION_CATEGORIES.APPROVALS,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      title: 'Approval Granted',
      message: `Your request for ${approvalData.item} has been approved by ${approvalData.approvedBy}`,
      data: approvalData
    });
  }

  // Generic notifications
  static notifyWarning(warningData) {
    const { addNotification } = useNotificationStore.getState();
    
    addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      category: warningData.category || NOTIFICATION_CATEGORIES.SYSTEM,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      title: warningData.title || 'Warning',
      message: warningData.message,
      data: warningData
    });
  }

  static notifyError(errorData) {
    const { addNotification } = useNotificationStore.getState();
    
    addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      category: errorData.category || NOTIFICATION_CATEGORIES.SYSTEM,
      priority: NOTIFICATION_PRIORITIES.URGENT,
      title: errorData.title || 'Error',
      message: errorData.message,
      data: errorData
    });
  }

  // Utility method to create custom notifications
  static notify(notificationData) {
    const { addNotification } = useNotificationStore.getState();
    return addNotification(notificationData);
  }

  // Activity logging helpers
  static logUserActivity(activityType, description, data = {}) {
    const { logActivity } = useNotificationStore.getState();
    
    logActivity({
      type: activityType,
      userId: data.userId || 'system',
      userName: data.userName || 'System',
      description,
      data
    });
  }
}

export default NotificationHelper;