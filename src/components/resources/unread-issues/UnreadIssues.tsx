import { Table, Button, Input } from "antd";
import type { SorterResult, TablePaginationConfig } from "antd/es/table/interface";
import { useCallback, useMemo, useState, useEffect } from "react";

import COLUMNS from "./UnreadIssuesColumns";
import { IIssue } from "../../../interfaces";
import { useUnreadIssues } from "../../../queries";
import Title from "../../common/Title";

interface IFilters {
  page?: number;
  limit?: number;
  search?: string;
  ordering?: "date" | "-date";
}

export default function UnreadIssues() {
  const [filters, setFilters] = useState<IFilters>({ page: 1, limit: 50, ordering: "-date" });
  const [searchDraft, setSearchDraft] = useState<string>("");
  const [tableSorter, setTableSorter] = useState<
    SorterResult<IIssue> | SorterResult<IIssue>[] | null
  >(null);
  const [tablePagination, setTablePagination] = useState<TablePaginationConfig | null>(null);
  const unreadIssuesQuery = useUnreadIssues(filters);

  const onRefresh = useCallback(() => unreadIssuesQuery.refetch(), [unreadIssuesQuery]);

  const envelope = unreadIssuesQuery.data;
  const data = useMemo(() => envelope?.results || [], [envelope]);

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

  // Debounce search text into filters.search
  useEffect(() => {
    const handle = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchDraft || undefined, page: 1 }));
    }, 350);
    return () => clearTimeout(handle);
  }, [searchDraft]);

  return (
    <div>
      <Title title="Unread Issues" allowWrapButtons>
        <Input.Search
          placeholder="Search series (e.g. Spider, Batman, X-Men…)"
          allowClear
          enterButton
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          onSearch={(val) => setFilters((prev) => ({ ...prev, search: val || undefined, page: 1 }))}
          style={{ width: 320 }}
        />
        <Button type="primary" onClick={onRefresh} loading={unreadIssuesQuery.isFetching}>
          Refresh
        </Button>
      </Title>

      <Table
        columns={COLUMNS}
        dataSource={data}
        loading={unreadIssuesQuery.isFetching}
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
