import readCell from './cells/readCell';
import skippedCell from './cells/skippedCell';
import imagesCell from './cells/imagesCell';
import weekCell from './cells/weekCell';
import pullListCell from './cells/pullListCell';

function stringAttrsSort (a, b, attrs) {
  for (const attr of attrs) {
    if (a[attr] < b[attr]) { return -1; }
    if (a[attr] > b[attr]) { return 1; }
  }
  return 0;
}

const titleSort = (a, b) => stringAttrsSort(a, b, ['title', 'on_sale']);
const onSaleSort = (a, b) => stringAttrsSort(a, b, ['on_sale', 'title']);
const seriesSort = (a, b) => stringAttrsSort(a, b, ['series_id', 'on_sale']);

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
    title: 'Series',
    dataIndex: 'series_id',
    key: 'series_id',
    sorter: seriesSort,
  },
  {
    title: 'Title',
    dataIndex: 'title',
    key: 'title',
    sorter: titleSort,
  },
];

export default COLUMNS;
