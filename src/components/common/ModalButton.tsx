import { FormModal, FormDrawer } from "@mighty-justice/fields-ant";
import { Button } from "antd";
import autoBindMethods from "class-autobind-decorator";
import { observable, action } from "mobx";
import { observer } from "mobx-react";
import React, { Component } from "react";

interface IProps {
  label: string;
  modalComponent: React.ComponentType<any> | (new (props: any) => FormModal | FormDrawer);
  modalProps: any;
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
    const { modalComponent: ModalComponent, modalProps, label } = this.props;

    return (
      <>
        <Button onClick={this.open}>{label}</Button>
        <ModalComponent {...modalProps} isVisible={this.isVisible} onCancel={this.close} />
      </>
    );
  }
}

export default ModalButton;
