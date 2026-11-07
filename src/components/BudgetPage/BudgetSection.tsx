import { Button, Card, Divider, Flex, Text } from "@aws-amplify/ui-react";
import { ExpandMore, ChevronRight } from "@mui/icons-material";
import CategoryRow from "./CategoryRow";
import { useBudgetSection } from "../../hooks/useBudgetSection";
import { formatMoney } from "../../lib/currency";
import { CategoryType, CategoryWithTransactions } from "../../lib/types";

const SUBTITLES: Record<CategoryType, string> = {
  Income: "Cash coming in",
  Saving: "Pay yourself first",
  Needs: "Pay your bills",
  Wants: "Treat yo self",
};

type Props = {
  type: CategoryType;
  categories: CategoryWithTransactions[];
  onOpenCategory: (category: CategoryWithTransactions) => void;
  onAddCategory: (type: CategoryType) => void;
};

export default function BudgetSection({
  type,
  categories,
  onOpenCategory,
  onAddCategory,
}: Props) {
  const { collapsed, toggle, headerDropRef, rows, totals } = useBudgetSection(
    type,
    categories,
  );
  const Chevron = collapsed ? ChevronRight : ExpandMore;

  return (
    <Card variation="outlined" marginBottom="1rem">
      <Flex
        ref={headerDropRef}
        as="button"
        onClick={toggle}
        aria-expanded={!collapsed}
        alignItems="center"
        gap="0.5rem"
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          font: "inherit",
          color: "inherit",
          padding: 0,
          textAlign: "left",
        }}
      >
        <Chevron fontSize="small" />
        <Flex direction="column" gap="0" flex="1">
          <Text fontWeight="bold" fontSize="large">
            {type}
          </Text>
          <Text fontSize="xs" color="font.tertiary">
            {SUBTITLES[type]}
          </Text>
        </Flex>
        <Flex direction="column" gap="0" alignItems="flex-end">
          <Text fontWeight="bold">{formatMoney(totals.planned)}</Text>
          <Text fontSize="xs" color="font.tertiary">
            {type === "Income" ? "Received" : "Spent"}:{" "}
            {formatMoney(totals.actual)}
          </Text>
        </Flex>
      </Flex>
      {!collapsed && (
        <>
          <Divider marginTop="0.75rem" marginBottom="0.5rem" />
          <Flex direction="column" gap="0.25rem">
            {rows.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                onOpen={onOpenCategory}
              />
            ))}
          </Flex>
          <Button
            size="small"
            variation="link"
            marginTop="0.5rem"
            onClick={() => onAddCategory(type)}
          >
            + Add category
          </Button>
        </>
      )}
    </Card>
  );
}
