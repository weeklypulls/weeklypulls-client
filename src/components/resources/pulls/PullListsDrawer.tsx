import { Button, Drawer, Input, Modal, Table } from "antd";
import { useCallback, useState } from "react";

import { usePullLists, useCreatePullList } from "../../../queries";

type IModel = Record<string, unknown>;

interface IProps {
  open: boolean;
  onClose: () => void;
}

function PullListsDrawer({ open, onClose }: IProps) {
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

  const columns = [{ title: "Title", dataIndex: "title", key: "title" }];

  return (
    <Drawer
      title="Pull Lists"
      open={open}
      onClose={onClose}
      extra={<Button onClick={openAdd}>Add new</Button>}
    >
      <Table
        rowKey="id"
        dataSource={pullLists}
        columns={columns}
        loading={isLoading}
        pagination={false}
        size="small"
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
    </Drawer>
  );
}

export default PullListsDrawer;
