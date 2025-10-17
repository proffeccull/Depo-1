export const validateEmail = (email: string): string | null => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!regex.test(email)) return 'Invalid email format';
  return null;
};

export const validatePhone = (phone: string): string | null => {
  const regex = /^\+?[1-9]\d{1,14}$/;
  if (!phone) return 'Phone is required';
  if (!regex.test(phone.replace(/\s/g, ''))) return 'Invalid phone format';
  return null;
};

export const validateRequired = (value: string, field: string): string | null => {
  if (!value || value.trim() === '') return `${field} is required`;
  return null;
};

export const validateMinLength = (value: string, min: number, field: string): string | null => {
  if (value.length < min) return `${field} must be at least ${min} characters`;
  return null;
};

export const validateForm = (fields: Record<string, any>, rules: Record<string, any>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  Object.keys(rules).forEach(key => {
    const rule = rules[key];
    const value = fields[key];
    
    if (rule.required) {
      const error = validateRequired(value, rule.label);
      if (error) errors[key] = error;
    }
    
    if (rule.email && value) {
      const error = validateEmail(value);
      if (error) errors[key] = error;
    }
    
    if (rule.phone && value) {
      const error = validatePhone(value);
      if (error) errors[key] = error;
    }
    
    if (rule.minLength && value) {
      const error = validateMinLength(value, rule.minLength, rule.label);
      if (error) errors[key] = error;
    }
  });
  
  return errors;
};
