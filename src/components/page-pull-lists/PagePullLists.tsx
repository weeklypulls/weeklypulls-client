import { Button, Input, Modal, Table } from "antd";
import { observer } from "mobx-react";
import React, { useCallback, useContext, useEffect, useState } from "react";

import Store from "../../store";
import { StoreContext } from "../../storeContext";
import Title from "../common/Title";

type IModel = Record<string, any>;

function PagePullLists() {
  const store = useContext<Store>(StoreContext);
  const [isAddVisible, setIsAddVisible] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    store.pullLists.listIfCold();
  }, [store.pullLists]);

  const onAddNew = useCallback(
    async (data: IModel) => {
      await store.pullLists.post(data);
    },
    [store.pullLists]
  );

  const openAdd = useCallback(() => setIsAddVisible(true), []);
  const closeAdd = useCallback(() => setIsAddVisible(false), []);
  const submitAdd = useCallback(() => {
    if (!title.trim()) return;
    onAddNew({ title: title.trim() });
    setIsAddVisible(false);
    setTitle("");
  }, [onAddNew, title]);

  const all = store.pullLists.all;
  const columns = [{ title: "Title", dataIndex: "title", key: "title" }];

  return (
    <>
      <Title title="Pull Lists">
        <Button onClick={openAdd}>Add new</Button>
      </Title>

      <Table rowKey="id" dataSource={all} columns={columns} pagination={false} />

      <Modal open={isAddVisible} title="Add Pull List" onCancel={closeAdd} onOk={submitAdd}>
        <label htmlFor="pull-list-title" style={{ display: "block", marginBottom: 4 }}>
          Title
        </label>
        <Input
          id="pull-list-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Pull list title"
        />
      </Modal>
    </>
  );
}

export default observer(PagePullLists);
