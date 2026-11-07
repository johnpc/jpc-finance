// The bank-provided `name` is immutable; a user edit is stored as an optional
// `displayName` override that the UI prefers when present.

type Named = { name: string; displayName?: string | null };

export const displayedName = ({ name, displayName }: Named): string =>
  displayName ? displayName : name;

/**
 * Normalize an edit into the override to store. Null clears the override when
 * the edit is blank or matches the original, so we never persist a redundant
 * copy of the bank's name.
 */
export const normalizeDisplayName = (
  edited: string,
  originalName: string,
): string | null => {
  const trimmed = edited.trim();
  if (!trimmed || trimmed === originalName) return null;
  return trimmed;
};
