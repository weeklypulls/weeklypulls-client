import React, { Component } from 'react';
import autoBindMethods from 'class-autobind-decorator';
import { inject, observer } from 'mobx-react';
import { Button, Icon } from 'antd';

import Store from '../../store';
import { IComic } from '../../interfaces';

interface IProps {
  actions: [string, string];
  comic: IComic;
  icons: [string, string];
  langs: [string, string];
  value: boolean;
}

interface IInjected extends IProps {
  store: Store;
}

@inject('store')
@autoBindMethods
@observer
class BoolButton extends Component<IProps> {
  private get injected () {
    return this.props as IInjected;
  }

  public mark () {
    const {
        actions,
        comic: { id, series_id },
        store,
        value,
      } = this.injected
      , action = actions[value ? 1 : 0];

    store.mark(series_id, id, action);
  }

  public render () {
    const { value, langs, icons } = this.props
      , icon = icons[value ? 1 : 0]
      , lang = langs[value ? 1 : 0]
      ;

    return (
      <Button className='action-button' size='small' onClick={this.mark}>
        <Icon type={icon} title={lang} />
      </Button>
    );
  }
}

export default BoolButton;
