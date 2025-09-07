import { Button, Card, Input, message } from "antd";
import { useContext, useEffect, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    if (store.isAuthenticated) {
      navigate("/");
    }
  }, [store.isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password1 !== password2) {
      message.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await store.register({ username, email, password1, password2 });
      // store.register auto-logs in; redirect to app
      navigate("/");
    } catch (err) {
      const anyErr = err as unknown as { response?: { data?: unknown } };
      const detail = anyErr?.response?.data || (err as Error).message || "Registration failed";
      message.error(typeof detail === "string" ? detail : JSON.stringify(detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form">
      <Card title="Create account">
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="reg-username" style={{ display: "block", marginBottom: 4 }}>
              Username
            </label>
            <Input
              id="reg-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
        </form>
      </Card>
    </div>
  );
}
