import { Col, Row, Button } from "antd";
import autoBindMethods from "class-autobind-decorator";
import { observer } from "mobx-react";
import React, { Component } from "react";

interface IProps {
  title: string;
}

export const COL_SPAN_TITLE = 20;
export const COL_SPAN_BUTTON = 4;

@autoBindMethods
@observer
class Title extends Component<IProps> {
  public render() {
    return (
      <Row justify="space-between" align="top">
        <Col span={COL_SPAN_TITLE}>
          <h2>{this.props.title}</h2>
        </Col>
        <Col span={COL_SPAN_BUTTON} style={{ textAlign: "right" }}>
          <Button.Group>{this.props.children}</Button.Group>
        </Col>
      </Row>
    );
  }
}

export default Title;
