import { Button, Card, Flex, Heading, Text } from "@aws-amplify/ui-react";
import { useCreateBudget } from "../../hooks/useCreateBudget";
import { useDate } from "../../hooks/useDateHook";
import { formatMonthYear } from "../../lib/dateUtils";

export default function NoBudget() {
  const { date } = useDate();
  const create = useCreateBudget();

  return (
    <Card variation="outlined">
      <Flex
        direction="column"
        alignItems="center"
        gap="1rem"
        padding="2rem 1rem"
        textAlign="center"
      >
        <Heading level={4}>
          You haven't started your {formatMonthYear(date)} budget yet
        </Heading>
        <Text color="font.tertiary">
          Your categories and targets carry over from your most recent budget.
        </Text>
        <Button
          variation="primary"
          isLoading={create.isPending}
          loadingText="Creating…"
          onClick={() => create.mutate()}
        >
          Create Budget
        </Button>
      </Flex>
    </Card>
  );
}
