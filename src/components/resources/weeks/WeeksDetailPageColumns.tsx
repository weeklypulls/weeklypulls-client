import type { ColumnsType } from "antd/es/table";
// no explicit React import needed with automatic JSX runtime
import { Link } from "react-router-dom";

import { IComic, IIssue, IPull } from "../../../interfaces";
import utils from "../../../utils";
import { renderCoverFromUrls } from "../../common/columnHelpers";
import PullButton from "../../common/PullButton";

function pullLinkCell(_text: string, record: IIssue) {
  const title = record.title;
  const pullId = record.pull?.id;
  if (!pullId) return title;
  return <Link to={`/pulls/${pullId}`}>{title}</Link>;
}

function pullCell(_text: string, record: IIssue) {
  // Adapt IIssue -> PullButton props
  const comic: IComic = {
    id: record.id,
    images: record.images,
    date: record.date,
    series_id: record.volume.id,
    title: record.title,
    site_url: record.site_url,
    description: record.description,
    pulled: record.pull?.pulled,
    pull_id: record.pull?.id || null,
    read: record.pull?.read,
  };
  const pull: IPull | undefined = record.pull?.id
    ? { id: record.pull.id, pull_list_id: "", read: [], series_id: record.volume.id }
    : undefined;
  return <PullButton comic={comic} pull={pull} />;
}

function titleSort(a: IIssue, b: IIssue) {
  return utils.stringAttrsSort(a, b, ["title", "volume.id"]);
}

const coverCell = renderCoverFromUrls((r: IIssue) => r.images);

const COLUMNS: ColumnsType<IIssue> = [
  {
    dataIndex: ["images"],
    key: "images",
    render: coverCell,
    title: "Covers",
  },
  {
    dataIndex: ["title"],
    key: "title",
    render: pullLinkCell,
    sorter: titleSort,
    title: "Title",
  },
  {
    dataIndex: ["volume", "id"],
    key: "series_id",
    render: pullCell,
    title: "Series",
  },
];

export default COLUMNS;
