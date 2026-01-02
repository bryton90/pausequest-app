import { Session } from '@/api/breakService';

/**
 * Advanced notification service with enhanced features
 */
export interface AdvancedNotificationOptions {
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: string;
  }>;
  icon?: string;
  sound?: string;
  vibration?: boolean;
}

export interface NotificationHistoryItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'achievement' | 'info' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  persistent: boolean;
  createdAt: string;
  sessionId?: number;
  userId: string;
}

/**
 * Send session summary notification with enhanced features
 */
export const sendSessionSummary = async (
  session: Session,
  options: AdvancedNotificationOptions = {}
): Promise<void> => {
  const { priority = 'medium', persistent = false, sound, vibration = true } = options;
  
  // Log the session summary
  console.log(`[AdvancedNotification] Session Summary:`, {
    sessionId: session.id,
    userId: session.userId,
    focusDuration: session.focus_duration,
    breakDuration: session.break_duration,
    mood: session.mood_emoji,
    priority,
    persistent
  });
  
  // Create notification title and message
  const title = 'Session Complete! 🎉';
  const message = `Great job! You focused for ${Math.floor(session.focus_duration / 60)} minutes${session.break_duration ? ` and took a ${Math.floor(session.break_duration / 60)} minute break` : ''}.`;
  
  // Send browser notification if permission is granted
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body: message,
      icon: options.icon || '/favicon.ico',
      tag: `session-${session.id}`,
      requireInteraction: persistent,
      silent: sound !== undefined ? !sound : false
    });
    
    // Add vibration if supported and requested
    if (vibration && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
    
    // Handle notification click
    notification.onclick = () => {
      notification.close();
      window.focus();
    };
    
    // Auto-close after 5 seconds if not persistent
    if (!persistent) {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  }
  
  // Store in localStorage for notification history
  try {
    const notificationHistory: NotificationHistoryItem[] = JSON.parse(localStorage.getItem(`notifications-${session.userId}`) || '[]');
    notificationHistory.push({
      id: `session-${session.id}-${Date.now()}`,
      title,
      message,
      type: 'success',
      priority,
      persistent,
      createdAt: new Date().toISOString(),
      sessionId: session.id,
      userId: session.userId
    });
    
    // Keep only last 50 notifications
    if (notificationHistory.length > 50) {
      notificationHistory.splice(0, notificationHistory.length - 50);
    }
    
    localStorage.setItem(`notifications-${session.userId}`, JSON.stringify(notificationHistory));
  } catch (error) {
    console.error('[AdvancedNotification] Failed to store notification history:', error instanceof Error ? error.message : String(error));
  }
};

/**
 * Send achievement notification
 */
export const sendAchievementNotification = async (
  userId: string,
  achievement: {
    title: string;
    description: string;
    icon: string;
  },
  options: AdvancedNotificationOptions = {}
): Promise<void> => {
  const { priority = 'high', persistent = true } = options;
  
  console.log(`[AdvancedNotification] Achievement Unlocked:`, {
    userId,
    achievement,
    priority
  });
  
  const title = `🏆 ${achievement.title}`;
  const message = achievement.description;
  
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body: message,
      icon: options.icon || '/favicon.ico',
      tag: `achievement-${achievement.title}`,
      requireInteraction: persistent
    });
    
    // Celebration vibration pattern
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }
    
    notification.onclick = () => {
      notification.close();
      window.focus();
    };
    
    setTimeout(() => {
      notification.close();
    }, 8000);
  }
  
  // Store achievement notification
  try {
    const notificationHistory: NotificationHistoryItem[] = JSON.parse(localStorage.getItem(`notifications-${userId}`) || '[]');
    notificationHistory.push({
      id: `achievement-${achievement.title}-${Date.now()}`,
      title,
      message,
      type: 'achievement',
      priority,
      persistent,
      createdAt: new Date().toISOString(),
      userId
    });
    
    if (notificationHistory.length > 50) {
      notificationHistory.splice(0, notificationHistory.length - 50);
    }
    
    localStorage.setItem(`notifications-${userId}`, JSON.stringify(notificationHistory));
  } catch (error) {
    console.error('[AdvancedNotification] Failed to store achievement notification:', error instanceof Error ? error.message : String(error));
  }
};

/**
 * Request notification permissions
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

/**
 * Get notification history for a user
 */
export const getNotificationHistory = async (
  userId: string,
  limit: number = 20
): Promise<NotificationHistoryItem[]> => {
  try {
    const history: NotificationHistoryItem[] = JSON.parse(localStorage.getItem(`notifications-${userId}`) || '[]');
    return history.slice(-limit).reverse();
  } catch (error: unknown) {
    console.error('[AdvancedNotification] Failed to get notification history:', error instanceof Error ? error.message : String(error));
    return [];
  }
};

/**
 * Clear notification history for a user
 */
export const clearNotificationHistory = async (userId: string): Promise<void> => {
  try {
    localStorage.removeItem(`notifications-${userId}`);
  } catch (error) {
    console.error('[AdvancedNotification] Failed to clear notification history:', error instanceof Error ? error.message : String(error));
  }
};

// Export the service as a default object
export const advancedNotificationService = {
  sendSessionSummary,
  sendAchievementNotification,
  requestNotificationPermission,
  getNotificationHistory,
  clearNotificationHistory
};
