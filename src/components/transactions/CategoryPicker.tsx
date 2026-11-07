import { SelectField } from "@aws-amplify/ui-react";
import { sectionCategories } from "../../lib/budgetMath";
import { CATEGORY_TYPES, CategoryEntity } from "../../lib/types";

type Props = {
  categories: CategoryEntity[];
  value: string | null;
  onChange: (categoryId: string | null) => void;
};

const UNCATEGORIZED = "";

/** Category select grouped by section; choosing one applies immediately. */
export function CategoryPicker({ categories, value, onChange }: Props) {
  return (
    <SelectField
      label="Category"
      value={value ?? UNCATEGORIZED}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value={UNCATEGORIZED}>Uncategorized</option>
      {CATEGORY_TYPES.map((type) => (
        <optgroup key={type} label={type}>
          {sectionCategories(categories, type).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </optgroup>
      ))}
    </SelectField>
  );
}
