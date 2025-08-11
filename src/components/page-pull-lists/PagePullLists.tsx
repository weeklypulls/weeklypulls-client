import { Button, Input, Modal, Table } from "antd";
import autoBindMethods from "class-autobind-decorator";
import { inject, observer } from "mobx-react";
import React, { Component } from "react";
import { RouteComponentProps } from "react-router";

import Store from "../../store";
import Title from "../common/Title";

type IModel = Record<string, any>;

interface IInjected extends RouteComponentProps {
  store: Store;
}

@inject("store")
@autoBindMethods
@observer
class PagePullLists extends Component<
  RouteComponentProps,
  { isAddVisible: boolean; title: string }
> {
  public state = { isAddVisible: false, title: "" };

  private get injected() {
    return this.props as IInjected;
  }

  private onAddNew(data: IModel) {
    console.log(data);
  }

  private openAdd = () => this.setState({ isAddVisible: true });
  private closeAdd = () => this.setState({ isAddVisible: false });
  private submitAdd = () => {
    const { title } = this.state;
    if (!title.trim()) return;
    this.onAddNew({ title: title.trim() });
    this.setState({ isAddVisible: false, title: "" });
  };

  public render() {
    const all = this.injected.store.pullLists.all;
    const columns = [{ title: "Title", dataIndex: "title", key: "title" }];

    return (
      <>
        <Title title="Pull Lists">
          <Button onClick={this.openAdd}>Add new</Button>
        </Title>

        <Table rowKey="id" dataSource={all} columns={columns} pagination={false} />

        <Modal
          visible={this.state.isAddVisible}
          title="Add Pull List"
          onCancel={this.closeAdd}
          onOk={this.submitAdd}
        >
          <label htmlFor="pull-list-title" style={{ display: "block", marginBottom: 4 }}>
            Title
          </label>
          <Input
            id="pull-list-title"
            value={this.state.title}
            onChange={(e) => this.setState({ title: e.target.value })}
            placeholder="Pull list title"
          />
        </Modal>
      </>
    );
  }
}

export default PagePullLists;
