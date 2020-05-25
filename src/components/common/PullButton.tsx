import React, { Component } from 'react';
import autoBindMethods from 'class-autobind-decorator';
import { inject, observer } from 'mobx-react';
import _ from 'lodash';

import { Button } from 'antd';

import { FormModal } from '@mighty-justice/fields-ant';
import SmartBool from '@mighty-justice/smart-bool';

import Store from '../../store';
import { IComic, IPull } from '../../interfaces';

interface IProps {
  comic: IComic;
  pull: IPull | undefined;
}

interface IInjected extends IProps {
  store: Store;
}

@inject('store')
@autoBindMethods
@observer
class PullButton extends Component<IProps> {
  public pullModal = new SmartBool();

  private get injected () {
    return this.props as IInjected;
  }

  public render () {
    const { pull, comic, store } = this.injected
      , { series_id } = comic;

    if (pull) {
      return _.get(store.pullLists.get(pull.pull_list_id), 'title', '--');
    }

    return (
      <span>
        <FormModal
          isVisible={this.pullModal}
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
          onSave={store.pulls.post}
          title='Add to pull list'
        />

        <Button onClick={this.pullModal.setTrue}>Pull</Button>
      </span>
    );
  }
}

export default PullButton;
