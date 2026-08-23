import { Button, Input, Table } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import PullListsDrawer from "./PullListsDrawer";
import COLUMNS from "./PullsListColumns";
import { IPull } from "../../../interfaces";
import { usePulls } from "../../../queries";
import PageSpace from "../../common/PageSpace";
import Title from "../../common/Title";

const DEFAULT_PAGE_SIZE = 50;

function PullsList() {
  const navigate = useNavigate();
  const [isListsDrawerOpen, setIsListsDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [ordering, setOrdering] = useState<string | undefined>(undefined);

  const pullsQuery = usePulls({ page, limit: pageSize, search, ordering });
  const dataSource: IPull[] = useMemo(() => pullsQuery.data?.results ?? [], [pullsQuery.data]);

  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>,
    sorter: SorterResult<IPull> | SorterResult<IPull>[]
  ) => {
    setPage(pagination.current || 1);
    setPageSize(pagination.pageSize || DEFAULT_PAGE_SIZE);

    const single = Array.isArray(sorter) ? sorter[0] : sorter;
    if (single?.order && single.columnKey) {
      const field = String(single.columnKey);
      setOrdering(single.order === "descend" ? `-${field}` : field);
    } else {
      setOrdering(undefined);
    }
  };

  return (
    <PageSpace>
      <Title title="Pulls" allowWrapButtons>
        <Input.Search
          allowClear
          placeholder="Search series..."
          style={{ width: 220 }}
          onSearch={(value) => {
            setPage(1);
            setSearch(value || undefined);
          }}
        />
        <Button onClick={() => setIsListsDrawerOpen(true)}>Pull Lists</Button>
        <Button type="primary" onClick={() => navigate("/pulls/add")}>
          Add series
        </Button>
      </Title>

      <Table<IPull>
        rowKey="id"
        columns={COLUMNS}
        dataSource={dataSource}
        loading={pullsQuery.isLoading}
        onChange={handleTableChange}
        pagination={{
          current: page,
          pageSize,
          total: pullsQuery.data?.count ?? 0,
          showSizeChanger: true,
        }}
        size="small"
      />

      <PullListsDrawer open={isListsDrawerOpen} onClose={() => setIsListsDrawerOpen(false)} />
    </PageSpace>
  );
}
export default PullsList;
