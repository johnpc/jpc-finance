import { useCallback, useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import amplifyconfiguration from "../../amplifyconfiguration.json";
import { AuthUser } from "aws-amplify/auth";
import {
  Button,
  Card,
  Divider,
  Loader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@aws-amplify/ui-react";
import { Capacitor } from "@capacitor/core";
import Transactions from "./Transactions/Transactions";
import { syncTransactions } from "../helpers/sync-transactions";
import { TransactionEntity } from "../data/entity";

export default function AccountsPageBac(props: {
  user: AuthUser;
  transactions: TransactionEntity[];
}) {
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<{
    transactions: {
      accounts: { name: string; balances: { available: number } }[];
    };
  }>();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const onSuccess = useCallback(async (publicToken: string) => {
    setLoading(true);
    const fetchResponse = await fetch(
      amplifyconfiguration.custom.plaidExchangePublicTokenFunction,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicToken, userId: props.user.userId }),
      },
    );
    await fetchResponse.json();
    await getBalance();
  }, []);

  // Creates a Link token
  const createLinkToken = useCallback(async () => {
    // For OAuth, use previously generated Link token
    if (window.location.href.includes("?oauth_state_id=")) {
      const linkToken = localStorage.getItem("link_token");
      setToken(linkToken);
    } else {
      const response = await fetch(
        amplifyconfiguration.custom.plaidCreateLinkTokenFunction,
        {},
      );
      const data = await response.json();
      setToken(data.tokenResponse.link_token);
      localStorage.setItem("link_token", data.link_token);
    }
  }, [setToken]);

  // Fetch balance data
  const getBalance = useCallback(async () => {
    setLoading(true);
    const response = await fetch(
      amplifyconfiguration.custom.plaidGetBalanceFunction,
      {},
    );
    const data = await response.json();
    setData(data);
    setLoading(false);
  }, [setData, setLoading]);

  let isOauth = false;

  const config = {
    token,
    onSuccess,
    receivedRedirectUri: window.location.href.includes("?oauth_state_id=")
      ? window.location.href
      : undefined,
  };

  // For OAuth, configure the received redirect URI
  if (window.location.href.includes("?oauth_state_id=")) {
    config.receivedRedirectUri = window.location.href;
    isOauth = true;
  }
  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    console.log({ token });
    if (token == null) {
      createLinkToken();
    }
    if (isOauth && ready) {
      console.log({ open: "open" });
      open();
    }
  }, [token, isOauth, ready, open]);
  useEffect(() => {
    getBalance();
  }, []);

  const syncAllTransactions = async () => {
    setSyncing(true);
    await syncTransactions();
    setSyncing(false);
  };

  const testFinanceKit = async () => {
    await syncTransactions();
    // JPCFinanceKit.repeatt({ value: "wassap!!" });
    // JPCFinanceKit.requestAuthorization();
  };

  return (
    <>
      {loading || data == null ? (
        <Loader variation="linear" />
      ) : (
        <Card variation="elevated">
          <Table
            highlightOnHover={false}
            size={"large"}
            caption={"Connected Accounts"}
          >
            <TableHead>
              <TableRow>
                <TableCell as="th">Name</TableCell>
                <TableCell as="th">Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.transactions.accounts.map((account) => {
                return (
                  <TableRow key={account.name}>
                    <TableCell>{account.name}</TableCell>
                    <TableCell>${account.balances.available}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
      <Button
        isFullWidth={true}
        variation="primary"
        onClick={() => open()}
        disabled={!ready}
      >
        Add Bank / Card
      </Button>
      {Capacitor.getPlatform() !== "ios" ? null : (
        <>
          <Divider margin={"20px"} />
          <Button onClick={testFinanceKit} isFullWidth={true}>
            Link FinanceKit
          </Button>
        </>
      )}
      <Divider margin={"20px"} />
      <Button
        isFullWidth={true}
        isLoading={syncing}
        variation="link"
        onClick={() => syncAllTransactions()}
      >
        Sync Transactions Now
      </Button>
      <Transactions transactions={props.transactions} />
    </>
  );
}
