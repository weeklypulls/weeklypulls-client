import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { observable } from 'mobx';
import autoBindMethods from 'class-autobind-decorator';
import httpStatus from 'http-status-codes';
import _ from 'lodash';

import { Button, Col, Icon, Row, Table } from 'antd';

import utils from '../../../utils';
import PullFormModal from './PullFormModal';
import COLUMNS from './PullsDetailsColumns';

const { ModalManager } = utils;

@inject('store')
@autoBindMethods
@observer
class Pull extends Component {
  @observable isLoading = true;
  editModal = new ModalManager();

  constructor (props) {
    super(props);
  }

  componentWillMount () {
    this.getSeries();
  }

  async getSeries () {
    try {
      await this.props.store.getAllSeries();
      this.isLoading = false;
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      if (_.get(e, 'response.status') === httpStatus.UNAUTHORIZED) {
        this.props.history.push('/login');
      }
    }
  }

  dataSource () {
    const { match, store } = this.props
      , pullId = match.params.pullId
      , series = store.pullWithApi(pullId);

    return series.api.comics.map(c => ({ ...c, key: c.id }));
  }

  render () {
    if (this.isLoading) {
      return 'Loading...';
    }

    const { match, store } = this.props
      , pullId = match.params.pullId
      , series = store.pullWithApi(pullId);

    return (
      <div>
        <Row type='flex' justify='space-between' align='top'>
          <Col span={8}><h2>{series.api.title}</h2></Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Button type='primary' onClick={this.editModal.open}>
              <Icon type='edit' />Edit
            </Button>
          </Col>
        </Row>

        {this.editModal.isShowing &&
          <PullFormModal data={series} onClose={this.editModal.close} />}

        <Table
          columns={COLUMNS}
          dataSource={this.dataSource()}
          loading={store.isLoading}
          pagination={{ pageSize: 50 }}
          size='small'
        />
      </div>
    );
  }

  static propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
  }
}

export default Pull;
