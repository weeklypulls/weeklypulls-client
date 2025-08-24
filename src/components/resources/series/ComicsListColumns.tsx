import type { ColumnsType } from "antd/es/table";
import { Link } from "react-router-dom";

import { IComicPullPair } from "../../../interfaces";
import utils from "../../../utils";
import { renderWeekLinkFromISO } from "../../common/columnHelpers";
import Images from "../../common/Images";
import PullListLink from "../../common/PullListLink";
import ReadButton from "../../common/ReadButton";

function pullListCell(_text: string, record: IComicPullPair) {
  if (!record.pull) {
    return "--";
  }
  return <PullListLink pullId={record.pull.id} pullListId={record.pull.pull_list_id} />;
}

function imagesCell(_text: string, record: IComicPullPair) {
  return <Images images={record.comic.images} />;
}

function pullLinkCell(text: string, record: IComicPullPair) {
  if (!record.pull) {
    return "--";
  }
  return <Link to={`/pulls/${record.pull.id}`}>{text}</Link>;
}

const titleSort = (a: IComicPullPair, b: IComicPullPair) =>
  utils.stringAttrsSort(a, b, ["comic.title", "comic.series_id", "comic.date"]);

const dateSort = (a: IComicPullPair, b: IComicPullPair) =>
  utils.stringAttrsSort(a, b, ["comic.date", "comic.title"]);

const weekCell = renderWeekLinkFromISO((r: IComicPullPair) => r.comic.date);

function readCell(_text: string, record: IComicPullPair) {
  return <ReadButton comic={record.comic} value={record.read} />;
}

const COLUMNS: ColumnsType<IComicPullPair> = [
  {
    dataIndex: "read",
    filterMultiple: false,
    filters: [
      { text: "Read", value: "true" },
      { text: "Unread", value: "false" },
    ],
    key: "read",
    render: readCell,
    title: "Read",
  },
  {
    dataIndex: "comic.images",
    key: "comic.images",
    render: imagesCell,
    title: "Covers",
  },
  {
    dataIndex: "pull.pull_list_id",
    filterMultiple: true,
    filters: [],
    key: "pull.pull_list_id",
    render: pullListCell,
    title: "List",
  },
  {
    dataIndex: "comic.date",
    defaultSortOrder: "ascend",
    key: "comic.date",
    render: weekCell,
    sorter: dateSort,
    title: "Date",
  },
  {
    dataIndex: "comic.title",
    key: "comic.title",
    render: pullLinkCell,
    sorter: titleSort,
    title: "Title",
  },
];

export default COLUMNS;
