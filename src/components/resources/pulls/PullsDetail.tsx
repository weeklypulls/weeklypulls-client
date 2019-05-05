import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';
import httpStatus from 'http-status-codes';
import _ from 'lodash';
import { RouteComponentProps } from 'react-router';

import { Button, Col, Icon, Row, Table } from 'antd';

import utils from '../../../utils';
import COLUMNS from '../series/ComicsListColumns';
import Store from '../../../store';

import PullFormModal from './PullFormModal';
import { IComic } from '../../../interfaces';

const { ModalManager } = utils;

interface IProps extends RouteComponentProps {
  match: any;
}

interface IInjected extends IProps {
  store: Store;
}

@inject('store')
@autoBindMethods
@observer
class PullDetail extends Component<IProps> {
  public editModal = new ModalManager();

  private get injected () {
    return this.props as IInjected;
  }

  public componentWillMount () {
    this.getSeries();
  }

  public async getSeries () {
    const { match, store } = this.injected
      , pullId = match.params.pullId;

    try {
      const pull = await store.pulls.fetchIfCold(pullId);
      await Promise.all([
        store.pullLists.fetchIfCold(pull.pull_list_id),
        store.series.fetchIfCold(pull.series_id),
      ]);
    }
    catch (e) {
      // tslint:disable-next-line no-console
      console.error(e);
      if (_.get(e, 'response.status') === httpStatus.UNAUTHORIZED) {
        this.props.history.push('/login');
      }
    }
  }

  public dataSource () {
    const { match, store } = this.injected
      , pullId = match.params.pullId
      , { series, pull } = store.pullWithSeries(pullId);

    return series.comics.map((comic: IComic) => ({
      comic,
      key: comic.id,
      pull,
      read: pull.read.includes(comic.id),
      series,
      skipped: pull.skipped.includes(comic.id),
    }));
  }

  public render () {
    const { match, store } = this.injected
      , pullId = match.params.pullId
      , record = store.pullWithSeries(pullId)
      , COL_SPAN_TITLE = 20
      , COL_SPAN_BUTTON = 4
      ;

    return (
      <div>
        <Row type='flex' justify='space-between' align='top'>
          <Col span={COL_SPAN_TITLE}><h2>{record.series.title}</h2></Col>
          <Col span={COL_SPAN_BUTTON} style={{ textAlign: 'right' }}>
            <Button type='primary' onClick={this.editModal.open}>
              <Icon type='edit' />Edit
            </Button>
          </Col>
        </Row>

        {this.editModal.isShowing &&
          <PullFormModal {...record} onClose={this.editModal.close} />}

        <Table
          columns={COLUMNS as any}
          dataSource={this.dataSource()}
          loading={store.isLoading}
          pagination={{ pageSize: 50 }}
          rowClassName={utils.rowClassName}
          size='small'
        />
      </div>
    );
  }
}

export default PullDetail;
