import { Table, Button, Input, Row, Col } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useMemo, useState, ChangeEvent } from "react";

import COLUMNS from "./UnreadIssuesColumns";
import { IIssue } from "../../../interfaces";
import { useUnreadIssues } from "../../../queries";
import ReadButton from "../../common/ReadButton";
import Title from "../../common/Title";

interface IFilters {
  page?: number;
  limit?: number; // page_size
  since?: string;
  ordering?: "date" | "-date";
}

export default function UnreadIssues() {
  // Server-side pagination defaults
  const [filters, setFilters] = useState<IFilters>({ page: 1, limit: 50, ordering: "-date" });
  const unreadIssuesQuery = useUnreadIssues(filters);
  // marking handled via ReadButton (uses optimistic cache + invalidation)

  // Refetch unread issues when filters change handled automatically via query key

  // page size handled via Table's built-in size changer

  const onDateChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const since = e.target.value || undefined;
    setFilters((prev) => ({ ...prev, since }));
  }, []);

  const onRefresh = useCallback(() => unreadIssuesQuery.refetch(), [unreadIssuesQuery]);

  const envelope = unreadIssuesQuery.data as
    | { count: number; next: string | null; previous: string | null; results: IIssue[] }
    | undefined;
  const unreadRows = useMemo(() => envelope?.results || [], [envelope]);
  const data: IIssue[] = useMemo(() => unreadRows, [unreadRows]);
  const columns: ColumnsType<IIssue> = useMemo(() => {
    const readCol = {
      key: "read",
      dataIndex: "read",
      title: "",
      width: 48,
      render: (_: unknown, issue: IIssue) => {
        return <ReadButton issue={issue} value={issue.pull?.read ?? false} />;
      },
    };
    return [readCol, ...COLUMNS];
  }, []);

  // reflect server sort state in the Date column
  const columnsWithSort = useMemo(() => {
    return columns.map((c: any) =>
      c.key === "date"
        ? {
            ...c,
            sortOrder:
              filters.ordering === "date"
                ? "ascend"
                : filters.ordering === "-date"
                  ? "descend"
                  : null,
          }
        : c
    );
  }, [columns, filters.ordering]);

  const pullFilterOptions = useMemo(() => {
    const map = new Map<string, { text: string; value: string }>();
    data.forEach((i) => {
      const base = (i.volume?.name || "").trim();
      if (!base) return;
      const year = i.volume?.start_year ? ` (${i.volume.start_year})` : "";
      const label = `${base}${year}`;
      const value = `${base}$${i.volume?.start_year || ""}`;
      if (!map.has(value)) map.set(value, { text: label, value });
    });
    return Array.from(map.values()).sort((a, b) => a.text.localeCompare(b.text));
  }, [data]);

  columns.forEach((col) => {
    if (col.key === "pull") {
      col.filters = pullFilterOptions;
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
        <Col span={12}>
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
        <Col span={24} style={{ paddingTop: 12 }}>
          <Button type="default" onClick={onRefresh}>
            Apply Filters
          </Button>
        </Col>
      </Row>

      <Table
        columns={columnsWithSort}
        dataSource={data}
        loading={unreadIssuesQuery.isLoading}
        pagination={{
          current: filters.page || 1,
          pageSize: filters.limit || 50,
          total: envelope?.count || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} unread issues`,
        }}
        onChange={(pagination, _filters, sorter) => {
          // Map table sort for date column to server-side ordering
          // sorter can be an array in multi-sort; we only use the first
          const s = Array.isArray(sorter) ? sorter[0] : sorter;
          const isDateColumn = s && (s.columnKey === "date" || s.field === "date");
          if (isDateColumn) {
            let order: IFilters["ordering"] | undefined;
            if (s.order === "ascend") order = "date";
            else if (s.order === "descend") order = "-date";
            else order = undefined;
            setFilters((prev) => ({ ...prev, ordering: order, page: 1 }));
            // Proactively refetch so the user sees results immediately
            unreadIssuesQuery.refetch();
          }
          // Handle page/pageSize changes
          if (pagination) {
            const nextPage = pagination.current;
            const nextSize = pagination.pageSize;
            setFilters((prev) => ({
              ...prev,
              page: nextPage || 1,
              limit: nextSize || prev.limit,
            }));
          }
        }}
        rowKey={(r) => r.id}
        size="small"
      />
    </div>
  );
}
