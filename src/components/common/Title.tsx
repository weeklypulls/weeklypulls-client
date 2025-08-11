import { Col, Row, Button } from "antd";
import React, { PropsWithChildren } from "react";

interface IProps {
  title: string;
}

export const COL_SPAN_TITLE = 20;
export const COL_SPAN_BUTTON = 4;

export default function Title({ title, children }: PropsWithChildren<IProps>) {
  return (
    <Row justify="space-between" align="top">
      <Col span={COL_SPAN_TITLE}>
        <h2>{title}</h2>
      </Col>
      <Col span={COL_SPAN_BUTTON} style={{ textAlign: "right" }}>
        <Button.Group>{children}</Button.Group>
      </Col>
    </Row>
  );
}
