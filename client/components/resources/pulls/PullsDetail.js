import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import autoBindMethods from 'class-autobind-decorator';
import httpStatus from 'http-status-codes';
import _ from 'lodash';

import { Button } from 'antd';

import utils from '../../../utils';
import PullFormModal from './PullFormModal';

const { ModalManager } = utils;

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

  render () {
    if (this.isLoading) {
      return 'Loading...';
    }

    const { match, store } = this.props
      , pullId = match.params.pullId
      , series = store.pullWithApi(pullId);

    return (
      <div>
        <h2>{series.api.title}</h2>

        <Button onClick={this.editModal.open}>Edit</Button>

        {this.editModal.isShowing &&
          <PullFormModal data={series} store={store} onClose={this.editModal.close} />}
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
