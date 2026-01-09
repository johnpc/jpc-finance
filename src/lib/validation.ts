export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

export const validators = {
  categoryName: (name: string): ValidationResult => {
    const trimmed = name.trim();
    if (!trimmed) return { isValid: false, error: "Name cannot be empty" };
    if (trimmed.length > 50)
      return { isValid: false, error: "Name must be 50 characters or less" };
    if (trimmed.length < 2)
      return { isValid: false, error: "Name must be at least 2 characters" };
    return { isValid: true };
  },

  amount: (value: string): ValidationResult => {
    const num = parseFloat(value);
    if (isNaN(num))
      return { isValid: false, error: "Please enter a valid number" };
    if (num < 0) return { isValid: false, error: "Amount cannot be negative" };
    if (num > 1000000)
      return { isValid: false, error: "Amount must be less than $1,000,000" };
    return { isValid: true };
  },

  required: (value: string): ValidationResult => {
    if (!value.trim())
      return { isValid: false, error: "This field is required" };
    return { isValid: true };
  },

  maxLength:
    (max: number) =>
    (value: string): ValidationResult => {
      if (value.length > max)
        return {
          isValid: false,
          error: `Must be ${max} characters or less`,
        };
      return { isValid: true };
    },

  minLength:
    (min: number) =>
    (value: string): ValidationResult => {
      if (value.length < min)
        return {
          isValid: false,
          error: `Must be at least ${min} characters`,
        };
      return { isValid: true };
    },

  compose:
    (...validators: Array<(value: string) => ValidationResult>) =>
    (value: string): ValidationResult => {
      for (const validator of validators) {
        const result = validator(value);
        if (!result.isValid) return result;
      }
      return { isValid: true };
    },
};
