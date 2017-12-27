import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autoBindMethods from 'class-autobind-decorator';
import _ from 'lodash';

import { message, Form, Icon, Input, Button, Checkbox } from 'antd';
const FormItem = Form.Item;


@autoBindMethods
class NormalLoginForm extends Component {
  handleSubmit (e) {
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
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

  render () {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} className='login-form'>
        <h2>Log in</h2>
        <FormItem>
          {getFieldDecorator('userName', {
            rules: [{ required: true, message: 'Please input your username!' }],
          })(
            <Input prefix={<Icon type='user' style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder='Username' />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: 'Please input your Password!' }],
          })(
            <Input prefix={<Icon type='lock' style={{ color: 'rgba(0,0,0,.25)' }} />} type='password' placeholder='Password' />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('remember', {
            valuePropName: 'checked',
            initialValue: true,
          })(
            <Checkbox>Remember me</Checkbox>
          )}
          <a className='login-form-forgot' href=''>Forgot password</a>
          <Button type='primary' htmlType='submit' className='login-form-button'>
            Log in
          </Button>
          Or <a href=''>register now!</a>
        </FormItem>
      </Form>
    );
  }

  static propTypes = {
    history: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
  }
}

const WrappedNormalLoginForm = Form.create()(NormalLoginForm);

export default WrappedNormalLoginForm;
