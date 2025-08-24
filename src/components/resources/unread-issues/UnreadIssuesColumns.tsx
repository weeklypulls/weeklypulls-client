import type { ColumnsType } from "antd/es/table";

import { IIssue } from "../../../interfaces";
import utils from "../../../utils";
import { buildIssueColumns } from "../../common/issueColumns";

// Title sort for issues: by volume name then by issue number text
const titleSort = (a: IIssue, b: IIssue) =>
  utils.stringAttrsSort(a as any, b as any, ["volume.name", "number"]);

// Server-side sorting for date; keep client-side title sort only
const base = buildIssueColumns<IIssue>({
  getCoverUrls: (r) => r.images,
  getTitlePrimary: (r) => r.title,
  getTitleSecondary: (r) => r.name,
  getTitleHref: (r) => r.site_url,
  getTitleTooltip: (r) => r.description,
  getPullLink: (r) => ({
    pull_id: r.pull?.id,
    title: r.volume?.name,
    year: r.volume?.start_year ?? undefined,
  }),
  getDate: (r) => r.date,
});

// Preserve sorting and filter behavior on top of the shared columns
const COLUMNS: ColumnsType<IIssue> = base.map((col) => {
  if (col.key === "title") {
    return { ...col, sorter: titleSort };
  }

  if (col.key === "date") {
    return { ...col, defaultSortOrder: "descend", sorter: true };
  }

  if (col.key === "pull") {
    type Value = Parameters<NonNullable<typeof col.onFilter>>[0];

    return {
      ...col,
      filterMultiple: true,
      filters: [],
      onFilter: (value: Value, record: IIssue) => {
        const title = record.volume?.name || "";
        const year = record.volume?.start_year || "";
        const text = `${title}$${year}`;
        return text === String(value);
      },
    };
  }

  return col;
});

export default COLUMNS;
