import React, { Component } from "react";
import { RouteComponentProps } from "react-router";
import { inject, observer } from "mobx-react";
import autoBindMethods from "class-autobind-decorator";

import { FormModal, Table } from "@mighty-justice/fields-ant";

import Store from "../../store";
import Title from "../common/Title";
import ModalButton from "../common/ModalButton";
import { IModel } from "@mighty-justice/fields-ant/dist/props";

interface IInjected extends RouteComponentProps {
  store: Store;
}

@inject("store")
@autoBindMethods
@observer
class PagePullLists extends Component<RouteComponentProps> {
  private get injected() {
    return this.props as IInjected;
  }
  private onAddNew(data: IModel) {
    console.log(data);
  }

  public render() {
    const all = this.injected.store.resources.pullLists.all,
      fieldSets = [[{ field: "title" }]];

    return (
      <>
        <Title title="Pull Lists">
          <ModalButton
            label="Add new"
            modalComponent={FormModal}
            modalProps={{
              fieldSets,
              onSave: this.onAddNew,
              title: "Add Pull List",
            }}
          />
        </Title>

        <Table model={all} fieldSets={fieldSets} />
      </>
    );
  }
}

export default PagePullLists;
