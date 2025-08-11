import { observer } from "mobx-react";
import React from "react";
// react-router v6: no RouteComponentProps

import Comics from "./ComicsList";

export default observer(function ComicsListPage() {
  return <Comics />;
});
