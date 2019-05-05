import React, { Component } from 'react';
import { observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';
import _ from 'lodash';

import { message, Form, Select, Modal } from 'antd';

import Store from '../../../store';

const FormItem = Form.Item;
const Option = Select.Option;

interface IProps {
  pull: any;
  onClose: () => void;
}

interface IWrappedProps extends IProps {
  form: any;
}

interface IInjected extends IWrappedProps {
  store: Store;
}

@inject('store')
@autoBindMethods
@observer
class UnwrappedPullFormModal extends Component<IWrappedProps> {
  @observable isSubmitting = false;
  private isLoading = false;

  public static defaultProps = {
    onClose: _.noop,
  };

  componentDidMount () {
    this.fetchPullLists();
  }

  private get injected () {
    return this.props as IInjected;
  }

  async fetchPullLists () {
    await this.injected.store.pullLists.listIfCold();
    this.isLoading = false;
  }

  handleSubmit (e: any) {
    this.isSubmitting = true;
    const { pull, store, form, onClose } = this.injected;

    e.preventDefault();
    form.validateFields(async (err: any, values: any) => {
      try {
        if (pull.id) {
          await store.pulls.patch(pull.id, values);
        }
        else {
          await store.pulls.post({ ...values, series_id: pull.series_id });
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
    const { form, store, pull } = this.injected;

    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem
          label='Pull List'
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 12 }}
        >

          {form.getFieldDecorator('pull_list_id', { initialValue: pull.pull_list_id })(
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
    const { onClose, pull, store } = this.injected
      , title = _.get(store.series.get(pull.series_id), 'title', 'PullDetail');

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
}

const WrappedPullFormModal = Form.create()(UnwrappedPullFormModal);


@autoBindMethods
@observer
export class PullFormModal extends Component<IProps> {
  public render () {
    return <WrappedPullFormModal {...this.props} />;
  }
}


export default PullFormModal;
