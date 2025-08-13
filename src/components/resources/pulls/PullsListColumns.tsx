import { Link } from "react-router-dom";

import { IPullSeriesPair } from "../../../interfaces";
import utils from "../../../utils";
import PullListLink from "../../common/PullListLink";

const titleSort = (a: IPullSeriesPair, b: IPullSeriesPair) =>
  utils.stringAttrsSort(a, b, ["pull.series_title", "pull.series_id"]);

function pullLinkCell(_text: string, record: IPullSeriesPair) {
  const title = record.pull.series_title || record.pull.series_id;
  const year = record.pull.series_start_year ? ` (${record.pull.series_start_year})` : "";
  return (
    <Link to={`/pulls/${record.pull.id}`}>
      {title}
      {year}
    </Link>
  );
}

function pullListCell(_text: string, record: IPullSeriesPair) {
  return <PullListLink pullListId={record.pull.pull_list_id} pullId={record.pull.id} />;
}

const COLUMNS = [
  {
    dataIndex: "pull.series_title",
    key: "api_title",
    render: pullLinkCell,
    sorter: titleSort,
    title: "Title",
  },
  {
    dataIndex: "pull.pull_list_id",
    key: "pull_list_id",
    render: pullListCell,
    title: "List",
  },
];

export default COLUMNS;
