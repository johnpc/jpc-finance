// Cross-connection duplicate guard. Provider transaction ids (Plaid/Teller)
// are scoped to one connection ("item"): unlinking and re-linking the same
// bank issues brand-new ids for the same underlying transactions, so id-based
// dedup alone re-imports the whole history as duplicates. Before creating,
// look for a live transaction with the same owner, month, amount, date, and
// name that came from a DIFFERENT connection — "different" meaning its
// provider id isn't part of the current batch, so two genuinely identical
// purchases arriving together are both kept.
type ContentKey = {
  owner: string;
  transactionMonth: string;
  amount: number;
  date: string;
  name: string;
};

export const findContentDuplicate = async (
  // The generated Amplify data client; typed loosely because each Lambda
  // bundles its own client instance.
  models: {
    Transaction: {
      listTransactionByTransactionMonth: (
        input: { transactionMonth: string },
        options: { filter: object; nextToken?: string | null },
      ) => Promise<{ data?: unknown[] | null; nextToken?: string | null }>;
    };
  },
  txn: ContentKey,
  batchProviderIds: Set<string>,
) => {
  let nextToken: string | null | undefined = undefined;
  // `limit` applies before server-side filtering, so a single page can
  // silently miss matches — always follow nextToken to the end.
  do {
    const page = await models.Transaction.listTransactionByTransactionMonth(
      { transactionMonth: txn.transactionMonth },
      {
        filter: { owner: { eq: txn.owner }, amount: { eq: txn.amount } },
        nextToken,
      },
    );
    const match = (page.data ?? []).find((row) => {
      const t = row as {
        deleted?: boolean | null;
        date?: string;
        name?: string;
        plaidTransactionId?: string | null;
        tellerioTransactionId?: string | null;
      } | null;
      if (!t || t.deleted) return false;
      if (t.date !== txn.date || t.name !== txn.name) return false;
      const providerId = t.plaidTransactionId || t.tellerioTransactionId;
      return !(providerId && batchProviderIds.has(providerId));
    });
    if (match) return match;
    nextToken = page.nextToken;
  } while (nextToken);
  return undefined;
};
