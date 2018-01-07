import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autoBindMethods from 'class-autobind-decorator';
import { observer, inject } from 'mobx-react';
import { Link } from 'react-router-dom';


@inject('store')
@autoBindMethods
@observer
class PullListLink extends Component {
  render () {
    const { store, pullListId, pullId } = this.props
      , pullList = store.pullLists.get(pullListId);

    if (!pullList) { return '--'; }

    return <Link to={`/pulls/${pullId}`}>{pullList.title}</Link>;
  }

  static propTypes = {
    store: PropTypes.object.isRequired,
    pullId: PropTypes.string.isRequired,
    pullListId: PropTypes.string.isRequired,
  }
}

export default PullListLink;
