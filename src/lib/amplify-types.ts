import { Schema } from "../../amplify/data/resource";

// Extend Amplify types to properly support pagination
export type PaginatedListParams<T = unknown> = T & {
  nextToken?: string | null;
};

export type PaginatedResponse<T> = {
  data: T[];
  nextToken?: string | null;
  errors?: Array<{ message: string }>;
};

// Helper to safely handle paginated queries
export async function fetchAllPages<T, P extends Record<string, unknown>>(
  baseParams: P,
  fetchPage: (
    params: P & { nextToken?: string | null },
  ) => Promise<PaginatedResponse<T>>,
): Promise<T[]> {
  const allItems: T[] = [];
  let nextToken: string | null | undefined = null;

  do {
    const response = await fetchPage({ ...baseParams, nextToken });
    allItems.push(...response.data);
    nextToken = response.nextToken;
  } while (nextToken);

  return allItems;
}

export type SchemaTransaction = Schema["Transaction"]["type"];
export type SchemaAccount = Schema["Account"]["type"];
export type SchemaSettings = Schema["Settings"]["type"];
export type SchemaBudgetCategory = Schema["BudgetCategory"]["type"];
export type SchemaBudget = Schema["Budget"]["type"];
