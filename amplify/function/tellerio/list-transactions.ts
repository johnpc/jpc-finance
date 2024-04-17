import { LambdaFunctionURLEvent } from "aws-lambda";
import { listTransactions } from "../helpers/get-tellerio-client";

export const handler = async (event: LambdaFunctionURLEvent) => {
  console.log({ event });
  const bodyJson = JSON.parse(event.body ?? "{}");
  const accessToken = bodyJson.accessToken;

  const { accounts, transactions } = await listTransactions(accessToken);
  return {
    statusCode: 200,
    body: JSON.stringify({
      accounts,
      transactions,
      message: "success!",
    }),
  };
};
