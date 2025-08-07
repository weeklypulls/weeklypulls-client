import React from 'react';
import { ColumnProps } from 'antd/lib/table';
import { IUnreadIssue } from '../../../interfaces';
import utils from '../../../utils';

function coverCell (_text: string, record: IUnreadIssue) {
  if (!record.image_medium_url) { return '--'; }
  return (
    <a
      href={record.site_url}
      target="_blank"
      rel="noopener noreferrer"
      title={`${record.volume_name} #${record.number}`}
    >
      <img 
        src={record.image_medium_url} 
        alt={`${record.volume_name} #${record.number}`}
        style={{ maxHeight: '60px', maxWidth: '40px' }}
      />
    </a>
  );
}

function titleCell (text: string, record: IUnreadIssue) {
  return (
    <a
      href={record.site_url}
      target="_blank"
      rel="noopener noreferrer"
      title={record.description}
    >
      <strong>{record.volume_name} #{record.number}</strong>
      <br />
      <small>{record.name}</small>
    </a>
  );
}

function dateCell (text: string) {
  return text || '--';
}

const titleSort = (a: IUnreadIssue, b: IUnreadIssue) =>
  utils.stringAttrsSort(a, b, ['volume_name', 'number']);

const storeDateSort = (a: IUnreadIssue, b: IUnreadIssue) =>
  utils.stringAttrsSort(a, b, ['store_date', 'volume_name', 'number']);

const COLUMNS: Array<ColumnProps<IUnreadIssue>> = [
  {
    dataIndex: 'image_medium_url',
    key: 'cover',
    render: coverCell,
    title: 'Cover',
    width: 80,
  },
  {
    dataIndex: 'volume_name',
    key: 'title',
    render: titleCell,
    sorter: titleSort,
    title: 'Title',
  },
  {
    dataIndex: 'volume_start_year',
    key: 'year',
    sorter: (a: IUnreadIssue, b: IUnreadIssue) => a.volume_start_year - b.volume_start_year,
    title: 'Year',
    width: 80,
  },
  {
    dataIndex: 'store_date',
    defaultSortOrder: 'descend',
    key: 'store_date',
    render: dateCell,
    sorter: storeDateSort,
    title: 'Store Date',
    width: 100,
  },
  {
    dataIndex: 'cover_date',
    key: 'cover_date',
    render: dateCell,
    title: 'Cover Date',
    width: 100,
  },
];

export default COLUMNS;
