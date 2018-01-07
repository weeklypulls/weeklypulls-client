import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autoBindMethods from 'class-autobind-decorator';
import { inject, observer } from 'mobx-react';
import { observable } from 'mobx';
import _ from 'lodash';

import utils from '../../utils';
import PullFormModal from '../resources/pulls/PullFormModal';

const { ModalManager } = utils;

@inject('store')
@autoBindMethods
@observer
class PullButton extends Component {
  pullModal = new ModalManager();
  @observable isSubmitting = false;

  render () {
    const { comic, store } = this.props
      , { series_id } = comic
      , pull = store.pulls.getBy('series_id', series_id);

    if (pull) {
      return _.get(store.pullLists.get(pull.pull_list_id), 'title', '--')
    }

    return (
      <span>
        {this.pullModal.isShowing &&
          <PullFormModal
            pull={{ series_id }}
            onClose={this.pullModal.close}
          />}

        <a onClick={this.pullModal.open}>Pull</a>
      </span>
    );
  }

  static propTypes = {
    comic: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
  }
}

export default PullButton;
