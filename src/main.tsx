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
import { AsyncErrorBoundary } from "./components/AsyncErrorBoundary";
import { ErrorProvider } from "./contexts/ErrorContext";

Amplify.configure(config);

// Register service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Service worker registration failed, app will work without offline support
    });
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute default
      gcTime: 1000 * 60 * 5, // 5 minutes default (formerly cacheTime)
      refetchOnWindowFocus: true, // Enable stale-while-revalidate on focus
      refetchOnReconnect: true, // Refetch on reconnect
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error("Mutation error:", error);
      },
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
            <AsyncErrorBoundary>
              <AuthProvider>
                <DateProvider>
                  <SubscriptionProvider>
                    <AsyncErrorBoundary>
                      <App />
                    </AsyncErrorBoundary>
                  </SubscriptionProvider>
                </DateProvider>
              </AuthProvider>
            </AsyncErrorBoundary>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </ErrorProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
