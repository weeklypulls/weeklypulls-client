import React from 'react';
import { Link } from 'react-router-dom';

export default function pullListCell (text, record) {
  const pullList = record.store.pullLists.find(pullList => pullList.id === record.pull_list_id);
  if (!pullList) { return '--'; }

  return <Link to={`/series/${record.series_id}`}>{pullList.title}</Link>;
}
