import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router';
import { inject, observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';

import { Table } from '@mighty-justice/fields-ant';
import SmartBool from '@mighty-justice/smart-bool';

import Store from '../../store';
import { Button } from 'antd';

interface IInjected extends RouteComponentProps {
  store: Store;
}

interface ISmartButton {
  onClick: () => Promise<any> | any;
}

@autoBindMethods
@observer
class SmartButton extends Component<ISmartButton> {
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

@inject('store')
@autoBindMethods
@observer
class PageResources extends Component<RouteComponentProps> {
  private get injected () {
    return this.props as IInjected;
  }

  private renderClickable (value: string) {
    const resource = this.injected.store.resources[value];

    if (!resource) { return '--'; }

    return (
      <SmartButton onClick={resource.clear}>Clear</SmartButton>
    );
  }

  public render () {
    const model = Object.keys(this.injected.store.resources)
      .map(key => ({
        clearKey: key,
        key,
        cachedValues: this.injected.store.resources[key].all.length,
      }));

    return (
      <Table
        model={model}
        fieldSets={[[
          { field: 'key' },
          { field: 'clearKey', render: this.renderClickable },
          { field: 'cachedValues' },
        ]]}
      />
    );
  }
}

export default PageResources;
