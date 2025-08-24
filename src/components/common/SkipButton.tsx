import BoolButton from "./BoolButton";
import { ACTIONS } from "../../consts";
import { IIssue } from "../../interfaces";

interface IProps {
  issue: IIssue;
  value: boolean;
}

export default function SkipButton({ issue, value }: IProps) {
  return (
    <BoolButton
      actions={[ACTIONS.SKIP, ACTIONS.UNSKIP]}
      issue={issue}
      icons={["double-right", "close"]}
      langs={["Skip", "Unskip"]}
      value={value}
    />
  );
}
