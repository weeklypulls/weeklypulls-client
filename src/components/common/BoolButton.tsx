import { CheckOutlined, CloseOutlined, DoubleRightOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React, { useCallback } from "react";

import { IComic } from "../../interfaces";
import { useMarkIssue } from "../../queries";

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

export default function BoolButton({ actions, comic, icons, langs, value }: IProps) {
  const markMutation = useMarkIssue();
  const mark = useCallback(() => {
    const action = actions[value ? 1 : 0];
    markMutation.mutate({ seriesId: comic.series_id, issueId: comic.id, actionKey: action });
  }, [actions, comic.id, comic.series_id, markMutation, value]);

  const iconKey = icons[value ? 1 : 0];
  const lang = langs[value ? 1 : 0];
  return (
    <Button
      className="action-button"
      size="small"
      onClick={mark}
      icon={ICON_MAP[iconKey]}
      title={lang}
      loading={markMutation.isPending}
    />
  );
}
