import type { ColumnsType } from "antd/es/table";

import { IIssue } from "../../../interfaces";
import { buildIssueColumns } from "../../common/issueColumns";

// Columns for Unread Issues; all sorting/filtering is server-side
const COLUMNS: ColumnsType<IIssue> = buildIssueColumns({ includePull: true });

export default COLUMNS;
