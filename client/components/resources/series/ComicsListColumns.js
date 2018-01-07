import React from 'react';
import { Link } from 'react-router-dom';

import Images from '../../common/Images';
import utils from '../../../utils';
import ReadButton from '../../common/ReadButton';
import SkipButton from '../../common/SkipButton';


function pullListCell (text, record) {
  const pullList = record.store.pullLists.get(record.pull_list_id);
  if (!pullList) { return '--'; }
  return <Link to={`/pulls/${record.pull_id}`}>{pullList.title}</Link>;
}

function imagesCell (text, record) {
  return <Images images={record.images} />;
}

function pullLinkCell (text, record) {
  return <Link to={`/pulls/${record.pull_id}`}>{text}</Link>;
}

const titleSort = (a, b) => utils.stringAttrsSort(a, b, ['title', 'series_id', 'on_sale']);
const onSaleSort = (a, b) => utils.stringAttrsSort(a, b, ['on_sale', 'title']);

function weekCell (text, record) {
  return <Link to={`/weeks/${text}`}>{text}</Link>;
}

function skippedCell (text, record) {
  return (
    <SkipButton
      comic={record}
      store={record.store}
      value={record.skipped}
    />
  );
}

function readCell (text, record) {
  return (
    <ReadButton
      comic={record}
      store={record.store}
      value={record.read}
    />
  );
}

const COLUMNS = [
  {
    title: 'Read',
    dataIndex: 'read',
    key: 'read',
    render: readCell,
    filterMultiple: false,
    filters: [
      { text: 'Read', value: true },
      { text: 'Unread', value: false },
    ],
  },
  {
    title: 'Skip',
    dataIndex: 'skipped',
    key: 'skipped',
    render: skippedCell,
    filterMultiple: false,
    filters: [
      { text: 'Skipped', value: true },
      { text: 'Unskipped', value: false },
    ],
  },
  {
    title: 'Covers',
    dataIndex: 'images',
    key: 'images',
    render: imagesCell,
  },
  {
    title: 'List',
    dataIndex: 'pull_list_id',
    key: 'pull_list_id',
    render: pullListCell,
    filterMultiple: false,
    filters: [],
  },
  {
    title: 'On Sale',
    dataIndex: 'on_sale',
    key: 'on_sale',
    defaultSortOrder: 'ascend',
    sorter: onSaleSort,
    render: weekCell,
  },
  {
    title: 'Title',
    dataIndex: 'title',
    key: 'title',
    sorter: titleSort,
    render: pullLinkCell,
  },
];

export default COLUMNS;
