import { Alert, Button, Card, Input } from "antd";
import { useContext, useEffect, useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import ErrorList from "./ErrorList";
import ResendVerification from "./ResendVerification";
import { apiErrorMessages, isUnverifiedEmailError } from "../../apiErrors";
import type { StoreApi } from "../../store";
import { StoreContext } from "../../storeContext";

export default function PageLogin() {
  const store = useContext<StoreApi>(StoreContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [unverified, setUnverified] = useState(false);

  useEffect(() => {
    if (store.isAuthenticated) {
      navigate("/");
    }
  }, [store.isAuthenticated, navigate]);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    setUnverified(false);
    try {
      await store.login(username, password);
      navigate("/");
    } catch (err) {
      if (isUnverifiedEmailError(err)) {
        setUnverified(true);
      } else {
        setErrors(apiErrorMessages(err, "Couldn't log in."));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <Card title="Log in">
        <form onSubmit={handleSubmit}>
          <ErrorList errors={errors} />
          {unverified && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 12 }}
              title="Please verify your email first"
              description={
                <>
                  We sent a link to the address you signed up with. Didn&apos;t get it?
                  <ResendVerification />
                </>
              }
            />
          )}
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="login-username" style={{ display: "block", marginBottom: 4 }}>
              Username
            </label>
            <Input
              id="login-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="login-password" style={{ display: "block", marginBottom: 4 }}>
              Password
            </label>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={!username || !password}
          >
            Log in
          </Button>
          <div style={{ marginTop: 12 }}>
            <small>
              <Link to="/forgot-password">Forgot your password?</Link>
              <br />
              New here? <Link to="/register">Create an account</Link>
            </small>
          </div>
        </form>
      </Card>
    </div>
  );
}
