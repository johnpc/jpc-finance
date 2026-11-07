import { useState } from "react";

/**
 * Track a selected item by id and always resolve it against the latest list,
 * so an open dialog reflects optimistic edits instead of a stale snapshot.
 * The selection clears itself when the item leaves the list.
 */
export function useSelection<T extends { id: string }>(items: T[]) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = items.find((item) => item.id === selectedId) ?? null;
  return {
    selected,
    select: (item: T) => setSelectedId(item.id),
    clear: () => setSelectedId(null),
  };
}
