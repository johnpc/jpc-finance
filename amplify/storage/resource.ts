import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "jpcFinanceResources",
  // This bucket only ever held Teller.io mTLS credentials. Teller is retired;
  // the bucket is kept (deleting a non-empty bucket would fail the deploy) but
  // nothing is granted access to it.
  access: () => ({}),
});
