import React, { Component } from "react";
import { observer } from "mobx-react";
import autoBindMethods from "class-autobind-decorator";
import { Route, RouteComponentProps } from "react-router-dom";

import PullsDetail from "./PullsDetail";
import PullsList from "./PullsList";

@autoBindMethods
@observer
class PullsPages extends Component<RouteComponentProps> {
  public renderPull(props: RouteComponentProps) {
    return <PullsDetail {...this.props} {...props} />;
  }

  public renderPullsList(props: RouteComponentProps) {
    return <PullsList {...this.props} {...props} />;
  }

  public render() {
    const { match } = this.props;
    return (
      <div>
        <Route path={`${match.url}/:pullId`} component={this.renderPull} />
        <Route exact path={match.url} render={this.renderPullsList} />
      </div>
    );
  }
}

export default PullsPages;
