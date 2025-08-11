import { Table } from "antd";
import type { TableProps } from "antd";
import { observer } from "mobx-react";
import React, { Component } from "react";

@observer
class ObserverTable<T extends Record<string, any>> extends Component<TableProps<T>> {
  private get dataSource() {
    const { dataSource } = this.props;

    if (dataSource && dataSource.length) {
      return dataSource.slice();
    }

    return dataSource;
  }

  public render() {
    return <Table<T> {...this.props} dataSource={this.dataSource} />;
  }
}

export default ObserverTable;
