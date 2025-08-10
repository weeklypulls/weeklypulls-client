import { Button, Table } from "antd";
import autoBindMethods from "class-autobind-decorator";
import { inject, observer } from "mobx-react";
import React, { Component } from "react";
import { RouteComponentProps } from "react-router";

import Store from "../../store";

interface IInjected extends RouteComponentProps {
  store: Store;
}

interface ISmartButton {
  onClick: () => Promise<any> | any;
}

@autoBindMethods
@observer
class SmartButton extends Component<ISmartButton, { isLoading: boolean }> {
  public state = { isLoading: false };

  private onClick = async () => {
    try {
      this.setState({ isLoading: true });
      await this.props.onClick();
    } finally {
      this.setState({ isLoading: false });
    }
  };

  public render() {
    return (
      <Button loading={this.state.isLoading} onClick={this.onClick}>
        {this.props.children}
      </Button>
    );
  }
}

@inject("store")
@autoBindMethods
@observer
class PageResources extends Component<RouteComponentProps> {
  private get injected() {
    return this.props as IInjected;
  }

  private renderClickable(value: string) {
    const resource = this.injected.store.resources[value];

    if (!resource) {
      return "--";
    }

    return <SmartButton onClick={resource.clear}>Clear</SmartButton>;
  }

  public render() {
    const model = Object.keys(this.injected.store.resources).map((key) => ({
      clearKey: key,
      key,
      cachedValues: this.injected.store.resources[key].all.length,
    }));

    const columns = [
      { title: "Key", dataIndex: "key", key: "key" },
      {
        title: "Clear",
        dataIndex: "clearKey",
        key: "clearKey",
        render: (value: string) => this.renderClickable(value),
      },
      { title: "Cached Values", dataIndex: "cachedValues", key: "cachedValues" },
    ];

    return <Table rowKey="key" columns={columns} dataSource={model} pagination={false} />;
  }
}

export default PageResources;
