import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';
import { observer } from 'mobx-react';
import _ from 'lodash';

import Series from './series';
import Weeks from './weeks';

@autobind
@observer
class App extends Component {
  renderWeeks () {
    const {
      store,
    } = this.props;

    return (
      <div className="weeks">
        <h1>Weeks</h1>
        <Weeks
          store={store}
          mark={store.mark}
          series={store.series.values()}
        />
      </div>
    );
  }

  renderSeries () {
    const {
      store,
    } = this.props;

    return (
      <div className="series">
        <h1>Series</h1>
        {_.sortBy(store.series.values(), 'api.title').map(series => (
          <Series
            key={series.id}
            mark={store.mark}
            series={series}
            store={store}
          />
        ))}
      </div>
    );
  }

  render () {
    const {
      store,
    } = this.props;

    // {this.renderSeries()}
    return (
      <div className={store.isLoading.get('app') ? 'loading' : ''}>
        {this.renderWeeks()}
      </div>
    );
  }

  static propTypes = {
    store: PropTypes.object,
  }
}

export default App;
