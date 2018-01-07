import React from 'react';
import { Link } from 'react-router-dom';
import utils from '../../../utils';
import PullListLink from '../../common/PullListLink';

const titleSort = (a, b) => utils.stringAttrsSort(a, b, ['title', 'series_id', 'on_sale']);

function pullLinkCell (text, record) {
  return <Link to={`/pulls/${record.id}`}>{text}</Link>;
}

function pullListCell (text, record) {
  return <PullListLink pullListId={record.pull_list_id} pullId={record.id} />;
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
