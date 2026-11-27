import type { ReactNode } from "react";

// Centered narrow column for the logged-out account pages.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 64 }}>
      <div style={{ maxWidth: 400, width: "100%" }}>{children}</div>
    </div>
  );
}
