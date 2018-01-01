import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import autoBindMethods from 'class-autobind-decorator';
import httpStatus from 'http-status-codes';
import _ from 'lodash';

import { Link } from 'react-router-dom';

import SeriesForm from './forms/seriesForm';

@autoBindMethods
@observer
class Pull extends Component {
  @observable isLoading = true;

  constructor (props) {
    super(props);
  }

  componentWillMount () {
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
      if (_.get(e, 'response.status') === httpStatus.UNAUTHORIZED) {
        this.props.history.push('/login');
      }
    }
  }

  render () {
    if (this.isLoading) {
      return 'Loading...';
    }

    const { match, store } = this.props
      , pullId = match.params.pullId
      , series = store.pullWithApi(pullId);

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

export default Pull;
