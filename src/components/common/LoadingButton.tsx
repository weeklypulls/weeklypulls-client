import { Button } from "antd";
import { ButtonProps } from "antd/lib/button/button";
import autoBindMethods from "class-autobind-decorator";
import { observer } from "mobx-react";
import React, { Component } from "react";

interface IProps extends ButtonProps {
  onClick: () => Promise<any> | any;
}

@autoBindMethods
@observer
class LoadingButton extends Component<IProps> {
  state = { isLoading: false } as { isLoading: boolean };

  private async onClick() {
    try {
      this.setState({ isLoading: true });
      await this.props.onClick();
    } finally {
      this.setState({ isLoading: false });
    }
  }

  public render() {
    return (
      <Button {...this.props} loading={this.state.isLoading} onClick={this.onClick}>
        {this.props.children}
      </Button>
    );
  }
}

export default LoadingButton;
