import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';
import httpStatus from 'http-status-codes';
import { get } from 'lodash';
import { RouteComponentProps } from 'react-router';
import { observable } from 'mobx';

import { Table, Button, Input, DatePicker, Row, Col } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import moment from 'moment';

import Store from '../../../store';
import { IUnreadIssue } from '../../../interfaces';
import Title from '../../common/Title';

import COLUMNS from './UnreadIssuesColumns';

interface IFilters {
  limit?: number;
  since?: string;
}

interface IInjected extends RouteComponentProps, FormComponentProps {
  store: Store;
}

@inject('store')
@autoBindMethods
@observer
class UnreadIssues extends Component<RouteComponentProps> {
  @observable public filters: IFilters = { limit: 50 };

  private get injected () {
    return this.props as IInjected;
  }

  public componentDidMount () {
    this.fetchUnreadIssues();
  }

  public async fetchUnreadIssues () {
    try {
      const { store } = this.injected;
      
      // Build query parameters
      const params = new URLSearchParams();
      if (this.filters.limit) {
        params.append('limit', this.filters.limit.toString());
      }
      if (this.filters.since) {
        params.append('since', this.filters.since);
      }

      // Since the Resource class doesn't support query parameters directly,
      // we'll make a direct API call
      const queryString = params.toString();
      const endpoint = queryString ? `pulls/unread_issues?${queryString}` : 'pulls/unread_issues';
      
      const response = await store.client.user.get(endpoint);
      
      // Clear existing data and populate with new data
      store.unreadIssues.objects.clear();
      store.unreadIssues.fetchedOn.clear();
      
      response.data.forEach((issue: IUnreadIssue) => {
        store.unreadIssues.setObject(issue.cv_id.toString(), issue);
      });
      
      store.unreadIssues.save();
    }
    catch (e) {
      // tslint:disable-next-line no-console
      console.error('Error fetching unread issues:', e);
      if (get(e, 'response.status') === httpStatus.UNAUTHORIZED) {
        this.injected.history.push('/login');
      }
    }
  }

  public onLimitChange (event: React.ChangeEvent<HTMLInputElement>) {
    const limit = parseInt(event.target.value, 10);
    this.filters = { ...this.filters, limit: isNaN(limit) ? undefined : limit };
  }

  public onDateChange (dates: any, dateStrings: [string, string]) {
    const since = dateStrings[0] || undefined;
    this.filters = { ...this.filters, since };
  }

  public onRefresh () {
    this.fetchUnreadIssues();
  }

  public dataSource (): IUnreadIssue[] {
    const { store } = this.injected;
    return store.unreadIssues.all;
  }

  public render () {
    const { store } = this.injected;
    
    return (
      <div>
        <Title title="Unread Issues">
          <Button type="primary" onClick={this.onRefresh} loading={store.unreadIssues.isLoading}>
            Refresh
          </Button>
        </Title>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <label>Limit:</label>
            <Input
              type="number"
              value={this.filters.limit || ''}
              onChange={this.onLimitChange}
              placeholder="Limit (max 200)"
              style={{ marginTop: 4 }}
            />
          </Col>
          <Col span={8}>
            <label>Since Date:</label>
            <DatePicker
              value={this.filters.since ? moment(this.filters.since) : undefined}
              onChange={(date, dateString) => {
                this.filters = { ...this.filters, since: dateString || undefined };
              }}
              format="YYYY-MM-DD"
              placeholder="Filter by date"
              style={{ width: '100%', marginTop: 4 }}
            />
          </Col>
          <Col span={8} style={{ paddingTop: 24 }}>
            <Button type="default" onClick={this.onRefresh}>
              Apply Filters
            </Button>
          </Col>
        </Row>

        <Table
          columns={COLUMNS}
          dataSource={this.dataSource()}
          loading={store.unreadIssues.isLoading}
          pagination={{ 
            pageSize: 50,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} unread issues`
          }}
          rowKey="cv_id"
          size="small"
        />
      </div>
    );
  }
}

export default UnreadIssues;
