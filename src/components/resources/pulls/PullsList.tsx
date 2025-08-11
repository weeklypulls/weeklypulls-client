import { Button, Input, Modal, Select, Table } from "antd";
import { observer } from "mobx-react";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router-dom";

import COLUMNS from "./PullsListColumns";
import Store from "../../../store";
import { StoreContext } from "../../../storeContext";
import Title from "../../common/Title";

function PullsList(_props: RouteComponentProps) {
  const store = useContext<Store>(StoreContext);
  const history = useHistory();
  const [isAddVisible, setIsAddVisible] = useState(false);
  const [addSeriesId, setAddSeriesId] = useState("");
  const [addPullList, setAddPullList] = useState<number | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await store.getAllSeries();
      } catch (e: any) {
        if (mounted && e?.response?.status === 401) {
          history.push("/login");
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [store, history]);

  const dataSource = useMemo(() => store.pullsWithSeries(), [store]);

  const onAddNew = useCallback((data: Record<string, unknown>) => {
    // Preserve existing behavior
    // tslint:disable-next-line:no-console
    console.log(data);
  }, []);

  const openAdd = useCallback(() => setIsAddVisible(true), []);
  const closeAdd = useCallback(() => setIsAddVisible(false), []);
  const submitAdd = useCallback(async () => {
    const series_id = addSeriesId && addSeriesId.trim();
    if (!series_id || !addPullList) return;
    onAddNew({ series_id, pull_list_id: addPullList });
    setIsAddVisible(false);
    setAddSeriesId("");
    setAddPullList(undefined);
  }, [addSeriesId, addPullList, onAddNew]);

  return (
    <div>
      <Title title="Pulls">
        <Button onClick={openAdd}>Add new</Button>
      </Title>

      <Modal visible={isAddVisible} title="Add Series" onCancel={closeAdd} onOk={submitAdd}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="add-series" style={{ display: "block", marginBottom: 4 }}>
            Series
          </label>
          <Input
            id="add-series"
            placeholder="Series ID"
            value={addSeriesId}
            onChange={(e) => setAddSeriesId(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="add-pulllist" style={{ display: "block", marginBottom: 4 }}>
            Pull List
          </label>
          <Select
            id="add-pulllist"
            value={addPullList}
            onChange={(val: number) => setAddPullList(val)}
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
        dataSource={dataSource}
        loading={store.isLoading}
        pagination={false}
        size="small"
      />
    </div>
  );
}

export default observer(PullsList);
