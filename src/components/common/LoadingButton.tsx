import React, { Component } from 'react';
import autoBindMethods from 'class-autobind-decorator';
import { observer } from 'mobx-react';
import { Button } from 'antd';

import SmartBool from '@mighty-justice/smart-bool';

interface IProps {
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
        loading={this.isLoading.isTrue}
        onClick={this.onClick}
      >
        {this.props.children}
      </Button>
    );
  }
}

export default LoadingButton;
