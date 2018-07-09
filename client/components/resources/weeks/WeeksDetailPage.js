import React, { Component } from 'react';
import { observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';
import PropTypes from 'prop-types';
import { Table, Button, Icon, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import utils from '../../../utils';
import PullButton from '../../common/PullButton';

function pullCell (text, record) {
  return <PullButton {...record} />;
}

@inject('store')
@autoBindMethods
@observer
class WeeksDetailPage extends Component {
  @observable weekId = null;

  componentDidMount () {
    this.fetch(this.props);
  }

  componentWillReceiveProps (nextProps) {
    this.fetch(nextProps);
  }

  fetch (props) {
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
    return this.comics.map(comic => ({
      comic,
      key: comic.id,
    }));
  }

  render () {
    const { weekId } = this.props.match.params
      , nextWeek = utils.nextWeek(weekId)
      , lastWeek = utils.prevWeek(weekId);

    const { store } = this.props
      , titleSort = (a, b) => utils.stringAttrsSort(a, b, ['comic.title', 'comic.series_id'])
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
          columns={COLUMNS}
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
    match: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
  }
}

export default WeeksDetailPage;
