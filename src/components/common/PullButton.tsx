import React, { Component } from 'react';
import autoBindMethods from 'class-autobind-decorator';
import { inject, observer } from 'mobx-react';
import _ from 'lodash';

import { Button } from 'antd';

import utils from '../../utils';
import Store from '../../store';
import { IComic } from '../../interfaces';
import { FormModal } from '@mighty-justice/fields-ant';

const { ModalManager } = utils;

interface IProps {
  comic: IComic;
}

interface IInjected extends IProps {
  store: Store;
}

@inject('store')
@autoBindMethods
@observer
class PullButton extends Component<IProps> {
  public pullModal = new ModalManager();

  private get injected () {
    return this.props as IInjected;
  }

  public render () {
    const { comic, store } = this.injected
      , { series_id } = comic
      , pull = store.pulls.getBy('series_id', series_id);

    if (pull) {
      return _.get(store.pullLists.get(pull.pull_list_id), 'title', '--');
    }

    return (
      <span>
        {this.pullModal.isShowing &&
          <FormModal
            fieldSets={[[
              {
                field: 'pull_list_id',
                optionType: 'pullLists',
                type: 'optionSelect',
              },
              {
                field: 'series_id',
                type: 'hidden',
              },
            ]]}
            model={{ series_id }}
            onCancel={this.pullModal.close}
            onSave={store.pulls.post}
            title='Add to pull list'
          />}

        <Button onClick={this.pullModal.open}>Pull</Button>
      </span>
    );
  }
}

export default PullButton;
