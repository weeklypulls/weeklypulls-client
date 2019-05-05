import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';
import httpStatus from 'http-status-codes';
import { get } from 'lodash';
import { RouteComponentProps } from 'react-router-dom';

import { Table } from 'antd';

import Store from '../../../store';

import COLUMNS from './PullsListColumns';

interface IInjected extends RouteComponentProps {
  store: Store;
}

@inject('store')
@autoBindMethods
@observer
class PullsList extends Component<RouteComponentProps> {
  public constructor (props: RouteComponentProps) {
    super(props);
    this.getAllSeries();
  }

  private get injected () {
    return this.props as IInjected;
  }

  public async getAllSeries () {
    try {
      await this.injected.store.getAllSeries();
    }
    catch (e) {
      if (get(e, 'response.status') === httpStatus.UNAUTHORIZED) {
        this.props.history.push('/login');
      }
    }
  }

  public dataSource () {
    const { store } = this.injected;
    return store.pullsWithSeries();
  }

  public render () {
    const { store } = this.injected;
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
}

export default PullsList;
