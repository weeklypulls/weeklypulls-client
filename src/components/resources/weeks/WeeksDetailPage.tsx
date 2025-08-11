import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Row, Col, Table } from "antd";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import COLUMNS from "./WeeksDetailPageColumns";
import { IComic, IComicPullPair } from "../../../interfaces";
import { useWeek, usePulls } from "../../../queries";
import utils from "../../../utils";

export default function WeeksDetailPage() {
  const params = useParams<{ weekId: string }>();
  const weekId = params.weekId ?? "";

  const weekQuery = useWeek(weekId);
  const pullsQuery = usePulls();

  const comics: IComic[] = useMemo(() => {
    return weekQuery.data?.comics ?? [];
  }, [weekQuery.data]);

  const dataSource: IComicPullPair[] = useMemo(() => {
    const pulls = pullsQuery.data ?? [];
    return comics.map((comic: IComic) => {
      const pull = pulls.find((p) => String(p.series_id) === String(comic.series_id));
      return {
        comic,
        key: comic.id,
        pull,
        read: pull ? pull.read.includes(comic.id) : false,
      };
    });
  }, [comics, pullsQuery.data]);

  const nextWeek = utils.nextWeek(weekId);
  const lastWeek = utils.prevWeek(weekId);

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

      <Table
        columns={COLUMNS}
        dataSource={dataSource}
        loading={weekQuery.isLoading || pullsQuery.isLoading}
        pagination={false}
        size="small"
        rowClassName={utils.rowClassName}
      />
    </div>
  );
}
