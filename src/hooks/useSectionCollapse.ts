import { useCallback, useState } from "react";
import { readJson, toggleInList, writeJson } from "../lib/browserStorage";
import { CategoryType } from "../lib/types";

// Same key the iOS app uses, for consistency (storage itself is per-device).
const STORAGE_KEY = "budget.collapsedSections";

/** Whether a budget section is collapsed, remembered across reloads. */
export function useSectionCollapse(type: CategoryType) {
  const [collapsed, setCollapsedState] = useState(() =>
    readJson<string[]>(STORAGE_KEY, []).includes(type),
  );

  const setCollapsed = useCallback(
    (next: boolean) => {
      setCollapsedState(next);
      writeJson(
        STORAGE_KEY,
        toggleInList(readJson<string[]>(STORAGE_KEY, []), type, next),
      );
    },
    [type],
  );

  return { collapsed, setCollapsed, toggle: () => setCollapsed(!collapsed) };
}
