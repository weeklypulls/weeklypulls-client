import { Button } from "antd";
import autoBindMethods from "class-autobind-decorator";
import { inject, observer } from "mobx-react";
import React, { Component } from "react";
import { CheckOutlined, CloseOutlined, DoubleRightOutlined } from "@ant-design/icons";

import { IComic } from "../../interfaces";
import Store from "../../store";

const ICON_MAP: { [key: string]: React.ReactNode } = {
  check: <CheckOutlined />,
  close: <CloseOutlined />,
  "double-right": <DoubleRightOutlined />,
};

interface IProps {
  actions: [string, string];
  comic: IComic;
  icons: [string, string];
  langs: [string, string];
  value: boolean;
}

interface IInjected extends IProps {
  store: Store;
}

@inject("store")
@autoBindMethods
@observer
class BoolButton extends Component<IProps> {
  private get injected() {
    return this.props as IInjected;
  }

  public mark() {
    const {
        actions,
        comic: { id, series_id },
        store,
        value,
      } = this.injected,
      action = actions[value ? 1 : 0];

    store.mark(series_id, id, action);
  }

  public render() {
    const { value, langs, icons } = this.props,
      iconKey = icons[value ? 1 : 0],
      lang = langs[value ? 1 : 0];
    return (
      <Button
        className="action-button"
        size="small"
        onClick={this.mark}
        icon={ICON_MAP[iconKey]}
        title={lang}
      />
    );
  }
}

export default BoolButton;
