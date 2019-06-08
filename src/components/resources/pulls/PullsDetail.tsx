import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';
import httpStatus from 'http-status-codes';
import { get } from 'lodash';
import { RouteComponentProps } from 'react-router';

import { Table } from 'antd';

import utils from '../../../utils';
import COLUMNS from '../series/ComicsListColumns';
import Store from '../../../store';

import { IComic, IComicPullSeriesPair } from '../../../interfaces';
import { FormModal } from '@mighty-justice/fields-ant';
import Title from '../../common/Title';
import SmartBool from '@mighty-justice/smart-bool';
import ModalButton from '../../common/ModalButton';

interface IInjected extends RouteComponentProps {
  store: Store;
}

@inject('store')
@autoBindMethods
@observer
class PullDetail extends Component<RouteComponentProps> {
  public editModal = new SmartBool();

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
      ;

    return (
      <div>
        <Title title={pullSeriesPair.series.title}>
          <ModalButton
            label='Edit'
            modalComponent={FormModal}
            modalProps={{
              fieldSets: [[
                {
                  field: 'pull_list_id',
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

export default PullDetail;
