import { Modal, Select, Table, Spin, Empty, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { IIssue, IPullList } from "../../../interfaces";
import {
  usePull,
  useSeries,
  usePullLists,
  useUpdatePull,
  useDeletePull,
  useMarkAllRead,
} from "../../../queries";
import utils from "../../../utils";
import { buildIssueColumns, buildReadColumn } from "../../common/issueColumns";
import LoadingButton from "../../common/LoadingButton";
import Title from "../../common/Title";

export default function PullsDetail() {
  const { pullId = "" } = useParams<{ pullId: string }>();
  const navigate = useNavigate();

  const [isBusy, setIsBusy] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [editPullListId, setEditPullListId] = useState<number | undefined>(undefined);
  const pullQuery = usePull(pullId);
  const pullListsQuery = usePullLists();
  const seriesQuery = useSeries(pullQuery.data?.series_id);
  const updatePull = useUpdatePull();
  const deletePull = useDeletePull();
  const markAllRead = useMarkAllRead();

  const dataSource: IIssue[] = useMemo(() => {
    const pull = pullQuery.data;
    const series = seriesQuery.data;
    if (!pull || !series) return [];
    const readSet = new Set<string>((pull.read || []).map(String));
    return (series?.comics ?? []).map((comic: IIssue) => {
      return {
        ...comic,
        volume: {
          ...comic.volume,
          name: series.title || comic.volume.name,
        },
        pull: {
          id: String(pull.id),
          pulled: true,
          read: readSet.has(String(comic.id)),
          pull_list_id: String(pull.pull_list_id || ""),
        },
      } as IIssue;
    });
  }, [pullQuery.data, seriesQuery.data]);

  const columns: ColumnsType<IIssue> = useMemo(() => {
    const base = buildIssueColumns({
      overrides: {
        titleSecondary: () => (seriesQuery.data?.title ? `${seriesQuery.data.title}` : undefined),
      },
    });
    const readCol = buildReadColumn<IIssue>({
      getIssue: (r) => r,
      getValue: (r) => r.pull?.read ?? false,
    });
    return [readCol, ...base];
  }, [seriesQuery.data]);

  const onSave = useCallback(
    async (model: Record<string, unknown>) => {
      if (!pullId) return;
      await updatePull.mutateAsync({ pullId, data: model });
      setIsEditVisible(false);
    },
    [pullId, updatePull]
  );

  const onDelete = useCallback(async () => {
    if (!pullId) return;
    setIsBusy(true);
    await deletePull.mutateAsync(pullId);
    navigate(-1);
    setIsBusy(false);
  }, [deletePull, pullId, navigate]);

  const openEdit = useCallback((pullListId: number) => {
    setEditPullListId(pullListId);
    setIsEditVisible(true);
  }, []);

  const closeEdit = useCallback(() => setIsEditVisible(false), []);
  const onEditOk = useCallback(
    () => onSave({ pull_list_id: editPullListId }),
    [onSave, editPullListId]
  );

  const pull = pullQuery.data;
  const series = seriesQuery.data;
  const allIssueIds = dataSource.map((i: IIssue) => i.id);
  const isAllRead = !!(
    pull?.read &&
    allIssueIds.length > 0 &&
    pull.read.length >= allIssueIds.length
  );
  const onMarkAllRead = useCallback(() => {
    if (!pull?.id || isAllRead) return;
    markAllRead.mutate({ pullId: String(pull.id), issueIds: allIssueIds });
  }, [pull?.id, isAllRead, markAllRead, allIssueIds]);

  if (isBusy || pullQuery.isLoading || seriesQuery.isLoading) return <Spin size="large" />;
  if (!pull) return <Empty description="Pull not found" />;

  return (
    <div>
      <Title title={series?.title || ""}>
        <LoadingButton
          onClick={onMarkAllRead}
          disabled={isAllRead || !allIssueIds.length}
          loading={markAllRead.isPending}
        >
          {isAllRead ? "All Read" : "Mark All Read"}
        </LoadingButton>
        <LoadingButton danger onClick={onDelete}>
          Delete
        </LoadingButton>
        <Button onClick={() => openEdit(Number(pull?.pull_list_id))}>Edit</Button>
      </Title>

      <Modal open={isEditVisible} title={series?.title || ""} onCancel={closeEdit} onOk={onEditOk}>
        <label htmlFor="edit-pull-list" style={{ display: "block", marginBottom: 4 }}>
          Pull List
        </label>
        <Select<number>
          id="edit-pull-list"
          value={editPullListId}
          onChange={(val) => setEditPullListId(val)}
          style={{ width: "100%" }}
          options={(pullListsQuery.data || [])!.map((pl: IPullList) => ({
            label: pl.title,
            value: pl.id,
          }))}
        />
      </Modal>
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={pullQuery.isLoading || seriesQuery.isLoading}
        pagination={{ pageSize: 50 }}
        rowClassName={utils.rowClassName}
        rowKey={(r) => r.id}
        size="small"
      />
    </div>
  );
}
