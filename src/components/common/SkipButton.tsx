import React from "react";

import BoolButton from "./BoolButton";
import { ACTIONS } from "../../consts";
import { IComic } from "../../interfaces";

interface IProps {
  comic: IComic;
  value: boolean;
}

export default function SkipButton({ comic, value }: IProps) {
  return (
    <BoolButton
      actions={[ACTIONS.SKIP, ACTIONS.UNSKIP]}
      comic={comic}
      icons={["double-right", "close"]}
      langs={["Skip", "Unskip"]}
      value={value}
    />
  );
}
