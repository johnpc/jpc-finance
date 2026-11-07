export type PaginatedResponse<T> = {
  data: T[];
  nextToken?: string | null;
};

/**
 * Follow nextToken to the end. AppSync applies `limit` before server-side
 * filtering, so a single page can silently miss rows.
 */
export async function fetchAllPages<T, P extends Record<string, unknown>>(
  baseParams: P,
  fetchPage: (
    params: P & { nextToken?: string | null },
  ) => Promise<PaginatedResponse<T>>,
): Promise<T[]> {
  const allItems: T[] = [];
  let nextToken: string | null | undefined = null;
  do {
    const response: PaginatedResponse<T> = await fetchPage({
      ...baseParams,
      nextToken,
    });
    allItems.push(...response.data);
    nextToken = response.nextToken;
  } while (nextToken);
  return allItems;
}

type MaybeErrors = { errors?: ReadonlyArray<{ message: string }> | null };

/** Amplify model calls report GraphQL errors in the result instead of throwing. */
export const throwOnErrors = <T extends MaybeErrors>(result: T): T => {
  if (result.errors?.length) {
    throw new Error(result.errors.map((e) => e.message).join("; "));
  }
  return result;
};
