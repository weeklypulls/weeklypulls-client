import React, { Component } from 'react';
import { observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';

import LoginForm from './LoginForm';

@autoBindMethods
@observer
class LoginPage extends Component<any> {
  render () {
    return <LoginForm {...this.props} />;
  }
}

export default LoginPage;
