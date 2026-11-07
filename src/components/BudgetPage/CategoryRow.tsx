import { Flex, Text, useTheme } from "@aws-amplify/ui-react";
import { useCategoryDrop } from "../../hooks/useCategoryDrop";
import { categoryStatus, StatusLevel } from "../../lib/categoryStatus";
import { formatMoney } from "../../lib/currency";
import { CategoryWithTransactions } from "../../lib/types";

type Props = {
  category: CategoryWithTransactions;
  onOpen: (category: CategoryWithTransactions) => void;
};

/** One category: target vs. actual, color-coded, and a drop target for transactions. */
export default function CategoryRow({ category, onOpen }: Props) {
  const { tokens } = useTheme();
  const { isOver, dropRef } = useCategoryDrop(category.id);
  const status = categoryStatus(category);

  const backgrounds: Record<StatusLevel, string> = {
    surplus: tokens.colors.green[10].value,
    over: tokens.colors.red[10].value,
    near: tokens.colors.yellow[10].value,
    normal: "transparent",
  };
  const textColors: Record<StatusLevel, string> = {
    surplus: tokens.colors.green[80].value,
    over: tokens.colors.red[80].value,
    near: tokens.colors.orange[80].value,
    normal: tokens.colors.font.tertiary.value,
  };

  return (
    <Flex
      ref={dropRef}
      as="button"
      onClick={() => onOpen(category)}
      justifyContent="space-between"
      alignItems="center"
      padding="0.6rem 0.75rem"
      borderRadius={tokens.radii.small}
      backgroundColor={
        isOver ? tokens.colors.teal[20] : backgrounds[status.level]
      }
      style={{
        width: "100%",
        border: isOver
          ? `2px solid ${tokens.colors.teal[60]}`
          : "2px solid transparent",
        cursor: "pointer",
        textAlign: "left",
        font: "inherit",
        color: "inherit",
      }}
      aria-label={`${category.name}: ${formatMoney(status.amount)} ${status.label} of ${formatMoney(category.plannedAmount)}`}
    >
      <Text>{category.name}</Text>
      <Flex direction="column" alignItems="flex-end" gap="0">
        <Text fontSize="small">{formatMoney(category.plannedAmount)}</Text>
        <Text fontSize="xs" color={textColors[status.level]}>
          {formatMoney(status.amount)} {status.label}
        </Text>
      </Flex>
    </Flex>
  );
}
