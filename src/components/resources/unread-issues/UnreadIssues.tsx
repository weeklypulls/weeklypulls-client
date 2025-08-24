import { Table, Button, Input, Row, Col } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import { useCallback, useMemo, useState, useEffect, ChangeEvent } from "react";

import COLUMNS from "./UnreadIssuesColumns";
import { IIssue } from "../../../interfaces";
import { useUnreadIssues } from "../../../queries";
import ReadButton from "../../common/ReadButton";
import Title from "../../common/Title";

interface IFilters {
  page?: number;
  limit?: number;
  since?: string;
  ordering?: "date" | "-date";
}

export default function UnreadIssues() {
  const [filters, setFilters] = useState<IFilters>({ page: 1, limit: 50, ordering: "-date" });
  const [tableSorter, setTableSorter] = useState<
    SorterResult<IIssue> | SorterResult<IIssue>[] | null
  >(null);
  const unreadIssuesQuery = useUnreadIssues(filters);

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

  // Interpret AntD's sorter to backend ordering param
  useEffect(() => {
    if (!tableSorter) return;
    const s = Array.isArray(tableSorter) ? tableSorter[0] : tableSorter;
    const field = (s?.columnKey as string | undefined) || (s?.field as string | undefined);
    const ord = s?.order as "ascend" | "descend" | undefined;
    if (field === "date") {
      const ordering = ord === "ascend" ? "date" : ord === "descend" ? "-date" : undefined;
      setFilters((prev) => ({ ...prev, ordering, page: 1 }));
    }
  }, [tableSorter]);

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
        columns={columns}
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
          setTableSorter(sorter);

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
