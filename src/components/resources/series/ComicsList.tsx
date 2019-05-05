import React, { Component } from 'react';
import { toJS, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import httpStatus from 'http-status-codes';
import autoBindMethods from 'class-autobind-decorator';
import _ from 'lodash';
import { Table, Button, Input } from 'antd';
import { RouteComponentProps } from 'react-router';

import utils from '../../../utils';
import Store from '../../../store';

import COLUMNS from './ComicsListColumns';

const { future, stringSort } = utils;
const readOrSkipped = (comicPair: any) => (comicPair.comic.read || comicPair.comic.skipped);


interface IProps extends RouteComponentProps {
}

interface IInjected extends IProps {
  store: Store;
}

@inject('store')
@autoBindMethods
@observer
class ComicsList extends Component<IProps> {
  @observable searchText = '';
  @observable filterDropdownVisible = false;

  private get injected () {
    return this.props as IInjected;
  }

  componentDidMount () {
    this.getAllSeries();
  }

  async getAllSeries () {
    try {
      await Promise.all([
        this.injected.store.pullLists.listIfCold(),
        this.injected.store.getAllSeries(),
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

  handleChange (pagination: any, filters: any, sorter: any) {
    this.injected.store.setFilters(filters);
  }

  onInputChange (event: any) {
    this.searchText = event.target.value;
  }

  onFilterDropdownVisibleChange (visible: any) {
    this.filterDropdownVisible = visible;
  }

  onSearch () {
    const { store } = this.injected;

    store.setFilters({
      ...toJS(store.filters),
      'comic.title': [this.searchText],
    });

    this.filterDropdownVisible = false;
  }

  onClear () {
    const { store } = this.injected;

    this.searchText = '';
    store.setFilters({
      ...toJS(store.filters),
      'comic.title': [],
    });

    this.filterDropdownVisible = false;
  }

  get columns () {
    const filters = this.injected.store.filters;

    return COLUMNS.map((column: any) => {
      column.filteredValue = toJS(_.get(filters, column.key, []));

      if (column.key === 'pull.pull_list_id') {
        column.filters = this.injected.store.pullLists.all.map(pullList => ({
          text: pullList.title,
          value: pullList.id,
        }));
      }

      if (column.key === 'comic.title') {
        column.onFilterDropdownVisibleChange = this.onFilterDropdownVisibleChange;
        column.filterDropdownVisible = this.filterDropdownVisible;
        column.filtered = !!column.filteredValue.length;
        column.filterDropdown = (
          <div className='custom-filter-dropdown'>
            <Input
              onChange={this.onInputChange}
              onPressEnter={this.onSearch}
              placeholder='Search name'
              value={this.searchText}
            />
            <Button type='primary' onClick={this.onSearch}>Search</Button>
            <Button onClick={this.onClear}>Clear</Button>
          </div>
        );
      }

      return column;
    });
  }

  filterByRegex (key: string, record: any) {
    const filters = _.get(this.injected.store.filters, key, [])
      , value = _.get(record, key).toString();

    if (!filters.length) {
      return true;
    }

    const filter = filters[0]
      , reg = new RegExp(filter, 'gi');

    return !!value.match(reg);
  }

  filterBy (key: string, record: any) {
    const filters = _.get(this.injected.store.filters, key, [])
      , value = _.get(record, key).toString();

    if (!filters.length) {
      return true;
    }

    return filters.map((f: any) => f.toString()).includes(value);
  }

  dataSource () {
    const { store } = this.injected
      , pulls = store.pulls.all;

    // Build out data
    let earliestUnread = '';
    let seriesComics = pulls.map(pull => {
      const series = store.series.get(pull.series_id);

      if (!series) {
        return [];
      }

      const comicPairs = _.get(series, 'comics', []).map((comic: any) => ({
        key: comic.id,
        comic,
        read: pull.read.includes(comic.id),
        skipped: pull.skipped.includes(comic.id),
        pull,
      })).filter((comicPair: any) => !future(comicPair.comic.on_sale));

      if (!comicPairs.length || comicPairs.every(readOrSkipped)) {
        return [];
      }

      const unreadDate = comicPairs
        .filter(_.negate(readOrSkipped))
        .map((cp: any) => cp.comic.on_sale)
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

    const comicsPairsFiltered = comicPairs.filter((comicPair: any) => {
      let filter = true;

      if (comicPair.comic.on_sale < earliestUnread) {
        return false;
      }

      filter = filter && this.filterBy('read', comicPair);
      filter = filter && this.filterBy('skipped', comicPair);
      filter = filter && this.filterBy('pull.pull_list_id', comicPair);
      filter = filter && this.filterByRegex('comic.title', comicPair);

      return filter;
    });

    return comicsPairsFiltered;
  }

  render () {
    const { store } = this.injected;
    return (
      <div>
        <h2>Comics</h2>
        <Table
          columns={this.columns}
          dataSource={this.dataSource()}
          loading={store.isLoading}
          onChange={this.handleChange}
          pagination={{ pageSize: 50 }}
          rowClassName={utils.rowClassName}
          size='small'
        />
      </div>
    );
  }
}

export default ComicsList;
