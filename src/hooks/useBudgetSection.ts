import { useDrop } from "react-dnd";
import { useSectionCollapse } from "./useSectionCollapse";
import { sectionCategories, sectionTotals } from "../lib/budgetMath";
import { TRANSACTION_DRAG_TYPE } from "../lib/dndConfig";
import { CategoryType, CategoryWithTransactions } from "../lib/types";

/** A budget section's rows, totals, and remembered collapsed state. */
export function useBudgetSection(
  type: CategoryType,
  categories: CategoryWithTransactions[],
) {
  const { collapsed, setCollapsed, toggle } = useSectionCollapse(type);

  // Dragging a transaction over a collapsed header springs the section open
  // so its category rows become drop targets.
  const [, headerDropRef] = useDrop(
    () => ({
      accept: TRANSACTION_DRAG_TYPE,
      hover: () => collapsed && setCollapsed(false),
      canDrop: () => false,
    }),
    [collapsed, setCollapsed],
  );

  const rows = sectionCategories(categories, type);
  return {
    collapsed,
    toggle,
    headerDropRef,
    rows,
    totals: sectionTotals(rows),
  };
}
