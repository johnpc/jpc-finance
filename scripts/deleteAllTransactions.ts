import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import config from "../amplifyconfiguration.json";
import { Schema } from "../amplify/data/resource";
import dotenv from "dotenv";
dotenv.config();
Amplify.configure(config);
export const client = generateClient<Schema>({
  authMode: "lambda",
  authToken: process.env.ADMIN_API_KEY,
});
const main = async () => {
  const transactions = await client.models.Transaction.list({
    limit: 10000,
  });
  const deleteTransactionsPromises = transactions.data.map((transaction) =>
    client.models.Transaction.delete({ id: transaction.id }),
  );
  await Promise.all(deleteTransactionsPromises);
};
main();
