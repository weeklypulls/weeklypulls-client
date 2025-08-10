import { ColumnProps } from "antd/lib/table";
import React from "react";
import { Link } from "react-router-dom";

import { IUnreadIssue } from "../../../interfaces";
import utils from "../../../utils";
import Images from "../../common/Images";

function coverCell(_text: string, record: IUnreadIssue) {
  const url = record.image_medium_url || (record as any).image_url;
  if (!url) {
    return "--";
  }
  return <Images images={[url]} />;
}

function titleCell(text: string, record: IUnreadIssue) {
  return (
    <a href={record.site_url} target="_blank" rel="noopener noreferrer" title={record.description}>
      <strong>
        {record.volume_name} #{record.number}
      </strong>
      <br />
      <small>{record.name}</small>
    </a>
  );
}

function pullCell(_text: string, record: IUnreadIssue) {
  if (!record.pull_id) {
    return "--";
  }
  return <Link to={`/pulls/${String(record.pull_id)}`}>Pull</Link>;
}

function dateCell(text: string) {
  return text || "--";
}

const titleSort = (a: IUnreadIssue, b: IUnreadIssue) =>
  utils.stringAttrsSort(a, b, ["volume_name", "number"]);

const storeDateSort = (a: IUnreadIssue, b: IUnreadIssue) =>
  utils.stringAttrsSort(a, b, ["store_date", "volume_name", "number"]);

const COLUMNS: Array<ColumnProps<IUnreadIssue>> = [
  {
    dataIndex: "image_medium_url",
    key: "cover",
    render: coverCell,
    title: "Cover",
    width: 80,
    filterMultiple: false,
    filters: [
      { text: "Has cover", value: "has" },
      { text: "No cover", value: "none" },
    ],
    onFilter: (value, record) => {
      const has = !!(record.image_medium_url || (record as any).image_url);
      return value === "has" ? has : !has;
    },
  },
  {
    dataIndex: "volume_name",
    key: "title",
    render: titleCell,
    sorter: titleSort,
    title: "Title",
    filterMultiple: true,
    filters: [], // to be provided dynamically in UnreadIssues.tsx
    onFilter: (value, record) => String(record.volume_name) === String(value),
  },
  {
    dataIndex: "pull_id",
    key: "pull",
    render: pullCell,
    title: "Pull",
    width: 80,
  },
  {
    dataIndex: "volume_start_year",
    key: "year",
    sorter: (a: IUnreadIssue, b: IUnreadIssue) => a.volume_start_year - b.volume_start_year,
    title: "Year",
    width: 80,
    filterMultiple: true,
    filters: [], // to be provided dynamically in UnreadIssues.tsx
    onFilter: (value, record) => String(record.volume_start_year) === String(value),
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
