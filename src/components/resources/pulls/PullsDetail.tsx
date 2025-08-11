import { Modal, Select, Table, Spin, Empty, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { observer } from "mobx-react";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import { IComic, IComicPullSeriesPair } from "../../../interfaces";
import Store from "../../../store";
import { StoreContext } from "../../../storeContext";
import utils from "../../../utils";
import Images from "../../common/Images";
import LoadingButton from "../../common/LoadingButton";
import ReadButton from "../../common/ReadButton";
import Title from "../../common/Title";

export default observer(function PullsDetail() {
  const store = useContext<Store>(StoreContext);
  const { pullId = "" } = useParams<{ pullId: string }>();
  const navigate = useNavigate();

  const [isBusy, setIsBusy] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [editPullListId, setEditPullListId] = useState<number | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const pull = await store.pulls.fetchIfCold(pullId);
        await Promise.all([
          store.pullLists.fetchIfCold(pull.pull_list_id),
          store.series.fetchIfCold(pull.series_id),
        ]);
      } catch (e: any) {
        // tslint:disable-next-line no-console
        console.error(e);
        if (mounted && e?.response?.status === 401) {
          navigate("/login");
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [store, pullId, navigate]);

  const dataSource: IComicPullSeriesPair[] = useMemo(() => {
    const pullWithSeries = store.pullWithSeries(pullId);
    if (!pullWithSeries) return [];
    const { series, pull } = pullWithSeries;
    return (series?.comics ?? []).map((comic: IComic) => ({
      comic,
      key: comic.id,
      pull,
      read: pull.read.includes(comic.id),
      series,
    }));
  }, [store, pullId]);

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
      const pullWithSeries = store.pullWithSeries(pullId);
      if (!pullWithSeries) return;
      const { pull } = pullWithSeries;
      if (pull.id) {
        await store.pulls.patch(pull.id, model);
      } else {
        await store.pulls.post({ ...model, series_id: pull.series_id });
      }
      setIsEditVisible(false);
    },
    [store, pullId]
  );

  const onDelete = useCallback(async () => {
    setIsBusy(true);
    const pull = await store.pulls.fetchIfCold(pullId);
    await store.pulls.delete(pull.id);
    await store.pullLists.fetch(pull.pull_list_id);
    navigate(-1);
    setIsBusy(false);
  }, [store, pullId, navigate]);

  const openEdit = useCallback((pullListId: number) => {
    setEditPullListId(pullListId);
    setIsEditVisible(true);
  }, []);

  const closeEdit = useCallback(() => setIsEditVisible(false), []);
  const onEditOk = useCallback(
    () => onSave({ pull_list_id: editPullListId }),
    [onSave, editPullListId]
  );

  const pullSeriesPair = store.pullWithSeries(pullId);
  if (isBusy) return <Spin size="large" />;
  if (!pullSeriesPair) return <Empty description="Pull not found" />;

  return (
    <div>
      <Title title={pullSeriesPair.series?.title || ""}>
        <LoadingButton danger onClick={onDelete}>
          Delete
        </LoadingButton>
        <Button onClick={() => openEdit(Number(pullSeriesPair.pull?.pull_list_id))}>Edit</Button>
      </Title>

      <Modal
        open={isEditVisible}
        title={pullSeriesPair.series?.title || ""}
        onCancel={closeEdit}
        onOk={onEditOk}
      >
        <label htmlFor="edit-pull-list" style={{ display: "block", marginBottom: 4 }}>
          Pull List
        </label>
        <Select<number>
          id="edit-pull-list"
          value={editPullListId}
          onChange={(val) => setEditPullListId(val)}
          style={{ width: "100%" }}
          options={store.pullLists.all.map((pl) => ({ label: pl.title, value: pl.id }))}
        />
      </Modal>
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={store.isLoading}
        pagination={{ pageSize: 50 }}
        rowClassName={utils.rowClassName}
        size="small"
      />
    </div>
  );
});
