import { Button, Input, Modal, Select } from "antd";
import autoBindMethods from "class-autobind-decorator";
import { inject, observer } from "mobx-react";
import React, { Component } from "react";

import { IComic, IPull } from "../../interfaces";
import Store from "../../store";

interface IProps {
  comic: IComic;
  pull: IPull | undefined;
}

interface IInjected extends IProps {
  store: Store;
}

@inject("store")
@autoBindMethods
@observer
class PullButton extends Component<IProps, { visible: boolean; pull_list_id?: number }> {
  public state = { visible: false, pull_list_id: undefined };

  private get injected() {
    return this.props as IInjected;
  }

  private open = () => this.setState({ visible: true });
  private close = () => this.setState({ visible: false });
  private submit = async () => {
    const { store } = this.injected;
    const { series_id } = this.injected.comic;
    const { pull_list_id } = this.state;
    if (!pull_list_id) return;
    await store.pulls.post({ pull_list_id, series_id });
    this.setState({ visible: false, pull_list_id: undefined });
  };

  public render() {
    const { pull, comic, store } = this.injected,
      { series_id } = comic,
      { visible, pull_list_id } = this.state;

    if (pull) {
      const pl = store.pullLists.get(pull.pull_list_id);
      return (pl && pl.title) || "--";
    }

    return (
      <span>
        <Modal visible={visible} title="Add to pull list" onCancel={this.close} onOk={this.submit}>
          <div style={{ marginBottom: 12 }}>
            <label
              htmlFor={`pull-series-${series_id}`}
              style={{ display: "block", marginBottom: 4 }}
            >
              Series
            </label>
            <Input id={`pull-series-${series_id}`} value={series_id} disabled />
          </div>
          <div>
            <label htmlFor={`pull-list-${series_id}`} style={{ display: "block", marginBottom: 4 }}>
              Pull List
            </label>
            <Select
              id={`pull-list-${series_id}`}
              value={pull_list_id}
              onChange={(val: number) => this.setState({ pull_list_id: val })}
              style={{ width: "100%" }}
              placeholder="Select a pull list"
            >
              {store.pullLists.all.map((pl: any) => (
                <Select.Option key={pl.id} value={pl.id}>
                  {pl.title}
                </Select.Option>
              ))}
            </Select>
          </div>
        </Modal>

        <Button onClick={this.open}>Pull</Button>
      </span>
    );
  }
}

export default PullButton;
