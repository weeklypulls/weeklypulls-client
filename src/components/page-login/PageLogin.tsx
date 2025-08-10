import { Button, Card, Input } from "antd";
import autoBindMethods from "class-autobind-decorator";
import { inject, observer } from "mobx-react";
import React, { Component } from "react";
import { RouteComponentProps } from "react-router";

import Store from "../../store";

interface IProps extends RouteComponentProps {
  store: Store;
}

@inject("store")
@autoBindMethods
@observer
class PageLogin extends Component<
  IProps,
  { username: string; password: string; loading: boolean }
> {
  public state = { username: "", password: "", loading: false };

  private async onSave(model: { username: string; password: string }) {
    await this.props.store.login(model.username, model.password);
    this.props.history.push("/");
  }

  private async handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { username, password } = this.state;
    this.setState({ loading: true });
    try {
      await this.onSave({ username, password });
    } finally {
      this.setState({ loading: false });
    }
  }

  public render() {
    if (this.props.store.isAuthenticated) {
      this.props.history.push("/");
    }

    const { username, password, loading } = this.state;

    return (
      <div className="login-form">
        <Card title="Log in">
          <form onSubmit={this.handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="login-username" style={{ display: "block", marginBottom: 4 }}>
                Username
              </label>
              <Input
                id="login-username"
                value={username}
                onChange={(e) => this.setState({ username: e.target.value })}
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
                onChange={(e) => this.setState({ password: e.target.value })}
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
}

export default PageLogin;
