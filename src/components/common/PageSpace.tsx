import { Space } from "antd";
import { PropsWithChildren } from "react";

export default function PageSpace({ children }: PropsWithChildren<{}>) {
  return (
    <Space direction="vertical" size="large" style={{ display: "flex" }}>
      {children}
    </Space>
  );
}
