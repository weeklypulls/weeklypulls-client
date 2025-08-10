import autoBindMethods from "class-autobind-decorator";
import { observer } from "mobx-react";
import React, { Component } from "react";
import { observable } from "mobx";

import { Button } from "antd";

import SmartBool from "@mighty-justice/smart-bool";
import { FormModal, FormDrawer } from "@mighty-justice/fields-ant";
import { ISharedFormModalProps } from "@mighty-justice/fields-ant/dist/props";

interface IProps {
  label: string;
  modalComponent: new (props: ISharedFormModalProps) => FormModal | FormDrawer;
  modalProps: any;
}

@autoBindMethods
@observer
class ModalButton extends Component<IProps> {
  @observable private isVisible = new SmartBool();

  public render() {
    const { modalComponent: ModalComponent, modalProps, label } = this.props;

    return (
      <>
        <Button onClick={this.isVisible.setTrue}>{label}</Button>
        <ModalComponent {...modalProps} isVisible={this.isVisible} />
      </>
    );
  }
}

export default ModalButton;
