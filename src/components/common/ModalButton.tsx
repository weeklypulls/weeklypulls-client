import { Button, Modal } from "antd";
import autoBindMethods from "class-autobind-decorator";
import { action, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import React, { Component, ReactNode } from "react";

interface IProps {
  label: string;
  // Pass children as a function receiving close() to render modal body
  render?: (onClose: () => void) => ReactNode;
  title?: string;
}

@autoBindMethods
@observer
class ModalButton extends Component<IProps> {
  @observable private isVisible = false;

  @action.bound private open() {
    this.isVisible = true;
  }
  @action.bound private close() {
    this.isVisible = false;
  }

  public render() {
    const { label, render, title } = this.props;

    return (
      <>
        <Button onClick={this.open}>{label}</Button>
        <Modal visible={this.isVisible} onCancel={this.close} onOk={this.close} title={title}>
          {render ? render(this.close) : null}
        </Modal>
      </>
    );
  }
}

export default ModalButton;
