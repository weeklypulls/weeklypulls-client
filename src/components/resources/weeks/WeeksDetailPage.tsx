import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Alert, Button, Empty, Table } from "antd";
import type { TableProps } from "antd";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import buildWeeksColumns from "./WeeksDetailPageColumns";
import { IIssue } from "../../../interfaces";
import { useWeek } from "../../../queries";
import utils from "../../../utils";
import PageSpace from "../../common/PageSpace";
import Title from "../../common/Title";

export default function WeeksDetailPage() {
  const params = useParams<{ weekId: string }>();
  const weekId = params.weekId ?? "";

  const weekQuery = useWeek(weekId);

  // Persisted table state (sorter + filters)
  type StoredState = {
    sorter?: { columnKey?: string; order?: "ascend" | "descend" | null };
    filters?: { publisher?: string[] };
  };
  const STORAGE_KEY = "weeks.tableState.v1";

  const [stored, setStored] = useState<StoredState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as StoredState;
    } catch {
      // ignore
    }
    // First-time default: if user prefers Marvel, default to that filter
    return { filters: { publisher: ["Marvel"] } };
  });

  const dataSource: IIssue[] = useMemo(() => {
    return weekQuery.data?.comics ?? [];
  }, [weekQuery.data]);

  const nextWeek = utils.nextWeek(weekId);
  const lastWeek = utils.prevWeek(weekId);

  const publisherFilters = useMemo(() => {
    const names = new Set<string>();
    for (const issue of dataSource) {
      const name = issue.volume.publisher?.name;
      if (name) names.add(name);
    }
    return Array.from(names)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ text: name, value: name }));
  }, [dataSource]);

  // Derive controlled column state
  const publisherFilteredValue = stored.filters?.publisher;
  const publisherSortOrder =
    stored.sorter?.columnKey === "publisher" ? (stored.sorter.order ?? null) : null;

  const columns = useMemo(
    () =>
      buildWeeksColumns(publisherFilters, {
        publisherFilteredValue,
        publisherSortOrder,
      }),
    [publisherFilters, publisherFilteredValue, publisherSortOrder]
  );

  const handleTableChange: TableProps<IIssue>["onChange"] = (_pagination, filters, sorter) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    const next: StoredState = {
      sorter: {
        columnKey: (s?.columnKey as string | undefined) ?? undefined,
        order: s?.order ?? null,
      },
      filters: {
        publisher: (filters?.publisher as string[] | undefined) ?? undefined,
      },
    };
    setStored(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  };

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
          columns={columns}
          dataSource={dataSource}
          loading={weekQuery.isLoading}
          pagination={false}
          size="small"
          rowKey="id"
          rowClassName={utils.rowClassName}
          onChange={handleTableChange}
        />
      )}
    </PageSpace>
  );
}
