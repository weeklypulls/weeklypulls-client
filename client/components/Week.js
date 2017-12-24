import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';
import { observable } from 'mobx';
import { observer, propTypes } from 'mobx-react';
import { Table } from 'antd';
import cx from 'classnames';

import utils from '../utils';

import readCell from './cells/readCell';
import skippedCell from './cells/skippedCell';
import imagesCell from './cells/imagesCell';

@autobind
@observer
class Week extends Component {
  @observable minimized = null;

  constructor (props) {
    super(props);
  }

  defaultMinimized () {
    const futureWeek = utils.future(this.props.week)
      , allRead = !this.props.comics.some(comics => !(comics.read || comics.skipped));

    return futureWeek || allRead;
  }

  getMinimized () {
    if (this.minimized === null) {
      return this.defaultMinimized();
    }
    return this.minimized;
  }

  toggleMinimized () {
    if (this.minimized === null) {
      this.minimized = !this.defaultMinimized();
    }
    else {
      this.minimized = !this.minimized;
    }
  }

  get extraComics () {
    const {
      comics,
      store,
      week,
    } = this.props;

    const comicIds = comics.map(comic => comic.id);
    return store.extraComics(week).filter(comic => !comicIds.includes(comic.id));
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
    const {
        comics,
        store,
        week,
      } = this.props
      , weekLoading = store.isLoading.get(`week.${week}`)
      , columns = [
        {
          title: 'Read',
          dataIndex: 'read',
          key: 'read',
          render: readCell,
        },
        {
          title: 'Skip',
          dataIndex: 'skipped',
          key: 'skipped',
          render: skippedCell,
        },
        {
          title: 'Covers',
          dataIndex: 'images',
          key: 'images',
          render: imagesCell,
        },
        {
          title: 'Title',
          dataIndex: 'title',
          key: 'title',
        },
        {
          title: 'On Sale',
          dataIndex: 'on_sale',
          key: 'on_sale',
          defaultSortOrder: 'descend',
          sorter: (a, b) => a.on_sale - b.on_sale,
        },
        {
          title: 'Series',
          dataIndex: 'series_id',
          key: 'series_id',
        },
      ]
      , dataSource = comics.map(c => ({
        ...c,
        ...store.getUserData(c),
        key: c.id,
        store,
      }))
      ;

    return (
      <div className='week'>
        <h3>{week} <a onClick={this.toggleMinimized}>[{this.minimized ? '+' : '-'}]</a></h3>

        {!this.getMinimized() && (<div>
          <Table
            columns={columns}
            dataSource={dataSource}
            loading={weekLoading || store.isLoading.get('app')}
            pagination={false}
            rowClassName={this.rowClassName}
            size='small'
          />
        </div>)}
      </div>
    );
  }

  static propTypes = {
    comics: propTypes.arrayOrObservableArray,
    mark: PropTypes.func,
    store: PropTypes.object,
    week: PropTypes.string,
  }
}

export default Week;
