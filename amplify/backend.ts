import { defineBackend, defineFunction } from "@aws-amplify/backend";
import {
  Function as LambdaFunction,
  FunctionUrlAuthType,
} from "aws-cdk-lib/aws-lambda";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { storage } from "./storage/resource";
import dotenv from "dotenv";
import { tellerioListTransactionsFunction } from "./function/tellerio/resource";
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  "ADMIN_API_KEY",
  "PLAID_SECRET",
  "PLAID_CLIENT_ID",
  "PLAID_ENV",
  "PLAID_REDIRECT_URI",
];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

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

const underlyingAuthLambda = backend.authFunction.resources
  .lambda as LambdaFunction;
underlyingAuthLambda.addEnvironment(
  "ADMIN_API_KEY",
  process.env.ADMIN_API_KEY!,
);

const outputs: Record<string, string> = {};
const functions = [
  backend.helloWorldFunction,
  backend.tellerioListTransactionsFunction,
  backend.plaidCreateLinkTokenFunction,
  backend.plaidExchangePublicTokenFunction,
  backend.plaidListTransactionsFunction,
];

functions.forEach((fn, index) => {
  const functionNames = [
    "helloWorldFunction",
    "tellerioListTransactionsFunction",
    "plaidCreateLinkTokenFunction",
    "plaidExchangePublicTokenFunction",
    "plaidListTransactionsFunction",
  ];

  const underlyingLambda = fn.resources.lambda as LambdaFunction;
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
  outputs[functionNames[index]] = functionUrl.url;
});
backend.addOutput({
  custom: outputs,
});
