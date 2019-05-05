import React, { Component } from 'react';
import { observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';
import { Route, RouteComponentProps } from 'react-router-dom';

import PullsDetail from './PullsDetail';
import PullsList from './PullsList';

interface IProps extends RouteComponentProps {
  match: any;
}

@autoBindMethods
@observer
class SeriesListPage extends Component<IProps> {
  renderPull (props: IProps) {
    return <PullsDetail {...this.props} {...props} />;
  }

  renderPullsList (props: IProps) {
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
}

export default SeriesListPage;
