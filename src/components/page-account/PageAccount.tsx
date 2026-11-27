import { Alert, Button, Card, Descriptions, Input, Modal, Space, Spin, Typography } from "antd";
import { useContext, useEffect, useState, type SubmitEvent } from "react";

import { apiErrorMessages } from "../../apiErrors";
import type { AccountDetails } from "../../client";
import type { StoreApi } from "../../store";
import { StoreContext } from "../../storeContext";
import ErrorList from "../page-login/ErrorList";

const fieldStyle = { marginBottom: 12 } as const;
const labelStyle = { display: "block", marginBottom: 4 } as const;

function ChangePassword() {
  const store = useContext<StoreApi>(StoreContext);
  const [oldPassword, setOldPassword] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDone(false);
    if (password1 !== password2) {
      setErrors(["The new passwords don't match."]);
      return;
    }
    setLoading(true);
    setErrors([]);
    try {
      await store.client.changePassword({
        old_password: oldPassword,
        new_password1: password1,
        new_password2: password2,
      });
      setOldPassword("");
      setPassword1("");
      setPassword2("");
      setDone(true);
    } catch (err) {
      setErrors(apiErrorMessages(err, "Couldn't change your password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Change password" style={{ marginBottom: 16 }}>
      <form onSubmit={handleSubmit} style={{ maxWidth: 360 }}>
        <ErrorList errors={errors} />
        {done && (
          <Alert type="success" showIcon style={{ marginBottom: 12 }} title="Password changed." />
        )}
        <div style={fieldStyle}>
          <label htmlFor="old-password" style={labelStyle}>
            Current password
          </label>
          <Input
            id="old-password"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <div style={fieldStyle}>
          <label htmlFor="new-password1" style={labelStyle}>
            New password
          </label>
          <Input
            id="new-password1"
            type="password"
            value={password1}
            onChange={(e) => setPassword1(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div style={fieldStyle}>
          <label htmlFor="new-password2" style={labelStyle}>
            Confirm new password
          </label>
          <Input
            id="new-password2"
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <Button
          htmlType="submit"
          loading={loading}
          disabled={!oldPassword || !password1 || !password2}
        >
          Change password
        </Button>
      </form>
    </Card>
  );
}

function ExportData() {
  const store = useContext<StoreApi>(StoreContext);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const download = async () => {
    setLoading(true);
    setErrors([]);
    try {
      const blob = await store.client.exportAccount();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `weeklypulls-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setErrors(apiErrorMessages(err, "Couldn't export your data."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Download your data" style={{ marginBottom: 16 }}>
      <ErrorList errors={errors} />
      <p>
        A JSON file with your account details, pull lists, the series you pull, and which issues
        you&apos;ve marked read.
      </p>
      <Button onClick={download} loading={loading}>
        Download my data
      </Button>
    </Card>
  );
}

function DeleteAccount() {
  const store = useContext<StoreApi>(StoreContext);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const close = () => {
    setOpen(false);
    setPassword("");
    setErrors([]);
  };

  const confirm = async () => {
    setLoading(true);
    setErrors([]);
    try {
      await store.deleteAccount(password);
    } catch (err) {
      setErrors(apiErrorMessages(err, "Couldn't delete your account."));
      setLoading(false);
    }
  };

  return (
    <Card title="Delete account">
      <p>
        Permanently deletes your account, your pull lists, and your reading history. This can&apos;t
        be undone, so download your data first if you want a copy.
      </p>
      <Button danger onClick={() => setOpen(true)}>
        Delete my account…
      </Button>
      <Modal
        open={open}
        title="Delete your account?"
        okText="Delete permanently"
        okButtonProps={{ danger: true, disabled: !password, loading }}
        onOk={confirm}
        onCancel={close}
        destroyOnHidden
      >
        <p>Everything will be deleted right away. Enter your password to confirm.</p>
        <ErrorList errors={errors} />
        <label htmlFor="delete-password" style={labelStyle}>
          Password
        </label>
        <Input
          id="delete-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          onPressEnter={() => password && void confirm()}
        />
      </Modal>
    </Card>
  );
}

export default function PageAccount() {
  const store = useContext<StoreApi>(StoreContext);
  const [account, setAccount] = useState<AccountDetails | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    store.client
      .getAccount()
      .then(setAccount, (err: unknown) =>
        setErrors(apiErrorMessages(err, "Couldn't load your account."))
      );
  }, [store]);

  return (
    <div style={{ maxWidth: 720 }}>
      <Typography.Title level={2}>Account</Typography.Title>
      <Card title="Your details" style={{ marginBottom: 16 }}>
        <ErrorList errors={errors} />
        {account ? (
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Username">{account.username}</Descriptions.Item>
            <Descriptions.Item label="Email">{account.email || "None"}</Descriptions.Item>
            <Descriptions.Item label="Member since">
              {new Date(account.date_joined).toLocaleDateString()}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          !errors.length && <Spin />
        )}
        <Space style={{ marginTop: 8 }}>
          <Typography.Text type="secondary">
            Need to change your email address? Contact{" "}
            <a href="mailto:support@weeklypulls.com">support@weeklypulls.com</a>.
          </Typography.Text>
        </Space>
      </Card>
      <ChangePassword />
      <ExportData />
      <DeleteAccount />
    </div>
  );
}
