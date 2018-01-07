import React from 'react';
import utils from '../../../utils';

const titleSort = (a, b) => utils.stringAttrsSort(a, b, ['title', 'series_id', 'on_sale']);


const COLUMNS = [
  {
    title: 'Title',
    dataIndex: 'title',
    key: 'title',
    sorter: titleSort,
  },
];

export default COLUMNS;
