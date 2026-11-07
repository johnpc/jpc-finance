import { useState } from "react";
import { useMonthView } from "./useMonthView";
import { CategoryType } from "../lib/types";

/** Budget tab state: the month view plus which category/dialog is open. */
export function useBudgetPage() {
  const { view, isLoading } = useMonthView();
  const [openCategoryId, setOpenCategory] = useState<string | null>(null);
  const [addingType, setAddingType] = useState<CategoryType | null>(null);

  // Resolve against the live view so the detail reflects edits, and falls
  // back to the budget once the category is deleted or the month changes.
  const openCategory =
    view?.categories.find((c) => c.id === openCategoryId) ?? null;

  return {
    view,
    isLoading,
    openCategory,
    setOpenCategory,
    addingType,
    setAddingType,
  };
}
