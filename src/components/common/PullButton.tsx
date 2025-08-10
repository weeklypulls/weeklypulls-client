import { FormModal } from "@mighty-justice/fields-ant";
import autoBindMethods from "class-autobind-decorator";
import _ from "lodash";
import { inject, observer } from "mobx-react";
import React, { Component } from "react";

// Use ModalButton wrapper for form modals
import ModalButton from "./ModalButton";
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
class PullButton extends Component<IProps> {
  private get injected() {
    return this.props as IInjected;
  }

  public render() {
    const { pull, comic, store } = this.injected,
      { series_id } = comic;

    if (pull) {
      return _.get(store.pullLists.get(pull.pull_list_id), "title", "--");
    }

    return (
      <span>
        <ModalButton
          label="Pull"
          modalComponent={FormModal}
          modalProps={{
            fieldSets: [
              [
                {
                  field: "pull_list_id",
                  optionType: "pullLists",
                  type: "optionSelect",
                },
                {
                  field: "series_id",
                  type: "hidden",
                },
              ],
            ],
            model: { series_id },
            onSave: store.pulls.post,
            title: "Add to pull list",
          }}
        />
      </span>
    );
  }
}

export default PullButton;
