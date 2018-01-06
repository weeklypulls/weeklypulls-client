import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';
import _ from 'lodash';

import { message, Form, Select, Modal } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

@autoBindMethods
@observer
class SeriesFormModal extends Component {
  @observable isSubmitting = false;

  componentDidMount () {
    this.fetchPullLists();
  }

  async fetchPullLists () {
    await this.props.store.pullLists.list();
    this.isLoading = false;
  }

  handleSubmit (e) {
    this.isSubmitting = true;
    const { data, store, form, onClose } = this.props;

    e.preventDefault();
    form.validateFields(async (err, values) => {
      try {
        if (data.id) {
          await store.pulls.patch(data.id, values);
        }
        else {
          await store.pulls.post({ ...values, series_id: data.series_id });
        }

        message.success('Updated!');
        onClose();
      }
      catch (e) {
        message.error('Error. See console.');
        // eslint-disable-next-line no-console
        console.error(e);
      }
      finally {
        this.isSubmitting = false;
      }
    });
  }

  renderLoading () {
    return 'Loading...';
  }

  renderForm () {
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
              {store.pullLists.all.map(pullList => (
                <Option key={pullList.id} value={pullList.id}>{pullList.title}</Option>
              ))}
            </Select>
          )}

        </FormItem>
      </Form>
    );
  }

  render () {
    const { data, onClose } = this.props
      , title = _.get(data, 'api.title', 'Pull');

    return (
      <Modal
        title={`Editing ${title}`}
        confirmLoading={this.isSubmitting}
        onCancel={onClose}
        onOk={this.handleSubmit}
        visible
      >
        {this.isLoading ? this.renderLoading() : this.renderForm()}
      </Modal>
    );
  }

  static defaultProps = {
    onClose: _.noop,
  }

  static propTypes = {
    data: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
    onClose: PropTypes.func,
  }
}

const WrappedSeriesFormModal = Form.create()(SeriesFormModal);

export default WrappedSeriesFormModal;
