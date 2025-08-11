import { observer } from "mobx-react";
import React from "react";
import { RouteComponentProps } from "react-router";

import Comics from "./ComicsList";

export default observer(function ComicsListPage(_props: RouteComponentProps) {
  return <Comics />;
});
