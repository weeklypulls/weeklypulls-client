import React, { Component } from 'react';
import { observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';
import { Table, Button, Icon, Row, Col } from 'antd';
import { Link, RouteComponentProps } from 'react-router-dom';
import _ from 'lodash';

import utils from '../../../utils';
import PullButton from '../../common/PullButton';
import Store from '../../../store';

function pullCell (_text: string, record: any) {
  return <PullButton {...record} />;
}

interface IProps extends RouteComponentProps {
  match: any;
  store: Store;
}

@inject('store')
@autoBindMethods
@observer
class WeeksDetailPage extends Component<IProps> {
  @observable weekId = null;

  componentDidMount () {
    this.fetch(this.props);
  }

  componentWillReceiveProps (nextProps: IProps) {
    this.fetch(nextProps);
  }

  fetch (props: IProps) {
    const { store, match } = props;
    store.weeks.fetchIfCold(match.params.weekId);
  }

  get comics () {
    const { store, match } = this.props
      , weekId = match.params.weekId
      , week = store.weeks.get(weekId);
    return _.get(week, 'comics', []);
  }

  dataSource () {
    return this.comics.map((comic: any) => ({
      comic,
      key: comic.id,
    }));
  }

  render () {
    const { weekId } = this.props.match.params
      , nextWeek = utils.nextWeek(weekId)
      , lastWeek = utils.prevWeek(weekId);

    const { store } = this.props
      , titleSort = (a: any, b: any) => utils.stringAttrsSort(a, b, ['comic.title', 'comic.series_id'])
      , COLUMNS = [
        {
          dataIndex: 'comic.title',
          key: 'comic.title',
          sorter: titleSort,
          title: 'Title',
        },
        {
          title: 'Series',
          dataIndex: 'comic.series_id',
          key: 'comic.series_id',
          render: pullCell,
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
