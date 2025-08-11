import { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";

import Store from "../../store";
import { StoreContext } from "../../storeContext";

export default function PageLogout() {
  const store = useContext<Store>(StoreContext);
  useEffect(() => {
    store.logout();
  }, [store]);
  return <Navigate to="/login" replace />;
}
