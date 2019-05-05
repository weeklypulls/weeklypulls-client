import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';
import httpStatus from 'http-status-codes';
import { get } from 'lodash';
import { RouteComponentProps } from 'react-router';

import { Button, Col, Icon, Row, Table } from 'antd';

import utils from '../../../utils';
import COLUMNS from '../series/ComicsListColumns';
import Store from '../../../store';

import { IComic } from '../../../interfaces';
import { FormModal } from '@mighty-justice/fields-ant';

const { ModalManager } = utils;

interface IInjected extends RouteComponentProps {
  store: Store;
}

@inject('store')
@autoBindMethods
@observer
class PullDetail extends Component<RouteComponentProps> {
  public editModal = new ModalManager();

  private get injected () {
    return this.props as IInjected;
  }

  private get pullId (): string {
    return get(this.injected.match.params, 'pullId', '');
  }

  public componentWillMount () {
    this.getSeries();
  }

  public async getSeries () {
    const { store } = this.injected;

    try {
      const pull = await store.pulls.fetchIfCold(this.pullId);
      await Promise.all([
        store.pullLists.fetchIfCold(pull.pull_list_id),
        store.series.fetchIfCold(pull.series_id),
      ]);
    }
    catch (e) {
      // tslint:disable-next-line no-console
      console.error(e);
      if (get(e, 'response.status') === httpStatus.UNAUTHORIZED) {
        this.props.history.push('/login');
      }
    }
  }

  public dataSource () {
    const { store } = this.injected
      , { series, pull } = store.pullWithSeries(this.pullId);

    return series.comics.map((comic: IComic) => ({
      comic,
      key: comic.id,
      pull,
      read: pull.read.includes(comic.id),
      series,
      skipped: pull.skipped.includes(comic.id),
    }));
  }

  public async onSave (model: any) {
    const { store } = this.injected
      , { pull } = store.pullWithSeries(this.pullId);

    if (pull.id) {
      await store.pulls.patch(pull.id, model);
    }
    else {
      await store.pulls.post({ ...model, series_id: pull.series_id });
    }
  }

  public render () {
    const { store } = this.injected
      , pullSeriesPair = store.pullWithSeries(this.pullId)
      , COL_SPAN_TITLE = 20
      , COL_SPAN_BUTTON = 4
      ;

    return (
      <div>
        <Row type='flex' justify='space-between' align='top'>
          <Col span={COL_SPAN_TITLE}><h2>{pullSeriesPair.series.title}</h2></Col>
          <Col span={COL_SPAN_BUTTON} style={{ textAlign: 'right' }}>
            <Button type='primary' onClick={this.editModal.open}>
              <Icon type='edit' />Edit
            </Button>
          </Col>
        </Row>

        {this.editModal.isShowing &&
          <FormModal
            fieldSets={[[
              {
                field: 'pull_list_id',
                options: store.pullLists.all.map(pullList => ({ value: pullList.id, name: pullList.title })),
                type: 'optionSelect',
              },
            ]]}
            model={pullSeriesPair.pull}
            onCancel={this.editModal.close}
            onSave={this.onSave}
            title={pullSeriesPair.series.title}
          />}

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
