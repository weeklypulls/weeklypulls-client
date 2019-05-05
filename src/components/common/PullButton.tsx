import React, { Component } from 'react';
import autoBindMethods from 'class-autobind-decorator';
import { inject, observer } from 'mobx-react';
import { observable } from 'mobx';
import _ from 'lodash';

import { Button } from 'antd';

import utils from '../../utils';
import PullFormModal from '../resources/pulls/PullFormModal';
import Store from '../../store';
import { IComic } from '../../interfaces';

const { ModalManager } = utils;

interface IProps {
  comic: IComic;
  store: Store;
}

@inject('store')
@autoBindMethods
@observer
class PullButton extends Component<IProps> {
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

        <Button onClick={this.pullModal.open}>Pull</Button>
      </span>
    );
  }
}

export default PullButton;
