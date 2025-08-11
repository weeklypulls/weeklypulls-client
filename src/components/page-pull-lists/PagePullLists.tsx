import { Button, Input, Modal, Table } from "antd";
import { useCallback, useState } from "react";

import { usePullLists, useCreatePullList } from "../../queries";
import Title from "../common/Title";

type IModel = Record<string, any>;

function PagePullLists() {
  const { data: pullLists = [], isLoading } = usePullLists();
  const createMutation = useCreatePullList();
  const [isAddVisible, setIsAddVisible] = useState(false);
  const [title, setTitle] = useState("");

  const onAddNew = useCallback(
    async (data: IModel) => {
      await createMutation.mutateAsync(data as { title: string });
    },
    [createMutation]
  );

  const openAdd = useCallback(() => setIsAddVisible(true), []);
  const closeAdd = useCallback(() => setIsAddVisible(false), []);
  const submitAdd = useCallback(() => {
    if (!title.trim()) return;
    onAddNew({ title: title.trim() });
    setIsAddVisible(false);
    setTitle("");
  }, [onAddNew, title]);

  const all = pullLists;
  const columns = [{ title: "Title", dataIndex: "title", key: "title" }];

  return (
    <>
      <Title title="Pull Lists">
        <Button onClick={openAdd}>Add new</Button>
      </Title>

      <Table
        rowKey="id"
        dataSource={all}
        columns={columns}
        loading={isLoading}
        pagination={false}
      />

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

export default PagePullLists;
