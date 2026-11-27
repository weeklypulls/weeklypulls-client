import { Button, Card, Result, Spin } from "antd";
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ResendVerification from "./ResendVerification";
import type { StoreApi } from "../../store";
import { StoreContext } from "../../storeContext";

// Reached from the link in the verification email: /verify-email/<key>
export default function PageVerifyEmail() {
  const store = useContext<StoreApi>(StoreContext);
  const { key = "" } = useParams();
  const [state, setState] = useState<"working" | "done" | "failed">("working");
  const started = useRef(false);

  useEffect(() => {
    // Once only, even under StrictMode's double effects.
    if (started.current) return;
    started.current = true;
    store.client.verifyEmail(key).then(
      () => setState("done"),
      () => setState("failed")
    );
  }, [store, key]);

  if (state === "working") {
    return (
      <Card>
        <Result icon={<Spin size="large" />} title="Verifying your email…" />
      </Card>
    );
  }

  if (state === "done") {
    return (
      <Card>
        <Result
          status="success"
          title="Email verified"
          subTitle="Thanks! Your account is ready."
          extra={
            <Link to="/login">
              <Button type="primary">Log in</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <Card>
      <Result
        status="warning"
        title="This link has expired or is invalid"
        subTitle={
          <>
            If you&apos;ve already verified, you can just <Link to="/login">log in</Link>.
            Otherwise, send a new link:
            <ResendVerification />
          </>
        }
      />
    </Card>
  );
}
