import React, { Component } from 'react';
import { observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';
import { RouteComponentProps } from 'react-router';

import Comics from './ComicsList';

interface IProps extends RouteComponentProps {
}

@observer
@autoBindMethods
class ComicsListPage extends Component<IProps> {
  render () {
    return <Comics {...this.props} />;
  }
}

export default ComicsListPage;
