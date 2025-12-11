/**
 * Formats milliseconds into MM:SS format
 * @param ms - Time in milliseconds
 * @returns Formatted time string (e.g., "25:00")
 */
export const formatTime = (ms: number): string => {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Formats a Date object into a time string
 * @param date - Date object to format
 * @returns Formatted time string (e.g., "14:30")
 */
export const formatTimeFromDate = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
