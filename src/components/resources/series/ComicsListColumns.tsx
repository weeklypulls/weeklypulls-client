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
    dataIndex: 'comic.images',
    key: 'comic.images',
    render: imagesCell,
  },
  {
    title: 'List',
    dataIndex: 'pull.pull_list_id',
    key: 'pull.pull_list_id',
    render: pullListCell,
    filterMultiple: true,
    filters: [],
  },
  {
    title: 'On Sale',
    dataIndex: 'comic.on_sale',
    key: 'comic.on_sale',
    defaultSortOrder: 'ascend',
    sorter: onSaleSort,
    render: weekCell,
  },
  {
    title: 'Title',
    dataIndex: 'comic.title',
    key: 'comic.title',
    sorter: titleSort,
    render: pullLinkCell,
  },
];

export default COLUMNS;
