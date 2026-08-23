import { Button, Form, Input, Select, Space, Table, Typography } from "antd";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { IPullList } from "../../../interfaces";
import { useSeriesSearch, useCreatePull, usePullLists, SeriesSearchParams } from "../../../queries";
import PageSpace from "../../common/PageSpace";
import Title from "../../common/Title";

interface SearchFormValues {
  q?: string;
  publisher?: number;
  year?: number;
  ordering?: string;
}

export default function AddSeriesPage() {
  const [params, setParams] = useState<SeriesSearchParams>({ limit: 50, ordering: "name" });
  const searchQuery = useSeriesSearch(params);
  const createPull = useCreatePull();
  const pullListsQuery = usePullLists();
  const navigate = useNavigate();

  const pullListOptions = useMemo(
    () =>
      (pullListsQuery.data || []).map((pl: IPullList) => ({
        label: pl.title,
        value: pl.id,
      })),
    [pullListsQuery.data]
  );
  const [selectedPullList, setSelectedPullList] = useState<number | undefined>(
    pullListOptions[0]?.value
  );

  interface SeriesRow {
    id: number;
    name: string;
    start_year?: number;
    issue_count: number;
    publisher?: { id: number; name: string } | null;
  }

  const columns = useMemo(() => {
    return [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        render: (_: unknown, record: SeriesRow) => (
          <Space direction="vertical" size={0} style={{ minWidth: 220 }}>
            <span>{record.name}</span>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {record.start_year || "—"} • {record.publisher?.name || "Unknown Publisher"}
            </Typography.Text>
          </Space>
        ),
        sorter: (a: SeriesRow, b: SeriesRow) => a.name.localeCompare(b.name),
      },
      {
        title: "Issues",
        dataIndex: "issue_count",
        key: "issue_count",
        width: 90,
        sorter: (a: SeriesRow, b: SeriesRow) => a.issue_count - b.issue_count,
      },
      {
        title: "Action",
        key: "action",
        width: 120,
        render: (_: unknown, record: SeriesRow) => (
          <Button
            size="small"
            type="primary"
            loading={createPull.isPending}
            onClick={() => {
              if (!selectedPullList) return;
              createPull.mutate(
                { pull_list_id: selectedPullList, series_id: record.id },
                {
                  onSuccess: () => {
                    navigate("/pulls");
                  },
                }
              );
            }}
          >
            Add
          </Button>
        ),
      },
    ] as import("antd").TableProps<SeriesRow>["columns"];
  }, [createPull, selectedPullList, navigate]);

  const onSearch = useCallback((values: SearchFormValues) => {
    const next: SeriesSearchParams = {
      limit: 50,
      ordering: values.ordering || "name",
    };
    if (values.q) next.q = values.q.trim();
    if (values.publisher) next.publisher = values.publisher;
    if (values.year) next.year = values.year;
    setParams(next);
  }, []);

  return (
    <PageSpace>
      <Title title="Add Series">
        <Select<number>
          placeholder="Pull List"
          style={{ width: 180 }}
          options={pullListOptions}
          value={selectedPullList}
          onChange={(val) => setSelectedPullList(val)}
        />
      </Title>
      <Form layout="inline" onFinish={onSearch} style={{ marginBottom: 16 }}>
        <Form.Item name="q" label="Title">
          <Input allowClear placeholder="Search title or ID" style={{ width: 220 }} />
        </Form.Item>
        <Form.Item name="publisher" label="Publisher">
          <Input placeholder="ID" style={{ width: 120 }} />
        </Form.Item>
        <Form.Item name="year" label="Year">
          <Input placeholder="e.g. 2018" style={{ width: 100 }} />
        </Form.Item>
        <Form.Item name="ordering" initialValue="name" label="Order">
          <Select
            style={{ width: 140 }}
            options={[
              { value: "name", label: "Name" },
              { value: "-name", label: "Name (desc)" },
              { value: "start_year", label: "Year" },
              { value: "-start_year", label: "Year (desc)" },
            ]}
          />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" type="primary" loading={searchQuery.isLoading}>
            Search
          </Button>
        </Form.Item>
      </Form>

      <Table<SeriesRow>
        rowKey="id"
        columns={columns}
        dataSource={(searchQuery.data?.results || []) as SeriesRow[]}
        loading={searchQuery.isLoading}
        pagination={false}
        size="small"
        locale={{ emptyText: params.q ? "No results" : "Enter search terms" }}
      />
    </PageSpace>
  );
}
