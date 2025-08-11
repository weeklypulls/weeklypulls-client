import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRoot } from "react-dom/client";

import App from "./components/App";
import Store from "./store";
import { StoreContext } from "./storeContext";

// Central QueryClient instance; cacheTime approximates previous custom cache windows per query via staleTime options
const queryClient = new QueryClient();

const store = new Store();
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <StoreContext.Provider value={store}>
      <QueryClientProvider client={queryClient}>
        <App />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </StoreContext.Provider>
  );
}
