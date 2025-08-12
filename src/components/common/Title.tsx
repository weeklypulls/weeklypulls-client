import { Space } from "antd";
import { PropsWithChildren } from "react";

interface IProps {
  title: string;
  /* Allow consumer to opt into wrapping if they have many small buttons */
  allowWrapButtons?: boolean;
}

export default function Title({ title, children, allowWrapButtons }: PropsWithChildren<IProps>) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "nowrap",
        marginBottom: 16,
        minWidth: 0,
      }}
    >
      <h2 style={{ margin: 0, flex: "1 1 auto", minWidth: 0, whiteSpace: "nowrap" }}>{title}</h2>
      <div
        style={{
          display: "flex",
          flex: "0 0 auto",
          gap: 8,
          flexWrap: allowWrapButtons ? "wrap" : "nowrap",
          overflowX: allowWrapButtons ? "visible" : "auto",
          paddingBottom: 2,
          /* hide scrollbar in WebKit when not needed */
          scrollbarWidth: "none",
        }}
      >
        <Space
          size="small"
          wrap={allowWrapButtons}
          style={{ flexWrap: allowWrapButtons ? "wrap" : "nowrap" }}
        >
          {children}
        </Space>
      </div>
    </div>
  );
}
