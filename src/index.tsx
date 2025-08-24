import "@ant-design/v5-patch-for-react-19";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
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
    <StoreContext.Provider value={store}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <App />
        </Router>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </StoreContext.Provider>
  );
}
