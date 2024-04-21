import {
  Card,
  View,
  Heading,
  Flex,
  Text,
  Button,
  useTheme,
} from "@aws-amplify/ui-react";
import {
  BudgetCategoryEntity,
  TransactionEntity,
  updateTransaction,
} from "../../data/entity";
import { Box } from "@mui/material";

export const BudgetCategoryDetailCard = (props: {
  transaction: TransactionEntity;
  budgetCategory: BudgetCategoryEntity;
}) => {
  const { tokens } = useTheme();
  const onRemoveTransaction = (transaction: TransactionEntity) => {
    transaction.budgetCategoryId = null;
    updateTransaction(transaction);
  };
  const amount = (props.transaction.amount / 100) * -1;
  return (
    <View
      backgroundColor={tokens.colors.background.secondary}
      padding={tokens.space.medium}
    >
      <Card>
        <Flex direction="row" alignItems="flex-start">
          <Box
            padding={tokens.space.medium.value}
            width={100}
            minWidth={100}
            height={150}
            minHeight={150}
            alignItems="center"
          >
            <Heading
              marginTop={50}
              color={
                amount > 0 ? tokens.colors.green[60] : tokens.colors.red[60]
              }
            >
              ${amount}
            </Heading>
          </Box>
          <Flex
            direction="column"
            alignItems="flex-start"
            gap={tokens.space.xs}
          >
            <Heading level={5}>
              {props.transaction.date.toLocaleString(undefined, {
                day: "numeric",
                month: "long",
                hour: "numeric",
                minute: "2-digit",
              })}
            </Heading>
            <Text as="span">{props.transaction.name}</Text>
            <Button
              variation="warning"
              onClick={() => onRemoveTransaction(props.transaction)}
            >
              Undo categorization
            </Button>
          </Flex>
        </Flex>
      </Card>
    </View>
  );
};
