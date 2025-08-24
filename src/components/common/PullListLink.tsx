import { Link } from "react-router-dom";

import type { IPullList } from "../../interfaces";
import { usePullLists } from "../../queries";

interface IProps {
  pullId: string;
  pullListId: string;
}

export default function PullListLink({ pullListId, pullId }: IProps) {
  const { data: pullLists } = usePullLists();
  const pullList = (pullLists as IPullList[] | undefined)?.find(
    (pl) => String(pl.id) === String(pullListId)
  );
  const title = pullList ? pullList.title : "--";
  if (!pullId) return <>{title}</>;
  return <Link to={`/pulls/${pullId}`}>{title}</Link>;
}
