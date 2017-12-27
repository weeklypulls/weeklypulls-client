import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { toJS, observable } from 'mobx';
import { observer, propTypes } from 'mobx-react';

import autoBindMethods from 'class-autobind-decorator';
import _ from 'lodash';
import cx from 'classnames';
import { Table } from 'antd';

import utils from '../utils';
import readCell from './cells/readCell';
import skippedCell from './cells/skippedCell';
import imagesCell from './cells/imagesCell';

function stringSort (a, b, attrs) {
  for (const attr of attrs) {
    if (a[attr] < b[attr]) { return -1; }
    if (a[attr] > b[attr]) { return 1; }
  }
  return 0;
}

const titleSort = (a, b) => stringSort(a, b, ['title', 'on_sale']);
const onSaleSort = (a, b) => stringSort(a, b, ['on_sale', 'title']);
const seriesSort = (a, b) => stringSort(a, b, ['series_id', 'on_sale']);


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
    title: 'On Sale',
    dataIndex: 'on_sale',
    key: 'on_sale',
    defaultSortOrder: 'ascend',
    sorter: onSaleSort,
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

@autoBindMethods
@observer
class Weeks extends Component {
  @observable filters = new Map();

  handleChange (pagination, filters, sorter) {
    Object.keys(filters || {}).forEach(key => {
      this.filters.set(key, filters[key][0] === 'true');
    });
  }

  dataSource () {
    const { store, series } = this.props;

    const comics = series.reduce((flat, toFlatten) => {
      return flat.concat(toJS(toFlatten.comics));
    }, []);

    const weeks = Array.from(new Set(comics.map(comic => comic.on_sale)));
    weeks.sort();

    const firstUnreadWeek = store.firstUnreadWeek(series)
      , firstUnreadWeekIndex = _.findIndex(weeks, week => (week === firstUnreadWeek))
      , weeksUnread = weeks.slice(firstUnreadWeekIndex, weeks.length)
      , weeksPublished = weeksUnread.filter(week => !utils.future(week));

    let comicsToShow = comics.filter(comic => weeksPublished.includes(comic.on_sale));

    comicsToShow = comicsToShow.map(comic => ({
      ...comic,
      ...store.getUserData(comic),
    }));

    if (this.filters.has('read')) {
      comicsToShow = comicsToShow.filter(comic => comic.read === this.filters.get('read'));
    }

    if (this.filters.has('skipped')) {
      comicsToShow = comicsToShow.filter(comic => comic.skipped === this.filters.get('skipped'));
    }

    return comicsToShow.map(comic => ({
      ...comic,
      key: comic.id,
      store,
    }));
  }

  rowClassName (record) {
    const { store } = this.props
      , { series_id, read, skipped } = record;
    const loading = store.isLoading.get(`series.${series_id}`);

    return cx({
      'comic-read': read,
      'comic-skipped': skipped,
      'comic-toread': !read && !skipped,
      'loading': loading,
    });
  }

  render () {
    const { store } = this.props;
    return (
      <Table
        columns={COLUMNS}
        dataSource={this.dataSource()}
        loading={store.isLoading.get('app')}
        onChange={this.handleChange}
        pagination={{ pageSize: 30 }}
        rowClassName={this.rowClassName}
        size='small'
      />
    );
  }

  static propTypes = {
    series: propTypes.arrayOrObservableArray,
    store: PropTypes.object,
  }
}

export default Weeks;
