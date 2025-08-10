import { Button, Input, Modal, Select, Table } from "antd";
import autoBindMethods from "class-autobind-decorator";
import { inject, observer } from "mobx-react";
import React, { Component } from "react";
import { RouteComponentProps } from "react-router-dom";

import COLUMNS from "./PullsListColumns";
import Store from "../../../store";
import Title from "../../common/Title";

interface IInjected extends RouteComponentProps {
  store: Store;
}

@inject("store")
@autoBindMethods
@observer
class PullsList extends Component<
  RouteComponentProps,
  { isAddVisible: boolean; add_series_id: string; add_pull_list?: number }
> {
  public constructor(props: RouteComponentProps) {
    super(props);
    this.state = { isAddVisible: false, add_series_id: "", add_pull_list: undefined };
    this.getAllSeries();
  }

  private get injected() {
    return this.props as IInjected;
  }

  public async getAllSeries() {
    try {
      await this.injected.store.getAllSeries();
    } catch (e) {
      if ((e as any)?.response?.status === 401) {
        this.props.history.push("/login");
      }
    }
  }

  public dataSource() {
    const { store } = this.injected;
    return store.pullsWithSeries();
  }

  private onAddNew(data: Record<string, unknown>) {
    console.log(data);
  }

  private openAdd = () => this.setState({ isAddVisible: true });
  private closeAdd = () => this.setState({ isAddVisible: false });
  private submitAdd = async () => {
    const { add_series_id, add_pull_list } = this.state;
    const series_id = add_series_id && add_series_id.trim();
    if (!series_id || !add_pull_list) {
      return;
    }
    // Keep existing behavior (console), but wire through to onAddNew for now
    this.onAddNew({ series_id, pull_list_id: add_pull_list });
    this.setState({ isAddVisible: false, add_series_id: "", add_pull_list: undefined });
  };

  public render() {
    const { store } = this.injected;
    const { isAddVisible, add_series_id, add_pull_list } = this.state;

    return (
      <div>
        <Title title="Pulls">
          <Button onClick={this.openAdd}>Add new</Button>
        </Title>

        <Modal
          visible={isAddVisible}
          title="Add Series"
          onCancel={this.closeAdd}
          onOk={this.submitAdd}
        >
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="add-series" style={{ display: "block", marginBottom: 4 }}>
              Series
            </label>
            <Input
              id="add-series"
              placeholder="Series ID"
              value={add_series_id}
              onChange={(e) => this.setState({ add_series_id: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="add-pulllist" style={{ display: "block", marginBottom: 4 }}>
              Pull List
            </label>
            <Select
              id="add-pulllist"
              value={add_pull_list}
              onChange={(val: number) => this.setState({ add_pull_list: val })}
              style={{ width: "100%" }}
              placeholder="Select a pull list"
            >
              {store.pullLists.all.map((pl: any) => (
                <Select.Option key={pl.id} value={pl.id}>
                  {pl.title}
                </Select.Option>
              ))}
            </Select>
          </div>
        </Modal>

        <Table
          columns={COLUMNS as any}
          dataSource={this.dataSource()}
          loading={store.isLoading}
          pagination={false}
          size="small"
        />
      </div>
    );
  }
}

export default PullsList;
