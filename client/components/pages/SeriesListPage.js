import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';

import { Route } from 'react-router-dom';

import Pull from '../Pull';
import PullSelect from '../PullSelect';

@autoBindMethods
@observer
class SeriesListPage extends Component {
  renderPull (props) {
    return <Pull {...this.props} {...props} />;
  }

  renderPullSelect (props) {
    return <PullSelect {...this.props} {...props} />;
  }

  render () {
    const { match } = this.props;
    return (
      <div>
        <Route path={`${match.url}/:pullId`} component={this.renderPull} />
        <Route exact path={match.url} render={this.renderPullSelect} />
      </div>
    );
  }

  static propTypes = {
    history: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
  }
}

export default SeriesListPage;
