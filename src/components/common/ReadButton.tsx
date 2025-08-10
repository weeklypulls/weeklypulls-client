import autoBindMethods from "class-autobind-decorator";
import { observer } from "mobx-react";
import React, { Component } from "react";

import BoolButton from "./BoolButton";
import { ACTIONS } from "../../consts";
import { IComic } from "../../interfaces";

interface IProps {
  comic: IComic;
  value: boolean;
}

@autoBindMethods
@observer
class ReadButton extends Component<IProps> {
  public render() {
    const { comic, value } = this.props;
    return (
      <BoolButton
        actions={[ACTIONS.READ, ACTIONS.UNREAD]}
        comic={comic}
        icons={["check", "close"]}
        langs={["Mark read", "Mark unread"]}
        value={value}
      />
    );
  }
}

export default ReadButton;
