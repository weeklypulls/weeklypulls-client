import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';
import { Table, Button, Icon, Row, Col } from 'antd';
import { Link, RouteComponentProps } from 'react-router-dom';
import { get } from 'lodash';

import utils from '../../../utils';
import PullButton from '../../common/PullButton';
import Store from '../../../store';
import { IComic } from '../../../interfaces';

function pullCell (_text: string, record: { comic: IComic, store: Store }) {
  return <PullButton {...record} />;
}

interface IInjected extends RouteComponentProps {
  store: Store;
}

@inject('store')
@autoBindMethods
@observer
class WeeksDetailPage extends Component<RouteComponentProps> {
  private get injected () {
    return this.props as IInjected;
  }

  private get weekId (): string {
    return get(this.injected.match.params, 'weekId', '');
  }

  public componentDidMount () {
    this.fetch(this.injected);
  }

  public componentWillReceiveProps (nextProps: IInjected) {
    this.fetch(nextProps);
  }

  public fetch (props: IInjected) {
    const { store } = props;
    store.weeks.fetchIfCold(this.weekId);
  }

  public get comics (): IComic[] {
    const { store } = this.injected
      , week = store.weeks.get(this.weekId)
      , comics: IComic[] = get(week, 'comics', []);

    return comics;
  }

  public dataSource () {
    return this.comics.map((comic: IComic) => ({
      comic,
      key: comic.id,
    }));
  }

  public render () {
    const weekId = this.weekId
      , nextWeek = utils.nextWeek(weekId)
      , lastWeek = utils.prevWeek(weekId);

    const { store } = this.injected
      , titleSort = (a: { comic: IComic }, b: { comic: IComic }) =>
          utils.stringAttrsSort(a, b, ['comic.title', 'comic.series_id'])
      , COLUMNS = [
        {
          dataIndex: 'comic.title',
          key: 'comic.title',
          sorter: titleSort,
          title: 'Title',
        },
        {
          dataIndex: 'comic.series_id',
          key: 'comic.series_id',
          render: pullCell,
          title: 'Series',
        },
      ];

    return (
      <div>
        <Row type='flex' justify='space-between' align='top'>
          <Col span={12}><h2>Week of {weekId}</h2></Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Button.Group>
              <Link to={`/weeks/${lastWeek}`}>
                <Button type='primary'>
                  <Icon type='left' />{lastWeek}
                </Button>
              </Link>
              {' '}
              <Link to={`/weeks/${nextWeek}`}>
                <Button type='primary'>
                  {nextWeek}<Icon type='right' />
                </Button>
              </Link>
            </Button.Group>
          </Col>
        </Row>

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

export default WeeksDetailPage;
