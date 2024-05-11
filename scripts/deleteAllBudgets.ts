import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import config from "../amplify_outputs.json";
import { Schema } from "../amplify/data/resource";
import dotenv from "dotenv";
dotenv.config();
Amplify.configure(config);
export const client = generateClient<Schema>({
  authMode: "lambda",
  authToken: process.env.ADMIN_API_KEY,
});
const main = async () => {
  const budgets = await client.models.Budget.list();
  const deleteBudgetsPromises = budgets.data.map((budget) =>
    client.models.Budget.delete({ id: budget.id }),
  );
  const budgetCategories = await client.models.BudgetCategory.list();
  console.log({ budgetCategories, errors: budgetCategories.errors });
  const deleteBudgetCategoriesPromises = budgetCategories.data?.map(
    (budgetCategory) =>
      client.models.BudgetCategory.delete({ id: budgetCategory.id }),
  );
  await Promise.all(deleteBudgetsPromises);
  await Promise.all(deleteBudgetCategoriesPromises);
};
main();
