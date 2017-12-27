import React, { Component } from 'react';
import { observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';

@autoBindMethods
@observer
class LoginPage extends Component {
  render () {
    return (
      <div>
        <h2>Log in</h2>
      </div>
    );
  }
}

export default LoginPage;
