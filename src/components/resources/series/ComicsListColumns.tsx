import type { ColumnsType } from "antd/es/table";
import React from "react";
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
  utils.stringAttrsSort(a, b, ["comic.title", "comic.series_id", "comic.on_sale"]);

const onSaleSort = (a: IComicPullPair, b: IComicPullPair) =>
  utils.stringAttrsSort(a, b, ["comic.on_sale", "comic.title"]);

const weekCell = renderWeekLinkFromISO((r: IComicPullPair) => r.comic.on_sale);

function readCell(text: string, record: IComicPullPair) {
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
    dataIndex: "comic.on_sale",
    defaultSortOrder: "ascend",
    key: "comic.on_sale",
    render: weekCell,
    sorter: onSaleSort,
    title: "Store Date",
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
