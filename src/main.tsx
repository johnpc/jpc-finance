import "@aws-amplify/ui-react/styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { Amplify } from "aws-amplify";
import { ThemeProvider, Theme } from "@aws-amplify/ui-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import config from "../amplify_outputs.json";
import App from "./App";
import { AuthProvider } from "./hooks/useAuth";
import { DateProvider } from "./hooks/useDate";
import { SubscriptionProvider } from "./providers/SubscriptionProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ErrorProvider } from "./contexts/ErrorContext";

Amplify.configure(config);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

const theme: Theme = {
  name: "jpc-finance-theme",
  tokens: {
    colors: {
      brand: {
        primary: {
          10: "#7FFFD4",
          80: "#7FFFD4",
          90: "#7FFFD4",
          100: "#7FFFD4",
        },
      },
    },
  },
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <ErrorProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <DateProvider>
                <SubscriptionProvider>
                  <ErrorBoundary>
                    <App />
                  </ErrorBoundary>
                </SubscriptionProvider>
              </DateProvider>
            </AuthProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </ErrorProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
