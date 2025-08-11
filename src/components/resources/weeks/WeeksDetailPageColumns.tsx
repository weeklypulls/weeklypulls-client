import type { ColumnsType } from "antd/es/table";
import React from "react";
import { Link } from "react-router-dom";

import { IComic, IComicPullPair } from "../../../interfaces";
import utils from "../../../utils";
import PullButton from "../../common/PullButton";

function pullLinkCell(text: string, record: IComicPullPair) {
  if (!record.pull) {
    return text;
  }
  return <Link to={`/pulls/${record.pull.id}`}>{text}</Link>;
}

function pullCell(_text: string, record: IComicPullPair) {
  return <PullButton {...record} />;
}

function titleSort(a: { comic: IComic }, b: { comic: IComic }) {
  return utils.stringAttrsSort(a, b, ["comic.title", "comic.series_id"]);
}

const COLUMNS: ColumnsType<IComicPullPair> = [
  {
    dataIndex: "comic.title",
    key: "comic.title",
    render: pullLinkCell,
    sorter: titleSort,
    title: "Title",
  },
  {
    dataIndex: "comic.series_id",
    key: "comic.series_id",
    render: pullCell,
    title: "Series",
  },
];

export default COLUMNS;
