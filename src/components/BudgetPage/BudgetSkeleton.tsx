import { Card, Flex, Placeholder } from "@aws-amplify/ui-react";

export default function BudgetSkeleton() {
  return (
    <Flex
      direction="column"
      gap="1rem"
      aria-busy="true"
      aria-label="Loading budget"
    >
      <Card variation="outlined">
        <Placeholder height="2.5rem" />
      </Card>
      {[1, 2, 3].map((i) => (
        <Card key={i} variation="outlined">
          <Flex direction="column" gap="0.5rem">
            <Placeholder height="1.5rem" width="40%" />
            <Placeholder height="1.25rem" />
            <Placeholder height="1.25rem" />
          </Flex>
        </Card>
      ))}
    </Flex>
  );
}
