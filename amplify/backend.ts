import { defineBackend, defineFunction } from "@aws-amplify/backend";
import { Function, FunctionUrlAuthType } from "aws-cdk-lib/aws-lambda";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { storage } from "./storage/resource";
import dotenv from "dotenv";
import { tellerioListTransactionsFunction } from "./function/tellerio/resource";
dotenv.config();

const helloWorldFunction = defineFunction({
  entry: "./function/hello-world.ts",
});
const authFunction = defineFunction({
  entry: "./data/custom-authorizer.ts",
});

const plaidCreateLinkTokenFunction = defineFunction({
  entry: "./function/plaid/plaid-create-link-token.ts",
});
const plaidExchangePublicTokenFunction = defineFunction({
  entry: "./function/plaid/plaid-exchange-public-token.ts",
});
const plaidListTransactionsFunction = defineFunction({
  entry: "./function/plaid/plaid-list-transactions.ts",
  timeoutSeconds: 300,
});

const backend = defineBackend({
  authFunction,
  helloWorldFunction,
  tellerioListTransactionsFunction,
  plaidCreateLinkTokenFunction,
  plaidExchangePublicTokenFunction,
  plaidListTransactionsFunction,
  auth,
  data: data(authFunction),
  storage,
});

// eslint-disable-next-line @typescript-eslint/ban-types
const underlyingAuthLambda = backend.authFunction.resources.lambda as Function;
underlyingAuthLambda.addEnvironment(
  "ADMIN_API_KEY",
  process.env.ADMIN_API_KEY!,
);

const outputs = {} as { [key: string]: string };
[
  { name: "helloWorldFunction" },
  { name: "tellerioListTransactionsFunction" },
  { name: "plaidCreateLinkTokenFunction" },
  { name: "plaidExchangePublicTokenFunction" },
  { name: "plaidListTransactionsFunction" },
].forEach((functionInfo) => {
  const underlyingLambda =
    // eslint-disable-next-line
    (backend as any)[functionInfo.name].resources.lambda as Function;
  underlyingLambda.addEnvironment("ADMIN_API_KEY", process.env.ADMIN_API_KEY!);
  underlyingLambda.addEnvironment("PLAID_SECRET", process.env.PLAID_SECRET!);
  underlyingLambda.addEnvironment(
    "PLAID_CLIENT_ID",
    process.env.PLAID_CLIENT_ID!,
  );
  underlyingLambda.addEnvironment("PLAID_ENV", process.env.PLAID_ENV!);
  underlyingLambda.addEnvironment(
    "PLAID_REDIRECT_URI",
    process.env.PLAID_REDIRECT_URI!,
  );

  const functionUrl = underlyingLambda.addFunctionUrl({
    authType: FunctionUrlAuthType.NONE,
    cors: {
      allowedOrigins: ["*"],
      allowedHeaders: ["*"],
    },
  });
  outputs[functionInfo.name] = functionUrl.url;
});
backend.addOutput({
  custom: outputs,
});
