import { Button, Table } from "antd";
import { observer } from "mobx-react";
import React, { useCallback, useContext, useState } from "react";
import { RouteComponentProps } from "react-router";

import Store, { Resources } from "../../store";
import { StoreContext } from "../../storeContext";

interface ISmartButton {
  onClick: () => Promise<any> | any;
}

const SmartButton = ({ onClick, children }: React.PropsWithChildren<ISmartButton>) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleClick = useCallback(async () => {
    try {
      setIsLoading(true);
      await onClick();
    } finally {
      setIsLoading(false);
    }
  }, [onClick]);
  return (
    <Button loading={isLoading} onClick={handleClick}>
      {children}
    </Button>
  );
};

export default observer(function PageResources(_props: RouteComponentProps) {
  const store = useContext<Store>(StoreContext);

  const renderClickable = useCallback(
    (value: keyof Resources) => {
      const resource = store.resources[value];
      if (!resource) return "--";
      return <SmartButton onClick={() => resource.clear()}>Clear</SmartButton>;
    },
    [store]
  );

  const model = (Object.keys(store.resources) as Array<keyof Resources>).map((key) => ({
    clearKey: key,
    key,
    cachedValues: store.resources[key].all.length,
  }));

  const columns = [
    { title: "Key", dataIndex: "key", key: "key" },
    {
      title: "Clear",
      dataIndex: "clearKey",
      key: "clearKey",
      render: (value: keyof Resources) => renderClickable(value),
    },
    { title: "Cached Values", dataIndex: "cachedValues", key: "cachedValues" },
  ];

  return <Table rowKey="key" columns={columns} dataSource={model} pagination={false} />;
});
