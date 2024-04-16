# finance.jpc.io

A dead-simple monthly budget tracking app, for web and ios (including iOS to use FinanceKit data).

Zero-based budgeting syncs with your financial institutions and resets every month, so each month you can start fresh to meet your financial goals.

## Setup

Clone the repo, install dependencies, deploy backend resources:

```bash
git clone git@github.com:johnpc/jpc-finance.git
cd jpc-finance
npm install
npx cap sync
npx amplify sandbox
```

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
