import { addMonths, subMonths } from "date-fns";
import { useDate } from "./useDateHook";
import { formatBudgetMonth, formatMonthYear } from "../lib/dateUtils";

export function useMonthNavigation() {
  const { date, setDate } = useDate();
  return {
    label: formatMonthYear(date),
    isCurrentMonth: formatBudgetMonth(date) === formatBudgetMonth(new Date()),
    previous: () => setDate(subMonths(date, 1)),
    next: () => setDate(addMonths(date, 1)),
    today: () => setDate(new Date()),
  };
}
