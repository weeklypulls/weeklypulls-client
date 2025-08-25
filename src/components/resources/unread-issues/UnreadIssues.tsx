import { Table, Button, Input } from "antd";
import type { SorterResult, TablePaginationConfig, SortOrder } from "antd/es/table/interface";
import { useCallback, useMemo, useState } from "react";

import COLUMNS from "./UnreadIssuesColumns";
import { IIssue } from "../../../interfaces";
import { UnreadIssuesFilters, useUnreadIssues } from "../../../queries";
import Title from "../../common/Title";

const getSort = (
  srt: SorterResult<IIssue> | SorterResult<IIssue>[] | null
): UnreadIssuesFilters["ordering"] => {
  const s = Array.isArray(srt) ? srt[0] : srt;

  if (!s) {
    // oldest first by default
    return "date";
  }

  const prefix = s.order === "descend" ? "-" : "";
  const field = s?.columnKey || s?.field || "date";
  return `${prefix}${field}`;
};

const computeFilters = (
  srt: SorterResult<IIssue> | SorterResult<IIssue>[] | null,
  pag: TablePaginationConfig | null,
  searchText: string
): UnreadIssuesFilters => {
  const page = pag?.current || 1;
  const limit = pag?.pageSize || 50;
  const ordering = getSort(srt);

  // Search
  const search = (searchText || "").trim() || undefined;

  return { page, limit, ordering, search };
};

export default function UnreadIssues() {
  const [searchDraft, setSearchDraft] = useState<string>("");
  const [tableSorter, setTableSorter] = useState<
    SorterResult<IIssue> | SorterResult<IIssue>[] | null
  >(null);
  const [tablePagination, setTablePagination] = useState<TablePaginationConfig | null>(null);

  const filters: UnreadIssuesFilters = useMemo(
    () => computeFilters(tableSorter, tablePagination, searchDraft),
    [tableSorter, tablePagination, searchDraft]
  );

  const unreadIssuesQuery = useUnreadIssues(filters);

  const onRefresh = useCallback(() => unreadIssuesQuery.refetch(), [unreadIssuesQuery]);

  const envelope = unreadIssuesQuery.data;
  const data = useMemo(() => envelope?.results || [], [envelope]);

  // Control date column sort order according to filters
  const columns = useMemo(() => {
    const ord = filters.ordering;
    const s: SortOrder | undefined =
      ord === "date" ? "ascend" : ord === "-date" ? "descend" : undefined;
    return COLUMNS.map((c) => (c.key === "date" ? { ...c, sortOrder: s } : c));
  }, [filters.ordering]);

  // No effects needed; filters are derived from inputs

  return (
    <div>
      <Title title="Unread Issues" allowWrapButtons>
        <Input.Search
          placeholder="Search series (e.g. Spider, Batman, X-Men…)"
          allowClear
          enterButton
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          onSearch={(val) => setSearchDraft(val)}
          style={{ width: 320 }}
        />
        <Button type="primary" onClick={onRefresh} loading={unreadIssuesQuery.isFetching}>
          Refresh
        </Button>
      </Title>

      <Table
        columns={columns}
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
