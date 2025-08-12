import { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";

import type { StoreApi } from "../../store";
import { StoreContext } from "../../storeContext";

export default function PageLogout() {
  const store = useContext<StoreApi>(StoreContext);
  useEffect(() => {
    store.logout();
  }, [store]);
  return <Navigate to="/login" replace />;
}
