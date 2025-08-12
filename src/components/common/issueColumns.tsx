import type { ColumnsType, ColumnType } from "antd/es/table";

import {
  renderCoverFromUrls,
  renderTitleBlock,
  renderPullLink,
  renderWeekLinkFromISO,
} from "./columnHelpers";
import ReadButton from "./ReadButton";
import { IComic } from "../../interfaces";

export type IssueColumnGetters<T> = {
  getCoverUrls: (record: T) => string[] | string | undefined | null;
  getTitlePrimary: (record: T) => string;
  getTitleSecondary?: (record: T) => string | undefined;
  getTitleHref?: (record: T) => string | undefined;
  getTitleTooltip?: (record: T) => string | undefined;
  getPullLink?: (record: T) => {
    pull_id?: string | number | null;
    title?: string;
    year?: string | number | null;
  };
  getStoreDate: (record: T) => string | undefined | null;
  getCoverDate?: (record: T) => string | undefined | null;
};

export function buildIssueColumns<T>(getters: IssueColumnGetters<T>): ColumnsType<T> {
  const coverCol: ColumnType<T> = {
    dataIndex: "cover",
    key: "cover",
    title: "Cover",
    width: 80,
    render: renderCoverFromUrls(getters.getCoverUrls),
  };

  const titleCol: ColumnType<T> = {
    dataIndex: "title",
    key: "title",
    title: "Title",
    render: renderTitleBlock((r: T) => ({
      primary: getters.getTitlePrimary(r),
      secondary: getters.getTitleSecondary?.(r),
      href: getters.getTitleHref?.(r),
      title: getters.getTitleTooltip?.(r),
    })),
  };

  const cols: ColumnsType<T> = [coverCol, titleCol];

  if (getters.getPullLink) {
    cols.push({
      dataIndex: "pull",
      key: "pull",
      title: "Pull",
      width: 200,
      render: renderPullLink(getters.getPullLink),
      filterMultiple: true,
      filters: [],
      onFilter: (value: any, record: any) => {
        const p = getters.getPullLink!(record);
        const text = `${p.title || ""}$${p.year || ""}`;
        return text === String(value);
      },
    } as ColumnType<T>);
  }

  cols.push({
    dataIndex: "store_date",
    key: "store_date",
    title: "Store Date",
    width: 100,
    render: renderWeekLinkFromISO(getters.getStoreDate),
  } as ColumnType<T>);

  if (getters.getCoverDate) {
    cols.push({
      dataIndex: "cover_date",
      key: "cover_date",
      title: "Cover Date",
      width: 100,
      render: renderWeekLinkFromISO(getters.getCoverDate),
    } as ColumnType<T>);
  }

  return cols;
}

export function buildReadColumn<T>(args: {
  getComic: (record: T) => IComic;
  getValue: (record: T) => boolean;
  title?: string;
  width?: number;
}) {
  const { getComic, getValue, title = "Read", width = 48 } = args;
  const col: ColumnType<T> = {
    dataIndex: "read",
    key: "read",
    title,
    width,
    render: (_: unknown, record: T) => (
      <ReadButton comic={getComic(record)} value={getValue(record)} />
    ),
  } as ColumnType<T>;
  return col;
}
