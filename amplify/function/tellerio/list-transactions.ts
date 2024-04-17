import { LambdaFunctionURLEvent } from "aws-lambda";
import { client as amplifyClient } from "../helpers/get-amplify-client";
import { listTransactions } from "../helpers/get-tellerio-client";

export const handler = async (event: LambdaFunctionURLEvent) => {
  console.log({ event });

  const tellerAuths = await amplifyClient.models.TellerAuthorization.list();
  console.log({ tellerAuths, errors: tellerAuths.errors });
  const firstTellerAuth = tellerAuths.data.find((tellerAuth) => tellerAuth);
  firstTellerAuth?.accessToken;

  const { accounts, transactions } = await listTransactions(
    firstTellerAuth!.accessToken,
  );
  return {
    statusCode: 200,
    body: JSON.stringify({
      accounts,
      transactions,
      message: "success!",
    }),
  };
};
