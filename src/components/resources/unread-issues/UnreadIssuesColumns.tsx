import type { ColumnsType } from "antd/es/table";

import { IUnreadIssue } from "../../../interfaces";
import utils from "../../../utils";
import { buildIssueColumns } from "../../common/issueColumns";

const titleSort = (a: IUnreadIssue, b: IUnreadIssue) =>
  utils.stringAttrsSort(a, b, ["volume_name", "number"]);

const storeDateSort = (a: IUnreadIssue, b: IUnreadIssue) =>
  utils.stringAttrsSort(a, b, ["store_date", "volume_name", "number"]);

const coverDateSort = (a: IUnreadIssue, b: IUnreadIssue) =>
  utils.stringAttrsSort(a, b, ["cover_date", "volume_name", "number"]);

const base = buildIssueColumns<IUnreadIssue>({
  getCoverUrls: (r) => r.image_medium_url || r.image_url || undefined,
  getTitlePrimary: (r) => `${r.volume_name} #${r.number}`,
  getTitleSecondary: (r) => r.name,
  getTitleHref: (r) => r.site_url || undefined,
  getTitleTooltip: (r) => r.description,
  getPullLink: (r) => ({ pull_id: r.pull_id, title: r.volume_name, year: r.volume_start_year }),
  getStoreDate: (r) => r.store_date,
  getCoverDate: (r) => r.cover_date,
});

// Preserve sorting and filter behavior on top of the shared columns
const COLUMNS: ColumnsType<IUnreadIssue> = base.map((col) => {
  if (col.key === "title") {
    return { ...col, sorter: titleSort } as any;
  }
  if (col.key === "store_date") {
    return { ...col, defaultSortOrder: "descend", sorter: storeDateSort } as any;
  }
  if (col.key === "cover_date") {
    return { ...col, sorter: coverDateSort } as any;
  }
  if (col.key === "pull") {
    return {
      ...col,
      filterMultiple: true,
      filters: [], // dynamically populated (volume title + year)
      onFilter: (value: any, record: IUnreadIssue) => {
        const text = `${record.volume_name || ""}$${record.volume_start_year || ""}`;
        return text === String(value);
      },
    } as any;
  }
  return col;
});

export default COLUMNS;
