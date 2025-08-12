import React from "react";

import type { StoreApi } from "./store";

export const StoreContext = React.createContext<StoreApi>(null as unknown as StoreApi);

export default StoreContext;
