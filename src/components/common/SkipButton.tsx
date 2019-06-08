import React, { Component } from 'react';
import autoBindMethods from 'class-autobind-decorator';
import { observer } from 'mobx-react';

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
class SkipButton extends Component<IProps> {
  public render () {
    const { comic, value } = this.props;
    return (
      <BoolButton
        actions={[ACTIONS.SKIP, ACTIONS.UNSKIP]}
        comic={comic}
        icons={['double-right', 'close']}
        langs={['Skip', 'Unskip']}
        value={value}
      />
    );
  }
}

export default SkipButton;
