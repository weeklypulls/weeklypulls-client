import { Button, Modal } from "antd";
import React, { ReactNode, useCallback, useState } from "react";

interface IProps {
  label: string;
  // Pass children as a function receiving close() to render modal body
  render?: (onClose: () => void) => ReactNode;
  title?: string;
}

export default function ModalButton({ label, render, title }: IProps) {
  const [isVisible, setIsVisible] = useState(false);
  const open = useCallback(() => setIsVisible(true), []);
  const close = useCallback(() => setIsVisible(false), []);

  return (
    <>
      <Button onClick={open}>{label}</Button>
      <Modal open={isVisible} onCancel={close} onOk={close} title={title}>
        {render ? render(close) : null}
      </Modal>
    </>
  );
}
