import React from 'react';

import { IComic, IComicPullPair } from '../../../interfaces';
import { ColumnProps } from 'antd/lib/table';
import utils from '../../../utils';
import PullButton from '../../common/PullButton';
import { Link } from 'react-router-dom';

function pullLinkCell (text: string, record: IComicPullPair) {
  if (!record.pull) { return text; }
  return <Link to={`/pulls/${record.pull.id}`}>{text}</Link>;
}

function pullCell (_text: string, record: IComicPullPair) {
  return <PullButton {...record} />;
}

function titleSort (a: { comic: IComic }, b: { comic: IComic }) {
 return utils.stringAttrsSort(a, b, ['comic.title', 'comic.series_id']);
}

const COLUMNS: Array<ColumnProps<IComicPullPair>> = [
  {
    dataIndex: 'comic.title',
    key: 'comic.title',
    render: pullLinkCell,
    sorter: titleSort,
    title: 'Title',
  },
  {
    dataIndex: 'comic.series_id',
    key: 'comic.series_id',
    render: pullCell,
    title: 'Series',
  },
];

export default COLUMNS;
