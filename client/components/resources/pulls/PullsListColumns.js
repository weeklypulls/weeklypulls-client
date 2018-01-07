import React from 'react';
import { Link } from 'react-router-dom';
import utils from '../../../utils';

const titleSort = (a, b) => utils.stringAttrsSort(a, b, ['title', 'series_id', 'on_sale']);

function pullLinkCell (text, record) {
  return <Link to={`/pulls/${record.id}`}>{text}</Link>;
}

function pullListCell (text, record) {
  const pullList = record.store.pullLists.get(record.pull_list_id);
  if (!pullList) { return '--'; }

  return <Link to={`/pulls/${record.id}`}>{pullList.title}</Link>;
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
