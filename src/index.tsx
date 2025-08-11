import React from "react";
import ReactDOM from "react-dom";

import App from "./components/App";
import Store from "./store";
import { StoreContext } from "./storeContext";

const store = new Store();
ReactDOM.render(
  <StoreContext.Provider value={store}>
    <App />
  </StoreContext.Provider>,
  document.getElementById("root")
);
