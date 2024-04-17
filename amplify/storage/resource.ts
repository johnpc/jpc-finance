import { defineStorage } from "@aws-amplify/backend";
import { tellerioListTransactionsFunction } from "../function/tellerio/resource";

export const storage = defineStorage({
  name: "jpcFinanceResources",
  access: (allow) => ({
    "internal/*": [
      allow.resource(tellerioListTransactionsFunction).to(["read"]),
    ],
  }),
});
