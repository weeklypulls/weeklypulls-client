import type { ColumnsType } from "antd/es/table";
import React from "react";
import { Link } from "react-router-dom";

import { IUnreadIssue } from "../../../interfaces";
import utils from "../../../utils";
import Images from "../../common/Images";

function coverCell(_text: string, record: IUnreadIssue) {
  const url = record.image_medium_url || record.image_url;
  if (!url) return null; // blank cell when no image
  return <Images images={[url]} />;
}

function titleCell(_text: string, record: IUnreadIssue) {
  const content = (
    <span title={record.description}>
      <strong>
        {record.volume_name} #{record.number}
      </strong>
      <br />
      <small>{record.name}</small>
    </span>
  );
  if (!record.site_url) return content;
  return (
    <a href={record.site_url} target="_blank" rel="noopener noreferrer" title={record.description}>
      {content}
    </a>
  );
}

function pullCell(_text: string, record: IUnreadIssue) {
  if (!record.pull_id) return "--";
  const title = record.volume_name || "Series";
  const year = record.volume_start_year ? ` (${record.volume_start_year})` : "";
  return <Link to={`/pulls/${String(record.pull_id)}`}>{title + year}</Link>;
}

function dateCell(text: string) {
  return text || "--";
}

const titleSort = (a: IUnreadIssue, b: IUnreadIssue) =>
  utils.stringAttrsSort(a, b, ["volume_name", "number"]);

const storeDateSort = (a: IUnreadIssue, b: IUnreadIssue) =>
  utils.stringAttrsSort(a, b, ["store_date", "volume_name", "number"]);

const COLUMNS: ColumnsType<IUnreadIssue> = [
  {
    dataIndex: "image_medium_url",
    key: "cover",
    render: coverCell,
    title: "Cover",
    width: 80,
  },
  {
    dataIndex: "volume_name",
    key: "title",
    render: titleCell,
    sorter: titleSort,
    title: "Title",
    // filters now applied on pull column combining title + year
  },
  {
    dataIndex: "pull_id",
    key: "pull",
    render: pullCell,
    title: "Pull",
    width: 200,
    filterMultiple: true,
    filters: [], // dynamically populated (volume title + year)
    onFilter: (value, record) => {
      const text = `${record.volume_name || ""}$${record.volume_start_year || ""}`;
      return text === String(value);
    },
  },
  {
    dataIndex: "store_date",
    defaultSortOrder: "descend",
    key: "store_date",
    render: dateCell,
    sorter: storeDateSort,
    title: "Store Date",
    width: 100,
  },
  {
    dataIndex: "cover_date",
    key: "cover_date",
    render: dateCell,
    title: "Cover Date",
    width: 100,
  },
];

export default COLUMNS;
