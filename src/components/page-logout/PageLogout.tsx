import { observer } from "mobx-react";
import React, { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";

import Store from "../../store";
import { StoreContext } from "../../storeContext";

export default observer(function PageLogout() {
  const store = useContext<Store>(StoreContext);
  useEffect(() => {
    store.logout();
  }, [store]);
  return <Navigate to="/login" replace />;
});
