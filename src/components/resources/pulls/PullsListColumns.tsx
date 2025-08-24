import { Link } from "react-router-dom";

import { IPull } from "../../../interfaces";
import utils from "../../../utils";
import PullListLink from "../../common/PullListLink";

const titleSort = (a: IPull, b: IPull) =>
  utils.stringAttrsSort(a, b, ["series_title", "series_id"]);

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
    key: "api_title",
    render: pullLinkCell,
    sorter: titleSort,
    title: "Title",
  },
  {
    dataIndex: "pull_list_id",
    key: "pull_list_id",
    render: pullListCell,
    title: "List",
  },
];

export default COLUMNS;
