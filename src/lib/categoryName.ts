/** Returns an error message, or null when the category name is acceptable. */
export const validateCategoryName = (name: string): string | null => {
  const trimmed = name.trim();
  if (!trimmed) return "Name cannot be empty";
  if (trimmed.length > 50) return "Name must be 50 characters or less";
  return null;
};
