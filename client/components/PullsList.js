import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import autoBindMethods from 'class-autobind-decorator';
import httpStatus from 'http-status-codes';
import _ from 'lodash';

import { Table } from 'antd';

import COLUMNS from './PullsListColumns';

@autoBindMethods
@observer
class PullsList extends Component {
  @observable isLoading = true;

  constructor (props) {
    super(props);
    this.getAllSeries();
  }

  async getAllSeries () {
    try {
      await this.props.store.getAllSeries();
      this.isLoading = false;
    }
    catch (e) {
      if (_.get(e, 'response.status') === httpStatus.UNAUTHORIZED) {
        this.props.history.push('/login');
      }
    }
  }

  dataSource () {
    const { store } = this.props;
    return store.pullsWithApi.map(pull => ({
      ...pull,
      key: pull.id,
      store,
    }));
  }

  render () {
    const { store } = this.props;

    if (this.isLoading) {
      return `Loadin2g... ${this.isLoading}`;
    }

    return (
      <div>
        <h2>Pulls</h2>
        <Table
          columns={COLUMNS}
          dataSource={this.dataSource()}
          loading={store.pullLists.isLoading || store.pulls.isLoading || store.series.isLoading}
          pagination={false}
          size='small'
        />
      </div>
    );
  }

  static propTypes = {
    history: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
  }
}

export default PullsList;
