import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import autoBindMethods from 'class-autobind-decorator';
import httpStatus from 'http-status-codes';
import _ from 'lodash';

import { Link } from 'react-router-dom';

@autoBindMethods
@observer
class PullSelect extends Component {
  @observable isLoading = true;

  constructor (props) {
    super(props);
    this.getAllSeries();
  }

  async getAllSeries () {
    try {
      await this.props.store.getAllSeries();
      this.isLoading = false;
    }
    catch (e) {
      if (_.get(e, 'response.status') === httpStatus.UNAUTHORIZED) {
        this.props.history.push('/login');
      }
    }
  }

  render () {
    const { match, store } = this.props;

    if (this.isLoading) {
      return `Loadin2g... ${this.isLoading}`;
    }

    return (
      <div>
        <h3>Please select a series.</h3>

        <ul>
          {store.pullsWithApi.map(pull => (
            <li key={pull.id}>
              <Link to={`${match.url}/${pull.id}`}>
                {pull.api.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  static propTypes = {
    history: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
  }
}

export default PullSelect;
