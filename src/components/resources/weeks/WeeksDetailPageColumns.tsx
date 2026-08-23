import type { ColumnsType } from "antd/es/table";
import { Link } from "react-router-dom";

import { IIssue, IPull } from "../../../interfaces";
import { renderCoverFromUrls } from "../../common/columnHelpers";
import PullButton from "../../common/PullButton";

function pullLinkCell(_text: string, record: IIssue) {
  const title = record.title;
  const pullId = record.pull?.id;
  if (!pullId) return title;
  return <Link to={`/pulls/${pullId}`}>{title}</Link>;
}

function pullCell(_text: string, record: IIssue) {
  const pull: IPull | undefined = record.pull?.id
    ? { id: record.pull.id, pull_list_id: "", read: [], series_id: record.volume.id }
    : undefined;
  return <PullButton issue={record} pull={pull} />;
}

const coverCell = renderCoverFromUrls((r: IIssue) => r.images);

export type PublisherFilter = { text: string; value: string };

type ColumnStateOptions = {
  publisherFilteredValue?: string[];
  publisherSortOrder?: "ascend" | "descend" | null;
};

export default function buildWeeksColumns(
  publisherFilters?: PublisherFilter[],
  opts?: ColumnStateOptions
): ColumnsType<IIssue> {
  const cols: ColumnsType<IIssue> = [
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
      title: "Title",
    },
    {
      dataIndex: ["volume", "id"],
      key: "series_id",
      render: pullCell,
      title: "Series",
    },
    {
      dataIndex: ["volume", "publisher", "name"],
      key: "publisher",
      title: "Publisher",
      filters: publisherFilters,
      filteredValue: opts?.publisherFilteredValue,
      onFilter: (value, record) => (record.volume.publisher?.name || "") === String(value ?? ""),
      render: (_text, record) => record.volume.publisher?.name || "—",
      sorter: (a, b) =>
        (a.volume.publisher?.name || "").localeCompare(b.volume.publisher?.name || ""),
      sortOrder: opts?.publisherSortOrder ?? null,
      sortDirections: ["ascend", "descend"],
    },
  ];
  return cols;
}
