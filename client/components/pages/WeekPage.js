import React, { Component } from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';
import PropTypes from 'prop-types';
import { Spin, Table } from 'antd';

import pullCell from '../cells/pullCell';

@autoBindMethods
@observer
class WeekPage extends Component {
  @observable comics = [];
  @observable isLoading = true;

  componentDidMount () {
    this.fetch();
  }

  async fetch () {
    const { match, store } = this.props
      , id = match.params.weekId;

    await Promise.all([
      store.pulls.list(),
      store.pullLists.list(),
    ]);

    this.comics = (await store.weeks.fetch(id)).comics;
    this.isLoading = false;
  }

  dataSource () {
    return this.comics.map(comic => ({
      ...comic,
      key: comic.id,
      store: this.props.store,
    }));
  }

  render () {
    if (this.isLoading) {
      return <Spin size='large' />;
    }

    const { store } = this.props
      , COLUMNS = [
        {
          title: 'Title',
          dataIndex: 'title',
          key: 'title',
        },
        {
          title: 'Series',
          dataIndex: 'series_id',
          key: 'series_id',
          render: pullCell,
        },
      ];

    return (
      <Table
        columns={COLUMNS}
        dataSource={this.dataSource()}
        loading={this.isLoading || store.weeks.isLoading}
        pagination={false}
        size='small'
      />
    );
  }

  static propTypes = {
    history: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
  }
}

export default WeekPage;
