import { Table, Button, Input, Row, Col } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useMemo, useRef, useState, ChangeEvent } from "react";

import COLUMNS from "./UnreadIssuesColumns";
import { IUnreadIssue } from "../../../interfaces";
import { useUnreadIssues, useMarkUnreadIssue } from "../../../queries";
import Title from "../../common/Title";

interface IFilters {
  limit?: number;
  since?: string;
}

export default function UnreadIssues() {
  const [filters, setFilters] = useState<IFilters>({ limit: 50 });
  const unreadIssuesQuery = useUnreadIssues(filters);
  const markIssueMutation = useMarkUnreadIssue();
  const rowLoading = useRef<Set<number>>(new Set());
  const [, forceTick] = useState(0); // to trigger rerenders for rowLoading changes

  // Refetch unread issues when filters change handled automatically via query key

  const onLimitChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const limit = parseInt(event.target.value, 10);
    setFilters((prev) => ({
      ...prev,
      limit: isNaN(limit) ? undefined : Math.max(1, Math.min(200, limit)),
    }));
  }, []);

  const onDateChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const since = e.target.value || undefined;
    setFilters((prev) => ({ ...prev, since }));
  }, []);

  const onRefresh = useCallback(() => unreadIssuesQuery.refetch(), [unreadIssuesQuery]);

  const markAsRead = useCallback(
    async (issue: IUnreadIssue) => {
      const loadSet = rowLoading.current;
      if (loadSet.has(issue.cv_id)) return;
      loadSet.add(issue.cv_id);
      forceTick((x) => x + 1);
      try {
        await markIssueMutation.mutateAsync(issue);
      } catch (e) {
        console.error("Failed to mark as read", e);
      } finally {
        loadSet.delete(issue.cv_id);
        forceTick((x) => x + 1);
      }
    },
    [markIssueMutation]
  );
  const data = useMemo(() => unreadIssuesQuery.data || [], [unreadIssuesQuery.data]);

  const actionColumn = useMemo(
    () => ({
      key: "actions",
      title: "Actions",
      width: 120,
      render: (_text: unknown, record: IUnreadIssue) => (
        <Button
          type="link"
          onClick={() => markAsRead(record)}
          loading={rowLoading.current.has(record.cv_id)}
        >
          Mark Read
        </Button>
      ),
    }),
    [markAsRead]
  );

  const columns: ColumnsType<IUnreadIssue> = useMemo(
    () => [...COLUMNS, actionColumn],
    [actionColumn]
  );

  const titleOptions = useMemo(
    () =>
      Array.from(new Set(data.map((i) => (i.volume_name || "").trim()).filter((n) => !!n))).sort(),
    [data]
  );
  const yearOptions = useMemo(
    () =>
      Array.from(
        new Set(
          data
            .map((i) => i.volume_start_year)
            .filter((y) => y !== null && y !== undefined)
            .map((y) => String(y))
        )
      ).sort((a, b) => Number(a) - Number(b)),
    [data]
  );

  columns.forEach((col) => {
    if (col.key === "title") {
      col.filters = titleOptions.map((name) => ({ text: name, value: name }));
    }
    if (col.key === "year") {
      col.filters = yearOptions.map((y) => ({ text: y, value: y }));
    }
  });

  return (
    <div>
      <Title title="Unread Issues">
        <Button type="primary" onClick={onRefresh} loading={unreadIssuesQuery.isLoading}>
          Refresh
        </Button>
      </Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <label htmlFor="limit-input" style={{ display: "block" }}>
            Limit:
          </label>
          <Input
            id="limit-input"
            type="number"
            value={filters.limit || ""}
            onChange={onLimitChange}
            placeholder="Limit (max 200)"
            style={{ marginTop: 4 }}
          />
        </Col>

        <Col span={8}>
          <label htmlFor="since-date" style={{ display: "block" }}>
            Since Date:
          </label>
          <Input
            id="since-date"
            type="date"
            value={filters.since || ""}
            onChange={onDateChange}
            style={{ width: "100%", marginTop: 4 }}
          />
        </Col>
        <Col span={8} style={{ paddingTop: 24 }}>
          <Button type="default" onClick={onRefresh}>
            Apply Filters
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={data}
        loading={unreadIssuesQuery.isLoading}
        pagination={{
          pageSize: 50,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} unread issues`,
        }}
        rowKey="cv_id"
        size="small"
      />
    </div>
  );
}
