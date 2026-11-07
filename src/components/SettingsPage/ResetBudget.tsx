import { Button, Card, Heading, Text } from "@aws-amplify/ui-react";
import { useResetBudget } from "../../hooks/useResetBudget";

export default function ResetBudget() {
  const { confirmReset, isPending, categorizedCount, month } = useResetBudget();

  return (
    <Card variation="outlined" marginBottom="1rem">
      <Heading level={5} marginBottom="0.5rem">
        Budget
      </Heading>
      <Button
        isFullWidth
        isDisabled={categorizedCount === 0}
        isLoading={isPending}
        loadingText="Resetting…"
        onClick={confirmReset}
      >
        Reset {month} budget
      </Button>
      <Text fontSize="xs" color="font.tertiary" marginTop="0.5rem">
        Uncategorizes every transaction in {month} so you can sort them again.
        Categories and targets are kept.
      </Text>
    </Card>
  );
}
