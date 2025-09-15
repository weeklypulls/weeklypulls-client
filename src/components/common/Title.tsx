import { Flex } from "antd";
import { PropsWithChildren } from "react";

interface IProps {
  title: string;
  /* Allow consumer to opt into wrapping if they have many small buttons */
  allowWrapButtons?: boolean;
}

export default function Title({ title, children, allowWrapButtons }: PropsWithChildren<IProps>) {
  return (
    <Flex align="center" justify="space-between" gap={12}>
      <h2 style={{ margin: 0, flex: "1 1 auto", minWidth: 0, whiteSpace: "nowrap" }}>{title}</h2>
      <Flex
        gap={8}
        wrap={allowWrapButtons ? "wrap" : "nowrap"}
        style={{
          flex: "0 0 auto",
          overflowX: allowWrapButtons ? "visible" : "auto",
          paddingBottom: 2,
          /* hide scrollbar in WebKit when not needed */
          scrollbarWidth: "none",
        }}
      >
        {children}
      </Flex>
    </Flex>
  );
}
