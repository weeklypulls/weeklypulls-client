import { Button, Input, Typography } from "antd";
import { useContext, useState } from "react";

import { apiErrorMessages } from "../../apiErrors";
import type { StoreApi } from "../../store";
import { StoreContext } from "../../storeContext";

// Not a <form>: it's shown inside the login form, and forms can't nest.
export default function ResendVerification({ initialEmail = "" }: { initialEmail?: string }) {
  const store = useContext<StoreApi>(StoreContext);
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const resend = async () => {
    setLoading(true);
    setResult(null);
    try {
      await store.client.resendVerification(email);
      // The API answers the same whether or not the address exists.
      setResult({
        ok: true,
        text: "If that address is waiting to be verified, a new link is on its way.",
      });
    } catch (err) {
      setResult({ ok: false, text: apiErrorMessages(err, "Couldn't send the email.").join(" ") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 8 }}>
      <Input
        type="email"
        placeholder="you@example.com"
        aria-label="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onPressEnter={(e) => {
          e.preventDefault();
          if (email) void resend();
        }}
      />
      <Button onClick={resend} loading={loading} disabled={!email} style={{ marginTop: 8 }}>
        Resend link
      </Button>
      {result && (
        <Typography.Text
          type={result.ok ? "success" : "danger"}
          style={{ display: "block", marginTop: 4 }}
        >
          {result.text}
        </Typography.Text>
      )}
    </div>
  );
}
