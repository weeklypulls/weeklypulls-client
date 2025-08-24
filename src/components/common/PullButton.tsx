import { Button, Input, Modal, Select } from "antd";
import { useCallback, useMemo, useState } from "react";

import { IIssue, IPull, IPullList } from "../../interfaces";
import { usePullLists, useCreatePull } from "../../queries";

interface IProps {
  issue: IIssue;
  pull: IPull | undefined;
}

export default function PullButton({ issue, pull }: IProps) {
  const pullListsQuery = usePullLists();
  const [visible, setVisible] = useState(false);
  const [pullListId, setPullListId] = useState<number | undefined>(undefined);
  const createPull = useCreatePull();

  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);
  const submit = useCallback(async () => {
    if (!pullListId) return;
    await createPull.mutateAsync({ pull_list_id: pullListId, series_id: issue.volume.id });
    setVisible(false);
    setPullListId(undefined);
  }, [issue.volume.id, pullListId, createPull]);

  const pullListTitle = useMemo(() => {
    if (!pull) return undefined;
    const pullLists = pullListsQuery.data || [];
    const pl = (pullLists as IPullList[]).find((p) => String(p.id) === String(pull?.pull_list_id));
    return pl?.title;
  }, [pull, pullListsQuery.data]);

  if (pull) {
    return <>{pullListTitle || "--"}</>;
  }

  const series_id = issue.volume.id;
  return (
    <span>
      <Modal open={visible} title="Add to pull list" onCancel={close} onOk={submit}>
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
          <Select<number>
            id={`pull-list-${series_id}`}
            value={pullListId}
            onChange={(val: number) => setPullListId(val)}
            style={{ width: "100%" }}
            placeholder="Select a pull list"
            options={(pullListsQuery.data || []).map((pl: IPullList) => ({
              label: pl.title,
              value: pl.id,
            }))}
          />
        </div>
      </Modal>

      <Button onClick={open}>Pull</Button>
    </span>
  );
}
