import { Table } from "antd";
import type { TableProps } from "antd";
import { observer } from "mobx-react";
import React from "react";

function ObserverTableInner<T extends Record<string, any>>(props: TableProps<T>) {
  const { dataSource } = props;
  const cloned = Array.isArray(dataSource) && dataSource.length ? dataSource.slice() : dataSource;
  return <Table<T> {...props} dataSource={cloned as any} />;
}

const ObserverTable = observer(ObserverTableInner) as <T extends Record<string, any>>(
  props: TableProps<T>
) => React.ReactElement;

export default ObserverTable;
