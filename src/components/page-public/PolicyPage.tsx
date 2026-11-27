import { Typography } from "antd";
import type { ReactNode } from "react";

export const CONTACT_EMAIL = "support@weeklypulls.com";

export function Contact() {
  return <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
}

export default function PolicyPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <Typography style={{ maxWidth: 720, margin: "0 auto", padding: "24px 0 48px" }}>
      <Typography.Title>{title}</Typography.Title>
      <Typography.Paragraph type="secondary">Last updated {updated}</Typography.Paragraph>
      {children}
    </Typography>
  );
}
