import React, { Component } from 'react';
import autoBindMethods from 'class-autobind-decorator';
import {observer} from 'mobx-react';

import consts from '../../consts';
import { IComic } from '../../interfaces';

import BoolButton from './BoolButton';

const {
  ACTIONS,
} = consts;

interface IProps {
  comic: IComic;
  value: boolean;
}

@autoBindMethods
@observer
class ReadButton extends Component<IProps> {
  render () {
    const { comic, value } = this.props;
    return (
      <BoolButton
        actions={[ACTIONS.READ, ACTIONS.UNREAD]}
        comic={comic}
        icons={['check', 'close']}
        langs={['Mark read', 'Mark unread']}
        value={value}
      />
    );
  }
}

export default ReadButton
