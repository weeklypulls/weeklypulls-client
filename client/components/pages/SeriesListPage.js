import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';

import {
  Route,
  Link,
} from 'react-router-dom';

@autoBindMethods
@observer
class Topic extends Component {
  render () {
    const { match } = this.props;
    return (
      <div>
        <h3>{match.params.topicId}</h3>
      </div>
    );
  }

  static propTypes = {
    match: PropTypes.object.isRequired,
  }
}

@autoBindMethods
@observer
class SeriesListPage extends Component {
  renderSelect () {
    return <h3>Please select a series.</h3>;
  }

  render () {
    const { match } = this.props;
    return (
      <div>
        <h2>Series</h2>
        <ul>
          <li>
            <Link to={`${match.url}/rendering`}>
              Rendering with React
            </Link>
          </li>
          <li>
            <Link to={`${match.url}/components`}>
              Components
            </Link>
          </li>
          <li>
            <Link to={`${match.url}/props-v-state`}>
              Props v. State
            </Link>
          </li>
        </ul>

        <Route path={`${match.url}/:topicId`} component={Topic} />
        <Route exact path={match.url} render={this.renderSelect} />
      </div>
    );
  }

  static propTypes = {
    match: PropTypes.object.isRequired,
  }
}

export default SeriesListPage;
