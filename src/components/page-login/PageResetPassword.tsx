import { Button, Card, Input, Result } from "antd";
import { useContext, useState, type SubmitEvent } from "react";
import { useParams } from "react-router-dom";

import ErrorList from "./ErrorList";
import { apiErrorMessages } from "../../apiErrors";
import type { StoreApi } from "../../store";
import { StoreContext } from "../../storeContext";
import ButtonLink from "../common/ButtonLink";

// Reached from the link in the password-reset email:
// /reset-password/<uid>/<token>
export default function PageResetPassword() {
  const store = useContext<StoreApi>(StoreContext);
  const { uid = "", token = "" } = useParams();
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password1 !== password2) {
      setErrors(["The passwords don't match."]);
      return;
    }
    setLoading(true);
    setErrors([]);
    try {
      await store.client.confirmPasswordReset({
        uid,
        token,
        new_password1: password1,
        new_password2: password2,
      });
      setDone(true);
    } catch (err) {
      const data: unknown = (err as { response?: { data?: unknown } }).response?.data;
      if (data && typeof data === "object" && ("uid" in data || "token" in data)) {
        setLinkInvalid(true);
      } else {
        setErrors(apiErrorMessages(err, "Couldn't reset your password."));
      }
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <Card>
        <Result
          status="success"
          title="Password changed"
          subTitle="You can now log in with your new password."
          extra={
            <ButtonLink to="/login" type="primary">
              Log in
            </ButtonLink>
          }
        />
      </Card>
    );
  }

  if (linkInvalid) {
    return (
      <Card>
        <Result
          status="warning"
          title="This link has expired or was already used"
          subTitle="Reset links only work once. Request a new one and use the latest email."
          extra={
            <ButtonLink to="/forgot-password" type="primary">
              Send a new link
            </ButtonLink>
          }
        />
      </Card>
    );
  }

  return (
    <Card title="Choose a new password">
      <form onSubmit={handleSubmit}>
        <ErrorList errors={errors} />
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="reset-password1" style={{ display: "block", marginBottom: 4 }}>
            New password
          </label>
          <Input
            id="reset-password1"
            type="password"
            value={password1}
            onChange={(e) => setPassword1(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="reset-password2" style={{ display: "block", marginBottom: 4 }}>
            Confirm new password
          </label>
          <Input
            id="reset-password2"
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          disabled={!password1 || !password2}
        >
          Change password
        </Button>
      </form>
    </Card>
  );
}
