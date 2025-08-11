import React from "react";
import { Link } from "react-router-dom";

import { usePullLists } from "../../queries";

interface IProps {
  pullId: string;
  pullListId: string;
}

export default function PullListLink({ pullListId, pullId }: IProps) {
  const { data: pullLists } = usePullLists();
  const pullList = (pullLists || []).find((pl: any) => String(pl.id) === String(pullListId));
  const title = pullList ? pullList.title : "--";
  if (!pullId) return <>{title}</>;
  return <Link to={`/pulls/${pullId}`}>{title}</Link>;
}
