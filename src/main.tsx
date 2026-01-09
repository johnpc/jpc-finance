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
import { CACHE_TIMES, RETRY_CONFIG } from "./lib/constants";

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
      staleTime: CACHE_TIMES.DEFAULT_STALE_TIME,
      gcTime: CACHE_TIMES.DEFAULT_GC_TIME,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: RETRY_CONFIG.MAX_RETRIES,
      retryDelay: RETRY_CONFIG.RETRY_DELAY,
    },
    mutations: {
      retry: RETRY_CONFIG.MUTATION_RETRIES,
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
