import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';

import Comics from './Comics';

@observer
@autoBindMethods
class ComicsListPage extends Component {
  render () {
    return <Comics {...this.props} />;
  }

  static propTypes = {
    history: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
  }
}

export default ComicsListPage;
