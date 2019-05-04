import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';

import Comics from './ComicsList';

@observer
@autoBindMethods
class ComicsListPage extends Component<any> {
  render () {
    return <Comics {...this.props} />;
  }

  static propTypes = {
    history: PropTypes.object.isRequired,
  }
}

export default ComicsListPage;
