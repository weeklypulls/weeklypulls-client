import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Row, Col } from "antd";
import { observer } from "mobx-react";
import React, { useContext, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import COLUMNS from "./WeeksDetailPageColumns";
import { IComic, IComicPullPair } from "../../../interfaces";
import Store from "../../../store";
import { StoreContext } from "../../../storeContext";
import utils from "../../../utils";
import ObserverTable from "../../common/ObserverTable";

export default observer(function WeeksDetailPage() {
  const store = useContext<Store>(StoreContext);
  const params = useParams<{ weekId: string }>();
  const weekId = params.weekId ?? "";

  useEffect(() => {
    store.weeks.fetchIfCold(weekId);
  }, [store.weeks, weekId]);

  const comics: IComic[] = useMemo(() => {
      const week = store.weeks.get(weekId) as any;
      return (week?.comics ?? []) as IComic[];
    }, [store.weeks, weekId]),
    dataSource: IComicPullPair[] = useMemo(() => {
      return comics.map((comic: IComic) => {
        const pull = (store.pulls.all as any[]).find(
          (p) => String(p.series_id) === String(comic.series_id)
        );
        if (!pull) {
          return {
            comic,
            key: comic.id,
            pull,
            read: false,
            store,
          } as any;
        }
        return {
          comic,
          key: comic.id,
          pull,
          read: pull.read.includes(comic.id),
          store,
        } as any;
      });
    }, [comics, store]),
    nextWeek = utils.nextWeek(weekId),
    lastWeek = utils.prevWeek(weekId);

  return (
    <div>
      <Row justify="space-between" align="top">
        <Col span={12}>
          <h2>Week of {weekId}</h2>
        </Col>
        <Col span={12} style={{ textAlign: "right" }}>
          <Button.Group>
            <Link to={`/weeks/${lastWeek}`}>
              <Button type="primary">
                <LeftOutlined />
                {lastWeek}
              </Button>
            </Link>{" "}
            <Button disabled>{weekId}</Button>{" "}
            <Link to={`/weeks/${nextWeek}`}>
              <Button type="primary">
                {nextWeek}
                <RightOutlined />
              </Button>
            </Link>
          </Button.Group>
        </Col>
      </Row>

      <ObserverTable
        columns={COLUMNS as any}
        dataSource={dataSource}
        loading={store.isLoading}
        pagination={false}
        size="small"
      />
    </div>
  );
});
