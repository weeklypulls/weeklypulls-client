import { Table, Button, Input, Row, Col } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SorterResult, TablePaginationConfig } from "antd/es/table/interface";
import { useCallback, useMemo, useState, useEffect, ChangeEvent } from "react";

import COLUMNS from "./UnreadIssuesColumns";
import { IIssue } from "../../../interfaces";
import { useUnreadIssues } from "../../../queries";
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
  const [tablePagination, setTablePagination] = useState<TablePaginationConfig | null>(null);
  const unreadIssuesQuery = useUnreadIssues(filters);

  const onDateChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const since = e.target.value || undefined;
    setFilters((prev) => ({ ...prev, since }));
  }, []);

  const onRefresh = useCallback(() => unreadIssuesQuery.refetch(), [unreadIssuesQuery]);

  const envelope = unreadIssuesQuery.data;
  const unreadRows = useMemo(() => envelope?.results || [], [envelope]);
  const data: IIssue[] = useMemo(() => unreadRows, [unreadRows]);
  const columns: ColumnsType<IIssue> = useMemo(() => COLUMNS, []);

  // Interpret AntD's sorter to backend ordering param
  useEffect(() => {
    if (!tableSorter) return;
    const s = Array.isArray(tableSorter) ? tableSorter[0] : tableSorter;
    const field = s?.columnKey || s?.field;
    const ord = s?.order;
    if (field === "date") {
      const ordering = ord === "ascend" ? "date" : ord === "descend" ? "-date" : undefined;
      setFilters((prev) => ({ ...prev, ordering, page: 1 }));
    }
  }, [tableSorter]);

  // Interpret AntD's pagination to backend page/limit params
  useEffect(() => {
    if (!tablePagination) return;
    const nextPage = tablePagination.current || 1;
    const nextSize = tablePagination.pageSize;
    setFilters((prev) => ({
      ...prev,
      page: nextPage,
      limit: nextSize || prev.limit,
    }));
  }, [tablePagination]);

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
          if (pagination) setTablePagination(pagination);
        }}
        rowKey={(r) => r.id}
        size="small"
      />
    </div>
  );
}
