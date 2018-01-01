import React from 'react';
import { Link } from 'react-router-dom';

export default function pullListCell (text, record) {
  const pullList = record.store.pullLists.get(record.pull_list_id);
  if (!pullList) { return '--'; }

  return <Link to={`/series/${record.pull_id}`}>{pullList.title}</Link>;
}
