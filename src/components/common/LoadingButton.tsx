import { Button } from "antd";
import type { ButtonProps } from "antd";
import { useCallback, useState } from "react";

interface IProps extends ButtonProps {
  onClick: () => void | Promise<unknown>;
}

export default function LoadingButton({ children, onClick, ...rest }: IProps) {
  const [isLoading, setIsLoading] = useState(false);
  const handleClick = useCallback(async () => {
    try {
      setIsLoading(true);
      await onClick();
    } finally {
      setIsLoading(false);
    }
  }, [onClick]);

  return (
    <Button {...rest} loading={isLoading} onClick={handleClick}>
      {children}
    </Button>
  );
}
