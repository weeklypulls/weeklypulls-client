import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';
import httpStatus from 'http-status-codes';
import { get } from 'lodash';
import { RouteComponentProps } from 'react-router';
import { action } from 'mobx';

import { Table, Spin, Empty } from 'antd';

import { FormModal } from '@mighty-justice/fields-ant';
import SmartBool from '@mighty-justice/smart-bool';

import COLUMNS from '../series/ComicsListColumns';
import LoadingButton from '../../common/LoadingButton';
import ModalButton from '../../common/ModalButton';
import Store from '../../../store';
import Title from '../../common/Title';
import utils from '../../../utils';
import { IComic, IComicPullSeriesPair } from '../../../interfaces';

interface IInjected extends RouteComponentProps {
  store: Store;
}

@inject('store')
@autoBindMethods
@observer
class PullsDetail extends Component<RouteComponentProps> {
  public isLoading = new SmartBool();

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

  public dataSource (): IComicPullSeriesPair[] {
    const { store } = this.injected
      , pullWithSeries = store.pullWithSeries(this.pullId);

    if (!pullWithSeries) { return []; }
    const { series, pull } = pullWithSeries;
    return series.comics.map((comic: IComic) => ({
      comic,
      key: comic.id,
      pull,
      read: pull.read.includes(comic.id),
      series,
    }));
  }

  public async onSave (model: any) {
    const { store } = this.injected
      , pullWithSeries = store.pullWithSeries(this.pullId);

    if (!pullWithSeries) { return; }
    const { pull } = pullWithSeries;

    if (pull.id) {
      await store.pulls.patch(pull.id, model);
    }
    else {
      await store.pulls.post({ ...model, series_id: pull.series_id });
    }
  }

  @action
  public async onDelete () {
    const { store } = this.injected;
    const pull = await store.pulls.fetchIfCold(this.pullId);

    this.isLoading.setTrue();
    await store.pulls.delete(pull.id);
    await store.pullLists.fetch(pull.pull_list_id);
    this.injected.history.goBack();
    this.isLoading.setFalse();
  }

  public render () {
    const { store } = this.injected
      , pullSeriesPair = store.pullWithSeries(this.pullId)
      ;

    if (this.isLoading.isTrue) {
      return <Spin size='large' />;
    }

    if (!pullSeriesPair) {
      return <Empty description='Pull not found' />;
    }

    return (
      <div>
        <Title title={pullSeriesPair.series.title}>
          <LoadingButton type='danger' onClick={this.onDelete}>Delete</LoadingButton>
          <ModalButton
            label='Edit'
            modalComponent={FormModal}
            modalProps={{
              fieldSets: [[
                {
                  field: 'pull_list_id',
                  label: 'Pull List',
                  optionType: 'pullLists',
                  type: 'optionSelect',
                },
              ]],
              model: pullSeriesPair.pull,
              onSave: this.onSave,
              title: pullSeriesPair.series.title,
            }}
          />
        </Title>

        <Table
          columns={COLUMNS}
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

export default PullsDetail;
