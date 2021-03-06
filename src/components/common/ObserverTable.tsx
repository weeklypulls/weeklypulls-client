import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Table } from 'antd';
import { TableProps } from 'antd/lib/table/interface';

@observer
class ObserverTable<T> extends Component<TableProps<T>> {
  private get dataSource () {
    const { dataSource } = this.props;

    if (dataSource && dataSource.length) {
      return dataSource.slice();
    }
    return dataSource;
  }

  public render () {
    return <Table {...this.props} dataSource={this.dataSource} />;
  }
}

export default ObserverTable;
