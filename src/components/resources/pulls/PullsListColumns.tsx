import React from 'react';
import { Link } from 'react-router-dom';
import utils from '../../../utils';
import PullListLink from '../../common/PullListLink';

const titleSort = (a, b) => utils.stringAttrsSort(a, b, ['series.title', 'pull.series_id']);

function pullLinkCell (text, record) {
  return <Link to={`/pulls/${record.pull.id}`}>{text}</Link>;
}

function pullListCell (text, record) {
  return <PullListLink pullListId={record.pull.pull_list_id} pullId={record.pull.id} />;
}

const COLUMNS = [
  {
    title: 'Title',
    dataIndex: 'series.title',
    key: 'api_title',
    sorter: titleSort,
    render: pullLinkCell,
  },
  {
    title: 'List',
    dataIndex: 'pull.pull_list_id',
    key: 'pull_list_id',
    render: pullListCell,
  },
];

export default COLUMNS;
