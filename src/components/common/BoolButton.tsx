import { CheckOutlined, CloseOutlined, DoubleRightOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React, { useCallback } from "react";

import { IIssue } from "../../interfaces";
import { useMarkIssue } from "../../queries";

const ICON_MAP: { [key: string]: React.ReactNode } = {
  check: <CheckOutlined />,
  close: <CloseOutlined />,
  "double-right": <DoubleRightOutlined />,
};

interface IProps {
  actions: [string, string];
  issue: IIssue;
  icons: [string, string];
  langs: [string, string];
  value: boolean;
}

export default function BoolButton({ actions, issue, icons, langs, value }: IProps) {
  const markMutation = useMarkIssue();
  const mark = useCallback(() => {
    const action = actions[value ? 1 : 0];
    const seriesId = issue.volume.id;
    const pullId = issue.pull?.id || undefined;
    markMutation.mutate({ seriesId, issueId: issue.id, actionKey: action, pullId });
  }, [actions, issue.id, issue.volume.id, issue.pull?.id, markMutation, value]);

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
