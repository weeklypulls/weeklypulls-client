import React from "react";
import ReactDOM from "react-dom";

import App from "./components/App";
import Store from "./store";
import { StoreContext } from "./storeContext";

const store = new Store();
ReactDOM.render(
  <StoreContext.Provider value={store}>
    <App store={store} />
  </StoreContext.Provider>,
  document.getElementById("root")
);
