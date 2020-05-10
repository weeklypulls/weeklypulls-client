import React, { Component } from 'react';
import autoBindMethods from 'class-autobind-decorator';
import { observer } from 'mobx-react';
import { Button } from 'antd';
import { ButtonProps } from 'antd/lib/button/button';

import SmartBool from '@mighty-justice/smart-bool';

interface IProps extends ButtonProps {
  onClick: () => Promise<any> | any;
}

@autoBindMethods
@observer
class LoadingButton extends Component<IProps> {
  private isLoading = new SmartBool();

  private async onClick () {
    await this.isLoading.until(this.props.onClick());
  }

  public render () {
    return (
      <Button
        {...this.props}
        loading={this.isLoading.isTrue}
        onClick={this.onClick}
      >
        {this.props.children}
      </Button>
    );
  }
}

export default LoadingButton;
