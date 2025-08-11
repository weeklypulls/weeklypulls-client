import { Modal, Select, Table, Spin, Empty, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import { IComic, IComicPullSeriesPair } from "../../../interfaces";
import { usePull, useSeries, usePullLists, useUpdatePull, useDeletePull } from "../../../queries";
import utils from "../../../utils";
import Images from "../../common/Images";
import LoadingButton from "../../common/LoadingButton";
import ReadButton from "../../common/ReadButton";
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

  const dataSource: IComicPullSeriesPair[] = useMemo(() => {
    const pull = pullQuery.data;
    const series = seriesQuery.data;
    if (!pull || !series) return [];
    return (series?.comics ?? []).map((comic: IComic) => ({
      comic,
      key: comic.id,
      pull,
      read: (pull.read || []).includes(comic.id),
      series,
    }));
  }, [pullQuery.data, seriesQuery.data]);

  const columns: ColumnsType<IComicPullSeriesPair> = useMemo(
    () => [
      {
        dataIndex: "read",
        key: "read",
        title: "Read",
        render: (_: unknown, record: IComicPullSeriesPair) => (
          <ReadButton comic={record.comic} value={record.read} />
        ),
      },
      {
        dataIndex: "comic.images",
        key: "comic.images",
        title: "Covers",
        render: (_: unknown, record: IComicPullSeriesPair) => (
          <Images images={record.comic.images} />
        ),
      },
      {
        dataIndex: "comic.on_sale",
        key: "comic.on_sale",
        title: "On Sale",
        render: (_: unknown, record: IComicPullSeriesPair) => {
          const text = record.comic.on_sale;
          if (!text) return "--";
          const date = text.slice(0, 10);
          return <Link to={`/weeks/${date}`}>{date}</Link>;
        },
      },
      {
        dataIndex: "comic.title",
        key: "comic.title",
        title: "Title",
      },
    ],
    []
  );

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
  if (isBusy || pullQuery.isLoading || seriesQuery.isLoading) return <Spin size="large" />;
  if (!pull) return <Empty description="Pull not found" />;
  const series = seriesQuery.data;

  return (
    <div>
      <Title title={series?.title || ""}>
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
          options={(pullListsQuery.data || []).map((pl: any) => ({
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
        size="small"
      />
    </div>
  );
}
