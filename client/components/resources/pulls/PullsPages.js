import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';

import { Route } from 'react-router-dom';

import PullsDetail from './PullsDetail';
import PullsList from './PullsList';

@autoBindMethods
@observer
class SeriesListPage extends Component {
  renderPull (props) {
    return <PullsDetail {...this.props} {...props} />;
  }

  renderPullsList (props) {
    return <PullsList {...this.props} {...props} />;
  }

  render () {
    const { match } = this.props;
    return (
      <div>
        <Route path={`${match.url}/:pullId`} component={this.renderPull} />
        <Route exact path={match.url} render={this.renderPullsList} />
      </div>
    );
  }

  static propTypes = {
    history: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
  }
}

export default SeriesListPage;
