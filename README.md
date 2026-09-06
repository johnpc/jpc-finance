# finance.jpc.io

A dead-simple monthly budget tracking app, for web and ios (including iOS to use FinanceKit data).

Zero-based budgeting syncs with your financial institutions and resets every month, so each month you can start fresh to meet your financial goals.

The app is available live at [https://jpc.finance](https://jpc.finance) and [https://finance.jpc.io](https://finance.jpc.io). You can download the app for iOS devices on the App Store: [https://apps.apple.com/us/app/jpc-finance/id6499078837](https://apps.apple.com/us/app/jpc-finance/id6499078837).

## Setup

Clone the repo, install dependencies, deploy backend resources:

```bash
git clone git@github.com:johnpc/jpc-finance.git
cd jpc-finance
npm install
npx cap sync
npx amplify sandbox
```

You'll also need to set up your environment variables:

```bash
cp .env.example .env
# Then fill in the values with your own by following instructions in .env

# To enable TellerIO, you must upload the private key and certificate to s3
aws s3 cp ./private_key.pem  s3://<your bucket name ./amplify_outputs.json>/internal/
aws s3 cp ./certificate.pem  s3://<your bucket name ./amplify_outputs.json>/internal/
```

In `package.json`, update your `prod-config` script to reference your own app id and profile name.

Then, to run the frontend app

```bash
# on web
npm run dev
```

or

```bash
# on ios
npm run ios
```

## Deploying

Deploy this application to your own AWS account in one click:

[![amplifybutton](https://oneclick.amplifyapp.com/button.svg)](https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/johnpc/jpc-finance)

## Saving money on Plaid billing

Plaid bills the Transactions product per connected account, per month, for as long
as the Item (bank connection) exists — even if the user who linked it stopped using
the app long ago. Deleting the `PlaidAuthorization` row alone does **not** stop the
charges; billing only stops once `/item/remove` is called for that Item.

The `scripts/removeStalePlaidItems.ts` script cleans these up. It finds users with
no activity in the last 3 months (based on their newest `Budget` row, which the app
creates whenever a user opens it in a month), calls Plaid `/item/remove` for each of
their Items, and deletes the matching `PlaidAuthorization` row. The two steps are
paired on purpose: the sync Lambda calls Plaid with all of a user's tokens at once,
so leaving an orphaned dead token behind would break that user's entire sync. A
removed user who returns simply re-links their bank through the app.

```bash
# Point the repo at your production backend (not the sandbox)
npm run prod-config

# Preview what would be removed (dry run is the default)
npx tsx scripts/removeStalePlaidItems.ts

# Actually remove the stale Items and their rows
npx tsx scripts/removeStalePlaidItems.ts --execute

# Use a different inactivity cutoff, e.g. 6 months
npx tsx scripts/removeStalePlaidItems.ts --months 6 --execute
```

Requires `ADMIN_API_KEY`, `PLAID_CLIENT_ID`, `PLAID_SECRET`, and `PLAID_ENV` in
`.env` (the same values the backend functions use). Run it every few months — or
whenever the connected-account count on the Plaid dashboard's Billing page looks
higher than your active user count.
