import { Session } from '../../api/breakService';

/**
 * Notification interface
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * Send a notification to the user
 */
export const sendNotification = async (userId: string, notification: {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  metadata?: Record<string, unknown>;
}): Promise<void> => {
  // In a real implementation, this would call your backend API
  console.log(`[Notification] ${notification.title}: ${notification.message}`, notification);
  
  // This is where you would integrate with a real notification service
  // For now, we'll just log to the console
  if (Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.message,
      // Add any other notification options here
    });
  }
};

/**
 * Schedule a notification for a future time
 */
export const scheduleNotification = async (
  userId: string,
  notification: {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    scheduledTime: Date;
    metadata?: Record<string, unknown>;
  }
): Promise<string> => {
  const delay = notification.scheduledTime.getTime() - Date.now();
  
  if (delay <= 0) {
    await sendNotification(userId, notification);
    return 'notification-sent';
  }
  
  const timeoutId = setTimeout(() => {
    sendNotification(userId, notification);
  }, delay);
  
  return `timeout:${timeoutId}`;
};

/**
 * Get user's notification history
 */
export const getNotificationHistory = async (
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    read?: boolean;
  } = {}
): Promise<{ notifications: Notification[]; total: number }> => {
  // In a real implementation, this would fetch from your backend
  console.log(`Fetching notifications for user ${userId}`, options);
  
  return {
    notifications: [],
    total: 0,
  };
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (userId: string, notificationId: string): Promise<void> => {
  // In a real implementation, this would update the notification in your backend
  console.log(`Marking notification ${notificationId} as read for user ${userId}`);
};

/**
 * Schedule a break reminder notification
 */
export const scheduleBreakReminder = async (
  userId: string,
  session: Session,
  scheduledTime: Date
): Promise<string> => {
  return scheduleNotification(userId, {
    title: 'Break Reminder',
    message: 'Time to take a break! Your session has been running for a while.',
    type: 'info',
    scheduledTime,
    metadata: {
      sessionId: session.id,
      sessionDuration: session.focus_duration,
      type: 'break_reminder',
    },
  });
};

/**
 * Schedule a session summary notification
 */
export const scheduleSessionSummary = async (
  userId: string,
  session: Session,
  scheduledTime: Date
): Promise<string> => {
  return scheduleNotification(userId, {
    title: 'Session Summary',
    message: `Great job! You focused for ${session.focus_duration} minutes.`,
    type: 'success',
    scheduledTime,
    metadata: {
      sessionId: session.id,
      type: 'session_summary',
    },
  });
};
