import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';
import { Redirect, RouteComponentProps } from 'react-router';

import Store from '../../store';

interface IProps extends RouteComponentProps {
  store: Store;
}

@inject('store')
@autoBindMethods
@observer
class PageLogout extends Component<IProps> {
  public constructor (props: IProps) {
    super(props);
    this.props.store.logout();
  }

  public render () {
    return (
      <Redirect to={{ pathname: '/login' }} />
    );
  }
}

export default PageLogout;
