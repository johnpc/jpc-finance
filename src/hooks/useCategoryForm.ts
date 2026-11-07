import { FormEvent, useState } from "react";
import { validateCategoryName } from "../lib/categoryName";
import { parseDollarInput, toDollars } from "../lib/currency";

type Values = { name: string; plannedAmount: number };

/** Name + target form state with validation, for creating or editing a category. */
export function useCategoryForm(
  initial: Values,
  onValid: (values: Values) => void,
) {
  const [name, setNameState] = useState(initial.name);
  const [amount, setAmountState] = useState(
    initial.plannedAmount ? toDollars(initial.plannedAmount).toFixed(2) : "",
  );
  const [showErrors, setShowErrors] = useState(false);

  const nameError = showErrors
    ? (validateCategoryName(name) ?? undefined)
    : undefined;
  const plannedAmount = parseDollarInput(amount);
  const amountError =
    showErrors && plannedAmount === null
      ? "Enter an amount like 250 or 99.99"
      : undefined;

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (validateCategoryName(name) || plannedAmount === null) {
      setShowErrors(true);
      return;
    }
    onValid({ name: name.trim(), plannedAmount });
  };

  const isDirty =
    name.trim() !== initial.name ||
    (plannedAmount ?? -1) !== initial.plannedAmount;

  return {
    name,
    setName: setNameState,
    amount,
    setAmount: setAmountState,
    nameError,
    amountError,
    isDirty,
    submit,
  };
}
