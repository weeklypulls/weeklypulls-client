import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Alert, Button, Empty, Table } from "antd";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import COLUMNS from "./WeeksDetailPageColumns";
import { IIssue } from "../../../interfaces";
import { useWeek } from "../../../queries";
import utils from "../../../utils";
import PageSpace from "../../common/PageSpace";
import Title from "../../common/Title";

export default function WeeksDetailPage() {
  const params = useParams<{ weekId: string }>();
  const weekId = params.weekId ?? "";

  const weekQuery = useWeek(weekId);

  const dataSource: IIssue[] = useMemo(() => {
    return weekQuery.data?.comics ?? [];
  }, [weekQuery.data]);

  const nextWeek = utils.nextWeek(weekId);
  const lastWeek = utils.prevWeek(weekId);

  return (
    <PageSpace>
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

      {weekQuery.isError && (
        <Alert
          type="error"
          showIcon
          message="Failed to load this week’s issues"
          description={weekQuery.error?.message || "An unexpected error occurred."}
          action={
            <Button size="small" onClick={() => weekQuery.refetch()} loading={weekQuery.isFetching}>
              Retry
            </Button>
          }
        />
      )}

      {weekQuery.data?.priming && weekQuery.data.priming.complete === false && (
        <Alert
          type="info"
          showIcon
          message="Still fetching more issues for this week"
          description={
            weekQuery.data.priming.next_date
              ? `Next date ${weekQuery.data.priming.next_date} (page ${weekQuery.data.priming.next_page ?? 1})`
              : undefined
          }
          action={
            <Button
              type="primary"
              onClick={() => weekQuery.refetch()}
              loading={weekQuery.isFetching}
            >
              Fetch more
            </Button>
          }
        />
      )}

      {!weekQuery.isLoading && !weekQuery.isError && dataSource.length === 0 && (
        <Empty description="No issues found for this week" />
      )}

      {(dataSource.length > 0 || weekQuery.isLoading) && (
        <Table
          columns={COLUMNS}
          dataSource={dataSource}
          loading={weekQuery.isLoading}
          pagination={false}
          size="small"
          rowKey="id"
          rowClassName={utils.rowClassName}
        />
      )}
    </PageSpace>
  );
}
