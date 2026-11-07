import { View } from "@aws-amplify/ui-react";
import SyncTransactionsButton from "./SyncTransactionsButton";
import BudgetProgress from "./BudgetProgress";
import BudgetSection from "./BudgetSection";
import BudgetSkeleton from "./BudgetSkeleton";
import NoBudget from "./NoBudget";
import CategoryDetail from "./CategoryDetail";
import AddCategoryDialog from "./AddCategoryDialog";
import UncategorizedTray, { TRAY_HEIGHT } from "./UncategorizedTray";
import { useBudgetPage } from "../../hooks/useBudgetPage";
import { CATEGORY_TYPES } from "../../lib/types";

export default function BudgetPage() {
  const {
    view,
    isLoading,
    openCategory,
    setOpenCategory,
    addingType,
    setAddingType,
  } = useBudgetPage();

  if (isLoading) return <BudgetSkeleton />;
  if (!view) return <NoBudget />;

  const tray = (
    <UncategorizedTray
      transactions={view.uncategorized}
      categories={view.budget.categories}
    />
  );

  if (openCategory) {
    return (
      <View paddingBottom={view.uncategorized.length ? TRAY_HEIGHT : undefined}>
        <CategoryDetail
          key={openCategory.id}
          category={openCategory}
          allCategories={view.budget.categories}
          onBack={() => setOpenCategory(null)}
        />
        {tray}
      </View>
    );
  }

  return (
    <View paddingBottom={view.uncategorized.length ? TRAY_HEIGHT : undefined}>
      <SyncTransactionsButton />
      <BudgetProgress categories={view.categories} />
      {CATEGORY_TYPES.map((type) => (
        <BudgetSection
          key={type}
          type={type}
          categories={view.categories}
          onOpenCategory={(c) => setOpenCategory(c.id)}
          onAddCategory={setAddingType}
        />
      ))}
      {addingType && (
        <AddCategoryDialog
          type={addingType}
          onClose={() => setAddingType(null)}
        />
      )}
      {tray}
    </View>
  );
}
