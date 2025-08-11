import { Button, Input, Modal, Select } from "antd";
import { observer } from "mobx-react";
import React, { useCallback, useContext, useMemo, useState } from "react";

import { IComic, IPull } from "../../interfaces";
import Store from "../../store";
import { StoreContext } from "../../storeContext";

interface IProps {
  comic: IComic;
  pull: IPull | undefined;
}

export default observer(function PullButton({ comic, pull }: IProps) {
  const store = useContext<Store>(StoreContext);
  const [visible, setVisible] = useState(false);
  const [pullListId, setPullListId] = useState<number | undefined>(undefined);

  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);
  const submit = useCallback(async () => {
    if (!pullListId) return;
    await store.pulls.post({ pull_list_id: pullListId, series_id: comic.series_id });
    setVisible(false);
    setPullListId(undefined);
  }, [comic.series_id, pullListId, store.pulls]);

  const pullListTitle = useMemo(() => {
    if (!pull) return undefined;
    const pl = store.pullLists.get(pull.pull_list_id);
    return pl && pl.title ? pl.title : undefined;
  }, [pull, store.pullLists]);

  if (pull) {
    return <>{pullListTitle || "--"}</>;
  }

  const { series_id } = comic;
  return (
    <span>
      <Modal visible={visible} title="Add to pull list" onCancel={close} onOk={submit}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor={`pull-series-${series_id}`} style={{ display: "block", marginBottom: 4 }}>
            Series
          </label>
          <Input id={`pull-series-${series_id}`} value={series_id} disabled />
        </div>
        <div>
          <label htmlFor={`pull-list-${series_id}`} style={{ display: "block", marginBottom: 4 }}>
            Pull List
          </label>
          <Select
            id={`pull-list-${series_id}`}
            value={pullListId}
            onChange={(val: number) => setPullListId(val)}
            style={{ width: "100%" }}
            placeholder="Select a pull list"
          >
            {store.pullLists.all.map((pl) => (
              <Select.Option key={pl.id} value={pl.id}>
                {pl.title}
              </Select.Option>
            ))}
          </Select>
        </div>
      </Modal>

      <Button onClick={open}>Pull</Button>
    </span>
  );
});
