import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { toJS } from 'mobx';
import { inject, observer } from 'mobx-react';
import httpStatus from 'http-status-codes';
import autoBindMethods from 'class-autobind-decorator';
import _ from 'lodash';
import cx from 'classnames';
import { Table } from 'antd';

import utils from '../../../utils';
import COLUMNS from './ComicsListColumns';

const { future, stringSort } = utils;
const readOrSkipped = (comicPair) => (comicPair.comic.read || comicPair.comic.skipped);


@inject('store')
@autoBindMethods
@observer
class ComicsList extends Component {
  componentDidMount () {
    this.getAllSeries();
  }

  async getAllSeries () {
    try {
      await Promise.all([
        this.props.store.pullLists.listIfCold(),
        this.props.store.getAllSeries(),
      ]);
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      if (_.get(e, 'response.status') === httpStatus.UNAUTHORIZED) {
        this.props.history.push('/login');
      }
    }
  }

  handleChange (pagination, filters, sorter) {
    this.props.store.setFilters(filters);
  }

  get columns () {
    const filters = this.props.store.filters;

    return COLUMNS.map(column => {
      if (column.key === 'pull_list_id') {
        column.filters = this.props.store.pullLists.all.map(pullList => ({
          text: pullList.title,
          value: pullList.id,
        }));
      }

      column.filteredValue = toJS(_.get(filters, column.key, []));

      return column;
    });
  }

  filterBy (key, record) {
    const filters = _.get(this.props.store.filters, key, [])
      , value = _.get(record, key).toString();

    if (!filters.length) {
      return true;
    }

    return filters.includes(value);
  }

  dataSource () {
    const { store } = this.props
      , pulls = store.pulls.all;

    // Build out data
    let earliestUnread = '';
    let seriesComics = pulls.map(pull => {
      const series = store.series.get(pull.series_id);

      if (!series) {
        return [];
      }

      const comicPairs = _.get(series, 'comics', []).map(comic => ({
        key: comic.id,
        comic,
        read: pull.read.includes(comic.id),
        skipped: pull.skipped.includes(comic.id),
        pull,
      })).filter(comicPair => !future(comicPair.comic.on_sale));

      if (!comicPairs.length || comicPairs.every(readOrSkipped)) {
        return [];
      }

      const unreadDate = comicPairs
        .filter(_.negate(readOrSkipped))
        .map(cp => cp.comic.on_sale)
        .sort(stringSort)[0];

      if (!earliestUnread || earliestUnread > unreadDate) {
        earliestUnread = unreadDate;
      }

      return comicPairs;
    });

    // Filter out series
    seriesComics = seriesComics.filter(comicPair => !comicPair.every(readOrSkipped));

    // flatten list
    const comicPairs = seriesComics.reduce((flat, toFlatten) => {
      return flat.concat(toJS(toFlatten));
    }, []);

    const comicsPairsFiltered = comicPairs.filter(comicPair => {
      let filter = true;

      if (comicPair.comic.on_sale < earliestUnread) {
        return false;
      }

      filter = filter && this.filterBy('read', comicPair);
      filter = filter && this.filterBy('skipped', comicPair);
      filter = filter && this.filterBy('pull.pull_list_id', comicPair);

      return filter;
    });

    return comicsPairsFiltered;
  }

  rowClassName (record) {
    const { read, skipped } = record;
    return cx({
      'comic-read': read,
      'comic-skipped': skipped,
      'comic-toread': !read && !skipped,
    });
  }

  render () {
    const { store } = this.props;
    return (
      <div>
        <h2>Comics</h2>
        <Table
          columns={this.columns}
          dataSource={this.dataSource()}
          loading={store.isLoading}
          onChange={this.handleChange}
          pagination={{ pageSize: 50 }}
          rowClassName={this.rowClassName}
          size='small'
        />
      </div>
    );
  }

  static propTypes = {
    history: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
  }
}

export default ComicsList;
