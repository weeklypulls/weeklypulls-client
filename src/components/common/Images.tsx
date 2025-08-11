import { Popover } from "antd";
import autoBindMethods from "class-autobind-decorator";
import { observer } from "mobx-react";
import React, { Component } from "react";
import { PictureOutlined } from "@ant-design/icons";

interface IProps {
  images: string[];
}

@autoBindMethods
@observer
class Images extends Component<IProps> {
  public render() {
    const { images } = this.props;

    return images.map((image) => (
      <Popover
        content={<img className="cover" alt="Cover" src={image} />}
        key={image}
        placement="bottom"
      >
        <a
          title={image}
          className="action-button"
          href={image}
          rel="noopener noreferrer"
          style={{ marginLeft: "2px" }}
          target="_blank"
        >
          <PictureOutlined />
        </a>
      </Popover>
    ));
  }
}

export default Images;
