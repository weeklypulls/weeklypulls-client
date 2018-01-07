import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autoBindMethods from 'class-autobind-decorator';
import {observer} from 'mobx-react';

import consts from '../../consts';

import BoolButton from './BoolButton';

const {
  ACTIONS,
} = consts;

@autoBindMethods
@observer
class ReadButton extends Component {
  render () {
    const { comic, store, value } = this.props;
    return (
      <BoolButton
        actions={[ACTIONS.READ, ACTIONS.UNREAD]}
        comic={comic}
        icons={['check-square-o', 'close']}
        langs={['Mark read', 'Mark unread']}
        store={store}
        value={value}
      />
    );
  }

  static propTypes = {
    comic: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
    value: PropTypes.bool.isRequired,
  }
}

export default ReadButton
