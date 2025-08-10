import React from "react";
import { Link } from "react-router-dom";
import utils from "../../../utils";
import PullListLink from "../../common/PullListLink";
import { IPullSeriesPair } from "../../../interfaces";

const titleSort = (a: IPullSeriesPair, b: IPullSeriesPair) =>
  utils.stringAttrsSort(a, b, ["series.title", "pull.series_id"]);

function pullLinkCell(text: string, record: IPullSeriesPair) {
  return <Link to={`/pulls/${record.pull.id}`}>{text}</Link>;
}

function pullListCell(_text: string, record: IPullSeriesPair) {
  return <PullListLink pullListId={record.pull.pull_list_id} pullId={record.pull.id} />;
}

const COLUMNS = [
  {
    dataIndex: "series.title",
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
