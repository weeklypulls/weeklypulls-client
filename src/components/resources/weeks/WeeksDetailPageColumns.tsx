import type { ColumnsType } from "antd/es/table";
// no explicit React import needed with automatic JSX runtime
import { Link } from "react-router-dom";

import { IComic, IComicPullPair } from "../../../interfaces";
import utils from "../../../utils";
import { renderCoverFromUrls } from "../../common/columnHelpers";
import PullButton from "../../common/PullButton";

function pullLinkCell(_text: string, record: IComicPullPair) {
  const title = record.comic.title;
  if (!record.pull) {
    return title;
  }
  return <Link to={`/pulls/${record.pull.id}`}>{title}</Link>;
}

function pullCell(_text: string, record: IComicPullPair) {
  return <PullButton {...record} />;
}

function titleSort(a: { comic: IComic }, b: { comic: IComic }) {
  return utils.stringAttrsSort(a, b, ["comic.title", "comic.series_id"]);
}

const coverCell = renderCoverFromUrls((r: IComicPullPair) => r.comic.images);

const COLUMNS: ColumnsType<IComicPullPair> = [
  {
    dataIndex: ["comic", "images"],
    key: "comic.images",
    render: coverCell,
    title: "Covers",
  },
  {
    dataIndex: ["comic", "title"],
    key: "comic.title",
    render: pullLinkCell,
    sorter: titleSort,
    title: "Title",
  },
  {
    dataIndex: ["comic", "series_id"],
    key: "comic.series_id",
    render: pullCell,
    title: "Series",
  },
];

export default COLUMNS;
