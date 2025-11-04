interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  return { isValid: true };
};

export const validateTimerDuration = (duration: number): ValidationResult => {
  if (isNaN(duration) || duration <= 0) {
    return { isValid: false, message: 'Duration must be a positive number' };
  }
  if (duration > 1440) {
    return { isValid: false, message: 'Duration cannot exceed 24 hours (1440 minutes)' };
  }
  return { isValid: true };
};
