import { observer } from "mobx-react";
import React from "react";

import UnreadIssues from "./UnreadIssues";

export default observer(function UnreadIssuesPage() {
  return <UnreadIssues />;
});
