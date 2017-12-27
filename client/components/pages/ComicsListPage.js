import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';

import Weeks from '../Weeks';

@autoBindMethods
@observer
class ComicsListPage extends Component {
  render () {
    const { store } = this.props;

    return (
      <div className='weeks'>
        <h1>Weeks</h1>
        <Weeks
          store={store}
          series={store.series.values()}
        />
      </div>
    );
  }

  static propTypes = {
    store: PropTypes.object,
  }
}

export default ComicsListPage;
