import { defineFunction } from "@aws-amplify/backend";

export const tellerioListTransactionsFunction = defineFunction({
  entry: "./list-transactions.ts",
  timeoutSeconds: 30,
});
