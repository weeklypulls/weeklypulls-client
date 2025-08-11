import { Button } from "antd";
import type { ButtonProps } from "antd";
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
    const { children, ...rest } = this.props;
    return (
      <Button {...rest} loading={this.state.isLoading} onClick={this.onClick}>
        {children}
      </Button>
    );
  }
}

export default LoadingButton;
