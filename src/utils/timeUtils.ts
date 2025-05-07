/**
 * Calculate expected return time based on destination type
 * 30s to reach destination + 60s at destination + 30s to return
 */
export const calculateExpectedReturnTime = (startTime: number, destinationType: string): number => {
  // Base time: 2 minutes (120 seconds)
  const baseTimeInSeconds = 120;
  
  // If destination is a restroom, we expect the student to take 2 minutes
  // For other types, adjust as needed
  const multiplier = destinationType === 'restroom' ? 1 : 0.75;
  
  return startTime + (baseTimeInSeconds * 1000 * multiplier);
};

/**
 * Format time remaining in a human-readable format
 */
export const formatTimeRemaining = (timeInMs: number): string => {
  if (timeInMs <= 0) return 'Overdue';
  
  const seconds = Math.floor(timeInMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
};

/**
 * Get status based on expected return time
 */
export const getStatus = (expectedReturnTime: number): 'on-time' | 'warning' | 'overdue' => {
  const now = Date.now();
  const timeRemaining = expectedReturnTime - now;
  
  if (timeRemaining <= 0) {
    return 'overdue';
  }
  
  if (timeRemaining < 30000) { // Less than 30 seconds
    return 'warning';
  }
  
  return 'on-time';
};