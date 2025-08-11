import React from "react";
import Store from "./store";

export const StoreContext = React.createContext<Store>(null as unknown as Store);

export default StoreContext;
