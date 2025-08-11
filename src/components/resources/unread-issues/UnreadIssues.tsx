import { Table, Button, Input, Row, Col } from "antd";
import type { ColumnsType } from "antd/es/table";
import { observer } from "mobx-react";
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import COLUMNS from "./UnreadIssuesColumns";
import { ACTIONS } from "../../../consts";
import { IUnreadIssue } from "../../../interfaces";
import Store from "../../../store";
import { StoreContext } from "../../../storeContext";
import Title from "../../common/Title";

interface IFilters {
  limit?: number;
  since?: string;
}

export default observer(function UnreadIssues() {
  const store = useContext<Store>(StoreContext);
  const [filters, setFilters] = useState<IFilters>({ limit: 50 });
  const rowLoading = useRef<Set<number>>(new Set());
  const [, forceTick] = useState(0); // to trigger rerenders for rowLoading changes

  const fetchUnreadIssues = useCallback(async () => {
    try {
      store.unreadIssues.isLoading = true;
      const params = new URLSearchParams();
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.since) params.append("since", filters.since);
      const queryString = params.toString();
      const endpoint = queryString ? `pulls/unread_issues/?${queryString}` : "pulls/unread_issues/";
      const response = await store.client.user.get(endpoint);
      store.unreadIssues.objects.clear();
      store.unreadIssues.fetchedOn.clear();
      if (Array.isArray(response.data)) {
        response.data.forEach((issue: IUnreadIssue) => {
          store.unreadIssues.setObject(issue.cv_id.toString(), issue);
        });
      }
      store.unreadIssues.save();
    } catch (e) {
      // tslint:disable-next-line no-console
      console.error("Error fetching unread issues:", e);
    } finally {
      store.unreadIssues.isLoading = false;
    }
  }, [store, filters]);

  useEffect(() => {
    (async () => {
      try {
        await store.pulls.listIfCold();
      } catch (e) {
        // tslint:disable-next-line no-console
        console.warn("Failed to pre-load pulls", e);
      }
      fetchUnreadIssues();
    })();
  }, [store.pulls, fetchUnreadIssues]);

  const onLimitChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const limit = parseInt(event.target.value, 10);
    setFilters((prev) => ({
      ...prev,
      limit: isNaN(limit) ? undefined : Math.max(1, Math.min(200, limit)),
    }));
  }, []);

  const onDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const since = e.target.value || undefined;
    setFilters((prev) => ({ ...prev, since }));
  }, []);

  const onRefresh = useCallback(() => {
    fetchUnreadIssues();
  }, [fetchUnreadIssues]);

  const markAsRead = useCallback(
    async (issue: IUnreadIssue) => {
      const issueId = issue.cv_id.toString();
      const loadSet = rowLoading.current;
      if (loadSet.has(issue.cv_id)) return;
      loadSet.add(issue.cv_id);
      forceTick((x) => x + 1);
      try {
        if (issue.pull_id) {
          await store.client.user.post(`pulls/${issue.pull_id}/mark_read/`, {
            issue_id: issue.cv_id,
          });
          const existingPull = store.pulls.get(issue.pull_id.toString());
          if (existingPull) {
            const set = new Set<string>(existingPull.read || []);
            set.add(issueId);
            existingPull.read = Array.from(set);
            store.pulls.setObject(existingPull.id, existingPull);
          }
        } else {
          const seriesId = issue.volume_id.toString();
          if (!store.pulls.all.length) await store.pulls.list();
          if (!store.pulls.getBy("series_id", seriesId)) await store.pulls.list();
          await store.mark(seriesId, issueId, ACTIONS.READ);
        }
        store.unreadIssues.deleteObject(issueId);
        store.unreadIssues.save();
      } catch (e) {
        // tslint:disable-next-line no-console
        console.error("Failed to mark as read", e);
      } finally {
        loadSet.delete(issue.cv_id);
        forceTick((x) => x + 1);
      }
    },
    [store]
  );

  const data = store.unreadIssues.all;

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
        <Button type="primary" onClick={onRefresh} loading={store.unreadIssues.isLoading}>
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
        loading={store.unreadIssues.isLoading}
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
});
