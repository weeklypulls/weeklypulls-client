import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';
import httpStatus from 'http-status-codes';
import { get } from 'lodash';

import { Table } from 'antd';

import COLUMNS from './PullsListColumns';

@inject('store')
@autoBindMethods
@observer
class PullsList extends Component<any> {
  constructor (props) {
    super(props);
    this.getAllSeries();
  }

  async getAllSeries () {
    try {
      await this.props.store.getAllSeries();
    }
    catch (e) {
      if (get(e, 'response.status') === httpStatus.UNAUTHORIZED) {
        this.props.history.push('/login');
      }
    }
  }

  dataSource () {
    const { store } = this.props;
    return store.pullsWithSeries();
  }

  render () {
    const { store } = this.props;
    return (
      <div>
        <h2>Pulls</h2>
        <Table
          columns={COLUMNS as any}
          dataSource={this.dataSource()}
          loading={store.isLoading}
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
