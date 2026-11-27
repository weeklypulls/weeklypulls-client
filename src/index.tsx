import "./instrument";

import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Result } from "antd";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";

import App from "./components/App";
import createStore from "./store";
import { StoreContext } from "./storeContext";

// Central QueryClient instance; cacheTime approximates previous custom cache windows per query via staleTime options
const queryClient = new QueryClient();

const store = createStore();
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <Sentry.ErrorBoundary
      fallback={
        <Result
          status="error"
          title="Something went wrong"
          subTitle="The error has been reported. Reload the page to try again."
        />
      }
    >
      <StoreContext.Provider value={store}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <App />
          </Router>
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </StoreContext.Provider>
    </Sentry.ErrorBoundary>
  );
}
