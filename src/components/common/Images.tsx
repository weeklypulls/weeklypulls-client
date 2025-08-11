import { Popover } from "antd";
import React from "react";
import { PictureOutlined } from "@ant-design/icons";

interface IProps {
  images: string[];
}

export default function Images({ images }: IProps): JSX.Element {
  return (
    <>
      {images.map((image) => (
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
      ))}
    </>
  );
}
