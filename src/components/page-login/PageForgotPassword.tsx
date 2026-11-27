import { Button, Card, Input, Result } from "antd";
import { useContext, useState, type SubmitEvent } from "react";
import { Link } from "react-router-dom";

import ErrorList from "./ErrorList";
import { apiErrorMessages } from "../../apiErrors";
import type { StoreApi } from "../../store";
import { StoreContext } from "../../storeContext";

export default function PageForgotPassword() {
  const store = useContext<StoreApi>(StoreContext);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    try {
      await store.client.requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setErrors(apiErrorMessages(err, "Couldn't send the reset email."));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Card>
        <Result
          status="success"
          title="Check your email"
          subTitle={`If an account uses ${email}, we've sent it a link to choose a new password.`}
          extra={<Link to="/login">Back to log in</Link>}
        />
      </Card>
    );
  }

  return (
    <Card title="Reset your password">
      <form onSubmit={handleSubmit}>
        <p>
          Enter the email address on your account and we&apos;ll send you a link to reset your
          password.
        </p>
        <ErrorList errors={errors} />
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="forgot-email" style={{ display: "block", marginBottom: 4 }}>
            Email
          </label>
          <Input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <Button type="primary" htmlType="submit" loading={loading} disabled={!email}>
          Send reset link
        </Button>
        <div style={{ marginTop: 12 }}>
          <small>
            <Link to="/login">Back to log in</Link>
          </small>
        </div>
      </form>
    </Card>
  );
}
