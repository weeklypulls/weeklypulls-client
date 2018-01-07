import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autoBindMethods from 'class-autobind-decorator/build/index';
import {observer} from 'mobx-react/index';

import consts from '../../consts';

import BoolButton from './BoolButton';

const {
  ACTIONS,
} = consts;

@autoBindMethods
@observer
class SkipButton extends Component {
  render () {
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

  static propTypes = {
    comic: PropTypes.object.isRequired,
    value: PropTypes.bool.isRequired,
  }
}

export default SkipButton;
