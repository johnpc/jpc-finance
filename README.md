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
