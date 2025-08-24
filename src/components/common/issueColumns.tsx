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
  includeCover?: boolean; // default true
  includeTitle?: boolean; // default true
  includePull?: boolean; // default false
  includeDate?: boolean; // default true
  widths?: {
    cover?: number;
    pull?: number;
    date?: number;
  };
  overrides?: {
    coverUrls?: (record: IIssue) => string[] | string | undefined | null;
    titlePrimary?: (record: IIssue) => string;
    titleSecondary?: (record: IIssue) => string | undefined;
    titleHref?: (record: IIssue) => string | undefined;
    titleTooltip?: (record: IIssue) => string | undefined;
    pullLink?: (record: IIssue) => {
      pull_id?: string | number | null;
      title?: string;
      year?: string | number | null;
    };
    date?: (record: IIssue) => string | undefined | null;
  };
};

export function buildIssueColumns(options: IssueColumnsOptions = {}): ColumnsType<IIssue> {
  const {
    includeCover = true,
    includeTitle = true,
    includePull = false,
    includeDate = true,
    widths = {},
    overrides = {},
  } = options;

  const coverUrls = overrides.coverUrls ?? ((r: IIssue) => r.images);
  const titlePrimary = overrides.titlePrimary ?? ((r: IIssue) => r.title);
  const titleSecondary = overrides.titleSecondary ?? ((r: IIssue) => r.name);
  const titleHref = overrides.titleHref ?? ((r: IIssue) => r.site_url);
  const titleTooltip = overrides.titleTooltip ?? ((r: IIssue) => r.description);
  const pullLink =
    overrides.pullLink ??
    ((r: IIssue) => ({ pull_id: r.pull?.id, title: r.volume?.name, year: r.volume?.start_year }));
  const date = overrides.date ?? ((r: IIssue) => r.date);

  const cols: ColumnsType<IIssue> = [];

  if (includeCover) {
    const coverCol: ColumnType<IIssue> = {
      dataIndex: "cover",
      key: "cover",
      title: "Cover",
      width: widths.cover ?? 80,
      render: renderCoverFromUrls(coverUrls),
    };
    cols.push(coverCol);
  }

  if (includeTitle) {
    const titleCol: ColumnType<IIssue> = {
      dataIndex: "title",
      key: "title",
      title: "Title",
      render: renderTitleBlock((r: IIssue) => ({
        primary: titlePrimary(r),
        secondary: titleSecondary?.(r),
        href: titleHref?.(r),
        title: titleTooltip?.(r),
      })),
    };
    cols.push(titleCol);
  }

  if (includePull) {
    cols.push({
      dataIndex: "pull",
      key: "pull",
      title: "Pull",
      width: widths.pull ?? 200,
      render: renderPullLink(pullLink),
    });
  }

  if (includeDate) {
    cols.push({
      dataIndex: "date",
      key: "date",
      title: "Date",
      width: widths.date ?? 100,
      render: renderWeekLinkFromISO(date),
    });
  }

  return cols;
}

export function buildReadColumn<T>(args: {
  getIssue: (record: T) => IIssue;
  getValue: (record: T) => boolean;
  title?: string;
  width?: number;
}) {
  const { getIssue, getValue, title = "Read", width = 48 } = args;
  const col: ColumnType<T> = {
    dataIndex: "read",
    key: "read",
    title,
    width,
    render: (_: unknown, record: T) => (
      <ReadButton issue={getIssue(record)} value={getValue(record)} />
    ),
  } as ColumnType<T>;
  return col;
}
