import { Button } from "antd";
import { observer } from "mobx-react";
import React, { useCallback, useContext } from "react";
import { CheckOutlined, CloseOutlined, DoubleRightOutlined } from "@ant-design/icons";

import { IComic } from "../../interfaces";
import Store from "../../store";
import { StoreContext } from "../../storeContext";

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

export default observer(function BoolButton({ actions, comic, icons, langs, value }: IProps) {
  const store = useContext<Store>(StoreContext);
  const mark = useCallback(() => {
    const action = actions[value ? 1 : 0];
    store.mark(comic.series_id, comic.id, action);
  }, [actions, comic.id, comic.series_id, store, value]);

  const iconKey = icons[value ? 1 : 0];
  const lang = langs[value ? 1 : 0];
  return (
    <Button
      className="action-button"
      size="small"
      onClick={mark}
      icon={ICON_MAP[iconKey]}
      title={lang}
    />
  );
});
