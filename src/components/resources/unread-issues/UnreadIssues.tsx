import { Table, Button, Input, Row, Col } from "antd";
import { FormComponentProps } from "antd/lib/form";
import autoBindMethods from "class-autobind-decorator";
import { get } from "lodash";
import { observable, action } from "mobx";
import { inject, observer } from "mobx-react";
import React, { Component } from "react";
import { RouteComponentProps } from "react-router";

import COLUMNS from "./UnreadIssuesColumns";
import { ACTIONS } from "../../../consts";
import { IUnreadIssue } from "../../../interfaces";
import Store from "../../../store";
import Title from "../../common/Title";

interface IFilters {
  limit?: number;
  since?: string;
}

interface IInjected extends RouteComponentProps, FormComponentProps {
  store: Store;
}

@inject("store")
@autoBindMethods
@observer
class UnreadIssues extends Component<RouteComponentProps> {
  @observable public filters: IFilters = { limit: 50 };
  @observable public rowLoading: Set<number> = new Set();

  private get injected() {
    return this.props as IInjected;
  }

  public componentDidMount() {
    this.init();
  }

  @action
  private async init() {
    // Ensure pulls are loaded so store.mark can find the pull to patch
    try {
      await this.injected.store.pulls.listIfCold();
    } catch (e) {
      // tslint:disable-next-line no-console
      console.warn("Failed to pre-load pulls", e);
    }
    this.fetchUnreadIssues();
  }

  @action
  public async fetchUnreadIssues() {
    try {
      const { store } = this.injected;
      store.unreadIssues.isLoading = true;

      // Build query parameters
      const params = new URLSearchParams();
      if (this.filters.limit) {
        params.append("limit", this.filters.limit.toString());
      }
      if (this.filters.since) {
        params.append("since", this.filters.since);
      }

      // Use trailing slash to match DRF action route
      const queryString = params.toString();
      const endpoint = queryString ? `pulls/unread_issues/?${queryString}` : "pulls/unread_issues/";

      const response = await store.client.user.get(endpoint);

      // Clear existing data and populate with new data
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
      if (get(e, "response.status") === 401) {
        this.injected.history.push("/login");
      }
    } finally {
      this.injected.store.unreadIssues.isLoading = false;
    }
  }

  @action
  public onLimitChange(event: React.ChangeEvent<HTMLInputElement>) {
    const limit = parseInt(event.target.value, 10);
    this.filters = {
      ...this.filters,
      limit: isNaN(limit) ? undefined : Math.max(1, Math.min(200, limit)),
    };
  }

  @action
  public onDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const since = e.target.value || undefined;
    this.filters = { ...this.filters, since };
  }

  @action
  public onRefresh() {
    this.fetchUnreadIssues();
  }

  @action
  private async markAsRead(issue: IUnreadIssue) {
    const { store } = this.injected;
    const issueId = issue.cv_id.toString();

    if (this.rowLoading.has(issue.cv_id)) {
      return;
    }
    this.rowLoading.add(issue.cv_id);
    try {
      if (issue.pull_id) {
        await store.client.user.post(`pulls/${issue.pull_id}/mark_read/`, {
          issue_id: issue.cv_id,
        });
        const existingPull = store.pulls.get(issue.pull_id.toString());
        if (existingPull) {
          const set = new Set<string>(existingPull.read || []);
          set.add(issueId);
          (existingPull as any).read = Array.from(set);
          store.pulls.setObject(existingPull.id, existingPull);
        }
      } else {
        const seriesId = issue.volume_id.toString();
        // Ensure pulls are loaded so we can resolve pull.id
        if (!store.pulls.all.length) {
          await store.pulls.list();
        }
        if (!store.pulls.getBy("series_id", seriesId)) {
          // Try a refresh in case cache was cold
          await store.pulls.list();
        }
        await store.mark(seriesId, issueId, ACTIONS.READ);
      }
      store.unreadIssues.deleteObject(issueId);
      store.unreadIssues.save();
    } catch (e) {
      // tslint:disable-next-line no-console
      console.error("Failed to mark as read", e);
    } finally {
      this.rowLoading.delete(issue.cv_id);
    }
  }

  public dataSource(): IUnreadIssue[] {
    const { store } = this.injected;
    return store.unreadIssues.all;
  }

  public render() {
    const { store } = this.injected;

    const actionColumn = {
      key: "actions",
      title: "Actions",
      width: 120,
      render: (_text: unknown, record: IUnreadIssue) => (
        <Button
          type="link"
          onClick={() => this.markAsRead(record)}
          loading={this.rowLoading.has(record.cv_id)}
        >
          Mark Read
        </Button>
      ),
    };

    const columns = [...COLUMNS, actionColumn] as any;

    // Build dynamic filters (Volume Title and Year) like Comics page
    const data = this.dataSource();
    const titleOptions = Array.from(
      new Set(data.map((i) => (i.volume_name || "").trim()).filter((n) => !!n))
    ).sort();
    const yearOptions = Array.from(
      new Set(
        data
          .map((i) => i.volume_start_year)
          .filter((y) => y !== null && y !== undefined)
          .map((y) => String(y))
      )
    ).sort((a, b) => Number(a) - Number(b));

    // Inject filters into the appropriate columns (values must be strings)
    columns.forEach((col: any) => {
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
          <Button type="primary" onClick={this.onRefresh} loading={store.unreadIssues.isLoading}>
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
              value={this.filters.limit || ""}
              onChange={this.onLimitChange}
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
              value={this.filters.since || ""}
              onChange={this.onDateChange}
              style={{ width: "100%", marginTop: 4 }}
            />
          </Col>
          <Col span={8} style={{ paddingTop: 24 }}>
            <Button type="default" onClick={this.onRefresh}>
              Apply Filters
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={this.dataSource()}
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
  }
}

export default UnreadIssues;
