import { Button, Input, Modal, Select, Table } from "antd";
import { useCallback, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";

import COLUMNS from "./PullsListColumns";
import { IPullSeriesPair } from "../../../interfaces";
import { usePulls, usePullLists } from "../../../queries";
import Title from "../../common/Title";

function PullsList() {
  // const navigate = useNavigate(); // reserved for future navigation needs
  const pullsQuery = usePulls();
  const pullListsQuery = usePullLists();
  const [isAddVisible, setIsAddVisible] = useState(false);
  const [addSeriesId, setAddSeriesId] = useState("");
  const [addPullList, setAddPullList] = useState<number | undefined>(undefined);
  const dataSource: IPullSeriesPair[] = useMemo(() => {
    if (!pullsQuery.data) return [];
    return pullsQuery.data.map((pull: any) => ({
      key: pull.id,
      pull,
      pullList: pullListsQuery.data?.find((pl: any) => pl.id === pull.pull_list_id),
    }));
  }, [pullsQuery.data, pullListsQuery.data]);

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

      <Modal open={isAddVisible} title="Add Series" onCancel={closeAdd} onOk={submitAdd}>
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
            options={(pullListsQuery.data || []).map((pl: any) => ({
              label: pl.title,
              value: pl.id,
            }))}
          />
        </div>
      </Modal>

      <Table<IPullSeriesPair>
        columns={COLUMNS}
        dataSource={dataSource}
        loading={pullsQuery.isLoading || pullListsQuery.isLoading}
        pagination={false}
        size="small"
      />
    </div>
  );
}
export default PullsList;
