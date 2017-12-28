import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autoBindMethods from 'class-autobind-decorator';

import { message, Form, Select, Button } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

@autoBindMethods
class SeriesForm extends Component {
  handleSubmit (e) {
    const { data, store, form } = this.props;

    e.preventDefault();
    form.validateFields(async (err, values) => {
      try {
        await store.updateSeries(data.id, values);
        message.success('Updated!');
      }
      catch (e) {
        message.error('Error. See console.');
        // eslint-disable-next-line no-console
        console.error(e);
      }
    });
  }

  render () {
    const { form, store, data } = this.props;

    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem
          label='Pull List'
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 12 }}
        >

          {form.getFieldDecorator('pull_list_id', { initialValue: data.pull_list_id })(
            <Select>
              {store.pullLists.map(pullList => (
                <Option key={pullList.id} value={pullList.id}>{pullList.title}</Option>
              ))}
            </Select>
          )}

        </FormItem>

        <FormItem wrapperCol={{ span: 12, offset: 5 }}>
          <Button type='primary' htmlType='submit'>Submit</Button>
        </FormItem>
      </Form>
    );
  }

  static propTypes = {
    data: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
  }
}

const WrappedSeriesForm = Form.create()(SeriesForm);

export default WrappedSeriesForm;
