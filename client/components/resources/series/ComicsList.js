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
const readOrSkipped = (comic) => (comic.read || comic.skipped);


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

  filterBy (key, comic) {
    const filters = _.get(this.props.store.filters, key, [])
      , value = comic[key].toString();

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

      const comics = _.get(series, 'comics', []).map(comic => ({
        ...comic,
        read: pull.read.includes(comic.id),
        skipped: pull.skipped.includes(comic.id),
        pull_list_id: pull.pull_list_id,
        pull_id: pull.id,
        key: comic.id,
      })).filter(comic => !future(comic.on_sale));

      if (!comics.length || comics.every(readOrSkipped)) {
        return [];
      }

      const unreadDate = comics.filter(_.negate(readOrSkipped)).map(c => c.on_sale).sort(stringSort)[0];

      if (!earliestUnread || earliestUnread > unreadDate) {
        earliestUnread = unreadDate;
      }

      return comics;
    });

    // Filter out series
    seriesComics = seriesComics.filter(comics => !comics.every(readOrSkipped));

    // flatten list
    const comics = seriesComics.reduce((flat, toFlatten) => {
      return flat.concat(toJS(toFlatten));
    }, []);

    const comicsFiltered = comics.filter(comic => {
      let filter = true;

      if (comic.on_sale < earliestUnread) {
        return false;
      }

      filter = filter && this.filterBy('read', comic);
      filter = filter && this.filterBy('skipped', comic);
      filter = filter && this.filterBy('pull_list_id', comic);

      return filter;
    });

    return comicsFiltered;
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
          loading={store.pulls.isLoading || store.series.isLoading}
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
