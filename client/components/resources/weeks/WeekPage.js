import React, { Component } from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';
import PropTypes from 'prop-types';
import { Table, Button, Icon, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import utils from '../../../utils';
import PullButton from '../../common/PullButton';

function pullCell (text, record) {
  return <PullButton text={text} record={record} />;
}

@autoBindMethods
@observer
class WeekPage extends Component {
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
      ...comic,
      key: comic.id,
      store: this.props.store,
    }));
  }

  render () {
    const { weekId } = this.props.match.params
      , nextWeek = utils.nextWeek(weekId)
      , lastWeek = utils.prevWeek(weekId);

    const { store } = this.props
      , COLUMNS = [
        {
          title: 'Title',
          dataIndex: 'title',
          key: 'title',
        },
        {
          title: 'Series',
          dataIndex: 'series_id',
          key: 'series_id',
          render: pullCell,
        },
      ];

    return (
      <div>
        <Row type='flex' justify='space-between' align='top'>
          <Col span={8}><h2>Week of {weekId}</h2></Col>
          <Col span={8} style={{ textAlign: 'right' }}>
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

export default WeekPage;
