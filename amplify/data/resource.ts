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
    .authorization((allow) => [allow.owner(), allow.custom()]),
  PlaidAuthorization: a
    .model({
      accessToken: a.string().required(),
      userId: a.string().required(),
      owner: a.string().required(),
    })
    .secondaryIndexes((index) => [index("userId")])
    .authorization((allow) => [allow.custom(), allow.owner()]),
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
    .authorization((allow) => [allow.custom(), allow.owner()]),
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
      financeKitTransactionId: a.string(),
      budgetCategoryTransactionsId: a.string(),
      budgetCategory: a.belongsTo(
        "BudgetCategory",
        "budgetCategoryTransactionsId",
      ),
      owner: a.string().required(),
    })
    .secondaryIndexes((index) => [
      index("transactionMonth"),
      index("plaidTransactionId"),
      index("tellerioTransactionId"),
      index("financeKitTransactionId"),
      index("budgetCategoryTransactionsId"),
    ])
    .authorization((allow) => [allow.custom(), allow.owner()]),
  Budget: a
    .model({
      budgetMonth: a.string().required(),
      budgetCategories: a.hasMany("BudgetCategory", "budgetBudgetCategoriesId"),
    })
    .secondaryIndexes((index) => [index("budgetMonth")])
    .authorization((allow) => [allow.custom(), allow.owner()]),
  BudgetCategory: a
    .model({
      budget: a.belongsTo("Budget", "budgetBudgetCategoriesId"),
      budgetBudgetCategoriesId: a.string(),
      name: a.string().required(),
      type: a.string().required(),
      transactions: a.hasMany("Transaction", "budgetCategoryTransactionsId"),
      plannedAmount: a.integer().required(),
    })
    .secondaryIndexes((index) => [index("budgetBudgetCategoriesId")])
    .authorization((allow) => [allow.custom(), allow.owner()]),
  Settings: a
    .model({
      enableFinanceKit: a.boolean().required().default(false),
    })
    .authorization((allow) => [allow.custom(), allow.owner()]),

  chat: a
    .conversation({
      aiModel: a.ai.model("Claude 3.5 Sonnet"),
      systemPrompt: `You are a helping users understand their spending habits and financial goals. You answer in three sentences or less, using simple english words.`,
      tools: [
        a.ai.dataTool({
          // The name of the tool as it will be referenced in the message to the LLM
          name: "BudgetQuery",
          // The description of the tool provided to the LLM.
          // Use this to help the LLM understand when to use the tool.
          description: "Provides information on budget and spending",
          // A reference to the `a.model()` that the tool will use
          model: a.ref("Budget"),
          // The operation to perform on the model
          modelOperation: "list",
        }),
      ],
      inferenceConfiguration: {
        maxTokens: 500,
        temperature: 1,
        topP: 0.5,
      },
    })
    .authorization((allow) => allow.owner()),
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
