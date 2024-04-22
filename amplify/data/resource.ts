import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { AmplifyFunction, ConstructFactory } from "@aws-amplify/plugin-types";

const schema = a.schema({
  BudgetCategoryType: a.enum(["Saving", "Needs", "Wants", "Income"]),
  TellerAuthorization: a
    .model({
      accessToken: a.string().required(),
      amplifyUserId: a.string().required(),
    })
    .secondaryIndexes((index) => [index("amplifyUserId")])
    .authorization([a.allow.owner(), a.allow.custom()]),
  PlaidAuthorization: a
    .model({
      accessToken: a.string().required(),
      userId: a.string().required(),
      owner: a.string().required(),
    })
    .secondaryIndexes((index) => [index("userId")])
    .authorization([a.allow.custom(), a.allow.owner()]),
  Account: a
    .model({
      name: a.string().required(),
      institutionName: a.string().required(),
      type: a.string().required(),
      subType: a.string().required(),
      lastFour: a.integer(),
      tellerioAccountId: a.string(),
      plaidAccountId: a.string(),
      owner: a.string().required(),
    })
    .secondaryIndexes((index) => [
      index("tellerioAccountId"),
      index("plaidAccountId"),
    ])
    .authorization([a.allow.custom(), a.allow.owner()]),
  Transaction: a
    .model({
      amount: a.integer().required(),
      transactionMonth: a.string().required(),
      date: a.date().required(),
      name: a.string().required(),
      pending: a.boolean().required(),
      deleted: a.boolean(),
      tellerioTransactionId: a.string(),
      plaidTransactionId: a.string(),
      budgetCategory: a.belongsTo("BudgetCategory"),
      owner: a.string().required(),
    })
    .secondaryIndexes((index) => [
      index("transactionMonth"),
      index("plaidTransactionId"),
      index("tellerioTransactionId"),
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
