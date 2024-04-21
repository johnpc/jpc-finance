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

const backend = defineBackend({
  authFunction,
  helloWorldFunction,
  tellerioListTransactionsFunction,
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
].forEach((functionInfo) => {
  const underlyingLambda =
    // eslint-disable-next-line
    (backend as any)[functionInfo.name].resources.lambda as Function;
  underlyingLambda.addEnvironment("ADMIN_API_KEY", process.env.ADMIN_API_KEY!);
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
