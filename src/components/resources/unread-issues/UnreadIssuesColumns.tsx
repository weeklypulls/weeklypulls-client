import type { ColumnsType } from "antd/es/table";

import { IUnreadIssue } from "../../../interfaces";
import utils from "../../../utils";
import { buildIssueColumns } from "../../common/issueColumns";

const titleSort = (a: IUnreadIssue, b: IUnreadIssue) =>
  utils.stringAttrsSort(a, b, ["volume_name", "number"]);

const dateSort = (a: IUnreadIssue, b: IUnreadIssue) =>
  utils.stringAttrsSort(a, b, ["date", "volume_name", "number"]);

const base = buildIssueColumns<IUnreadIssue>({
  getCoverUrls: (r) => r.image_medium_url || r.image_url || undefined,
  getTitlePrimary: (r) => `${r.volume_name} #${r.number}`,
  getTitleSecondary: (r) => r.name,
  getTitleHref: (r) => r.site_url || undefined,
  getTitleTooltip: (r) => r.description,
  getPullLink: (r) => ({ pull_id: r.pull_id, title: r.volume_name, year: r.volume_start_year }),
  getDate: (r) => r.date || r.store_date || r.cover_date,
});

// Preserve sorting and filter behavior on top of the shared columns
const COLUMNS: ColumnsType<IUnreadIssue> = base.map((col) => {
  if (col.key === "title") {
    return { ...col, sorter: titleSort };
  }

  if (col.key === "date") {
    return { ...col, defaultSortOrder: "descend", sorter: dateSort };
  }

  if (col.key === "pull") {
    type Value = Parameters<NonNullable<typeof col.onFilter>>[0];

    return {
      ...col,
      filterMultiple: true,
      filters: [],
      onFilter: (value: Value, record: IUnreadIssue) => {
        const text = `${record.volume_name || ""}$${record.volume_start_year || ""}`;
        return text === String(value);
      },
    };
  }

  return col;
});

export default COLUMNS;
