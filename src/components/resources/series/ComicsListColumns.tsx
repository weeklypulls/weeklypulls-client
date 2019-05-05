import React from 'react';
import { Link } from 'react-router-dom';

import Images from '../../common/Images';
import utils from '../../../utils';
import ReadButton from '../../common/ReadButton';
import SkipButton from '../../common/SkipButton';
import PullListLink from '../../common/PullListLink';

function pullListCell (_text: string, record: any) {
  return <PullListLink pullId={record.pull.id} pullListId={record.pull.pull_list_id} />;
}

function imagesCell (_text: string, record: any) {
  return <Images images={record.comic.images} />;
}

function pullLinkCell (text: string, record: any) {
  return <Link to={`/pulls/${record.pull.id}`}>{text}</Link>;
}

const titleSort = (a: any, b: any) => utils.stringAttrsSort(a, b, ['comic.title', 'comic.series_id', 'comic.on_sale']);
const onSaleSort = (a: any, b: any) => utils.stringAttrsSort(a, b, ['comic.on_sale', 'comic.title']);

function weekCell (text: string, _record: any) {
  return <Link to={`/weeks/${text}`}>{text}</Link>;
}

function skippedCell (text: string, record: any) {
  return (
    <SkipButton
      comic={record.comic}
      value={record.skipped}
    />
  );
}

function readCell (text: string, record: any) {
  return (
    <ReadButton
      comic={record.comic}
      value={record.read}
    />
  );
}

const COLUMNS = [
  {
    dataIndex: 'read',
    filterMultiple: false,
    filters: [
      { text: 'Read', value: true },
      { text: 'Unread', value: false },
    ],
    key: 'read',
    render: readCell,
    title: 'Read',
  },
  {
    dataIndex: 'skipped',
    filterMultiple: false,
    filters: [
      { text: 'Skipped', value: true },
      { text: 'Unskipped', value: false },
    ],
    key: 'skipped',
    render: skippedCell,
    title: 'Skip',
  },
  {
    dataIndex: 'comic.images',
    key: 'comic.images',
    render: imagesCell,
    title: 'Covers',
  },
  {
    dataIndex: 'pull.pull_list_id',
    filterMultiple: true,
    filters: [],
    key: 'pull.pull_list_id',
    render: pullListCell,
    title: 'List',
  },
  {
    dataIndex: 'comic.on_sale',
    defaultSortOrder: 'ascend',
    key: 'comic.on_sale',
    render: weekCell,
    sorter: onSaleSort,
    title: 'On Sale',
  },
  {
    dataIndex: 'comic.title',
    key: 'comic.title',
    render: pullLinkCell,
    sorter: titleSort,
    title: 'Title',
  },
];

export default COLUMNS;
