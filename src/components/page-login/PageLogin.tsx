import { Button, Card, Input } from "antd";
import { useContext, useEffect, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import Store from "../../store";
import { StoreContext } from "../../storeContext";

export default function PageLogin() {
  const store = useContext<Store>(StoreContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (store.isAuthenticated) {
      navigate("/");
    }
  }, [store.isAuthenticated, navigate]);

  const onSave = async (model: { username: string; password: string }) => {
    await store.login(model.username, model.password);
    navigate("/");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ username, password });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <Card title="Log in">
        <form onSubmit={handleSubmit}>
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
            Submit
          </Button>
        </form>
      </Card>
    </div>
  );
}
