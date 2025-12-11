import { scheduleNotification } from '../services/notificationService';
import { getHistoricalSessionData, analyzeUserSessionPatterns } from '../services/sessionService';

/**
 * Server Action: Schedule a smart break reminder for the user.
 * 1. Fetches historical sessions.
 * 2. Analyzes patterns to find optimal break time.
 * 3. Schedules a notification at the predicted moment.
 *
 * Returns the identifier from `scheduleNotification` or throws on failure.
 */
export const scheduleSmartReminder = async (
  userId: string,
  options: { sessionLimit?: number } = {}
): Promise<string> => {
  try {
    const historical = await getHistoricalSessionData(userId, options.sessionLimit ?? 100);
    const predictedTime = analyzeUserSessionPatterns(historical);

    // Compose notification payload
    const id = await scheduleNotification(userId, {
      title: 'Suggested Break',
      message: 'Based on your recent focus sessions, consider taking a break soon!',
      type: 'info',
      scheduledTime: predictedTime,
      metadata: {
        reason: 'smart_reminder',
        predictedTime: predictedTime.toISOString(),
      },
    });

    return id;
  } catch (err) {
    console.error('[scheduleSmartReminder] failed:', err);
    throw err;
  }
};
