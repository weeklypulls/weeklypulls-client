import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';
import { RouteComponentProps } from 'react-router';

import { FormCard } from '@mighty-justice/fields-ant';

import LoginForm from './LoginForm';
import { message } from 'antd';
import Store from '../../store';


interface IProps extends RouteComponentProps {
  form: any;
  store: Store;
}

@inject('store')

@autoBindMethods
@observer
class LoginPage extends Component<any> {
  private async onSave (model: any) {
    await this.props.store.client.login(model.username, model.password);
    this.props.history.push('/');
  }

  public render () {
    return (
      <div className='login-form'>
        <FormCard
          fieldSets={[[
            {field: 'username', required: true},
            {field: 'password', required: true},
          ]]}
          title='Log in'
          onSave={this.onSave}
          blockSubmit
          saveText='Submit'
        />
      </div>
    );
  }
}

export default LoginPage;
