import { defineFunction } from "@aws-amplify/backend";

export const tellerioListTransactionsFunction = defineFunction({
  entry: "./tellerio-list-transactions.ts",
  timeoutSeconds: 300,
});
