import { Button, type ButtonProps } from "antd";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";

// A link that looks like a button. Renders a real <a href> (so it can be
// opened in a new tab and reads as a link), but navigates client-side.
// Use instead of nesting a <Button> inside a <Link>, which is invalid HTML.
export default function ButtonLink({ to, ...props }: Omit<ButtonProps, "href"> & { to: string }) {
  const navigate = useNavigate();
  const onClick = (e: MouseEvent<HTMLElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    void navigate(to);
  };
  return <Button {...props} href={to} onClick={onClick} />;
}
