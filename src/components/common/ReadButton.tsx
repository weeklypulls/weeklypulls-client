import BoolButton from "./BoolButton";
import { ACTIONS } from "../../consts";
import { ComicLike } from "../../interfaces";

interface IProps {
  comic: ComicLike;
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
