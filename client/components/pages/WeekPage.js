import React, { Component } from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';
import PropTypes from 'prop-types';
import { Spin, Table, Button, Icon, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import utils from '../../utils';
import pullCell from '../cells/pullCell';

@autoBindMethods
@observer
class WeekPage extends Component {
  @observable comics = [];
  @observable isLoading = true;
  @observable weekId = null;

  componentDidMount () {
    this.fetch(this.props.match.params.weekId);
  }

  componentWillReceiveProps (nextProps) {
    const current = this.props.match.params.weekId
      , next = nextProps.match.params.weekId;

    if (current !== next) {
      this.fetch(next);
    }
  }

  async fetch (weekId) {
    this.isLoading = true;
    this.comics = [];
    const { store } = this.props;

    await Promise.all([
      store.pulls.list(),
      store.pullLists.list(),
    ]);

    this.comics = (await store.weeks.fetch(weekId)).comics;
    this.isLoading = false;
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
          loading={this.isLoading || store.weeks.isLoading}
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
