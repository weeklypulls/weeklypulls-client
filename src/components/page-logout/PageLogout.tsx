import { observer } from "mobx-react";
import React, { useContext, useEffect } from "react";
import { Redirect, RouteComponentProps } from "react-router";

import Store from "../../store";
import { StoreContext } from "../../storeContext";

export default observer(function PageLogout(_props: RouteComponentProps) {
  const store = useContext<Store>(StoreContext);
  useEffect(() => {
    store.logout();
  }, [store]);
  return <Redirect to={{ pathname: "/login" }} />;
});
