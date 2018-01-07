import React from 'react';
import { Link } from 'react-router-dom';

function stringAttrsSort (a, b, attrs) {
  for (const attr of attrs) {
    if (a[attr] < b[attr]) { return -1; }
    if (a[attr] > b[attr]) { return 1; }
  }
  return 0;
}

function pullListCell (text, record) {
  const pullList = record.store.pullLists.get(record.pull_list_id);
  if (!pullList) { return '--'; }

  return <Link to={`/pulls/${record.id}`}>{pullList.title}</Link>;
}

const titleSort = (a, b) => stringAttrsSort(a, b, ['title', 'series_id', 'on_sale']);

function pullLinkCell (text, record) {
  return <Link to={`/pulls/${record.id}`}>{text}</Link>;
}

const COLUMNS = [
  {
    title: 'Title',
    dataIndex: 'api.title',
    key: 'api_title',
    sorter: titleSort,
    render: pullLinkCell,
  },
  {
    title: 'List',
    dataIndex: 'pull_list_id',
    key: 'pull_list_id',
    render: pullListCell,
  },
];

export default COLUMNS;
