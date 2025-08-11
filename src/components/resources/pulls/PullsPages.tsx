import { observer } from "mobx-react";
import React from "react";
import { Route, RouteComponentProps } from "react-router-dom";

import PullsDetail from "./PullsDetail";
import PullsList from "./PullsList";

export default observer(function PullsPages(props: RouteComponentProps) {
  const { match } = props;
  return (
    <div>
      <Route
        path={`${match.url}/:pullId`}
        render={(routeProps) => <PullsDetail {...props} {...routeProps} />}
      />
      <Route
        exact
        path={match.url}
        render={(routeProps) => <PullsList {...props} {...routeProps} />}
      />
    </div>
  );
});
