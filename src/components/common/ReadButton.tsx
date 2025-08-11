import React from "react";

import BoolButton from "./BoolButton";
import { ACTIONS } from "../../consts";
import { IComic } from "../../interfaces";

interface IProps {
  comic: IComic;
  value: boolean;
}

export default function ReadButton({ comic, value }: IProps) {
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
