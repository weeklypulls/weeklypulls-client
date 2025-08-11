import { Table, Button, Input, Row, Col } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useMemo, useState, ChangeEvent } from "react";

import COLUMNS from "./UnreadIssuesColumns";
import { IUnreadIssue } from "../../../interfaces";
import { useUnreadIssues } from "../../../queries";
import ReadButton from "../../common/ReadButton";
import Title from "../../common/Title";

interface IFilters {
  limit?: number;
  since?: string;
}

export default function UnreadIssues() {
  const [filters, setFilters] = useState<IFilters>({ limit: 50 });
  const unreadIssuesQuery = useUnreadIssues(filters);
  // marking handled via ReadButton (uses optimistic cache + invalidation)

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

  const data = useMemo(() => unreadIssuesQuery.data || [], [unreadIssuesQuery.data]);
  const columns: ColumnsType<IUnreadIssue> = useMemo(() => {
    const readCol = {
      key: "read",
      dataIndex: "read",
      title: "",
      width: 48,
      render: (_: unknown, issue: IUnreadIssue) => {
        // adapt unread issue into minimal IComic shape needed by ReadButton
        const comicLike: any = {
          id: String(issue.cv_id),
          // fall back chain for date fields
          on_sale: issue.store_date || issue.cover_date || "",
          series_id: String(issue.volume_id),
          images: issue.image_url
            ? [issue.image_url]
            : issue.image_medium_url
              ? [issue.image_medium_url]
              : [],
        };
        return <ReadButton comic={comicLike} value={false} />; // unread list only shows unread items
      },
    } as any;
    return [readCol, ...COLUMNS];
  }, []);

  const pullFilterOptions = useMemo(() => {
    const map = new Map<string, { text: string; value: string }>();
    data.forEach((i) => {
      const base = (i.volume_name || "").trim();
      if (!base) return;
      const year = i.volume_start_year ? ` (${i.volume_start_year})` : "";
      const label = `${base}${year}`;
      const value = `${base}$${i.volume_start_year || ""}`;
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
