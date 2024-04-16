import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { AmplifyFunction, ConstructFactory } from "@aws-amplify/plugin-types";

const schema = a.schema({
  BudgetCategoryType: a.enum(["Saving", "Needs", "Wants", "Income"]),
  PlaidAuthorization: a
    .model({
      accessToken: a.string().required(),
      userId: a.string().required(),
    })
    .secondaryIndexes((index) => [index("userId")])
    .authorization([a.allow.custom()]),

  Transaction: a
    .model({
      amount: a.integer().required(),
      transactionMonth: a.string().required(),
      authorizedDate: a.date().required(),
      date: a.date().required(),
      name: a.string().required(),
      pending: a.boolean().required(),
      deleted: a.boolean(),
      plaidTransactionId: a.string(),
      budgetCategory: a.belongsTo("BudgetCategory"),
    })
    .secondaryIndexes((index) => [
      index("transactionMonth"),
      index("plaidTransactionId"),
    ])
    .authorization([a.allow.custom(), a.allow.owner()]),
  Budget: a
    .model({
      budgetMonth: a.string().required(),
      budgetCategories: a.hasMany("BudgetCategory"),
    })
    .secondaryIndexes((index) => [index("budgetMonth")])
    .authorization([a.allow.custom(), a.allow.owner()]),
  BudgetCategory: a
    .model({
      budget: a.belongsTo("Budget"),
      name: a.string().required(),
      type: a.ref("BudgetCategoryType").required(),
      transactions: a.hasMany("Transaction"),
      plannedAmount: a.integer().required(),
    })
    .authorization([a.allow.custom(), a.allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = (authFunction: ConstructFactory<AmplifyFunction>) =>
  defineData({
    schema,
    authorizationModes: {
      defaultAuthorizationMode: "userPool",
      lambdaAuthorizationMode: {
        function: authFunction,
        timeToLiveInSeconds: 300,
      },
    },
  });
