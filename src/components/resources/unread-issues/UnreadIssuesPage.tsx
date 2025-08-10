import React, { Component } from "react";
import { observer } from "mobx-react";
import autoBindMethods from "class-autobind-decorator";
import { RouteComponentProps } from "react-router";

import UnreadIssues from "./UnreadIssues";

@observer
@autoBindMethods
class UnreadIssuesPage extends Component<RouteComponentProps> {
  public render() {
    return <UnreadIssues {...this.props} />;
  }
}

export default UnreadIssuesPage;
