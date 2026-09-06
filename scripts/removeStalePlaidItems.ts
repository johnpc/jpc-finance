/**
 * Remove Plaid Items belonging to users who have stopped using the app.
 *
 * Why: Plaid bills the Transactions product per connected account per month
 * for as long as the Item exists — users who linked a bank and abandoned the
 * app keep costing money forever. Deleting our PlaidAuthorization row alone
 * does NOT stop billing; Plaid only stops when /item/remove is called.
 *
 * What it does:
 *   1. Lists every PlaidAuthorization row (one row = one Plaid Item).
 *   2. Determines each owner's last activity from their newest Budget row
 *      (a Budget row is created whenever a user opens the app in a month).
 *   3. For owners inactive longer than the cutoff, calls Plaid /item/remove
 *      and, only on success, deletes the PlaidAuthorization row.
 *
 * The Plaid removal and the row delete are intentionally paired: the
 * plaid-list-transactions Lambda runs Promise.all over all of a user's
 * tokens, so an orphaned dead token would 500 that user's entire sync.
 * A removed user who returns simply re-links their bank through the app.
 *
 * Usage (run against PROD — fetch prod outputs first!):
 *   npm run prod-config
 *   npx tsx scripts/removeStalePlaidItems.ts             # dry run (default)
 *   npx tsx scripts/removeStalePlaidItems.ts --execute   # actually remove
 *   npx tsx scripts/removeStalePlaidItems.ts --months 6  # custom cutoff
 *
 * Requires in .env: ADMIN_API_KEY, PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV
 */
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import config from "../amplify_outputs.json";
import { Schema } from "../amplify/data/resource";
import dotenv from "dotenv";
dotenv.config();

Amplify.configure(config);
const client = generateClient<Schema>({
  authMode: "lambda",
  authToken: process.env.ADMIN_API_KEY,
});

const plaidClient = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV!],
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
        "PLAID-SECRET": process.env.PLAID_SECRET,
        "Plaid-Version": "2020-09-14",
      },
    },
  }),
);

const execute = process.argv.includes("--execute");
const monthsArg = process.argv.indexOf("--months");
const months = monthsArg === -1 ? 3 : parseInt(process.argv[monthsArg + 1], 10);

// Page through a model's list() — default page size would silently truncate.
const listAll = async <T>(
  list: (opts: { limit: number; nextToken?: string | null }) => Promise<{
    data: T[];
    nextToken?: string | null;
  }>,
): Promise<T[]> => {
  const all: T[] = [];
  let nextToken: string | null | undefined = undefined;
  do {
    const page = await list({ limit: 1000, nextToken });
    all.push(...page.data);
    nextToken = page.nextToken;
  } while (nextToken);
  return all;
};

const main = async () => {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  const cutoffIso = cutoff.toISOString();
  console.log(`cutoff: users inactive since before ${cutoffIso.slice(0, 10)}`);
  console.log(
    execute ? "MODE: EXECUTE" : "MODE: dry run (pass --execute to remove)",
  );

  const items = await listAll((opts) =>
    client.models.PlaidAuthorization.list(opts),
  );
  const budgets = await listAll((opts) => client.models.Budget.list(opts));

  // Owner's last activity = newest Budget row. Budget owner fields sometimes
  // carry the "sub::sub" Cognito format — normalize to the bare sub.
  const lastActive = new Map<string, string>();
  for (const budget of budgets) {
    const owner = (budget.owner ?? "").split("::")[0];
    const created = budget.createdAt;
    if (!lastActive.has(owner) || created > lastActive.get(owner)!) {
      lastActive.set(owner, created);
    }
  }

  // An owner with no Budget rows at all is only stale if their newest link
  // also predates the cutoff (a brand-new user may not have budgets yet).
  const newestLink = new Map<string, string>();
  for (const item of items) {
    const prev = newestLink.get(item.owner) ?? "";
    if (item.createdAt > prev) newestLink.set(item.owner, item.createdAt);
  }
  const isStale = (owner: string) =>
    (lastActive.get(owner) ?? newestLink.get(owner)!) < cutoffIso;

  const stale = items.filter((item) => isStale(item.owner));
  const staleOwners = new Set(stale.map((item) => item.owner));
  const activeOwners = new Set(
    items.filter((item) => !isStale(item.owner)).map((item) => item.owner),
  );
  console.log(
    `${items.length} items / ${staleOwners.size + activeOwners.size} owners total; ` +
      `removing ${stale.length} items from ${staleOwners.size} stale owners; ` +
      `keeping ${items.length - stale.length} items across ${activeOwners.size} active owners`,
  );

  let removed = 0;
  let failed = 0;
  for (const item of stale) {
    const label = `owner ${item.owner.slice(0, 8)}… linked ${item.createdAt.slice(0, 10)}`;
    if (!execute) {
      console.log(`would remove: ${label}`);
      continue;
    }
    try {
      await plaidClient.itemRemove({ access_token: item.accessToken });
    } catch (error) {
      const code = (error as { response?: { data?: { error_code?: string } } })
        .response?.data?.error_code;
      // Item already gone on Plaid's side — safe to clean up our row.
      if (code !== "ITEM_NOT_FOUND" && code !== "INVALID_ACCESS_TOKEN") {
        failed++;
        console.error(`FAILED (row kept): ${label}: ${code ?? error}`);
        continue;
      }
    }
    const deleted = await client.models.PlaidAuthorization.delete({
      id: item.id,
    });
    if (deleted.errors?.length) {
      failed++;
      console.error(
        `Plaid removed but row delete FAILED: ${label}`,
        deleted.errors,
      );
      continue;
    }
    removed++;
    console.log(`removed: ${label}`);
  }

  console.log(
    execute
      ? `done: ${removed} removed, ${failed} failed, ${items.length - removed} items remain`
      : `dry run complete: ${stale.length} items would be removed`,
  );
};

main();
