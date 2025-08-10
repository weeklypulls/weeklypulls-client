import autoBindMethods from "class-autobind-decorator";
import { observer } from "mobx-react";
import React, { Component } from "react";
import { RouteComponentProps } from "react-router";

import Comics from "./ComicsList";

@observer
@autoBindMethods
class ComicsListPage extends Component<RouteComponentProps> {
  public render() {
    return <Comics {...this.props} />;
  }
}

export default ComicsListPage;
