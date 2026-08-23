import { Link } from "react-router-dom";

import { IPull } from "../../../interfaces";
import PullListLink from "../../common/PullListLink";

function pullLinkCell(_text: string, record: IPull) {
  const title = record.series_title || record.series_id;
  const year = record.series_start_year ? ` (${record.series_start_year})` : "";
  return (
    <Link to={`/pulls/${record.id}`}>
      {title}
      {year}
    </Link>
  );
}

function pullListCell(_text: string, record: IPull) {
  return <PullListLink pullListId={record.pull_list_id} pullId={record.id} />;
}

const COLUMNS = [
  {
    dataIndex: "series_title",
    key: "series_title",
    render: pullLinkCell,
    title: "Title",
    sorter: true,
  },
  {
    dataIndex: "pull_list_id",
    // Matches the backend's ordering_fields name (pull_list__title), since
    // pull_list_id itself isn't sortable - it's a join to PullList.title.
    key: "pull_list__title",
    render: pullListCell,
    title: "List",
    sorter: true,
  },
];

export default COLUMNS;
