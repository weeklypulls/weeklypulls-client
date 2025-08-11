import { observer } from "mobx-react";
import React, { useContext } from "react";
import { Link } from "react-router-dom";

import Store from "../../store";
import { StoreContext } from "../../storeContext";

interface IProps {
  pullId: string;
  pullListId: string;
}

export default observer(function PullListLink({ pullListId, pullId }: IProps) {
  const store = useContext<Store>(StoreContext);
  const pullList = store.pullLists.get(pullListId);
  if (!pullList) {
    return <>--</>;
  }
  return <Link to={`/pulls/${pullId}`}>{pullList.title}</Link>;
});
