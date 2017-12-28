import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import autoBindMethods from 'class-autobind-decorator';

import {
  Route,
  Link,
} from 'react-router-dom';

import SeriesForm from '../forms/seriesForm';

@autoBindMethods
@observer
class Series extends Component {
  @observable isLoading = true;

  constructor (props) {
    super(props);
    this.getSeries();
  }

  async getSeries () {
    try {
      await this.props.store.getAllSeries();
      this.isLoading = false;
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      this.props.history.push('/login');
    }
  }

  render () {
    if (this.isLoading) {
      return 'Loading...';
    }

    const { match, store } = this.props
      , seriesId = match.params.seriesId
      , series = store.pullWithApi(seriesId);

    return (
      <div>
        <Link to={'/series'}>Back</Link>

        <h3>{series.api.title}</h3>

        <SeriesForm data={series} store={store} />
      </div>
    );
  }

  static propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
  }
}

@autoBindMethods
@observer
class SeriesListPage extends Component {
  constructor (props) {
    super(props);
    this.getAllSeries();
  }

  async getAllSeries () {
    try {
      await this.props.store.getAllSeries();
    }
    catch (e) {
      this.props.history.push('/login');
    }
  }

  renderSeries (props) {
    return <Series {...this.props} {...props} />;
  }

  renderSelect () {
    const { match, store } = this.props;

    if (store.isLoading.get('app')) {
      return 'Loading...';
    }

    return (
      <div>
        <h3>Please select a series.</h3>

        <ul>
          {store.pullsWithApi.map(pull => (
            <li key={pull.id}>
              <Link to={`${match.url}/${pull.series_id}`}>
                {pull.api.title}
              </Link>
            </li>
          ))}
          <li key='wut'>
            <Link to={`${match.url}/components`}>
              Components
            </Link>
          </li>
          <li key='wut2'>
            <Link to={`${match.url}/props-v-state`}>
              Props v. State
            </Link>
          </li>
        </ul>
      </div>
    );
  }

  render () {
    const { match } = this.props;
    return (
      <div>
        <h2>Series</h2>

        <Route path={`${match.url}/:seriesId`} component={this.renderSeries} />
        <Route exact path={match.url} render={this.renderSelect} />
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
