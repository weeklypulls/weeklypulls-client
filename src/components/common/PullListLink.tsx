import autoBindMethods from "class-autobind-decorator";
import { observer, inject } from "mobx-react";
import React, { Component } from "react";
import { Link } from "react-router-dom";

import Store from "../../store";

interface IProps {
  pullId: string;
  pullListId: string;
}

interface IInjected extends IProps {
  store: Store;
}

@inject("store")
@autoBindMethods
@observer
class PullListLink extends Component<IProps> {
  private get injected() {
    return this.props as IInjected;
  }

  public render() {
    const { store, pullListId, pullId } = this.injected,
      pullList = store.pullLists.get(pullListId);

    if (!pullList) {
      return "--";
    }

    return <Link to={`/pulls/${pullId}`}>{pullList.title}</Link>;
  }
}

export default PullListLink;
