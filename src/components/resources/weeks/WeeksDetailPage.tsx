import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Table } from "antd";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import COLUMNS from "./WeeksDetailPageColumns";
import { IComic, IIssue } from "../../../interfaces";
import { issueFromWeekComic } from "../../../models/issue";
import { useWeek } from "../../../queries";
import utils from "../../../utils";
import Title from "../../common/Title";

export default function WeeksDetailPage() {
  const params = useParams<{ weekId: string }>();
  const weekId = params.weekId ?? "";

  const weekQuery = useWeek(weekId);

  const comics: IComic[] = useMemo(() => {
    return weekQuery.data?.comics ?? [];
  }, [weekQuery.data]);

  const dataSource: IIssue[] = useMemo(() => {
    return comics.map((comic: IComic) => issueFromWeekComic(comic));
  }, [comics]);

  const nextWeek = utils.nextWeek(weekId);
  const lastWeek = utils.prevWeek(weekId);

  return (
    <div>
      <Title title={`Week of ${weekId}`}>
        <Link to={`/weeks/${lastWeek}`}>
          <Button type="primary" icon={<LeftOutlined />}>
            {lastWeek}
          </Button>
        </Link>
        <Button disabled>{weekId}</Button>
        <Link to={`/weeks/${nextWeek}`}>
          <Button type="primary" icon={<RightOutlined />} iconPosition="end">
            {nextWeek}
          </Button>
        </Link>
      </Title>
      <Table
        columns={COLUMNS}
        dataSource={dataSource}
        loading={weekQuery.isLoading}
        pagination={false}
        size="small"
        rowClassName={utils.rowClassName}
      />
    </div>
  );
}
