import { FormModal } from "@mighty-justice/fields-ant";
import { Table } from "antd";
import autoBindMethods from "class-autobind-decorator";
import { get } from "lodash";
import { inject, observer } from "mobx-react";
import React, { Component } from "react";
import { RouteComponentProps } from "react-router-dom";

import COLUMNS from "./PullsListColumns";
import Store from "../../../store";
import ModalButton from "../../common/ModalButton";
import Title from "../../common/Title";

interface IInjected extends RouteComponentProps {
  store: Store;
}

@inject("store")
@autoBindMethods
@observer
class PullsList extends Component<RouteComponentProps> {
  public constructor(props: RouteComponentProps) {
    super(props);
    this.getAllSeries();
  }

  private get injected() {
    return this.props as IInjected;
  }

  public async getAllSeries() {
    try {
      await this.injected.store.getAllSeries();
    } catch (e) {
      if (get(e, "response.status") === 401) {
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

  public render() {
    const { store } = this.injected;
    return (
      <div>
        <Title title="Pulls">
          <ModalButton
            label="Add new"
            modalComponent={FormModal}
            modalProps={{
              fieldSets: [
                [
                  {
                    endpoint: "marvel:search/series",
                    field: "series_id",
                    label: "Series",
                    type: "objectSearch",
                  },
                  {
                    field: "pull_list",
                    optionType: "pullLists",
                    type: "optionSelect",
                  },
                ],
              ],
              onSave: this.onAddNew,
              title: "Add Series",
            }}
          />
        </Title>

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
