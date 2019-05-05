import React, { Component } from 'react';
import { observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';
import { RouteComponentProps } from 'react-router';

import Comics from './ComicsList';

@observer
@autoBindMethods
class ComicsListPage extends Component<RouteComponentProps> {
  public render () {
    return <Comics {...this.props} />;
  }
}

export default ComicsListPage;
