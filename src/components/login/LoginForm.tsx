import React, { Component } from 'react';
import autoBindMethods from 'class-autobind-decorator';
import _ from 'lodash';
import { inject } from 'mobx-react';
import { RouteComponentProps } from 'react-router';

import { message, Form, Icon, Input, Button, Checkbox } from 'antd';

import Store from '../../store';

const FormItem = Form.Item;

interface IProps extends RouteComponentProps {
  form: any;
  store: Store;
}

@inject('store')
@autoBindMethods
class LoginForm extends Component<IProps> {
  public handleSubmit (e: any) {
    e.preventDefault();

    this.props.form.validateFields(async (err: any, values: any) => {
      if (!err) {
        try {
          await this.props.store.client.login(values.userName, values.password);
          message.success('Welcome, true believer!');
          this.props.history.push('/');
        }
        catch (e) {
          const error = _.get(e, 'response.data.non_field_errors[0]', 'Error');
          message.error(error);
        }
      }
    });
  }

  public render () {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} className='login-form'>
        <h2>Log in</h2>
        <FormItem>
          {getFieldDecorator('userName', {
            rules: [{ required: true, message: 'Please input your username!' }],
          })(
            <Input prefix={<Icon type='user' style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder='Username' />,
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: 'Please input your Password!' }],
          })(
            <Input
              placeholder='Password'
              prefix={<Icon type='lock' style={{ color: 'rgba(0,0,0,.25)' }} />}
              type='password'
            />,
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('remember', {
            initialValue: true,
            valuePropName: 'checked',
          })(
            <Checkbox>Remember me</Checkbox>,
          )}
          <Button className='login-form-forgot' size='small'>Forgot password</Button>
          <Button type='primary' htmlType='submit' className='login-form-button'>
            Log in
          </Button>
          Or <Button size='small' href=''>register now!</Button>
        </FormItem>
      </Form>
    );
  }
}

const WrappedLoginForm = Form.create()(LoginForm);

export default WrappedLoginForm;
