import { Button, Card, Input, Result } from "antd";
import { useContext, useEffect, useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import ErrorList from "./ErrorList";
import { apiErrorMessages } from "../../apiErrors";
import type { StoreApi } from "../../store";
import { StoreContext } from "../../storeContext";

export default function PageRegister() {
  const store = useContext<StoreApi>(StoreContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (store.isAuthenticated) {
      navigate("/");
    }
  }, [store.isAuthenticated, navigate]);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password1 !== password2) {
      setErrors(["The passwords don't match."]);
      return;
    }
    setLoading(true);
    setErrors([]);
    try {
      await store.register({ username, email, password1, password2 });
      setSent(true);
    } catch (err) {
      setErrors(apiErrorMessages(err, "Couldn't create your account."));
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
          subTitle={`We sent a link to ${email}. Open it to verify your address, then log in.`}
          extra={<Link to="/login">Go to log in</Link>}
        />
      </Card>
    );
  }

  return (
    <div className="register-form">
      <Card title="Create account">
        <form onSubmit={handleSubmit}>
          <ErrorList errors={errors} />
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="reg-username" style={{ display: "block", marginBottom: 4 }}>
              Username
            </label>
            <Input
              id="reg-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="reg-email" style={{ display: "block", marginBottom: 4 }}>
              Email
            </label>
            <Input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="reg-password1" style={{ display: "block", marginBottom: 4 }}>
              Password
            </label>
            <Input
              id="reg-password1"
              type="password"
              value={password1}
              onChange={(e) => setPassword1(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="reg-password2" style={{ display: "block", marginBottom: 4 }}>
              Confirm password
            </label>
            <Input
              id="reg-password2"
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
            disabled={!username || !email || !password1 || !password2}
          >
            Create account
          </Button>
          <div style={{ marginTop: 12 }}>
            <small>
              Already have an account? <Link to="/login">Log in</Link>
            </small>
          </div>
        </form>
      </Card>
    </div>
  );
}
