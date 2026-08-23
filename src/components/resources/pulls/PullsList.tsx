import { Button, Table } from "antd";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import COLUMNS from "./PullsListColumns";
import { IPull } from "../../../interfaces";
import { usePulls } from "../../../queries";
import PageSpace from "../../common/PageSpace";
import Title from "../../common/Title";

function PullsList() {
  const navigate = useNavigate();
  const pullsQuery = usePulls();
  const dataSource: IPull[] = useMemo(() => {
    return (pullsQuery.data || []) as IPull[];
  }, [pullsQuery.data]);

  return (
    <PageSpace>
      <Title title="Pulls">
        <Button type="primary" onClick={() => navigate("/pulls/add")}>
          Add series
        </Button>
      </Title>

      <Table<IPull>
        columns={COLUMNS}
        dataSource={dataSource}
        loading={pullsQuery.isLoading}
        pagination={false}
        size="small"
      />
    </PageSpace>
  );
}
export default PullsList;
