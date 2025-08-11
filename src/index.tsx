import React from "react";
import { createRoot } from "react-dom/client";

import App from "./components/App";
import Store from "./store";
import { StoreContext } from "./storeContext";

const store = new Store();
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <StoreContext.Provider value={store}>
      <App />
    </StoreContext.Provider>
  );
}
