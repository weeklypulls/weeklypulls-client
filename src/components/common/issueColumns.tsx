import type { ColumnsType, ColumnType } from "antd/es/table";

import {
  renderCoverFromUrls,
  renderTitleBlock,
  renderPullLink,
  renderWeekLinkFromISO,
} from "./columnHelpers";
import ReadButton from "./ReadButton";
import { IIssue } from "../../interfaces";

type IssueColumnsOptions = {
  includePull?: boolean; // default false
};

export function buildIssueColumns(options: IssueColumnsOptions = {}): ColumnsType<IIssue> {
  const { includePull = false } = options;

  const coverUrls = (r: IIssue) => r.images;
  const pullLink = (r: IIssue) => ({
    pull_id: r.pull?.id,
    title: r.volume?.name,
    year: r.volume?.start_year,
  });
  const date = (r: IIssue) => r.date;

  const cols: ColumnsType<IIssue> = [
    {
      dataIndex: "read",
      key: "read",
      title: "Read",
      width: 48,
      render: (_: unknown, record: IIssue) => (
        <ReadButton issue={record} value={record.pull?.read ?? false} />
      ),
    },
    {
      dataIndex: "cover",
      key: "cover",
      title: "Cover",
      width: 80,
      render: renderCoverFromUrls(coverUrls),
    },
    {
      dataIndex: "title",
      key: "title",
      title: "Title",
      render: renderTitleBlock,
    },
    ...(includePull
      ? [
          {
            dataIndex: "pull",
            key: "pull",
            title: "Pull",
            render: renderPullLink(pullLink),
          },
        ]
      : []),
    {
      dataIndex: "date",
      key: "date",
      title: "Date",
      sorter: true,
      width: 100,
      render: renderWeekLinkFromISO(date),
    },
  ];

  return cols;
}
